// api/auth.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Endpoint สำหรับ Login
app.post('/api/auth', (req, res) => {
    const { username, password } = req.body;
    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (username === adminUsername && password === adminPassword) {
        // ในการใช้งานจริง ควรสร้าง Token หรือ Session ID ที่ปลอดภัยกว่านี้
        res.status(200).json({ success: true, message: 'Login successful', token: 'fake-admin-token' });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

module.exports = app;
