const { Category, Article } = require('../models');
const express = require('express');

exports.renderSearch = async (req, res) => {
    try {

        const {
            query,
            songs,
            nextUrl,
            prevUrl
        } = req.data;

        res.send(`
            <!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="csrf-token" content="OPMHcHxYaFkzkv527eVEIys24Gu8zit4OWlDykMv">
        <!--SEO TAGS -->
        <title>Search results for: ${query} | Dramaspots</title>
        <meta name="title" content="Search results for: ${query} | Dramaspots">
        <meta name="description" content="Download MP3, MP4 videos for ${query} on Drama Spots">
        <meta property="og:type" content="website">
        <meta property="og:site_name" content="Dramaspots">
        <meta property="og:title" content="Search results for: ${query} | Dramaspots">
        <meta property="og:description" content="Download MP3, MP4 videos for ${query} on Drama Spots">
        <meta property="og:locale" content="en_ZA">
        <meta property="og:image" content="https://dramaspots.com/assets/logo1.png">
        <meta property="og:image:width" content="1200">
        <meta property="og:image:height" content="630">
        <meta property="og:image:alt" content="Search results for: ${query} | Dramaspots">
        <meta property="og:image:type" content="image/jpeg">
        <meta property="og:url" content="https://dramaspots.com/music/search?query=${encodeURIComponent(query)}">
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:site" content="@dramaSpot254">
        <meta name="twitter:title" content="Search results for: ${query} | Dramaspots">
        <meta name="twitter:description" content="Download MP3, MP4 videos for ${query} on Drama Spots">
        <meta name="twitter:creator" content="@dramaSpot254">
        <meta name="twitter:image" content="https://dramaspots.com/assets/logo1.png">
        <meta name="twitter:label1" content="Author">
        <meta name="twitter:data1" content="Dramaspots">
        <meta name="twitter:label2" content="Estimated Reading Time">
        <meta name="twitter:data2" content="2 minutes">
        <meta name="robots" content="noindex, nofollow">
        
        <link rel="canonical" href="https://dramaspots.com/music/search?query=${encodeURIComponent(query)}">

                    <!-- Favicon -->
    <link rel="icon" type="image/png" href="/assets/logo1.png" sizes="32x32">
    <link rel="icon" type="image/x-icon" href="/favicon.ico">
    <link rel="apple-touch-icon" href="/assets/logo1.png">

  <!-- JSON-LD Structured Data -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "SearchResultsPage",
    "name": "Search results for ${query}",
    "description": "Download MP3, MP4 videos for ${query} on Drama Spots.",
    "url": "https://dramaspots.com/music/search?query=${encodeURIComponent(query)}"
  }
  </script>

    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css?family=Roboto:400,700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
    <style>
        body {
            font-family: 'Roboto', Arial, sans-serif;
            background: #f8f9fa;
        }

        .btn-primary,
        .bg-primary {
            background: #d11e5a !important;
            border: #d11e5a;
        }

        .text-primary {
            color: #d11e5a !important;
        }

        .btn-outline-primary {
            color: #d11e5a;
            border-color: #d11e5a;
        }

        .btn-primary {
            background: #d11e5a;
            border-color: #d11e5a;
        }

         .btn-outline-primary:hover {
            background-color: #d11e5a;
            border-color: #d11e5a;
            color: #fff;
        }

        .search-bar {
            max-width: 500px;
        }


        .navbar-brand {
            font-size: 1.3rem;
            font-weight: bold;
            letter-spacing: 2px;
            margin-bottom: 8px;
            background: linear-gradient(90deg, rgb(250, 92, 18) 0%, rgb(243, 50, 163) 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            text-transform: uppercase;
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
            text-decoration: none;
            transition: color 0.3s ease;
        }

        .exclusive-badge {
            background: #e83e8c;
            color: #fff;
            font-size: 0.85rem;
            padding: 0.25em 0.75em;
            border-radius: 1em;
            font-weight: 600;
            margin-left: 0.5em;
        }

        .loading-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.966);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1050;
            transition: opacity 0.2s ease;
        }
        .card-title {
            font-size: 1.05rem;
            font-weight: 600;

            color: #aeafaf;
        }
                @media (max-width: 768px) {

            .card-title {
                font-size: 0.75rem;
            }

            .card-text {
                font-size: 0.75rem;
    }
                }
    </style>
</head>

<body>
    <nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm py-3 shadow-sm sticky-top">
        <div class="container">
            <a class="navbar-brand" href="/">Drama Spots</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
                    <li class="nav-item"><a class="nav-link" href="/">Home</a></li>
                    <li class="nav-item"><a class="nav-link" href="/music#genres">Genres</a></li>
                    <li class="nav-item"><a class="nav-link" href="/music#moods">Moods</a></li>
                </ul>
            </div>
        </div>
    </nav>
    <main class="container pb-5">
        <h1 class=" pt-2 fw-bolder">Music</h1>
        <!-- Search, Sort, Filter, and Music List (legacy) -->
<form id="searchForm" class="d-flex search-bar position-relative my-2">
  <input class="form-control me-2" type="search" id="searchInput"
      placeholder="Search by title, artist, genre..." aria-label="Search" autocomplete="off">
  <button class="btn btn-primary" type="submit"><i class="bi bi-search"></i></button>
  
  <!-- Suggestions Dropdown -->
  <ul id="suggestionsBox" class="list-group position-absolute w-100 mt-5 shadow" style="z-index: 1000; display: none;"></ul>
</form>
  ${songs.length ? `
        
    <!-- Music Results Section -->
    <section class="py-5 bg-light">
        <div class="container">
            <h4 class="mb-4">Search Results</h4>
            <div class="row g-1">
                ${songs.map(r => `
                        <div class="col-md-3 col-6">
                    <div class="card h-100 shadow-sm">
                        <img src="${r.img}" class="card-img-top" alt="Related Song 1">
                        <div class="card-body">
                            <h6 class="card-title mb-1">${r.title}</h6>
                            <p class="card-text text-muted mb-2"><i class="far fa-clock"></i>&nbsp;${r.duration}</p>
                            <a href="/music/${r.link}" class="btn btn-sm btn-outline-primary w-100"><i class="fa-solid fa-play"></i> Listen</a>
                        </div>
                    </div>
                </div>
                        `).join('')
                }
            </div>
        </div>
        <div class="d-flex justify-content-between mt-4 mx-4">
           
            ${prevUrl ? `<a href="/music/search?query=${prevUrl}" class="btn btn-primary">Previous</a>` : '<a class="btn btn-secondary">Previous</a>'
                }

             ${nextUrl ? `<a href="/music/search?query=${nextUrl}" class="btn btn-primary">Next</a>` : '<a class="btn btn-secondary">Next</a>'
                }
    </section>

        `: ``
            }
    </main>
    
<!-- Footer -->
<footer class="bg-danger text-white py-5 mt-5">
  <div class="container">
    <div class="row">
      <!-- Brand & Description -->
      <div class="col-md-4 mb-4 mb-md-0">
        <h5 class="fw-bold">Dramaspot</h5>
        <p class="small">
          Your #1 source for the latest in celebrity relationships, breakups, and Hollywood news.
        </p>
      </div>

      <!-- Quick Links -->
      <div class="col-md-2 mb-4 mb-md-0">
        <h6 class="fw-bold">Sections</h6>
        <ul class="list-unstyled small">
          <li><a href="/" class="footer-link text-white text-decoration-none">Home</a></li>
          <li><a href="/category/Relationships%20&%20Love%20Life" class="footer-link text-white text-decoration-none">Relationships & Love Life</a></li>
          <li><a href="/category/Red%20Carpet%20&%20Events" class="footer-link text-white text-decoration-none">Red Carpet & Events</a></li>
          <li><a href="/category/News" class="footer-link text-white text-decoration-none">News</a></li>
          <li><a href="/about" class="footer-link text-white text-decoration-none">About</a></li>
          <li><a href="/contact" class="footer-link text-white text-decoration-none">Contact Us</a></li>
        </ul>
      </div>

      <!-- Legal Pages -->
      <div class="col-md-3 mb-4 mb-md-0">
        <h6 class="fw-bold">Legal</h6>
        <ul class="list-unstyled small">
          <li><a href="/terms" class="footer-link text-white text-decoration-none">Terms & Conditions</a></li>
          <li><a href="/privacy" class="footer-link text-white text-decoration-none">Privacy Policy</a></li>
        </ul>
      </div>

      <!-- Newsletter Signup -->
      <div class="col-md-3">
        <h6 class="fw-bold">Newsletter</h6>
        <form id="subsciptionForm" action="/newsletter/subscribe" method="POST" class="d-flex flex-column gap-2">
          <input name="email" type="email" class="form-control" placeholder="Your email" required>
          <button class="btn btn-light btn-sm" type="submit">Subscribe</button>
        </form>
      </div>
    </div>

    <!-- Divider -->
    <hr class="border-light my-4">

    <!-- Contact & Socials -->
    <div class="row">
      <div class="col-md-6 text-center text-md-start small">
        <p class="mb-0">Email: <a href="mailto:dramaspots254@gmail.com" class="text-white">dramaspots254@gmail.com</a></p>
      </div>
      <div class="col-md-6 text-center text-md-end">
        <a href="https://x.com/dramaSpot254" class="text-white text-decoration-none me-3"><i class="bi bi-x"></i> X</a>
        <a href="https://www.instagram.com/dramaspots254/" class="text-white text-decoration-none me-3"><i class="bi bi-instagram"></i> Instagram</a>
        <a href="https://www.youtube.com/@dramaspot-w2r" class="text-white text-decoration-none"><i class="bi bi-youtube"></i> YouTube</a>
        <a href="https://www.tiktok.com/@dramaspots254" class="text-white text-decoration-none"><i class="bi bi-tiktok"></i> Tiktok</a>
      </div>
    </div>

    <!-- Copyright -->
    <div class="text-center small mt-3">
      &copy; 2025 Dramaspot. All rights reserved | Developed By <a class="text-primary text-decoration-none" href="https://lonatech.onrender.com/">Lonatech solutions</a>.
    </div>
  </div>
</footer>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
<script>

document.getElementById('searchForm').addEventListener('submit', function (e) {
  e.preventDefault();
    const query = document.getElementById('searchInput').value.trim();
    if (query) {
        window.location.href = \`/music/search?query=\${query}\`;
    } else {
        alert('Please enter a search term');
    }
});
  const input = document.getElementById('searchInput');
  const suggestionsBox = document.getElementById('suggestionsBox');

  input.addEventListener('input', () => {
    const query = input.value.trim();
    if (query.length === 0) {
      suggestionsBox.style.display = 'none';
      return;
    }

    // Remove old JSONP script
    const oldScript = document.getElementById('jsonpScript');
    if (oldScript) oldScript.remove();

    // Create JSONP request
    const script = document.createElement('script');
    script.id = 'jsonpScript';
    script.src = \`https://suggestqueries.google.com/complete/search?client=youtube&ds=yt&q=\${encodeURIComponent(query)}&callback=handleSuggestions\`;
    document.body.appendChild(script);
  });

  // JSONP callback
  function handleSuggestions(data) {
  const suggestions = data[1]; // Array of [suggestion, number]
  suggestionsBox.innerHTML = '';

  if (!Array.isArray(suggestions) || suggestions.length === 0) {
    suggestionsBox.style.display = 'none';
    return;
  }

  suggestions.forEach(([text]) => {
    const li = document.createElement('li');
    li.className = 'list-group-item list-group-item-action';
    li.textContent = text;
    li.addEventListener('click', () => {
      input.value = text;
      suggestionsBox.style.display = 'none';
      window.location.href = \`/music/search?query=\${text}\`;
    });
    suggestionsBox.appendChild(li);
  });

  suggestionsBox.style.display = 'block';
}


  // Hide suggestions on outside click
  document.addEventListener('click', (e) => {
    if (!document.getElementById('searchForm').contains(e.target)) {
      suggestionsBox.style.display = 'none';
    }
  });
</script>
</body>

</html>
            `);
    } catch (error) {
        console.error('Error fetching music:', error);
        res.status(500).send('<h1>Internal Server Error</h1>');
    }
}
