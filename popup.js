// API Configuration
const API_BASE_URL = 'http://localhost:3000/api';

// Function to generate random string
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
  
  if (!chars) return '';
  
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Function to generate one-time password
async function generateOneTimePassword(secret, timestamp) {
  const hash = await sha256(secret + timestamp);
  return hash.substring(0, 12);
}

// Function to show message
function showMessage(message, isError = false) {
  const messageDiv = document.getElementById('message');
  messageDiv.textContent = message;
  messageDiv.className = isError ? 'error-message' : 'success-message';
  setTimeout(() => {
    messageDiv.textContent = '';
    messageDiv.className = '';
  }, 5000);
}

// Function to load saved logins
async function loadSavedLogins() {
  try {
    const response = await fetch(`${API_BASE_URL}/one-time-logins`);
    const logins = await response.json();
    
    const savedLoginsDiv = document.getElementById('saved-logins');
    savedLoginsDiv.innerHTML = '';
    
    logins.forEach(login => {
      const loginItem = document.createElement('div');
      loginItem.className = 'login-item';
      
      const websiteLogo = login.websiteLogo ? 
        `<img src="${login.websiteLogo}" alt="${login.website}" class="website-logo" onerror="this.style.display='none'">` : 
        `<div class="website-logo-placeholder">${login.website.charAt(0).toUpperCase()}</div>`;
      
      loginItem.innerHTML = `
        <div class="login-info">
          ${websiteLogo}
          <div class="login-details">
            <strong>${login.name}</strong>
            <small class="website">${login.website}</small>
            <small class="username">Username: ${login.username}</small>
            <small class="date">Created: ${new Date(login.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</small>
            ${login.note ? `<small class="note">Note: ${login.note}</small>` : ''}
          </div>
        </div>
        <div class="login-actions">
          <button onclick="copyPassword('${login.password}')" class="copy-btn">Copy Password</button>
          <button onclick="deleteLogin(${login.serialNumber})" class="delete-btn">Delete</button>
        </div>
      `;
      
      savedLoginsDiv.appendChild(loginItem);
    });
  } catch (error) {
    console.error('Error loading saved logins:', error);
    showMessage('Error loading saved logins', true);
  }
}

// Function to save one-time login
async function saveOneTimeLogin(loginData) {
  try {
    const response = await fetch(`${API_BASE_URL}/one-time-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(loginData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to save login');
    }
    
    const savedLogin = await response.json();
    showMessage('Login saved successfully');
    loadSavedLogins();
    return savedLogin;
  } catch (error) {
    console.error('Error saving login:', error);
    showMessage(error.message, true);
    return null;
  }
}

// Function to delete login
async function deleteLogin(serialNumber) {
  try {
    const response = await fetch(`${API_BASE_URL}/one-time-login/${serialNumber}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete login');
    }
    
    showMessage('Login deleted successfully');
    loadSavedLogins();
  } catch (error) {
    console.error('Error deleting login:', error);
    showMessage('Error deleting login', true);
  }
}

// Function to copy password
function copyPassword(password) {
  navigator.clipboard.writeText(password).then(() => {
    showMessage('Password copied to clipboard');
  }).catch(error => {
    console.error('Error copying password:', error);
    showMessage('Error copying password', true);
  });
}

async function sha256(message) {
    // Convert the message string to a Uint8Array
    const msgBuffer = new TextEncoder().encode(message);
    // Generate the hash
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    // Convert the hash to hex string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  // Load saved logins
  loadSavedLogins();
  
  // Generate regular password
  const generateBtn = document.getElementById('generate-password');
  if (generateBtn) {
    generateBtn.addEventListener('click', () => {
      const length = parseInt(document.getElementById('password-length').value);
      const options = {
        uppercase: document.getElementById('uppercase').checked,
        lowercase: document.getElementById('lowercase').checked,
        numbers: document.getElementById('numbers').checked,
        symbols: document.getElementById('symbols').checked
      };
      
      const password = generateRandomString(length, options);
      const displayElement = document.getElementById('generated-password');
      if (displayElement) {
        displayElement.textContent = password;
      }
    });
  }
  
  // Copy regular password
  const copyBtn = document.getElementById('copy-password');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const password = document.getElementById('generated-password').textContent;
      if (password && password !== 'Click generate to create password') {
        copyPassword(password);
      }
    });
  }
  
  // Generate one-time login
  const generateOneTimeBtn = document.getElementById('generate-one-time');
  if (generateOneTimeBtn) {
    generateOneTimeBtn.addEventListener('click', async () => {
      const name = document.getElementById('name').value;
      const website = document.getElementById('website').value;
      const username = document.getElementById('username').value;
      const email = document.getElementById('email').value;
      const note = document.getElementById('note').value;
      
      if (!name || !website || !username || !email) {
        showMessage('Please fill in all required fields', true);
        return;
      }
      
      try {
        const timestamp = new Date().toISOString();
        const password = await generateOneTimePassword(username + website, timestamp);
        
        // Display the generated password
        const passwordField = document.getElementById('one-time-password');
        if (passwordField) {
          passwordField.value = password;
        }
        
        // Save to database
        const response = await fetch(`${API_BASE_URL}/one-time-login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name,
            website,
            username,
            email,
            password,
            note
          })
        });

        if (!response.ok) {
          throw new Error('Failed to save login');
        }

        const result = await response.json();
        showMessage('Login saved successfully!', false);
        
        // Reset form and refresh list
        const form = document.getElementById('oneTimeLoginForm');
        if (form) {
          form.reset();
        }
        loadSavedLogins();
      } catch (error) {
        console.error('Error:', error);
        showMessage('Failed to save login: ' + error.message, true);
      }
    });
  }
}); 