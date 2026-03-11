// Users page functionality

let allUsers = [];
let currentFilter = 'all';

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    loadUsers();

    // Update admin info
    auth.onAuthStateChanged((user) => {
        if (user) {
            document.getElementById('adminEmail').textContent = user.email;
            document.getElementById('adminName').textContent = user.email.split('@')[0];
        }
    });
});

// Load users from Realtime Database
async function loadUsers() {
    console.log("Loading users from Realtime Database...");
    try {
        // 1. Safety Check: Ensure Firebase Database is initialized
        if (typeof database === "undefined") {
            console.error("Database object is not defined!");
            return;
        }

        // 2. Fetch all users from the database
        const usersSnapshot = await database.ref('users').once('value');
        const usersData = usersSnapshot.val();
        console.log("Users snapshot data:", usersData);

        allUsers = [];
        if (usersData) {
            // 3. Convert the object {uid: {data}} into an array [{id: uid, ...data}]
            // Realtime Database returns nested objects, but our UI table needs an array
            Object.keys(usersData).forEach((key) => {
                allUsers.push({
                    id: key,
                    ...usersData[key]
                });
            });
        } else {
            console.log("No user data found in Realtime Database.");
        }

        // 4. Update the dashboard cards and table
        updateStats();
        displayUsers();

    } catch (error) {
        console.error('Error loading users:', error);
        allUsers = [];
        updateStats();
        displayUsers();
    }
}

// Update statistics
function updateStats() {
    const total = allUsers.length;
    const female = allUsers.filter(u => u.gender === 'Female').length;
    const male = allUsers.filter(u => u.gender === 'Male').length;

    // Calculate active today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const active = allUsers.filter(u => {
        if (u.lastActive) {
            const lastActive = u.lastActive.toDate ? u.lastActive.toDate() : new Date(u.lastActive);
            return lastActive >= today;
        }
        return false;
    }).length;

    document.getElementById('totalUsers').textContent = total;
    document.getElementById('femaleUsers').textContent = female;
    document.getElementById('maleUsers').textContent = male;
    document.getElementById('activeToday').textContent = active;
}

// Display users in table
function displayUsers() {
    const container = document.getElementById('usersTableContainer');

    let filteredUsers = allUsers;
    if (currentFilter !== 'all') {
        filteredUsers = allUsers.filter(u => u.gender?.toLowerCase() === currentFilter);
    }

    if (filteredUsers.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">No users found</p>';
        return;
    }

    let tableHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Email</th>
                    <th>Gender</th>
                    <th>Travel Mode</th>
                    <th>Companion</th>
                    <th>Last Active</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody id="usersTableBody">
    `;

    filteredUsers.forEach((user) => {
        const genderBadge = user.gender === 'Female' ? 'badge-danger' : 'badge-info';

        // Calculate Status
        const now = new Date();
        const lastActiveDate = user.lastActive ? (user.lastActive.toDate ? user.lastActive.toDate() : new Date(user.lastActive)) : null;
        const diffMinutes = lastActiveDate ? Math.floor((now - lastActiveDate) / 60000) : 999999;
        const isOnline = diffMinutes < 5; // Consider online if active in last 5 mins

        const statusBadge = isOnline ? 'badge-success' : 'badge-warning';
        const statusText = isOnline ? 'Online' : 'Offline';

        tableHTML += `
            <tr class="user-row" data-user-id="${user.id}">
                <td>${user.email || 'N/A'}</td>
                <td><span class="badge ${genderBadge}">${user.gender || 'N/A'}</span></td>
                <td>${user.travelMode || 'N/A'}</td>
                <td>${user.travelType || 'Alone'}</td>
                <td>${formatTimestamp(user.lastActive)}</td>
                <td><span class="badge ${statusBadge}">${statusText}</span></td>
            </tr>
        `;
    });

    tableHTML += `
            </tbody>
        </table>
    `;

    container.innerHTML = tableHTML;

    // Add click event listeners to all user rows using event delegation
    const tableBody = document.getElementById('usersTableBody');
    if (tableBody) {
        tableBody.addEventListener('click', (e) => {
            const row = e.target.closest('.user-row');
            if (row) {
                const userId = row.getAttribute('data-user-id');
                console.log('Clicked user row with ID:', userId);
                showUserProfile(userId);
            }
        });
    }
}

// Show empty state
function showEmptyState() {
    const container = document.getElementById('usersTableContainer');
    container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">No users found in the database.</p>';
}

// Filter users
function filterUsers(type) {
    currentFilter = type;

    // Update button states
    document.querySelectorAll('.table-actions .btn-secondary').forEach(btn => {
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-secondary');
    });

    const activeBtn = document.getElementById(`filter${type.charAt(0).toUpperCase() + type.slice(1)}`);
    if (activeBtn) {
        activeBtn.classList.remove('btn-secondary');
        activeBtn.classList.add('btn-primary');
    }

    displayUsers();
}

// Refresh users
function refreshUsers() {
    loadUsers();

    // Show feedback
    const btn = event.target.closest('button');
    const icon = btn.querySelector('i');
    icon.classList.add('fa-spin');

    setTimeout(() => {
        icon.classList.remove('fa-spin');
    }, 1000);
}

// Format timestamp
function formatTimestamp(timestamp) {
    if (!timestamp) return 'Never';

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    if (diff < 172800) return 'Yesterday';
    return date.toLocaleDateString();
}

// Format date
function formatDate(timestamp) {
    if (!timestamp) return 'N/A';

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Show user profile modal
function showUserProfile(userId) {
    console.log('showUserProfile called with userId:', userId);
    console.log('All users:', allUsers);

    const user = allUsers.find(u => u.id === userId);
    if (!user) {
        console.error('User not found:', userId);
        console.error('Available user IDs:', allUsers.map(u => u.id));
        return;
    }

    console.log('Found user:', user);

    // Populate modal with user data
    const modal = document.getElementById('userProfileModal');
    if (!modal) {
        console.error('Modal element not found!');
        return;
    }

    console.log('Modal element found:', modal);

    // User name and email
    const userName = user.name || user.email?.split('@')[0] || 'Unknown User';
    document.getElementById('modalUserName').textContent = userName;
    document.getElementById('modalUserEmail').textContent = user.email || 'N/A';

    // Gender
    const genderBadge = user.gender === 'Female' ? 'badge-danger' : 'badge-info';
    document.getElementById('modalUserGender').innerHTML =
        `<span class="badge ${genderBadge}">${user.gender || 'N/A'}</span>`;

    // Travel mode and companion
    document.getElementById('modalUserTravelMode').textContent = user.travelMode || 'N/A';
    document.getElementById('modalUserCompanion').textContent = user.travelType || 'N/A';

    // Account created
    document.getElementById('modalUserCreated').textContent = formatDate(user.createdAt);

    // Last active
    document.getElementById('modalUserLastActive').textContent = formatTimestamp(user.lastActive);

    // Status
    const now = new Date();
    const lastActiveDate = user.lastActive ? (user.lastActive.toDate ? user.lastActive.toDate() : new Date(user.lastActive)) : null;
    const diffMinutes = lastActiveDate ? Math.floor((now - lastActiveDate) / 60000) : 999999;
    const isOnline = diffMinutes < 5;

    const statusBadge = isOnline ? 'badge-success' : 'badge-warning';
    const statusText = isOnline ? 'Online' : 'Offline';
    document.getElementById('modalUserStatus').innerHTML =
        `<span class="badge ${statusBadge}">${statusText}</span>`;

    console.log('About to show modal...');
    // Show modal with animation
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
    console.log('Modal should now be visible. Modal classes:', modal.className);
}

// Close user profile modal
function closeUserModal() {
    const modal = document.getElementById('userProfileModal');
    modal.classList.remove('active');
    document.body.style.overflow = ''; // Restore scrolling
}

// Close modal on ESC key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeUserModal();
    }
});

// Close modal when clicking outside
document.getElementById('userProfileModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'userProfileModal') {
        closeUserModal();
    }
});
