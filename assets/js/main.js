// Config
const JOBS_PER_PAGE = 10;
let allJobs = [];
let filteredJobs = [];
let currentPage = 1;

const jobsContainer = document.getElementById('jobs-container');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const pageIndicator = document.getElementById('page-info');

/**
 * 1. Fetch JSON Data with Timestamp Support
 */
async function loadJobs() {
    const loader = document.getElementById('loading-state');
    const lastUpdatedEl = document.getElementById('last-updated');

    if(loader) loader.style.display = 'flex';
    jobsContainer.style.opacity = '0.3'; 

    try {
        // Cache busting ensures you see new results every time you refresh
        const response = await fetch(`data/jobs.json?t=${new Date().getTime()}`);
        allJobs = await response.json();
        
        filteredJobs = [...allJobs]; 
        
        // Show "Last Updated" if your JSON has a timestamp, otherwise use current time
        if (lastUpdatedEl) {
            lastUpdatedEl.innerText = `Last sync: ${new Date().toLocaleTimeString()}`;
        }

        renderPage();
    } catch (error) {
        console.error("Fetch error:", error);
        jobsContainer.innerHTML = `
            <div class="error-notice">
                <p>⚠️ <strong>Please run the scraper first</strong></p>
            </div>`;
    } finally {
        if(loader) loader.style.display = 'none';
        jobsContainer.style.opacity = '1';
    }
}

/**
 * 2. Render the Cards with "AI Summary" styling
 */
function renderPage() {
    jobsContainer.innerHTML = '';
    
    const start = (currentPage - 1) * JOBS_PER_PAGE;
    const end = start + JOBS_PER_PAGE;
    const pageItems = filteredJobs.slice(start, end);

    if (pageItems.length === 0) {
        jobsContainer.innerHTML = `
            <div class="no-results">
                <p class="text-muted">No jobs found. Try adjusting your search filters.</p>
            </div>`;
    }

    pageItems.forEach(job => {
        const card = document.createElement('div');
        card.className = 'job-card fade-in'; // Added a CSS class for smooth entry
        
        // Logic to highlight "Remote" status visually
        const remoteClass = job.remote === "Yes" ? "badge-success" : "badge-secondary";

        card.innerHTML = `
            <div class="card-header">
                <h3>${job.title}</h3>
                <span class="company-tag">${job.company}</span>
            </div>
            <div class="job-meta">
                <span class="badge ${remoteClass}">📍 ${job.remote === "Yes" ? "Remote" : "On-site"}</span>
                <span class="salary-tag">💰 ${job.salary || 'TBC'}</span>
            </div>
            <div class="ai-summary-box">
                <small class="ai-label">✨ AI-GENERATED SUMMARY</small>
                <p>${job.summary}</p>
            </div>
        `;
        jobsContainer.appendChild(card);
    });

    updatePaginationUI();
}

/**
 * 3. Filter Logic with Debouncing
 * (Wait 300ms after user stops typing to filter, saves CPU)
 */
let debounceTimer;
function applyFilters() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        const roleQuery = document.getElementById('roleInput').value.toLowerCase();
        const remoteQuery = document.getElementById('remoteSelect').value;

        filteredJobs = allJobs.filter(job => {
            const matchesRole = job.title.toLowerCase().includes(roleQuery);
            const matchesRemote = (remoteQuery === 'all') || 
                                 (remoteQuery === 'Yes' && job.remote === 'Yes') ||
                                 (remoteQuery === 'No' && job.remote === 'No');
            return matchesRole && matchesRemote;
        });

        currentPage = 1; 
        renderPage();
    }, 300);
}

/**
 * 4. Pagination & Event Listeners
 */
function updatePaginationUI() {
    const totalPages = Math.ceil(filteredJobs.length / JOBS_PER_PAGE);
    if(prevBtn) prevBtn.disabled = currentPage === 1;
    if(nextBtn) nextBtn.disabled = currentPage >= totalPages || totalPages === 0;
    if(pageIndicator) pageIndicator.innerText = `Page ${currentPage} of ${totalPages || 1}`;
}

if(prevBtn) prevBtn.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        renderPage();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
});

if(nextBtn) nextBtn.addEventListener('click', () => {
    const totalPages = Math.ceil(filteredJobs.length / JOBS_PER_PAGE);
    if (currentPage < totalPages) {
        currentPage++;
        renderPage();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
});

document.getElementById('scrapeBtn').addEventListener('click', async () => {
    const role = document.getElementById('roleInput').value;
    const workType = document.getElementById('remoteSelect').value;

    // UI Feedback: Loading State
    btnText.innerText = 'Scraping...';
    btnLoader.style.display = 'inline-block';
    statusText.innerText = "Connecting to server...";

    try {
        const response = await fetch(`run_scraper.php?query=${encodeURIComponent(role)}&location=${encodeURIComponent(workType)}`);
        const result = await response.json();

        if (result.status === 'success') {
            statusText.style.color = 'green';
            statusText.innerText = "Success! Reloading data...";
            // Reload the job list to show new data
            loadJobs();
        } else {
            throw new Error(result.details.join(' '));
        }
    } catch (error) {
        statusText.style.color = 'red';
        statusText.innerText = "Error: Check if Python is running correctly.";
        console.error(error);
    } finally {
        btnText.innerText = '🔍 Sync Live Jobs';
        btnLoader.style.display = 'none';
    }
});

// Initial Load
loadJobs();