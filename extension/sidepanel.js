const analyzeBtn = document.getElementById('analyze-btn');
const resetBtn = document.getElementById('reset-btn');
const statusText = document.getElementById('status');
const loader = document.getElementById('loader');
const mainCard = document.getElementById('main-card');
const resultsDiv = document.getElementById('results');
const scoreDiv = document.getElementById('score');
const summaryDiv = document.getElementById('summary');

// Reset UI to clean state
function resetUI() {
  mainCard.style.display = 'block';
  resultsDiv.style.display = 'none';
  analyzeBtn.style.display = 'block';
  loader.style.display = 'none';
  statusText.textContent = 'Ready to scan...';
  
  // Clear dynamic elements
  document.querySelectorAll('.dynamic-label').forEach(el => el.remove());
  document.getElementById('redline-list').innerHTML = '';
  document.getElementById('redline-summary').style.display = 'none';
  document.getElementById('power-balance').style.display = 'none';
}

// Central analysis orchestrator
async function runAnalysis(targetUrl = null) {
  resetUI();
  analyzeBtn.style.display = 'none';
  loader.style.display = 'block';
  
  try {
    let textToAnalyze = "";

    // Sentry Peek handling
    if (targetUrl) {
      statusText.textContent = `Sentry Peek: Fetching document...`;
      try {
        const response = await fetch(targetUrl, {
          method: 'GET',
          redirect: 'follow',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
          }
        });

        if (!response.ok) throw new Error(`Site blocked access (Status: ${response.status})`);
        const html = await response.text();
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // DOM Sanitization
        ['script', 'style', 'nav', 'footer', 'header', 'iframe'].forEach(tag => {
          doc.querySelectorAll(tag).forEach(el => el.remove());
        });
        
        textToAnalyze = doc.body.innerText || doc.body.textContent;
      } catch (fetchErr) {
        throw new Error(`Connection blocked by site: ${fetchErr.message}`);
      }
    } else {
      // Current tab scraping
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab) return;
      
      statusText.textContent = 'Scraping page content...';
      const [{ result }] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => document.body.innerText,
      });
      textToAnalyze = result;
    }

    if (!textToAnalyze || textToAnalyze.trim().length < 100) {
      throw new Error("Insufficient text found for analysis.");
    }

    statusText.textContent = 'Analyzing with AI Sentinels...';

    const blob = new Blob([textToAnalyze], { type: 'text/plain' });
    const formData = new FormData();
    formData.append('file', blob, 'contract.txt');

    const response = await fetch('http://localhost:3000/api/analyze', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) throw new Error('API unreachable');
    const data = await response.json();
    
    renderResults(data.result);

  } catch (error) {
    statusText.textContent = 'Error: ' + error.message;
    analyzeBtn.style.display = 'block';
    loader.style.display = 'none';
  }
}

// Helper to render results
function renderResults(result) {
    mainCard.style.display = 'none';
    resultsDiv.style.display = 'block';
    loader.style.display = 'none';
    statusText.textContent = 'Analysis Complete';

    scoreDiv.textContent = result.overallScore;
    summaryDiv.textContent = result.summary;

    // Show document type with specific class for cleanup
    const docTypeContainer = document.createElement('div');
    docTypeContainer.className = 'dynamic-label';
    docTypeContainer.style.cssText = 'display: flex; align-items: center; gap: 8px; margin-top: -5px; margin-bottom: 15px;';
    
    const docTypeLabel = document.createElement('p');
    docTypeLabel.style.cssText = 'font-size: 14px; font-weight: 700; color: #34C759; text-transform: uppercase; letter-spacing: 0.1em; margin: 0;';
    docTypeLabel.textContent = result.documentType;
    
    docTypeContainer.appendChild(docTypeLabel);

    if (result.confidenceScore) {
      const confidenceBadge = document.createElement('span');
      confidenceBadge.style.cssText = 'font-size: 9px; font-weight: 800; color: #34C759; background: rgba(52, 199, 89, 0.1); border: 1px solid rgba(52, 199, 89, 0.2); padding: 2px 6px; border-radius: 6px;';
      confidenceBadge.textContent = `${result.confidenceScore}% CONFIDENCE`;
      docTypeContainer.appendChild(confidenceBadge);
    }
    
    summaryDiv.parentNode.insertBefore(docTypeContainer, summaryDiv);

    // Power Balance
    if (result.powerBalance && result.documentType !== "Non-Legal Document") {
      document.getElementById('power-balance').style.display = 'block';
      document.getElementById('party-a').textContent = result.powerBalance.partyA;
      document.getElementById('party-b').textContent = result.powerBalance.partyB;
      const score = result.powerBalance.balanceScore;
      const bar = document.getElementById('balance-bar');
      bar.style.left = `${Math.max(0, Math.min(100, (50 + (score / 2)) - 10))}%`;
    }

    // Redlines
    const redlines = result.keyPillars ? result.keyPillars.filter(p => p.redline).map(p => ({ title: p.title, content: p.redline })) : [];
    if (redlines.length > 0) {
      const list = document.getElementById('redline-list');
      document.getElementById('redline-summary').style.display = 'block';
      list.innerHTML = redlines.map(rl => `
        <div style="margin-bottom:12px; padding:10px; background:rgba(255,255,255,0.03); border-radius:12px; border-left: 2px solid #34C759;">
          <div style="font-weight:800; font-size:9px; color:#34C759; margin-bottom:5px; text-transform:uppercase; letter-spacing:0.05em;">${rl.title}</div>
          <div style="font-size:12px; line-height:1.5; color:rgba(255,255,255,0.7);">
            ${rl.content.replace(/~~(.*?)~~/g, '<span style="color:#FF3B30; text-decoration:line-through;">$1</span>').replace(/\*\*(.*?)\*\*/g, '<span style="color:#34C759; font-weight:bold;">$1</span>')}
          </div>
        </div>`).join('');
    }
}

analyzeBtn.addEventListener('click', () => runAnalysis());

resetBtn.addEventListener('click', () => {
  mainCard.style.display = 'block';
  resultsDiv.style.display = 'none';
  analyzeBtn.style.display = 'block';
  loader.style.display = 'none';
  statusText.textContent = 'Ready to scan...';
});

// Check for pending URLs from Sentry Peek on startup
chrome.storage.local.get(['pendingUrl'], (result) => {
  if (result.pendingUrl) {
    const url = result.pendingUrl;
    // Clear it so it doesn't run again on next manual open
    chrome.storage.local.remove('pendingUrl');
    runAnalysis(url);
  }
});

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "startPendingAnalysis") {
    // Clear cache immediately since we're handling it
    chrome.storage.local.remove('pendingUrl');
    runAnalysis(message.url);
  }
});
