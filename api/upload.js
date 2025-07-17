// api/upload.js
const express = require('express');
const bodyParser = require('body-parser');
const cloudinary = require('../lib/cloudinary'); // ดึง Cloudinary config

const app = express();
// ใช้ body-parser.json() สำหรับข้อมูล JSON
app.use(bodyParser.json({ limit: '50mb' })); // เพิ่ม limit
// ใช้ body-parser.urlencoded() สำหรับข้อมูล form-urlencoded
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true })); // เพิ่ม limit

// Middleware สำหรับตรวจสอบ Token (อย่างง่าย)
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token === 'fake-admin-token') {
        next();
    } else {
        res.status(403).json({ message: 'Forbidden: Invalid or missing token' });
    }
};

// Endpoint สำหรับอัปโหลดไฟล์ไปยัง Cloudinary
app.post('/api/upload', authenticateToken, async (req, res) => {
    const { fileBase64, resourceType } = req.body; // รับไฟล์เป็น Base64 และประเภท (video/image)

    if (!fileBase64 || !resourceType) {
        return res.status(400).json({ message: 'File data and resource type are required.' });
    }

    try {
        const uploadResult = await cloudinary.uploader.upload(fileBase64, {
            resource_type: resourceType, // 'video' หรือ 'image'
            folder: 'my-video-app', // โฟลเดอร์ใน Cloudinary
            overwrite: true,
            invalidate: true
        });

        let thumbnailUrl = uploadResult.secure_url; // กำหนดค่าเริ่มต้นเป็น URL ของไฟล์ที่อัปโหลด

        if (resourceType === 'video') {
            // สำหรับวิดีโอ, ลองสร้าง URL รูปภาพปกโดยเปลี่ยนประเภท resource และ format
            // ตัวอย่าง: https://res.cloudinary.com/cloud_name/video/upload/v123/public_id.mp4
            // จะกลายเป็น: https://res.cloudinary.com/cloud_name/image/upload/v123/public_id.jpg
            const parts = uploadResult.secure_url.split('/');
            const publicIdWithExtension = parts.pop(); // เช่น 'my_video.mp4'
            const publicId = publicIdWithExtension.split('.')[0]; // เช่น 'my_video'
            const version = parts[parts.length - 2]; // เช่น 'v123' (version segment)

            // สร้าง URL รูปภาพปก
            thumbnailUrl = `https://res.cloudinary.com/${cloudinary.config().cloud_name}/image/upload/${version}/${publicId}.jpg`;
            console.log('Generated video thumbnail URL:', thumbnailUrl);
        }

        res.status(200).json({
            message: 'Upload successful',
            url: uploadResult.secure_url,
            publicId: uploadResult.public_id,
            thumbnailUrl: thumbnailUrl // ส่งคืน URL รูปภาพปกที่ได้มา
        });
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        res.status(500).json({ message: 'Failed to upload file to Cloudinary.', error: error.message });
    }
});

module.exports = app;
