exports.renderHashtag = async (req, res) => {
    const { hashtag, latest, mostViewed, personalized, relatedCategories, hashtags } = req.data;
    let colors = ['pink', 'info', 'success', 'danger', 'primary', 'secondary'];

    // Helper: get ISO week number
    Date.prototype.getWeekNumber = function () {
        const d = new Date(Date.UTC(this.getFullYear(), this.getMonth(), this.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    };

    // Dummy time ago
    function timeAgo(time) {
        const now = new Date();
        const past = new Date(time);
        const seconds = Math.floor((now - past) / 1000);
        const daysDiff = Math.floor(seconds / 86400);

        const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        if (seconds < 60) {
            return 'just now';
        } else if (seconds < 3600) {
            const mins = Math.floor(seconds / 60);
            return `${mins} minute${mins > 1 ? 's' : ''} ago`;
        } else if (seconds < 86400) {
            const hrs = Math.floor(seconds / 3600);
            return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
        } else if (daysDiff < 7 && past.getWeekNumber() === now.getWeekNumber()) {
            return weekdays[past.getDay()];
        } else {
            return past.toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        }
    }

    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>#${hashtag}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">

  <!-- Favicon -->
  <link rel="icon" type="image/png" href="/assets/logo1.png" sizes="32x32">
  <link rel="icon" type="image/x-icon" href="/favicon.ico">

  <!-- SEO Meta Tags -->
  <meta name="description" content="Discover the latest trending stories and gossip tagged with #${hashtag} on Drama Spots. Stay updated with exclusive content.">
  <meta name="keywords" content="${hashtag}, celebrity gossip, trending hashtags, drama spots, entertainment news">
  <meta name="author" content="Drama Spots Team">
  <meta name="robots" content="index, follow">

  <!-- Open Graph (Facebook, LinkedIn, etc.) -->
  <meta property="og:title" content="#${hashtag} – Trending on Drama Spots">
  <meta property="og:description" content="Stay in the loop with top celebrity news and gossip under #${hashtag}.">
  <meta property="og:type" content="article">
  <meta property="og:url" content="https://dramaspots.com/hashtag/${hashtag}">
  <meta property="og:image" content="https://dramaspots.com/assets/logo1.png">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="#${hashtag} – Trending Gossip | Drama Spots">
  <meta name="twitter:description" content="Explore trending posts under #${hashtag} on Drama Spots.">
  <meta name="twitter:image" content="https://dramaspots.com/assets/logo1.png">

  <!-- Canonical -->
  <link rel="canonical" href="https://dramaspots.com/hashtag/${hashtag}" />

  <!-- Structured Data: JSON-LD -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "#${hashtag} – Drama Spots",
    "description": "Discover articles tagged with #${hashtag} on Drama Spots – your top source for celebrity news.",
    "url": "https://dramaspots.com/hashtag/${hashtag}",
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": [
        ${latest.slice(0, 5).map((article, index) => `{
          "@type": "ListItem",
          "position": ${index + 1},
          "url": "https://dramaspots.com/article/${article.slug}"
        }`).join(',')}
      ]
    }
  }
  </script>

  
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4436674424567426"
     crossorigin="anonymous"></script>


  <!-- Bootstrap 5 CSS -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">

  <!-- Font Awesome -->
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">

  <!-- Custom Fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap" rel="stylesheet">

    <style>
        :root {
            --primary: #fa3577;
            --secondary: #fff;
            --accent: #ffeb3b;
            --dark: #222;
            --light: #f8f8f8;
            --gray: #888;
        }
        .bg-pink{ background: var(--primary); color: var(--secondary);}
        .text-pink{ color: var(--primary);}
        .btn-pink{ background: var(--primary); color: var(--secondary);}
        .btn-outline-pink{ border-color: var(--primary);}
        .sidebar-title { font-size: 1.2rem; font-weight: 600; margin-bottom: 1rem; letter-spacing: 1px;}
        .news-img { object-fit: cover; height: 220px; width: 100%;}
        .author-img { width: 36px; height: 36px; object-fit: cover; border-radius: 50%; margin-right: 0.5rem;}
        .trending-img { width: 60px; height: 60px; object-fit: cover; border-radius: 8px; margin-right: 0.75rem;}
        .newsletter-form input[type="email"] { border-radius: 0.25rem 0 0 0.25rem;}
        .newsletter-form button { border-radius: 0 0.25rem 0.25rem 0;}
        body { background-color: #f8f9fa;}
        .hashtag-header { background: linear-gradient(90deg, #ff6a00 0%, #ee0979 100%); color: #fff; padding: 2rem 0; margin-bottom: 2rem;}
        .hashtag-title { font-size: 2.5rem; font-weight: 700;}
        .article-card { transition: box-shadow 0.2s;}
        .article-card:hover { box-shadow: 0 4px 24px rgba(0,0,0,0.12);}
        .article-img { object-fit: cover; height: 200px;}
        .tag-badge { background: #ee0979; color: #fff; margin-right: 0.25rem;}
        .pagination { justify-content: center;}
        .sidebar {
            width: 300px;
            background: #fff;
            border-radius: 0.5rem;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            padding: 1.5rem;
            margin-bottom: 2rem;
        }
        .sidebar-title { font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem;}
        .sidebar-list { list-style: none; padding-left: 0;}
        .sidebar-list li { margin-bottom: 0.5rem;}
        .sidebar-list a { color: #ee0979; text-decoration: none;}
        .sidebar-list a:hover { text-decoration: underline;}
        .search-bar { margin-bottom: 2rem;}
        .article-meta { font-size: 0.95rem; color: #888;}
        .article-content { max-height: 4.5em; overflow: hidden; text-overflow: ellipsis;}
        .admin-navbar { background: #fff; border-bottom: 1px solid #eee;}
        .admin-navbar .navbar-brand { font-weight: 700; color: #ee0979;}
        .admin-navbar .nav-link.active { color: #ee0979 !important;}
        .footer { background: #fff; border-top: 1px solid #eee; padding: 1.5rem 0; margin-top: 3rem; color: #888; text-align: center;}
        @media (max-width: 767px) { .article-img { height: 120px; } .hashtag-title { font-size: 1.5rem; font-weight: 700;}}
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
        .tab-nav { display: flex; justify-content: center; align-items: center; width: 100%; gap: 10px; overflow-x: scroll;}
        .tab-nav::-webkit-scrollbar { display: none;}
        .tab-nav a { font-weight: 600; padding: 6px 12px; border-radius: 4px; text-decoration: none; color: rgb(250, 217, 234); transition: border-color 0.3s;}
        .tab-nav a.active, .tab-nav a:hover { background: rgba(255, 255, 255, 0.15); color: #fff;}
        @media (max-width: 767.98px) {
            .tab-nav { gap: 5px; justify-content: left;}
            .tab-nav a { padding: 0px 5px; font-size: 0.9rem; color: rgb(250, 217, 234); font-weight: 500; border: 1px solid transparent; border-radius: 4px;}
        }
        .all { display: flex; align-items: flex-start; max-width: 1200px; margin: 0 auto;}
        .articles { flex: 1; padding: 20px;}
        .aside { width: 300px; height: fit-content; position: sticky; top: 100px; align-self: flex-start;}
        .exclusive-badge { background: #e83e8c; color: #fff; font-size: 0.85rem; padding: 0.25em 0.75em; border-radius: 1em; font-weight: 600; margin-left: 0.5em;}
    </style>
</head>
<body data-hashtag="${hashtag}">
    <!-- Admin Navbar -->
    <nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm py-3 shadow-sm sticky-top">
        <div class="container">
            <a class="navbar-brand" href="/">Drama Spots</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
                    <li class="nav-item"><a class="nav-link" href="/">Home</a></li>
                    <li class="nav-item"><a class="nav-link" href="/category/News">News</a></li>
                    <li class="nav-item"><a class="nav-link" href="/">Trending</a></li>
                    <li class="nav-item"><a class="nav-link" aria-current="page"
                            href="/category/Exclusives">Exclusives <span class="exclusive-badge">Hot</span></a></li>
                    <li class="nav-item"><a class="nav-link" href="/auth">Profile</a></li>
                </ul>
            </div>
        </div>
    </nav>

    <!-- Hashtag Header -->
    <header class="hashtag-header text-center">
        <div class="container">
            <div class="hashtag-title" id="hashtagTitle">
                #${hashtag}
            </div>
            <div class="lead" id="hashtagDesc">
                <!-- Will be set by JS -->
            </div>
        </div>
    </header>

    <div class="container">
        <div class="row">
           
            <!-- Main Content -->
            <main class="col-lg-9">
                <!-- Search Bar -->
                <form class="search-bar d-flex mb-4" id="searchForm" autocomplete="off" onsubmit="return false;">
                    <input class="form-control me-2" type="search" placeholder="Search articles in this hashtag..." aria-label="Search" id="searchInput">
                    <button class="btn btn-outline-primary" type="submit"><i class="fa-solid fa-search"></i></button>
                </form>
                <!-- Articles List -->
                <div id="articlesList" class="row g-4">
                    ${
                        latest.map((article, index) => {
                            return `
                    <div class="col-md-6 col-lg-4">
                        <div class="card article-card h-100">
                            <img src="${article.image}" class="card-img-top article-img" alt="${article.title}">
                            <div class="card-body d-flex flex-column">
                                <h5 class="card-title">${article.title}</h5>
                                <div class="article-meta mb-2">
                                    <i class="fa-solid fa-user"></i> ${article.author.username} &nbsp; 
                                    <i class="fa-solid fa-calendar"></i> ${timeAgo(article.published_at)}
                                </div>
                                <div class="article-content mb-2">${article.excerpt}</div>
                                <div class="mb-2">
                                ${
                                    article.hashtags.map(tag => `<span class="badge tag-badge">#${tag.name}</span>`).join(' ')
                                }
                                </div>
                                <div class="mt-auto d-flex justify-content-between align-items-center">
                                    <a href="/article/${article.slug}" class="btn btn-sm btn-outline-primary">View</a>
                                </div>
                            </div>
                        </div>
                    </div>
                    ${(index + 1) % 3 === 0 ? `<div class="col-12 text-center">
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4436674424567426"
     crossorigin="anonymous"></script>
<ins class="adsbygoogle"
     style="display:block"
     data-ad-format="autorelaxed"
     data-ad-client="ca-pub-4436674424567426"
     data-ad-slot="7912295328"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>
      </div>` : ''}
                `
                        }).join('')
                    }
                </div>
                <div class="col-12 text-center">
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4436674424567426"
     crossorigin="anonymous"></script>
<!-- vicali -->
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-4436674424567426"
     data-ad-slot="5066424887"
     data-ad-format="auto"
     data-full-width-responsive="true"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>
      </div>
                <!-- Pagination -->
                <nav>
                    <ul class="pagination mt-4" id="pagination">
                        <!-- JS will populate -->
                    </ul>
                </nav>
            </main>
             <!-- Sidebar -->
            <aside class="col-lg-3 mb-4">
                <div class="sidebar">
                    <div class="sidebar-title">
                        <i class="fa-solid fa-hashtag"></i> Popular Hashtags
                    </div>
                    <ul class="sidebar-list" id="popularHashtags">
                        ${
                            hashtags.map(h => {
                                return `<li>
                                <a href="/hashtag/${h.name}">#${h.name}</a>
                                </li>`
                            }).join('')
                        }
                    </ul>
                </div>

                ${
                    mostViewed && mostViewed.length ? `
                    <div class="sidebar">
                        <div class="sidebar-title">
                            <i class="fa-solid fa-clock"></i> Recent Articles
                        </div>
                        <ul class="sidebar-list" id="recentArticles">
                            ${
                                mostViewed.map(m => {
                                    return `
                                    <li class="d-flex align-items-center mb-3">
                                        <a href="/article/${m.slug}" class="fw-semibold text-dark text-decoration-none">${m.title}</a>
                                    </li>`;
                                }).join('')
                            }
                        </ul>
                    </div>
                    ` : ``
                }

                ${
                    personalized && personalized.length ? `
                    <div class="sidebar">
                        <div class="sidebar-title">
                            <i class="fa-solid fa-clock"></i> Recommended For You
                        </div>
                        <ul class="sidebar-list" id="personalizedArticles">
                            ${
                                personalized.map(m => {
                                    return `
                                    <li class="d-flex align-items-center mb-3">
                                        <a href="/article/${m.slug}" class="fw-semibold text-dark text-decoration-none">${m.title}</a>
                                    </li>`;
                                }).join('')
                            }
                        </ul>
                    </div>
                    ` : ``
                }

                ${
                    relatedCategories && relatedCategories.length ? `
                    <div class="sidebar">
                        <div class="sidebar-title">
                            <i class="fa-solid fa-clock"></i> Categories
                        </div>
                        <ul class="sidebar-list" id="relatedCategories">
                            ${
                                relatedCategories.map(m => {
                                    return `
                                    <li class="d-flex align-items-center mb-3">
                                        <a class="text-decoration-none" href="/category/${m.name}">${m.name}</a>
                                    </li>`;
                                }).join('')
                            }
                        </ul>
                    </div>
                    ` : ``
                }
                <div class="col-12 text-center">
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4436674424567426"
     crossorigin="anonymous"></script>
<ins class="adsbygoogle"
     style="display:block"
     data-ad-format="fluid"
     data-ad-layout-key="-gw+3+13-5d+7h"
     data-ad-client="ca-pub-4436674424567426"
     data-ad-slot="5787311976"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>
      </div>
            </aside>
        </div>
    </div>

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

    <!-- Bootstrap 5 JS and dependencies -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        let searching = false;
        let fetching = false;
        let currentPage = 1;
        let loading = false;
        let isLastPage = false;

        document.getElementById('searchInput').addEventListener("input", async () => {
            const query = document.getElementById('searchInput').value.trim();
            let hashTag = document.body.dataset.hashtag;
            const searchResults = document.getElementById("articlesList");
            fetching = true;
            searchResults.innerHTML = \`<p>Loading...</p>\`;
            try {
                const res = await fetch(\`/hashtag/articles/all/latest/\${hashTag}?query=\${encodeURIComponent(query)}\`);
                if (!res.ok) throw new Error('Failed to fetch');
                const results = await res.json();
                let html = "";
                if (results && results.length) {
                    html = results.map(article => \`
                        <div class="col-md-6 col-lg-4">
                            <div class="card article-card h-100">
                                <img src="\${article.image}" class="card-img-top article-img" alt="\${article.title}">
                                <div class="card-body d-flex flex-column">
                                    <h5 class="card-title">\${article.title}</h5>
                                    <div class="article-meta mb-2">
                                        <i class="fa-solid fa-user"></i> \${article.author.username} &nbsp; 
                                        <i class="fa-solid fa-calendar"></i> \${(new Date(article.published_at)).toLocaleDateString()}
                                    </div>
                                    <div class="article-content mb-2">\${article.excerpt}</div>
                                    <div class="mb-2">
                                        \${article.hashtags.map(tag => \`<span class="badge tag-badge">#\${tag.name}</span>\`).join(' ')}
                                    </div>
                                    <div class="mt-auto d-flex justify-content-between align-items-center">
                                        <a href="/article/\${article.slug}" class="btn btn-sm btn-outline-primary">View</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    \`).join('');
                }
                searchResults.innerHTML = results.length ? html : \`<p>No item found</p>\`;
            } catch (err) {
                searchResults.innerHTML = \`<p>Error fetching results.</p>\`;
                console.error(err);
            }
        });

        async function loadMoreResults() {
            if (loading || isLastPage || fetching) return;
            loading = true;
            currentPage++;
            let hashTag = document.body.dataset.hashtag;
            const latestPostsList = document.getElementById('articlesList');
            try {
                const res = await fetch(\`/hashtag/articles/all/latest/\${hashTag}?page=\${currentPage}\`);
                if (!res.ok) throw new Error('Failed to fetch');
                const data = await res.json();
                if (!data.length) {
                    isLastPage = true;
                    return;
                }
                let html = data.map(article => \`
                    <div class="col-md-6 col-lg-4">
                        <div class="card article-card h-100">
                            <img src="\${article.image}" class="card-img-top article-img" alt="\${article.title}">
                            <div class="card-body d-flex flex-column">
                                <h5 class="card-title">\${article.title}</h5>
                                <div class="article-meta mb-2">
                                    <i class="fa-solid fa-user"></i> \${article.author.username} &nbsp; 
                                    <i class="fa-solid fa-calendar"></i> \${(new Date(article.published_at)).toLocaleDateString()}
                                </div>
                                <div class="article-content mb-2">\${article.excerpt}</div>
                                <div class="mb-2">
                                    \${article.hashtags.map(tag => \`<span class="badge tag-badge">#\${tag.name}</span>\`).join(' ')}
                                </div>
                                <div class="mt-auto d-flex justify-content-between align-items-center">
                                    <a href="/article/\${article.slug}" class="btn btn-sm btn-outline-primary">View</a>
                                </div>
                            </div>
                        </div>
                    </div>
                \`).join('');
                latestPostsList.insertAdjacentHTML('beforeend', html);
            } catch (err) {
                console.error("Failed to load more:", err);
            } finally {
                loading = false;
            }
        }

        window.addEventListener("scroll", () => {
            const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 200;
            if (nearBottom) {
                loadMoreResults();
            }
        });
    </script>
</body>
</html>
    `);
};