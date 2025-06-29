const { Category, Article } = require('../models');
const express = require('express');

exports.renderArticle = async (req, res) => {
    try {
        const { article, categories, mostViewed, recommended, related } = req.data;
        const userId = req.userId;

        if (!article) {
            return res.status(404).json({ error: 'Article not found' });
        }

        // Related articles structured data
        const relatedStructuredData = (related || []).map((r, i) => ({
            "@type": "ListItem",
            "position": i + 1,
            "name": r.title,
            "item": `https://dramaspots.com/article/${r.slug}`
        }));

        function generateEmbedHTML(contentData) {
            const link = contentData.url || '';
            const caption = contentData.caption || '';
            const align = contentData.align || 'mx-auto';
            const captionHTML = caption ? `<p class="text-muted small text-center">${caption}</p>` : '';

            // YouTube Embed
            if (/youtube\.com|youtu\.be/.test(link)) {
                const videoIdMatch = link.match(
                    /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
                );
                const videoId = videoIdMatch?.[1];

                if (!videoId) return `<p class="text-danger">Invalid YouTube link.</p>`;


                return `
      <div class="ratio ratio-16x9 mb-3 ${align}">
        <iframe 
          src="https://www.youtube.com/embed/${videoId}" 
          title="${caption || 'YouTube video'}"
          allowfullscreen 
          frameborder="0"
          loading="lazy"
          class="rounded shadow-sm">
        </iframe>
      </div>
      ${captionHTML}
    `;
            }

            // Twitter Embed
            if (/twitter\.com\/[^/]+\/status\/\d+/.test(link)) {
                return `
      <blockquote class="twitter-tweet">
        <a href="${link}"></a>
      </blockquote>
      <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
      ${captionHTML}
    `;
            }

            // Instagram Embed
            if (/instagram\.com\/p\/[a-zA-Z0-9_-]+/.test(link)) {
                return `
      <blockquote class="instagram-media" 
                  data-instgrm-permalink="${link}" 
                  data-instgrm-version="14" 
                  style="background:#FFF; border:0; margin: 1rem auto;">
      </blockquote>
      <script async src="//www.instagram.com/embed.js"></script>
      ${captionHTML}
    `;
            }

            // Facebook Embed
            // Facebook Embed
            if (/facebook\.com/.test(link)) {
                // Case 1: raw iframe HTML string
                if (/<iframe\s[^>]*src=["']([^"']+)["']/i.test(link)) {
                    const src = link.match(/<iframe\s[^>]*src=["']([^"']+)["']/i)?.[1];
                    return `
      <div class="ratio ratio-16x9 mb-3 ${align}">
        <iframe 
          src="${src}" 
          width="100%" 
          height="400" 
          frameborder="0" 
          allowfullscreen 
          scrolling="no"
          class="rounded shadow-sm border"
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share">
        </iframe>
      </div>
      ${captionHTML}
    `;
                }

                // Case 2: Regular Facebook post URL
                if (/facebook\.com\/[^/]+\/posts\/\d+/.test(link)) {
                    return `
      <div id="fb-root"></div>
      <script async defer crossorigin="anonymous" 
        src="https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v18.0">
      </script>
      <div class="fb-post" data-href="${link}" data-width="500"></div>
      ${captionHTML}
    `;
                }

                // ✅ Case 3: fb.watch short URL — convert to embeddable video
                if (/fb\.watch\/[a-zA-Z0-9_-]+/i.test(link)) {
                    const encodedUrl = encodeURIComponent(link);
                    return `
      <div class="mb-3 ${align}" style="max-width: 100%; overflow: hidden;">
        <iframe 
          src="https://www.facebook.com/plugins/video.php?href=${encodedUrl}&show_text=false&width=500" 
          width="100%" height="300"
          style="border:none;overflow:hidden" 
          scrolling="no" frameborder="0" 
          allowfullscreen="true" 
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          class="rounded shadow-sm">
        </iframe>
      </div>
      ${captionHTML}
    `;
                }


                if (/<[a-z][\s\S]*>/i.test(contentData.url)) {
                    const captionHTML = contentData.caption ? `<p class="text-muted small text-center">${contentData.caption}</p>` : '';
                    return `
    <div class="mb-3 ${contentData.align || 'mx-auto'}" style="max-width: 100%; overflow: hidden;">
      <div class="ratio ratio-16x9">
        ${contentData.url}
      </div>
    </div>
    ${captionHTML}
  `;
                }

            }


            return `<p class="text-danger">Unsupported embed link.</p>`;
        }



        res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${article.title}</title>
    <meta name="description" content="${article.excerpt || article.title}" />

    <!-- Open Graph -->
    <meta property="og:title" content="${article.title}" />
    <meta property="og:description" content="${article.excerpt || article.title}" />
    <meta property="og:image" content="${article.image}" />
    <meta property="og:type" content="article" />
    <meta property="og:url" content="https://dramaspots.com/article/${article.slug}" />

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${article.title}" />
    <meta name="twitter:description" content="${article.excerpt || article.title}" />
    <meta name="twitter:image" content="${article.image}" />

    <!-- Canonical -->
    <link rel="canonical" href="https://dramaspots.com/article/${article.slug}" />

    <!-- Favicon -->
    <link rel="icon" type="image/png" href="/assets/logo1.png" sizes="32x32">
    <link rel="icon" type="image/x-icon" href="/favicon.ico">

    <!-- CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" />
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css" rel="stylesheet" />

    <!-- Structured Data -->
    <script type="application/ld+json">
${JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
                {
                    "@type": "NewsArticle",
                    "headline": article.title,
                    "image": [article.image],
                    "datePublished": article.published_at,
                    "dateModified": article.updated_at || article.published_at,
                    "author": {
                        "@type": "Person",
                        "name": article.author?.username || "DramaSpots Author"
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
                        "@id": `https://dramaspots.com/article/${article.slug}`
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
                            "name": `${article.category?.name || 'Articles'}`,
                            "item": "https://dramaspots.com/category/${article.category?.name || ''}"
                        },
                        {
                            "@type": "ListItem",
                            "position": 3,
                            "name": `${article.title}`,
                            "item": `https://dramaspots.com/article/${article.slug}`
                        }
                    ]
                },
                {
                    "@type": "ItemList",
                    "name": "Related Articles",
                    "itemListElement": relatedStructuredData
                }
            ]
        }, null, 2)}
    </script>
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4436674424567426"
     crossorigin="anonymous"></script>

     

    <style>
        body {
        user-select: none;
            background-color: #f8f9fa;
        }

        .article-header {
            background: linear-gradient(90deg, #ffdde1 0%, #ee9ca7 100%);
            padding: 3rem 0 2rem 0;
        }

        .author-img {
            width: 48px;
            height: 48px;
            object-fit: cover;
            border-radius: 50%;
        }

        .article-img-main {
            width: 100%;
            max-height: 480px;
            object-fit: cover;
            border-radius: 1rem;
            box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
        }

        .tag {
            background: #fff3cd;
            color: #856404;
            border-radius: 0.25rem;
        }

                a {
            color: #f80764;
            text-decoration: none;
            transition: color 0.2s;
        }
        .sidebar-widget {
            background: #fff;
            border-radius: 1rem;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
            padding: 1.5rem;
            margin-bottom: 2rem;
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


        .row {
            display: flex;
            align-items: flex-start;
            justify-content: space-evenly;
            max-width: 1200px;
            margin: 0 auto;
        }

        article {
            flex: 3;
            padding: 20px;
        }

        aside {
            flex: 1;
            padding: 20px;
            width: 300px;
            height: fit-content;
            position: sticky;
            top: 100px;
            /* distance from top of viewport */
            align-self: flex-start;
        }

        blockquote {
            font-style: italic;
        }

        blockquote footer {
            font-size: 0.9rem;
            font-style: normal;
            padding-top: 30px;
            color: #6c757d;
        }

        .like-btn,
        .like-comment-btn,
        .like-reply-btn {
            cursor: pointer;
            color: #6c757d;
            transition: color 0.2s;
        }

        .like-btn.liked,
        .like-comment-btn.liked,
        .like-reply-btn.liked {
            color: #e0245e;
        }

        .comment-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            object-fit: cover;
        }

        .reply-avatar {
            width: 30px;
            height: 30px;
            border-radius: 50%;
            object-fit: cover;
        }

        .comment-box {
            background: #fff;
            border-radius: 0.5rem;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
            padding: 1.5rem;
            margin-bottom: 1.5rem;
        }

        .reply-box {
            background: #f1f3f4;
            border-radius: 0.5rem;
            padding: 1rem;
            margin-top: 1rem;
            margin-left: 3.5rem;
        }

        .comment-actions {
            font-size: 0.95rem;
        }

        .reply-actions {
            font-size: 0.9rem;
        }

        .comment-form textarea {
            resize: none;
        }

        @media (max-width: 767.98px) {
            .article-header-overlay {
                padding: 1rem;
            }

            .comment-box {
                padding: 1rem;
            }
        }

        /* Custom scrollbar for comments */
        .comments-section {
            overflow-y: auto;
        }

        ::-webkit-scrollbar {
            width: 8px;
            background: #e9ecef;
        }

        ::-webkit-scrollbar-thumb {
            background: #ced4da;
            border-radius: 4px;
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

        
        .related-article-img { width: 60px; height: 60px; object-fit: cover; border-radius: 8px; margin-right: 12px;}


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
            .related-article-img {
                width: 48px;
                height: 48px;
            }

            .tab-nav a {
                padding: 0px 5px;
                font-size: 0.9rem;
                color: rgb(250, 217, 234);
                font-weight: 500;
                border: 1px solid transparent;
                border-radius: 4px;
            }
        
            .all {
            display: flex;
            flex-direction: column;
                 }
        }

    </style>
</head>

<body data-auth="${userId}" data-id="${article.id}">
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
                    <li class="nav-item"><a class="nav-link" href="/category/News">News</a></li>
                    <li class="nav-item"><a class="nav-link" href="/">Trending</a></li>
                    <li class="nav-item"><a class="nav-link" aria-current="page"
                            href="/category/Exclusives">Exclusives <span class="exclusive-badge">Hot</span></a></li>
                    <li class="nav-item"><a class="nav-link" href="/auth">Profile</a></li>
                </ul>
            </div>
        </div>
    </nav>

    <!-- Article Header -->
    <header class="article-header">
        <div class="container_fluid">
            <div class="row align-items-center">
                <div class="col-lg-8">
                    <h1 class="display-4 fw-bold mb-3">${article.title}</h1>
                     <div class="mb-2 d-flex flex-wrap">
                        ${article.hashtags.map(tag => `<a class="text-decoration-none" href="/hashtag/${tag.name}"><span class="tag m-1 px-1">#${tag.name}</span></a>`).join('')}
                       </div>

                        <div class="d-flex align-items-center mt-3">
                        <img src="${article.author.profile_pic}" alt="Author"
                            class="author-img me-2">
                        <div>
                            <div class="fw-semibold">${article.author.username}</div>
                            <div class="text-muted small">Published: ${article.published_at} &middot; ${article.read_duration} min read</div>
                        </div>
                    </div>
                </div>
                <div class="col-lg-4 text-lg-end mt-4 mt-lg-0">
                    <img src="${article.image}"
                        alt="${article.title}" class="article-img-main shadow">
                </div>
            </div>
        </div>
    </header>


    <!-- Main Content -->
    <main class="mb-5">
        <div class="row">
            <!-- Article Body -->
            <article class="col-lg-8 mb-5">

                ${article.sections.map((section, index) => {
            const isOdd = (index + 1) % 4 === 0;
            return `<section class="mb-2" style="margin-top: 3rem;">
                        ${section.contents.map(content => {
                const contentData = JSON.parse(content.content);
                switch (content.type) {
                    case 'head': {
                        const level = Math.min(Math.max(contentData.level || 2, 1), 6); // clamp between 1 and 6

                        // Font size: fs-2 (largest) to fs-6 (smallest)
                        const fontSize = `fs-${Math.min(level + 1, 6)}`;

                        // Font weight: bold for h1/h2, semi for h3/h4, normal for h5/h6
                        const fontWeight = level <= 2 ? 'fw-bold' : level <= 4 ? 'fw-semibold' : 'fw-normal';

                        // Indentation (margin start): ms-1 to ms-5
                        const indent = `ms-${Math.min(level, 5)}`;

                        // Text color: darker for top levels, lighter for deeper levels
                        const textColor = level <= 2
                            ? 'text-dark'
                            : level === 3
                                ? 'text-secondary'
                                : level === 4
                                    ? 'text-body-secondary'
                                    : 'text-muted';

                        return `<h${level} class="${fontSize} ${fontWeight} ${textColor} ${indent}">${contentData.head}</h${level}>`;
                    }


                    case 'text':
                        return `<p>${contentData.text}</p>`

                    case 'list':

                        if (contentData.items && Array.isArray(contentData.items)) {
                            if (contentData.ordered) {
                                return `<ol class="list-group list-group-flush mb-4">${contentData.items.map(item => `<li class="list-group-item">${item}</li>`).join('')}</ol>`;
                            } else {
                                return `<ul class="list-group list-group-flush mb-4">${contentData.items.map(item => `<li class="list-group-item">${item}</li>`).join('')}</ul>`;
                            }
                        }
                        break;
                    case 'table':
                        if (
                            contentData.headers &&
                            Array.isArray(contentData.headers) &&
                            contentData.rows &&
                            Array.isArray(contentData.rows)
                        ) {
                            return `
                            <div class="table-responsive mb-4" style="overflow-x: auto;">
                                <table class="table table-bordered table-striped table-hover align-middle text-center">
                                <thead class="table-primary">
                                    <tr>
                                    ${contentData.headers.map(header => `<th scope="col">${header}</th>`).join('')}
                                    </tr>
                                </thead>
                                <tbody>
                                    ${contentData.rows.map(row => `
                                    <tr>
                                        ${row.map(cell => `<td>${cell}</td>`).join('')}
                                    </tr>
                                    `).join('')}
                                </tbody>
                                </table>
                            </div>
                            `;
                        }
                        break;

                    case 'quote':
                        return `<blockquote class="blockquote px-4 py-3 bg-light border-start border-4 border-danger rounded mb-4">
                            <p class="mb-0">${contentData.quote}</p>
                            <footer class="blockquote-footer">${contentData.attribution}</footer>
                            </blockquote>`
                    case 'carousel':
                        return `                            
                    <div id="galleryCarousel" class="carousel slide mb-4" data-bs-ride="carousel">
 
                    <div class="carousel-inner rounded shadow">
                            ${contentData.map(item => `
                                <div class="carousel-item active">
                                <img src="${item.image}"
                                    class="d-block w-100" alt="${item.caption}">
                            </div>
                                `).join('')}

                        </div>
                    
                        <button class="carousel-control-prev" type="button" data-bs-target="#galleryCarousel"
                            data-bs-slide="prev">
                            <span class="carousel-control-prev-icon"></span>
                        </button>
                        <button class="carousel-control-next" type="button" data-bs-target="#galleryCarousel"
                            data-bs-slide="next">
                            <span class="carousel-control-next-icon"></span>
                        </button>
                    </div>`
                    case 'image':
                        return `<p class="mb-0">${contentData.caption}</p>
                            <div class="card">
                                <img src="${contentData.image}"
                                    class="d-block w-100" alt="Image">
                            </div>
                            `
                    case 'video':
                        return `<p class="mb-0">${contentData.caption}</p>
                            <div class="card">
                                <video controls><source src="${contentData.video}" type="video/mp4"></video>
                            </div>
                            `
                    case 'embed':
                        return generateEmbedHTML(contentData)
                    default:
                        return `<p>${contentData.text}</p>`;
                }
            }).join('')
                }
                          ${isOdd ? `<div class="text-center my-4">
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4436674424567426"
     crossorigin="anonymous"></script>
<ins class="adsbygoogle"
     style="display:block; text-align:center;"
     data-ad-layout="in-article"
     data-ad-format="fluid"
     data-ad-client="ca-pub-4436674424567426"
     data-ad-slot="9337057636"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>
          </div>` : ''}
                </section>`
        }).join('')
            }
                
                <section>
                    <h2 class="fw-bold mt-5 mb-3">Comments (<span id="commentsCount">${article.comments.length}</span>)</h2>

                    <!-- Comments List -->
                    <div class="comments-section" id="commentsList">
                        ${article.comments}
                    </div>
                </section>
                

                <!-- Share Section -->
                <div class="my-5">
                    <h4 class="fw-bold mb-3">Share this article</h4>
                    <div class="d-flex flex-wrap gap-3">
                        <a id="share-facebook" class="btn btn-primary d-flex align-items-center" target="_blank" rel="noopener" style="background:#1877f2;border:none;">
                            <i class="bi bi-facebook me-2" style="font-size:1.5rem;"></i> Facebook
                        </a>
                        <a id="share-instagram" class="btn d-flex align-items-center" target="_blank" rel="noopener" style="background:#e1306c;color:#fff;border:none;">
                            <i class="bi bi-instagram me-2" style="font-size:1.5rem;"></i> Instagram
                        </a>
                        <a id="share-whatsapp" class="btn d-flex align-items-center" target="_blank" rel="noopener" style="background:#25d366;color:#fff;border:none;">
                            <i class="bi bi-whatsapp me-2" style="font-size:1.5rem;"></i> WhatsApp
                        </a>
                        <a id="share-twitter" class="btn d-flex align-items-center" target="_blank" rel="noopener" style="background:#1da1f2;color:#fff;border:none;">
                            <i class="bi bi-twitter me-2" style="font-size:1.5rem;"></i> Twitter
                        </a>
                        <a id="share-telegram" class="btn d-flex align-items-center" target="_blank" rel="noopener" style="background:#229ed9;color:#fff;border:none;">
                            <i class="bi bi-telegram me-2" style="font-size:1.5rem;"></i> Telegram
                        </a>
                        <a id="share-linkedin" class="btn d-flex align-items-center" target="_blank" rel="noopener" style="background:#0077b5;color:#fff;border:none;">
                            <i class="bi bi-linkedin me-2" style="font-size:1.5rem;"></i> LinkedIn
                        </a>
                        <button id="copy-link-btn" class="btn btn-outline-secondary d-flex align-items-center" type="button">
                            <i class="bi bi-link-45deg me-2" style="font-size:1.5rem;"></i> Copy Link
                        </button>
                    </div>
                    <div id="copy-link-msg" class="small mt-2 text-success" style="display:none;">Link copied!</div>
                </div>

                <!-- Like Article Button -->
                
                <div class="mb-4">
                    <button class="btn btn-outline-danger like-btn  ${article.isLiked ? 'liked' : ''}"  data-type="Article" data-id="${article.id}">
                        <i class="bi bi-heart${article.isLiked ? '-fill' : ''}"></i> <span class="like-count">${article.likesCount}</span>
                    </button>
                </div>
                <!-- Comments Section -->
                <section id="comments" class="mb-5">
                    <!-- Add Comment Form -->
                    <div class="comment-box mb-4">
                        <form id="addCommentForm" class="comment-form">
                            <div class="mb-3">
                                <label for="commentText" class="form-label">Comment</label>
                                <textarea class="form-control" data-article="${article.id}" id="commentText" rows="3" required
                                    maxlength="500"></textarea>
                            </div>
                            <button type="submit" class="btn btn-primary">Add Comment</button>
                        </form>
                    </div>
                </section>
                      <div class="mb-4">
        <div class="text-center">
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
      </div>
            </article>
            <!-- Sidebar -->
            <aside class="col-lg-4">
                <div class="sidebar-widget mb-4">
                    <h5 class="fw-bold mb-3">About the Author</h5>
                    <div class="d-flex align-items-center mb-2">
                        <img src="${article.author.profile_pic}" alt="${article.author.username}"
                            class="author-img me-2">
                        <div>
                            <div class="fw-semibold">${article.author.username}</div>
                            <div class="text-muted small">${article.author.role}</div>
                        </div>
                    </div>
                    <p class="mb-0">${article.author.bio || `${article.author.username} covers celebrity news and pop culture for over a decade. Loves
                        red carpets, and all things Hollywood.`}</p>
                </div>

                ${mostViewed.length ? `
                <div class="sidebar-widget mb-4">
                    <h5 class="fw-bold mb-3">Trending Now</h5>
                    <ul class="list-unstyled">
                    ${mostViewed.map(a => `
                            <li class="mb-3">
                            <a href="/article/${a.slug}" class="d-flex align-items-center text-decoration-none">
                                <img src="${a.image}"
                                    alt="Trending 1" class="related-article-img me-3">
                                <span>${a.title}</span>
                            </a>
                        </li>

                            `).join()
                }
                    </ul>
                </div>

                    `: ``
            }

                ${recommended.length ? `
                <div class="sidebar-widget mb-4">
                    <h5 class="fw-bold mb-3">Recommended for you</h5>
                    <ul class="list-unstyled">
                    ${recommended.map(a => `
                            <li class="mb-3">
                            <a href="/article/${a.slug}" class="d-flex align-items-center text-decoration-none">
                                <img src="${a.image}"
                                    alt="Trending 1" class="related-article-img me-3">
                                <span>${a.title}</span>
                            </a>
                        </li>

                            `).join()
                }
                    </ul>
                </div>

                    `: ``
            }

                <div class="sidebar-widget mb-4">
                    <h5 class="fw-bold mb-3">Subscribe to Our Newsletter</h5>
                    <form id="subsciptionForm" action="/newsletter/subscribe" method="POST" >
                        <div class="mb-3">
                            <label for="newsletterEmail" class="form-label">Email address</label>
                            <input name="email" type="email" class="form-control" id="newsletterEmail" placeholder="you@example.com"
                                required>
                        </div>
                        <button type="submit" class="btn btn-danger w-100">Subscribe</button>
                    </form>
                </div>
                <div class="sidebar-widget">
                    <h5 class="fw-bold mb-3">Follow Us</h5>
                    <div class="d-flex">
                        <a href="#"><img src="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/icons/facebook.svg"
                                alt="Facebook" class="social-icon"></a>
                        <a href="#"><img src="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/icons/twitter.svg"
                                alt="Twitter" class="social-icon"></a>
                        <a href="#"><img src="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/icons/instagram.svg"
                                alt="Instagram" class="social-icon"></a>
                        <a href="#"><img src="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/icons/youtube.svg"
                                alt="YouTube" class="social-icon"></a>
                    </div>
                </div>
                <div class="text-center my-4">
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
        <!-- Related Articles -->
        ${related.length ? `

                                 <section class="mt-5">
            <h3 class="fw-bold mx-10 mb-4">Related Articles</h3>
            <div class="row g-4">
                                ${related.map((a, index) => `
                <div class="col-md-4">
                    <div class="card h-100 shadow-sm">
                        <img src="${a.image}"
                            class="card-img-top" alt="Related 1">
                        <div class="card-body">
                            <h5 class="card-title">${a.title}</h5>
                            <p class="card-text text-muted small">${a.excerpt}</p>
                            <a href="/article/${a.slug}" class="btn btn-outline-danger btn-sm">Read More</a>
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
                            `).join()
                }

            </div>
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
    document.getElementById('addCommentForm').addEventListener('submit', async function (e) {
        e.preventDefault();
        const auth = document.body.dataset.auth;
const userId = auth && auth !== 'null' ? parseInt(auth) : null;

if (!userId) {
  window.location.href = "/auth";
  return;
}
        const text = document.getElementById('commentText').value.trim();
        let article_id = parseInt(document.getElementById('commentText').getAttribute('data-article'));
        if (!text) return;

        const comment = await addComment({
            article_id,
            parent_comment_id: null,
            content: text,
            level: 0,
        });

if (comment) {
    document.getElementById('commentsList').insertAdjacentHTML('afterbegin', comment);
}


        this.reset();
    });

    async function addComment(comment) {
        try {
            const res = await fetch('/reactions/addComment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(comment)
            });

            if (res.ok) {
         return await res.text(); // <-- expecting HTML string
            } else {
                return null;
            }
        } catch (error) {
            console.error("Failed to post comment:", error);
            return null;
        }
    }
        

    function showReplyForm(article_id, id, level, commentBox) {
            const auth = document.body.dataset.auth;
const userId = auth && auth !== 'null' ? parseInt(auth) : null;

if (!userId) {
  window.location.href = "/auth";
  return;
}
    const container = commentBox.querySelector('.reply-form-container');

    // Toggle off if already shown
    if (container.firstChild) {
        container.innerHTML = '';
        return;
    }

    // Create form
    const form = document.createElement('form');

    form.className = 'reply-form mt-2';
    form.setAttribute('data-parent-id', id);
    form.setAttribute('data-level', level);

    // Textarea group
    const textGroup = document.createElement('div');
    textGroup.className = 'mb-2';
    const textarea = document.createElement('textarea');
    textarea.className = 'form-control form-control-sm reply-text';
    textarea.rows = 2;
    textarea.placeholder = 'Your reply';
    textarea.required = true;
    textarea.maxLength = 300;
    textGroup.appendChild(textarea);

    // Submit button
    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.className = 'btn btn-sm btn-primary';
    submitBtn.textContent = 'Reply';

    // Cancel button
    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'btn btn-sm btn-link text-danger cancel-reply-btn';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.addEventListener('click', () => {
        container.innerHTML = '';
    });

    // Append elements
    form.appendChild(textGroup);
    form.appendChild(submitBtn);
    form.appendChild(cancelBtn);
    container.appendChild(form);

    // Form submission logic
    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        const auth = document.body.dataset.auth;
const userId = auth && auth !== 'null' ? parseInt(auth) : null;

if (!userId) {
  window.location.href = "/auth";
  return;
}
        const text = textarea.value.trim();
        if (!text) return;

        const commentData = {
            article_id,
            parent_comment_id: id,
            content: text,
            level: level + 1,
        };

        console.log(commentData);

        const newComment = await addComment(commentData);
        if (newComment) {
            const wrapper = document.createElement('div');
            wrapper.innerHTML = newComment;
            const repliesContainer = commentBox.querySelector('.replies') || document.createElement('div');
            repliesContainer.className = 'replies mt-3';
            repliesContainer.appendChild(wrapper);
            if (!commentBox.contains(repliesContainer)) {
                commentBox.appendChild(repliesContainer);
            }
            container.innerHTML = '';
        }
    });
}

            // Delegate events for like, reply, and reply form submit
        document.getElementById('commentsList').addEventListener('click', function (e) {

            // Reply button
            if (e.target.closest('.reply-btn')) {
                let btn = e.target.closest('.reply-btn');
                let id = parseInt(btn.getAttribute('data-id'));
                let article_id = parseInt(btn.getAttribute('data-article'));
                let level = parseInt(btn.getAttribute('data-level'));
                showReplyForm(article_id, id, level, e.target.closest('.comment-box'));
            }
        });      


        async function likeItem({ article_id = null, comment_id = null, reaction_type = 'like' }) {
                const auth = document.body.dataset.auth;
const userId = auth && auth !== 'null' ? parseInt(auth) : null;

if (!userId) {
  window.location.href = "/auth";
  return;
}
  try {
    const res = await fetch('/reactions/like', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        article_id,
        comment_id,
        reaction_type
      })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Failed to toggle like');
    }

    return data;  // { message, liked, likeCount }
  } catch (err) {
    console.error('Error toggling like:', err);
    return { error: true, message: err.message };
  }
}

        document.querySelectorAll('.like-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const auth = document.body.dataset.auth;
const userId = auth && auth !== 'null' ? parseInt(auth) : null;

if (!userId) {
  window.location.href = "/auth";
  return;
}

                    const type = btn.dataset.type;     // 'article' or 'comment'
            const id = parseInt(btn.dataset.id);

            const res = await likeItem({
                article_id: type === 'Article' ? id : null,
                comment_id: type === 'Comment' ? id : null
            });

            if (!res.error) {
                btn.classList.toggle('liked', res.liked);
                if(res.liked){
                btn.querySelector('i').classList.replace('bi-heart', 'bi-heart-fill');
                } else {                    
                btn.querySelector('i').classList.replace('bi-heart-fill', 'bi-heart');
                }
                btn.querySelector('span').textContent = res.likeCount;
            } else {
                console.warn('Like failed:', res.message);
            }
      });
    });

    document.querySelectorAll('.view-reply').forEach(btn => {
  btn.addEventListener('click', async () => {
    const id = parseInt(btn.getAttribute('data-id'));
    const article_id = parseInt(btn.getAttribute('data-article'));
    const level = parseInt(btn.getAttribute('data-level'));

    try {
      const replies = await fetch('/reactions/replies', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ commentId: id, article_id, level, page: 1 })
})
        .then(res => res.text());

      // Now inject the replies into the DOM, for example:
      const container = btn.closest('.comment-box').querySelector('.replies');
      container.innerHTML = replies;

      // Optionally hide the "View replies" button after loading once
      btn.style.display = 'none';
    } catch (err) {
      console.error('Failed to load replies:', err);
    }
  });
});
                    const pageUrl = encodeURIComponent(window.location.href);
                    const pageTitle = encodeURIComponent(document.title);

                    document.getElementById("share-facebook").href = \`https://www.facebook.com/sharer/sharer.php?u=\${pageUrl}\`;
                    document.getElementById("share-whatsapp").href = \`https://api.whatsapp.com/send?text=\${pageTitle}%20\${pageUrl}\`;
                    document.getElementById("share-instagram") && (document.getElementById("share-instagram").href = \`https://www.instagram.com/?url=\${pageUrl}\`);
                    document.getElementById("share-twitter").href = \`https://twitter.com/intent/tweet?text=\${pageTitle}&url=\${pageUrl}\`;
                    document.getElementById("share-telegram").href = \`https://t.me/share/url?url=\${pageUrl}&text=\${pageTitle}\`;
                    document.getElementById("share-linkedin").href = \`https://www.linkedin.com/sharing/share-offsite/?url=\${pageUrl}\`;

// Share buttons event tracking (except copy-link)

function postShareEvent(event) {
    fetch('/article/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id: document.body.dataset.id
        })
    }).catch(() => {});
}
        [
        { id: "share-facebook", event: "share-facebook" },
        { id: "share-instagram", event: "share-instagram" },
        { id: "share-whatsapp", event: "share-whatsapp" },
        { id: "share-twitter", event: "share-twitter" },
        { id: "share-telegram", event: "share-telegram" },
        { id: "share-linkedin", event: "share-linkedin" }
        ].forEach(({ id, event }) => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener("click", () => postShareEvent(event));
        }
        });
                    document.getElementById("copy-link-btn").addEventListener("click", function() {
                        navigator.clipboard.writeText(window.location.href).then(() => {
                            const msg = document.getElementById("copy-link-msg");
                            msg.style.display = "block";
                            setTimeout(() => { msg.style.display = "none"; }, 2000);
                        });
                    });
</script>


</body>

</html>
            `);
    } catch (error) {
        console.error('Error fetching category or articles:', error);
        res.status(500).send('<h1>Internal Server Error</h1>');
    }
}
