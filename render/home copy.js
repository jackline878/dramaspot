exports.renderHome = async (req, res) => {
    const data = req.data;
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

        if (seconds < 60) return 'just now';
        else if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
        else if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
        else if (daysDiff < 7 && past.getWeekNumber() === now.getWeekNumber()) return weekdays[past.getDay()];
        else return past.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    }

    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Drama Spots – Latest Celebrity Gossip, News & Trends</title>
    <meta name="google-site-verification" content="FMayT7e41khCaoYDxj7CnS1ommgl_o-PRP25KUp6qIc" />
    <meta name="description" content="Stay updated with hot gossip, breaking news, and celebrity trends from Hollywood and beyond.">
    <meta name="keywords" content="celebrity gossip, drama spots, entertainment news, trending celebrities, Hollywood, drama blog">
    <meta name="author" content="LonaTech Solutions">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="https://dramaspots.com" />

    <!-- Favicon -->
    <link rel="icon" type="image/png" href="/assets/logo1.png" sizes="32x32">
    <link rel="icon" type="image/x-icon" href="/favicon.ico">

    <!-- Open Graph Meta -->
    <meta property="og:title" content="Drama Spots – Celebrity Gossip Blog">
    <meta property="og:description" content="Stay updated with breaking celebrity news, gossip, and entertainment.">
    <meta property="og:image" content="https://dramaspots.com/assets/logo1.png">
    <meta property="og:url" content="https://dramaspots.com">
    <meta property="og:type" content="website">

    <!-- Twitter Card Meta -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="Drama Spots – Celebrity Gossip Blog">
    <meta name="twitter:description" content="Stay updated with breaking celebrity news, gossip, and entertainment.">
    <meta name="twitter:image" content="https://dramaspots.com/assets/logo1.png">

    <!-- Schema.org JSON-LD -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "DramaSpot",
      "url": "https://dramaspots.com",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://dramaspots.com/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    }
    </script>

    <script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Dramaspot",
  "url": "https://www.dramaspots.com",
  "logo": "https://dramaspots.com/assets/logo1.png",
  "sameAs": [
    "https://www.instagram.com/dramaspots254",
    "https://www.facebook.com/dramaspots254",
    "https://x.com/dramaSpot254"
  ]
}
</script>

<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4436674424567426"
     crossorigin="anonymous"></script>


    <!-- Fonts and Styles -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css?family=Montserrat:400,700&display=swap" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css" rel="stylesheet">
    

<!-- Bootstrap 5 CSS -->

    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap" rel="stylesheet">
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
    <style>
        :root {
            --primary:rgb(248, 81, 136);
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
        body {
        user-select: none;
            font-family: 'Montserrat', sans-serif;
            background: #f8f9fa;
            color: #222;
        }
        .hero-section {
            background: linear-gradient(135deg, rgba(248, 81, 137, 0.6)), url('https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80') center/cover no-repeat;
            color: #fff;
            padding: 120px 0 80px 0;
            text-align: center;
        }
        .hero-section h1 { font-size: 3rem; font-weight: 700; margin-bottom: 20px; letter-spacing: 1px;}
        .hero-section p { font-size: 1.3rem; margin-bottom: 30px;}
        .category-badge { font-size: 0.75rem; margin-right: 5px;}
        .post-card { transition: box-shadow 0.2s;}
        .post-card:hover { box-shadow: 0 4px 24px rgba(0,0,0,0.12);}
        .sidebar-widget {
            background: #fff;
            border-radius: 8px;
            padding: 24px 18px;
            margin-bottom: 32px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        .sidebar-widget h5 { font-weight: 700; margin-bottom: 18px;}
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
        @media (max-width: 991.98px) {
            .hero-section { padding: 80px 0 40px 0;}
            .sidebar-widget { padding: 18px 10px;}
        }
        @media (max-width: 767.98px) {
        
        .trending-img { width: 48px; height: 48px;}
            .hero-section h1 { font-size: 2.1rem;}
            .hero-section p { font-size: 1rem;}
            .footer { text-align: center;}
            .social-icons { margin-bottom: 16px;}
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
        .tab-nav::-webkit-scrollbar { display: none;}
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
            .category-boxes {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 1.5rem;
            margin-top: 2rem;
            margin-bottom: 2rem;
        }
        .category-box {
            flex: 1 1 140px;
            max-width: 180px;
            min-width: 120px;
            background:rgba(245, 237, 240, 0.25);
            border-radius: 1rem;
            box-shadow: 0 2px 12px rgba(233,30,99,0.08);
            text-align: center;
            padding: 1.2rem 0.5rem;
            transition: transform 0.15s, box-shadow 0.15s;
            border: none;
            cursor: pointer;
        }
        .category-box:hover {
            transform: translateY(-6px) scale(1.04);
            box-shadow: 0 6px 24px rgba(233,30,99,0.16);
            border-color: #e91e63;
        }
        .category-box .fa, .category-box .fas, .category-box .far {
            font-size: 2rem;
            margin-bottom: 0.5rem;
            color: white;
        }
        .category-box .category-title {
            font-weight: 700;
            font-size: 1.1rem;
            color: white;
        }
            
        @media (max-width: 767.98px) {
            .category-boxes {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 10px;
            margin-top: 1rem;
            margin-bottom: 1rem;
        }
        .category-box {
            background:rgba(245, 237, 240, 0.25);
            border-radius: 1rem;
            padding: 10px;
            transition: transform 0.15s, box-shadow 0.15s;
            border: none;
            cursor: pointer;
        }
        .category-box:hover {
            transform: translateY(-6px) scale(1.04);
            box-shadow: 0 6px 24px rgba(233,30,99,0.16);
            border-color: #e91e63;
        }
        .category-box .category-title {
            font-weight: 700;
            font-size: 14px;
            color: white;
        }

        }
            .hidden {
            display: none;
            }


    .hero-overlay {
      background: rgba(0, 0, 0, 0.6);
      min-height: 100vh;
      display: flex;
      align-items: center;
    }

    .hero-content {
      text-align: center;
      padding: 2rem;
    }

    .hero-title {
      font-size: 2.5rem;
      font-weight: 700;
      text-shadow: 2px 2px 6px rgba(0, 0, 0, 0.8);
    }

    .hero-subtitle {
      font-size: 1.2rem;
      margin: 1rem 0;
      text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.7);
    }

    .hero-btn {
      font-size: 1.1rem;
      padding: 0.75rem 1.5rem;
      border-radius: 30px;
    }

    .category-buttons .btn {
      margin: 0.25rem;
      border-radius: 20px;
      font-size: 0.75rem;
    }

    @media (min-width: 768px) {
      .hero-title {
        font-size: 4rem;
      }

      .hero-subtitle {
        font-size: 1.5rem;
      }

      .category-buttons .btn {
        font-size: 1rem;
      }
    }
    </style>
</head>
<body>
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
    <nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm py-3 shadow-sm sticky-top">
        <div class="container">
            <a class="navbar-brand" href="/">Drama Spots</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
                    <li class="nav-item"><a class="nav-link active" href="/">Home</a></li>
                    <li class="nav-item"><a class="nav-link" href="/category/News">News</a></li>
                    <li class="nav-item"><a class="nav-link" href="/">Trending</a></li>
                    <li class="nav-item"><a class="nav-link" aria-current="page"
                            href="/category/Exclusives">Exclusives <span class="exclusive-badge">Hot</span></a></li>
                </ul>
            </div>
        </div>
    </nav>

<!-- Search Bar -->
<div class="my-4 mx-1">
    <form class="d-flex justify-content-center" action="/search" method="get">
        <input id="search-input" class="form-control me-2" type="search" name="q" placeholder="Search celebrity news, gossip, or tags..." aria-label="Search">
        <button class="btn btn-pink" type="submit"><i class="fas fa-search"></i></button>
    </form>
</div>

<section id="search-section" class="hidden">
  <div class="container">
    <div class="row g-3" id="search-results">
      <!-- Cards will be injected here -->
    </div>
  </div>
</section>

<!-- Hero Section -->
<section class="hero-section hide">
    <div class="mx-2">
        <h1 class="hero-title">Your Daily Dose of Celebrity Drama</h1>
        <p class="hero-subtitle">Get the latest gossip, trending scandals, and viral entertainment news from Kenya and beyond.</p>
        <a href="#latest-posts" class="btn btn-pink hero-btn shadow-lg mb-3"><i class="fas fa-arrow-down"></i> Explore Latest Now</a>
                <div class="category-buttons d-flex flex-wrap justify-content-center mt-3">

                            ${data.categories.slice(0, 6).map((c, i) => {
        return `<a href="/category/${encodeURIComponent(c.name)}" class="btn btn-outline-light">
                        <div class="category-title">${c.name}</div>
                    </a>`;
    }).join('')
        }
        </div>
    </div>
</section>


    <div class="mb-5 hide">
        <div class="m-0 all">
            <main class="col-lg-8 articles">
            
            ${
                data.featured?`
                
            <h1 class="mt-3">Featured</h1>
                
                <div class="card mb-4 post-card shadow-sm">
                    <div class="card-body">
                        <div class="d-flex align-items-center mb-2">
                            <img src="${data.featured.author.profile_pic}" class="author-img" alt="Author">
                            <span class="me-2">By <strong>${data.featured.author.username}</strong></span>
                            <span class="text-muted small"><i class="far fa-clock"></i> ${timeAgo(data.featured.published_at)}</span>
                        </div>
                        <h2 class="card-title h4">${data.featured.title}</h2>
                    </div>
                    <img src="${data.featured.image}" class="card-img-top" alt="Featured Celebrity">
                    <div class="card-body">
                        <div class="mb-2">
                        ${Array.from(
            new Map(
                data.featured.subcategories.map(s => [s.category.id, s])
            ).values()
        )
                .map((s, i) => `<a class="text-decoration-none" href="/category/${s.category.name}"><span class="badge m-1 bg-${colors[s.category.id % 6]} text-light category-badge">${s.category.name}</span></a>`).join('')
                         }
                        </div>
                        <p class="card-text">${data.featured.excerpt}</p>
                        <a href="/article/${data.featured.slug}" class="btn btn-outline-pink btn-sm">Read More on this article</a>
                    </div>
                </div>
                `:``
            }
                <h2 class="mb-4 mx-2 mt-2" id="latest-posts" style="margin-top: 3rem;><i class="fas fa-bolt text-pink"></i> Latest Gossip</h2>
                <div class="grid-system" id="latest-posts-list">
                   ${data.latest.map((l, index) => {
            return `
                    <div class="col-md-6 grid-child">
                        <div class="card post-card h-100 shadow-sm">
                            <div class="card-body">
                                <div class="d-flex align-items-center mb-2">
                                    <img src="${l.author.profile_pic}" class="author-img" alt="Author">
                                    <span class="me-2">By <strong>${l.author.username}</strong></span>
                                    <span class="text-muted small"><i class="far fa-clock"></i> ${timeAgo(l.published_at)}</span>
                                </div>
                                <h5 class="card-title">${l.title}</h5>
                            </div>
                            <img src="${l.image || 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=600&q=80'}" class="card-img-top" alt="Celebrity News">
                            <div class="card-body">
                                <div class="mb-2">
                                ${Array.from(
            new Map(
                l.subcategories.map(s => [s.category.id, s])
            ).values()
        )
                .map((s, i) => `<a class="text-decoration-none" href="/category/${s.category.name}"><span class="badge bg-${colors[s.category.id % 6]} m-1 text-light category-badge">${s.category.name}</span></a>`).join('')
                      }
                                </div>
                                <p class="card-text">${l.excerpt}</p>
                                <div>
                                ${l.hashtags.map((h, i) => `<a class="text-decoration-none" href="/hashtag/${h.name}"><span class="tag-badge">#${h.name}</span></a>`).join('')
                       }
                                </div>
                                <a href="/article/${l.slug}" class="btn btn-outline-pink btn-sm mt-2">Read More on this article</a>
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
                
                <div class="text-center">
                    <button id="fetch-more-btn" class="fetch-more-btn" type="button">
                        Fetch More <i class="fas fa-chevron-down"></i>
                    </button>
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
            </main>
            <aside class="col-lg-4 mt-5 mt-lg-0 aside">

            ${
                data.mostViewed.length?`
                                <div class="sidebar-widget">
                    <h5><i class="fas fa-fire text-pink"></i> Trending Now</h5>
                    <ul class="list-unstyled">
                        ${data.mostViewed.map(m => {
            return `
                                <li class="d-flex align-items-center mb-3">
                            <img src="${m.image}" class="trending-img" alt="Trending">
                            <div>
                                <a href="/article/${m.slug}" class="fw-bold text-dark">${m.title}</a>
                                <div class="small text-muted"><i class="far fa-clock"></i>${timeAgo(m.published_at)}</div>
                            </div>
                        </li>
                                `;
        }).join('')
        }
                    </ul>
                </div>

                `:``
            }


                ${
                    data.categories.length? `
                <div class="sidebar-widget">
                    <h5><i class="fas fa-list text-pink"></i> Categories</h5>
                    <ul class="list-group category-list">
                        ${data.categories.map(c => {
            return `<li class="list-group-item d-flex justify-content-between align-items-center">
                            <a href="/category/${c.name}" class="text-decoration-none text-dark">${c.name}</a>
                            <span class="badge rounded-pill">12</span>
                        </li>`;
        }).join('')
        }
                    </ul>
                </div>
                    `:``
                }
                <div class="sidebar-widget">
                    <h5><i class="fas fa-envelope text-pink"></i> Newsletter</h5>
                    <form class="newsletter-form d-flex">
                        <input type="email" class="form-control" placeholder="Your email" required>
                        <button class="btn btn-pink" type="submit">Subscribe</button>
                    </form>
                    <small class="text-muted d-block mt-2">Get the latest gossip delivered to your inbox!</small>
                </div>
                <div class="sidebar-widget">
                    <h5><i class="fas fa-tags text-pink"></i> Popular Tags</h5>
                    <div>
                    ${data.hashtags.map((h, i) => `<a class="text-decoration-none" href="/hashtag/${h.name}"><span class="tag-badge">#${h.name}</span></a>`).join('')
        }
                    </div>
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
            </aside>
        </div>
    </div>
    <section class="bg-white py-5  hide">
        <div class="container">
            <h4 class="mb-4 text-center"><i class="fab fa-instagram text-pink"></i> Follow Us on Instagram</h4>
            <div class="row g-2 justify-content-center">
            </div>
            <div class="text-center mt-3">
                <a href="#" class="btn btn-outline-pink btn-sm"><i class="fab fa-instagram"></i> @dramaspots254</a>
            </div>
        </div>
    </section>
     
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
        let page = 1;
        const fetchMoreBtn = document.getElementById('fetch-more-btn');
        const latestPostsList = document.getElementById('latest-posts-list');
        fetchMoreBtn.addEventListener('click', async function() {
            fetchMoreBtn.disabled = true;
            fetchMoreBtn.innerHTML = 'Loading... <i class="fas fa-spinner fa-spin"></i>';
            page++;
            try {
                // You should implement this API endpoint to return more posts as JSON
                const res = await fetch('/articles/all/latest?page=' + page);
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
                    <div class="col-md-6 grid-child">
                        <div class="card post-card h-100 shadow-sm">
                            <div class="card-body">
                                <div class="d-flex align-items-center mb-2">
                                    <img src="\${l.author.profile_pic}" class="author-img" alt="Author">
                                    <span class="me-2">By <strong>\${l.author.username}</strong></span>
                                    <span class="text-muted small"><i class="far fa-clock"></i> \${timeAgo(l.published_at)}</span>
                                </div>
                                <h5 class="card-title">\${l.title}</h5>
                            </div>
                            <img src="\${l.image||'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=600&q=80'}" class="card-img-top" alt="Celebrity News">
                            <div class="card-body">
                                <div class="mb-2">
                                \${l.subcategories.map((s, i) =>\`<a class="text-decoration-none" href="/category/\${s.category.name}"><span class="badge bg-\${colors[s.category.id%6]} m-1 text-light category-badge">\${s.category.name}</span></a>\`).join('')}
                                </div>
                                <p class="card-text">\${l.excerpt}</p>
                                <div>
                                \${l.hashtags.map((h, i) =>\`<a class="text-decoration-none" href="/hashtag/\${h.name}"><span class="tag-badge">#\${h.name}</span></a>\`).join('')}
                                </div>
                                <a href="/article/\${l.slug}" class="btn btn-outline-pink btn-sm mt-2">Read More on this article</a>
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

    <script>
    
let fetching = false;
let currentPage = 1;
let loading = false;
let isLastPage = false;

async function loadMoreResults() {
  if (loading || isLastPage || !fetching) return;
  loading = true;
  currentPage++;

    const searchResults = document.getElementById("search-results");
    const query = document.getElementById('search-input').value.trim();
  try {
    const res = await fetch(\`//search/\${query}?page=\${currentPage}\`);
            const data = await res.json();
            const results = data.html;

            searchResults.innerHTML = results.length ? results : \`<p>No item found</p>\`;
    if (data.isLastPage) isLastPage = true;
  } catch (err) {
    console.error("Failed to load more:", err);
  } finally {
  }
}

window.addEventListener("scroll", () => {
  const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 500;
  if (nearBottom) {
    loadMoreResults();
  }
});
</script>

</body>
</html>
    `);
};