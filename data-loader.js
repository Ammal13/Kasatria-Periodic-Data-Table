// data-loader.js - Load data from Google Sheets
console.log("📊 Data loader initialized");

// Your Google Sheet ID
const SHEET_ID = '16B1AL6GNfzoJN3kGvYMSzQmVqHTRdU3-GbBMkbtEoB0';
// Google Sheets API Key
const API_KEY = 'AIzaSyCu-bTfEAZtfFVjMr5u0Yat_VrhqXxS90o';
// Sheet name (change if your sheet has a different name)
const SHEET_NAME = 'Data Template';
// Optional: GID for the sheet (0 for first sheet). Change if your Sheet uses a different GID.
const SHEET_GID = '1958506502'; // Updated to match the correct sheet tab
// If you have a published "Publish to the web" CSV link, put it here to load directly.
// Example (user-provided):
// IMPORTANT: Changed from pubhtml to pub with output=csv for proper data loading
const PUBLISHED_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSaavzygL6yy8n9CttQ1aAh9g2Nfxsn0z5ONlPOKFV4pdBiW9rTptDiEXfxrcl_iPHhC1oeqnPtorFU/pub?output=csv';

// Using Google Sheets API v4
async function loadDataFromGoogleSheets() {
    console.log("🔄 Loading data from Google Sheet...");

    if (window.setStatus) {
        setStatus("Connecting to Google Sheets...");
    }

    try {
        // Method 1: Try Google Sheets API v4 with API Key (most reliable)
        if (API_KEY) {
            console.log('Attempting to load via Google Sheets API v4...');
            const apiData = await tryLoadViaAPI();
            if (apiData && apiData.length) {
                console.log(`✅ Successfully loaded ${apiData.length} records from API`);
                if (window.setStatus) setStatus(`Loaded ${apiData.length} records (API)`);
                if (window.initializeVisualization) {
                    setTimeout(() => initializeVisualization(apiData), 100);
                }
                return;
            }
        }
        // If a published CSV URL is provided, try that first (fastest and avoids GViz parsing)
        if (typeof PUBLISHED_CSV_URL !== 'undefined' && PUBLISHED_CSV_URL) {
            console.log('Attempting to load published CSV URL:', PUBLISHED_CSV_URL);
            const pubResp = await fetch(PUBLISHED_CSV_URL);
            if (pubResp.ok) {
                const pubText = await pubResp.text();
                // Basic check to ensure it's CSV and not HTML
                if (!pubText.trim().startsWith('<')) {
                    const csvProcessed = parseCsvTextToData(pubText);
                    if (csvProcessed && csvProcessed.length) {
                        console.log(`✅ Successfully loaded ${csvProcessed.length} records from published CSV`);
                        if (window.setStatus) setStatus(`Loaded ${csvProcessed.length} records (published CSV)`);
                        if (window.initializeVisualization) {
                            setTimeout(() => initializeVisualization(csvProcessed), 100);
                        }
                        return;
                    }
                } else {
                    console.warn('Published CSV appears to be HTML; falling back to GViz');
                }
            } else {
                console.warn('Published CSV fetch returned non-OK status', pubResp.status);
            }
        }
        // Method 1: Try using the public access with JSON endpoint
        // Since your sheet is shared with "anyone with link", we can use this
        const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${SHEET_NAME}`;

        console.log("Fetching data from:", url);

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        const text = await response.text();
        console.log("Raw response received");

        // Parse the Google Visualization API response
        const jsonMatch = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]+)\);/);

        if (!jsonMatch || !jsonMatch[1]) {
            // The response may be an HTML login page (not public) or a different format.
            // Try a CSV export fallback before giving up.
            console.warn('GViz response not parseable; trying CSV fallback');
            const csvProcessed = await tryLoadCsvFallback();
            if (csvProcessed && csvProcessed.length) {
                console.log(`✅ Loaded ${csvProcessed.length} records from CSV fallback`);
                if (window.setStatus) setStatus(`Loaded ${csvProcessed.length} records (CSV)`);
                if (window.initializeVisualization) {
                    setTimeout(() => initializeVisualization(csvProcessed), 100);
                }
                return;
            }

            throw new Error("Could not parse Google Sheets response (GViz) and CSV fallback failed");
        }

        const data = JSON.parse(jsonMatch[1]);

        // Process the data
        const processedData = processGoogleSheetsData(data);

        console.log(`✅ Successfully loaded ${processedData.length} records`);

        if (window.setStatus) {
            setStatus(`Loaded ${processedData.length} records`);
        }

        // Initialize visualization
        if (window.initializeVisualization) {
            setTimeout(() => {
                initializeVisualization(processedData);
            }, 100);
        } else {
            console.error("initializeVisualization function not found!");
            if (window.setStatus) {
                setStatus("Error: Visualization engine not available");
            }
        }

    } catch (error) {
        console.error("❌ Error loading from Google Sheets:", error);

        if (window.setStatus) {
            setStatus("Error loading data. Using sample data...");
        }

        // Fallback to sample data
        useSampleData();
    }
}

// Try loading via Google Sheets API v4 with API Key
async function tryLoadViaAPI() {
    try {
        if (window.setStatus) setStatus('Loading via Google Sheets API...');

        // Google Sheets API v4 endpoint
        const apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}?key=${API_KEY}`;
        console.log('Fetching from API:', apiUrl);

        const resp = await fetch(apiUrl);
        if (!resp.ok) {
            console.warn('API fetch failed with status', resp.status);
            const errorText = await resp.text();
            console.warn('API error:', errorText);
            return null;
        }

        const data = await resp.json();

        if (!data.values || data.values.length < 2) {
            console.warn('API returned no data or only headers');
            return null;
        }

        // Process the data (first row is headers, rest is data)
        const headers = data.values[0];
        const rows = data.values.slice(1);

        const processed = [];

        for (let i = 0; i < rows.length; i++) {
            const cells = rows[i];

            // Skip empty rows
            if (!cells || cells.length === 0) continue;

            // Extract data (based on your CSV structure)
            const name = cells[0] || `Person ${i + 1}`;
            const photo = cells[1] || `https://via.placeholder.com/100/4682B4/FFFFFF?text=${encodeURIComponent(name.substring(0, 2))}`;
            const age = (cells[2] || 'Unknown').toString();
            const country = cells[3] || 'Unknown';
            const interest = cells[4] || 'Unknown';
            let netWorthStr = cells[5] || '$0';

            let netWorthValue = parseFloat(netWorthStr.toString().replace(/[$,]/g, ''));
            if (isNaN(netWorthValue)) netWorthValue = 0;

            let color;
            if (netWorthValue < 100000) color = '#ff4444';
            else if (netWorthValue < 200000) color = '#ffa500';
            else color = '#44ff44';

            processed.push({
                name,
                photo,
                age,
                country,
                interest,
                netWorth: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(netWorthValue),
                netWorthValue,
                color,
                index: i
            });
        }

        return processed;
    } catch (e) {
        console.error('API loading error', e);
        return null;
    }
}

// Try CSV fallback by fetching the published CSV export of the sheet
async function tryLoadCsvFallback() {
    try {
        if (window.setStatus) setStatus('Attempting CSV fallback...');

        const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${SHEET_GID}`;
        console.log('Fetching CSV fallback from:', csvUrl);

        const resp = await fetch(csvUrl);
        if (!resp.ok) {
            console.warn('CSV fetch failed with status', resp.status);
            return null;
        }

        const text = await resp.text();

        // Heuristic: if the response contains HTML or login, abandon
        if (text.trim().startsWith('<') || /Sign in to Google/.test(text)) {
            console.warn('CSV fallback appears to be HTML/login page');
            return null;
        }

        const processed = parseCsvTextToData(text);
        return processed;
    } catch (e) {
        console.error('CSV fallback error', e);
        return null;
    }
}

// Minimal CSV parser that handles quoted fields and returns processedData array
function parseCsvTextToData(csvText) {
    const lines = csvText.split(/\r?\n/).filter(l => l.trim().length > 0);
    if (lines.length <= 1) return [];

    const headers = parseCsvLine(lines[0]);
    const rows = lines.slice(1).map(parseCsvLine);

    const processed = [];

    for (let i = 0; i < rows.length; i++) {
        const cells = rows[i];
        // map columns by index similar to the Google Sheets processing
        const name = cells[0] || `Person ${i + 1}`;
        const photo = cells[1] || `https://via.placeholder.com/100/4682B4/FFFFFF?text=${encodeURIComponent(name.substring(0, 2))}`;
        const age = (cells[2] || 'Unknown').toString();
        const country = cells[3] || 'Unknown';
        const interest = cells[4] || 'Unknown';
        let netWorthStr = cells[5] || '$0';

        let netWorthValue = parseFloat(netWorthStr.toString().replace(/[$,]/g, ''));
        if (isNaN(netWorthValue)) netWorthValue = 0;

        let color;
        if (netWorthValue < 100000) color = '#ff4444';
        else if (netWorthValue < 200000) color = '#ffa500';
        else color = '#44ff44';

        processed.push({
            name,
            photo,
            age,
            country,
            interest,
            netWorth: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(netWorthValue),
            netWorthValue,
            color,
            index: i
        });
    }

    return processed;
}

// Parse a single CSV line into fields (handles quoted values)
function parseCsvLine(line) {
    const result = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
            if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; } else { inQuotes = !inQuotes; }
        } else if (ch === ',' && !inQuotes) {
            result.push(cur);
            cur = '';
        } else {
            cur += ch;
        }
    }
    result.push(cur);
    return result.map(s => s.trim());
}

// Simple on-screen error panel to make sheet/publish failures obvious
function showErrorOverlay(message) {
    let panel = document.getElementById('data-error-overlay');
    if (!panel) {
        panel = document.createElement('div');
        panel.id = 'data-error-overlay';
        panel.style.position = 'fixed';
        panel.style.bottom = '12px';
        panel.style.left = '12px';
        panel.style.padding = '10px 14px';
        panel.style.background = 'rgba(220,53,69,0.95)';
        panel.style.color = 'white';
        panel.style.borderRadius = '6px';
        panel.style.boxShadow = '0 6px 18px rgba(0,0,0,0.3)';
        panel.style.zIndex = 9999;
        panel.style.fontSize = '13px';
        document.body.appendChild(panel);
    }
    panel.textContent = message;
}

function processGoogleSheetsData(data) {
    if (!data.table || !data.table.rows) {
        console.error("Invalid data structure");
        return [];
    }

    const rows = data.table.rows;
    console.log(`Processing ${rows.length} rows`);

    const processedData = [];

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const cells = row.c;

        // Skip if no data
        if (!cells || cells.length < 6) continue;

        // Extract data (based on your CSV structure)
        const name = cells[0]?.v || `Person ${i + 1}`;
        const photo = cells[1]?.v || `https://via.placeholder.com/100/4682B4/FFFFFF?text=${encodeURIComponent(name.substring(0, 2))}`;
        const age = cells[2]?.v?.toString() || 'Unknown';
        const country = cells[3]?.v || 'Unknown';
        const interest = cells[4]?.v || 'Unknown';

        // Net Worth - parse currency
        let netWorthStr = cells[5]?.v || '$0';
        let netWorthValue = 0;

        try {
            // Remove $ and commas, convert to number
            netWorthValue = parseFloat(netWorthStr.toString().replace(/[$,]/g, ''));
            if (isNaN(netWorthValue)) netWorthValue = 0;
        } catch (e) {
            netWorthValue = 0;
        }

        // Determine color based on net worth (Assignment Requirement #5)
        let color;
        if (netWorthValue < 100000) {
            color = '#ff4444'; // Red (< $100K)
        } else if (netWorthValue < 200000) {
            color = '#ffa500'; // Orange ($100K - $200K)
        } else {
            color = '#44ff44'; // Green (> $200K)
        }

        // Format for display
        const formattedNetWorth = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(netWorthValue);

        processedData.push({
            name: name,
            photo: photo,
            age: age,
            country: country,
            interest: interest,
            netWorth: formattedNetWorth,
            netWorthValue: netWorthValue,
            color: color,
            index: i
        });
    }

    return processedData;
}

// Fallback sample data
function useSampleData() {
    console.log("Using sample data...");

    const sampleData = [];
    const countries = ['US', 'CN', 'MY', 'IN'];
    const interests = ['Writing', 'Cooking', 'Traveling', 'Painting', 'Gardening', 'Hiking'];

    // Create 200 sample items (matching assignment CSV)
    for (let i = 0; i < 200; i++) {
        // Create realistic distribution
        let netWorth;
        if (i < 70) {
            netWorth = 30000 + Math.random() * 70000; // Red: < 100K
        } else if (i < 140) {
            netWorth = 100000 + Math.random() * 100000; // Orange: 100K-200K
        } else {
            netWorth = 200000 + Math.random() * 300000; // Green: > 200K
        }

        let color;
        if (netWorth < 100000) color = '#ff4444';
        else if (netWorth < 200000) color = '#ffa500';
        else color = '#44ff44';

        sampleData.push({
            name: `Sample Person ${i + 1}`,
            photo: `https://via.placeholder.com/100/${color.substring(1)}/FFFFFF?text=SP${i + 1}`,
            age: (20 + Math.floor(Math.random() * 40)).toString(),
            country: countries[Math.floor(Math.random() * countries.length)],
            interest: interests[Math.floor(Math.random() * interests.length)],
            netWorth: new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
            }).format(netWorth),
            netWorthValue: netWorth,
            color: color,
            index: i
        });
    }

    if (window.setStatus) {
        setStatus(`Loaded ${sampleData.length} sample records`);
    }

    // Initialize visualization
    if (window.initializeVisualization) {
        setTimeout(() => {
            initializeVisualization(sampleData);
        }, 100);
    }
    window.addEventListener('three-ready', () => {
        const obj = new THREE.CSS3DObject(element);
        console.log("Three JS")
    });
}

// Make function globally accessible
window.loadDataFromGoogleSheets = loadDataFromGoogleSheets;
window.useSampleData = useSampleData;
