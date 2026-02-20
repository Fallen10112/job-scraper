import requests
import json
import os
import time
from dotenv import load_dotenv

# Configuration
# Find the folder where THIS script is actually located
BASE_DIR = Path(__file__).resolve().parent

# Load the .env file from that specific folder
load_dotenv(BASE_DIR / ".env")

HF_API_KEY = os.getenv("HF_API_KEY")
HF_URL = "https://router.huggingface.co/hf-inference/models/facebook/bart-large-cnn"

ADZUNA_APP_ID = os.getenv("ADZUNA_APP_ID")
ADZUNA_APP_KEY = os.getenv("ADZUNA_APP_KEY")

def get_summary(text):
    if not text or len(text) < 100: return "Description too short for AI summary."
    
    payload = {"inputs": text[:1024]}
    headers = {"Authorization": f"Bearer {HF_API_KEY}"}
    
    try:
        response = requests.post(HF_URL, headers=headers, json=payload)
        return response.json()[0]['summary_text']
    except:
        return text[:120] + "..."

def fetch_and_process_jobs(query="Junior Developer", location="United Kingdom"):
    # Adzuna API URL (UK Region)
    url = f"https://api.adzuna.com/v1/api/jobs/gb/search/1?app_id={ADZUNA_APP_ID}&app_key={ADZUNA_APP_KEY}&results_per_page=10&what={query}&where={location}&content-type=application/json"
    
    print(f"Fetching real jobs for {query}...")
    response = requests.get(url)
    data = response.json()
    
    job_list = []
    
    for job in data.get('results', []):
        # 1. Clean up the data
        title = job.get('title', 'Unknown Title').replace('<strong>', '').replace('</strong>', '')
        company = job.get('company', {}).get('display_name', 'Private Company')
        description = job.get('description', 'No description available.')
        
        # 2. Logic for Salary
        salary_min = job.get('salary_min', 'TBC')
        salary = f"£{salary_min:,}" if isinstance(salary_min, (int, float)) else "TBC"

        # 3. Call your AI Brain
        print(f"Summarizing: {title}...")
        summary = get_summary(description)
        
        job_list.append({
            "title": title,
            "company": company,
            "remote": "Yes" if "remote" in description.lower() else "No",
            "salary": salary,
            "summary": summary
        })
        
        time.sleep(1) # Be nice to Hugging Face

    # Save to your H: drive path
    # This moves up one folder from 'scraper' and then into 'data'
    output_path = BASE_DIR.parent / "data" / "jobs.json"

    # Ensure the 'data' directory exists before saving
    output_path.parent.mkdir(parents=True, exist_ok=True)

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(job_list, f, indent=4)
    
    print(f"Done! {len(job_list)} real jobs ready for your website.")

if __name__ == "__main__":
    fetch_and_process_jobs()