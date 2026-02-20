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
 * 1. Fetch JSON Data
 */
async function loadJobs() {
    const loader = document.getElementById('loading-state');
    const jobsContainer = document.getElementById('jobs-container');

    loader.style.display = 'flex';
    jobsContainer.style.opacity = '0.3'; 

    try {
        await new Promise(resolve => setTimeout(resolve, 800)); 

        const response = await fetch('data/jobs.json');
        allJobs = await response.json();
        filteredJobs = [...allJobs]; 
        
        renderPage();
    } catch (error) {
        jobsContainer.innerHTML = `<p style="color: red;">Error loading data.</p>`;
    } finally {
        loader.style.display = 'none';
        jobsContainer.style.opacity = '1';
    }
}

/**
 * 2. Render the Cards
 */
function renderPage() {
    jobsContainer.innerHTML = '';
    
    const start = (currentPage - 1) * JOBS_PER_PAGE;
    const end = start + JOBS_PER_PAGE;
    const pageItems = filteredJobs.slice(start, end);

    if (pageItems.length === 0) {
        jobsContainer.innerHTML = '<p class="text-muted">No jobs found matching your criteria.</p>';
    }

    pageItems.forEach(job => {
        const card = document.createElement('div');
        card.className = 'job-card';
        card.innerHTML = `
            <h3>${job.title}</h3>
            <div class="company-info">${job.company}</div>
            <div>
                <span class="badge">${job.remote}</span>
                <span class="salary">${job.salary || 'TBC'}</span>
            </div>
            <p class="summary">${job.summary}</p>
        `;
        jobsContainer.appendChild(card);
    });

    updatePaginationUI();
}

/**
 * 3. Filter Logic (Triggered on input change)
 */
function applyFilters() {
    const roleQuery = document.getElementById('roleInput').value.toLowerCase();
    const remoteQuery = document.getElementById('remoteSelect').value;

    filteredJobs = allJobs.filter(job => {
        const matchesRole = job.title.toLowerCase().includes(roleQuery);
        const matchesRemote = (remoteQuery === 'all') || (job.remote === remoteQuery);
        return matchesRole && matchesRemote;
    });

    currentPage = 1; // Reset to page 1 on search
    renderPage();
}

/**
 * 4. Pagination Controls
 */
function updatePaginationUI() {
    const totalPages = Math.ceil(filteredJobs.length / JOBS_PER_PAGE);
    
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage >= totalPages || totalPages === 0;
    
    if(pageIndicator) {
        pageIndicator.innerText = `Page ${currentPage} of ${totalPages || 1}`;
    }
}

prevBtn.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        renderPage();
        window.scrollTo(0, 0);
    }
});

nextBtn.addEventListener('click', () => {
    const totalPages = Math.ceil(filteredJobs.length / JOBS_PER_PAGE);
    if (currentPage < totalPages) {
        currentPage++;
        renderPage();
        window.scrollTo(0, 0);
    }
});

// Initialize
loadJobs();