
const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || data.error || `Request failed: ${response.status}`
    );
  }

  return data;
}

export function getBooks(params = {}, options = {}) {
  const query = new URLSearchParams(params).toString();
  const endpoint = query ? `/books?${query}` : "/books";

  return request(endpoint, {
    signal: options.signal
  });
}

export function getBook(id) {
  return request(`/books/${id}`);
}

export function createBook(bookData) {
  return request("/books", {
    method: "POST",
    body: JSON.stringify(bookData),
  });
}

export function updateBook(id, bookData) {
  return request(`/books/${id}`, {
    method: "PUT",
    body: JSON.stringify(bookData),
  });
}

export function patchBook(id, changes) {
  return request(`/books/${id}`, {
    method: "PATCH",
    body: JSON.stringify(changes),
  });
}

export function deleteBook(id) {
  return request(`/books/${id}`, {
    method: "DELETE",
  });
}

export function getStats() {
  return request("/stats");
}
