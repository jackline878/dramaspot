// Global variables
let moviesData = {};
let currentFilter = 'all';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadMoviesData();
    initializeEventListeners();
});

// Load movies data from JSON
async function loadMoviesData() {
    try {
        const response = await fetch('data.json');
        moviesData = await response.json();
        renderAllSections();
    } catch (error) {
        console.error('Error loading movies data:', error);
        showError('Failed to load movies data. Please refresh the page.');
    }
}

// Initialize event listeners
function initializeEventListeners() {
    // Filter tabs
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const section = this.closest('.content-section');
            const filter = this.dataset.filter;
            
            // Update active tab
            section.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Filter movies
            filterMovies(section, filter);
        });
    });

    // Search form
    const searchForm = document.querySelector('.search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const query = this.querySelector('.search-input').value.trim();
            if (query) {
                window.location.href = `search.html?q=${encodeURIComponent(query)}`;
            }
        });
    }

    // Movie card clicks
    document.addEventListener('click', function(e) {
        const movieCard = e.target.closest('.movie-card');
        if (movieCard) {
            const movieId = movieCard.dataset.movieId;
            if (movieId) {
                window.location.href = `movie.html?id=${movieId}`;
            }
        }
    });
}

// Render all sections
function renderAllSections() {
    renderSection('trending', moviesData.Trending);
    renderSection('popular', moviesData.Popular);
    renderSection('latest', moviesData.Latest);
}

// Render a specific section
function renderSection(sectionId, data) {
    const grid = document.getElementById(`${sectionId}-grid`);
    if (!grid) return;

    const movies = data.All || [];
    grid.innerHTML = '';

    if (movies.length === 0) {
        grid.innerHTML = '<p class="text-center">No movies found.</p>';
        return;
    }

    movies.forEach(movie => {
        const movieCard = createMovieCard(movie);
        grid.appendChild(movieCard);
    });
}

// Create movie card element
function createMovieCard(movie) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.dataset.movieId = movie.id;

    card.innerHTML = `
        <img src="${movie.image}" alt="${movie.title}" class="movie-poster" loading="lazy">
        <div class="movie-info">
            <h3 class="movie-title">${movie.title}</h3>
            <div class="movie-meta">
                <div class="movie-rating">
                    <i class="fas fa-star"></i>
                    <span>${movie['imdb rating']}</span>
                </div>
                <span class="movie-year">${movie.year}</span>
            </div>
            <div class="movie-genres">${movie.genres}</div>
            <p class="movie-description">${movie.description}</p>
        </div>
    `;

    return card;
}

// Filter movies in a section
function filterMovies(section, filter) {
    const grid = section.querySelector('.movies-grid');
    const sectionId = grid.id.replace('-grid', '');
    const data = moviesData[sectionId.charAt(0).toUpperCase() + sectionId.slice(1)];
    
    let movies = [];
    if (filter === 'all') {
        movies = data.All || [];
    } else if (filter === 'movies') {
        movies = data.Movies || [];
    } else if (filter === 'tv') {
        movies = data['TV Shows'] || [];
    }

    grid.innerHTML = '';

    if (movies.length === 0) {
        grid.innerHTML = '<p class="text-center">No movies found.</p>';
        return;
    }

    movies.forEach(movie => {
        const movieCard = createMovieCard(movie);
        grid.appendChild(movieCard);
    });
}

// Show error message
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #e50914;
        color: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    `;
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);

    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// Search functionality
function performSearch(query) {
    if (!moviesData || Object.keys(moviesData).length === 0) {
        return [];
    }

    const allMovies = [];
    Object.values(moviesData).forEach(category => {
        if (category.All) {
            allMovies.push(...category.All);
        }
    });

    const searchTerm = query.toLowerCase();
    return allMovies.filter(movie => 
        movie.title.toLowerCase().includes(searchTerm) ||
        movie.description.toLowerCase().includes(searchTerm) ||
        movie.genres.toLowerCase().includes(searchTerm) ||
        movie.cast.some(person => 
            person['original name'].toLowerCase().includes(searchTerm)
        )
    );
}

// Get movie by ID
function getMovieById(id) {
    if (!moviesData || Object.keys(moviesData).length === 0) {
        return null;
    }

    const allMovies = [];
    Object.values(moviesData).forEach(category => {
        if (category.All) {
            allMovies.push(...category.All);
        }
    });

    return allMovies.find(movie => movie.id == id);
}

// Get recommended movies
function getRecommendedMovies(movie) {
    if (!movie.recommended || !Array.isArray(movie.recommended)) {
        return [];
    }

    const allMovies = [];
    Object.values(moviesData).forEach(category => {
        if (category.All) {
            allMovies.push(...category.All);
        }
    });

    return movie.recommended.map(id => 
        allMovies.find(m => m.id === id)
    ).filter(Boolean);
}

// Open trailer modal
function openTrailerModal(trailerUrl) {
    const modal = document.createElement('div');
    modal.className = 'trailer-modal active';
    modal.innerHTML = `
        <div class="trailer-content">
            <button class="trailer-close" onclick="this.closest('.trailer-modal').remove()">
                <i class="fas fa-times"></i>
            </button>
            <iframe 
                class="trailer-video" 
                src="${trailerUrl}" 
                frameborder="0" 
                allowfullscreen>
            </iframe>
        </div>
    `;
    document.body.appendChild(modal);

    // Close on background click
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });

    // Close on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            modal.remove();
        }
    });
}

// Format number with commas
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Debounce function for search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Smooth scroll to element
function smoothScrollTo(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Initialize page-specific functionality
function initializePage() {
    const currentPage = window.location.pathname.split('/').pop();
    
    switch (currentPage) {
        case 'movie.html':
            initializeMoviePage();
            break;
        case 'search.html':
            initializeSearchPage();
            break;
        case 'explore.html':
            initializeExplorePage();
            break;
        case 'cast.html':
            initializeCastPage();
            break;
        case 'trailer.html':
            initializeTrailerPage();
            break;
    }
}

// Initialize movie page
function initializeMoviePage() {
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id');
    
    if (!movieId) {
        window.location.href = 'movies.html';
        return;
    }

    loadMoviesData().then(() => {
        const movie = getMovieById(movieId);
        if (!movie) {
            window.location.href = 'movies.html';
            return;
        }

        renderMoviePage(movie);
    });
}

// Render movie page
function renderMoviePage(movie) {
    document.title = `${movie.title} - Dramaspots Movies`;
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
        metaDescription.content = movie.description;
    }

    // Render movie hero
    const movieHero = document.querySelector('.movie-hero');
    if (movieHero) {
        movieHero.innerHTML = `
            <img src="${movie.image}" alt="${movie.title}" class="movie-poster-large">
            <div class="movie-details">
                <h1 class="movie-title-large">${movie.title}</h1>
                <div class="movie-stats">
                    <div class="stat">
                        <i class="fas fa-star"></i>
                        <span>${movie['imdb rating']}/10</span>
                    </div>
                    <div class="stat">
                        <i class="fas fa-calendar"></i>
                        <span>${movie.year}</span>
                    </div>
                    <div class="stat">
                        <i class="fas fa-users"></i>
                        <span>${formatNumber(movie['votes count'])} votes</span>
                    </div>
                    <div class="stat">
                        <i class="fas fa-globe"></i>
                        <span>${movie.countries}</span>
                    </div>
                </div>
                <p class="movie-description-large">${movie.description}</p>
                <div class="movie-actions">
                    <button class="btn btn-trailer" onclick="openTrailerModal('${movie.Trailers[0]}')">
                        <i class="fas fa-play"></i> Watch Trailer
                    </button>
                    <a href="${movie['download link']}" class="btn btn-download">
                        <i class="fas fa-download"></i> Download
                    </a>
                </div>
            </div>
        `;
    }

    // Render cast
    const castSection = document.querySelector('.cast-section');
    if (castSection) {
        const castGrid = castSection.querySelector('.cast-grid');
        castGrid.innerHTML = '';
        
        movie.cast.forEach(person => {
            const castMember = document.createElement('div');
            castMember.className = 'cast-member';
            castMember.innerHTML = `
                <div class="cast-name">${person['original name']}</div>
                <div class="cast-role">${person.role}</div>
            `;
            castGrid.appendChild(castMember);
        });
    }

    // Render crew
    const crewSection = document.querySelector('.crew-section');
    if (crewSection) {
        const crewGrid = crewSection.querySelector('.crew-grid');
        crewGrid.innerHTML = '';
        
        movie.crew.forEach(person => {
            const crewMember = document.createElement('div');
            crewMember.className = 'cast-member';
            crewMember.innerHTML = `
                <div class="cast-name">${person['original name']}</div>
                <div class="cast-role">${person.role}</div>
            `;
            crewGrid.appendChild(crewMember);
        });
    }

    // Render recommended movies
    const recommendedMovies = getRecommendedMovies(movie);
    const recommendedSection = document.querySelector('.recommended-section');
    if (recommendedSection && recommendedMovies.length > 0) {
        const recommendedGrid = recommendedSection.querySelector('.recommended-grid');
        recommendedGrid.innerHTML = '';
        
        recommendedMovies.forEach(recMovie => {
            const movieCard = createMovieCard(recMovie);
            recommendedGrid.appendChild(movieCard);
        });
    }
}

// Initialize search page
function initializeSearchPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q');
    
    if (!query) {
        window.location.href = 'movies.html';
        return;
    }

    loadMoviesData().then(() => {
        const results = performSearch(query);
        renderSearchResults(query, results);
    });
}

// Render search results
function renderSearchResults(query, results) {
    document.title = `Search results for "${query}" - Dramaspots Movies`;
    
    const searchQuery = document.querySelector('.search-query');
    if (searchQuery) {
        searchQuery.textContent = `Search results for "${query}"`;
    }

    const resultsCount = document.querySelector('.results-count');
    if (resultsCount) {
        resultsCount.textContent = `${results.length} result${results.length !== 1 ? 's' : ''} found`;
    }

    const resultsGrid = document.querySelector('.search-results-grid');
    if (resultsGrid) {
        resultsGrid.innerHTML = '';
        
        if (results.length === 0) {
            resultsGrid.innerHTML = '<p class="text-center">No results found. Try a different search term.</p>';
            return;
        }

        results.forEach(movie => {
            const movieCard = createMovieCard(movie);
            resultsGrid.appendChild(movieCard);
        });
    }
}

// Initialize explore page
function initializeExplorePage() {
    loadMoviesData().then(() => {
        renderExplorePage();
    });
}

// Render explore page
function renderExplorePage() {
    const allMovies = [];
    Object.values(moviesData).forEach(category => {
        if (category.All) {
            allMovies.push(...category.All);
        }
    });

    const exploreGrid = document.querySelector('.explore-grid');
    if (exploreGrid) {
        exploreGrid.innerHTML = '';
        
        allMovies.forEach(movie => {
            const movieCard = createMovieCard(movie);
            exploreGrid.appendChild(movieCard);
        });
    }
}

// Initialize cast page
function initializeCastPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('movieId');
    
    if (!movieId) {
        window.location.href = 'movies.html';
        return;
    }

    loadMoviesData().then(() => {
        const movie = getMovieById(movieId);
        if (!movie) {
            window.location.href = 'movies.html';
            return;
        }

        renderCastPage(movie);
    });
}

// Render cast page
function renderCastPage(movie) {
    document.title = `Cast & Crew - ${movie.title} - Dramaspots Movies`;
    
    const castGrid = document.querySelector('.cast-grid');
    if (castGrid) {
        castGrid.innerHTML = '';
        
        [...movie.cast, ...movie.crew].forEach(person => {
            const castMember = document.createElement('div');
            castMember.className = 'cast-member';
            castMember.innerHTML = `
                <div class="cast-name">${person['original name']}</div>
                <div class="cast-role">${person.role}</div>
            `;
            castGrid.appendChild(castMember);
        });
    }
}

// Initialize trailer page
function initializeTrailerPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('movieId');
    
    if (!movieId) {
        window.location.href = 'movies.html';
        return;
    }

    loadMoviesData().then(() => {
        const movie = getMovieById(movieId);
        if (!movie) {
            window.location.href = 'movies.html';
            return;
        }

        renderTrailerPage(movie);
    });
}

// Render trailer page
function renderTrailerPage(movie) {
    document.title = `Trailer - ${movie.title} - Dramaspots Movies`;
    
    const trailerContainer = document.querySelector('.trailer-container');
    if (trailerContainer && movie.Trailers && movie.Trailers.length > 0) {
        trailerContainer.innerHTML = `
            <div class="trailer-video-container">
                <iframe 
                    class="trailer-video" 
                    src="${movie.Trailers[0]}" 
                    frameborder="0" 
                    allowfullscreen>
                </iframe>
            </div>
        `;
    }
}

// Initialize page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
});
