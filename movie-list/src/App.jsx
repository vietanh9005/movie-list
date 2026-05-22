import { useEffect, useState } from "react";
import "./App.css";
import { fetchMovies, posterUrl } from "./tmdb";

export default function App() {
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const data = await fetchMovies({ page, query });
        if (cancelled) return;

        setMovies(data.results || []);
        setTotalPages(Math.min(data.total_pages || 1, 500));
      } catch (e) {
        if (!cancelled) {
          setError(e.message || "Failed to load movies");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [page, query]);

  function onSearch(e) {
    e.preventDefault();
    setPage(1);
    setQuery(searchInput.trim());
  }

  function onClear() {
    setSearchInput("");
    setQuery("");
    setPage(1);
  }

  const heading = query ? `Results for "${query}"` : "Popular movies";

  return (
    <main className="appShell">
      <header className="hero">
        <p className="eyebrow">TMDB Movie Explorer</p>
        <h1>Find your next movie night pick</h1>
        <p className="subtitle">
          Search titles, browse posters, and move through pages quickly.
        </p>
      </header>

      <section className="panel">
        <form onSubmit={onSearch} className="searchRow">
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search movie title..."
            aria-label="Search movie title"
          />

          <div className="actions">
            <button type="submit" className="btn btnPrimary" disabled={loading}>
              Search
            </button>
            <button
              type="button"
              className="btn btnGhost"
              onClick={onClear}
              disabled={loading || (!searchInput && !query)}
            >
              Clear
            </button>
            <button type="button" className="btn btnGhost" onClick={onClear} disabled={loading}>
              Popular
            </button>
          </div>
        </form>

        <div className="statusRow">
          <h2>{heading}</h2>
          <span className="pageTag">
            Page {page} of {totalPages}
          </span>
        </div>

        {error && <p className="error">{error}</p>}
        {loading ? <p className="loading">Loading movies...</p> : null}

        {!loading && !error && movies.length === 0 ? (
          <div className="emptyState">
            <p>No movies found. Try another title.</p>
          </div>
        ) : (
          <section className="grid">
            {movies.map((movie) => {
              const year = movie.release_date?.slice(0, 4) || "N/A";
              const img = posterUrl(movie.poster_path);
              const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "N/A";

              return (
                <article key={movie.id} className="card">
                  {img ? (
                    <img src={img} alt={movie.title} className="poster" loading="lazy" />
                  ) : (
                    <div className="poster placeholder">No poster</div>
                  )}

                  <div className="cardBody">
                    <h3 title={movie.title}>{movie.title}</h3>
                    <div className="meta">
                      <span>{year}</span>
                      <span className="dot">•</span>
                      <span>Rating {rating}</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}

        <div className="pager">
          <button
            className="btn btnPager"
            disabled={page <= 1 || loading}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </button>
          <button
            className="btn btnPager"
            disabled={page >= totalPages || loading}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </section>

      <p className="tmdbNote">
        This product uses the TMDB API but is not endorsed or certified by TMDB.
      </p>
    </main>
  );
}
