// script.js

const apiKey = '8595a73a'; // Replace with your OMDb API key
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('movie-search');
const movieResults = document.getElementById('movie-results');
const watchlistDiv = document.getElementById('watchlist');

// Select modal elements
const modal = document.getElementById('movie-modal');
const modalClose = document.querySelector('.modal-close');
const modalPoster = document.getElementById('modal-poster');
const modalTitle = document.getElementById('modal-title');
const modalYear = document.getElementById('modal-year');
const modalRated = document.getElementById('modal-rated');
const modalGenre = document.getElementById('modal-genre');
const modalDirector = document.getElementById('modal-director');
const modalActors = document.getElementById('modal-actors');
const modalPlot = document.getElementById('modal-plot');

// Function to fetch and show full movie details
function showMovieDetails(imdbID) {
  fetch(`https://www.omdbapi.com/?apikey=${apiKey}&i=${imdbID}&plot=full`)
    .then(res => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.json();
    })
    .then(data => {
      if (data.Response === "True") {
        modalPoster.src = data.Poster !== 'N/A' ? data.Poster : 'https://via.placeholder.com/300x450?text=No+Image';
        modalTitle.textContent = data.Title;
        modalYear.textContent = data.Year;
        modalRated.textContent = data.Rated;
        modalGenre.textContent = data.Genre;
        modalDirector.textContent = data.Director;
        modalActors.textContent = data.Actors;
        modalPlot.textContent = data.Plot;
        modal.style.display = 'block';
      } else {
        alert('Movie details not found.');
      }
    })
    .catch(err => {
      console.error('Details fetch error:', err);
      alert('Error fetching movie details. Try again later.');
    });
}

// Close modal
modalClose.addEventListener('click', () => {
  modal.style.display = 'none';
});

// Close modal on clicking outside content
window.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.style.display = 'none';
  }
});

// Example: Update renderMovies to include Details button
function renderMovies(movies) {
  movieResults.innerHTML = '';
  movies.forEach(movie => {
    const isInWatchlist = watchlist.some(w => w.imdbID === movie.imdbID);
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.innerHTML = `
      <div class="movie-info">
        <button class="btn-details">Details</button>
        <button class="btn ${isInWatchlist ? 'btn-remove' : ''}">
          ${isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
        </button>
      </div>
      <img class="movie-poster" src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Image'}" alt="${movie.Title}">
      <div class="movie-info">
        <h3 class="movie-title">${movie.Title}</h3>
        <p class="movie-year">${movie.Year}</p>
      </div>
    `;

    const detailsBtn = card.querySelector('.btn-details');
    detailsBtn.addEventListener('click', () => showMovieDetails(movie.imdbID));

    const watchBtn = card.querySelector('.btn');
    watchBtn.addEventListener('click', () => toggleWatchlist(movie, watchBtn));

    movieResults.appendChild(card);
  });
}

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
    
    // Check if HTTP response is OK
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();

    // Check OMDb API response
    if (data.Response === "True") {
      renderMovies(data.Search);
    } else {
      movieResults.innerHTML = `<p class="no-results">No results found for "${query}".</p>`;
    }

  } catch (err) {
    console.error('Fetch error details:', err);
    movieResults.innerHTML = `<p class="no-results">Oops! Something went wrong while fetching movies. Please try again later.</p>`;
  }
});

// Add or remove movie from watchlist
function toggleWatchlist(movie, button) {
  const exists = watchlist.some(m => m.imdbID === movie.imdbID);
  if (exists) {
    // Remove from watchlist
    watchlist = watchlist.filter(m => m.imdbID !== movie.imdbID);
    button.textContent = 'Add to Watchlist';
    button.classList.remove('btn-remove');
  } else {
    // Add to watchlist
    watchlist.push(movie);
    button.textContent = 'Remove from Watchlist';
    button.classList.add('btn-remove');
  }
  localStorage.setItem('watchlist', JSON.stringify(watchlist));
  renderWatchlist();
}

// Render watchlist
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

    // Remove button functionality
    btn.addEventListener('click', () => {
      watchlist = watchlist.filter(m => m.imdbID !== movie.imdbID);
      localStorage.setItem('watchlist', JSON.stringify(watchlist));
      renderWatchlist();

      // Update search results button if visible
      const searchCard = Array.from(movieResults.children).find(c =>
        c.querySelector('.movie-title').textContent === movie.Title
      );
      if (searchCard) {
        const searchBtn = searchCard.querySelector('button');
        searchBtn.textContent = 'Add to Watchlist';
        searchBtn.classList.remove('btn-remove');
      }
      card.innerHTML = `
        <img class="movie-poster" src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Image'}" alt="${movie.Title}">
        
        <div class="movie-info">
          <h3 class="movie-title">${movie.Title}</h3>
          <p class="movie-year">${movie.Year}</p>

          <div style="display:flex; gap:8px;">
            <button class="btn-details">Details</button>
            <button class="btn btn-remove">Remove from Watchlist</button>
          </div>
        </div>
      `;
    });

    watchlistDiv.appendChild(card);
  });
}