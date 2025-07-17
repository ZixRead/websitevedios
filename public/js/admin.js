// public/js/admin.js

/**
 * จัดการ Logic สำหรับหน้า Admin Dashboard
 */
document.addEventListener('DOMContentLoaded', () => {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
        window.location.href = '/admin/login.html'; // ถ้าไม่มี Token ให้กลับไปหน้า Login
        return;
    }

    const videoList = document.getElementById('videoList');
    const addVideoForm = document.getElementById('addVideoForm');
    const messageBox = document.getElementById('messageBox');
    const logoutButton = document.getElementById('logoutButton');

    // โหลดวิดีโอเมื่อหน้า Dashboard โหลดเสร็จ
    fetchVideos();

    if (addVideoForm) {
        addVideoForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const title = document.getElementById('videoTitle').value;
            const description = document.getElementById('videoDescription').value;
            const url = document.getElementById('videoUrl').value;
            const thumbnailUrl = document.getElementById('videoThumbnailUrl').value;

            try {
                const response = await fetch('/api/videos', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${adminToken}`
                    },
                    body: JSON.stringify({ title, description, url, thumbnailUrl })
                });

                const data = await response.json();

                if (response.ok) {
                    showMessage('เพิ่มวิดีโอสำเร็จ!', 'success');
                    addVideoForm.reset(); // ล้าง Form
                    fetchVideos(); // โหลดวิดีโอใหม่
                } else {
                    showMessage(data.message || 'เพิ่มวิดีโอไม่สำเร็จ', 'error');
                }
            } catch (error) {
                console.error('Error adding video:', error);
                showMessage('เกิดข้อผิดพลาดในการเพิ่มวิดีโอ', 'error');
            }
        });
    }

    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('adminToken'); // ลบ Token
            window.location.href = '/admin/login.html'; // กลับไปหน้า Login
        });
    }

    /**
     * ดึงข้อมูลวิดีโอจาก API และแสดงผล
     */
    async function fetchVideos() {
        try {
            const response = await fetch('/api/videos', {
                headers: {
                    'Authorization': `Bearer ${adminToken}` // ส่ง Token เพื่อให้ API ตรวจสอบ
                }
            });
            const videos = await response.json();
            renderVideos(videos);
        } catch (error) {
            console.error('Error fetching videos:', error);
            showMessage('ไม่สามารถดึงข้อมูลวิดีโอได้', 'error');
        }
    }

    /**
     * แสดงผลรายการวิดีโอในตาราง
     * @param {Array} videos - รายการวิดีโอ
     */
    function renderVideos(videos) {
        if (!videoList) return;
        videoList.innerHTML = ''; // ล้างรายการเดิม

        if (videos.length === 0) {
            videoList.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-gray-400">ยังไม่มีวิดีโอในระบบ</td></tr>`;
            return;
        }

        videos.forEach(video => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-4 py-3">${video.title}</td>
                <td class="px-4 py-3">${video.url.length > 50 ? video.url.substring(0, 47) + '...' : video.url}</td>
                <td class="px-4 py-3">${video.thumbnailUrl.length > 50 ? video.thumbnailUrl.substring(0, 47) + '...' : video.thumbnailUrl}</td>
                <td class="px-4 py-3">${new Date(video.uploadedAt).toLocaleDateString()}</td>
                <td class="px-4 py-3">
                    <button class="delete-button" data-id="${video.id}">ลบ</button>
                </td>
            `;
            videoList.appendChild(row);
        });

        // เพิ่ม Event Listener สำหรับปุ่มลบ
        document.querySelectorAll('.delete-button').forEach(button => {
            button.addEventListener('click', async (e) => {
                const videoId = e.target.dataset.id;
                if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบวิดีโอนี้?')) {
                    await deleteVideo(videoId);
                }
            });
        });
    }

    /**
     * ลบวิดีโอผ่าน API
     * @param {string} id - ID ของวิดีโอที่จะลบ
     */
    async function deleteVideo(id) {
        try {
            const response = await fetch(`/api/videos/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${adminToken}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                showMessage('ลบวิดีโอสำเร็จ!', 'success');
                fetchVideos(); // โหลดวิดีโอใหม่
            } else {
                showMessage(data.message || 'ลบวิดีโอไม่สำเร็จ', 'error');
            }
        } catch (error) {
            console.error('Error deleting video:', error);
            showMessage('เกิดข้อผิดพลาดในการลบวิดีโอ', 'error');
        }
    }

    /**
     * แสดงข้อความใน MessageBox
     * @param {string} message - ข้อความที่จะแสดง
     * @param {'success' | 'error'} type - ประเภทของข้อความ (success/error)
     */
    function showMessage(message, type) {
        if (messageBox) {
            messageBox.textContent = message;
            messageBox.className = `message-box show ${type}`;
            setTimeout(() => {
                messageBox.classList.remove('show');
            }, 3000);
        }
    }
});
