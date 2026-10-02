const RESOLUTIONS = new Set(["480p", "720p", "1080p", "2160p", "4K"]);

function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function validateMovie(movie, index) {
  const errors = [];
  const warnings = [];
  const prefix = `movies[${index}]`;

  if (!movie || typeof movie !== "object" || Array.isArray(movie)) {
    return { errors: [`${prefix} must be an object`], warnings };
  }

  if (movie.id === undefined || movie.id === null || String(movie.id).trim() === "") {
    errors.push(`${prefix}.id is required`);
  }
  if (typeof movie.title !== "string" || !movie.title.trim()) {
    errors.push(`${prefix}.title is required`);
  }
  if (typeof movie.streamUrl !== "string" || !isHttpUrl(movie.streamUrl)) {
    errors.push(`${prefix}.streamUrl must be a valid http(s) URL`);
  }
  if (movie.resolution !== undefined && !RESOLUTIONS.has(movie.resolution)) {
    errors.push(`${prefix}.resolution must be one of: ${[...RESOLUTIONS].join(", ")}`);
  }
  if (movie.posterUrl !== undefined && !isHttpUrl(movie.posterUrl)) {
    warnings.push(`${prefix}.posterUrl is not a valid http(s) URL`);
  }
  if (movie.year !== undefined && (!Number.isInteger(movie.year) || movie.year < 1888 || movie.year > 3000)) {
    errors.push(`${prefix}.year must be a valid integer year`);
  }
  if (movie.description === undefined || !String(movie.description).trim()) {
    warnings.push(`${prefix}.description is empty`);
  }

  return { errors, warnings };
}

export function validateManifest(input, options = {}) {
  const errors = [];
  const warnings = [];
  let movies;

  if (Array.isArray(input)) movies = input;
  else if (input && typeof input === "object" && Array.isArray(input.movies)) movies = input.movies;
  else return { valid: false, errors: ["Manifest must be a JSON array or an object containing a movies array"], warnings: [] };

  const ids = new Set();
  const summary = { resolutions: {}, years: {} };
  movies.forEach((movie, index) => {
    const result = validateMovie(movie, index);
    errors.push(...result.errors);
    warnings.push(...result.warnings);
    if (movie && typeof movie === "object" && !Array.isArray(movie)) {
      if (movie.resolution) summary.resolutions[movie.resolution] = (summary.resolutions[movie.resolution] ?? 0) + 1;
      if (Number.isInteger(movie.year)) summary.years[String(movie.year)] = (summary.years[String(movie.year)] ?? 0) + 1;
    }
    if (movie && movie.id !== undefined && movie.id !== null) {
      const id = String(movie.id);
      if (ids.has(id)) errors.push(`movies[${index}].id duplicates another movie: ${id}`);
      ids.add(id);
    }
  });

  if (options.strict) errors.push(...warnings);

  return { valid: errors.length === 0, count: movies.length, errors, warnings, summary };
}
