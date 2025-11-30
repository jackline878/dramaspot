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

    res.send(`
        <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="author" content="LonaTech Solutions

    <!--SEO TAGS -->
    <title>${category.name} | Drama Spots</title>
    <meta name="title" content="${category.name} | Drama Spots">
    <meta name="description"
        content="Explore trending news and celebrity updates in ${category.name}.">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="Dramaspots">
    <meta property="og:title" content="${category.name} | Drama Spots">
    <meta property="og:description"
        content="Explore trending news and celebrity updates in ${category.name}.">
    <meta property="og:locale" content="en_ZA">
    <meta property="og:image" content="https://dramaspots.com/assets/logo1.png">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="${category.name} | Drama Spots">
    <meta property="og:image:type" content="image/jpeg">
    <meta property="og:url" content="https://dramaspots.com/category/${encodeURIComponent(category.name)}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:site" content="@dramaSpot254">
    <meta name="twitter:title" content="${category.name} | Drama Spots">
    <meta name="twitter:description"
        content="Explore trending news and celebrity updates in ${category.name}.">
    <meta name="twitter:creator" content="@dramaSpot254">
    <meta name="twitter:image" content="https://dramaspots.com/assets/logo1.png">
    <meta name="twitter:label1" content="LonaTech Solutions">
    <meta name="twitter:data1" content="Dramaspots">
    <meta name="twitter:label2" content="Estimated Reading Time">
    <meta name="twitter:data2" content="2 minutes">
    <meta name="robots" content="index, follow">
    <meta name="google-adsense-account" content="ca-pub-4436674424567426">


<link rel="manifest" href="/manifest.json">
<link rel="manifest" href="/manifest.json">
<link rel="apple-touch-icon" href="/web-app-manifest-192x192.png">
<meta name="theme-color" content="#f3ecf0ff">

<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black">

    <!-- Favicon -->
    <link rel="icon" type="image/png" href="https://dramaspots.com/assets/logo1.png" sizes="32x32">
    <link rel="icon" type="image/x-icon" href="/favicon.ico">

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
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
    <link href="https://fonts.googleapis.com/css?family=Roboto:400,700|Lora:400,700&display=swap" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css" rel="stylesheet">

    <style>
        :root {
            --primary: #f80764;
            --red: #e50914;
            --secondary: #222;
            --accent: #f5f5f5;
            --text: #222;
            --muted: #888;
            --border: #e0e0e0;
            --bg: #fff;
        }

        * {
            box-sizing: border-box;
        }
        .bg-pink{ background: var(--primary); color: var(--secondary);}
        .text-pink{ color: var(--primary);}
        .btn-pink{ background: var(--primary); color: var(--secondary);}
        .btn-outline-pink{ border-color: var(--primary);}
        body {
            margin: 0;
            font-family: 'Roboto', Arial, sans-serif;
            background: var(--accent);
            color: var(--text);
        }

            body::-webkit-scrollbar {
      display: none;
    }
        a {
            color: #181717ff;
            text-decoration: none;
            transition: color 0.2s;
        }

        a:hover {
            color: #b0060f;
        }

        main {
            display: flex;
            max-width: 1300px;
            margin: 0.5rem auto auto auto;
            gap: 2rem;
        }

        .main-content {
            flex: 3;
            min-width: 0;
        }

        .aside-content {
            flex: 1.2;
            min-width: 320px;
            background: var(--bg);
            border-radius: 10px;
            box-shadow: 0 2px 8px #0001;
            padding: 1.5rem 1rem;
            position: sticky;
            top: 100px;
            height: fit-content;
        }

        /* Featured Section */
        .featured-section {
            margin-bottom: 2.5rem;
        }

        .featured-title {
            font-size: 2rem;
            font-family: 'Lora', serif;
            margin-bottom: 1rem;
            color: var(--red);
        }

        .featured-grid1 {
            display: grid;
            grid-template-columns: 3fr;
            gap: 1.2rem;
        }
        .featured-grid2 {
            display: grid;
            grid-template-columns: 3fr 2fr;
            gap: 1.2rem;
        }
        .featured-grid3 {
            display: grid;
            grid-template-columns: 3fr 2fr 2fr;
            gap: 1.2rem;
        }

        .featured-main {
            position: relative;
            border-radius: 12px;
            overflow: hidden;
            min-height: 340px;
            background: #000;
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
        }

        .featured-main img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            opacity: 0.85;
            transition: opacity 0.3s;
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 1;
        }

        .featured-main:hover img {
            opacity: 1;
        }

        .featured-main .overlay {
            position: relative;
            z-index: 2;
            padding: 2rem 1.5rem 1.2rem 1.5rem;
            background: linear-gradient(0deg, #000b 80%, #0000 100%);
            color: #fff;
        }

        .featured-main .category {
            background: var(--primary);
            color: #fff;
            padding: 0.2rem 0.8rem;
            border-radius: 12px;
            font-size: 0.95rem;
            display: inline-block;
            margin-bottom: 0.7rem;
        }

        .featured-main .title {
            font-size: 1.7rem;
            font-family: 'Lora', serif;
            font-weight: 700;
            margin-bottom: 0.5rem;
        }

        .featured-main .excerpt {
            font-size: 1.08rem;
            margin-bottom: 0.7rem;
            color: #fff;
            opacity: 0.95;
        }

        .featured-main .meta {
            font-size: 0.95rem;
            color: #fffc;
        }

        .featured-side {
            display: flex;
            flex-direction: column;
            gap: 1.2rem;
        }

        .featured-side-article {
            display: flex;
            gap: 0.8rem;
            background: #fff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 1px 4px #0001;
            min-height: 120px;
            flex-direction: column;
            justify-content: center;
        }

        .featured-side-article img {
            width: 100%;
            height: auto;
            object-fit: cover;
        }

        .featured-side-article .info {
            padding: 0.7rem;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }

        .featured-side-article .category {
            font-size: 0.85rem;
            color: var(--primary);
            margin-bottom: 0.3rem;
        }

        .featured-side-article .title {
            font-size: 1.05rem;
            font-weight: 700;
            color: var(--secondary);
            margin-bottom: 0.2rem;
        }

        .featured-side-article .excerpt {
            font-size: 0.92rem;
            color: #444;
            margin-bottom: 0.2rem;
        }

        .featured-side-article .meta {
            font-size: 0.85rem;
            color: var(--muted);
        }

        /* Ad Placeholder */
        .ad-placeholder {
            background: #f8f9fa;
            border: 2px dashed #bbb;
            color: #888;
            text-align: center;
            padding: 1.5rem 0.5rem;
            border-radius: 10px;
            margin: 1.5rem 0;
            font-size: 1.1rem;
            font-weight: 500;
        }

        .ad-type {
            font-size: 0.95rem;
            color: #e50914;
            font-weight: 600;
            margin-top: 0.5rem;
        }

        /* Latest Section */
        .latest-section {
            margin-bottom: 2.5rem;
        }

        .section-title {
            font-size: 1.5rem;
            font-family: 'Lora', serif;
            color: var(--secondary);
            margin-bottom: 1rem;
            border-left: 4px solid var(--primary);
            padding-left: 0.7rem;
        }

        .latest-list {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
        }

        .latest-article {
            display: flex;
            gap: 1.2rem;
            background: #fff;
            border-radius: 10px;
            box-shadow: 0 1px 4px #0001;
            overflow: hidden;
            min-height: 140px;
            transition: box-shadow 0.2s;
        }

        .latest-article:hover {
            box-shadow: 0 4px 16px #0002;
        }

        .latest-article img {
            width: 180px;
            height: 100%;
            object-fit: cover;
        }

        .latest-article .info {
            padding: 1rem 1rem 1rem 0;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }

        .latest-article .category {
            font-size: 0.9rem;
            color: var(--primary);
            margin-bottom: 0.4rem;
        }

        .latest-article .title {
            font-size: 1.2rem;
            font-weight: 700;
            color: black  !important;
            margin-bottom: 0.4rem;
        }

        .latest-article .excerpt {
            font-size: 1.02rem;
            color: #444;
            margin-bottom: 0.3rem;
        }

        .latest-article .meta {
            font-size: 0.9rem;
            color: var(--muted);
        }

        .loading {
            text-align: center;
            color: var(--muted);
            margin: 2rem 0;
        }

        .view-more-btn {
            display: flex;
            align-items: center;
            flex-direction: column;
            justify-content: center;
            font-size: 1.1rem;
            width: 100%;
            margin-top:10px;
            border: none;
            padding: 10px 28px;
            color: var(--muted);
            background: #fff;
            transition: background 0.2s, color 0.2s;
            cursor: pointer;
            box-shadow: 0 2px 8px rgba(250,53,119,0.17);
        }
        .view-more-btn:hover {
            background: var(--primary);
            color: #fff;
        }
        .view-more-btn .fa-chevron-down {
            margin-left: 10px;
            font-size: 1.1em;
        }

        
        .view-more-btn:disabled {
            background: #ccc;
            color: var(--muted);
            cursor: not-allowed;
            box-shadow: 0 2px 8px rgba(250,53,119,0);
        }

                @media (max-width: 600px) {

        .view-more-btn {
            font-size: 1.1rem;
        }

        .view-more-btn .fa-chevron-down {
            font-size: 0.9em;
    }}

        /* Categories Horizontal Scroll */
        .categories-section {
            margin: 3rem 0 2rem 0;
        }

        .categories-title {
            display: none;
            font-size: 1.3rem;
            font-family: 'Lora', serif;
            color: var(--primary);
            margin-bottom: 1.2rem;
            padding-left: 0.2rem;
        }

        .category-row {
            margin-bottom: 2.2rem;
        }

        .category-row .cat-row-title {
            font-size: 1.5rem;
            font-family: 'Lora', serif;
            display: flex;
            justify-content: space-between;
            color: var(--secondary);
            margin-bottom: 1rem;
            border-left: 4px solid var(--primary);
            padding-left: 0.7rem;
            margin-left: 1.2rem;
            margin-right: 1.2rem;
        }

        .cat-posts-scroll {
            display: flex;
            overflow-x: auto;
            padding-bottom: 0.5rem;
        }

        .cat-posts-scroll::-webkit-scrollbar {
            display: none;
        }

        .cat-post {
            min-width: 260px;
            max-width: 260px;
            background: #fff;
            border-radius: 10px;
            box-shadow: 0 1px 4px #0001;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            transition: box-shadow 0.2s;
            margin-left: 1.2rem;
        }

        .cat-post:hover {
            box-shadow: 0 4px 16px #0002;
        }

        .cat-post img {
            width: 100%;
            height: 140px;
            object-fit: cover;
        }

        .cat-post .info {
            padding: 0.8rem 1rem 0.8rem 1rem;
            display: flex;
            flex-direction: column;
            gap: 0.3rem;
        }

        .cat-post .title {
            font-size: 1.05rem;
            font-weight: 700;
            color: var(--secondary);
        }

        .cat-post .meta {
            font-size: 0.92rem;
            color: var(--muted);
        }

        /* Aside Widgets */
        .widget {
            margin-bottom: 2.2rem;
        }

        .widget-title {
            font-size: 1.15rem;
            font-weight: 700;
            color: rgb(71, 68, 68);
            margin-bottom: 1rem;
            font-family: 'Lora', serif;
        }

        .trending-list,
        .recommended-list {
            list-style: none;
            margin: 0;
            padding: 0;
        }

        .trending-list li,
        .recommended-list li {
            margin-bottom: 1.1rem;
            display: flex;
            align-items: flex-start;
            gap: 0.7rem;
        }

        .trending-list li:last-child,
        .recommended-list li:last-child {
            margin-bottom: 0;
        }

        .trending-list img,
        .recommended-list img {
            width: 60px;
            height: 60px;
            object-fit: cover;
            border-radius: 8px;
        }

        .trending-list .info,
        .recommended-list .info {
            flex: 1;
        }

        .trending-list .title,
        .recommended-list .title {
            font-size: 1rem;
            font-weight: 600;
            color: var(--secondary);
        }

        .trending-list .meta,
        .recommended-list .meta {
            font-size: 0.85rem;
            color: var(--muted);
        }

        .categories-list {
            display: flex;
            flex-wrap: wrap;
            gap: 0.6rem;
        }

        .categories-list a {
            background: var(--accent);
            color: var(--secondary);
            padding: 0.3rem 0.9rem;
            border-radius: 14px;
            font-size: 0.98rem;
            border: 1px solid var(--border);
            margin-bottom: 0.3rem;
            transition: background 0.2s;
        }

        .categories-list a:hover {
            background: var(--primary);
            color: #fff;
        }

        .hashtags-list {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
        }

        .hashtags-list a {
            background: #f0f0f0;
            color: var(--primary);
            padding: 0.2rem 0.7rem;
            border-radius: 12px;
            font-size: 0.95rem;
            border: 1px solid #eee;
            margin-bottom: 0.2rem;
            transition: background 0.2s;
        }

        .hashtags-list a:hover {
            background: var(--primary);
            color: #fff;
        }

        /* Responsive */
        @media (max-width: 1100px) {
            main {
                padding: 0 0.5rem;
                flex-direction: column;
            }

            .aside-content {
                position: static;
                width: 100%;
                min-width: 0;
                margin-top: 2rem;
            }
        }

        @media (max-width: 800px) {
                        main {
                padding: 0 0.5rem;
            }
            .featured-grid {
                grid-template-columns: 1fr;
            }

            .featured-side {
                gap: 1rem;
            }

            .featured-side-article {
                flex: 1;
                min-width: 0;
            }

            .latest-article img {
                width: 120px;
            }

            .cat-post {
                min-width: 180px;
                max-width: 180px;
            }

            .cat-post img {
                height: 100px;
            }
        }

        @media (max-width: 600px) {
            main {
                padding: 0 0.5rem;
            }

            .aside-content {
                padding: 1rem 0.5rem;
            }

            .cat-post {
                min-width: 140px;
                max-width: 140px;
                margin-left: 0.5rem;
            }

            .cat-post img {
                height: 80px;
            }

            .cat-post .meta {
            font-size: 0.62rem;
            }
            .category-row .cat-row-title {
                margin-left: 10px;
            font-size: 1rem;
            }
            .cat-post .title {
            font-size: 0.8rem;
            }

            .trending-list .title,
            .recommended-list .title {
            font-size: 0.85rem;
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

        @media (max-width: 600px) {
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

            .latest-article {
                flex-direction: column;
            }

            .latest-article img {
                width: 100%;
                height: auto;
                object-fit: cover;
            }

            .latest-article .info {
                padding: 1rem;
            }

            .latest-article .title {
                font-size: 1.2rem;
                font-weight: 700;
                color: black;
                margin-bottom: 0.4rem;
            }

            .latest-article .excerpt {
                font-size: 1.02rem;
                color: #444;
                margin-bottom: 0.3rem;
            }

            .latest-article .meta {
                font-size: 0.9rem;
                color: var(--muted);
            }
        }

        @media (min-width: 600px) {

            .latest-article {
                display: flex;
                flex-direction: row;
                justify-content: start;
                align-items: center;
            }

            .latest-article img {
                padding: 0;
                margin: 0;
                width: 200px;
                height: 100%
            }
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
        .hero-section {
            color: #fff;
            padding: 30px 0 20px 0;
            text-align: center;
        }
            .webp .hero-section {
    background: linear-gradient(135deg, rgba(248, 81, 137, 0.6)), url('https://res.cloudinary.com/drltycycg/image/upload/f_webp/v1753393510/cover_brh6js.png') center/cover no-repeat;
}

.no-webp .hero-section {
    background: linear-gradient(135deg, rgba(248, 81, 137, 0.6)), url('https://res.cloudinary.com/drltycycg/image/upload/v1753393510/cover_brh6js.png') center/cover no-repeat;
}

        .hero-section h1 { font-size: 3rem; font-weight: 700; margin-bottom: 20px; letter-spacing: 1px;}
        .hero-section p { font-size: 1.3rem; margin-bottom: 30px;}
        .category-badge { font-size: 0.75rem; margin-right: 5px;}
        .hero-overlay {
      background: rgba(0, 0, 0, 0.6);
      min-height: 100vh;
      display: flex;
      align-items: center;
    }
    .heros {
        width: 95%;
        position: relative;
    }

    .hero-title {
      font-size: 1.8rem;
      font-weight: 700;
      text-shadow: 2px 2px 6px rgba(0, 0, 0, 0.47);
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

    .search-bar {
        width: 450px;
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
    @media (max-width: 768px) {
.hero-title {
  font-size: 2rem !important;
}

}

    </style>
</head>


<body data-category="${category.name}">

    <nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm py-3 shadow-sm sticky-top">
        <div class="container">
            <a class="navbar-brand" href="/">Drama Spots</a>

            <div class="">
            <button class="btn bg-white shadow-sm me-2" type="button" data-bs-toggle="collapse" data-bs-target="#seachBar">
                <i class="bi bi-search"></i>
            </button>

            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
           </div>

            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
                    <li class="nav-item"><a class="nav-link active" href="/">Home</a></li>
                    <li class="nav-item"><a class="nav-link" href="/category/News">News</a></li>
                    <li class="nav-item"><a class="nav-link" href="/auth">Profile</a></li>
                    <li class="nav-item"><a class="nav-link" href="/about">about us</a></li>
                    <li class="nav-item"><a class="nav-link" href="/contact">Contact us</a></li>
                </ul>
            </div>
        </div>
        <!-- Search Bar -->
<div class="mt-1 mx-3 search-bar collapse search-bar-collapse"" id="seachBar">
    <form class="d-flex justify-content-center" action="/search" method="get">
        <input id="search-input" class="form-control me-2" type="search" name="q" placeholder="Search celebrity news, gossip, or tags..." aria-label="Search">
        <button class="btn btn-pink" type="submit"><i class="fas fa-search"></i></button>
    </form>
</div>
    </nav>

    <section class=" mt-3">
    <div class="ms-2">
        <h1 class="hero-title">${category.name}</h1>
    </div>
</section>
    <main>
        <section class="main-content">




            <!-- Latest Section -->
            <section class="latest-section" id="latest-posts">
                <div class="section-title">Latest</div>
                <div class="latest-list" id="latest-list">
                ${latest.map((l, index) => {
            return `
                    <article class="latest-article">
                        <picture>
  <source srcset="/image/convert?url=${l.image}&format=avif" type="image/avif">
  <source srcset="/image/convert?url=${l.image}&format=webp" type="image/webp">
  <img src="${l.image}" alt="${l.title}">
</picture>

                        <div class="info">
                        ${Array.from(
                new Map(
                    l.subcategories.map(s => [s.category.id, s])
                ).values()
            )
                    .map((s, i) => `<a class="text-decoration-none" href="/category/${s.category.name}"><span class="badge text-pink m-1 category-badge">${s.category.name}</span></a>`).join('')
                }
                        <div class="title"><a>${l.title}</a></div>                        
                        <div class="excerpt">${l.excerpt}</div>
                        <div class="meta">By ${l.author.username} • ${timeAgo(l.published_at)}</div>
                        <a id="reading" href="/article/${l.slug}" class="btn btn-pink text-white btn-sm px-4 py-2 shadow-sm rounded-pill mt-3">  
                            <i class="bi bi-book"></i> Read Full Article
                        </a>

                        </div>
                </article>

                
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
                <div class="loading" id="loading" style="display:none;">
                    <i class="fas fa-spinner fa-spin"></i> Loading more ...
                </div>
                
                <button class="view-more-btn" id="view-more-btn">View More <i class="fas fa-chevron-down"></i></button>
            </section>

        </section>
        <aside class="aside-content">
            <!-- Trending Widget -->

             ${mostViewed.length ? `
                  <div class="widget">
                <div class="widget-title"><i class="fas fa-fire"></i> Trending</div>
                <ul class="trending-list">

                                 ${data.mostViewed.map(m => {
            return `<li>
                        <picture>
  <source srcset="/image/convert?url=${m.image}&format=avif" type="image/avif">
  <source srcset="/image/convert?url=${m.image}&format=webp" type="image/webp">
  <img src="${m.image}" alt="${m.title}">
</picture>
                        <div class="info">
                            <div class="title"><a href="/article/${m.slug}">${m.title}</a></div>
                            <div class="meta">${timeAgo(m.published_at)}</div>
                        </div>
                    </li>
                                `;
        }).join('')
            }
                </ul>
            </div>
                           </ul>
                </div>

                `: ``
        }

             ${personalized.length ? `
            <!-- Recommended Widget -->
            <div class="widget">
                <div class="widget-title"><i class="fas fa-thumbs-up"></i> Recommended</div>
                <ul class="recommended-list">

                                 ${data.personalized.map(m => {
            return `<li>

                            <picture>
  <source srcset="/image/convert?url=${m.image}&format=avif" type="image/avif">
  <source srcset="/image/convert?url=${m.image}&format=webp" type="image/webp">
  <img src="${m.image}" alt="Featured Image">
</picture>

                        <div class="info">
                            <div class="title"><a href="/article/${m.slug}">${m.title}</a></div>
                            <div class="meta">${timeAgo(m.published_at)}</div>
                        </div>
                    </li>
                    `;
        }).join('')
            }
                </ul>
            </div>
                           </ul>
                </div>

                `: ``
        }
          
                            ${relatedCategories.length ? `
            <!-- Categories Widget -->
            <div class="widget">
                <div class="widget-title"><i class="fas fa-list"></i> Categories</div>
                <div class="categories-list">
                        ${relatedCategories.map(c => {
            return `<li class="list-group-item d-flex justify-content-between align-items-center">
                            <a href="/category/${c.name}">${c.name}</a>
                        </li>`;
        }).join('')
            }
                    </div>
                </div>
                    `: ``
        }

                        <div class="sidebar-widget">
                    <h5><i class="fas fa-envelope text-pink"></i> Newsletter</h5>
                    <form class="newsletter-form d-flex">
                        <input type="email" class="form-control" placeholder="Your email" required>
                        <button class="btn btn-pink" type="submit">Subscribe</button>
                    </form>
                    <small class="text-muted d-block mt-2">Get the latest gossip delivered to your inbox!</small>
                </div>
            <!-- Trending Hashtags Widget -->
            <div class="widget">
                <div class="widget-title"><i class="fas fa-hashtag"></i> Trending Hashtags</div>
                <div class="hashtags-list">
                ${hashtags.map((h, i) => `<a class="text-decoration-none" href="/hashtag/${h.name}">#${h.name}</a>`).join('')
        }
                </div>
            </div>
            
        </aside>
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
  (function () {
    var img = new Image();
    img.onload = function () {
      if (img.width > 0 && img.height > 0) {
        document.documentElement.classList.add('webp');
      } else {
        document.documentElement.classList.add('no-webp');
      }
    };
    img.onerror = function () {
      document.documentElement.classList.add('no-webp');
    };
    img.src = "data:image/webp;base64,UklGRiIAAABXRUJQVlA4TCEAAAAvAAAAAAfQ//73v/+BiOh/AAA=";
  })();
  </script>
    <script>

        let latestPage = 1;
        let category = document.body.dataset.category;
        let loading = false;

        function renderLatestArticles(articles) {
            const list = document.getElementById('latest-list');

            
            articles.forEach(article => {
                const el = document.createElement('article');
                el.className = 'latest-article';
                el.innerHTML = \`
                                                                <picture>
  <source srcset="/image/convert?url=\${article.image}&format=avif" type="image/avif">
  <source srcset="/image/convert?url=\${article.image}&format=webp" type="image/webp">
  <img src="\${article.image}" alt="\${article.title}">
</picture>
                    <div class="info">
                        \${Array.from(
                new Map(
                    article.subcategories.map(s => [s.category.id, s])
                ).values()
            )
                    .map((s, i) => \`<a class="text-decoration-none" href="/category/\${s.category.name}"><span class="badge text-pink m-1 category-badge">\${s.category.name}</span></a>\`).join('')
                }
                        <div class="title"><a href="#">\${article.title}</a></div>                        
                        <div class="excerpt">\${article.excerpt}</div>
                        <div class="meta">By \${article.author.username} • \${timeAgo(article.published_at)}</div>
                        <a id="reading" href="/article/\${article.slug}" class="btn btn-pink text-white btn-sm px-4 py-2 shadow-sm rounded-pill mt-3">  
                            <i class="bi bi-book"></i> Read Full Article
                        </a>

                    </div>
                \`;
                list.appendChild(el);
            });
        }

        async function loadMoreLatest() {
            if (loading) return;

            loading = true;
            document.getElementById('loading').style.display = 'block';
// You should implement this API endpoint to return more posts as JSON
               const res = await fetch(\`/category/articles/all/latest/\${category}?page=\${latestPage}\`);
                //if (!res.ok) throw new Error('Failed to fetch');
                const posts = await res.json();
                
                if (!posts.length) {
                    document.getElementById('view-more-btn').disabled = true;
            document.getElementById('loading').style.display = 'none';
                    document.getElementById('view-more-btn').innerText = "No More News";
                    loading = false;
                    return;
                }
                renderLatestArticles(posts);
                loading = false;
                latestPage++;
                document.getElementById('loading').style.display = 'none';

        }

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

        // Initial load
        document.addEventListener('DOMContentLoaded', () => {
            latestPage++;
            document.getElementById('view-more-btn').addEventListener('click', loadMoreLatest);
        });
    </script>
</body>

</html>
        `);
};