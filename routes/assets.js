const express = require('express');
const checkAuthMiddleware   = require('../middlewares/check-auth');
const router = express.Router();
const { Celebrity, Insight } = require('../models');

const { renderCelebrity } = require('../render/celebrity');



router.get('/page/article', async (req, res) => {
    res.sendFile('article.html', { root: __dirname + '/../public' });
});

router.get('/add.css', async (req, res) => {
    res.sendFile('add.css', { root: __dirname + '/../public' });
});

router.get('/celeb/add', async (req, res) => {
    res.sendFile('add-celeb.html', { root: __dirname + '/../admin' });
});
router.get('/location.json', async (req, res) => {
    res.sendFile('location.json', { root: __dirname + '/../public' });
});
router.get('/celebrities', async (req, res) => {
    res.sendFile('celebrities.html', { root: __dirname + '/../public' });
});

// router.get('/music', async (req, res) => {
//     res.sendFile('music-home.html', { root: __dirname + '/../public' });
// });

// router.get('/music/my-playlist', async (req, res) => {
//     res.sendFile('my-playlist.html', { root: __dirname + '/../public' });
// });

router.get('/celebrities/edit', async (req, res) => {
    res.sendFile('celebrities-edit.html', { root: __dirname + '/../public' });
});

router.get('/celebrity/:slug', async(req, res, next) => {
        try {

            const celebrity = await Celebrity.findOne({
                where: { slug: req.params.slug },
                include: [Insight]
            });

            if (!celebrity) {
                return res.status(404).json({ error: 'Celebrity not found' });
            }

            const data = celebrity.toJSON();

            // Parse possible JSON fields in main Celebrity
            for (const key in data) {
                if (typeof data[key] === 'string') {
                    try {
                        const parsed = JSON.parse(data[key]);
                        if (typeof parsed === 'object' || Array.isArray(parsed)) {
                            data[key] = parsed;
                        }
                    } catch (_) {
                        // Not JSON, skip
                    }
                }
            }

            // Flatten first Insight if it exists
            const insight = Array.isArray(data.Insights) ? data.Insights[0] : null;
            if (insight) {
                for (const key in insight) {
                    if (typeof insight[key] === 'string') {
                        try {
                            const parsed = JSON.parse(insight[key]);
                            if (typeof parsed === 'object' || Array.isArray(parsed)) {
                                data[key] = parsed;
                            } else {
                                data[key] = insight[key];
                            }
                        } catch (_) {
                            data[key] = insight[key]; // leave as is
                        }
                    } else {
                        data[key] = insight[key];
                    }
                }
            }

            delete data.Insights;

            req.celebrity = data;
            return next();
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to fetch celebrity' });
        }
    }, renderCelebrity);

router.get('/article.js', async (req, res) => {
    res.sendFile('article.js', { root: __dirname + '/../public' });
});

router.get('/assets/logo.png', async (req, res) => {
    res.sendFile('logo.png', { root: __dirname + '/../public' });
});
router.get('/assets/logo1.png', async (req, res) => {
    res.sendFile('logo5.png', { root: __dirname + '/../public' });
});
router.get('/assets/logo2.png', async (req, res) => {
    res.sendFile('logo5.png', { root: __dirname + '/../public' });
});
router.get('/assets/celebs.png', async (req, res) => {
    res.sendFile('celebs.png', { root: __dirname + '/../public' });
});
router.get('/assets/cover.png', async (req, res) => {
    res.sendFile('cover.png', { root: __dirname + '/../public' });
});
router.get('/privacy', async (req, res) => {
    res.sendFile('privacy.html', { root: __dirname + '/../public' });
});

router.get('/about', async (req, res) => {
    res.sendFile('about.html', { root: __dirname + '/../public' });
});

router.get('/contact', async (req, res) => {
    res.sendFile('contact.html', { root: __dirname + '/../public' });
});
router.get('/terms', async (req, res) => {
    res.sendFile('terms.html', { root: __dirname + '/../public' });
});

router.get('/scripts/app.js', async (req, res) => {
    res.send(`if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(reg => console.log('Service Worker registered', reg.scope))
      .catch(err => console.log('Service Worker failed', err));
  });
}

let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault(); // Prevent automatic prompt
  deferredPrompt = e;

  // Show install button (e.g. a div or button you control)
  const installBtn = document.getElementById('installApp');
  installBtn.style.display = 'inline-block';

  installBtn.addEventListener('click', () => {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      deferredPrompt = null;
    });
  });
});


`)
});

router.get('/styles/main.css', async (req, res) => {
    res.send(``);
});

module.exports = router;