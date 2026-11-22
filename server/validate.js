
const ALLOWED_GENRES = [
  "fiction",
  "non-fiction",
  "science",
  "history",
  "fantasy",
  "other"
];

const ALLOWED_FIELDS = [
  "title",
  "author",
  "year",
  "genre",
  "read",
  "rating"
];

export function validateBookData(data, partial = false) {
  const errors = [];

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return {
      valid: false,
      errors: ["Request body must be a JSON object."]
    };
  }

  const fields = Object.keys(data);

  for (const field of fields) {
    if (!ALLOWED_FIELDS.includes(field)) {
      errors.push(`Unknown field: ${field}`);
    }
  }

  if (partial && fields.length === 0) {
    errors.push("At least one field is required.");
  }

  const requiredFields = ["title", "author", "year", "genre"];

  if (!partial) {
    for (const field of requiredFields) {
      if (!(field in data)) {
        errors.push(`${field} is required.`);
      }
    }
  }

  if ("title" in data) {
    if (typeof data.title !== "string") {
      errors.push("Title must be a string.");
    } else {
      const title = data.title.trim();

      if (title.length < 1 || title.length > 100) {
        errors.push("Title must be between 1 and 100 characters.");
      }
    }
  }

  if ("author" in data) {
    if (typeof data.author !== "string") {
      errors.push("Author must be a string.");
    } else {
      const author = data.author.trim();

      if (author.length < 1 || author.length > 100) {
        errors.push("Author must be between 1 and 100 characters.");
      }
    }
  }

  if ("year" in data) {
    const currentYear = new Date().getFullYear();

    if (
      !Number.isInteger(data.year) ||
      data.year < 1000 ||
      data.year > currentYear
    ) {
      errors.push(`Year must be an integer between 1000 and ${currentYear}.`);
    }
  }

  if ("genre" in data) {
    if (
      typeof data.genre !== "string" ||
      !ALLOWED_GENRES.includes(data.genre)
    ) {
      errors.push("Invalid genre.");
    }
  }

  if ("read" in data) {
    if (typeof data.read !== "boolean") {
      errors.push("Read must be a boolean.");
    }
  }

  if ("rating" in data) {
    if (
      data.rating !== null &&
      (!Number.isInteger(data.rating) ||
        data.rating < 1 ||
        data.rating > 5)
    ) {
      errors.push("Rating must be an integer between 1 and 5, or null.");
    }
  }

  if (data.read === false && data.rating != null) {
    errors.push("An unread book cannot have a rating.");
  }

  if (errors.length > 0) {
    return {
      valid: false,
      errors
    };
  }

  const cleanData = {};

  for (const field of fields) {
    cleanData[field] =
      typeof data[field] === "string"
        ? data[field].trim()
        : data[field];
  }

  return {
    valid: true,
    errors: [],
    data: cleanData
  };
}
