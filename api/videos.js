// api/videos.js
const express = require('express');
const bodyParser = require('body-parser');
const { getVideos, saveVideos } = require('../lib/db'); // ดึงฟังก์ชันจัดการ JSON DB

const app = express();
app.use(bodyParser.json());

// Middleware สำหรับตรวจสอบ Token (อย่างง่าย)
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // คาดหวัง "Bearer fake-admin-token"

    if (token === 'fake-admin-token') { // ตรวจสอบ Token อย่างง่าย
        next(); // อนุญาตให้ไปต่อ
    } else {
        res.status(403).json({ message: 'Forbidden: Invalid or missing token' });
    }
};

// Endpoint สำหรับดึงวิดีโอทั้งหมด
app.get('/api/videos', async (req, res) => {
    const videos = await getVideos();
    res.status(200).json(videos);
});

// Endpoint สำหรับเพิ่มวิดีโอใหม่ (ต้อง Login)
app.post('/api/videos', authenticateToken, async (req, res) => {
    const { title, description, url, thumbnailUrl } = req.body;
    if (!title || !url) {
        return res.status(400).json({ message: 'Title and URL are required.' });
    }

    const videos = await getVideos();
    const newVideo = {
        id: Date.now().toString(), // ID ง่ายๆ
        title,
        description: description || '',
        url,
        thumbnailUrl: thumbnailUrl || 'https://placehold.co/640x360/000000/FFFFFF?text=No+Thumbnail',
        uploadedAt: new Date().toISOString()
    };
    videos.push(newVideo);
    await saveVideos(videos);
    res.status(201).json(newVideo);
});

// Endpoint สำหรับลบวิดีโอ (ต้อง Login)
app.delete('/api/videos/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    let videos = await getVideos();
    const initialLength = videos.length;
    videos = videos.filter(video => video.id !== id);

    if (videos.length < initialLength) {
        await saveVideos(videos);
        res.status(200).json({ message: 'Video deleted successfully.' });
    } else {
        res.status(404).json({ message: 'Video not found.' });
    }
});

module.exports = app;