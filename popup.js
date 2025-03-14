// Password generation functions
function generateRandomString(length, options) {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  let chars = '';
  if (options.uppercase) chars += uppercase;
  if (options.lowercase) chars += lowercase;
  if (options.numbers) chars += numbers;
  if (options.symbols) chars += symbols;
  
  if (!chars) {
    chars = uppercase + lowercase + numbers + symbols; // Fallback to all characters
  }
  
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// One-time password generation using TOTP-like algorithm
function generateOneTimePassword(secret, timestamp) {
  const crypto = window.crypto;
  const encoder = new TextEncoder();
  const data = encoder.encode(secret + timestamp);
  
  return crypto.subtle.digest('SHA-256', data).then(hash => {
    const hashArray = Array.from(new Uint8Array(hash));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex.substring(0, 12); // Use first 12 characters for the password
  });
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  const generateBtn = document.getElementById('generate-password');
  const copyBtn = document.getElementById('copy-password');
  const generateOneTimeBtn = document.getElementById('generate-one-time');
  
  // Generate regular password
  generateBtn.addEventListener('click', () => {
    const length = parseInt(document.getElementById('password-length').value);
    const options = {
      uppercase: document.getElementById('uppercase').checked,
      lowercase: document.getElementById('lowercase').checked,
      numbers: document.getElementById('numbers').checked,
      symbols: document.getElementById('symbols').checked
    };
    
    const password = generateRandomString(length, options);
    document.getElementById('generated-password').textContent = password;
  });
  
  // Copy password to clipboard
  copyBtn.addEventListener('click', () => {
    const password = document.getElementById('generated-password').textContent;
    navigator.clipboard.writeText(password).then(() => {
      copyBtn.textContent = 'Copied!';
      setTimeout(() => {
        copyBtn.textContent = 'Copy';
      }, 2000);
    });
  });
  
  // Generate one-time login
  generateOneTimeBtn.addEventListener('click', async () => {
    const website = document.getElementById('website').value;
    const username = document.getElementById('username').value;
    
    if (!website || !username) {
      alert('Please enter both website URL and username');
      return;
    }
    
    const secret = website + username + Date.now().toString();
    const timestamp = Math.floor(Date.now() / 1000 / 30); // 30-second window
    
    try {
      const oneTimePassword = await generateOneTimePassword(secret, timestamp);
      document.getElementById('one-time-password').value = oneTimePassword;
      
      // Store the one-time login information
      chrome.storage.local.get(['oneTimeLogins'], (result) => {
        const oneTimeLogins = result.oneTimeLogins || [];
        oneTimeLogins.push({
          website,
          username,
          timestamp: Date.now(),
          used: false
        });
        chrome.storage.local.set({ oneTimeLogins });
      });
    } catch (error) {
      console.error('Error generating one-time password:', error);
      alert('Error generating one-time password');
    }
  });
}); 