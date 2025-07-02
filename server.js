const express = require("express");
const cors = require("cors");
require("dotenv").config();
const path = require("path");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const http = require('http');
const socketIo = require('socket.io');
const fetch = require('node-fetch');

const app = express();
const server = http.createServer(app);

const socket = require('./socket');
const io = socket.init(server);

const PORT = process.env.PORT || 5000;

// === MIDDLEWARE ===
app.use(cors());
app.use(express.json()); // for application/json
app.use(express.urlencoded({ extended: false })); // for application/x-www-form-urlencoded
app.use(cookieParser());
app.use(morgan("dev"));

const TARGET_URL = "https://lonatech.onrender.com"; //
// === STATIC FILES ===

// === ROUTES ===
const articleRoutes = require('./routes/article');
const categoryRoutes = require('./routes/categories');
const userRoutes = require('./routes/users');
const uploadRoutes = require('./routes/upload');
const reactionRoutes = require('./routes/comments');
const home = require('./routes/userInterractions')
const compression = require('compression');
app.use(compression());

app.use('/article', articleRoutes);     // Article CRUD
app.use('/auth', userRoutes);            // User login/signup
app.use('/categories', categoryRoutes);  // Categories
app.use('/api', uploadRoutes);           // File uploads (media)
app.use('/reactions', reactionRoutes);
app.use("/chats", require("./routes/chats"));
app.use('/', home);
app.use('/newsletter', require('./routes/newsletter'));
app.use('/', require('./routes/assets'));
const sitemapRoutes = require('./routes/sitemap');
app.use('/', sitemapRoutes);
app.use('/admin', require('./routes/dashboard'));
app.use('/images', require('./routes/images'));

// === AUTO-PING EVERY 13 MINUTES === ✅
if (TARGET_URL) {
    setInterval(() => {
        fetch(`${TARGET_URL}`)
            .then(res => res.text())
            .then(body => console.log(`✅ Pinged ${TARGET_URL} — ${body}`))
            .catch(err => console.error(`❌ Failed to ping ${TARGET_URL}: ${err.message}`));
    }, 780000); // 13 minutes in milliseconds
}

// === 404 HANDLER ===
app.use((req, res, next) => {
  const filePath = path.join(__dirname, '.', 'public', '404.html');
  res.sendFile(filePath);
});

// === ERROR HANDLER ===
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Server Error' });
});

// === START SERVER ===
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
