# Lab 3: REST API, Query Parameters, Validation, and Debugging

## Student Details

- **Name:** NAMRATA
- **Registration Number:** 252U1R5111
- **Section:** AI/DE 2B S-011
- **Course:** Backend Development Fundamentals
- **Year:** II
- **Term:** II
- **University:** Aurora University

## Project Description

This project is a local REST API for managing books. It uses Express and an existing SQLite database to provide book CRUD operations, title search, sorting, pagination, price filtering, request validation, and JSON error responses.

The database file is `books.db` in this project folder. On startup, the app opens that database and creates the `book` table only if it does not already exist; it does not reset or reseed existing book records.

## Technologies Used

- JavaScript and Node.js
- Express 5
- SQLite (`sqlite` and `sqlite3`)
- Postman for API requests

## Installation

1. Install Node.js and npm if they are not already installed.
2. Open a terminal in the `lab-03` project folder.
3. Install the project dependencies:

   ```bash
   npm install
   ```

Keep the existing `books.db` file in the project folder. The app expects it at that location.

## Environment Variables

No environment variables are required for the default setup. `PORT` is optional and defaults to `3000`.

To use a different port in PowerShell:

```powershell
$env:PORT=3001; npm start
```

## Starting the Server

From the `lab-03` folder, run:

```bash
npm start
```

The API is available at `http://localhost:3000`. Endpoints are under `/books`.

## API Endpoints

| Method | Endpoint         | Description                                              | Success status |
| ------ | ---------------- | -------------------------------------------------------- | -------------- |
| GET    | `/books`         | Return books, optionally filtered, sorted, and paginated | 200            |
| GET    | `/books/:bookId` | Return one book by its positive integer ID               | 200            |
| POST   | `/books`         | Create a book                                            | 201            |
| PUT    | `/books/:bookId` | Replace a book's title, author, price, and pages         | 200            |
| DELETE | `/books/:bookId` | Delete a book                                            | 200            |

POST and PUT expect a JSON object with non-empty `title` and `author`, and a non-negative `price`. `pages` is optional and, when provided, must be a non-negative whole number.

## Query Parameters

The following parameters apply to `GET /books` and can be combined:

| Parameter   | Description                      | Allowed values / default                       |
| ----------- | -------------------------------- | ---------------------------------------------- |
| `search_q`  | Match part of a book title       | Optional text; default is no search            |
| `order_by`  | Column used to sort results      | `title`, `author`, or `price`; default `title` |
| `order`     | Sort direction                   | `ASC` or `DESC`; default `ASC`                 |
| `limit`     | Maximum number of returned books | Whole number from 1 to 1000; default `100`     |
| `offset`    | Number of matching books to skip | Non-negative whole number; default `0`         |
| `min_price` | Inclusive minimum price          | Optional non-negative number                   |
| `max_price` | Inclusive maximum price          | Optional non-negative number                   |

Example:

```text
GET /books?search_q=harry&order_by=price&order=ASC&limit=5&offset=0&min_price=100&max_price=500
```

## HTTP Status Codes

| Code | Meaning in this API                                   |
| ---- | ----------------------------------------------------- |
| 200  | Request succeeded (list/read/update/delete)           |
| 201  | Book created                                          |
| 400  | Invalid JSON, book input, book ID, or query parameter |
| 404  | Book or endpoint not found                            |
| 500  | Unexpected server error                               |

## Screenshots

### 1. Server Running

![Server Running](screenshots/01-server-running.png)

### 2. GET All Books

![GET All Books](screenshots/02-get-all-books.png)

### 3. GET Book by ID

![GET Book by ID](screenshots/03-get-book-by-id.png)

### 4. POST Create Book

![POST Create Book](screenshots/04-post-create-book.png)

### 5. PUT Update Book

![PUT Update Book](screenshots/05-put-update-book.png)

### 6. DELETE Book

![DELETE Book](screenshots/06-delete-book.png)

### 7. Search Books

![Search Books](screenshots/07-search-books.png)

### 8. Sort Books

![Sort Books](screenshots/08-sort-books.png)

### 9. Pagination

![Pagination](screenshots/09-pagination.png)

### 10. Price Filter

![Price Filter](screenshots/10-price-filter.png)

### 11. Validation Error (400)

![Validation Error (400)](screenshots/11-validation-400.png)

### 12. Not Found (404)

![Not Found (404)](screenshots/12-not-found-404.png)

### 13. Combined Query

![Combined Query](screenshots/13-combined-query.png)

## Problems Faced and Solutions

- **Port already in use:** The server reports when the default port is occupied. Stop the other process or set `PORT` to an available port before starting the server.
- **Database file not found:** Keep the provided `books.db` beside `app.js`; startup checks for the file and reports an error if it is missing.
- **Invalid book or query input:** The API validates required fields, IDs, sorting options, pagination values, and prices, and returns a 400 response with an error message for invalid input.
- **Book or route not found:** The API returns a 404 response when a requested book ID or endpoint does not exist.

## Conclusion

This practical demonstrates a working Express and SQLite books API with CRUD endpoints, query-based search and filtering, pagination, sorting, and input validation. The included screenshots document the local server and the 12 API request scenarios.
