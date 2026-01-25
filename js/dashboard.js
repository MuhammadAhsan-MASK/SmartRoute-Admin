// Dashboard functionality

let activityChart = null;
let userTypeChart = null;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    loadDashboardData();
    initializeCharts();
    loadRecentActivity();

    // Update admin info
    auth.onAuthStateChanged((user) => {
        if (user) {
            document.getElementById('adminEmail').textContent = user.email;
            document.getElementById('adminName').textContent = user.email.split('@')[0];
        }
    });
});

// Load dashboard statistics
async function loadDashboardData() {
    try {
        // Get total users
        const usersSnapshot = await database.ref('users').once('value');
        const users = usersSnapshot.val() || {};
        const totalUsers = Object.keys(users).length;
        document.getElementById('totalUsers').textContent = totalUsers;

        // Get total routes
        const routesSnapshot = await database.ref('routes').once('value');
        const routes = routesSnapshot.val() || {};
        document.getElementById('totalRoutes').textContent = Object.keys(routes).length;

        // Get total reports
        const reportsSnapshot = await database.ref('reports').once('value');
        const reports = reportsSnapshot.val() || {};
        document.getElementById('totalReports').textContent = Object.keys(reports).length;

        // Get active users (users active in last 24 hours)
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayTime = yesterday.getTime();

        let activeCount = 0;
        Object.values(users).forEach(u => {
            if (u.lastActive && u.lastActive >= yesterdayTime) {
                activeCount++;
            }
        });
        document.getElementById('activeUsers').textContent = activeCount;

    } catch (error) {
        console.error('Error loading dashboard data:', error);
        // Show demo data if Firebase is not configured
        showDemoData();
    }
}

// Show demo data for testing
function showDemoData() {
    document.getElementById('totalUsers').textContent = '1,234';
    document.getElementById('totalRoutes').textContent = '5,678';
    document.getElementById('totalReports').textContent = '89';
    document.getElementById('activeUsers').textContent = '456';
}

// Initialize charts
function initializeCharts() {
    // Activity Chart
    const activityCtx = document.getElementById('activityChart').getContext('2d');
    activityChart = new Chart(activityCtx, {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Users',
                data: [120, 190, 150, 220, 180, 240, 200],
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                tension: 0.4,
                fill: true
            }, {
                label: 'Routes',
                data: [80, 140, 110, 180, 150, 200, 170],
                borderColor: '#4facfe',
                backgroundColor: 'rgba(79, 172, 254, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    labels: {
                        color: 'rgba(255, 255, 255, 0.7)',
                        font: {
                            family: 'Inter'
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)'
                    }
                }
            }
        }
    });

    // User Type Chart
    const userTypeCtx = document.getElementById('userTypeChart').getContext('2d');
    userTypeChart = new Chart(userTypeCtx, {
        type: 'doughnut',
        data: {
            labels: ['Students', 'Working Women', 'Others'],
            datasets: [{
                data: [45, 35, 20],
                backgroundColor: [
                    'rgba(102, 126, 234, 0.8)',
                    'rgba(79, 172, 254, 0.8)',
                    'rgba(245, 87, 108, 0.8)'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: 'rgba(255, 255, 255, 0.7)',
                        font: {
                            family: 'Inter'
                        },
                        padding: 15
                    }
                }
            }
        }
    });
}

// Load recent activity
async function loadRecentActivity() {
    const container = document.getElementById('activityTableContainer');

    try {
        // Get recent routes
        const routesSnapshot = await database.ref('routes').limitToLast(10).once('value');
        const routesData = routesSnapshot.val();

        if (!routesData) {
            const container = document.getElementById('recentActivityContainer');
            container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">No recent activity found.</p>';
            return;
        }

        let routesList = Object.keys(routesData).map(key => ({
            id: key,
            ...routesData[key]
        }));

        // Sort by timestamp desc
        routesList.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

        let tableHTML = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>User</th>
                        <th>Type</th>
                        <th>From</th>
                        <th>To</th>
                        <th>Status</th>
                        <th>Time</th>
                    </tr>
                </thead>
                <tbody>
        `;

        routesList.forEach((data) => {
            tableHTML += `
                <tr>
                    <td>${data.userEmail || 'Anonymous'}</td>
                    <td><span class="badge badge-info">${data.routeType || 'Safe'}</span></td>
                    <td>${data.pickupLocation || 'N/A'}</td>
                    <td>${data.dropoffLocation || 'N/A'}</td>
                    <td><span class="badge badge-success">Completed</span></td>
                    <td>${formatTimestamp(data.timestamp)}</td>
                </tr>
            `;
        });

        tableHTML += `
                </tbody>
            </table>
        `;

        container.innerHTML = tableHTML;

    } catch (error) {
        console.error('Error loading recent activity:', error);
        const container = document.getElementById('recentActivityContainer');
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">Error loading recent activity.</p>';
    }
}

// Format timestamp
function formatTimestamp(timestamp) {
    if (!timestamp) return 'N/A';

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // difference in seconds

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return date.toLocaleDateString();
}

// Refresh data
function refreshData() {
    loadDashboardData();
    loadRecentActivity();

    // Show feedback
    const btn = event.target.closest('button');
    const icon = btn.querySelector('i');
    icon.classList.add('fa-spin');

    setTimeout(() => {
        icon.classList.remove('fa-spin');
    }, 1000);
}
