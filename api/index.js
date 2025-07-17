// api/index.js
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

// Import individual API routes
const authApi = require('./auth');
const videosApi = require('./videos');
const uploadApi = require('./upload');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
// This is crucial for Vercel to serve your HTML, CSS, JS files
// When deployed on Vercel, this might be handled by Vercel's static file serving
// but it's good for local development.
app.use(express.static(path.join(__dirname, '../public')));

// Mount API routes
app.use(authApi);    // Handles /api/auth
app.use(videosApi);  // Handles /api/videos, /api/videos/:id
app.use(uploadApi);  // Handles /api/upload

// Fallback for root path to serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start the server for local development
// Vercel will not use this app.listen when deploying serverless functions
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
        console.log('Access admin login at http://localhost:3000/admin/login.html');
    });
}

// Export the app for Vercel (important for serverless functions)
module.exports = app;
