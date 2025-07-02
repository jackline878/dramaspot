const express = require('express');
const { Category, Article, Subcategory, Hashtag } = require('../models'); // Adjust path as needed

const { breakUp } = require('../render/break-up');
const subcategory = require('../models/subcategory');
const router = express.Router();

// Utility to generate slug from name
function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/[\s\W-]+/g, '-') // Replace spaces and non-word chars with -
        .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

router.get('/hashtags', async (req, res) => {
    try {
        const hashtags = await Hashtag.findAll({
            where: {
                name: {
                    [require('sequelize').Op.like]: `%${req.query.q || ''}%`
                }
            },
            attributes: ['name']
        });

        if (!hashtags || hashtags.length === 0) {
            return res.status.json([]);
        }

        res.json(hashtags.map(h => h.name));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Home: Show form and list with edit/delete
router.get('/all', async (req, res) => {
    let categories = await Category.findAll({
        attributes: ['id', 'name'],
        include: [
            {
                model: Subcategory,
                attributes: ['id', 'name'],
                as: 'subcategories',
            },
          ],
    });
    
    res.json(categories);
});

router.get('/xx', async (req, res) => {
    let categories = await Category.findAll({
        attributes: ['id', 'name', 'description',],
        include: [
            {
                model: subcategory,
                as: 'subcategories',
                attributes: ['id', 'name', 'description']
            },
          ],
        order: [['name', 'ASC']]
    });
    
        return res.json(categories);
    categories = categories.map(c => c.toJSON());
    if (!req.headers['content-type'] && !req.headers['content-type'].includes('application/json')) {
        return res.json(categories);
    }
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>Categories</title>
      <style>
        body {
          font-family: 'Segoe UI', Arial, sans-serif;
          background: #f7f8fa;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background: #fff;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.07);
          padding: 32px 40px 40px 40px;
        }
        h2, h3 {
          color: #2d3748;
        }
        form {
          margin-bottom: 24px;
        }
        label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
        }
        input[type="text"] {
          width: 100%;
          padding: 10px;
          border: 1px solid #cbd5e1;
          border-radius: 5px;
          margin-bottom: 16px;
          font-size: 1rem;
        }
        button {
          background: #2563eb;
          color: #fff;
          border: none;
          padding: 10px 22px;
          border-radius: 5px;
          font-size: 1rem;
          cursor: pointer;
          transition: background 0.2s;
        }
        button:hover {
          background: #1d4ed8;
        }
        ul {
          list-style: none;
          padding: 0;
        }
        li {
          background: #f1f5f9;
          margin-bottom: 8px;
          padding: 10px 16px;
          border-radius: 5px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .slug {
          color: #64748b;
          font-size: 0.95em;
        }
        .actions {
          display: flex;
          gap: 8px;
        }
        .actions form {
          margin: 0;
        }
        .edit-input {
          width: 120px;
          margin-right: 8px;
        }
      </style>
      <script>
        function enableEdit(id, name) {
          const li = document.getElementById('cat-' + id);
          li.querySelector('.display').style.display = 'none';
          li.querySelector('.edit-form').style.display = 'flex';
          li.querySelector('.edit-input').value = name;
        }
        function cancelEdit(id) {
          const li = document.getElementById('cat-' + id);
          li.querySelector('.display').style.display = 'flex';
          li.querySelector('.edit-form').style.display = 'none';
        }
      </script>
    </head>
    <body>
      <div class="container">
        <h2>Add a New Category</h2>
        <form action="/categories" method="POST">
          <label for="name">Category Name:</label>
          <input type="text" id="name" name="name" required />
          <button type="submit">Add</button>
        </form>
        <hr />
        <h3>Existing Categories</h3>
        <ul>
          ${categories.map(c => `
            <li id="cat-${c.id}">
              <div class="display" style="display:flex;align-items:center;gap:16px;">
                <span>${c.name} <span class="slug">(${c.slug})</span></span>
                <div class="actions">
                  <button type="button" onclick="enableEdit(${c.id}, '${c.name.replace(/'/g, "\\'")}')">Edit</button>
                  <form action="/categories?id=${c.id}&_method=DELETE" method="POST" onsubmit="return confirm('Delete this category?');">
                    <button type="submit" style="background:#ef4444;">Delete</button>
                  </form>
                </div>
              </div>
              <form class="edit-form" action="/categories?id=${c.id}&_method=PUT" method="POST" style="display:none;align-items:center;gap:8px;">
                <input class="edit-input" type="text" name="name" value="${c.name}" required />
                <button type="submit">Save</button>
                <button type="button" onclick="cancelEdit(${c.id})" style="background:#64748b;">Cancel</button>
              </form>
            </li>
          `).join('')}
        </ul>
      </div>
      <script>
        // Support _method override for forms
        document.querySelectorAll('form').forEach(form => {
          if (form.action.includes('_method=PUT') || form.action.includes('_method=DELETE')) {
            form.addEventListener('submit', function(e) {
              e.preventDefault();
              const method = form.action.includes('_method=PUT') ? 'PUT' : 'DELETE';
              const url = form.action.replace(/([&?])_method=(PUT|DELETE)/, '');
              let body = null;
              let headers = {};
              if (method === 'PUT') {
                body = new URLSearchParams(new FormData(form));
                headers['Content-Type'] = 'application/x-www-form-urlencoded';
              }
              fetch(url, {
                method,
                headers,
                body: method === 'PUT' ? body : undefined
              }).then(() => window.location.reload());
            });
          }
        });
      </script>
    </body>
    </html>
  `);
});

// Get a single category by ID
router.get('/:id', async (req, res, next) => {
    try {
        const category = await Category.findByPk(req.params.id, {
            attributes: ['id', 'name', 'slug'],
            include: [
                {
                    model: Article,
                    as: 'articles',
                    attributes: ['id', 'title', 'slug']
                }
            ]
        });

        if (!category) {
            return res.status(404).send('<h1>Category not found</h1>');
        }

        if (category.articles && category.articles.length > 0) {
          req.category = {
            id: category.id,
            name: category.name,
            slug: category.slug
          };
          req.articles = category.articles;
          next();
        } else {
          
        res.send(`<li class="list-group-item text-muted">No articles found in this category.</li>`);
        }
    } catch (err) {
        res.status(500).send('<h1>Server Error</h1>');
    }
}, breakUp);

router.get('/ccccc/:id', async (req, res) => {
    try {
        const category = await Category.findByPk(1, {
            attributes: ['id', 'name', 'slug'],
            include: [
                {
                    model: Article,
                    as: 'articles',
                    attributes: ['id', 'title', 'slug']
                }
            ]
        });

        if (!category) {
            return res.status(404).send('<h1>Category not found</h1>');
        }

        // Build HTML with Bootstrap 5 and custom CSS
        let html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>Articles in ${category.name}</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
            <style>
                body {
                    background: #f8f9fa;
                }
                .ad-placeholder {
                    background: #e9ecef;
                    border: 2px dashed #adb5bd;
                    color: #6c757d;
                    text-align: center;
                    padding: 40px 0;
                    margin: 30px 0;
                    font-size: 1.25rem;
                    border-radius: 8px;
                }
            </style>
        </head>
        <body>
            <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
                <div class="container">
                    <a class="navbar-brand" href="/">Celebrity Blog</a>
                </div>
            </nav>
            <div class="container py-5">
                <h1 class="mb-4">Articles in <span class="text-primary">${category.name}</span></h1>
                <div class="ad-placeholder mb-4">
                    Advertisement Placeholder
                </div>
                <ul class="list-group mb-4">
        `;

        if (category.articles && category.articles.length > 0) {
            category.articles.forEach(article => {
                html += `
                    <li class="list-group-item">
                        <a href="/articles/${article.slug}" class="text-decoration-none">${article.title}</a>
                    </li>
                `;
            });
        } else {
            html += `<li class="list-group-item text-muted">No articles found in this category.</li>`;
        }

        html += `
                </ul>
                <div class="ad-placeholder mb-4">
                    Advertisement Placeholder
                </div>
                <a href="/" class="btn btn-secondary">Back to Home</a>
            </div>
            <footer class="bg-dark text-white text-center py-3 mt-5">
                &copy; ${new Date().getFullYear()} Celebrity Blog. All rights reserved.
            </footer>
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
        </body>
        </html>
        `;

        res.send(html);
    } catch (err) {
        res.status(500).send('<h1>Server Error</h1>');
    }
});

// Create a new category
router.post(
    '/',
    express.urlencoded({ extended: true }),
    express.json(),
    async (req, res) => {
        const { name } = req.body;
        if (!name) return res.status(400).json({ message: 'Name is required' });
        const slug = slugify(name);
        const exists = await Category.findOne({ where: { slug } });
        if (exists) {
            return res.status(400).json({ message: 'Category slug already exists' });
        }
        const newCategory = await Category.create({ name, slug });
        if (
            req.headers['content-type'] &&
            req.headers['content-type'].includes('application/x-www-form-urlencoded')
        ) {
            return res.redirect('/categories');
        }
        res.status(201).json(newCategory);
    }
);

// Update a category (support both JSON and urlencoded)
router.put(
    '/',
    express.urlencoded({ extended: true }),
    express.json(),
    async (req, res) => {
        const id = req.query.id;
        const category = await Category.findByPk(id);
        if (!category) return res.status(404).json({ message: 'Category not found' });
        const { name } = req.body;
        if (!name) return res.status(400).json({ message: 'Name is required' });
        const slug = slugify(name);
        const exists = await Category.findOne({
            where: { slug, id: { [require('sequelize').Op.ne]: id } }
        });
        if (exists) {
            return res.status(400).json({ message: 'Category slug already exists' });
        }
        category.name = name;
        category.slug = slug;
        await category.save();
        if (
            req.headers['content-type'] &&
            req.headers['content-type'].includes('application/x-www-form-urlencoded')
        ) {
            return res.redirect('/categories');
        }
        res.json(category);
    }
);

// Delete a category (support both JSON and urlencoded)
router.delete('/', async (req, res) => {
    const id = req.query.id;
    const category = await Category.findByPk(id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    await category.destroy();
    if (
        req.headers['content-type'] &&
        req.headers['content-type'].includes('application/x-www-form-urlencoded')
    ) {
        return res.redirect('/categories');
    }
    res.json({ message: 'Category deleted', id });
});

module.exports = router;