const TMDB_API = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";
const TMDB_TOKEN = import.meta.env.VITE_TMDB_READ_TOKEN;

async function tmdbGet(path, params = {}) {
  if (!TMDB_TOKEN) {
    throw new Error("Missing VITE_TMDB_READ_TOKEN in .env");
  }

  const url = new URL(`${TMDB_API}${path}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  const res = await fetch(url, {
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${TMDB_TOKEN}`,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.status_message || `TMDB request failed (${res.status})`);
  }

  return res.json();
}

export async function fetchMovies({ page = 1, query = "" }) {
  const baseParams = {
    language: "en-US",
    page,
    include_adult: false,
  };

  if (query.trim()) {
    return tmdbGet("/search/movie", { ...baseParams, query: query.trim() });
  }

  return tmdbGet("/discover/movie", { ...baseParams, sort_by: "popularity.desc" });
}

export function posterUrl(posterPath) {
  return posterPath ? `${TMDB_IMAGE_BASE}${posterPath}` : null;
}