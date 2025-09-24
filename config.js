// Configuration for Spartans X Account Analytics Dashboard by Qstarlabs
const CONFIG = {
    // Password hash (SHA-256)
    // Password: 'adminspartans'
    password: '7a5f202b5352d5503125bef209a462fe60950ecdc8bc9df2e3b506fe44beca93',

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

    // API endpoints
    dataEndpoint: './data/data.json'
};