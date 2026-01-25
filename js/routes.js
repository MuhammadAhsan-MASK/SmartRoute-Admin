// Routes page functionality

let allRoutes = [];
let currentFilter = 'all';

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    loadRoutes();

    // Update admin info
    auth.onAuthStateChanged((user) => {
        if (user) {
            document.getElementById('adminEmail').textContent = user.email;
            document.getElementById('adminName').textContent = user.email.split('@')[0];
        }
    });
});

// Load routes from Realtime Database
async function loadRoutes() {
    try {
        // 1. Fetch the data from the 'routes' node
        const routesSnapshot = await database.ref('routes').once('value');
        const routesData = routesSnapshot.val();

        allRoutes = [];
        if (routesData) {
            // 2. Transform the nested object structure into an array
            Object.keys(routesData).forEach((key) => {
                allRoutes.push({
                    id: key,
                    ...routesData[key]
                });
            });
            // 3. Sort by timestamp descending (newest trips first)
            allRoutes.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        }

        // 4. Update the statistics and the results table
        updateStats();
        displayRoutes();

    } catch (error) {
        console.error('Error loading routes:', error);
        allRoutes = [];
        updateStats();
        displayRoutes();
    }
}

// Update statistics
function updateStats() {
    const total = allRoutes.length;
    const safe = allRoutes.filter(r => r.routeType === 'safest').length;
    const shortest = allRoutes.filter(r => r.routeType === 'shortest').length;

    // Calculate today's routes
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCount = allRoutes.filter(r => {
        if (r.timestamp) {
            const routeDate = r.timestamp.toDate ? r.timestamp.toDate() : new Date(r.timestamp);
            return routeDate >= today;
        }
        return false;
    }).length;

    document.getElementById('totalRoutes').textContent = total;
    document.getElementById('safeRoutes').textContent = safe;
    document.getElementById('shortestRoutes').textContent = shortest;
    document.getElementById('todayRoutes').textContent = todayCount;
}

// Display routes in table
function displayRoutes() {
    const container = document.getElementById('routesTableContainer');

    let filteredRoutes = allRoutes;
    if (currentFilter !== 'all') {
        filteredRoutes = allRoutes.filter(r => r.routeType === currentFilter);
    }

    if (filteredRoutes.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">No routes found</p>';
        return;
    }

    let tableHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>User</th>
                    <th>Gender</th>
                    <th>Travel Type</th>
                    <th>Route Type</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Time</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
    `;

    filteredRoutes.forEach((route) => {
        const routeTypeBadge = route.routeType === 'safest' ? 'badge-success' : 'badge-warning';
        const genderBadge = route.gender === 'Female' ? 'badge-danger' : 'badge-info';
        const travelBadge = route.travel === 'Alone' ? 'badge-warning' : 'badge-success';

        tableHTML += `
            <tr>
                <td>${route.userEmail || 'Anonymous'}</td>
                <td><span class="badge ${genderBadge}">${route.gender || 'N/A'}</span></td>
                <td><span class="badge ${travelBadge}">${route.travel || 'N/A'}</span></td>
                <td><span class="badge ${routeTypeBadge}">${route.routeType === 'safest' ? 'Safe Route' : 'Shortest'}</span></td>
                <td>${truncateText(route.pickupLocation || 'N/A', 30)}</td>
                <td>${truncateText(route.dropoffLocation || 'N/A', 30)}</td>
                <td>${formatTimestamp(route.timestamp)}</td>
                <td><span class="badge badge-success">Completed</span></td>
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
    const container = document.getElementById('routesTableContainer');
    container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">No route requests found.</p>';
}

// Filter routes
function filterRoutes(type) {
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

    displayRoutes();
}

// Refresh routes
function refreshRoutes() {
    loadRoutes();

    // Show feedback
    const btn = event.target.closest('button');
    const icon = btn.querySelector('i');
    icon.classList.add('fa-spin');

    setTimeout(() => {
        icon.classList.remove('fa-spin');
    }, 1000);
}

// Truncate text
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// Format timestamp
function formatTimestamp(timestamp) {
    if (!timestamp) return 'N/A';

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    if (diff < 172800) return 'Yesterday';
    return date.toLocaleDateString();
}
