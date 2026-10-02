/**
 * Members Service
 * Handles member registration, photo upload, and membership management
 */

const MembersService = {
    /**
     * Initialize the members service
     */
    init: function() {
        this.setupEventListeners();
        this.loadMembersList();
    },

    /**
     * Set up event listeners for member-related functionality
     */
    setupEventListeners: function() {
        // Registration form submission
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', this.handleRegistration.bind(this));
        }

        // Photo upload preview
        const photoInput = document.getElementById('member-photo');
        if (photoInput) {
            photoInput.addEventListener('change', this.handlePhotoPreview.bind(this));
        }

        // Search functionality
        const searchInput = document.getElementById('search-member');
        if (searchInput) {
            searchInput.addEventListener('input', this.handleSearch.bind(this));
        }
    },

    /**
     * Handle member registration form submission
     * @param {Event} event - Form submit event
     */
    handleRegistration: function(event) {
        event.preventDefault();
        
        // Get form values
        const name = document.getElementById('new-name').value.trim();
        const email = document.getElementById('new-email').value.trim();
        const phone = document.getElementById('new-phone').value.trim();
        const membershipType = document.getElementById('membership-type').value;
        const photoInput = document.getElementById('member-photo');
        
        // Validate inputs
        if (!name || !email || !phone || !membershipType) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }
        
        // Calculate membership end date based on type
        const startDate = new Date();
        const endDate = new Date(startDate);
        
        switch (membershipType) {
            case 'monthly':
                endDate.setDate(endDate.getDate() + 30);
                break;
            case 'quarterly':
                endDate.setDate(endDate.getDate() + 90);
                break;
            case 'halfyearly':
                endDate.setDate(endDate.getDate() + 180);
                break;
            case 'annual':
                endDate.setDate(endDate.getDate() + 365);
                break;
            default:
                endDate.setDate(endDate.getDate() + 30);
        }
        
        // Process photo if provided
        let photoData = null;
        if (photoInput.files && photoInput.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                photoData = e.target.result;
                
                // Create new member with photo
                this.createMember(name, email, phone, membershipType, startDate, endDate, photoData);
            };
            reader.readAsDataURL(photoInput.files[0]);
        } else {
            // Create new member without photo
            this.createMember(name, email, phone, membershipType, startDate, endDate, null);
        }
    },

    /**
     * Create a new member
     * @param {string} name - Member name
     * @param {string} email - Member email
     * @param {string} phone - Member phone
     * @param {string} membershipType - Type of membership
     * @param {Date} startDate - Membership start date
     * @param {Date} endDate - Membership end date
     * @param {string|null} photoData - Base64 encoded photo data
     */
    createMember: function(name, email, phone, membershipType, startDate, endDate, photoData) {
        const newMember = {
            name,
            email,
            phone,
            membershipType,
            membershipStartDate: startDate.toISOString(),
            membershipEndDate: endDate.toISOString(),
            photo: photoData || 'img/default-profile.png'
        };
        
        // Add member to storage
        const member = StorageService.addMember(newMember);
        
        // Show success notification
        this.showNotification(`Member registered successfully! ID: ${member.id}`, 'success');
        
        // Reset form
        document.getElementById('register-form').reset();
        document.getElementById('photo-preview-img').src = 'img/default-profile.png';
        
        // Refresh members list
        this.loadMembersList();
    },

    /**
     * Handle photo preview when a file is selected
     * @param {Event} event - Change event from file input
     */
    handlePhotoPreview: function(event) {
        const photoPreview = document.getElementById('photo-preview-img');
        const file = event.target.files[0];
        
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                photoPreview.src = e.target.result;
            };
            reader.readAsDataURL(file);
        } else {
            photoPreview.src = 'img/default-profile.png';
        }
    },

    /**
     * Load and display the list of members
     */
    loadMembersList: function() {
        const membersList = document.getElementById('members-list');
        if (!membersList) return;
        
        // Clear current list
        membersList.innerHTML = '';
        
        // Get all members
        const members = StorageService.getMembers();
        
        if (members.length === 0) {
            membersList.innerHTML = '<p class="no-members">No members registered yet.</p>';
            return;
        }
        
        // Create member cards
        members.forEach(member => {
            // Get fresh calculation of days remaining
            const daysRemaining = StorageService.calculateDaysRemaining(member);
            const memberStatus = StorageService.getMemberStatus(member);
            
            const memberCard = document.createElement('div');
            memberCard.className = 'member-item';
            memberCard.innerHTML = `
                <div class="member-photo">
                    <img src="${member.photo}" alt="${member.name}">
                </div>
                <div class="member-details">
                    <h3>${member.name}</h3>
                    <p>ID: ${member.id}</p>
                    <p>Membership: ${this.formatMembershipType(member.membershipType)}</p>
                    <p>Days Remaining: ${daysRemaining}</p>
                    <p>Status: ${this.formatStatus(memberStatus)}</p>
                </div>
            `;
            
            membersList.appendChild(memberCard);
        });
    },

    /**
     * Handle member search
     * @param {Event} event - Input event from search field
     */
    handleSearch: function(event) {
        const searchTerm = event.target.value.toLowerCase().trim();
        const membersList = document.getElementById('members-list');
        
        if (!membersList) return;
        
        // Clear current list
        membersList.innerHTML = '';
        
        // Get all members
        const members = StorageService.getMembers();
        
        if (members.length === 0) {
            membersList.innerHTML = '<p class="no-members">No members registered yet.</p>';
            return;
        }
        
        // Filter members by search term
        const filteredMembers = members.filter(member => 
            member.name.toLowerCase().includes(searchTerm) || 
            member.id.includes(searchTerm)
        );
        
        if (filteredMembers.length === 0) {
            membersList.innerHTML = '<p class="no-members">No members found matching your search.</p>';
            return;
        }
        
        // Create member cards for filtered members
        filteredMembers.forEach(member => {
            const daysRemaining = StorageService.calculateDaysRemaining(member);
            const memberStatus = StorageService.getMemberStatus(member);
            
            const memberCard = document.createElement('div');
            memberCard.className = 'member-item';
            memberCard.innerHTML = `
                <div class="member-photo">
                    <img src="${member.photo}" alt="${member.name}">
                </div>
                <div class="member-details">
                    <h3>${member.name}</h3>
                    <p>ID: ${member.id}</p>
                    <p>Membership: ${this.formatMembershipType(member.membershipType)}</p>
                    <p>Days Remaining: ${daysRemaining}</p>
                    <p>Status: ${this.formatStatus(memberStatus)}</p>
                </div>
            `;
            
            membersList.appendChild(memberCard);
        });
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
    MembersService.init();
});