// api/netflix-episodes.js
require('dotenv').config();
const express = require('express');
const app = express();

// Endpoint สำหรับดึงข้อมูล Netflix Episodes
app.get('/api/netflix-episodes', async (req, res) => {
    const rapidApiKey = process.env.X_RAPIDAPI_KEY; // ดึง API Key จาก .env
    const rapidApiHost = 'netflix54.p.rapidapi.com';
    const ids = '80077209,80117715'; // IDs ของซีซันที่คุณต้องการดึงข้อมูล
    const offset = 0;
    const limit = 25;
    const lang = 'en';

    const requestUrl = `https://${rapidApiHost}/season/episodes/?ids=${ids}&offset=${offset}&limit=${limit}&lang=${lang}`;

    try {
        console.log(`Fetching data from RapidAPI: ${requestUrl}`);
        const response = await fetch(requestUrl, {
            method: 'GET',
            headers: {
                'x-rapidapi-host': rapidApiHost,
                'x-rapidapi-key': rapidApiKey // ใช้ API Key ที่นี่
            }
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`RapidAPI request failed: ${response.status} - ${errorBody}`);
            return res.status(response.status).json({ message: 'Failed to fetch data from Netflix API', detail: errorBody });
        }

        const data = await response.json();
        console.log('RapidAPI response received:', data);
        res.status(200).json(data); // ส่งข้อมูลที่ได้จาก RapidAPI กลับไปให้ Client
    } catch (error) {
        console.error('Error calling Netflix RapidAPI:', error);
        res.status(500).json({ message: 'Internal server error when fetching Netflix data', error: error.message });
    }
});

module.exports = app;
