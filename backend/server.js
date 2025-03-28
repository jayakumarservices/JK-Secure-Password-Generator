const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const moment = require('moment-timezone');
const https = require('https');
const http = require('http');
const { URL } = require('url');
const favicon = require('favicon');
const getFavicons = require('get-website-favicon');

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Schema Definition
const loginSchema = new mongoose.Schema({
  serialNumber: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  username: { type: String, required: true },
  website: { type: String, required: true },
  websiteLogo: { type: String }, // base64 encoded logo
  password: { type: String, required: true },
  email: { type: String, required: true },
  note: String,
  createdAt: { type: Date, default: () => moment().tz('Asia/Kolkata').toDate() },
  updatedAt: { type: Date, default: () => moment().tz('Asia/Kolkata').toDate() }
});

const Login = mongoose.model('Login', loginSchema);

// Function to get next serial number
async function getNextSerialNumber() {
  const lastLogin = await Login.findOne().sort('-serialNumber');
  return lastLogin ? lastLogin.serialNumber + 1 : 1;
}

// Function to fetch favicon and convert to base64
async function getFaviconBase64(websiteUrl) {
  try {
    // Ensure URL has protocol
    if (!websiteUrl.startsWith('http')) {
      websiteUrl = 'https://' + websiteUrl;
    }

    // Get favicons using the package
    const data = await getFavicons(websiteUrl);
    if (data && data.icons && data.icons.length > 0) {
      // Sort icons by size and get the largest one
      const icons = data.icons.sort((a, b) => {
        const sizeA = a.sizes ? parseInt(a.sizes.split('x')[0]) : 0;
        const sizeB = b.sizes ? parseInt(b.sizes.split('x')[0]) : 0;
        return sizeB - sizeA;
      });

      // Get the best icon (prefer PNG/ICO over SVG)
      const bestIcon = icons.find(icon => 
        icon.src && (
          icon.src.endsWith('.png') || 
          icon.src.endsWith('.ico') || 
          icon.src.endsWith('.jpg') || 
          icon.src.endsWith('.jpeg')
        )
      ) || icons[0];

      if (bestIcon && bestIcon.src) {
        console.log('Found favicon:', bestIcon.src);
        return bestIcon.src;
      }
    }

    // Fallback to Google favicon service
    console.log('Using Google favicon service as fallback');
    return `https://www.google.com/s2/favicons?domain=${new URL(websiteUrl).hostname}&sz=32`;
  } catch (error) {
    console.error('Error in getFaviconBase64:', error);
    // Return Google favicon service as fallback
    try {
      const domain = new URL(websiteUrl).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch (e) {
      return null;
    }
  }
}

// API Routes
app.post('/api/one-time-login', async (req, res) => {
  try {
    const { name, website, username, email, password, note } = req.body;
    
    // Check for duplicate entry
    const duplicate = await Login.findOne({
      website,
      username,
      email
    });
    
    if (duplicate) {
      return res.status(400).json({ error: 'Login already exists for this website and username' });
    }
    
    // Get website logo
    const websiteLogo = await getFaviconBase64(website);
    
    // Create new login with next serial number
    const serialNumber = await getNextSerialNumber();
    const login = new Login({
      serialNumber,
      name,
      website,
      username,
      websiteLogo,
      password,
      email,
      note,
      createdAt: moment().tz('Asia/Kolkata').toDate(),
      updatedAt: moment().tz('Asia/Kolkata').toDate()
    });
    
    await login.save();
    res.status(201).json(login);
  } catch (error) {
    console.error('Error creating login:', error);
    res.status(500).json({ error: 'Failed to create login' });
  }
});

app.get('/api/one-time-logins', async (req, res) => {
  try {
    const logins = await Login.find().sort('serialNumber');
    res.json(logins);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch logins' });
  }
});

app.get('/api/one-time-login/:serialNumber', async (req, res) => {
  try {
    const login = await Login.findOne({ serialNumber: req.params.serialNumber });
    if (!login) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.json(login);
  } catch (error) {
    console.error('Error fetching one-time login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/one-time-login/:serialNumber', async (req, res) => {
  try {
    const { name, username, website, password, email, note } = req.body;
    
    // Check for duplicate entry excluding current record
    const existingLogin = await Login.findOne({
      website,
      username,
      serialNumber: { $ne: req.params.serialNumber }
    });
    if (existingLogin) {
      return res.status(400).json({ error: 'Duplicate entry found' });
    }

    // Get website logo
    const websiteLogo = await getFaviconBase64(website);

    const login = await Login.findOneAndUpdate(
      { serialNumber: req.params.serialNumber },
      {
        name,
        username,
        website,
        websiteLogo,
        password,
        email,
        note,
        updatedAt: moment().tz('Asia/Kolkata').toDate()
      },
      { new: true }
    );

    if (!login) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.json(login);
  } catch (error) {
    console.error('Error updating one-time login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/one-time-login/:serialNumber', async (req, res) => {
  try {
    const login = await Login.findOneAndDelete({ serialNumber: req.params.serialNumber });
    if (!login) {
      return res.status(404).json({ error: 'Login not found' });
    }
    res.json({ message: 'Login deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete login' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 