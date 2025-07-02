/**
 * Search page rendering logic.
 * Shows only the search bar and results section.
 * Searched item is added to the query parameter (?q=).
 */

exports.renderSearch = (req, res) => {
    const query = req.query.q || '';

    res.send(`
    <!DOCTYPE html>
    <html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${query ? `Search results for "${query}"` : 'Search Celebrity Gossip'} | Drama Spots</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">

  <!-- Meta Tags for SEO -->
  <meta name="description" content="${query ? `Find celebrity gossip, trending news, and articles related to '${query}' on Drama Spots.` : 'Search and explore the latest celebrity gossip and trending stories on Drama Spots.'}">
  <meta name="keywords" content="${query ? `${query}, celebrity gossip, trending news, drama spots` : 'celebrity gossip, trending news, drama spots'}">
  <meta name="author" content="Drama Spots">
  <meta name="robots" content="index, follow">

  <!-- Open Graph for Facebook & LinkedIn -->
  <meta property="og:title" content="${query ? `Search: ${query}` : 'Search Celebrity Gossip'} | Drama Spots">
  <meta property="og:description" content="${query ? `Explore results related to '${query}' from top celebrity sources.` : 'Search and explore the latest drama and celebrity news.'}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://dramaspots.com/search?q=${encodeURIComponent(query)}">
  <meta property="og:image" content="https://dramaspots.com/assets/logo1.png">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${query ? `Search: ${query}` : 'Search Celebrity Gossip'} | Drama Spots">
  <meta name="twitter:description" content="${query ? `See what’s trending for '${query}' on Drama Spots.` : 'Search celebrity gossip, trends, and news on Drama Spots.'}">
  <meta name="twitter:image" content="https://dramaspots.com/assets/logo1.png">
<meta name="robots" content="noindex, nofollow">

  <!-- Canonical URL -->
  <link rel="canonical" href="https://dramaspots.com/search?q=${encodeURIComponent(query)}" />

<link rel="icon" type="image/png" href="/assets/logo1.png" sizes="32x32">
<link rel="icon" type="image/x-icon" href="/favicon.ico">
  <!-- JSON-LD Structured Data -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "SearchResultsPage",
    "name": "Search results for ${query}",
    "description": "Explore articles and gossip related to ${query} on Drama Spots.",
    "url": "https://dramaspots.com/search?q=${encodeURIComponent(query)}"
  }
  </script>
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4436674424567426"
     crossorigin="anonymous"></script>


  <!-- Bootstrap 5 -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">

        <style>
            body { background: #f8f9fa; font-family: 'Montserrat', sans-serif; }
            .btn-pink { background: rgb(248,81,136); color: #fff; }
            .btn-pink:hover { background: #e83e8c; }
            .hidden { display: none; }
            
        .btn-outline-pink{ border-color: #e83e8c;}
        </style>
    </head>
    <body>
        <div class="container py-4">
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
            <form class="d-flex justify-content-center mb-4" action="/search" method="get">
                <input id="search-input" class="form-control me-2" type="search" name="q" placeholder="Search celebrity news, gossip, or tags..." aria-label="Search" value="${query.replace(/"/g, '&quot;')}">
                <button class="btn btn-pink" type="submit"><i class="fas fa-search"></i> Search</button>
            </form>
            <section id="search-section">
                <div class="row g-3" id="search-results">
                    <!-- Results will be injected here -->
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
            </section>
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

        <script src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/js/all.min.js"></script>
        <script>
            let fetching = false;
            let currentPage = 1;
            let loading = false;
            let isLastPage = false;

            async function fetchResults(page = 1) {
                const query = document.getElementById('search-input').value.trim();
                if (!query) {
                    document.getElementById('search-results').innerHTML = '';
                    return;
                }
                fetching = true;
                if (page === 1) {
                    document.getElementById('search-results').innerHTML = '<p>Loading...</p>';
                }
                try {
                    const res = await fetch(\`/homepage/search/\${encodeURIComponent(query)}?page=\${page}\`);
                    if (!res.ok) throw new Error('Failed to fetch');
                    const data = await res.json();
                    const results = data.html;
                    if (page === 1) {
                        document.getElementById('search-results').innerHTML = results.length ? results : '<p>No item found</p>';
                    } else if (results.length) {
                        document.getElementById('search-results').insertAdjacentHTML('beforeend', results);
                    }
                    isLastPage = !!data.isLastPage;
                } catch (err) {
                    document.getElementById('search-results').innerHTML = '<p>Error fetching results.</p>';
                }
                fetching = false;
            }

            document.getElementById('search-input').addEventListener('input', () => {
                currentPage = 1;
                isLastPage = false;
                fetchResults(1);
            });

            window.addEventListener('scroll', () => {
                if (loading || isLastPage || !fetching) return;
                if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
                    loading = true;
                    currentPage++;
                    fetchResults(currentPage).finally(() => loading = false);
                }
            });

            // Initial fetch if query exists
            if ("${query}") fetchResults(1);
        </script>
    </body>
    </html>
    `);
};