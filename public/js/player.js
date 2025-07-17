// public/js/player.js

/**
 * จัดการ Logic สำหรับ Video Player (สามารถขยายเพื่อเพิ่ม Custom Controls ได้)
 */
document.addEventListener('DOMContentLoaded', () => {
    const videoGrid = document.getElementById('videoGrid');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const noVideosMessage = document.getElementById('noVideosMessage');
    const errorMessage = document.getElementById('errorMessage');
    const errorMessageDetail = document.getElementById('errorMessageDetail');

    // ฟังก์ชันสำหรับแสดง/ซ่อน Element
    function showElement(element) {
        if (element) element.classList.remove('hidden');
    }

    function hideElement(element) {
        if (element) element.classList.add('hidden');
    }

    /**
     * ตรวจสอบว่าเป็น URL ของ YouTube และแปลงเป็น Embed URL
     * @param {string} url - URL ของวิดีโอ
     * @returns {string|null} Embed URL ของ YouTube หรือ null ถ้าไม่ใช่ YouTube URL
     */
    function getYouTubeEmbedUrl(url) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        if (match && match[2].length === 11) {
            return `https://www.youtube.com/embed/${match[2]}?autoplay=0&controls=1&modestbranding=1&rel=0`;
        }
        return null;
    }

    window.loadVideos = async function() {
        if (!videoGrid) {
            console.error('Error: videoGrid element not found.');
            return;
        }

        // ซ่อนข้อความทั้งหมดและแสดง Spinner ก่อนเริ่มโหลด
        hideElement(noVideosMessage);
        hideElement(errorMessage);
        showElement(loadingSpinner);
        videoGrid.innerHTML = ''; // ล้างรายการเดิม

        try {
            console.log('Attempting to fetch videos from /api/videos...');
            const response = await fetch('/api/videos');
            
            if (!response.ok) {
                // หากการเรียก API ไม่สำเร็จ
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const videos = await response.json();
            console.log('Successfully fetched videos:', videos); // แสดงข้อมูลวิดีโอที่ดึงมาใน Console

            hideElement(loadingSpinner); // ซ่อน Spinner เมื่อโหลดเสร็จ

            if (videos.length === 0) {
                showElement(noVideosMessage); // แสดงข้อความไม่มีวิดีโอ
                console.log('No videos found in the system.');
                return;
            }

            videos.forEach(video => {
                // ตรวจสอบว่า URL วิดีโอมีอยู่จริงหรือไม่
                if (!video.url) {
                    console.warn(`Video "${video.title}" (ID: ${video.id || 'N/A'}) has no URL. Skipping this video.`);
                    return; // ข้ามวิดีโอที่ไม่มี URL
                }

                const youtubeEmbedUrl = getYouTubeEmbedUrl(video.url);
                let videoContentHtml = '';

                if (youtubeEmbedUrl) {
                    // ถ้าเป็น YouTube URL ให้ใช้ iframe
                    videoContentHtml = `
                        <iframe 
                            class="absolute top-0 left-0 w-full h-full" 
                            src="${youtubeEmbedUrl}" 
                            frameborder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowfullscreen
                            title="${video.title}"
                        ></iframe>
                    `;
                    console.log(`Embedding YouTube video for "${video.title}". Embed URL: ${youtubeEmbedUrl}`);
                } else {
                    // ถ้าไม่ใช่ YouTube URL ให้ใช้แท็ก video ปกติ
                    videoContentHtml = `
                        <video controls preload="metadata" poster="${video.thumbnailUrl || 'https://placehold.co/640x360/000000/FFFFFF?text=No+Thumbnail'}">
                            <source src="${video.url}" type="video/mp4">
                            เบราว์เซอร์ของคุณไม่รองรับการเล่นวิดีโอ
                        </video>
                    `;
                    console.log(`Using standard video tag for "${video.title}". Video URL: ${video.url}`);
                }

                const videoCard = document.createElement('div');
                videoCard.className = 'video-card bg-gray-800 rounded-lg shadow-lg overflow-hidden transform transition-transform duration-300 hover:scale-105 relative';
                videoCard.innerHTML = `
                    <div class="video-player-container">
                        ${videoContentHtml}
                    </div>
                    <div class="p-4">
                        <h3 class="text-xl font-semibold text-white mb-2">${video.title}</h3>
                        <p class="text-gray-400 text-sm">${video.description || 'ไม่มีคำอธิบาย'}</p>
                        <p class="text-gray-500 text-xs mt-2">อัปโหลดเมื่อ: ${new Date(video.uploadedAt).toLocaleDateString()}</p>
                    </div>
                `;
                videoGrid.appendChild(videoCard);
                console.log(`Video card for "${video.title}" appended to DOM.`); // เพิ่ม log เพื่อยืนยันว่าถูกเพิ่มเข้า DOM
            });
        } catch (error) {
            console.error('Error loading videos:', error);
            hideElement(loadingSpinner); // ซ่อน Spinner
            showElement(errorMessage); // แสดงข้อความ Error
            if (errorMessageDetail) {
                errorMessageDetail.textContent = `รายละเอียด: ${error.message}`;
            }
        }
    };

    // เรียกฟังก์ชันโหลดวิดีโอเมื่อ DOM พร้อม
    if (videoGrid) {
        window.loadVideos();
    }
});
