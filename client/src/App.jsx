
import { useEffect, useState } from "react";
import "./App.css";
import {
  getBooks,
  getStats,
  createBook,
  updateBook,
  deleteBook,
  patchBook,
} from "./api/books";
function App() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [stats, setStats] = useState(null);

  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("");
  const [readFilter, setReadFilter] = useState("");

  const [sort, setSort] = useState("title");
  const [order, setOrder] = useState("asc");

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
const [showForm, setShowForm] = useState(false);
const [saving, setSaving] = useState(false);
const [editingId, setEditingId] = useState(null);
const [formData, setFormData] = useState({
  title: "",
  author: "",
  year: "",
  genre: "fiction",
  read: false,
  rating: "",
});
  useEffect(() => {
    const controller = new AbortController();

    async function loadBooks() {
      try {
        setLoading(true);
        setError("");

        const params = {
          sort,
          order,
          page,
          limit: 4,
        };

        if (search.trim()) {
          params.q = search.trim();
        }

        if (genre) {
          params.genre = genre;
        }

        if (readFilter) {
          params.read = readFilter;
        }

        const result = await getBooks(params, {
          signal: controller.signal,
        });

        const statsResult = await getStats({
          signal: controller.signal,
        });

        setBooks(result.data);
        setPagination(result.pagination);
        setStats(statsResult);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadBooks();
    return () => controller.abort();
}, [search, genre, readFilter, sort, order, page]);

async function handleDeleteBook(id) {
  const confirmed = window.confirm(
    "Are you sure you want to delete this book?"
  );

  if (!confirmed) return;

  try {
    setError("");

    await deleteBook(id);

    const params = {
      sort,
      order,
      page,
      limit: 4,
    };

    if (search.trim()) params.q = search.trim();
    if (genre) params.genre = genre;
    if (readFilter) params.read = readFilter;

    const result = await getBooks(params);
    const statsResult = await getStats();

    setBooks(result.data);
    setPagination(result.pagination);
    setStats(statsResult);
  } catch (err) {
    setError(err.message);
  }
}




async function handleToggleRead(book) {
  try {
    setError("");

    await patchBook(book.id, {
      read: !book.read,
      rating: book.read ? null : book.rating,
    });

    const params = {
      sort,
      order,
      page,
      limit: 4,
    };

    if (search.trim()) params.q = search.trim();
    if (genre) params.genre = genre;
    if (readFilter) params.read = readFilter;

    const result = await getBooks(params);
    const statsResult = await getStats();

    setBooks(result.data);
    setPagination(result.pagination);
    setStats(statsResult);
  } catch (err) {
    setError(err.message);
  }
}

async function handleAddBook(e) {
  e.preventDefault();

  try {
    setSaving(true);
    setError("");

    const newBook = {
      ...formData,
      year: Number(formData.year),
      rating:
        formData.read && formData.rating !== ""
          ? Number(formData.rating)
          : null,
    };

    await createBook(newBook);

    setFormData({
      title: "",
      author: "",
      year: "",
      genre: "fiction",
      read: false,
      rating: "",
    });

    setShowForm(false);
    setPage(1);

    // Refresh the books and statistics
    const result = await getBooks({
      sort,
      order,
      page: 1,
      limit: 4,
    });

    const statsResult = await getStats();

    setBooks(result.data);
    setPagination(result.pagination);
    setStats(statsResult);
  } catch (err) {
    setError(err.message);
  } finally {
    setSaving(false);
  }
}
function handleEditClick(book) {
  setEditingId(book.id);

  setFormData({
    title: book.title,
    author: book.author,
    year: String(book.year),
    genre: book.genre,
    read: book.read,
    rating: book.rating ?? "",
  });

  setShowForm(true);

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

async function handleUpdateBook(e) {
  e.preventDefault();
 try {
    setSaving(true);
    setError("");

    const updatedBook = {
      ...formData,
      year: Number(formData.year),
      rating:
        formData.read && formData.rating !== ""
          ? Number(formData.rating)
          : null,
    };

    await updateBook(editingId, updatedBook);

    setFormData({
      title: "",
      author: "",
      year: "",
      genre: "fiction",
      read: false,
      rating: "",
    });

    setEditingId(null);
    setShowForm(false);
    setPage(1);

    const result = await getBooks({
      sort,
      order,
      page: 1,
      limit: 4,
    });

    const statsResult = await getStats();

    setBooks(result.data);
    setPagination(result.pagination);
    setStats(statsResult);
  } catch (err) {
    setError(err.message);
  } finally {
    setSaving(false);
  }
}
  return (
    <div>
      <header>
        <h1>Reading List</h1>
        <p>Manage your personal book collection</p>
      </header>

      <main>
        <h2>My Library</h2>

<button
  type="button"
  onClick={() => setShowForm(!showForm)}
>
  {showForm ? "Cancel" : "+ Add New Book"}
</button>

{showForm && (
  <form
  onSubmit={editingId ? handleUpdateBook : handleAddBook}
  className="book-form"
>
<h3>{editingId ? "Edit Book" : "Add New Book"}</h3>
    <input
      type="text"
      placeholder="Book Title"
      value={formData.title}
      onChange={(e) =>
        setFormData({ ...formData, title: e.target.value })
      }
      minLength={1}
      maxLength={100}
      required
    />

    <input
      type="text"
      placeholder="Author"
      value={formData.author}
      onChange={(e) =>
        setFormData({ ...formData, author: e.target.value })
      }
      minLength={1}
      maxLength={100}
      required
    />

    <input
      type="number"
      placeholder="Publication Year"
      value={formData.year}
      onChange={(e) =>
        setFormData({ ...formData, year: e.target.value })
      }
      min="1000"
      max={new Date().getFullYear()}
      required
    />

    <select
      value={formData.genre}
      onChange={(e) =>
        setFormData({ ...formData, genre: e.target.value })
      }
    >
      <option value="fiction">Fiction</option>
      <option value="non-fiction">Non-fiction</option>
      <option value="science">Science</option>
      <option value="history">History</option>
      <option value="fantasy">Fantasy</option>
      <option value="other">Other</option>
    </select>

    <label>
      <input
        type="checkbox"
        checked={formData.read}
        onChange={(e) =>
          setFormData({
            ...formData,
            read: e.target.checked,
            rating: e.target.checked ? formData.rating : "",
          })
        }
      />
      I have read this book
    </label>

    {formData.read && (
      <select
        value={formData.rating}
        onChange={(e) =>
          setFormData({ ...formData, rating: e.target.value })
        }
      >
        <option value="">Choose Rating (Optional)</option>
        <option value="1">1 Star</option>
        <option value="2">2 Stars</option>
        <option value="3">3 Stars</option>
        <option value="4">4 Stars</option>
        <option value="5">5 Stars</option>
      </select>
    )}

   <button type="submit" disabled={saving}>
  {saving
    ? editingId
      ? "Saving..."
      : "Adding..."
    : editingId
      ? "Save Changes"
      : "Add Book"}
</button>
  </form>
)}

        {/* Search, filters and sorting */}
        <section className="filters">
          <input
            type="search"
            placeholder="Search by title or author..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />

          <select
            value={genre}
            onChange={(e) => {
              setGenre(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Genres</option>
            <option value="fiction">Fiction</option>
            <option value="non-fiction">Non-fiction</option>
            <option value="science">Science</option>
            <option value="history">History</option>
            <option value="fantasy">Fantasy</option>
            <option value="other">Other</option>
          </select>

          <select
            value={readFilter}
            onChange={(e) => {
              setReadFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Books</option>
            <option value="true">Read</option>
            <option value="false">Unread</option>
          </select>

          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
          >
            <option value="title">Sort by Title</option>
            <option value="author">Sort by Author</option>
            <option value="year">Sort by Year</option>
            <option value="rating">Sort by Rating</option>
          </select>

          <select
            value={order}
            onChange={(e) => {
              setOrder(e.target.value);
              setPage(1);
            }}
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </section>

        {/* Library statistics */}
        {stats && (
          <section className="stats-grid">
            <article className="stat-card">
              <h3>Total Books</h3>
              <p>{stats.totalBooks}</p>
            </article>

            <article className="stat-card">
              <h3>Read Books</h3>
              <p>{stats.readBooks}</p>
            </article>

            <article className="stat-card">
              <h3>Unread Books</h3>
              <p>{stats.unreadBooks}</p>
            </article>

            <article className="stat-card">
              <h3>Average Rating</h3>
              <p>{stats.averageRating ?? "N/A"}</p>
            </article>
          </section>
        )}

        {/* Loading and error states */}
        {loading && <p>Loading books...</p>}

        {error && <p role="alert">{error}</p>}

        {!loading && !error && books.length === 0 && (
          <p>No books found.</p>
        )}

        {/* Books list */}
        {!error && (
          <div className="books-grid">
            {books.map((book) => (
              <article className="book-card" key={book.id}>
  <h3>{book.title}</h3>

  <p>Author: {book.author}</p>
  <p>Year: {book.year}</p>
  <p>Genre: {book.genre}</p>
  <p>Status: {book.read ? "Read" : "Not Read"}</p>
  <button
  type="button"
  onClick={() => handleToggleRead(book)}
>
  {book.read ? "Mark as Unread" : "Mark as Read"}
</button>
  <p>Rating: {book.rating ?? "Not rated"}</p>
  {book.read && (
  <select
    value={book.rating ?? ""}
    onChange={async (e) => {
      try {
        setError("");

        await patchBook(book.id, {
          rating: e.target.value === ""
            ? null
            : Number(e.target.value),
        });

        const result = await getBooks({
          sort,
          order,
          page,
          limit: 4,
          ...(search.trim() ? { q: search.trim() } : {}),
          ...(genre ? { genre } : {}),
          ...(readFilter ? { read: readFilter } : {}),
        });

        setBooks(result.data);
      } catch (err) {
        setError(err.message);
      }
    }}
  >
    <option value="">No Rating</option>
    <option value="1">1 Star</option>
    <option value="2">2 Stars</option>
    <option value="3">3 Stars</option>
    <option value="4">4 Stars</option>
    <option value="5">5 Stars</option>
  </select>
)}

  <button
    type="button"
    onClick={() => handleEditClick(book)}
  >
    Edit
  </button>
  <button
  type="button"
  className="delete-button"
  onClick={() => handleDeleteBook(book.id)}
>
  Delete
</button>
</article>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() =>
                setPage((current) => current - 1)
              }
              disabled={page === 1 || loading}
            >
              Previous
            </button>

            <span>
              Page {pagination.currentPage} of{" "}
              {pagination.totalPages}
            </span>

            <button
              onClick={() =>
                setPage((current) => current + 1)
              }
              disabled={
                page === pagination.totalPages || loading
              }
            >
              Next
            </button>
          </div>
           )}
      </main>
    </div>
  );
}

export default App;
