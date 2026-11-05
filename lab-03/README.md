# Lab 3: REST API, Query Parameters, Validation, Debugging

## Student Details

- **Name:** NAMRATA
- **Registration Number:** 252U1R5111
- **Section:** Your Section
- **Course:** Backend Development Fundamentals
- **Year:** II
- **Term:** II
- **University:** Aurora University

## Project Description

This project demonstrates REST API development using Node.js, Express.js and SQLite.

The API supports CRUD operations, searching books, sorting, pagination, price filtering and input validation. It also handles errors using appropriate HTTP status codes.

## Technologies Used

- Node.js
- Express.js
- SQLite
- Postman
- JavaScript

## How to Run

### 1. Open the Project

Open the `lab-03` folder in VS Code.

### 2. Install Dependencies

Open the terminal and run:

```bash
npm install
```

### 3. Start the Server

```bash
npm start
```

### 4. Server URL

```text
http://localhost:3000/
```

No environment variables are required if the project uses the default local configuration.

## API Endpoints

| HTTP Method | Endpoint     | Description      |
| ----------- | ------------ | ---------------- |
| GET         | `/books`     | Get all books    |
| GET         | `/books/:id` | Get a book by ID |
| POST        | `/books`     | Add a new book   |
| PUT         | `/books/:id` | Update a book    |
| DELETE      | `/books/:id` | Delete a book    |

## Query Parameters

| Parameter   | Description               |
| ----------- | ------------------------- |
| `search_q`  | Search books by title     |
| `order_by`  | Sort using a column       |
| `order`     | ASC or DESC               |
| `limit`     | Maximum number of records |
| `offset`    | Number of records to skip |
| `min_price` | Minimum book price        |
| `max_price` | Maximum book price        |

### Example Requests

**Search:**

```text
GET /books?search_q=the
```

**Sorting:**

```text
GET /books?order_by=price&order=ASC
```

**Pagination:**

```text
GET /books?limit=5&offset=0
```

**Price Filtering:**

```text
GET /books?min_price=100&max_price=500
```

## HTTP Status Codes

| Status Code | Description                     |
| ----------- | ------------------------------- |
| 200         | OK – Request successful         |
| 201         | Created – New book added        |
| 400         | Bad Request – Invalid input     |
| 404         | Not Found – Book does not exist |
| 500         | Internal Server Error           |

## Screenshots

The Postman and VS Code screenshots for all 13 practical tests are included directly in the Lab 3 Word practical report.

## Problems Faced and Solutions

1. **EADDRINUSE Error:** Occurs when port 3000 is already in use. Solved by stopping the existing server process or using another available port.

2. **Import Error:** Occurs when the file path or module name is incorrect. Solved by checking the import path and file name.

3. **No Such Table Error:** Occurs when the database table name is incorrect. Solved by checking the SQLite database table name.

4. **Missing Await:** Occurs when asynchronous database operations are not awaited. Solved by using `await` with database operations.

5. **Invalid Input:** Occurs when required book details are missing or incorrect. Solved by adding input validation and returning a 400 status code.

## Conclusion

The Lab 3 practical successfully demonstrates REST API development using Express.js and SQLite. It implements CRUD operations, query parameters, searching, sorting, pagination, price filtering and input validation with appropriate HTTP status codes.
