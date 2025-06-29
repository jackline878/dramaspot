exports.renderCategory = async (req, res) => {
    // Example: Render a simple HTML page for the Celebrity Travel category
    const { category, mostViewed, latest, personalized, relatedCategories, hashtags } = req.data || {};
    let colors = ['pink', 'info', 'success', 'danger', 'primary', 'secondary'];

    // Helper to render news cards (replace with real data in production)
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
   const encodedCategory = encodeURIComponent(category.name);

    let html = `
    <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  
  <title>${category.name} | Drama Spots</title>

  <!-- SEO Meta -->
  <meta name="description" content="Explore the latest gossip, news, and stories under ${category.name} at Drama Spots." />
  <meta name="keywords" content="${category.name}, celebrity gossip, trending news, drama spots, entertainment" />
  <meta name="author" content="Drama Spots">
  <meta name="robots" content="index, follow" />

  <!-- Open Graph Meta (Facebook, LinkedIn) -->
  <meta property="og:title" content="${category.name} | Drama Spots" />
  <meta property="og:description" content="Catch up on everything happening in ${category.name}. Celebrity news, gossip, and more." />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://dramaspots.com/category/${encodeURIComponent(category.name)}" />
  <meta property="og:image" content="https://dramaspots.com/assets/logo1.png" />

  <!-- Twitter Card Meta -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${category.name} | Drama Spots" />
  <meta name="twitter:description" content="Explore trending gossip, news, and celebrity updates in ${category.name}." />
  <meta name="twitter:image" content="https://dramaspots.com/assets/logo1.png" />

  <!-- Canonical URL -->
  <link rel="canonical" href="https://dramaspots.com/category/${encodeURIComponent(category.name)}" />

  <!-- Structured Data (JSON-LD) -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "${category.name} | Drama Spots",
    "description": "Latest articles and gossip updates in ${category.name}.",
    "url": "https://dramaspots.com/category/${encodeURIComponent(category.name)}"
  }
  </script>
        <!-- JSON-LD Structured Data: Breadcrumb -->
        <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": "https://dramaspots.com"
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "${category.name}",
              "item": "https://dramaspots.com/category/${encodedCategory}"
            }
          ]
        }
        </script>
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4436674424567426"
     crossorigin="anonymous"></script>

  <!-- Favicon -->
  <link rel="icon" type="image/png" href="/assets/logo1.png" sizes="32x32" />
  <link rel="icon" type="image/x-icon" href="/favicon.ico" />

  <!-- Bootstrap CSS -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" />
  
  <!-- Google Fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap" rel="stylesheet" />
  
  <!-- Font Awesome -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css" />

  <!-- Your Custom CSS -->
  <style>

                    :root {
            --primary: #fa3577;
            --secondary: #fff;
            --accent: #ffeb3b;
            --dark: #222;
            --light: #f8f8f8;
            --gray: #888;
        }
                .bg-pink{
            background: var(--primary);
            color: var(--secondary);
        }
        .text-pink{
            color: var(--primary);
        }
        .btn-pink{
            background: var(--primary);
            color: var(--secondary);
        }
        .btn-outline-pink{
            border-color: var(--primary);
        }
        body {
        user-select: none;
            font-family: 'Montserrat', Arial, sans-serif;
            background-color: #f8f9fa;
        }
        .navbar-brand {
            font-weight: 700;
            letter-spacing: 2px;
        }
        .news-card {
            transition: box-shadow 0.2s;
        }
        .news-card:hover {
            box-shadow: 0 4px 24px rgba(0,0,0,0.12);
        }
        .category-badge {
            font-size: 0.8rem;
            margin-right: 0.5rem;
        }
        .sidebar-title {
            font-size: 1.2rem;
            font-weight: 600;
            margin-bottom: 1rem;
            letter-spacing: 1px;
        }
        .news-img {
            object-fit: cover;
            height: 220px;
            width: 100%;
        }
        .author-img {
            width: 36px;
            height: 36px;
            object-fit: cover;
            border-radius: 50%;
            margin-right: 0.5rem;
        }
        .trending-img {
            width: 60px;
            height: 60px;
            object-fit: cover;
            border-radius: 8px;
            margin-right: 0.75rem;
        }
        .newsletter-form input[type="email"] {
            border-radius: 0.25rem 0 0 0.25rem;
        }
        .newsletter-form button {
            border-radius: 0 0.25rem 0.25rem 0;
        }

        .footer { background: #222; color: #fff; padding: 40px 0 20px 0;}
        .footer a { color: var(--primary); text-decoration: none;}
        .footer a:hover { text-decoration: underline;}
        .social-icons a { color: #fff; margin-right: 12px; font-size: 1.3rem; transition: color 0.2s;}
        .social-icons a:hover { color: var(--primary);}
        .trending-img { width: 60px; height: 60px; object-fit: cover; border-radius: 8px; margin-right: 12px;}
        .newsletter-form input[type="email"] { border-radius: 20px 0 0 20px; border-right: none;}
        .newsletter-form button { border-radius: 0 20px 20px 0;}
        .category-list .list-group-item { border: none; background: transparent; padding-left: 0; font-size: 1rem;}
        .category-list .badge { background: var(--primary); color: #222;}
        .author-img { width: 40px; height: 40px; object-fit: cover; border-radius: 50%; margin-right: 10px;}
        .tag-badge { background: var(--primary); color: #222; margin: 2px 4px 2px 0; font-size: 0.70rem; border-radius: 12px; padding: 4px 10px; display: inline-block;}
        .pagination .page-link { color: #222; border-radius: 50%; margin: 0 2px;}
        .pagination .active .page-link { background: var(--primary); color: #222; border: none;}
        .ad-banner {
            background: #fff3cd;
            border: 1px solid #ffeeba;
            border-radius: 0.5rem;
            padding: 1.5rem;
            text-align: center;
            margin-bottom: 2rem;
            font-size: 1.1rem;
            color: #856404;
        }
        .breadcrumb {
            background: white;
            padding: 0;
            margin-bottom: 1.5rem;
        }
        .news-meta {
            font-size: 0.95rem;
            color: #6c757d;
        }
            
        .news-title {
            font-size: 1.35rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
        }
        .news-excerpt {
            font-size: 1.05rem;
            color: #495057;
        }
        
        .footer-link {
            color: #fff;
            text-decoration: underline;
        }

        .social-icon {
            width: 32px;
            height: 32px;
            margin-right: 0.5rem;
        }

        .ad-placeholder {
            background: #e9ecef;
            border: 2px dashed #adb5bd;
            border-radius: 0.5rem;
            height: 120px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #adb5bd;
            font-size: 1.2rem;
            margin-bottom: 2rem;
        }

        .social-icons a {
            color: #495057;
            margin-right: 0.7rem;
            font-size: 1.2rem;
            transition: color 0.2s;
        }
        .social-icons a:hover {
            color:rgb(248, 59, 154);
        }
        @media (max-width: 991.98px) {
            .news-img {
                height: 160px;
            }
            .trending-img {
                width: 48px;
                height: 48px;
            }
        }
        @media (max-width: 767.98px) {
            .news-img {
                height: 120px;
            }
            .sidebar-title {
                font-size: 1rem;
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

        .tab-nav {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100%;
            gap: 10px;
            overflow-x: scroll;

        }

        .tab-nav::-webkit-scrollbar {
            display: none;
        }

        .tab-nav a {
            font-weight: 600;
            padding: 6px 12px;
            border-radius: 4px;
            text-decoration: none;
            color: rgb(250, 217, 234);
            transition: border-color 0.3s;
        }

        .tab-nav a.active,
        .tab-nav a:hover {
            background: rgba(255, 255, 255, 0.15);
            color: #fff;
        }

        @media (max-width: 767.98px) {

            .tab-nav {
                gap: 5px;
                justify-content: left;

            }

            .tab-nav a {
                padding: 0px 5px;
                font-size: 0.9rem;
                color: rgb(250, 217, 234);
                font-weight: 500;
                border: 1px solid transparent;
                border-radius: 4px;
            }
        }

        .all {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            max-width: 100%;
            margin: 0 auto;
        }
        .articles {
            flex: 1;
            margin: 0 30px;
        }
        .aside {
            width: 300px;
            margin-right: 30px;
            height: fit-content;
            position: sticky;
            top: 100px;
            align-self: flex-start;
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
        .grid-system {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 24px;
            width: 100%;
        }
        .grid-child {
        width: 100%;
        }
        @media (max-width: 991.98px) {
            .aside { position: static; top: unset; margin-right: 0; width: 100%; }
            .all { flex-direction: column; }
            .articles { margin: 0; }
            .grid-system { grid-template-columns: 1fr; }
        }
        @media (max-width: 767.98px) {
            .tab-nav { gap: 5px; justify-content: left;}
            .tab-nav a { padding: 0px 5px; font-size: 0.9rem; color: rgb(250, 217, 234); font-weight: 500; border: 1px solid transparent; border-radius: 4px;}
            .all { display: flex; flex-direction: column; width: 100%; margin: 0px;}
            .articles { margin: 0px; width: 100%;}
            .aside { width: 100%;}
            .grid-system { grid-template-columns: 1fr; }
        }

        .fetch-more-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 32px auto 0 auto;
            font-weight: 600;
            font-size: 1.1rem;
            border-radius: 30px;
            padding: 10px 28px;
            border: 2px solid var(--primary);
            color: var(--primary);
            background: #fff;
            transition: background 0.2s, color 0.2s;
            cursor: pointer;
            box-shadow: 0 2px 8px rgba(250,53,119,0.08);
        }
        .fetch-more-btn:hover {
            background: var(--primary);
            color: #fff;
        }
        .fetch-more-btn .fa-chevron-down {
            margin-left: 10px;
            font-size: 1.2em;
        }
    </style>
    <link rel="icon" href="favicon.ico">
</head>
<body data-category="${category.name}">
<!-- Floating Back-to-Top Button -->
<button id="backToTopBtn" type="button" class="btn btn-pink shadow" style="position:fixed;bottom:32px;right:32px;z-index:1050;display:none;border-radius:50%;width:56px;height:56px;font-size:1.5rem;">
    <i class="fas fa-arrow-up"></i>
</button>
<script>
    const backToTopBtn = document.getElementById('backToTopBtn');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
            backToTopBtn.style.display = 'block';
        } else {
            backToTopBtn.style.display = 'none';
        }
    });
    backToTopBtn.addEventListener('click', function() {
        window.scrollTo({top: 0, behavior: 'smooth'});
    });
</script>
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
                    <li class="nav-item"><a class="nav-link ${category.name === 'News'?'active':''}" href="/category/News">News</a></li>
                    <li class="nav-item"><a class="nav-link" href="/">Trending</a></li>
                    <li class="nav-item"><a class="nav-link" aria-current="page"
                            href="/category/Exclusives">Exclusives <span class="exclusive-badge">Hot</span></a></li>
                    <li class="nav-item"><a class="nav-link" href="/auth">Profile</a></li>
                </ul>
            </div>
        </div>
    </nav>

    <!-- Breadcrumb -->
    <div class="container">
        <nav aria-label="breadcrumb">
            <ol class="breadcrumb mb-0 py-3">
                <li class="breadcrumb-item"><a class="text-decoration-none" href="/">Home</a></li>
                <li class="breadcrumb-item active" aria-current="page">${category.name}</li>
            </ol>
        </nav>
    </div>

    <!-- Main Content -->
    <divmy-4">
        <div class="all">
            <!-- News Articles -->
            <main class="col-lg-8 articles">

                <div id="latest-posts-list" class="grid-system g-4">
                ${
                    latest.map((l, index) =>{
                        return `
                        <!-- News Card 1 -->
                    <div class="col-md-6 grid-child">
                        <div class="card news-card h-100">
                                <div class="card-body">
                                <div class="d-flex align-items-center mt-3">
                                    <img src="${l.author.profile_pic}" class="author-img" alt="Author">
                                    <div>
                                        <span class="fw-semibold">By ${l.author.username}</span>
                                        <div class="news-meta">${timeAgo(l.published_at)} &middot; ${l.read_duration} min read</div>
                                    </div>
                                </div>                                
                                <h2 class="news-title"><a href="#" class="text-dark text-decoration-none">${l.title}</a></h2>
                            </div>
                            <img src="${l.image}" class="card-img-top news-img" alt="Celebrity News 1">
                            <div class="card-body">
                                                            ${
                            Array.from(
            new Map(
                l.subcategories.map(s => [s.category.id, s])
            ).values()
        )
                .map((s, i) =>`<span class="badge bg-${colors[s.category.id%6]} m-1 text-light category-badge">${s.category.name}</span>`).join('')
                                }
                                <p class="news-excerpt">${l.excerpt}</p>
                                                                <div>
                                ${
                            l.hashtags.map((h, i) =>`<a class="text-decoration-none" href="/hashtag/${h.name}"><span class="tag-badge">#${h.name}</span></a>`).join('')
                                }
                                </div>
                                <a href="/article/${l.slug}" class="btn btn-outline-pink btn-sm mt-2">Read More</a>
                            </div>
                            <div class="card-footer bg-transparent border-0 d-flex justify-content-between align-items-center">
                                <div class="social-icons">
                                    <a href="#" title="Share on Facebook"><i class="bi bi-facebook"></i></a>
                                    <a href="#" title="Share on Twitter"><i class="bi bi-twitter"></i></a>
                                    <a href="#" title="Share on Instagram"><i class="bi bi-instagram"></i></a>
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
                        `;
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
      </div>
                <!-- Pagination -->

                <div class="text-center">
                    <button id="fetch-more-btn" class="fetch-more-btn" type="button">
                        Fetch More <i class="fas fa-chevron-down"></i>
                    </button>
                </div>
            </main>
            <!-- Sidebar -->
            <aside class="col-lg-4 mt-5 mx-2 mt-lg-0 aside">

                <!-- Trending Now -->
                
                <div class="mb-4">
                    <div class="sidebar-title"><i class="fas fa-fire text-pink"></i> Trending Now</div>
                    <ul class="list-unstyled">
                                            ${
                            mostViewed.map(m => {
                                return `
                                <li class="d-flex align-items-center mb-3">
                            <img src="${m.image}" class="trending-img" alt="Trending 1">
                            <div>
                                <a href="/article/${m.slug}" class="fw-semibold text-dark text-decoration-none">${m.title}</a>
                                <div class="news-meta">${timeAgo(m.published_at)}</div>
                            </div>
                        </li>`;
                            }).join('')
                        }
                    </ul>
                </div>
                ${
                    !personalized.length?``:`
                    
                <div class="mb-4">
                    <div class="sidebar-title">Recommended For You</div>
                    <ul class="list-unstyled">
                                            ${
                            personalized.map(m => {
                                return `
                                <li class="d-flex align-items-center mb-3">
                            <img src="${m.image}" class="trending-img" alt="Trending 1">
                            <div>
                                <a href="/article/${m.slug}" class="fw-semibold text-dark text-decoration-none">${m.title}</a>
                                <div class="news-meta">${timeAgo(m.published_at)}</div>
                            </div>
                        </li>`;
                            }).join('')
                        }
                    </ul>
                </div>
                    `
                }

                

                <div class="mb-4">
                    <div class="sidebar-title"><i class="fas fa-list text-pink"></i> Categories</div>
                    <ul class="list-group category-list">
                        ${
                            relatedCategories.map(c => {
                                return `<li class="list-group-item d-flex justify-content-between align-items-center">
                            <a href="/category/${c.name}" class="text-decoration-none text-dark">${c.name}</a>
                            <span class="badge rounded-pill"></span>
                        </li>`;
                            }).join('')
                        }
                    </ul>
                </div>

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
                <!-- Newsletter Signup -->
                <div class="mb-4">
                    <div class="sidebar-title">Subscribe to Our Newsletter</div>
                    <form id="subsciptionForm" action="/newsletter/subscribe" method="POST"  class="newsletter-form d-flex" autocomplete="off">
                        <input name="email" type="email" class="form-control" placeholder="Your email" required>
                        <button class="btn btn-pink ms-2" type="submit">Subscribe</button>
                    </form>
                    <small class="text-muted d-block mt-2">Get weekly updates delivered to your inbox.</small>
                </div>
                <!-- Popular Tags -->
                <div class="mb-4">
                    <div class="sidebar-title">Popular Tags</div>
                    <div>
                                        ${
                            hashtags.map((h, i) =>`<a class="text-decoration-none" href="/hashtag/${h.name}"><span class="tag-badge">#${h.name}</span></a>`).join('')
                                }
                    </div>
                </div>
                <!-- Social Media Links -->
                <div class="mb-4">
                    <div class="sidebar-title">Follow Us</div>
                    <div class="social-icons">
                        <a href="#" title="Facebook"><i class="bi bi-facebook"></i></a>
                        <a href="#" title="Twitter"><i class="bi bi-twitter"></i></a>
                        <a href="#" title="Instagram"><i class="bi bi-instagram"></i></a>
                        <a href="#" title="YouTube"><i class="bi bi-youtube"></i></a>
                        <a href="#" title="TikTok"><i class="bi bi-tiktok"></i></a>
                    </div>
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

    <!-- Bootstrap JS and Icons -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css">

    <script>
        let page = 1;
        let category = document.body.dataset.category;
        const fetchMoreBtn = document.getElementById('fetch-more-btn');
        const latestPostsList = document.getElementById('latest-posts-list');
        fetchMoreBtn.addEventListener('click', async function() {
            fetchMoreBtn.disabled = true;
            fetchMoreBtn.innerHTML = 'Loading... <i class="fas fa-spinner fa-spin"></i>';
            page++;
            try {
                // You should implement this API endpoint to return more posts as JSON
 const res = await fetch(\`/category/articles/all/latest/\${category}?page=\${page}\`);
                if (!res.ok) throw new Error('Failed to fetch');
                const posts = await res.json();
                if (!posts.length) {
                    fetchMoreBtn.innerHTML = 'No more posts';
                    fetchMoreBtn.disabled = true;
                    return;
                }
                let colors = ['pink','info', 'success', 'danger', 'primary', 'secondary'];
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
                        return \`\${mins} minute\${mins > 1 ? 's' : ''} ago\`;
                    } else if (seconds < 86400) {
                        const hrs = Math.floor(seconds / 3600);
                        return \`\${hrs} hour\${hrs > 1 ? 's' : ''} ago\`;
                    } else if (daysDiff < 7) {
                        return weekdays[past.getDay()];
                    } else {
                        return past.toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                        });
                    }
                }
                let html = '';
                for (const l of posts) {
                    html += \`
                        <!-- News Card 1 -->
                    <div class="col-md-6 grid-child">
                        <div class="card news-card h-100">
                                <div class="card-body">
                                <div class="d-flex align-items-center mt-3">
                                    <img src="\${l.author.profile_pic}" class="author-img" alt="Author">
                                    <div>
                                        <span class="fw-semibold">By \${l.author.username}</span>
                                        <div class="news-meta">\${timeAgo(l.published_at)} &middot; \${l.read_duration} min read</div>
                                    </div>
                                </div>                                
                                <h2 class="news-title"><a href="#" class="text-dark text-decoration-none">\${l.title}</a></h2>
                            </div>
                            <img src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80" class="card-img-top news-img" alt="Celebrity News 1">
                            <div class="card-body">
                                                            \${
                            l.subcategories.map((s, i) =>\`<span class="badge bg-\${colors[s.category.id%6]} m-1 text-light category-badge">\${s.category.name}</span>\`).join('')
                                }
                                <p class="news-excerpt">\${l.excerpt}</p>
                                                                <div>
                                \${
                            l.hashtags.map((h, i) =>\`<a class="text-decoration-none" href="/hashtag/\${h.name}"><span class="tag-badge">#\${h.name}</span></a>\`).join('')
                                }
                                </div>
                                <a href="/article/\${l.slug}" class="btn btn-outline-pink btn-sm mt-2">Read More</a>
                            </div>
                            <div class="card-footer bg-transparent border-0 d-flex justify-content-between align-items-center">
                                <div class="social-icons">
                                    <a href="#" title="Share on Facebook"><i class="bi bi-facebook"></i></a>
                                    <a href="#" title="Share on Twitter"><i class="bi bi-twitter"></i></a>
                                    <a href="#" title="Share on Instagram"><i class="bi bi-instagram"></i></a>
                                </div>
                            </div>
                        </div>
                    </div>
                    \`;
                }
                latestPostsList.insertAdjacentHTML('beforeend', html);
                fetchMoreBtn.disabled = false;
                fetchMoreBtn.innerHTML = 'Fetch More <i class="fas fa-chevron-down"></i>';
            } catch (e) {
                fetchMoreBtn.innerHTML = 'Error. Try again';
                fetchMoreBtn.disabled = false;
            }
        });
    </script>
</body>
</html>
    `;

    res.send(html);
};