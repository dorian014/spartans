// Main Dashboard Controller

// State management
let currentState = {
    selectedAgents: [],
    dateRange: '30',
    currentPage: 1,
    rowsPerPage: CONFIG.rowsPerPage || 20,
    sortColumn: 'date',
    sortDirection: 'desc',
    searchQuery: ''
};

// Initialize dashboard on load
document.addEventListener('DOMContentLoaded', async function() {
    // Check authentication
    if (!window.authUtils || !window.authUtils.checkAuth()) {
        window.location.href = 'index.html';
        return;
    }

    // Initialize components
    await initializeDashboard();
    setupEventListeners();
});

// Initialize dashboard components
async function initializeDashboard() {
    showLoading(true);

    try {
        // Load data
        const success = await utils.DataManager.loadData();
        if (!success) {
            // Hide dashboard content and show error state
            document.getElementById('dashboardContent').style.display = 'none';
            document.getElementById('errorState').style.display = 'block';
            showLoading(false);
            return;
        }

        // Populate agent filter
        populateAgentFilter();

        // Apply initial filters
        applyFilters();

        // Update all components
        updateDashboard();

        // Update data status
        updateDataStatus();

    } catch (error) {
        console.error('Dashboard initialization error:', error);
        // Hide dashboard content and show error state
        document.getElementById('dashboardContent').style.display = 'none';
        document.getElementById('errorState').style.display = 'block';
    } finally {
        showLoading(false);
    }
}

// Apply filters and update data
function applyFilters() {
    utils.DataManager.applyFilters(currentState.selectedAgents, currentState.dateRange);
}

// Update all dashboard components
function updateDashboard() {
    updateStatsCards();
    updateCharts();
    updateDataTable();
}

// Update statistics cards
function updateStatsCards() {
    const stats = utils.DataManager.getStats();

    // Total Posts
    document.getElementById('totalPosts').textContent = utils.formatNumber(stats.totalPosts);

    // Total Impressions
    document.getElementById('totalImpressions').textContent = utils.formatNumber(stats.totalImpressions);

    // Top 30 Posts per Day - using random number between 25000-35000 for demo
    const randomTop30 = Math.floor(Math.random() * 10000) + 25000;
    document.getElementById('avgPostsPerDay').textContent = utils.formatNumber(randomTop30);

    // Top Agent
    if (stats.topAgent) {
        document.getElementById('topAgent').textContent = stats.topAgent.display_name;
        document.getElementById('topAgentStats').textContent =
            `${utils.formatNumber(stats.topAgent.posts)} posts`;
    } else {
        document.getElementById('topAgent').textContent = '-';
        document.getElementById('topAgentStats').textContent = '-';
    }

    // Update change indicators (placeholder for trend calculation)
    document.getElementById('postsChange').textContent = `${stats.uniqueDays} days • ${stats.uniqueAgents} agents`;
    document.getElementById('impressionsChange').textContent = `Avg ${utils.formatNumber(stats.avgImpressionsPerDay)}/day`;
}

// Update all charts
function updateCharts() {
    const activeBtn = document.querySelector('.chart-toggle-btn.active');
    const metric = activeBtn ? activeBtn.dataset.metric : 'posts';
    const sortOrder = 'desc'; // Default sort order

    if (typeof chartUtils !== 'undefined') {
        chartUtils.updateAllCharts(metric, sortOrder);
    }
}

// Update data table
function updateDataTable() {
    const data = utils.DataManager.filteredData || [];

    // Apply search filter
    let filteredData = data;
    if (currentState.searchQuery) {
        const query = currentState.searchQuery.toLowerCase();
        filteredData = data.filter(record =>
            record.display_name.toLowerCase().includes(query) ||
            record.xHandle.toLowerCase().includes(query) ||
            record.date.includes(query)
        );
    }

    // Sort data
    filteredData.sort((a, b) => {
        let aVal = a[currentState.sortColumn];
        let bVal = b[currentState.sortColumn];

        if (currentState.sortColumn === 'date') {
            aVal = new Date(aVal);
            bVal = new Date(bVal);
        } else if (currentState.sortColumn === 'agent') {
            aVal = a.display_name;
            bVal = b.display_name;
        }

        if (currentState.sortDirection === 'asc') {
            return aVal > bVal ? 1 : -1;
        } else {
            return aVal < bVal ? 1 : -1;
        }
    });

    // Pagination
    const totalRows = filteredData.length;
    const totalPages = Math.ceil(totalRows / currentState.rowsPerPage);
    const start = (currentState.currentPage - 1) * currentState.rowsPerPage;
    const end = Math.min(start + currentState.rowsPerPage, totalRows);
    const pageData = filteredData.slice(start, end);

    // Update table body
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = pageData.map(record => `
        <tr>
            <td>${utils.formatDate(record.date)}</td>
            <td><span class="agent-badge">${record.display_name}</span></td>
            <td><a href="https://x.com/${record.xHandle.replace('@', '')}" target="_blank" class="handle-badge">${record.xHandle}</a></td>
            <td>${utils.formatNumber(record.posts)}</td>
            <td>${utils.formatNumber(record.impressions)}</td>
        </tr>
    `).join('');

    // Update pagination info
    document.getElementById('showingStart').textContent = totalRows > 0 ? start + 1 : 0;
    document.getElementById('showingEnd').textContent = end;
    document.getElementById('totalRows').textContent = totalRows;

    // Update pagination controls
    updatePaginationControls(totalPages);
}

// Update pagination controls
function updatePaginationControls(totalPages) {
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    const pageNumbers = document.getElementById('pageNumbers');

    // Enable/disable buttons
    prevBtn.disabled = currentState.currentPage <= 1;
    nextBtn.disabled = currentState.currentPage >= totalPages;

    // Generate page numbers
    let pages = [];
    if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) {
            pages.push(i);
        }
    } else {
        if (currentState.currentPage <= 4) {
            pages = [1, 2, 3, 4, 5, '...', totalPages];
        } else if (currentState.currentPage >= totalPages - 3) {
            pages = [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
        } else {
            pages = [1, '...', currentState.currentPage - 1, currentState.currentPage, currentState.currentPage + 1, '...', totalPages];
        }
    }

    pageNumbers.innerHTML = pages.map(page => {
        if (page === '...') {
            return '<span class="page-ellipsis">...</span>';
        }
        return `<button class="page-btn ${page === currentState.currentPage ? 'active' : ''}" data-page="${page}">${page}</button>`;
    }).join('');
}

// Populate agent filter dropdown
function populateAgentFilter() {
    const agentsList = document.getElementById('agentsList');
    const agents = utils.DataManager.uniqueAgents || [];

    agentsList.innerHTML = agents.map(agent => `
        <label class="checkbox-label">
            <input type="checkbox" class="agent-checkbox" value="${agent.agent_id}" checked>
            <span>${agent.display_name}</span>
        </label>
    `).join('');

    // Update selected agents state
    currentState.selectedAgents = [];  // Empty means all selected
}

// Update data status indicator
function updateDataStatus() {
    const status = utils.DataManager.checkDataFreshness();
    const statusIndicator = document.querySelector('.status-indicator');
    const statusText = document.querySelector('.status-text');

    statusIndicator.setAttribute('data-status', status);

    if (status === 'fresh') {
        statusText.textContent = 'Data is current';
    } else if (status === 'stale') {
        const lastUpdated = new Date(utils.DataManager.rawData.lastUpdated);
        statusText.textContent = `Updated ${utils.formatDateTime(lastUpdated)}`;
    } else {
        statusText.textContent = 'Data unavailable';
    }
}

// Setup event listeners
function setupEventListeners() {
    // Agent filter dropdown
    const agentBtn = document.getElementById('agentFilterBtn');
    const agentDropdown = document.getElementById('agentDropdown');

    agentBtn.addEventListener('click', () => {
        agentDropdown.classList.toggle('show');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.multi-select-wrapper')) {
            agentDropdown.classList.remove('show');
        }
    });

    // Select/Clear all agents
    document.getElementById('selectAllAgents').addEventListener('click', () => {
        document.querySelectorAll('.agent-checkbox').forEach(cb => cb.checked = true);
        updateAgentSelection();
    });

    document.getElementById('clearAllAgents').addEventListener('click', () => {
        document.querySelectorAll('.agent-checkbox').forEach(cb => cb.checked = false);
        updateAgentSelection();
    });

    // Agent checkbox changes
    document.getElementById('agentsList').addEventListener('change', updateAgentSelection);

    // Date range filter
    document.getElementById('dateRange').addEventListener('change', (e) => {
        currentState.dateRange = e.target.value;
        applyFilters();
        updateDashboard();
    });

    // Chart metric toggle
    document.querySelectorAll('.chart-toggle-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.chart-toggle-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            updateCharts();
        });
    });

    // Chart sort buttons
    document.querySelectorAll('.chart-sort-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const currentSort = btn.dataset.sort;
            btn.dataset.sort = currentSort === 'desc' ? 'asc' : 'desc';
            updateCharts();
        });
    });

    // Table search
    const searchInput = document.getElementById('tableSearch');
    const debouncedSearch = utils.debounce(() => {
        currentState.searchQuery = searchInput.value;
        currentState.currentPage = 1;
        updateDataTable();
    }, 300);
    searchInput.addEventListener('input', debouncedSearch);

    // Table sorting
    document.querySelectorAll('.sortable').forEach(th => {
        th.addEventListener('click', () => {
            const column = th.dataset.column;
            if (currentState.sortColumn === column) {
                currentState.sortDirection = currentState.sortDirection === 'asc' ? 'desc' : 'asc';
            } else {
                currentState.sortColumn = column;
                currentState.sortDirection = 'desc';
            }
            updateDataTable();
        });
    });

    // Pagination
    document.getElementById('prevPage').addEventListener('click', () => {
        if (currentState.currentPage > 1) {
            currentState.currentPage--;
            updateDataTable();
        }
    });

    document.getElementById('nextPage').addEventListener('click', () => {
        currentState.currentPage++;
        updateDataTable();
    });

    document.getElementById('pageNumbers').addEventListener('click', (e) => {
        if (e.target.classList.contains('page-btn')) {
            currentState.currentPage = parseInt(e.target.dataset.page);
            updateDataTable();
        }
    });

    // Export CSV
    document.getElementById('exportBtn').addEventListener('click', () => {
        const data = utils.DataManager.filteredData || [];
        const filename = `x-analytics-${new Date().toISOString().split('T')[0]}.csv`;
        utils.exportToCSV(data, filename);
    });

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
        sessionStorage.clear();
        window.location.href = 'index.html';
    });
}

// Update agent selection
function updateAgentSelection() {
    const checkboxes = document.querySelectorAll('.agent-checkbox');
    const selected = Array.from(checkboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value);

    const totalAgents = checkboxes.length;
    const selectedText = document.getElementById('selectedAgentsText');

    if (selected.length === 0) {
        selectedText.textContent = 'No agents selected';
        currentState.selectedAgents = selected;
    } else if (selected.length === totalAgents) {
        selectedText.textContent = 'All Agents';
        currentState.selectedAgents = [];  // Empty means all
    } else {
        selectedText.textContent = `${selected.length} of ${totalAgents} agents`;
        currentState.selectedAgents = selected;
    }

    applyFilters();
    updateDashboard();
}

// Show/hide loading overlay
function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    overlay.style.display = show ? 'flex' : 'none';
}

// Show error message
function showError(message) {
    console.error(message);
    // Could enhance with a toast notification system
    alert(message);
}

// Check authentication
function checkAuth() {
    const authData = sessionStorage.getItem('auth');
    if (authData) {
        const auth = JSON.parse(authData);
        return auth.authenticated && auth.timestamp > Date.now() - 3600000; // 1 hour session
    }
    return false;
}

// Auto-refresh data every hour
setInterval(() => {
    if (utils.DataManager.checkDataFreshness() === 'error') {
        initializeDashboard();
    }
}, CONFIG.dataUpdateThreshold);