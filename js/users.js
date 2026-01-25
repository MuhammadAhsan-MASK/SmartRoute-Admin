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
                    <th>Travel Type</th>
                    <th>Last Active</th>
                    <th>Join Date</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
    `;

    filteredUsers.forEach((user) => {
        const genderBadge = user.gender === 'Female' ? 'badge-danger' : 'badge-info';
        const travelBadge = user.travelType === 'Alone' ? 'badge-warning' : 'badge-success';

        tableHTML += `
            <tr>
                <td>${user.email || 'N/A'}</td>
                <td><span class="badge ${genderBadge}">${user.gender || 'N/A'}</span></td>
                <td><span class="badge ${travelBadge}">${user.travelType || 'N/A'}</span></td>
                <td>${formatTimestamp(user.lastActive)}</td>
                <td>${formatDate(user.createdAt)}</td>
                <td><span class="badge badge-success">Active</span></td>
            </tr>
        `;
    });

    tableHTML += `
            </tbody>
        </table>
    `;

    container.innerHTML = tableHTML;
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
