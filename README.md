
A full-stack Reading List application built with **Express 5** and **React**. The application allows users to manage their books, track reading progress, search, filter, sort, and view reading statistics.

## Technologies Used

### Backend
- Node.js
- Express 5
- JavaScript ES Modules
- CORS
- In-memory data storage

### Frontend
- React
- Vite
- JavaScript
- CSS
- Fetch API

## Project Structure

```text
Assignment 9/
├── server/
│   ├── server.js
│   ├── booksStore.js
│   ├── validate.js
│   └── package.json
│
├── client/
│   ├── src/
│   │   ├── api/
│   │   │   └── books.js
│   │   ├── App.jsx
│   │   └── App.css
│   └── package.json
│
└── README.md
```

## Features

- View all books.
- Add new books.
- Edit existing books.
- Delete books.
- Mark books as read or unread.
- Add ratings to read books.
- Search books by title or author.
- Filter books by genre and reading status.
- Sort books by title, author, year, or rating.
- Paginate book results.
- View reading statistics.
- Handle API errors and loading states.

## Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/kzyad3337-web/Assignment-9.git
cd "Assignment 9"
```

### 2. Start the Backend

```bash
cd server
npm install
node server.js
```

The backend runs at:

`http://localhost:3000`

### 3. Configure the Frontend

Create a `.env` file inside the `client` folder:

```env
VITE_API_URL=http://localhost:3000/api
```

### 4. Start the Frontend

Open a second terminal:

```bash
cd client
npm install
npm run dev
```

Open the local URL displayed by Vite, usually:

`http://localhost:5173`

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/books` | Get all books |
| GET | `/api/books/:id` | Get one book |
| POST | `/api/books` | Add a book |
| PUT | `/api/books/:id` | Replace a book |
| PATCH | `/api/books/:id` | Partially update a book |
| DELETE | `/api/books/:id` | Delete a book |
| GET | `/api/stats` | Get reading statistics |

## Data Storage

Books are stored in memory on the server. No database or authentication is used. The initial seed data is restored whenever the server restarts.

## Notes

- The backend uses Express 5.
- The frontend communicates with the backend through a dedicated API module.
- CORS is configured to allow requests from the frontend origin.
- The application uses environment variables for configuration.
