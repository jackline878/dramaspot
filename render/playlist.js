const { Category, Article } = require('../models');
const express = require('express');

exports.renderPlayList = async (req, res) => {
    try {

        const {
            meta,
            coverImg,
            link,
            coverAlt,
            title,
            playlistInfo,
            description,
            tracks
        } = req.data;

                const relatedStructuredData = (tracks || []).map((r, i) => ({
            "@type": "ListItem",
            "position": i + 1,
            "name": r.title,
            "item": `https://dramaspots.com/music/${r.link}`
        }));

        res.send(`
            <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="uavfnELCewUwleIGB2zxvyxNbP68pydZyouiAUVA">
    
     <title>Popular ${title} Playlists and Music Videos | Dramaspots</title>
        <meta name="title" content="Popular ${title} Playlists and Music Videos | Dramaspots">
        <meta name="description" content="Explore the best of ${title} music with curated playlists and popular music videos. Discover top tracks, trending artists, and unforgettable performances.">
        <meta property="og:type" content="website">
        <meta property="og:site_name" content="Dramaspots">
        <meta property="og:title" content="Popular ${title} Playlists and Music Videos | Dramaspots">
        <meta property="og:description" content="Explore the best of ${title} music with curated playlists and popular music videos. Discover top tracks, trending artists, and unforgettable performances.">
        <meta property="og:locale" content="en_ZA">
        <meta property="og:image" content="${coverImg}">
        <meta property="og:image:width" content="1200">
        <meta property="og:image:height" content="630">
        <meta property="og:image:alt" content="Popular ${title} Playlists and Music Videos | Dramaspots">
        <meta property="og:image:type" content="image/svg+xml">
        <meta property="og:url" content="https://dramaspots.com/music/${link}">
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:site" content="@dramaSpot254">
        <meta name="twitter:title" content="Popular ${title} Playlists and Music Videos | Dramaspots">
        <meta name="twitter:description" content="Explore the best of ${title} music with curated playlists and popular music videos. Discover top tracks, trending artists, and unforgettable performances.">
        <meta name="twitter:creator" content="@dramaSpot254">
        <meta name="twitter:image" content="${coverImg}">
        <meta name="twitter:label1" content="Author">
        <meta name="twitter:data1" content="Dramaspots">
        <meta name="twitter:label2" content="Estimated Reading Time">
        <meta name="twitter:data2" content="2 minutes">
        <meta name="robots" content="noindex, nofollow">
        <link rel="canonical" href="https://dramaspots.com/music/${link}">


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
                    "@type": "Playlist",
                    "headline": title,
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
                        "@id": `https://dramaspots.com/music/${link}`
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
                            "name": `${title} Playlists`,
                            "item": `https://dramaspots.com/music/${link}`
                        }
                    ]
                },
                {
                    "@type": "ItemList",
                    "name": "music list",
                    "itemListElement": relatedStructuredData
                }
            ]
        }, null, 2)}
    </script>

    
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css?family=Roboto:400,700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
    <style>

          :root {
            --primary: #e50914;
            --red: #e50914;
            --secondary: #222;
            --accent: #d11e5a;
            --text: #222;
            --muted: #888;
            --border: #e0e0e0;
            --bg: #fff;
            --card-bg: #fff;
            --border: #e0e0e0;
            --radius: 12px;
            --shadow: 0 2px 8px rgba(0, 0, 0, 0.07);
        }

        * {
            box-sizing: border-box;
        }

        .text-primary {
            color: var(--primary) !important;
        }

        .btn-primary {
            background: var(--primary) !important;
            border: var(--primary);
        }

        body {
            background: #f8fafc;
            font-family: 'Segoe UI', Arial, sans-serif;
            min-height: 100vh;
        }
        .playlist-header {
            background-image: 
                  linear-gradient(to top right, #d11e5aec, #d11e5a80),
                  url('${coverImg}');
                  background-size: cover;
                  background-position: center;
            color: #fff;
            padding: 2.5rem 0 2rem 0;
            border-radius: 0 0 2rem 2rem;
            box-shadow: 0 2px 16px rgba(252,87,94,0.08);
        }
        .playlist-cover {
            width: 180px;
            height: 180px;
            object-fit: cover;
            border-radius: 1.5rem;
            box-shadow: 0 4px 24px rgba(0,0,0,0.12);
            border: 5px solid #fff;
            margin-bottom: 1.5rem;
        }
        .playlist-title {
            font-size: 2.5rem;
            font-weight: 700;
            letter-spacing: -1px;
        }
        .playlist-info {
            font-size: 1.1rem;
            color: #ffe6e6;
            margin-bottom: 0.5rem;
        }
        .playlist-description {
            font-size: 1.15rem;
            color: #fff;
            margin-bottom: 0.5rem;
        }
        .playlist-actions .btn {
            margin-right: 0.5rem;
            margin-bottom: 0.5rem;
        }
        .playlist-table {
            background: #fff;
            border-radius: 1.5rem;
            box-shadow: 0 2px 16px rgba(0,0,0,0.04);
            overflow: hidden;
            margin-top: -3rem;
            margin-bottom: 2rem;
        }
        .playlist-table thead {
            background: var(--primary);
            color: #fff;
            font-size: 1.1rem;
        }
        .playlist-table tbody tr {
            transition: background 0.2s;
        }
        .playlist-table tbody tr:hover {
            background: #fffbe6;
        }
        .track-img {
            width: 60px;
            height: 60px;
            object-fit: cover;
            border-radius: 0.75rem;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            margin-right: 1rem;
        }

        @media (max-width: 991.98px) {
            .playlist-header {
                text-align: center;
                padding: 2rem 0 1.5rem 0;
            }
            .playlist-cover {
                width: 140px;
                height: 140px;
            }
            .playlist-title {
                font-size: 2rem;
            }
        }
        @media (max-width: 767.98px) {
            .playlist-header {
                padding: 1.5rem 0 1rem 0;
            }
            .playlist-cover {
                width: 100px;
                height: 100px;
            }
            .playlist-title {
                font-size: 1.4rem;
            }
            .playlist-table {
                border-radius: 0.75rem;
                margin-top: -2rem;
            }
            .track-img {
                width: 40px;
                height: 40px;
            }
        }
        .footer {
            background: #fff;
            border-top: 1px solid #f3f3f3;
            padding: 2rem 0 1rem 0;
            color: #888;
            font-size: 1rem;
            text-align: center;
            border-radius: 2rem 2rem 0 0;
            box-shadow: 0 -2px 16px rgba(0,0,0,0.04);
        }
        .footer a {
            color: #fc575e;
            text-decoration: none;
            margin: 0 0.5rem;
        }
        .footer a:hover {
            text-decoration: underline;
        }
        /* Custom scrollbar for playlist table */
        .playlist-table tbody {
            scrollbar-width: thin;
            scrollbar-color: var(--primary) #fff;
        }
        .playlist-table tbody::-webkit-scrollbar {
            height: 8px;
            background: #fff;
        }
        .playlist-table tbody::-webkit-scrollbar-thumb {
            background: var(--primary);
            border-radius: 4px;
        }
        /* Animation for playlist cover */
        .playlist-cover {
            animation: popIn 0.8s cubic-bezier(.68,-0.55,.27,1.55);
        }
        @keyframes popIn {
            0% { transform: scale(0.8); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
        }
        /* Responsive table for mobile */
        @media (max-width: 575.98px) {
            .playlist-table thead {
                display: none;
            }
            .playlist-table tbody tr {
                display: block;
                margin-bottom: 1.5rem;
                border-radius: 1rem;
                box-shadow: 0 2px 8px rgba(0,0,0,0.04);
                background: #fff;
            }
            .playlist-table td {
                display: flex;
                align-items: center;
                padding: 0.75rem 1rem;
                border: none;
            }
            .playlist-table td:before {
                content: attr(data-label);
                flex: 0 0 90px;
                font-weight: 600;
                color: var(--primary);
                margin-right: 1rem;
            }
            .track-actions {
                justify-content: flex-end;
            }
        }

        .btn-outline-primary {
            color: #d11e5a;
            border-color: #d11e5a;
        }
        .btn-outline-primary:hover {
            background-color: #d11e5a;
            border-color: #d11e5a;
            color: #fff;
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

                        .text_primary {
            color: rgb(71, 110, 216) !important;
        }

        .btn-outline_primary {
            color: rgb(71, 110, 216) !important;
            border-color: rgb(71, 110, 216) !important;
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
    <header class="playlist-header">
        <div class="container">
            <div class="row align-items-center">
                <div class="col-lg-2 col-md-3 col-12 text-center mb-3 mb-md-0">
                    <img src="${coverImg}" alt="Owambe" class="playlist-cover shadow">
                </div>
                <div class="col-lg-7 col-md-6 col-12 text-md-start text-center">
                    <h1 class="playlist-title mb-2">${title}</h1>
                    <div class="playlist-info mb-2"${playlistInfo}</div>
                    <div class="playlist-description mb-3">${description}</div>
               
                </div>
                <div class="col-lg-3 col-md-3 d-none d-md-block text-end">
                    <img src="${coverImg}" alt="${title}" class="img-fluid rounded-circle shadow" style="width: 80px; height: 80px;">
                </div>
            </div>
        </div>
    </header>
    <main class="container">
    
            <h4 class="m-4">Tracks</h4>
        <div class="row g-1">
                ${tracks.map(r => `
                        <div class="col-md-3 col-6">
                    <div class="card h-100 shadow-sm">
                        <img src="${r.img}" class="card-img-top" alt="Related Song 1">
                        <div class="card-body">
                            <h6 class="card-title mb-1">${r.alt}</h6>
                            <p class="card-text text-muted mb-2">${r.duration}</p>
                            <div class="my-2 d-flex gap-2 align-items-center">
                            <button class="btn btn-sm btn-outline_primary share-btn" data-platform="facebook"
                                data-title="${r.title}" data-link="https://dramaspots.com/music/${r.link}" data-img="${r.img}">
                                <i class="fab fa-facebook-f"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-dark share-btn" data-platform="twitter"
                                data-title="${r.title}" data-link="https://dramaspots.com/music/${r.link}" data-img="${r.img}">
                                <i class="fab fa-x-twitter"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-success share-btn" data-platform="whatsapp"
                                data-title="${r.title}" data-link="https://dramaspots.com/music/${r.link}" data-img="${r.img}">
                                <i class="fab fa-whatsapp"></i>
                            </button>
                            </div>
                            <a href="/music/${r.link}" class="btn btn-sm btn-outline-primary w-100"><i class="fa-solid fa-play"></i> Listen</a>
                        </div>
                    </div>
                </div>
                        `).join('')
            }
            </div>
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
    <!-- Bootstrap 5 JS and icons -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script>
    
                document.querySelectorAll('.share-btn').forEach(button => {
                    button.addEventListener('click', () => {
                        const platform = button.getAttribute('data-platform');
                        const title = encodeURIComponent(button.getAttribute('data-title'));
                        const link = encodeURIComponent(button.getAttribute('data-link'));
                        const img = encodeURIComponent(button.getAttribute('data-img'));

                        let url = '';
                        switch (platform) {
                            case 'facebook':
                                url = \`https://www.facebook.com/sharer/sharer.php?u=\${link}&quote=\${title}\`;
                                break;
                            case 'twitter':
                                url = \`https://twitter.com/intent/tweet?url=\${link}&text=\${title}\`;
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
    </script>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css">
</body>
</html></a></div>
            `);
    } catch (error) {
        console.error('Error fetching music:', error);
        res.status(500).send('<h1>Internal Server Error</h1>');
    }
}
