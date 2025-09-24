# Spartans - X Account Analytics Dashboard

<div align="center">

  ### A comprehensive analytics dashboard for monitoring X (Twitter) account performance metrics

  <a href="https://dorian014.github.io/spartans/" style="text-decoration: none;">
    <table style="margin: 20px auto; border-collapse: collapse;">
      <tr>
        <td style="background: #E9ff00; padding: 10px 15px; border-radius: 8px 0 0 8px; border: 2px solid #007b8d;">
          <img src="assets/logo_small.png" height="30" alt="Spartans Logo" />
        </td>
        <td style="background: #000; color: #E9ff00; padding: 10px 20px; border-radius: 0 8px 8px 0; border: 2px solid #007b8d; border-left: none; font-family: 'Work Sans', sans-serif; font-weight: 700; font-size: 14px; letter-spacing: 1px;">
          VIEW LIVE DASHBOARD
        </td>
      </tr>
    </table>
  </a>

  <sub>**Developed by Qstarlabs Technology**</sub>

</div>

---

## Overview

The Spartans Dashboard is a high-performance analytics platform designed to track and visualize social media metrics for hundreds of X (Twitter) accounts. Built to handle over 300 micro-influencers generating 400,000+ daily posts, this dashboard provides real-time insights into engagement metrics, performance trends, and comprehensive data analysis.

## Features

- 🔒 **Secure Authentication**: SHA-256 encrypted password protection
- 🌙 **Dark Theme UI**: Modern glassmorphism design for optimal viewing
- 📊 **Interactive Visualizations**: Real-time charts powered by Chart.js
- 📈 **Performance Metrics**: Track posts, impressions, and engagement rates
- 🔍 **Advanced Filtering**: Multi-select micro-influencer filtering and date range selection
- 📱 **Responsive Design**: Optimized for desktop and tablet viewing
- 📥 **Data Export**: CSV export functionality for detailed analysis
- ⚡ **High Performance**: Optimized to handle 400k+ daily posts

## Quick Start

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/dorian014/spartans.git
   cd spartans
   ```

2. Start the local server:
   ```bash
   ./test-local.sh
   ```
   Or manually:
   ```bash
   python3 -m http.server 8000
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:8000/
   ```

## Technology Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Charts**: Chart.js v4.4.0
- **Authentication**: SHA-256 client-side hashing
- **Deployment**: GitHub Pages with GitHub Actions
- **Data Storage**: JSON with Google Cloud Storage integration

## Dashboard Components

### Key Metrics
- Total Posts & Impressions
- Average Posts per Day/Micro-Influencer
- Top Performing Micro-Influencers
- Real-time Data Status

### Visualizations
- Performance Timeline (Line Chart)
- Posts by Micro-Influencer (Bar Chart)
- Impressions by Micro-Influencer (Bar Chart)
- Interactive filters for custom analysis

### Data Management
- Sortable and searchable data table
- Pagination for large datasets
- CSV export for external analysis

## Deployment

The dashboard automatically deploys to GitHub Pages on every push to the main branch. Data updates are scheduled hourly through GitHub Actions, fetching the latest metrics from Google Cloud Storage.

## Security

- Client-side password hashing using SHA-256
- Session-based authentication with 1-hour timeout
- No sensitive data stored in browser localStorage
- All data transmission over HTTPS

## Performance

Optimized for large-scale data processing:
- Handles 300+ micro-influencers
- Processes 400,000+ daily posts
- Real-time filtering and aggregation
- Efficient pagination for data tables

## License

© 2025 Qstarlabs Technology. All rights reserved.

---

Built by <img src="assets/qstarlabs-logo.svg" height="20" style="vertical-align: middle;" alt="Qstarlabs Technology"> for the Spartans project