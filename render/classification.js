const { Category, Article } = require('../models');
const express = require('express');

exports.renderClassification = async (req, res) => {
    try {

        const {
              mainTitle,
                key,
                value,
              subtitle,
              description,
              playlistCount,
              playlists
            } = req.data;

                            const relatedStructuredData = (playlists || []).map((pl, i) => ({
            "@type": "ListItem",
            "position": i + 1,
            "name": pl.title,
            "image": pl.img,
            "item": `https://dramaspots.com/music/${pl.link}`
        }));
        res.send(`
            <!DOCTYPE html>
<html lang="en">
<head>

    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="YCMLzvIIFpJVnLzMfLr0Z3QqgCyGP8Ro5nT09AGK">
  <!--SEO TAGS -->
        <title>${subtitle} | Dramaspots</title>
        <meta name="title" content="${mainTitle} | Dramaspots">
        <meta name="description" content="${description}. 80 playlist(s) available.">
        <meta property="og:type" content="website">
        <meta property="og:site_name" content="Dramaspots">
        <meta property="og:title" content="${subtitle} | Dramaspots">
        <meta property="og:description" content="${description}. 80 playlist(s) available.">
        <meta property="og:locale" content="en_ZA">
        <meta property="og:image" content="https://dramaspots.com/assets/logo1.png">
        <meta property="og:image:width" content="1200">
        <meta property="og:image:height" content="630">
        <meta property="og:image:alt" content="${subtitle}s | Dramaspots">
        <meta property="og:image:type" content="image/svg+xml">
        <meta property="og:url" content="https://dramaspots.com/music/:${key}/:${value}">
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:site" content="@dramaSpot254">
        <meta name="twitter:title" content="${subtitle} | Dramaspots">
        <meta name="twitter:description" content="${description}. 80 playlist(s) available.">
        <meta name="twitter:creator" content="@dramaSpot254">
        <meta name="twitter:image" content="https://dramaspots.com/assets/logo1.png">
        <meta name="twitter:label1" content="Author">
        <meta name="twitter:data1" content="Dramaspots">
        <meta name="twitter:label2" content="Estimated Reading Time">
        <meta name="twitter:data2" content="2 minutes">
        <meta name="robots" content="index, follow">
        <link rel="canonical" href="https://dramaspots.com/music/:${key}/:${value}">
            <!-- Favicon -->
    <link rel="icon" type="image/png" href="/assets/logo1.png" sizes="32x32">
    <link rel="icon" type="image/x-icon" href="/favicon.ico">
    <link rel="apple-touch-icon" href="/assets/logo1.png">


       
    <!-- Structured Data -->
    <script type="application/ld+json">
${JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
                {
                    "@type": "CollectionPage",
                    "headline": mainTitle,
                    "image": ['https://dramaspots.com/assets/logo1.png'],
                    "datePublished": null,
                    "dateModified": null,
                    "author": {
                        "@type": "Person",
                        "name": "DramaSpots"
                    },
                    "publisher": {
                        "@type": "Organization",
                        "name": "DramaSpots",
                        "logo": {
                            "@type": "ImageObject",
                            "url": "https://dramaspots.com/assets/logo1.png"
                        }
                    },
                    "mainEntityOfPage": {
                        "@type": "WebPage",
                        "@id": `https://dramaspots.com/music/:${key}/:${value}`
                    }
                },
                {
                    "@type": "BreadcrumbList",
                    "itemListElement": [
                        {
                            "@type": "ListItem",
                            "position": 1,
                            "name": "Home",
                            "item": "https://dramaspots.com/"
                        },
                        {
                            "@type": "ListItem",
                            "position": 2,
                            "name": `Music`,
                            "item": "https://dramaspots.com/music"
                        },
                        {
                            "@type": "ListItem",
                            "position": 3,
                            "name": `${mainTitle} Music Collection`,
                            "item": `https://dramaspots.com/music/:${key}/:${value}`
                        }
                    ]
                },
                {
                    "@type": "ItemList",
                    "name": "Playlists",
                    "itemListElement": relatedStructuredData
                }
            ]
        }, null, 2)}
    </script>

    <link rel="icon" href="https://dramaspots.com/assets/logo1.png" type="image/svg+xml">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">

    <style>

    
        :root {
            --primary: #e50914;
            --secondary: #64748b;
            --accent: #d11e5a;
            --bg: #f8fafc;
            --card-bg: #fff;
            --card-shadow: 0 2px 16px 0 rgba(30,41,59,0.08);
            --radius: 1.25rem;
        }
                    .text-primary {
            color: var(--primary) !important;
        }

        .btn-primary {
            background: var(--primary) !important;
            border: var(--primary);
        }
        body {
            background: var(--bg);
            color: var(--primary);
            font-family: 'Segoe UI', 'Roboto', Arial, sans-serif;
            min-height: 100vh;
        }
        .navbar {
            background: var(--card-bg);
            box-shadow: var(--card-shadow);
        }
        .navbar-brand img {
            height: 40px;
            margin-right: 10px;
        }
        .main-header {
            background: linear-gradient(90deg, #d11e5a 100%);
            color: #fff;
            padding: 3rem 0 2rem 0;
            border-radius: 0 0 var(--radius) var(--radius);
            box-shadow: var(--card-shadow);
            margin-bottom: 2rem;
        }
        .main-header h1 {
            font-size: 2.5rem;
            font-weight: 700;
            letter-spacing: -1px;
        }
        .main-header .subtitle {
            font-size: 1.5rem;
            font-weight: 500;
            margin-top: 0.5rem;
            color: #e0f2fe;
        }
        .main-header .desc {
            font-size: 1.1rem;
            margin-top: 1rem;
            color: #bae6fd;
            max-width: 600px;
        }
        .main-header .playlist-count {
            margin-top: 1.5rem;
            font-size: 1.1rem;
            font-weight: 500;
            color: #fff;
            background: rgba(0,0,0,0.08);
            display: inline-block;
            padding: 0.5rem 1.25rem;
            border-radius: 999px;
            box-shadow: 0 1px 4px 0 rgba(30,41,59,0.08);
        }
        .playlist-section {
            padding: 2rem 0;
        }
        .playlist-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 2rem;
        }
        .playlist-card {
            background: var(--card-bg);
            border-radius: var(--radius);
            box-shadow: var(--card-shadow);
            overflow: hidden;
            transition: transform 0.18s cubic-bezier(.4,0,.2,1), box-shadow 0.18s cubic-bezier(.4,0,.2,1);
            display: flex;
            flex-direction: column;
            height: 100%;
            position: relative;
        }
        .playlist-card:hover {
            transform: translateY(-6px) scale(1.03);
            box-shadow: 0 8px 32px 0 rgba(30,41,59,0.14);
            z-index: 2;
        }
        .playlist-img {
            width: 100%;
            aspect-ratio: 1/1;
            object-fit: cover;
            background: #e0e7ef;
            border-bottom: 1px solid #f1f5f9;
            transition: filter 0.2s;
        }
        .playlist-card:hover .playlist-img {
            filter: brightness(0.95) saturate(1.1);
        }
        .playlist-body {
            padding: 1.25rem 1rem 1rem 1rem;
            flex: 1 1 auto;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }
        .playlist-title {
            font-size: 1.1rem;
            font-weight: 600;
            color: var(--primary);
            margin-bottom: 0.5rem;
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
        }
        .playlist-link {
            text-decoration: none;
            color: var(--accent);
            font-weight: 500;
            font-size: 0.98rem;
            margin-top: auto;
            transition: color 0.15s;
        }
        .playlist-link:hover {
            color: #d11e5a;
            text-decoration: underline;
        }
        @media (max-width: 991px) {
            .main-header {
                padding: 2rem 0 1.5rem 0;
            }
            .main-header h1 {
                font-size: 2rem;
            }
            .main-header .subtitle {
                font-size: 1.2rem;
            }
        }
        @media (max-width: 767px) {
            .main-header {
                padding: 1.5rem 0 1rem 0;
            }
            .main-header h1 {
                font-size: 1.5rem;
            }
            .main-header .desc {
                font-size: 1rem;
            }
            .playlist-section {
                padding: 1rem 0;
            }
            .playlist-grid {
                gap: 1rem;
            }
        }
        .footer {
            background: var(--card-bg);
            color: var(--secondary);
            text-align: center;
            padding: 2rem 0 1rem 0;
            margin-top: 3rem;
            border-radius: var(--radius) var(--radius) 0 0;
            box-shadow: var(--card-shadow);
            font-size: 1rem;
        }
        .footer a {
            color: var(--accent);
            text-decoration: none;
            margin: 0 0.5rem;
            transition: color 0.15s;
        }
        .footer a:hover {
            color: #d11e5a;
            text-decoration: underline;
        }
        /* Custom scrollbar for playlist grid */
        ::-webkit-scrollbar {
            width: 10px;
            background: #e0e7ef;
        }
        ::-webkit-scrollbar-thumb {
            background: #bae6fd;
            border-radius: 6px;
        }
        /* Animation for cards */
        .playlist-card {
            opacity: 0;
            transform: translateY(30px) scale(0.98);
            animation: fadeInUp 0.7s cubic-bezier(.4,0,.2,1) forwards;
        }
        .playlist-card:nth-child(1) { animation-delay: 0.05s; }
        .playlist-card:nth-child(2) { animation-delay: 0.10s; }
        .playlist-card:nth-child(3) { animation-delay: 0.15s; }
        .playlist-card:nth-child(4) { animation-delay: 0.20s; }
        .playlist-card:nth-child(5) { animation-delay: 0.25s; }
        .playlist-card:nth-child(6) { animation-delay: 0.30s; }
        .playlist-card:nth-child(7) { animation-delay: 0.35s; }
        .playlist-card:nth-child(8) { animation-delay: 0.40s; }
        .playlist-card:nth-child(9) { animation-delay: 0.45s; }
        .playlist-card:nth-child(10) { animation-delay: 0.50s; }
        @keyframes fadeInUp {
            to {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
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
    <!-- Navbar -->
    <nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm py-3 shadow-sm sticky-top">
        <div class="container">
            <a class="navbar-brand" href="/">Drama Spots</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
                    <li class="nav-item"><a class="nav-link" href="/">Home</a></li>
                    <li class="nav-item"><a class="nav-link" aria-current="page" href="/music">Music
                            <span class="exclusive-badge">Latest</span></a></li>
                </ul>
            </div>
        </div>
    </nav>
    <!-- Header -->
    <header class="main-header text-center">
        <div class="container">
            <h1>${value}</h1>
            <div class="desc">${description}</div>
            <div class="playlist-count mt-3">${playlistCount.split(' ')[1].trim().split('(')[0]}(${playlistCount.split(' ')[0].trim()})</div>
        </div>
    </header>
    <!-- Playlists Section -->
    <section class="playlist-section">
        <div class="container">
            <h2 class="mb-4 fw-bold text-primary text-center">${mainTitle}</h2>
            <div class="playlist-grid" id="playlistGrid">
                ${
                    playlists.map(pl => `
                        <div class="playlist-card">
                        <a href="/music/${pl.link}">
                    <img class="playlist-img" src="${pl.img}" alt="${pl.alt}">
                </a>
                <div class="playlist-body">
                    <div class="playlist-title" title="${pl.title}">${pl.title}</div>
                    <a class="playlist-link" href="/music/${pl.link}">Open Playlist &rarr;</a>
                    <div class="mt-2 d-flex gap-2 align-items-center">
  <button class="btn btn-sm btn-outline-primary share-btn" data-platform="facebook"
    data-title="${pl.title}" data-link="https://dramaspots.com/music/${pl.link}" data-img="${pl.img}">
    <i class="fab fa-facebook-f"></i>
  </button>
  <button class="btn btn-sm btn-outline-info share-btn" data-platform="twitter"
    data-title="${pl.title}" data-link="https://dramaspots.com/music/${pl.link}" data-img="${pl.img}">
    <i class="fab fa-twitter"></i>
  </button>
  <button class="btn btn-sm btn-outline-success share-btn" data-platform="whatsapp"
    data-title="${pl.title}" data-link="https://dramaspots.com/music/${pl.link}" data-img="${pl.img}">
    <i class="fab fa-whatsapp"></i>
  </button>
</div>

                </div>
                        </div>
                        `).join('')
                }
            </div>
        </div>
    </section>
    <!-- Footer -->
    
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
        <a href="https://www.tiktok.com/@dramaSpot254254" class="text-white text-decoration-none"><i class="bi bi-tiktok"></i> Tiktok</a>
      </div>
    </div>

    <!-- Copyright -->
    <div class="text-center small mt-3">
      &copy; 2025 Dramaspot. All rights reserved | Developed By <a class="text-primary text-decoration-none" href="https://lonatech.onrender.com/">Lonatech solutions</a>.
    </div>
  </div>
</footer>
<script>
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.share-btn').forEach(button => {
      button.addEventListener('click', () => {
        const platform = button.getAttribute('data-platform');
        const title = encodeURIComponent(button.getAttribute('data-title'));
        const link = encodeURIComponent(button.getAttribute('data-link'));
        const img = encodeURIComponent(button.getAttribute('data-img'));

        let url = '';
        switch (platform) {
          case 'facebook':
            url = \`https://www.facebook.com/sharer/sharer.php?u=\${link}\`;
            break;
          case 'twitter':
            url = \`https://twitter.com/intent/tweet?url=\${link}&text=\${title}\&via=dramaSpot254\`;
            break;
          case 'whatsapp':
            url = \`https://wa.me/?text=\${title}%0A\${link}\`;
            break;
        }

        if (url) {
          window.open(url, '_blank', 'noopener,noreferrer,width=600,height=500');
        }
      });
    });
  });
</script>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html></div>
            `);
    } catch (error) {
        console.error('Error fetching music:', error);
        res.status(500).send('<h1>Internal Server Error</h1>');
    }
}
