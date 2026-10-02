/**
 * Attendance Service
 * Handles member check-in and check-out functionality
 */

const AttendanceService = {
    /**
     * Initialize the attendance service
     */
    init: function() {
        this.setupEventListeners();
    },

    /**
     * Set up event listeners for attendance-related functionality
     */
    setupEventListeners: function() {
        // Check-in button
        const checkInBtn = document.getElementById('check-in-btn');
        if (checkInBtn) {
            checkInBtn.addEventListener('click', this.handleCheckIn.bind(this));
        }

        // Check-out button
        const checkOutBtn = document.getElementById('check-out-btn');
        if (checkOutBtn) {
            checkOutBtn.addEventListener('click', this.handleCheckOut.bind(this));
        }

        // Member ID input - handle Enter key
        const memberIdInput = document.getElementById('member-id');
        if (memberIdInput) {
            memberIdInput.addEventListener('keypress', (event) => {
                if (event.key === 'Enter') {
                    this.handleCheckIn(event);
                }
            });
        }
    },

    /**
     * Handle member check-in
     * @param {Event} event - Click or keypress event
     */
    handleCheckIn: function(event) {
        const memberId = document.getElementById('member-id').value.trim();
        
        if (!memberId) {
            this.showNotification('Please enter a member ID', 'error');
            return;
        }
        
        // Get member by ID
        const member = StorageService.getMemberById(memberId);
        
        if (!member) {
            this.showNotification('Member not found. Please check the ID and try again.', 'error');
            return;
        }
        
        // Check if membership is expired
        const daysRemaining = StorageService.calculateDaysRemaining(member);
        if (daysRemaining <= 0) {
            this.showNotification('Membership has expired. Please renew to continue.', 'error');
            this.displayMemberInfo(member); // Still show member info
            return;
        }
        
        // Check if already checked in
        const status = StorageService.getMemberStatus(member);
        if (status === 'checked-in') {
            this.showNotification('Member is already checked in.', 'error');
            this.displayMemberInfo(member);
            return;
        }
        
        // Record check-in
        StorageService.checkIn(memberId);
        
        // Get updated member data after check-in
        const updatedMember = StorageService.getMemberById(memberId);
        
        // Show success notification
        this.showNotification('Check-in successful!', 'success');
        
        // Display updated member info
        this.displayMemberInfo(updatedMember, 'checked-in');
        
        // Clear input field
        document.getElementById('member-id').value = '';
    },

    /**
     * Handle member check-out
     * @param {Event} event - Click event
     */
    handleCheckOut: function(event) {
        const memberId = document.getElementById('member-id').value.trim();
        
        if (!memberId) {
            this.showNotification('Please enter a member ID', 'error');
            return;
        }
        
        // Get member by ID
        const member = StorageService.getMemberById(memberId);
        
        if (!member) {
            this.showNotification('Member not found. Please check the ID and try again.', 'error');
            return;
        }
        
        // Check if already checked out or not checked in
        const status = StorageService.getMemberStatus(member);
        if (status !== 'checked-in') {
            this.showNotification('Member is not currently checked in.', 'error');
            this.displayMemberInfo(member);
            return;
        }
        
        // Record check-out
        StorageService.checkOut(memberId);
        
        // Get updated member data after check-out
        const updatedMember = StorageService.getMemberById(memberId);
        
        // Show success notification
        this.showNotification('Check-out successful!', 'success');
        
        // Display updated member info
        this.displayMemberInfo(updatedMember, 'checked-out');
        
        // Clear input field
        document.getElementById('member-id').value = '';
    },

    /**
     * Display member information in the attendance view
     * @param {Object} member - Member object
     * @param {string} [status] - Override status if needed
     */
    displayMemberInfo: function(member, status = null) {
        // Get the most up-to-date member data
        const updatedMember = StorageService.getMemberById(member.id);
        if (!updatedMember) return;
        
        // Get elements
        const memberInfo = document.getElementById('member-info');
        const memberPhoto = document.getElementById('member-photo-display');
        const memberName = document.getElementById('member-name-display');
        const memberIdDisplay = document.getElementById('member-id-display');
        const membershipType = document.getElementById('membership-type-display');
        const daysRemaining = document.getElementById('days-remaining-display');
        const attendanceStatus = document.getElementById('attendance-status-display');
        
        // Update elements with member data
        memberPhoto.src = updatedMember.photo || 'img/default-profile.png';
        memberName.textContent = updatedMember.name;
        memberIdDisplay.textContent = updatedMember.id;
        membershipType.textContent = this.formatMembershipType(updatedMember.membershipType);
        
        // Calculate and display days remaining
        const remainingDays = StorageService.calculateDaysRemaining(updatedMember);
        daysRemaining.textContent = remainingDays;
        
        // Set status
        const memberStatus = status || StorageService.getMemberStatus(updatedMember);
        attendanceStatus.textContent = this.formatStatus(memberStatus);
        
        // Apply status styling
        attendanceStatus.className = memberStatus;
        
        // Show member info
        memberInfo.classList.remove('hidden');
    },

    /**
     * Format membership type for display
     * @param {string} type - Membership type code
     * @returns {string} Formatted membership type
     */
    formatMembershipType: function(type) {
        switch (type) {
            case 'monthly': return 'Monthly (30 days)';
            case 'quarterly': return 'Quarterly (90 days)';
            case 'halfyearly': return 'Half Yearly (180 days)';
            case 'annual': return 'Annual (365 days)';
            default: return type;
        }
    },

    /**
     * Format member status for display
     * @param {string} status - Member status code
     * @returns {string} Formatted status
     */
    formatStatus: function(status) {
        switch (status) {
            case 'checked-in': return 'Checked In';
            case 'checked-out': return 'Checked Out';
            case 'not-checked-in': return 'Not Checked In';
            default: return status;
        }
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

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', () => {
    AttendanceService.init();
});