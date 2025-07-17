// public/js/auth.js

/**
 * จัดการการ Login ของ Admin
 */
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const messageBox = document.getElementById('messageBox');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('/api/auth', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password })
                });

                const data = await response.json();

                if (data.success) {
                    localStorage.setItem('adminToken', data.token); // เก็บ Token (อย่างง่าย)
                    showMessage('Login สำเร็จ! กำลังเปลี่ยนเส้นทาง...', 'success');
                    setTimeout(() => {
                        window.location.href = '/admin/dashboard.html'; // ไปยังหน้า Dashboard
                    }, 1500);
                } else {
                    showMessage(data.message || 'Login ล้มเหลว', 'error');
                }
            } catch (error) {
                console.error('Error during login:', error);
                showMessage('เกิดข้อผิดพลาดในการเชื่อมต่อ', 'error');
            }
        });
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
            }, 3000); // ซ่อนข้อความหลังจาก 3 วินาที
        }
    }
});
