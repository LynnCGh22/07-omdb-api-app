// script.js

const apiKey = '8595a73a'; // Replace with your OMDb API key
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('movie-search');
const movieResults = document.getElementById('movie-results');
const watchlistDiv = document.getElementById('watchlist');

// Load watchlist from localStorage
let watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
renderWatchlist();

searchForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const query = searchInput.value.trim();
  if (!query) return;
  movieResults.innerHTML = '<p class="no-results">Searching...</p>';
  try {
    const res = await fetch(`https://www.omdbapi.com/?apikey=${apiKey}&s=${encodeURIComponent(query)}`);
    const data = await res.json();

    if (data.Response === "True") {
      renderMovies(data.Search);
    } else {
      movieResults.innerHTML = `<p class="no-results">No results found for "${query}".</p>`;
    }
  } catch (err) {
    console.error(err);
    movieResults.innerHTML = `<p class="no-results">Error fetching movies. Try again later.</p>`;
  }
});

function renderMovies(movies) {
  movieResults.innerHTML = '';
  movies.forEach(movie => {
    const isInWatchlist = watchlist.some(w => w.imdbID === movie.imdbID);
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.innerHTML = `
      <img class="movie-poster" src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Image'}" alt="${movie.Title}">
      <div class="movie-info">
        <h3 class="movie-title">${movie.Title}</h3>
        <p class="movie-year">${movie.Year}</p>
        <button class="btn ${isInWatchlist ? 'btn-remove' : ''}">
          ${isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
        </button>
      </div>
    `;
    const btn = card.querySelector('button');
    btn.addEventListener('click', () => toggleWatchlist(movie, btn));
    movieResults.appendChild(card);
  });
}

function toggleWatchlist(movie, button) {
  const index = watchlist.findIndex(m => m.imdbID === movie.imdbID);
  if (index > -1) {
    watchlist.splice(index, 1);
    button.textContent = 'Add to Watchlist';
    button.classList.remove('btn-remove');
  } else {
    watchlist.push(movie);
    button.textContent = 'Remove from Watchlist';
    button.classList.add('btn-remove');
  }
  localStorage.setItem('watchlist', JSON.stringify(watchlist));
  renderWatchlist();
}

function renderWatchlist() {
  watchlistDiv.innerHTML = '';
  if (watchlist.length === 0) {
    watchlistDiv.innerHTML = 'Your watchlist is empty. Search for movies to add!';
    return;
  }
  watchlist.forEach(movie => {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.innerHTML = `
      <img class="movie-poster" src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Image'}" alt="${movie.Title}">
      <div class="movie-info">
        <h3 class="movie-title">${movie.Title}</h3>
        <p class="movie-year">${movie.Year}</p>
        <button class="btn btn-remove">Remove from Watchlist</button>
      </div>
    `;
    const btn = card.querySelector('button');
    btn.addEventListener('click', () => {
      watchlist = watchlist.filter(m => m.imdbID !== movie.imdbID);
      localStorage.setItem('watchlist', JSON.stringify(watchlist));
      renderWatchlist();
      // Also update search results button if visible
      const searchCard = Array.from(movieResults.children).find(c => 
        c.querySelector('.movie-title').textContent === movie.Title
      );
      if (searchCard) {
        const searchBtn = searchCard.querySelector('button');
        searchBtn.textContent = 'Add to Watchlist';
        searchBtn.classList.remove('btn-remove');
      }
    });
    watchlistDiv.appendChild(card);
  });
}