
let books = [
  {
    id: 1,
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    year: 1925,
    genre: "fiction",
    read: true,
    rating: 5
  },
  {
    id: 2,
    title: "A Brief History of Time",
    author: "Stephen Hawking",
    year: 1988,
    genre: "science",
    read: true,
    rating: 5
  },
  {
    id: 3,
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    year: 1937,
    genre: "fantasy",
    read: false,
    rating: null
  },
  {
    id: 4,
    title: "Sapiens",
    author: "Yuval Noah Harari",
    year: 2011,
    genre: "non-fiction",
    read: true,
    rating: 4
  },
  {
    id: 5,
    title: "The Diary of a Young Girl",
    author: "Anne Frank",
    year: 1947,
    genre: "history",
    read: false,
    rating: null
  },
  {
    id: 6,
    title: "The Alchemist",
    author: "Paulo Coelho",
    year: 1988,
    genre: "fiction",
    read: false,
    rating: null
  }
];

let nextId = 7;

export async function getAllBooks() {
  return books.map(book => ({ ...book }));
}

export async function getBookById(id) {
  const book = books.find(book => book.id === id);

  return book ? { ...book } : null;
}

export async function addBook(bookData) {
  const newBook = {
    ...bookData,
    id: nextId++
  };

  books = [...books, newBook];

  return { ...newBook };
}

export async function updateBook(id, bookData) {
  const existingBook = books.find(book => book.id === id);

  if (!existingBook) {
    return null;
  }

  const updatedBook = {
    ...existingBook,
    ...bookData,
    id
  };

  books = books.map(book =>
    book.id === id ? updatedBook : book
  );

  return { ...updatedBook };
}

export async function deleteBook(id) {
  const existingBook = books.find(book => book.id === id);

  if (!existingBook) {
    return null;
  }

  books = books.filter(book => book.id !== id);

  return { ...existingBook };
}
