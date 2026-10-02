/**
 * Gym Attendance System
 * Main application file
 */

// Wait for the deviceready event before using any of Cordova's device APIs
document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);
    
    // Initialize the application
    App.init();
}

const App = {
    /**
     * Initialize the application
     */
    init: function() {
        // Set up tab navigation
        this.setupTabs();
        
        // Create default profile image if it doesn't exist
        this.ensureDefaultProfileImage();
    },

    /**
     * Set up tab navigation
     */
    setupTabs: function() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabName = button.getAttribute('data-tab');
                
                // Deactivate all tabs
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                // Activate selected tab
                button.classList.add('active');
                document.getElementById(`${tabName}-tab`).classList.add('active');
            });
        });
    },

    /**
     * Ensure the default profile image exists
     * If not, create a simple placeholder
     */
    ensureDefaultProfileImage: function() {
        // Check if default profile image exists
        const defaultImg = new Image();
        defaultImg.src = 'img/default-profile.png';
        
        defaultImg.onerror = function() {
            // Create a canvas to generate a default profile image
            const canvas = document.createElement('canvas');
            canvas.width = 200;
            canvas.height = 200;
            const ctx = canvas.getContext('2d');
            
            // Draw background
            ctx.fillStyle = '#e0e0e0';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw circle
            ctx.fillStyle = '#9e9e9e';
            ctx.beginPath();
            ctx.arc(100, 80, 50, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw body
            ctx.beginPath();
            ctx.arc(100, 220, 90, Math.PI * 1.1, Math.PI * 1.9, true);
            ctx.fill();
            
            // Convert to data URL
            const dataUrl = canvas.toDataURL('image/png');
            
            // Use this as the default profile image
            const profileImages = document.querySelectorAll('img[src="img/default-profile.png"]');
            profileImages.forEach(img => {
                img.src = dataUrl;
            });
        };
    },

    /**
     * Show a notification message
     * @param {string} message - Message to display
     * @param {string} type - Notification type ('success' or 'error')
     */
    showNotification: function(message, type = 'success') {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = `notification ${type}`;
        
        // Show notification
        notification.classList.remove('hidden');
        
        // Hide after 3 seconds
        setTimeout(() => {
            notification.classList.add('hidden');
        }, 3000);
    }
};
