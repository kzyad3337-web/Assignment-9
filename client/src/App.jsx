
import { useEffect, useState } from "react";
import "./App.css";
import { getBooks, getStats } from "./api/books";

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

  // Load books whenever filters or sorting change
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

  return (
    <div>
      <header>
        <h1>Reading List</h1>
        <p>Manage your personal book collection</p>
      </header>

      <main>
        <h2>My Library</h2>

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

                <p>
                  Status: {book.read ? "Read" : "Not Read"}
                </p>

                <p>
                  Rating: {book.rating ?? "Not rated"}
                </p>
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
