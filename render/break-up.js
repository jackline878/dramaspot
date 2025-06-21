const express = require('express');
const { Category, Article } = require('../models'); // Adjust path as needed


exports.breakUp = async (req, res) => {
  try {
    // Fetch all articles
    const category = req.category;
    const articles = req.articles

    if (!articles || articles.length === 0) {
      return res.status(404).json({ error: 'No articles found' });
    }

    let htmlData = `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Celebrity Buzz - Gossip Blog</title>
    <meta name="description" content="Stay updated with the latest celebrity gossip, news, and trends.">
    <link rel="icon" href="favicon.ico">
    <!-- Bootstrap 5 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap" rel="stylesheet">
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4436674424567426"
     crossorigin="anonymous"></script>

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
            font-family: 'Montserrat', sans-serif;
            background: #f8f9fa;
            color: #222;
        }

        .hero-section {
            background: linear-gradient(rgba(0,0,0,0.5),rgba(0,0,0,0.5)), url('https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=1500&q=80') center/cover no-repeat;
            color: #fff;
            padding: 120px 0 80px 0;
            text-align: center;
        }
        .hero-section h1 {
            font-size: 3rem;
            font-weight: 700;
            margin-bottom: 20px;
            letter-spacing: 1px;
        }
        .hero-section p {
            font-size: 1.3rem;
            margin-bottom: 30px;
        }
        .category-badge {
            font-size: 0.85rem;
            margin-right: 5px;
        }
        .post-card {
            transition: box-shadow 0.2s;
        }
        .post-card:hover {
            box-shadow: 0 4px 24px rgba(0,0,0,0.12);
        }
        .sidebar-widget {
            background: #fff;
            border-radius: 8px;
            padding: 24px 18px;
            margin-bottom: 32px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        .sidebar-widget h5 {
            font-weight: 700;
            margin-bottom: 18px;
        }
        .footer {
            background: #222;
            color: #fff;
            padding: 40px 0 20px 0;
        }
        .footer a {
            color: var(--primary);
            text-decoration: none;
        }
        .footer a:hover {
            text-decoration: underline;
        }
        .social-icons a {
            color: #fff;
            margin-right: 12px;
            font-size: 1.3rem;
            transition: color 0.2s;
        }
        .social-icons a:hover {
            color: var(--primary);
        }
        .trending-img {
            width: 60px;
            height: 60px;
            object-fit: cover;
            border-radius: 8px;
            margin-right: 12px;
        }
        .newsletter-form input[type="email"] {
            border-radius: 20px 0 0 20px;
            border-right: none;
        }
        .newsletter-form button {
            border-radius: 0 20px 20px 0;
        }
        .category-list .list-group-item {
            border: none;
            background: transparent;
            padding-left: 0;
            font-size: 1rem;
        }
        .category-list .badge {
            background: var(--primary);
            color: #222;
        }
        .author-img {
            width: 40px;
            height: 40px;
            object-fit: cover;
            border-radius: 50%;
            margin-right: 10px;
        }
        .tag-badge {
            background: var(--primary);
            color: #222;
            margin: 2px 4px 2px 0;
            font-size: 0.85rem;
            border-radius: 12px;
            padding: 4px 10px;
            display: inline-block;
        }
        .pagination .page-link {
            color: #222;
            border-radius: 50%;
            margin: 0 2px;
        }
        .pagination .active .page-link {
            background: var(--primary);
            color: #222;
            border: none;
        }
        @media (max-width: 991.98px) {
            .hero-section {
                padding: 80px 0 40px 0;
            }
            .sidebar-widget {
                padding: 18px 10px;
            }
        }
        @media (max-width: 767.98px) {
            .hero-section h1 {
                font-size: 2.1rem;
            }
            .hero-section p {
                font-size: 1rem;
            }
            .footer {
                text-align: center;
            }
            .social-icons {
                margin-bottom: 16px;
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


        .all {
            display: flex;
            align-items: flex-start;
            max-width: 1200px;
            margin: 0 auto;
        }

        .articles {
            flex: 1;
            padding: 20px;
        }

        .aside {
            width: 300px;
            height: fit-content;
            position: sticky;
            top: 100px;
            /* distance from top of viewport */
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

            all {
            display: flex;
            flex-direction: column;
            }
        }
    </style>
</head>
<body>
    <nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm py-3 shadow-sm sticky-top">
        <div class="container">
            <a class="navbar-brand" href="#">Celebrity Gossip</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
                    <li class="nav-item"><a class="nav-link" href="/">Home</a></li>
                    <li class="nav-item"><a class="nav-link" href="/news.html">News</a></li>
                    <li class="nav-item"><a class="nav-link" href="/trending.html">Trending</a></li>
                    <li class="nav-item"><a class="nav-link active" aria-current="page"
                            href="/exclusives.html">Exclusives <span class="exclusive-badge">Hot</span></a></li>
                    <li class="nav-item"><a class="nav-link" href="/about.html">About</a></li>
                    <li class="nav-item"><a class="nav-link" href="/contact.html">Contact</a></li>
                </ul>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <section class="hero-section">
        <div class="container">
            <h1>Welcome to Celebrity Buzz</h1>
            <p>Your daily dose of the hottest celebrity gossip, news, and trends. Stay tuned for exclusive scoops, interviews, and more!</p>
            <a href="#latest-posts" class="btn btn-pink btn-lg shadow">Read Latest Gossip</a>
        </div>
    </section>

    <!-- Main Content -->
    <div class="my-5">
        <div class="row all">
            <!-- Main Blog Posts -->
            <main class="col-lg-8 articles">
                <!-- Featured Post -->
                <div class="card mb-4 post-card shadow-sm">
                    <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80" class="card-img-top" alt="Featured Celebrity">
                    <div class="card-body">
                        <div class="mb-2">
                            <span class="badge bg-pink text-dark category-badge">Exclusive</span>
                            <span class="badge bg-secondary category-badge">Interview</span>
                        </div>
                        <h2 class="card-title h4">Inside the Life of Hollywood's Rising Star: Emma Stone</h2>
                        <div class="d-flex align-items-center mb-2">
                            <img src="https://randomuser.me/api/portraits/women/44.jpg" class="author-img" alt="Author">
                            <span class="me-2">By <strong>Jane Doe</strong></span>
                            <span class="text-muted small"><i class="far fa-clock"></i> 2 hours ago</span>
                        </div>
                        <p class="card-text">Emma Stone opens up about her journey, challenges, and what’s next in her career. Get the inside scoop on her latest projects and personal life in this exclusive interview.</p>
                        <a href="#" class="btn btn-outline-pink btn-sm">Read More</a>
                    </div>
                </div>

                <!-- Latest Posts -->
                <h3 class="mb-4" id="latest-posts">Latest Gossip</h3>
                <div class="row g-4">
                    <!-- Post 1 -->
                    <div class="col-md-6">
                        <div class="card post-card h-100 shadow-sm">
                            <img src="https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=600&q=80" class="card-img-top" alt="Celebrity News">
                            <div class="card-body">
                                <div class="mb-2">
                                    <span class="badge bg-danger category-badge">Scandal</span>
                                    <span class="badge bg-info text-dark category-badge">Rumor</span>
                                </div>
                                <h5 class="card-title">Is Chris Evans Secretly Dating Again?</h5>
                                <div class="d-flex align-items-center mb-2">
                                    <img src="https://randomuser.me/api/portraits/men/32.jpg" class="author-img" alt="Author">
                                    <span class="me-2">By <strong>Mike Lee</strong></span>
                                    <span class="text-muted small"><i class="far fa-clock"></i> 4 hours ago</span>
                                </div>
                                <p class="card-text">Rumors are swirling about Chris Evans’ love life. Find out who he’s been spotted with and what insiders are saying.</p>
                                <div>
                                    <span class="tag-badge">Chris Evans</span>
                                    <span class="tag-badge">Dating</span>
                                    <span class="tag-badge">Hollywood</span>
                                </div>
                                <a href="#" class="btn btn-outline-pink btn-sm mt-2">Read More</a>
                            </div>
                        </div>
                    </div>
                    <!-- Post 2 -->
                    <div class="col-md-6">
                        <div class="card post-card h-100 shadow-sm">
                            <img src="https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=600&q=80" class="card-img-top" alt="Celebrity News">
                            <div class="card-body">
                                <div class="mb-2">
                                    <span class="badge bg-success category-badge">Fashion</span>
                                    <span class="badge bg-pink text-dark category-badge">Red Carpet</span>
                                </div>
                                <h5 class="card-title">Zendaya Stuns at the Met Gala 2024</h5>
                                <div class="d-flex align-items-center mb-2">
                                    <img src="https://randomuser.me/api/portraits/women/65.jpg" class="author-img" alt="Author">
                                    <span class="me-2">By <strong>Lisa Ray</strong></span>
                                    <span class="text-muted small"><i class="far fa-clock"></i> 6 hours ago</span>
                                </div>
                                <p class="card-text">Zendaya’s Met Gala look has everyone talking. See her breathtaking outfit and the reactions from fans and critics alike.</p>
                                <div>
                                    <span class="tag-badge">Zendaya</span>
                                    <span class="tag-badge">Met Gala</span>
                                    <span class="tag-badge">Fashion</span>
                                </div>
                                <a href="#" class="btn btn-outline-pink btn-sm mt-2">Read More</a>
                            </div>
                        </div>
                    </div>
                    <!-- Post 3 -->
                    <div class="col-md-6">
                        <div class="card post-card h-100 shadow-sm">
                            <img src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80" class="card-img-top" alt="Celebrity News">
                            <div class="card-body">
                                <div class="mb-2">
                                    <span class="badge bg-primary category-badge">Music</span>
                                    <span class="badge bg-danger category-badge">Breakup</span>
                                </div>
                                <h5 class="card-title">Taylor Swift and Joe Alwyn: It's Over?</h5>
                                <div class="d-flex align-items-center mb-2">
                                    <img src="https://randomuser.me/api/portraits/men/45.jpg" class="author-img" alt="Author">
                                    <span class="me-2">By <strong>Sam Carter</strong></span>
                                    <span class="text-muted small"><i class="far fa-clock"></i> 8 hours ago</span>
                                </div>
                                <p class="card-text">Sources claim Taylor Swift and Joe Alwyn have called it quits. Get the details on what led to the rumored breakup.</p>
                                <div>
                                    <span class="tag-badge">Taylor Swift</span>
                                    <span class="tag-badge">Breakup</span>
                                    <span class="tag-badge">Music</span>
                                </div>
                                <a href="#" class="btn btn-outline-pink btn-sm mt-2">Read More</a>
                            </div>
                        </div>
                    </div>
                    <!-- Post 4 -->
                    <div class="col-md-6">
                        <div class="card post-card h-100 shadow-sm">
                            <img src="https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80" class="card-img-top" alt="Celebrity News">
                            <div class="card-body">
                                <div class="mb-2">
                                    <span class="badge bg-info text-dark category-badge">TV</span>
                                    <span class="badge bg-success category-badge">Premiere</span>
                                </div>
                                <h5 class="card-title">Stranger Things Cast Reunites for Season 5</h5>
                                <div class="d-flex align-items-center mb-2">
                                    <img src="https://randomuser.me/api/portraits/women/22.jpg" class="author-img" alt="Author">
                                    <span class="me-2">By <strong>Anna Kim</strong></span>
                                    <span class="text-muted small"><i class="far fa-clock"></i> 10 hours ago</span>
                                </div>
                                <p class="card-text">The beloved cast of Stranger Things is back together for the highly anticipated fifth season. See exclusive behind-the-scenes photos!</p>
                                <div>
                                    <span class="tag-badge">Stranger Things</span>
                                    <span class="tag-badge">TV</span>
                                    <span class="tag-badge">Premiere</span>
                                </div>
                                <a href="#" class="btn btn-outline-pink btn-sm mt-2">Read More</a>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Pagination -->
                <nav aria-label="Page navigation" class="mt-5">
                    <ul class="pagination justify-content-center">
                        <li class="page-item disabled"><a class="page-link" href="#" tabindex="-1">&laquo;</a></li>
                        <li class="page-item active"><a class="page-link" href="#">1</a></li>
                        <li class="page-item"><a class="page-link" href="#">2</a></li>
                        <li class="page-item"><a class="page-link" href="#">3</a></li>
                        <li class="page-item"><a class="page-link" href="#">&raquo;</a></li>
                    </ul>
                </nav>
            </main>

            <!-- Sidebar -->
            <aside class="col-lg-4 mt-5 mt-lg-0 aside">
                <!-- Trending Posts Widget -->
                <div class="sidebar-widget">
                    <h5><i class="fas fa-fire text-pink"></i> Trending Now</h5>
                    <ul class="list-unstyled">
                        <li class="d-flex align-items-center mb-3">
                            <img src="https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=60&q=80" class="trending-img" alt="Trending">
                            <div>
                                <a href="#" class="fw-bold text-dark">Selena Gomez's New Album Breaks Records</a>
                                <div class="small text-muted"><i class="far fa-clock"></i> 1 hour ago</div>
                            </div>
                        </li>
                        <li class="d-flex align-items-center mb-3">
                            <img src="https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=60&q=80" class="trending-img" alt="Trending">
                            <div>
                                <a href="#" class="fw-bold text-dark">Brad Pitt Spotted with Mystery Woman</a>
                                <div class="small text-muted"><i class="far fa-clock"></i> 3 hours ago</div>
                            </div>
                        </li>
                        <li class="d-flex align-items-center mb-3">
                            <img src="https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=60&q=80" class="trending-img" alt="Trending">
                            <div>
                                <a href="#" class="fw-bold text-dark">Ariana Grande's Secret Wedding</a>
                                <div class="small text-muted"><i class="far fa-clock"></i> 5 hours ago</div>
                            </div>
                        </li>
                        <li class="d-flex align-items-center">
                            <img src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=60&q=80" class="trending-img" alt="Trending">
                            <div>
                                <a href="#" class="fw-bold text-dark">Kanye West Announces World Tour</a>
                                <div class="small text-muted"><i class="far fa-clock"></i> 7 hours ago</div>
                            </div>
                        </li>
                    </ul>
                </div>

                <!-- Categories Widget -->
                <div class="sidebar-widget">
                    <h5><i class="fas fa-list text-pink"></i> Categories</h5>
                    <ul class="list-group category-list">
                        <li class="list-group-item d-flex justify-content-between align-items-center">
                            Scandals
                            <span class="badge rounded-pill">12</span>
                        </li>
                        <li class="list-group-item d-flex justify-content-between align-items-center">
                            Fashion
                            <span class="badge rounded-pill">8</span>
                        </li>
                        <li class="list-group-item d-flex justify-content-between align-items-center">
                            Music
                            <span class="badge rounded-pill">15</span>
                        </li>
                        <li class="list-group-item d-flex justify-content-between align-items-center">
                            TV & Movies
                            <span class="badge rounded-pill">10</span>
                        </li>
                        <li class="list-group-item d-flex justify-content-between align-items-center">
                            Relationships
                            <span class="badge rounded-pill">7</span>
                        </li>
                        <li class="list-group-item d-flex justify-content-between align-items-center">
                            Interviews
                            <span class="badge rounded-pill">5</span>
                        </li>
                    </ul>
                </div>

                <!-- Newsletter Widget -->
                <div class="sidebar-widget">
                    <h5><i class="fas fa-envelope text-pink"></i> Newsletter</h5>
                    <form class="newsletter-form d-flex">
                        <input type="email" class="form-control" placeholder="Your email" required>
                        <button class="btn btn-pink" type="submit">Subscribe</button>
                    </form>
                    <small class="text-muted d-block mt-2">Get the latest gossip delivered to your inbox!</small>
                </div>

                <!-- Tags Widget -->
                <div class="sidebar-widget">
                    <h5><i class="fas fa-tags text-pink"></i> Popular Tags</h5>
                    <div>
                        <span class="tag-badge">Hollywood</span>
                        <span class="tag-badge">Red Carpet</span>
                        <span class="tag-badge">Scandal</span>
                        <span class="tag-badge">Music</span>
                        <span class="tag-badge">Fashion</span>
                        <span class="tag-badge">Breakup</span>
                        <span class="tag-badge">Award</span>
                        <span class="tag-badge">Premiere</span>
                        <span class="tag-badge">Rumor</span>
                        <span class="tag-badge">Exclusive</span>
                    </div>
                </div>
            </aside>
        </div>
    </div>

    <!-- Instagram Gallery Section -->
    <section class="bg-white py-5">
        <div class="container">
            <h4 class="mb-4 text-center"><i class="fab fa-instagram text-pink"></i> Follow Us on Instagram</h4>
            <div class="row g-2 justify-content-center">
                <div class="col-4 col-md-2">
                    <img src="https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=300&q=80" class="img-fluid rounded" alt="Instagram 1">
                </div>
                <div class="col-4 col-md-2">
                    <img src="https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=300&q=80" class="img-fluid rounded" alt="Instagram 2">
                </div>
                <div class="col-4 col-md-2">
                    <img src="https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=300&q=80" class="img-fluid rounded" alt="Instagram 3">
                </div>
                <div class="col-4 col-md-2 d-none d-md-block">
                    <img src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=300&q=80" class="img-fluid rounded" alt="Instagram 4">
                </div>
                <div class="col-4 col-md-2 d-none d-md-block">
                    <img src="https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=300&q=80" class="img-fluid rounded" alt="Instagram 5">
                </div>
                <div class="col-4 col-md-2 d-none d-md-block">
                    <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80" class="img-fluid rounded" alt="Instagram 6">
                </div>
            </div>
            <div class="text-center mt-3">
                <a href="#" class="btn btn-outline-pink btn-sm"><i class="fab fa-instagram"></i> @celebritybuzz</a>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="footer mt-5">
        <div class="container">
            <div class="row">
                <!-- About -->
                <div class="col-md-4 mb-4 mb-md-0">
                    <h5 class="mb-3">About Celebrity Buzz</h5>
                    <p>Celebrity Buzz is your go-to source for the latest celebrity gossip, news, and trends. We bring you exclusive stories, interviews, and behind-the-scenes scoops from Hollywood and beyond.</p>
                </div>
                <!-- Quick Links -->
                <div class="col-md-4 mb-4 mb-md-0">
                    <h5 class="mb-3">Quick Links</h5>
                    <ul class="list-unstyled">
                        <li><a href="#">Home</a></li>
                        <li><a href="#">Trending</a></li>
                        <li><a href="#">Categories</a></li>
                        <li><a href="#">About</a></li>
                        <li><a href="#">Contact</a></li>
                        <li><a href="#">Privacy Policy</a></li>
                    </ul>
                </div>
                <!-- Social & Newsletter -->
                <div class="col-md-4">
                    <h5 class="mb-3">Stay Connected</h5>
                    <div class="social-icons mb-3">
                        <a href="#" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
                        <a href="#" aria-label="Twitter"><i class="fab fa-twitter"></i></a>
                        <a href="#" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
                        <a href="#" aria-label="YouTube"><i class="fab fa-youtube"></i></a>
                    </div>
                    <form class="newsletter-form d-flex">
                        <input type="email" class="form-control" placeholder="Your email" required>
                        <button class="btn btn-pink" type="submit">Subscribe</button>
                    </form>
                </div>
            </div>
            <hr class="my-4">
            <div class="text-center small">
                &copy; 2024 Celebrity Buzz. All rights reserved. | Designed by Celebrity Buzz Team
            </div>
        </div>
    </footer>

    <!-- Bootstrap 5 JS and dependencies -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
    `;
    
    res.send(htmlData);
  } catch (error) {
    console.error('Error breaking up articles:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}