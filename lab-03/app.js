const path = require('path')
const fs = require('fs')
const express = require('express')
const sqlite3 = require('sqlite3')
const { open } = require('sqlite')

const app = express()
const port = Number(process.env.PORT) || 3000
const dbPath = path.join(__dirname, 'books.db')

let db

app.use(express.json())

class ValidationError extends Error {
  constructor(message) {
    super(message)
    this.statusCode = 400
  }
}

function getQueryString(query, name, defaultValue) {
  const value = query[name]

  if (value === undefined) {
    return defaultValue
  }

  if (typeof value !== 'string') {
    throw new ValidationError(`Query parameter "${name}" must be provided once as a single value.`)
  }

  return value
}

function readNonNegativeNumber(value, fieldName) {
  if (typeof value !== 'number' && typeof value !== 'string') {
    throw new ValidationError(`"${fieldName}" must be a non-negative number.`)
  }

  const text = String(value).trim()
  if (!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(text)) {
    throw new ValidationError(`"${fieldName}" must be a non-negative number.`)
  }

  const number = Number(text)
  if (!Number.isFinite(number)) {
    throw new ValidationError(`"${fieldName}" must be a non-negative number.`)
  }

  return number
}

function readBookId(value) {
  if (!/^[1-9]\d*$/.test(value)) {
    throw new ValidationError('bookId must be a positive whole number.')
  }

  const bookId = Number(value)
  if (!Number.isSafeInteger(bookId)) {
    throw new ValidationError('bookId is too large.')
  }

  return bookId
}

function readBookInput(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new ValidationError('Request body must be a JSON object.')
  }

  const title = typeof body.title === 'string' ? body.title.trim() : ''
  if (!title) {
    throw new ValidationError('title is required and must be a non-empty string.')
  }

  const author = typeof body.author === 'string' ? body.author.trim() : ''
  if (!author) {
    throw new ValidationError('author is required and must be a non-empty string.')
  }

  if (body.price === undefined || body.price === null || body.price === '') {
    throw new ValidationError('price is required.')
  }
  const price = readNonNegativeNumber(body.price, 'price')

  let pages = null
  if (body.pages !== undefined && body.pages !== null && body.pages !== '') {
    if (!/^(?:0|[1-9]\d*)$/.test(String(body.pages))) {
      throw new ValidationError('pages must be a non-negative whole number when provided.')
    }
    pages = Number(body.pages)
    if (!Number.isSafeInteger(pages)) {
      throw new ValidationError('pages is too large.')
    }
  }

  return { title, author, price, pages }
}

function readListOptions(query) {
  const search_q = getQueryString(query, 'search_q', '').trim()
  const requestedOrderBy = getQueryString(query, 'order_by', 'title').toLowerCase()
  const order = getQueryString(query, 'order', 'ASC').toUpperCase()
  const rawLimit = getQueryString(query, 'limit', '100')
  const rawOffset = getQueryString(query, 'offset', '0')

  const allowedOrderBy = ['title', 'author', 'price']
  if (!allowedOrderBy.includes(requestedOrderBy)) {
    throw new ValidationError('order_by must be title, author, or price.')
  }
  if (order !== 'ASC' && order !== 'DESC') {
    throw new ValidationError('order must be ASC or DESC.')
  }

  if (!/^\d+$/.test(rawLimit)) {
    throw new ValidationError('limit must be a whole number from 1 to 1000.')
  }
  const limit = Number(rawLimit)
  if (!Number.isSafeInteger(limit) || limit < 1 || limit > 1000) {
    throw new ValidationError('limit must be a whole number from 1 to 1000.')
  }

  if (!/^\d+$/.test(rawOffset)) {
    throw new ValidationError('offset must be a non-negative whole number.')
  }
  const offset = Number(rawOffset)
  if (!Number.isSafeInteger(offset)) {
    throw new ValidationError('offset is too large.')
  }

  const minPriceText = getQueryString(query, 'min_price', null)
  const maxPriceText = getQueryString(query, 'max_price', null)
  const min_price = minPriceText === null ? null : readNonNegativeNumber(minPriceText, 'min_price')
  const max_price = maxPriceText === null ? null : readNonNegativeNumber(maxPriceText, 'max_price')

  if (min_price !== null && max_price !== null && min_price > max_price) {
    throw new ValidationError('min_price cannot be greater than max_price.')
  }

  return { search_q, order_by: requestedOrderBy, order, limit, offset, min_price, max_price }
}

app.get('/books', async (request, response, next) => {
  try {
    const options = readListOptions(request.query)
    const conditions = []
    const values = []

    if (options.search_q) {
      conditions.push('title LIKE ?')
      values.push(`%${options.search_q}%`)
    }
    if (options.min_price !== null) {
      conditions.push('price >= ?')
      values.push(options.min_price)
    }
    if (options.max_price !== null) {
      conditions.push('price <= ?')
      values.push(options.max_price)
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
    const sql = `SELECT * FROM book ${whereClause} ORDER BY ${options.order_by} ${options.order} LIMIT ? OFFSET ?;`
    const books = await db.all(sql, [...values, options.limit, options.offset])

    response.status(200).json({
      success: true,
      data: books,
      options,
    })
  } catch (error) {
    next(error)
  }
})

app.get('/books/:bookId', async (request, response, next) => {
  try {
    const bookId = readBookId(request.params.bookId)
    const book = await db.get('SELECT * FROM book WHERE id = ?;', [bookId])

    if (!book) {
      return response.status(404).json({ success: false, error: 'Book not found.' })
    }

    response.status(200).json({ success: true, data: book })
  } catch (error) {
    next(error)
  }
})

app.post('/books', async (request, response, next) => {
  try {
    const book = readBookInput(request.body)
    const result = await db.run(
      'INSERT INTO book (title, author, price, pages) VALUES (?, ?, ?, ?);',
      [book.title, book.author, book.price, book.pages],
    )
    const createdBook = await db.get('SELECT * FROM book WHERE id = ?;', [result.lastID])

    response.status(201).json({
      success: true,
      message: 'Book added successfully.',
      data: createdBook,
    })
  } catch (error) {
    next(error)
  }
})

app.put('/books/:bookId', async (request, response, next) => {
  try {
    const bookId = readBookId(request.params.bookId)
    const book = readBookInput(request.body)
    const result = await db.run(
      'UPDATE book SET title = ?, author = ?, price = ?, pages = ? WHERE id = ?;',
      [book.title, book.author, book.price, book.pages, bookId],
    )

    if (result.changes === 0) {
      return response.status(404).json({ success: false, error: 'Book not found.' })
    }

    const updatedBook = await db.get('SELECT * FROM book WHERE id = ?;', [bookId])
    response.status(200).json({
      success: true,
      message: 'Book updated successfully.',
      data: updatedBook,
    })
  } catch (error) {
    next(error)
  }
})

app.delete('/books/:bookId', async (request, response, next) => {
  try {
    const bookId = readBookId(request.params.bookId)
    const result = await db.run('DELETE FROM book WHERE id = ?;', [bookId])

    if (result.changes === 0) {
      return response.status(404).json({ success: false, error: 'Book not found.' })
    }

    response.status(200).json({
      success: true,
      message: 'Book deleted successfully.',
      data: { id: bookId },
    })
  } catch (error) {
    next(error)
  }
})

app.use((request, response) => {
  response.status(404).json({ success: false, error: 'Endpoint not found.' })
})

app.use((error, request, response, next) => {
  if (response.headersSent) {
    return next(error)
  }

  if (error.statusCode === 400 || error.type === 'entity.parse.failed') {
    const message = error.type === 'entity.parse.failed' ? 'Request body contains invalid JSON.' : error.message
    return response.status(400).json({ success: false, error: message })
  }

  console.error('Unexpected server error:', error.message)
  response.status(500).json({ success: false, error: 'An unexpected server error occurred.' })
})

async function startServer() {
  try {
    if (!fs.existsSync(dbPath)) {
      throw new Error(`Database file was not found at ${dbPath}. Copy books.db into the lab-03 folder.`)
    }

    db = await open({ filename: dbPath, driver: sqlite3.Database })
    await db.exec(`
      CREATE TABLE IF NOT EXISTS book (
        id INTEGER PRIMARY KEY,
        title TEXT,
        author TEXT,
        price INTEGER,
        pages INTEGER
      );
    `)

    const server = app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`)
      console.log(`Using SQLite database: ${dbPath}`)
    })

    server.on('error', async (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use. Stop the other server or run with PORT=3001.`)
      } else {
        console.error(`Server error: ${error.message}`)
      }

      if (db) {
        await db.close().catch(() => {})
      }
      process.exitCode = 1
    })
  } catch (error) {
    console.error(`Database startup error: ${error.message}`)
    if (db) {
      await db.close().catch(() => {})
    }
    process.exitCode = 1
  }
}

startServer()
