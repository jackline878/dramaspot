const { Category, Article } = require('../models');
const express = require('express');

exports.renderMusic = async (req, res) => {
    try {

        const { mainSong, related } = req.music;

                const relatedStructuredData = (related || []).map((r, i) => ({
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
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
     <!--SEO TAGS -->
        <title>${mainSong.title} | Dramaspots</title>
        <meta name="title" content="${mainSong.title} | Dramaspots">
        <meta name="description" content="Get and Download: ${mainSong.title}, Duration: ${mainSong.duration}">
        <meta property="og:type" content="website">
        <meta property="og:site_name" content="Dramaspots">
        <meta property="og:title" content="${mainSong.title} | Dramaspots">
        <meta property="og:description" content="Get and Download: ${mainSong.title}, Duration: ${mainSong.duration}">
        <meta property="og:locale" content="en_ZA">
        <meta property="og:image" content="${mainSong.img}">
        <meta property="og:image:width" content="1200">
        <meta property="og:image:height" content="630">
        <meta property="og:image:alt" content="${mainSong.title} | Dramaspots">
        <meta property="og:image:type" content="image/jpg">
        <meta property="og:url" content="https://dramaspots.com/music/${mainSong.link}">
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:site" content="@dramaSpot254">
        <meta name="twitter:title" content="${mainSong.title} | Dramaspots">
        <meta name="twitter:description" content="Get and Download: ${mainSong.title}, Duration: ${mainSong.duration}">
        <meta name="twitter:creator" content="@dramaSpot254">
        <meta name="twitter:image" content="${mainSong.img}">
        <meta name="twitter:label1" content="Author">
        <meta name="twitter:data1" content="Dramaspots">
        <meta name="twitter:label2" content="Estimated Reading Time">
        <meta name="twitter:data2" content="2 minutes">
        <meta name="robots" content="noindex, nofollow">

        <!-- Canonical Link -->
        <link rel="canonical" href="https://dramaspots.com/music/${mainSong.link}">
        <link rel="alternate" href="https://dramaspots.com/music/${mainSong.link}" hreflang="en-ZA">
        
            <!-- Favicon -->
    <link rel="icon" type="image/png" href="/assets/logo1.png" sizes="32x32">
    <link rel="icon" type="image/x-icon" href="/favicon.ico">

    <!-- Structured Data -->
    <script type="application/ld+json">
${JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
                {
                    "@type": "Music",
                    "headline": mainSong.title,
                    "image": [mainSong.img],
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
                        "@id": `https://dramaspots.com/music/${mainSong.link}`
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
                            "name": `${mainSong.title}`,
                            "item": `https://dramaspots.com/music/${mainSong.link}`
                        }
                    ]
                },
                {
                    "@type": "ItemList",
                    "name": "Related Music",
                    "itemListElement": relatedStructuredData
                }
            ]
        }, null, 2)}
    </script>

    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css" rel="stylesheet">
    <style>
        body {
            background: #f8f9fa;
        }
        .music-cover {
            width: 100%;
            box-shadow: 0 4px 24px rgba(0,0,0,0.12);
        }
        .music-actions .btn {
            min-width: 48px;
        }
        .music-meta {
            font-size: 1rem;
            color: #6c757d;
        }
        .music-description {
            font-size: 1.1rem;
        }
        .download-options .btn {
            margin-bottom: 0.5rem;
        }
        .progress-bar {
            transition: width 0.4s;
        }
        .comment-avatar {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            object-fit: cover;
        }
        .comment-box {
            background: #fff;
            border-radius: 0.5rem;
            padding: 1rem;
            margin-bottom: 1rem;
            box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        .tag {
            background: #e9ecef;
            border-radius: 0.25rem;
            padding: 0.25rem 0.75rem;
            font-size: 0.95rem;
            margin-right: 0.5rem;
        }
        .music-player {
            background: #fff;
            border-radius: 1rem;
            box-shadow: 0 2px 12px rgba(0,0,0,0.08);
            padding: 2rem;
        }
        .music-details-list li {
            margin-bottom: 0.5rem;
        }
        .music-stats {
            font-size: 1.1rem;
        }
        .music-stats .stat {
            margin-right: 2rem;
        }
        .music-actions .btn.active {
            color: #fff;
            background: #d11e5a;
        }
        @media (max-width: 991px) {
            .music-cover {
                max-width: 100%;
                margin-bottom: 2rem;
            }
            .music-player {
                padding: 1rem;
            }
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
        @media (max-width: 575px) {
            .music-player {
                padding: 0.5rem;
            }
            .music-actions .btn {
                min-width: 40px;
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
    <!-- Music Details Section -->
    <section class="py-2">
  <div class="container music-player">
    <h2 class="fw-bold mb-2">${mainSong.title}</h2>
    <div class="row g-5 align-items-start">
      <div class="col-lg-6">
        <div class="mb-4">

          <!-- Music Cover Image -->
          <img src="${mainSong.img}" alt="Music Cover" class="music-cover mb-3 shadow ${
            mainSong.downloadData?.some(item => item.label.toLowerCase().includes('video')) ? 'd-none' : ''
          }">

          <!-- Audio or Video Player -->
          ${
            mainSong.downloadData?.length
              ? (
                mainSong.downloadData.some(item => item.label.toLowerCase().includes('video'))
                ? `
                  <video id="audioPlayer" controls class="w-100 mb-3">
                    <source src="${mainSong.downloadData.find(item => item.label.toLowerCase().includes('video')).link}" type="video/mp4">
                    Your browser does not support the video element.
                  </video>`
                : `
                  <audio id="audioPlayer" controls class="w-100 mb-3">
                    <source src="${mainSong.downloadData.find(item => item.label.toLowerCase().includes('audio')).link}" type="audio/mp3">
                    Your browser does not support the audio element.
                  </audio>`
              )
              : ''
          }

          <!-- Player Controls -->
          <div class="d-flex justify-content-center align-items-center gap-3 mb-3">
            <button class="btn btn-primary" id="playBtn"><i class="fa-solid fa-play"></i> Play</button>
            <button class="btn btn-outline-secondary" id="pauseBtn"><i class="fa-solid fa-pause"></i> Pause</button>
            <button class="btn btn-outline-primary" id="rewindBtn"><i class="fa-solid fa-backward"></i></button>
            <button class="btn btn-outline-primary" id="forwardBtn"><i class="fa-solid fa-forward"></i></button>
          </div>

          <!-- Time and Progress -->
          <span id="currentTime" class="ms-3">0:00</span> / <span id="duration">0:00</span>
          <div class="progress mt-1" style="height: 8px;">
            <div class="progress-bar bg-primary" id="audioProgress" role="progressbar" style="width: 0%;"></div>
          </div>

        </div>
      </div>

      <!-- Download & Share Section -->
      <div class="col-lg-6">
        <div class="download-options mb-4">
          <h5>Download & Play Options</h5>
          <div class="d-flex flex-column gap-2">
            ${
              mainSong.downloadData?.length
                ? mainSong.downloadData.map(item => `
                  <div class="d-flex align-items-center gap-2">
                    <a href="${item.link}" download class="btn btn-outline-${item.label.toLowerCase().includes('video') ? 'success' : 'info'}">
                      <i class="fa-solid fa-download"></i> Download ${item.label} (${item.size})
                    </a>
                    <button class="btn btn-outline-${item.label.toLowerCase().includes('video') ? 'success' : 'info'} play-source-btn" data-src="${item.link}" data-type="${item.label.toLowerCase().includes('video') ? 'video' : 'audio'}">
                      <i class="fa-solid fa-play"></i> Play ${item.label}
                    </button>
                  </div>
                `).join('')
                : '<span class="text-muted">No download options available</span>'
            }
          </div>

          <!-- Playlist and Share -->
          <div class="d-flex gap-2 mt-3 flex-wrap align-items-center">
            <button class="btn btn-outline-dark" id="addPlaylistBtn"
              data-title="${mainSong.title}"
              data-link="${mainSong.link}"
              data-img="${mainSong.img}"
              data-duration="${mainSong.duration}">
              <i class="fa-solid fa-list"></i> Add to Playlist
            </button>

            <div class="d-flex gap-2 align-items-center">
              <button class="btn btn-sm btn-outline-primary share-btn" data-platform="facebook"
                data-title="${mainSong.title}" data-link="https://dramaspots.com/music/${mainSong.link}" data-img="${mainSong.img}">
                <i class="fab fa-facebook-f"></i>
              </button>
              <button class="btn btn-sm btn-outline-dark share-btn" data-platform="twitter"
                data-title="${mainSong.title}" data-link="https://dramaspots.com/music/${mainSong.link}" data-img="${mainSong.img}">
                <i class="fab fa-x-twitter"></i>
              </button>
              <button class="btn btn-sm btn-outline-success share-btn" data-platform="whatsapp"
                data-title="${mainSong.title}" data-link="https://dramaspots.com/music/${mainSong.link}" data-img="${mainSong.img}">
                <i class="fab fa-whatsapp"></i>
              </button>
            </div>
          </div>

        </div>
      </div>

    </div>
  </div>
</section>


    ${
        related.length?`
        
    <!-- Related Music Section -->
    <section class="py-5 bg-light">
        <div class="container">
            <h4 class="mb-4">Related Music</h4>
            <div class="row g-1">
                ${
                    related.map(r => `
                        <div class="col-md-3 col-6">
                    <div class="card h-100 shadow-sm">
                        <img src="${r.img}" class="card-img-top" alt="Related Song 1">
                        <div class="card-body">
                            <h6 class="card-title mb-1">${r.title}</h6>
                            <p class="card-text text-muted mb-2"><i class="far fa-clock"></i>&nbsp;${r.duration}</p>
                            <div class="my-2 d-flex gap-2 align-items-center">
  <button class="btn btn-sm btn-outline_primary share-btn" data-platform="facebook"
    data-title="${r.title}" data-link="https://dramaspots.com/music/${r.link}" data-img="${r.img}">
    <i class="fab fa-facebook-f"></i>
  </button>
  <button class="btn btn-sm btn-dark share-btn" data-platform="twitter"
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
        </div>
    </section>

        `:``
    }
 
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
                        <li><a href="/category/Relationships%20&%20Love%20Life"
                                class="footer-link text-white text-decoration-none">Relationships & Love Life</a></li>
                        <li><a href="/category/Red%20Carpet%20&%20Events"
                                class="footer-link text-white text-decoration-none">Red Carpet & Events</a></li>
                        <li><a href="/category/News" class="footer-link text-white text-decoration-none">News</a></li>
                        <li><a href="/about" class="footer-link text-white text-decoration-none">About</a></li>
                        <li><a href="/contact" class="footer-link text-white text-decoration-none">Contact Us</a></li>
                    </ul>
                </div>

                <!-- Legal Pages -->
                <div class="col-md-3 mb-4 mb-md-0">
                    <h6 class="fw-bold">Legal</h6>
                    <ul class="list-unstyled small">
                        <li><a href="/terms" class="footer-link text-white text-decoration-none">Terms & Conditions</a>
                        </li>
                        <li><a href="/privacy" class="footer-link text-white text-decoration-none">Privacy Policy</a>
                        </li>
                    </ul>
                </div>

                <!-- Newsletter Signup -->
                <div class="col-md-3">
                    <h6 class="fw-bold">Newsletter</h6>
                    <form id="subsciptionForm" action="/newsletter/subscribe" method="POST"
                        class="d-flex flex-column gap-2">
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
                    <p class="mb-0">Email: <a href="mailto:dramaspots254@gmail.com"
                            class="text-white">dramaspots254@gmail.com</a></p>
                </div>
                <div class="col-md-6 text-center text-md-end">
                    <a href="https://x.com/dramaSpot254" class="text-white text-decoration-none me-3"><i
                            class="bi bi-x"></i> X</a>
                    <a href="https://www.instagram.com/dramaspots254/" class="text-white text-decoration-none me-3"><i
                            class="bi bi-instagram"></i> Instagram</a>
                    <a href="https://www.youtube.com/@dramaspot-w2r" class="text-white text-decoration-none"><i
                            class="bi bi-youtube"></i> YouTube</a>
                    <a href="https://www.tiktok.com/@dramaspots254" class="text-white text-decoration-none"><i
                            class="bi bi-tiktok"></i> Tiktok</a>
                </div>
            </div>

            <!-- Copyright -->
            <div class="text-center small mt-3">
                &copy; 2025 Dramaspot. All rights reserved | Developed By <a class="text-primary text-decoration-none"
                    href="https://lonatech.onrender.com/">Lonatech solutions</a>.
            </div>
        </div>
    </footer>

    <!-- Bootstrap JS and dependencies -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    <script>
      // Audio Player Controls
        const audio = document.getElementById('audioPlayer');
        const playBtn = document.getElementById('playBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const rewindBtn = document.getElementById('rewindBtn');
        const forwardBtn = document.getElementById('forwardBtn');
        const currentTimeEl = document.getElementById('currentTime');
        const durationEl = document.getElementById('duration');
        const progressBar = document.getElementById('audioProgress');

        function formatTime(sec) {
            const m = Math.floor(sec / 60);
            const s = Math.floor(sec % 60);
            return m + ':' + (s < 10 ? '0' : '') + s;
        }

        audio.addEventListener('loadedmetadata', () => {
            durationEl.textContent = formatTime(audio.duration);
        });

        audio.addEventListener('timeupdate', () => {
            currentTimeEl.textContent = formatTime(audio.currentTime);
            progressBar.style.width = ((audio.currentTime / audio.duration) * 100) + '%';
        });

        playBtn.addEventListener('click', () => audio.play());
        pauseBtn.addEventListener('click', () => audio.pause());
        rewindBtn.addEventListener('click', () => audio.currentTime = Math.max(0, audio.currentTime - 10));
        forwardBtn.addEventListener('click', () => audio.currentTime = Math.min(audio.duration, audio.currentTime + 10));

        // Play button for each download/play option
        document.querySelectorAll('.play-source-btn').forEach(btn => {
            btn.addEventListener('click', function() {
            const src = this.getAttribute('data-src');
            const type = this.getAttribute('data-type');
            if (type === 'audio') {
            document.querySelector('.music-cover').classList.remove('d-none');



                let audio = document.getElementById('audioPlayer');
            if (audio.tagName.toLowerCase() !== 'audio') {
                const parent = audio.parentNode;
                const newAudio = document.createElement('audio');
                newAudio.id = 'audioPlayer';
                newAudio.controls = true;
                newAudio.className = audio.className;
                newAudio.style.width = audio.style.width;
                const source = document.createElement('source');
                source.src = src;
                source.type = 'audio/mp3';
                newAudio.appendChild(source);
                parent.replaceChild(newAudio, audio);
                // Re-attach controls
                attachPlayerControls(newAudio);
                newAudio.play();
                } else {
                if (audio.src !== src) {
                audio.src = src;
                }
                
                audio.play();
         }
            } else if (type === 'video') {
             
                // If video, replace audio element with video element
                
                document.querySelector('.music-cover').classList.add('d-none');
                let video = document.getElementById('audioPlayer');
                if (video.tagName.toLowerCase() !== 'video') {
                const parent = video.parentNode;
                const newVideo = document.createElement('video');
                newVideo.id = 'audioPlayer';
                newVideo.controls = true;
                newVideo.className = video.className;
                newVideo.style.width = video.style.width;
                const source = document.createElement('source');
                source.src = src;
                source.type = 'video/mp4';
                newVideo.appendChild(source);
                parent.replaceChild(newVideo, video);
                // Re-attach controls
                attachPlayerControls(newVideo);
                newVideo.play();
                } else {
                if (video.src !== src) {
                    video.src = src;
                }
                video.play();
                }
            }
            });
        });

        // Helper to re-attach controls after replacing audio/video element
        function attachPlayerControls(player) {
            player.addEventListener('loadedmetadata', () => {
            durationEl.textContent = formatTime(player.duration);
            });
            player.addEventListener('timeupdate', () => {
            currentTimeEl.textContent = formatTime(player.currentTime);
            progressBar.style.width = ((player.currentTime / player.duration) * 100) + '%';
            });
            playBtn.addEventListener('click', () => player.play());
            pauseBtn.addEventListener('click', () => player.pause());
            rewindBtn.addEventListener('click', () => player.currentTime = Math.max(0, player.currentTime - 10));
            forwardBtn.addEventListener('click', () => player.currentTime = Math.min(player.duration, player.currentTime + 10));
        }

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
  </script>
  <script>
  document.addEventListener('DOMContentLoaded', () => {
    const addBtn = document.getElementById('addPlaylistBtn');

    addBtn.addEventListener('click', () => {
      const title = addBtn.getAttribute('data-title');
      const link = addBtn.getAttribute('data-link');
      const img = addBtn.getAttribute('data-img');
      const duration = addBtn.getAttribute('data-duration');

      const newSong = { title, link, img, duration };

      // Get existing playlist or initialize empty array
      let playlist = JSON.parse(localStorage.getItem('playlist')) || [];

      // Check if playlist has 150 items
      if (playlist.length >= 150) {
        alert('Playlist limit of 150 reached.');
        if(confirm('Playlist limit of 150 reached. Manage Playlist')){
            window.location.href = "/music/my-playlist";
        }
        return;
      }

      // Optional: Check if song already exists (based on unique link)
      const alreadyAdded = playlist.some(song => song.link === newSong.link);
      if (alreadyAdded) {
        if(confirm('This song is already in your playlist. Go to Playlist')){
            window.location.href = "/music/my-playlist";
        }
        return;
      }

      // Add new song and update localStorage
      playlist.push(newSong);
      localStorage.setItem('playlist', JSON.stringify(playlist));

              if(confirm('Song added to your playlist successfully!. Explore Playlist')){
            window.location.href = "/music/my-playlist";
        }
    });
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
