/**
 * Storage Service
 * Handles all local storage operations for the gym attendance system
 */

const StorageService = {
    // Storage keys
    KEYS: {
        MEMBERS: 'gym_members',
        ATTENDANCE: 'gym_attendance',
        COUNTER: 'member_id_counter'
    },

    /**
     * Initialize storage with default values if not already set
     */
    init: function() {
        if (!localStorage.getItem(this.KEYS.MEMBERS)) {
            localStorage.setItem(this.KEYS.MEMBERS, JSON.stringify([]));
        }
        
        if (!localStorage.getItem(this.KEYS.ATTENDANCE)) {
            localStorage.setItem(this.KEYS.ATTENDANCE, JSON.stringify([]));
        }
        
        if (!localStorage.getItem(this.KEYS.COUNTER)) {
            localStorage.setItem(this.KEYS.COUNTER, '1000'); // Start member IDs from 1000
        }
    },

    /**
     * Get all members from storage
     * @returns {Array} Array of member objects
     */
    getMembers: function() {
        return JSON.parse(localStorage.getItem(this.KEYS.MEMBERS) || '[]');
    },

    /**
     * Save members to storage
     * @param {Array} members - Array of member objects
     */
    saveMembers: function(members) {
        localStorage.setItem(this.KEYS.MEMBERS, JSON.stringify(members));
    },

    /**
     * Get a member by ID
     * @param {string} id - Member ID
     * @returns {Object|null} Member object or null if not found
     */
    getMemberById: function(id) {
        const members = this.getMembers();
        return members.find(member => member.id === id) || null;
    },

    /**
     * Add a new member
     * @param {Object} member - Member object without ID
     * @returns {Object} Member object with generated ID
     */
    addMember: function(member) {
        const members = this.getMembers();
        const newId = this.generateMemberId();
        
        const newMember = {
            ...member,
            id: newId,
            registrationDate: new Date().toISOString(),
            lastCheckIn: null,
            lastCheckOut: null
        };
        
        members.push(newMember);
        this.saveMembers(members);
        return newMember;
    },

    /**
     * Update an existing member
     * @param {string} id - Member ID
     * @param {Object} updates - Object with properties to update
     * @returns {Object|null} Updated member object or null if not found
     */
    updateMember: function(id, updates) {
        const members = this.getMembers();
        const index = members.findIndex(member => member.id === id);
        
        if (index === -1) return null;
        
        members[index] = { ...members[index], ...updates };
        this.saveMembers(members);
        return members[index];
    },

    /**
     * Delete a member
     * @param {string} id - Member ID
     * @returns {boolean} True if deleted, false if not found
     */
    deleteMember: function(id) {
        const members = this.getMembers();
        const initialLength = members.length;
        const filteredMembers = members.filter(member => member.id !== id);
        
        if (filteredMembers.length === initialLength) return false;
        
        this.saveMembers(filteredMembers);
        return true;
    },

    /**
     * Generate a unique member ID
     * @returns {string} New unique member ID
     */
    generateMemberId: function() {
        let counter = parseInt(localStorage.getItem(this.KEYS.COUNTER) || '1000');
        counter++;
        localStorage.setItem(this.KEYS.COUNTER, counter.toString());
        return counter.toString();
    },

    /**
     * Get all attendance records
     * @returns {Array} Array of attendance records
     */
    getAttendance: function() {
        return JSON.parse(localStorage.getItem(this.KEYS.ATTENDANCE) || '[]');
    },

    /**
     * Save attendance records
     * @param {Array} records - Array of attendance records
     */
    saveAttendance: function(records) {
        localStorage.setItem(this.KEYS.ATTENDANCE, JSON.stringify(records));
    },

    /**
     * Get attendance records for a specific member
     * @param {string} memberId - Member ID
     * @returns {Array} Array of attendance records for the member
     */
    getMemberAttendance: function(memberId) {
        const records = this.getAttendance();
        return records.filter(record => record.memberId === memberId);
    },

    /**
     * Record a check-in
     * @param {string} memberId - Member ID
     * @returns {Object} Check-in record
     */
    checkIn: function(memberId) {
        const member = this.getMemberById(memberId);
        if (!member) return null;
        
        const now = new Date();
        const checkInRecord = {
            id: Date.now().toString(),
            memberId: memberId,
            type: 'check-in',
            timestamp: now.toISOString(),
            date: now.toLocaleDateString()
        };
        
        // Update member's last check-in
        this.updateMember(memberId, { 
            lastCheckIn: now.toISOString(),
            lastCheckOut: null // Reset check-out when checking in
        });
        
        // Save attendance record
        const records = this.getAttendance();
        records.push(checkInRecord);
        this.saveAttendance(records);
        
        return checkInRecord;
    },

    /**
     * Record a check-out
     * @param {string} memberId - Member ID
     * @returns {Object} Check-out record
     */
    checkOut: function(memberId) {
        const member = this.getMemberById(memberId);
        if (!member) return null;
        
        const now = new Date();
        const checkOutRecord = {
            id: Date.now().toString(),
            memberId: memberId,
            type: 'check-out',
            timestamp: now.toISOString(),
            date: now.toLocaleDateString()
        };
        
        // Update member's last check-out
        this.updateMember(memberId, { lastCheckOut: now.toISOString() });
        
        // Save attendance record
        const records = this.getAttendance();
        records.push(checkOutRecord);
        this.saveAttendance(records);
        
        return checkOutRecord;
    },

    /**
     * Calculate days remaining in membership
     * @param {Object} member - Member object
     * @returns {number} Number of days remaining
     */
    calculateDaysRemaining: function(member) {
        if (!member || !member.membershipEndDate) return 0;
        
        // Get current date with time set to midnight for accurate day calculation
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const endDate = new Date(member.membershipEndDate);
        endDate.setHours(0, 0, 0, 0);
        
        // Calculate difference in days
        const diffTime = endDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return Math.max(0, diffDays); // Don't return negative days
    },

    /**
     * Get member's current attendance status
     * @param {Object} member - Member object
     * @returns {string} Status: 'checked-in', 'checked-out', or 'not-checked-in'
     */
    getMemberStatus: function(member) {
        if (!member) return 'not-checked-in';
        
        if (member.lastCheckIn && !member.lastCheckOut) {
            return 'checked-in';
        } else if (member.lastCheckOut) {
            // Check if last check-out is from today
            const lastCheckOut = new Date(member.lastCheckOut);
            const today = new Date();
            
            if (lastCheckOut.toDateString() === today.toDateString()) {
                return 'checked-out';
            }
        }
        
        return 'not-checked-in';
    }
};

// Initialize storage when the script loads
StorageService.init();