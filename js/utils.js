// Utility functions for X Account Analytics Dashboard

// Data management
const DataManager = {
    rawData: null,
    processedData: null,
    filteredData: null,

    // Load data from JSON file
    async loadData() {
        try {
            const response = await fetch(CONFIG.dataEndpoint);
            if (!response.ok) {
                throw new Error(`Failed to load data: ${response.status}`);
            }

            this.rawData = await response.json();
            this.processData();
            return true;
        } catch (error) {
            console.error('Error loading data:', error);
            return false;
        }
    },

    // Process raw data
    processData() {
        if (!this.rawData || !this.rawData.records) {
            return;
        }

        // Sort records by date descending
        this.processedData = [...this.rawData.records].sort((a, b) =>
            new Date(b.date) - new Date(a.date)
        );

        // Extract unique agents
        const agentsMap = new Map();
        this.processedData.forEach(record => {
            if (!agentsMap.has(record.agent_id)) {
                agentsMap.set(record.agent_id, {
                    agent_id: record.agent_id,
                    display_name: record.display_name,
                    xHandle: record.xHandle
                });
            }
        });

        this.uniqueAgents = Array.from(agentsMap.values()).sort((a, b) =>
            a.display_name.localeCompare(b.display_name)
        );

        // Calculate date range
        const dates = this.processedData.map(r => new Date(r.date));
        this.dateRange = {
            start: new Date(Math.min(...dates)),
            end: new Date(Math.max(...dates))
        };

        // Initialize with all data
        this.filteredData = this.processedData;
    },

    // Apply filters
    applyFilters(selectedAgents, dateRangeDays) {
        let filtered = [...this.processedData];

        // Filter by agents
        if (selectedAgents && selectedAgents.length > 0) {
            filtered = filtered.filter(record =>
                selectedAgents.includes(record.agent_id)
            );
        }

        // Filter by date range
        if (dateRangeDays !== 'all') {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - parseInt(dateRangeDays));
            filtered = filtered.filter(record =>
                new Date(record.date) >= cutoffDate
            );
        }

        this.filteredData = filtered;
        return this.filteredData;
    },

    // Get aggregated stats
    getStats() {
        if (!this.filteredData || this.filteredData.length === 0) {
            return {
                totalPosts: 0,
                totalImpressions: 0,
                avgPostsPerDay: 0,
                avgImpressionsPerDay: 0,
                avgPostsPerAgent: 0,
                topAgent: null,
                uniqueDays: 0,
                uniqueAgents: 0
            };
        }

        const totalPosts = this.filteredData.reduce((sum, r) => sum + r.posts, 0);
        const totalImpressions = this.filteredData.reduce((sum, r) => sum + r.impressions, 0);

        const uniqueDays = new Set(this.filteredData.map(r => r.date)).size;
        const uniqueAgents = new Set(this.filteredData.map(r => r.agent_id)).size;

        // Calculate per-agent totals for top agent
        const agentTotals = {};
        this.filteredData.forEach(record => {
            if (!agentTotals[record.agent_id]) {
                agentTotals[record.agent_id] = {
                    display_name: record.display_name,
                    posts: 0,
                    impressions: 0
                };
            }
            agentTotals[record.agent_id].posts += record.posts;
            agentTotals[record.agent_id].impressions += record.impressions;
        });

        // Find top agent by posts
        let topAgent = null;
        let maxPosts = 0;
        for (const [agentId, stats] of Object.entries(agentTotals)) {
            if (stats.posts > maxPosts) {
                maxPosts = stats.posts;
                topAgent = {
                    id: agentId,
                    ...stats
                };
            }
        }

        return {
            totalPosts,
            totalImpressions,
            avgPostsPerDay: uniqueDays > 0 ? Math.round(totalPosts / uniqueDays) : 0,
            avgImpressionsPerDay: uniqueDays > 0 ? Math.round(totalImpressions / uniqueDays) : 0,
            avgPostsPerAgent: uniqueAgents > 0 ? Math.round(totalPosts / uniqueAgents / uniqueDays) : 0,
            topAgent,
            uniqueDays,
            uniqueAgents
        };
    },

    // Get data for timeline chart
    getTimelineData() {
        if (!this.filteredData || this.filteredData.length === 0) {
            return { labels: [], datasets: [] };
        }

        // Aggregate by date
        const dateMap = new Map();
        this.filteredData.forEach(record => {
            if (!dateMap.has(record.date)) {
                dateMap.set(record.date, { posts: 0, impressions: 0 });
            }
            const day = dateMap.get(record.date);
            day.posts += record.posts;
            day.impressions += record.impressions;
        });

        // Sort by date
        const sortedDates = Array.from(dateMap.keys()).sort();

        return {
            labels: sortedDates.map(date => formatDate(date)),
            datasets: {
                posts: sortedDates.map(date => dateMap.get(date).posts),
                impressions: sortedDates.map(date => dateMap.get(date).impressions)
            }
        };
    },

    // Get data for agent charts
    getAgentData() {
        if (!this.filteredData || this.filteredData.length === 0) {
            return { labels: [], posts: [], impressions: [] };
        }

        // Aggregate by agent
        const agentMap = new Map();
        this.filteredData.forEach(record => {
            if (!agentMap.has(record.agent_id)) {
                agentMap.set(record.agent_id, {
                    display_name: record.display_name,
                    posts: 0,
                    impressions: 0
                });
            }
            const agent = agentMap.get(record.agent_id);
            agent.posts += record.posts;
            agent.impressions += record.impressions;
        });

        // Convert to arrays and sort by posts
        const agents = Array.from(agentMap.entries())
            .map(([id, data]) => ({ id, ...data }))
            .sort((a, b) => b.posts - a.posts)
            .slice(0, 10); // Top 10 agents

        return {
            labels: agents.map(a => a.display_name),
            posts: agents.map(a => a.posts),
            impressions: agents.map(a => a.impressions)
        };
    },

    // Get leaderboard data
    getLeaderboard() {
        const agentData = this.getAgentData();
        return agentData.labels.map((label, index) => ({
            rank: index + 1,
            name: label,
            posts: agentData.posts[index],
            impressions: agentData.impressions[index]
        }));
    },

    // Check data freshness
    checkDataFreshness() {
        if (!this.rawData || !this.rawData.lastUpdated) {
            return 'error';
        }

        const lastUpdated = new Date(this.rawData.lastUpdated);
        const now = new Date();
        const hoursSinceUpdate = (now - lastUpdated) / (1000 * 60 * 60);

        if (hoursSinceUpdate < 1) {
            return 'fresh';
        } else if (hoursSinceUpdate < 168) {  // 7 days instead of 24 hours
            return 'stale';
        } else {
            return 'error';
        }
    }
};

// Formatting utilities
function formatNumber(num) {
    if (num === undefined || num === null) {
        return '0';
    }
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    const options = { month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function formatDateTime(dateStr) {
    const date = new Date(dateStr);
    const options = {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('en-US', options);
}

// CSV Export utility
function exportToCSV(data, filename) {
    const headers = ['Date', 'Agent', 'X Handle', 'Posts', 'Impressions'];
    const rows = data.map(record => [
        record.date,
        record.display_name,
        record.xHandle,
        record.posts,
        record.impressions
    ]);

    let csvContent = headers.join(',') + '\n';
    rows.forEach(row => {
        csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Table pagination utility
class TablePagination {
    constructor(containerId, data, rowsPerPage = 50) {
        this.container = document.getElementById(containerId);
        this.data = data;
        this.rowsPerPage = rowsPerPage;
        this.currentPage = 1;
        this.totalPages = Math.ceil(data.length / rowsPerPage);
    }

    getCurrentPageData() {
        const start = (this.currentPage - 1) * this.rowsPerPage;
        const end = start + this.rowsPerPage;
        return this.data.slice(start, end);
    }

    goToPage(page) {
        if (page < 1 || page > this.totalPages) return;
        this.currentPage = page;
        this.render();
    }

    nextPage() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            this.render();
        }
    }

    prevPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.render();
        }
    }

    render() {
        // This will be called from the dashboard.js
    }
}

// Debounce utility for search input
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Export utilities
if (typeof window !== 'undefined') {
    window.utils = {
        DataManager,
        formatNumber,
        formatDate,
        formatDateTime,
        exportToCSV,
        TablePagination,
        debounce
    };
}