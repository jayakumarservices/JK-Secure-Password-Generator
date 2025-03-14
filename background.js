// Check for expired one-time logins every minute
chrome.alarms.create('checkExpiredLogins', { periodInMinutes: 1 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'checkExpiredLogins') {
    checkExpiredLogins();
  }
});

function checkExpiredLogins() {
  chrome.storage.local.get(['oneTimeLogins'], (result) => {
    const oneTimeLogins = result.oneTimeLogins || [];
    const now = Date.now();
    
    // Remove logins that are older than 5 minutes or have been used
    const updatedLogins = oneTimeLogins.filter(login => {
      const isExpired = now - login.timestamp > 5 * 60 * 1000; // 5 minutes
      return !isExpired && !login.used;
    });
    
    chrome.storage.local.set({ oneTimeLogins: updatedLogins });
  });
}

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'validateOneTimeLogin') {
    validateOneTimeLogin(request.website, request.username, request.password)
      .then(isValid => sendResponse({ isValid }))
      .catch(error => sendResponse({ error: error.message }));
    return true; // Will respond asynchronously
  }
});

async function validateOneTimeLogin(website, username, password) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(['oneTimeLogins'], (result) => {
      const oneTimeLogins = result.oneTimeLogins || [];
      const login = oneTimeLogins.find(l => 
        l.website === website && 
        l.username === username && 
        !l.used
      );
      
      if (!login) {
        resolve(false);
        return;
      }
      
      // Mark the login as used
      login.used = true;
      chrome.storage.local.set({ oneTimeLogins });
      
      resolve(true);
    });
  });
} 