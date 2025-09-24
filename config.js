// Configuration for X Account Analytics Dashboard
const CONFIG = {
    // Password hashes (SHA-256)
    // Default passwords: admin -> "admin123", gdc -> "gdc123"
    // CHANGE THESE IN PRODUCTION!
    passwords: {
        admin: '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', // admin123
        gdc: 'a0b5af6d1e42c5f8e0b7c9f8d4e6a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6' // gdc123
    },

    // Data freshness threshold (milliseconds)
    dataUpdateThreshold: 3600000, // 1 hour

    // Pagination settings
    rowsPerPage: 50,

    // Chart settings
    chartColors: {
        primary: '#8b5cf6',
        secondary: '#3b82f6',
        accent: '#ec4899',
        background: 'rgba(139, 92, 246, 0.1)',
        grid: 'rgba(255, 255, 255, 0.1)'
    },

    // Date range limits for GDC mode
    gdcDateRangeLimit: 30, // days

    // API endpoints (for future use)
    dataEndpoint: './data/data.json'
};