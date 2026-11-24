import express from "express";
import cors from "cors";
import {
  getAllBooks,
  getBookById,
  addBook,
  updateBook,
  deleteBook
} from "./booksStore.js";
import { validateBookData } from "./validate.js";
const app = express();


const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: "http://localhost:5173"
}));

app.use(express.json());

app.get("/", async (req, res) => {
  res.status(200).json({
    message: "Reading List API is running"
  });
});

app.get("/api/books", async (req, res) => {
  const allowedParams = [
    "genre", "read", "q", "sort", "order", "limit", "page"
  ];

  // Reject unknown query parameters
  const unknownParams = Object.keys(req.query).filter(
    (key) => !allowedParams.includes(key)
  );

  if (unknownParams.length > 0) {
    return res.status(400).json({
      error: `Unknown query parameter: ${unknownParams[0]}`
    });
  }

  // Reject duplicate query parameters
  for (const [key, value] of Object.entries(req.query)) {
    if (Array.isArray(value)) {
      return res.status(400).json({
        error: `Duplicate query parameter: ${key}`
      });
    }
  }

  const {
    genre,
    read,
    q,
    sort,
    order = "asc",
    limit = "50",
    page = "1"
  } = req.query;

  const allowedGenres = [
    "fiction", "non-fiction", "science",
    "history", "fantasy", "other"
  ];

  if (genre && !allowedGenres.includes(genre)) {
    return res.status(400).json({
      error: "Invalid genre"
    });
  }

  if (read !== undefined && !["true", "false"].includes(read)) {
    return res.status(400).json({
      error: "Read must be true or false"
    });
  }

  if (sort && !["title", "author", "year", "rating"].includes(sort)) {
    return res.status(400).json({
      error: "Invalid sort field"
    });
  }

  if (!["asc", "desc"].includes(order)) {
    return res.status(400).json({
      error: "Order must be asc or desc"
    });
  }

  const pageNumber = Number(page);
  const limitNumber = Number(limit);

  if (!Number.isInteger(pageNumber) || pageNumber < 1) {
    return res.status(400).json({
      error: "Page must be a positive integer"
    });
  }

  if (
    !Number.isInteger(limitNumber) ||
    limitNumber < 1 ||
    limitNumber > 50
  ) {
    return res.status(400).json({
      error: "Limit must be between 1 and 50"
    });
  }

  const books = await getAllBooks();

  // Filter by genre
  let result = [...books];

  if (genre) {
    result = result.filter((book) => book.genre === genre);
  }

  // Filter by read status
  if (read !== undefined) {
    result = result.filter(
      (book) => book.read === (read === "true")
    );
  }

  // Search title and author
  if (q) {
    const search = q.trim().toLowerCase();

    result = result.filter(
      (book) =>
        book.title.toLowerCase().includes(search) ||
        book.author.toLowerCase().includes(search)
    );
  }

  // Sort books
  if (sort) {
    result.sort((a, b) => {
      const aValue = a[sort];
      const bValue = b[sort];

      // Keep books without ratings at the end
      if (sort === "rating") {
        if (aValue === null) return 1;
        if (bValue === null) return -1;
      }

      let comparison;

      if (typeof aValue === "string") {
        comparison = aValue.localeCompare(bValue);
      } else {
        comparison = aValue - bValue;
      }

      return order === "asc" ? comparison : -comparison;
    });
  }

  // Pagination
  const totalBooks = result.length;
  const totalPages = Math.ceil(totalBooks / limitNumber);
  const startIndex = (pageNumber - 1) * limitNumber;

  const paginatedBooks = result.slice(
    startIndex,
    startIndex + limitNumber
  );

  res.status(200).json({
    data: paginatedBooks,
    pagination: {
      totalBooks,
      totalPages,
      currentPage: pageNumber,
      limit: limitNumber
    }
  });
});

app.get("/api/books/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      error: "Invalid book ID"
    });
  }

  const book = await getBookById(id);

  if (!book) {
    return res.status(404).json({
      error: "Book not found"
    });
  }

  res.status(200).json(book);
});

app.post("/api/books", async (req, res) => {
  const validation = validateBookData(req.body);

  if (!validation.valid) {
    return res.status(400).json({
      error: "Validation failed",
      details: validation.errors
    });
  }

  const newBookData = {
    read: false,
    rating: null,
    ...validation.data
  };

  const finalValidation = validateBookData(newBookData);

  if (!finalValidation.valid) {
    return res.status(400).json({
      error: "Validation failed",
      details: finalValidation.errors
    });
  }

  const books = await getAllBooks();

  const duplicate = books.some(
    (book) =>
      book.title.toLowerCase() === newBookData.title.toLowerCase() &&
      book.author.toLowerCase() === newBookData.author.toLowerCase()
  );

  if (duplicate) {
    return res.status(409).json({
      error: "This book already exists"
    });
  }

  const newBook = await addBook(newBookData);

  res.status(201).json(newBook);
});

app.put("/api/books/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      error: "Invalid book ID"
    });
  }

  const existingBook = await getBookById(id);

  if (!existingBook) {
    return res.status(404).json({
      error: "Book not found"
    });
  }

  const validation = validateBookData(req.body);

  if (!validation.valid) {
    return res.status(400).json({
      error: "Validation failed",
      details: validation.errors
    });
  }

  const updatedData = {
    read: false,
    rating: null,
    ...validation.data
  };

  const finalValidation = validateBookData(updatedData);

  if (!finalValidation.valid) {
    return res.status(400).json({
      error: "Validation failed",
      details: finalValidation.errors
    });
  }

  const books = await getAllBooks();

  const duplicate = books.some(
    (book) =>
      book.id !== id &&
      book.title.toLowerCase() === updatedData.title.toLowerCase() &&
      book.author.toLowerCase() === updatedData.author.toLowerCase()
  );

  if (duplicate) {
    return res.status(409).json({
      error: "This book already exists"
    });
  }

  const updatedBook = await updateBook(id, updatedData);

  res.status(200).json(updatedBook);
});

app.patch("/api/books/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      error: "Invalid book ID"
    });
  }

  const existingBook = await getBookById(id);

  if (!existingBook) {
    return res.status(404).json({
      error: "Book not found"
    });
  }

  const validation = validateBookData(req.body, true);

  if (!validation.valid) {
    return res.status(400).json({
      error: "Validation failed",
      details: validation.errors
    });
  }

  const { id: bookId, ...currentData } = existingBook;
  const updatedData = {
    ...currentData,
    ...validation.data
  };

  const finalValidation = validateBookData(updatedData);

  if (!finalValidation.valid) {
    return res.status(400).json({
      error: "Validation failed",
      details: finalValidation.errors
    });
  }

  const books = await getAllBooks();

  const duplicate = books.some(
    (book) =>
      book.id !== bookId &&
      book.title.toLowerCase() === updatedData.title.toLowerCase() &&
      book.author.toLowerCase() === updatedData.author.toLowerCase()
  );

  if (duplicate) {
    return res.status(409).json({
      error: "This book already exists"
    });
  }

  const updatedBook = await updateBook(id, updatedData);

  res.status(200).json(updatedBook);
});
app.delete("/api/books/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      error: "Invalid book ID"
    });
  }

  const deletedBook = await deleteBook(id);

  if (!deletedBook) {
    return res.status(404).json({
      error: "Book not found"
    });
  }

  res.status(204).send();
});

app.get("/api/stats", async (req, res) => {
  const books = await getAllBooks();

  const totalBooks = books.length;

  const readBooks = books.filter((book) => book.read).length;

  const unreadBooks = totalBooks - readBooks;

  const ratedBooks = books.filter(
    (book) => book.rating !== null
  );

  const averageRating =
    ratedBooks.length > 0
      ? Number(
          (
            ratedBooks.reduce((sum, book) => sum + book.rating, 0) /
            ratedBooks.length
          ).toFixed(2)
        )
      : null;

  const booksByGenre = {};

  for (const book of books) {
    booksByGenre[book.genre] =
      (booksByGenre[book.genre] || 0) + 1;
  }

  res.status(200).json({
    totalBooks,
    readBooks,
    unreadBooks,
    ratedBooks: ratedBooks.length,
    averageRating,
    booksByGenre
  });
});
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
