#!/usr/bin/env node

/**
 * Aggregate daily Spartans data files into dashboard format
 * Processes all files in daily_data/ and outputs to data/data.json
 */

const fs = require('fs');
const path = require('path');

const DAILY_DATA_DIR = path.join(__dirname, '..', 'daily_data');
const OUTPUT_FILE = path.join(__dirname, '..', 'data', 'data.json');

// Ensure directories exist
if (!fs.existsSync(DAILY_DATA_DIR)) {
    fs.mkdirSync(DAILY_DATA_DIR, { recursive: true });
}

if (!fs.existsSync(path.dirname(OUTPUT_FILE))) {
    fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
}

/**
 * Read all daily JSON files
 */
function readDailyFiles() {
    const files = fs.readdirSync(DAILY_DATA_DIR)
        .filter(file => file.endsWith('.json'))
        .sort(); // Sort by filename (which includes date)

    const allRecords = [];

    files.forEach(file => {
        try {
            const filePath = path.join(DAILY_DATA_DIR, file);
            const content = fs.readFileSync(filePath, 'utf8');
            const data = JSON.parse(content);

            // Handle different possible data formats
            if (data.records && Array.isArray(data.records)) {
                // If the daily file has a records array
                allRecords.push(...data.records);
            } else if (Array.isArray(data)) {
                // If the daily file is directly an array
                allRecords.push(...data);
            } else if (data.date && data.agents) {
                // If the daily file has a different structure with agents
                // Convert to our expected format
                Object.entries(data.agents).forEach(([agentId, agentData]) => {
                    allRecords.push({
                        date: data.date,
                        agent_id: agentId,
                        display_name: agentData.display_name || agentData.name || agentId,
                        xHandle: agentData.xHandle || agentData.twitter_handle || `@${agentId}`,
                        posts: agentData.posts || 0,
                        impressions: agentData.impressions || 0
                    });
                });
            }
        } catch (error) {
            console.error(`Error reading file ${file}:`, error.message);
        }
    });

    return allRecords;
}

/**
 * Calculate summary statistics
 */
function calculateSummary(records) {
    const uniqueAgents = new Set();
    const uniqueDates = new Set();
    let totalPosts = 0;
    let totalImpressions = 0;

    records.forEach(record => {
        uniqueAgents.add(record.agent_id);
        uniqueDates.add(record.date);
        totalPosts += record.posts || 0;
        totalImpressions += record.impressions || 0;
    });

    return {
        totalAgents: uniqueAgents.size,
        totalDays: uniqueDates.size,
        totalPosts,
        totalImpressions
    };
}

/**
 * Main aggregation function
 */
function aggregateData() {
    console.log('📊 Starting data aggregation...');

    // Read all daily files
    const records = readDailyFiles();
    console.log(`✅ Loaded ${records.length} records from daily files`);

    // Sort records by date (descending) and then by agent
    records.sort((a, b) => {
        const dateCompare = b.date.localeCompare(a.date);
        if (dateCompare !== 0) return dateCompare;
        return a.agent_id.localeCompare(b.agent_id);
    });

    // Calculate summary
    const summary = calculateSummary(records);

    // Create the final data structure
    const outputData = {
        lastUpdated: new Date().toISOString(),
        dataVersion: "2.0",
        summary,
        records
    };

    // Write to output file
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(outputData, null, 2));
    console.log(`✅ Data aggregation complete!`);
    console.log(`📈 Summary: ${summary.totalAgents} agents, ${summary.totalDays} days, ${summary.totalPosts} posts`);
    console.log(`💾 Output saved to: ${OUTPUT_FILE}`);
}

// Run aggregation
try {
    aggregateData();
} catch (error) {
    console.error('❌ Error during aggregation:', error);
    process.exit(1);
}