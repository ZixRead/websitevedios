// public/js/upload.js

/**
 * จัดการ Logic สำหรับหน้า Upload/Add Link
 */
document.addEventListener('DOMContentLoaded', () => {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
        window.location.href = '/admin/login.html'; // ถ้าไม่มี Token ให้กลับไปหน้า Login
        return;
    }

    const uploadForm = document.getElementById('uploadForm');
    const messageBox = document.getElementById('messageBox');
    const fileInput = document.getElementById('fileInput');
    const videoUrlInput = document.getElementById('videoUrl');
    const videoThumbnailUrlInput = document.getElementById('videoThumbnailUrl');
    const uploadProgressBar = document.getElementById('uploadProgressBar');
    const uploadProgressText = document.getElementById('uploadProgressText');

    if (uploadForm) {
        uploadForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const title = document.getElementById('uploadVideoTitle').value;
            const description = document.getElementById('uploadVideoDescription').value;
            const file = fileInput.files[0];
            let videoUrl = videoUrlInput.value;
            let thumbnailUrl = videoThumbnailUrlInput.value; // URL รูปภาพปกที่ผู้ใช้กรอก

            if (!title) {
                showMessage('กรุณากรอกชื่อวิดีโอ', 'error');
                return;
            }

            if (file) {
                // ถ้ามีการเลือกไฟล์ ให้ทำการอัปโหลด
                showMessage('กำลังอัปโหลดไฟล์...', 'success');
                uploadProgressBar.style.width = '0%';
                uploadProgressText.textContent = '0%';

                const reader = new FileReader();
                reader.readAsDataURL(file);

                reader.onloadend = async () => {
                    const base64data = reader.result;
                    const resourceType = file.type.startsWith('video/') ? 'video' : 'image';

                    try {
                        const uploadResponse = await fetch('/api/upload', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${adminToken}`
                            },
                            body: JSON.stringify({ fileBase64: base64data, resourceType: resourceType })
                        });

                        const uploadResult = await uploadResponse.json();

                        if (uploadResponse.ok) {
                            videoUrl = uploadResult.url; // URL จาก Cloudinary
                            // ใช้ thumbnailUrl ที่ได้จาก Cloudinary response หรือ fallback ไปที่ user-provided
                            thumbnailUrl = uploadResult.thumbnailUrl || thumbnailUrl; 

                            showMessage('อัปโหลดไฟล์สำเร็จ! กำลังเพิ่มวิดีโอ...', 'success');
                            uploadProgressBar.style.width = '100%';
                            uploadProgressText.textContent = '100%';
                            await addVideoToDb(title, description, videoUrl, thumbnailUrl);
                        } else {
                            showMessage(uploadResult.message || 'อัปโหลดไฟล์ไม่สำเร็จ', 'error');
                            uploadProgressBar.style.width = '0%';
                            uploadProgressText.textContent = '0%';
                        }
                    } catch (error) {
                        console.error('Error uploading file:', error);
                        showMessage('เกิดข้อผิดพลาดในการอัปโหลดไฟล์', 'error');
                        uploadProgressBar.style.width = '0%';
                        uploadProgressText.textContent = '0%';
                    }
                };

                reader.onprogress = (event) => {
                    if (event.lengthComputable) {
                        const percentLoaded = Math.round((event.loaded / event.total) * 100);
                        uploadProgressBar.style.width = `${percentLoaded}%`;
                        uploadProgressText.textContent = `${percentLoaded}%`;
                    }
                };

                reader.onerror = () => {
                    showMessage('เกิดข้อผิดพลาดในการอ่านไฟล์', 'error');
                };

            } else if (videoUrl) {
                // ถ้าไม่มีไฟล์ แต่มี URL ให้เพิ่มวิดีโอโดยตรง
                // ในกรณีนี้ thumbnailUrl จะมาจาก input field โดยตรง
                await addVideoToDb(title, description, videoUrl, thumbnailUrl);
            } else {
                showMessage('กรุณาเลือกไฟล์ หรือกรอก URL วิดีโอ', 'error');
            }
        });
    }

    /**
     * เพิ่มวิดีโอลงในฐานข้อมูลผ่าน API
     * @param {string} title
     * @param {string} description
     * @param {string} url
     * @param {string} thumbnailUrl
     */
    async function addVideoToDb(title, description, url, thumbnailUrl) {
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
                uploadForm.reset(); // ล้าง Form
                // อาจจะเปลี่ยนเส้นทางกลับไปหน้า dashboard หรือแสดงรายการวิดีโอ
            } else {
                showMessage(data.message || 'เพิ่มวิดีโอไม่สำเร็จ', 'error');
            }
        } catch (error) {
            console.error('Error adding video to DB:', error);
            showMessage('เกิดข้อผิดพลาดในการเพิ่มวิดีโอ', 'error');
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
