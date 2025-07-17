// server.js
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

// Import individual API routes
const authApi = require('./api/auth');
const videosApi = require('./api/videos');
const uploadApi = require('./api/upload');
const netflixEpisodesApi = require('./api/netflix-episodes'); // เพิ่มการ import API ใหม่

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Mount API routes
app.use(authApi);    // Handles /api/auth
app.use(videosApi);  // Handles /api/videos, /api/videos/:id
app.use(uploadApi);  // Handles /api/upload
app.use(netflixEpisodesApi); // Mount API ใหม่สำหรับ Netflix Episodes

// Fallback for root path to serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Start the server for local development
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
        console.log('Access admin login at http://localhost:3000/admin/login.html');
    });
}

// Export the app for Vercel
module.exports = app;
