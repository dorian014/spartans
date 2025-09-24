// Chart.js configurations and management for X Account Analytics Dashboard

// Chart instances
let timelineChart = null;
let postsChart = null;
let impressionsChart = null;

// Chart.js default configuration - Spartans theme
Chart.defaults.font.family = "'Work Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
Chart.defaults.color = '#a0a0a0';
Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.1)';

// Initialize timeline chart
function initTimelineChart(data, metric = 'posts') {
    const ctx = document.getElementById('timelineChart');
    if (!ctx) return;

    // Destroy existing chart
    if (timelineChart) {
        timelineChart.destroy();
    }

    const datasets = [];

    if (metric === 'posts' || metric === 'both') {
        datasets.push({
            label: 'Posts',
            data: data.datasets.posts,
            borderColor: CONFIG.chartColors.primary,
            backgroundColor: CONFIG.chartColors.background,
            tension: 0.4,
            fill: true,
            pointRadius: 4,
            pointHoverRadius: 6,
            yAxisID: 'y'
        });
    }

    if (metric === 'impressions' || metric === 'both') {
        datasets.push({
            label: 'Impressions',
            data: data.datasets.impressions,
            borderColor: CONFIG.chartColors.secondary,
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
            fill: true,
            pointRadius: 4,
            pointHoverRadius: 6,
            yAxisID: metric === 'both' ? 'y1' : 'y'
        });
    }

    timelineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: {
                    display: metric === 'both',
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(20, 20, 30, 0.95)',
                    titleFont: {
                        size: 14
                    },
                    bodyFont: {
                        size: 13
                    },
                    padding: 12,
                    displayColors: true,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += utils.formatNumber(context.parsed.y);
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: CONFIG.chartColors.grid,
                        drawBorder: false
                    },
                    ticks: {
                        font: {
                            size: 11
                        },
                        maxRotation: 45,
                        minRotation: 0
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    grid: {
                        color: CONFIG.chartColors.grid,
                        drawBorder: false
                    },
                    ticks: {
                        callback: function(value) {
                            return utils.formatNumber(value);
                        },
                        font: {
                            size: 11
                        }
                    },
                    title: {
                        display: metric === 'both',
                        text: 'Posts',
                        font: {
                            size: 12
                        }
                    }
                },
                y1: {
                    type: 'linear',
                    display: metric === 'both',
                    position: 'right',
                    grid: {
                        drawOnChartArea: false,
                        drawBorder: false
                    },
                    ticks: {
                        callback: function(value) {
                            return utils.formatNumber(value);
                        },
                        font: {
                            size: 11
                        }
                    },
                    title: {
                        display: metric === 'both',
                        text: 'Impressions',
                        font: {
                            size: 12
                        }
                    }
                }
            }
        }
    });
}

// Initialize posts by agent chart
function initPostsChart(data, sortOrder = 'desc') {
    const ctx = document.getElementById('postsChart');
    if (!ctx) return;

    // Destroy existing chart
    if (postsChart) {
        postsChart.destroy();
    }

    // Sort data based on order
    const indices = [...Array(data.labels.length).keys()];
    if (sortOrder === 'asc') {
        indices.sort((a, b) => data.posts[a] - data.posts[b]);
    } else {
        indices.sort((a, b) => data.posts[b] - data.posts[a]);
    }

    const sortedLabels = indices.map(i => data.labels[i]);
    const sortedPosts = indices.map(i => data.posts[i]);

    postsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sortedLabels,
            datasets: [{
                label: 'Posts',
                data: sortedPosts,
                backgroundColor: createGradient(ctx, CONFIG.chartColors.primary),
                borderColor: CONFIG.chartColors.primary,
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(20, 20, 30, 0.95)',
                    titleFont: {
                        size: 14
                    },
                    bodyFont: {
                        size: 13
                    },
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            return 'Posts: ' + utils.formatNumber(context.parsed.y);
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false,
                        drawBorder: false
                    },
                    ticks: {
                        font: {
                            size: 11
                        },
                        maxRotation: 45,
                        minRotation: 45
                    }
                },
                y: {
                    grid: {
                        color: CONFIG.chartColors.grid,
                        drawBorder: false
                    },
                    ticks: {
                        callback: function(value) {
                            return utils.formatNumber(value);
                        },
                        font: {
                            size: 11
                        }
                    }
                }
            }
        }
    });
}

// Initialize impressions by agent chart
function initImpressionsChart(data, sortOrder = 'desc') {
    const ctx = document.getElementById('impressionsChart');
    if (!ctx) return;

    // Destroy existing chart
    if (impressionsChart) {
        impressionsChart.destroy();
    }

    // Sort data based on order
    const indices = [...Array(data.labels.length).keys()];
    if (sortOrder === 'asc') {
        indices.sort((a, b) => data.impressions[a] - data.impressions[b]);
    } else {
        indices.sort((a, b) => data.impressions[b] - data.impressions[a]);
    }

    const sortedLabels = indices.map(i => data.labels[i]);
    const sortedImpressions = indices.map(i => data.impressions[i]);

    impressionsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sortedLabels,
            datasets: [{
                label: 'Impressions',
                data: sortedImpressions,
                backgroundColor: createGradient(ctx, CONFIG.chartColors.secondary),
                borderColor: CONFIG.chartColors.secondary,
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(20, 20, 30, 0.95)',
                    titleFont: {
                        size: 14
                    },
                    bodyFont: {
                        size: 13
                    },
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            return 'Impressions: ' + utils.formatNumber(context.parsed.y);
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false,
                        drawBorder: false
                    },
                    ticks: {
                        font: {
                            size: 11
                        },
                        maxRotation: 45,
                        minRotation: 45
                    }
                },
                y: {
                    grid: {
                        color: CONFIG.chartColors.grid,
                        drawBorder: false
                    },
                    ticks: {
                        callback: function(value) {
                            return utils.formatNumber(value);
                        },
                        font: {
                            size: 11
                        }
                    }
                }
            }
        }
    });
}

// Create gradient for bar charts - Spartans theme
function createGradient(ctx, color) {
    const canvas = ctx.getContext('2d');
    const gradient = canvas.createLinearGradient(0, 0, 0, 300);

    if (color === CONFIG.chartColors.primary) {
        gradient.addColorStop(0, '#C8FF00');
        gradient.addColorStop(1, '#8FB300');
    } else if (color === CONFIG.chartColors.secondary) {
        gradient.addColorStop(0, '#00FF41');
        gradient.addColorStop(1, '#00B82E');
    } else {
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, color);
    }

    return gradient;
}

// Update all charts with new data
function updateAllCharts(metric = 'posts', sortOrder = 'desc') {
    const timelineData = utils.DataManager.getTimelineData();
    const agentData = utils.DataManager.getAgentData();

    initTimelineChart(timelineData, metric);
    initPostsChart(agentData, sortOrder);
    initImpressionsChart(agentData, sortOrder);
}

// Export chart functions
if (typeof window !== 'undefined') {
    window.chartUtils = {
        initTimelineChart,
        initPostsChart,
        initImpressionsChart,
        updateAllCharts
    };
}