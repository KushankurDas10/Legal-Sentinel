// Legal Sentinel Content Script - "Sentry Peek"
// Automatically identifies legal links and adds a "Sentinel" badge

function injectRiskBadges() {
  const legalKeywords = ['terms', 'privacy', 'policy', 'tos', 'agreement', 'legal', 'license', 'contract'];
  const links = document.querySelectorAll('a');

  links.forEach(link => {
    // Avoid double injection
    if (link.dataset.sentinelActive) return;

    const text = link.innerText.toLowerCase();
    const href = link.href.toLowerCase();

    const isLegalLink = legalKeywords.some(keyword => text.includes(keyword) || href.includes(keyword));

    if (isLegalLink) {
      link.dataset.sentinelActive = "true";
      
      const badge = document.createElement('span');
      badge.innerHTML = '🛡️'; // Sentinel Shield Icon
      badge.title = "Legal Sentinel: Safe to scan this document";
      badge.style.cssText = `
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 16px;
        height: 16px;
        margin-left: 4px;
        font-size: 10px;
        cursor: pointer;
        transition: transform 0.2s;
        vertical-align: middle;
      `;

      badge.addEventListener('mouseenter', () => {
        badge.style.transform = 'scale(1.4) rotate(10deg)';
      });
      badge.addEventListener('mouseleave', () => {
        badge.style.transform = 'scale(1)';
      });

      badge.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        // Notify background/sidepanel to analyze this link
        chrome.runtime.sendMessage({ action: "analyzeLink", url: link.href });
      });

      link.appendChild(badge);
    }
  });
}

// Run on load and when the DOM changes (for SPAs)
injectRiskBadges();
const observer = new MutationObserver(injectRiskBadges);
observer.observe(document.body, { childList: true, subtree: true });
