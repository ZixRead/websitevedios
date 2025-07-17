// lib/db.js
const fs = require('fs');
const path = require('path');

const videosFilePath = path.resolve(process.cwd(), 'data', 'videos.json');

// ตรวจสอบและสร้างไฟล์ videos.json ถ้ายังไม่มี
if (!fs.existsSync(videosFilePath)) {
    try {
        fs.mkdirSync(path.dirname(videosFilePath), { recursive: true });
        fs.writeFileSync(videosFilePath, JSON.stringify([]), 'utf8');
        console.log('Created empty videos.json file.');
    } catch (error) {
        console.error('Error creating videos.json:', error);
    }
}

/**
 * อ่านข้อมูลวิดีโอทั้งหมดจากไฟล์ JSON
 * @returns {Array} รายการวิดีโอ
 */
async function getVideos() {
    try {
        const data = await fs.promises.readFile(videosFilePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading videos.json:', error);
        return [];
    }
}

/**
 * บันทึกข้อมูลวิดีโอทั้งหมดลงในไฟล์ JSON
 * @param {Array} videos - รายการวิดีโอที่จะบันทึก
 */
async function saveVideos(videos) {
    try {
        await fs.promises.writeFile(videosFilePath, JSON.stringify(videos, null, 2), 'utf8');
    } catch (error) {
        console.error('Error writing videos.json:', error);
    }
}

module.exports = {
    getVideos,
    saveVideos
};
