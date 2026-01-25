// Reports page functionality

let allReports = [];
let currentFilter = 'all';

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    loadReports();

    // Update admin info
    auth.onAuthStateChanged((user) => {
        if (user) {
            document.getElementById('adminEmail').textContent = user.email;
            document.getElementById('adminName').textContent = user.email.split('@')[0];
        }
    });
});

// Load reports from Realtime Database
async function loadReports() {
    try {
        // 1. Fetch the data once from the 'reports' node
        const reportsSnapshot = await database.ref('reports').once('value');
        const reportsData = reportsSnapshot.val();

        allReports = [];
        if (reportsData) {
            // 2. Transform the object into a list/array
            Object.keys(reportsData).forEach((key) => {
                allReports.push({
                    id: key,
                    ...reportsData[key]
                });
            });
            // 3. Sort by timestamp descending (most recent reports at the top)
            // This is done on the client side for visual consistency
            allReports.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        }

        // 4. Update UI components
        updateStats();
        displayReports();

    } catch (error) {
        console.error('Error loading reports:', error);
        allReports = [];
        updateStats();
        displayReports();
    }
}

// Update statistics
function updateStats() {
    const total = allReports.length;
    const pending = allReports.filter(r => r.status === 'pending').length;
    const resolved = allReports.filter(r => r.status === 'resolved').length;

    // Calculate today's reports
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCount = allReports.filter(r => {
        if (r.timestamp) {
            const reportDate = r.timestamp.toDate ? r.timestamp.toDate() : new Date(r.timestamp);
            return reportDate >= today;
        }
        return false;
    }).length;

    document.getElementById('totalReports').textContent = total;
    document.getElementById('pendingReports').textContent = pending;
    document.getElementById('resolvedReports').textContent = resolved;
    document.getElementById('todayReports').textContent = todayCount;
}

// Display reports in table
function displayReports() {
    const container = document.getElementById('reportsTableContainer');

    let filteredReports = allReports;
    if (currentFilter !== 'all') {
        filteredReports = allReports.filter(r => r.status === currentFilter);
    }

    if (filteredReports.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">No reports found</p>';
        return;
    }

    let tableHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Reporter</th>
                    <th>Location</th>
                    <th>Issue Type</th>
                    <th>Description</th>
                    <th>Severity</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
    `;

    filteredReports.forEach((report) => {
        const statusBadge = report.status === 'pending' ? 'badge-warning' : 'badge-success';
        const severityBadge = getSeverityBadge(report.severity);

        tableHTML += `
            <tr>
                <td>${report.userEmail || 'Anonymous'}</td>
                <td>${truncateText(report.location || 'N/A', 25)}</td>
                <td><span class="badge badge-info">${report.issueType || 'General'}</span></td>
                <td>${truncateText(report.description || 'No description', 40)}</td>
                <td><span class="badge ${severityBadge}">${report.severity || 'Medium'}</span></td>
                <td>${formatTimestamp(report.timestamp)}</td>
                <td><span class="badge ${statusBadge}">${report.status === 'pending' ? 'Pending' : 'Resolved'}</span></td>
                <td>
                    ${report.status === 'pending' ?
                `<button class="btn btn-sm btn-success" onclick="resolveReport('${report.id}')">
                            <i class="fas fa-check"></i>
                        </button>` :
                '<span style="color: var(--text-muted);">-</span>'
            }
                </td>
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
    const container = document.getElementById('reportsTableContainer');
    container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">No safety reports found.</p>';
}

// Get severity badge class
function getSeverityBadge(severity) {
    switch (severity?.toLowerCase()) {
        case 'high':
            return 'badge-danger';
        case 'medium':
            return 'badge-warning';
        case 'low':
            return 'badge-info';
        default:
            return 'badge-warning';
    }
}

// Filter reports
function filterReports(type) {
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

    displayReports();
}

// Resolve report
async function resolveReport(reportId) {
    try {
        await database.ref(`reports/${reportId}`).update({
            status: 'resolved',
            resolvedAt: firebase.database.ServerValue.TIMESTAMP
        });

        // Reload reports
        await loadReports();

        // Show success message
        alert('Report marked as resolved');

    } catch (error) {
        console.error('Error resolving report:', error);
        alert('Error resolving report. Please try again.');
    }
}

// Refresh reports
function refreshReports() {
    loadReports();

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
