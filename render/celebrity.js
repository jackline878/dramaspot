const express = require('express');

// This function renders a static, SEO-friendly, responsive celebrity profile page.
// All content is rendered server-side, no client-side JS is used for rendering.
exports.renderCelebrity = async (req, res) => {
    try {
        const celebrity = req.celebrity;

        // Helper functions for safe HTML escaping
        const escape = (str) =>
            String(str || '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');

        // Helper for rendering lists
        const renderList = (arr, fn) =>
            Array.isArray(arr) && arr.length
                ? arr.map(fn).join('')
                : '<li class="text-muted">No data available.</li>';

        // Helper for rendering assets
        const renderAssets = (assets) =>
            Array.isArray(assets) && assets.length
                ? assets
                    .map(
                        (a) =>
                            `<li>${escape(a.name)}: ${escape(a.worth)}</li>`
                    )
                    .join('')
                : '<li class="text-muted">No assets listed.</li>';

        // Helper for rendering fun facts
        const renderFunFacts = (facts) =>
            Array.isArray(facts) && facts.length
                ? facts
                    .map(
                        (f) =>
                            `<div class="fun-fact"><strong>${escape(
                                f.key
                            )}:</strong> ${escape(f.value)}</div>`
                    )
                    .join('')
                : '<div class="fun-fact text-muted">No fun facts available.</div>';

        // Helper for rendering award gallery
        const renderAwardGallery = (gallery) =>
            Array.isArray(gallery) && gallery.length
                ? gallery
                    .map(
                        (img) =>
                            `<img src="${escape(
                                img.url || img
                            )}" alt="Award" class="rounded" width="60" height="60">`
                    )
                    .join('')
                : '';

        // Helper for rendering news
        const renderNews = (news) =>
            Array.isArray(news) && news.length
                ? news.map((n) => `<li>${escape(n)}</li>`).join('')
                : '<li class="text-muted">No recent news.</li>';

        // Helper for rendering insights
        const renderInsights = (insights) =>
            Array.isArray(insights) && insights.length
                ? insights
                    .map(
                        (r) =>
                            `<li class="fw-bold">${escape(
                                r.title
                            )}</li><p>${escape(r.description)}</p>`
                    )
                    .join('')
                : '<li class="text-muted">No insights available.</li>';

        // Helper for rendering timeline
        const renderTimeline = (timeline) =>
            Array.isArray(timeline) && timeline.length
                ? timeline
                    .map(
                        (t) =>
                            `<li class="fw-bold"><span>${escape(
                                t.year
                            )}</span> - ${escape(t.title)}</li><p>${escape(
                                t.event
                            )}</p>`
                    )
                    .join('')
                : '<li class="text-muted">No timeline available.</li>';

        function formatAmount(num) {
            if (num === null || num === undefined) return '';
            const absNum = Math.abs(num);

            if (absNum >= 1_000_000_000) {
                return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
            } else if (absNum >= 1_000_000) {
                return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
            } else if (absNum >= 1_000) {
                return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
            } else {
                return num.toString();
            }
        }
        // Helper for rendering achievements
        const renderAchievements = (achievements) =>
            Array.isArray(achievements) && achievements.length
                ? achievements
                    .map(
                        (t) =>
                            `<li class="fw-bold">${escape(
                                t.title
                            )} (${escape(t.year)})</li><p>${escape(
                                t.description
                            )}</p>`
                    )
                    .join('')
                : '<li class="text-muted">No achievements listed.</li>';

        // Helper for rendering works
        const renderWorks = (works) =>
            Array.isArray(works) && works.length
                ? works
                    .map(
                        (w) =>
                            `<a href="${escape(
                                w.url
                            )}"><li><strong>${escape(
                                w.title
                            )}</strong> <span class="">(${escape(
                                w.year
                            )})</span></li></a><p>${escape(w.description)}</p>`
                    )
                    .join('')
                : '<li class="text-muted">No works listed.</li>';

        // Helper for rendering concerts
        const renderConcerts = (concerts) =>
            Array.isArray(concerts) && concerts.length
                ? concerts
                    .map(
                        (c) =>
                            `<li class="fw-bold">${escape(
                                c.name
                            )} <span class="text-muted">(${escape(
                                c.year
                            )})</span></li><p>${escape(c.description)}</p>`
                    )
                    .join('')
                : '<li class="text-muted">No concerts listed.</li>';

        // Helper for rendering brands
        const renderBrands = (brands) =>
            Array.isArray(brands) && brands.length
                ? brands
                    .map(
                        (b) =>
                            `<li class="fw-bold">${escape(
                                b.brandName
                            )} <span class="text-muted">(${escape(
                                b.year
                            )})</span></li><p>${escape(b.description)}</p>`
                    )
                    .join('')
                : '<li class="text-muted">No brands listed.</li>';

        // Helper for rendering awards
        const renderAwards = (awards) =>
            Array.isArray(awards) && awards.length
                ? awards
                    .map(
                        (a) =>
                            `<li class="fw-bold"><span class="badge badge-award">🏆</span> ${escape(
                                a.name
                            )} <span class="text-muted">(${escape(
                                a.year
                            )})</span></li><p>${escape(a.description)}</p>`
                    )
                    .join('')
                : '<li class="text-muted">No awards listed.</li>';

        // Helper for rendering nominations
        const renderNominations = (nominations) =>
            Array.isArray(nominations) && nominations.length
                ? nominations
                    .map(
                        (n) =>
                            `<li class="fw-bold">${escape(
                                n.title
                            )}</li><p>${escape(n.description)}</p>`
                    )
                    .join('')
                : '<li class="text-muted">No nominations listed.</li>';

        // Helper for rendering records
        const renderRecords = (records) =>
            Array.isArray(records) && records.length
                ? records
                    .map(
                        (r) =>
                            `<li class="fw-bold">${escape(
                                r.title
                            )}</li><p>${escape(r.description)}</p>`
                    )
                    .join('')
                : '<li class="text-muted">No records listed.</li>';

        // Helper for rendering philanthropy
        const renderPhilanthropy = (philanthropy) =>
            Array.isArray(philanthropy) && philanthropy.length
                ? philanthropy
                    .map(
                        (p) =>
                            `<li class="fw-bold">${escape(
                                p.title
                            )}</li><p>${escape(p.description)}</p>`
                    )
                    .join('')
                : '<li class="text-muted">No philanthropy listed.</li>';

        // Helper for rendering children
        const renderChildren = (children) =>
            Array.isArray(children) && children.length
                ? children.map(escape).join(', ')
                : escape(children) || 'None';

        // Helper for rendering friends
        const renderFriends = (friends) =>
            Array.isArray(friends) && friends.length
                ? friends.map(escape).join(', ')
                : escape(friends) || 'Unknown';

        // Helper for rendering albums
        const renderAlbums = (albums) => renderWorks(albums);

        // Helper for rendering date
        const formatDate = (date) =>
            date
                ? new Date(date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                })
                : 'Unknown';

        // Main HTML output
        res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${celebrity.nickname}</title>
    <meta name="description" content="${celebrity.bio}" />

    <!-- Open Graph -->
    <meta property="og:title" content="${celebrity.nickname}" />
    <meta property="og:description" content="${celebrity.bio}" />
    <meta property="og:image" content="${celebrity.profilePic}" />
    <meta property="og:type" content="Profile" />
    <meta property="og:url" content="https://dramaspots.com/celebrity/${celebrity.slug}" />

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${celebrity.nickname}" />
    <meta name="twitter:description" content="${celebrity.bio}" />
    <meta name="twitter:image" content="${celebrity.profilePic}" />

    <!-- Canonical -->
    <link rel="canonical" href="https://dramaspots.com/celebrity/${celebrity.slug}" />

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
                    "@type": "CelebrityProfile",
                    "headline": celebrity.nickname,
                    "image": [celebrity.profilePic],
                    "datePublished": celebrity.createdAt,
                    "dateModified": celebrity.updatedAt,
                    "author": {
                        "@type": "Person",
                        "name": "DramaSpots Author"
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
                        "@id": `https://dramaspots.com/celebrity/${celebrity.slug}`
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
                            "name": `Celebrities`,
                            "item": "https://dramaspots.com/celebrities"
                        },
                        {
                            "@type": "ListItem",
                            "position": 3,
                            "name": `${celebrity.nickname}`,
                            "item": `https://dramaspots.com/celebrity/${celebrity.slug}`
                        }
                    ]
                },
            ]
        }, null, 2)}
    </script>

        <!-- AdSense -->

    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4436674424567426"
        crossorigin="anonymous"></script>

    <link rel="icon" type="image/png" href="/assets/logo1.png" sizes="32x32">
    <link rel="icon" type="image/x-icon" href="/favicon.ico">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css">
    <style>
        body { background: #f8f9fa; position: relative; }
        .sidebar { background: #fff; border-right: 1px solid #dee2e6; position: sticky; top: 0; }
        .btn-primary, .bg-primary { background: #d11e5a !important; border: #d11e5a; }
        .text-primary { color: #d11e5a !important; }
        .bi { color: #d11e5a !important; }
        .nav-link { color: #d11e5a !important; }
        .nav-link:active { color: #d11e5a !important; }
        .sidebar .nav-link.active { background: #e9ecef; font-weight: bold; color: #d11e5a; }
        .profile-img { width: 160px; height: 160px; object-fit: cover; border-radius: 50%; border: 4px solid #d11e5a; margin-bottom: 1rem; }
        .section-title { font-size: 1.5rem; font-weight: 600; margin-bottom: 1rem; color: #d11e5a; }
        .card { margin-bottom: 2rem; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
        .badge-award { background: #ffd700; color: #212529; font-size: 1rem; margin-right: 0.5rem; }
        .fun-fact { background: #e9ecef; border-left: 4px solid #d11e5a; padding: 1rem; margin-bottom: 1rem; font-style: italic; }
        .close-btn { display: none; }
        @media (max-width: 991.98px) {
            .sidebar { padding: 0; margin: 0; transition: margin-right 0.3s ease; width: 280px; position: fixed; top: 0; right: 0; box-shadow: -2px 0 5px rgba(0,0,0,0.1); z-index: 9999; }
            .sidebar.hide { margin-right: -280px !important; }
            .close-btn { display: flex; }
        }
        @media (max-width: 767.98px) {
            .profile-img { width: 100px; height: 100px; }
            .section-title { font-size: 1.2rem; }
        }
    </style>
</head>
<body>
    <nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm mb-4">
        <div class="container-fluid">
            <a class="navbar-brand fw-bold text-primary" href="javascript:history.back()"><i class="bi bi-chevron-left"></i>Back</a>
        </div>
    </nav>
    <div class="container-fluid">
        <div class="row">
            <!-- Sidebar -->
            <nav class="col-lg-3 col-md-4 sidebar py-4 px-3 hide" id="sidebar">
                <div class="align-items-center justify-content-between mb-4 close-btn">
                    <button class="btn btn-sm btn-outline-secondary ms-3" onclick="document.getElementById('sidebar').classList.add('hide')">Close</button>
                </div>
                <hr>
                <ul class="nav flex-column">
                    <li class="nav-item"><a class="nav-link active" href="#bio"><i class="bi bi-person-circle"></i> Basic Bio Info</a></li>
                    <li class="nav-item"><a class="nav-link" href="#career"><i class="bi bi-graph-up-arrow"></i> Career Journey</a></li>
                    <li class="nav-item"><a class="nav-link" href="#works"><i class="bi bi-star-fill"></i> Major Works</a></li>
                    <li class="nav-item"><a class="nav-link" href="#awards"><i class="bi bi-trophy-fill"></i> Awards</a></li>
                    <li class="nav-item"><a class="nav-link" href="#personal"><i class="bi bi-heart-fill"></i> Personal Life</a></li>
                    <li class="nav-item"><a class="nav-link" href="#networth"><i class="bi bi-cash-stack"></i> Net Worth</a></li>
                    <li class="nav-item"><a class="nav-link" href="#news"><i class="bi bi-newspaper"></i> Recent News</a></li>
                    <li class="nav-item"><a class="nav-link" href="#funfacts"><i class="bi bi-lightbulb-fill"></i> Fun Facts</a></li>
                </ul>
            </nav>
            <!-- Main Content -->
            <main class="col-lg-9 col-md-8 px-0 pb-4">
                <!-- Profile Header -->
                <div class="d-flex align-items-center mb-4 flex-wrap px-3">
                    <img onclick="goTO('${celebrity.link}')" src="${escape(
            celebrity.profilePic || 'https://via.placeholder.com/160x160.png?text=Celebrity'
        )}" alt="${escape(celebrity.fullName || celebrity.nickname)}" class="profile-img cursor-pointer me-4" id="profileImg">
                    <div>
  <h1 
  onclick="goTO('${celebrity.link}')" 
  class="fw-bold mb-1 cursor-pointer" 
  id="celebrityName">
  ${escape(celebrity.fullName || celebrity.nickname)}
</h1>

                        <span onclick="goTO('${celebrity.link}')" class="badge cursor-pointer bg-primary fs-6 me-2" id="stageName">${escape(
            celebrity.nickname
        )}</span>
                        <span class="badge bg-secondary fs-6" id="profession">${escape(
            Array.isArray(celebrity.roles)
                ? celebrity.roles.join(', ')
                : celebrity.roles
        )}</span>
                        <p class="mt-2 mb-0 text-muted">Last updated: <span id="lastUpdated">${formatDate(
            celebrity.updatedAt
        )}</span></p>
                    </div>
                </div>
                                <div class="align-center">
                    <script async
                        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4436674424567426"
                        crossorigin="anonymous"></script>
                    <!-- big -->
                    <ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-4436674424567426"
                        data-ad-slot="4449861684" data-ad-format="auto" data-full-width-responsive="true"></ins>
                    <script>
                        (adsbygoogle = window.adsbygoogle || []).push({});
                    </script>
                </div>
                <!-- Basic Bio Info -->
                <section id="bio" class="mb-5">
                    <div class="section-title px-3"><i class="bi bi-person-circle"></i> Basic Bio Info</div>
                    <div class="row">
                        <div class="col-md-6">
                            <ul class="list-group list-group-flush" id="bioList">
                                <li class="list-group-item"><strong>Full Name:</strong> ${escape(
            celebrity.fullName
        )}</li>
                                <li class="list-group-item"><strong>Nickname / Stage Name:</strong> ${escape(
            celebrity.nickname
        )}</li>
                                <li class="list-group-item"><strong>Date of Birth / Age:</strong> ${formatDate(
            celebrity.dateOfBirth
        )} (${celebrity.dateOfBirth
            ? new Date().getFullYear() -
            new Date(celebrity.dateOfBirth).getFullYear()
            : 'Unknown'
            } years old)</li>
                                <li class="list-group-item"><strong>Place of Birth:</strong> ${escape(
                celebrity.placeOfBirth
            )}</li>
                                <li class="list-group-item"><strong>Nationality:</strong> ${escape(
                celebrity.nationality
            )}</li>
                                <li class="list-group-item"><strong>Career Background:</strong> ${escape(
                celebrity.careerBackground
            )}</li>
                            </ul>
                        </div>
                        <div class="col-md-6">
                            <div class="card shadow-sm">
                                <div class="card-body">
                                    <h6 class="card-title text-primary">Short Bio</h6>
                                    <p class="card-text" id="shortBio">${escape(
                celebrity.bio
            )}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                                <div class="align-center">
                    <script async
                        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4436674424567426"
                        crossorigin="anonymous"></script>
                    <!-- big -->
                    <ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-4436674424567426"
                        data-ad-slot="4449861684" data-ad-format="auto" data-full-width-responsive="true"></ins>
                    <script>
                        (adsbygoogle = window.adsbygoogle || []).push({});
                    </script>
                </div>
                <!-- Career Journey -->
                <section id="career" class="mb-5">
                    <div class="section-title px-3"><i class="bi bi-graph-up-arrow"></i> Career Journey</div>
                    <div class="row">
                        <div class="col-lg-8">
                            <div class="card">
                                <div class="card-body">
                                    <h6 class="card-title text-primary">How It Started</h6>
                                    <p id="careerStart">${escape(celebrity.careerStart)}</p>
                                    <h6 class="card-title text-primary">Breakthrough Moment</h6>
                                    <p id="careerBreakthrough">${escape(
                celebrity.careerBreakthrough
            )}</p>
                                    <h6 class="card-title text-primary">Career Timeline</h6>
                                    <ul class="timeline list-unstyled" id="careerTimeline">
                                        ${renderTimeline(celebrity.careerTimeline)}
                                    </ul>
                                    <h6 class="card-title text-primary">Current Status</h6>
                                    <p id="careerStatus">${escape(
                celebrity.careerStatus || 'Active'
            )}</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-lg-4">
                            <div class="card bg-light">
                                <div class="card-body">
                                    <h6 class="card-title text-primary">Notable Achievements</h6>
                                    <ul id="careerAchievements">
                                        ${renderAchievements(celebrity.careerAchievements)}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                                <div class="align-center">
                    <script async
                        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4436674424567426"
                        crossorigin="anonymous"></script>
                    <!-- big -->
                    <ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-4436674424567426"
                        data-ad-slot="4449861684" data-ad-format="auto" data-full-width-responsive="true"></ins>
                    <script>
                        (adsbygoogle = window.adsbygoogle || []).push({});
                    </script>
                </div>
                <!-- Major Works or Projects -->
                <section id="works" class="mb-5">
                    <div class="section-title px-3"><i class="bi bi-star-fill"></i> Major Works or Projects</div>
                    <div class="row">
                        <div class="col-md-6">
                            <div class="card">
                                <div class="card-body">
                                    <h6 class="card-title text-primary">Albums / Songs / Movies</h6>
                                    <ul id="worksList">
                                        ${renderAlbums(celebrity.albums)}
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="card">
                                <div class="card-body">
                                    <h6 class="card-title text-primary">Major Concerts / Shows / Appearances</h6>
                                    <ul id="concertsList">
                                        ${renderConcerts(celebrity.concerts)}
                                    </ul>
                                    <h6 class="card-title text-primary mt-3">Businesses / Brands</h6>
                                    <ul id="brandsList">
                                        ${renderBrands(celebrity.brands)}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                                <div class="align-center">
                    <script async
                        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4436674424567426"
                        crossorigin="anonymous"></script>
                    <!-- big -->
                    <ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-4436674424567426"
                        data-ad-slot="4449861684" data-ad-format="auto" data-full-width-responsive="true"></ins>
                    <script>
                        (adsbygoogle = window.adsbygoogle || []).push({});
                    </script>
                </div>
                <!-- Awards and Recognition -->
                <section id="awards" class="mb-5">
                    <div class="section-title px-3"><i class="bi bi-trophy-fill"></i> Awards and Recognition</div>
                    <div class="row">
                        <div class="col-md-8">
                            <div class="card">
                                <div class="card-body">
                                    <h6 class="card-title text-primary">Awards</h6>
                                    <ul id="awardsList">
                                        ${renderAwards(celebrity.awards)}
                                    </ul>
                                    <h6 class="card-title text-primary mt-3">Nominations / Honorary Titles</h6>
                                    <ul id="nominationsList">
                                        ${renderNominations(celebrity.nominations)}
                                    </ul>
                                    <h6 class="card-title text-primary mt-3">Records Set / Broken</h6>
                                    <ul id="recordsList">
                                        ${renderRecords(celebrity.records)}
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="card bg-light">
                                <div class="card-body">
                                    <h6 class="card-title text-primary">Award Gallery</h6>
                                    <div class="d-flex flex-wrap gap-2" id="awardGallery">
                                        ${renderAwardGallery(celebrity.awardGallery)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                                <div class="align-center">
                    <script async
                        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4436674424567426"
                        crossorigin="anonymous"></script>
                    <!-- big -->
                    <ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-4436674424567426"
                        data-ad-slot="4449861684" data-ad-format="auto" data-full-width-responsive="true"></ins>
                    <script>
                        (adsbygoogle = window.adsbygoogle || []).push({});
                    </script>
                </div>
                <!-- Personal Life -->
                <section id="personal" class="mb-5">
                    <div class="section-title  px-3"><i class="bi bi-heart-fill"></i> Personal Life</div>
                    <div class="row">
                        <div class="col-md-6">
                            <ul class="list-group list-group-flush" id="personalList">
                                <li class="list-group-item"><strong>Relationship Status:</strong> ${escape(
                celebrity.relationshipStatus
            )}</li>
                                <li class="list-group-item"><strong>Children:</strong> ${renderChildren(
                celebrity.children
            )}</li>
                                <li class="list-group-item"><strong>Family Background:</strong> ${escape(
                celebrity.family
            )}</li>
                                <li class="list-group-item"><strong>Close Friendships / Collaborations:</strong> ${renderFriends(
                celebrity.friends
            )}</li>
                            </ul>
                        </div>
                        <div class="col-md-6">
                            <div class="card">
                                <div class="card-body">
                                    <h6 class="card-title text-primary">Publicly Shared Insights</h6>
                                    <ul id="personalInsights">
                                        ${renderInsights(celebrity.personalInsights)}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                                <div class="align-center">
                    <script async
                        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4436674424567426"
                        crossorigin="anonymous"></script>
                    <!-- big -->
                    <ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-4436674424567426"
                        data-ad-slot="4449861684" data-ad-format="auto" data-full-width-responsive="true"></ins>
                    <script>
                        (adsbygoogle = window.adsbygoogle || []).push({});
                    </script>
                </div>
                <!-- Net Worth / Lifestyle -->
                <section id="networth" class="mb-5">
                    <div class="section-title px-3"><i class="bi bi-cash-stack"></i> Net Worth / Lifestyle</div>
                    <div class="row">
                        <div class="col-md-6">
                            <div class="card">
                                <div class="card-body">
                                    <h6 class="card-title text-primary">Estimated Net Worth</h6>
                                    <p class="fs-4 fw-bold text-success" id="netWorth">$${escape(
                formatAmount(celebrity.networth)
            )}</p>
                                    <h6 class="card-title text-primary mt-3">Assets</h6>
                                    <ul id="assetsList">
                                        ${renderAssets(celebrity.assets)}
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="card bg-light">
                                <div class="card-body">
                                    <h6 class="card-title text-primary">Philanthropy</h6>
                                    <ul id="philanthropyList">
                                        ${renderPhilanthropy(celebrity.philanthropy)}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                                <div class="align-center">
                    <script async
                        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4436674424567426"
                        crossorigin="anonymous"></script>
                    <!-- big -->
                    <ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-4436674424567426"
                        data-ad-slot="4449861684" data-ad-format="auto" data-full-width-responsive="true"></ins>
                    <script>
                        (adsbygoogle = window.adsbygoogle || []).push({});
                    </script>
                </div>
                <!-- Recent News or Trends -->
                <section id="news" class="mb-5">
                    <div class="section-title px-3"><i class="bi bi-newspaper"></i> Recent News or Trends</div>
                    <div class="row">
                        <div class="col-md-12">
                            <div class="card">
                                <div class="card-body">
                                    <h6 class="card-title text-primary">Latest Updates</h6>
                                    <ul id="newsList">
                                        ${renderNews(celebrity.news)}
                                    </ul>
                                    <p class="text-muted">All news is sourced from reliable public sources and handled factually.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                                <div class="align-center">
                    <script async
                        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4436674424567426"
                        crossorigin="anonymous"></script>
                    <!-- big -->
                    <ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-4436674424567426"
                        data-ad-slot="4449861684" data-ad-format="auto" data-full-width-responsive="true"></ins>
                    <script>
                        (adsbygoogle = window.adsbygoogle || []).push({});
                    </script>
                </div>
                <!-- Fun Facts -->
                <section id="funfacts" class="mb-5">
                    <div class="section-title px-3"><i class="bi bi-lightbulb-fill"></i> Fun Facts</div>
                    <div class="row">
                        <div class="col-md-12" id="funFactsList">
                            ${renderFunFacts(celebrity.funFacts)}
                        </div>
                    </div>
                </section>
                                <div class="align-center">
                    <script async
                        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4436674424567426"
                        crossorigin="anonymous"></script>
                    <!-- big -->
                    <ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-4436674424567426"
                        data-ad-slot="4449861684" data-ad-format="auto" data-full-width-responsive="true"></ins>
                    <script>
                        (adsbygoogle = window.adsbygoogle || []).push({});
                    </script>
                </div>
            </main>
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
            <hr class="border-light my-4">
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
            <div class="text-center small mt-3">
                &copy; 2025 Dramaspot. All rights reserved | Developed By <a class="text-primary text-decoration-none" href="https://lonatech.onrender.com/">Lonatech solutions</a>.
            </div>
        </div>
    </footer>
    <script>
                function goTO(link){
             if (link && link !== "") {
                    window.open(link, "_blank"); // ✅ open in new tab
                }
            }
        // Sidebar toggler for mobile
        document.addEventListener('DOMContentLoaded', function () {
            var toggler = document.getElementById('toggler');
            if (toggler) {
                toggler.addEventListener('click', function () {
                    var sidebar = document.getElementById('sidebar');
                    sidebar.classList.toggle('hide');
                });
            }
            // Sidebar navigation active state and smooth scroll
            document.querySelectorAll('.sidebar .nav-link').forEach(function (link) {
                link.addEventListener('click', function (e) {
                    document.querySelectorAll('.sidebar .nav-link').forEach(function (l) {
                        l.classList.remove('active');
                    });
                    this.classList.add('active');
                    var href = this.getAttribute('href');
                    if (href && href.startsWith('#')) {
                        e.preventDefault();
                        var el = document.querySelector(href);
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                        document.getElementById('sidebar').classList.add('hide');
                    }
                });
            });
        });
    </script>
</body>
</html>
`);
    } catch (error) {
        console.error('Error rendering celebrity page:', error);
        res.status(500).send('<h1>Internal Server Error</h1>');
    }
};