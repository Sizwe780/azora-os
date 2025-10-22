/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000; // Port should be managed by orchestrator
const SERVICE_NAME = 'multi-language';

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: SERVICE_NAME,
    timestamp: new Date().toISOString()
  });
});

// Add service-specific routes below this line

app.listen(PORT, () => {
  console.log();
});

// --- Existing code from original file ---

const express = require('express');
const cors = require('cors');
const fs = require('fs/promises');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4087;
const DATA_DIR = path.join(__dirname, 'data');
const TRANSLATIONS_DIR = path.join(DATA_DIR, 'translations');

// Create necessary directories
(async () => {
  await fs.mkdir(DATA_DIR, { recursive: true }).catch(console.error);
  await fs.mkdir(TRANSLATIONS_DIR, { recursive: true }).catch(console.error);
})();

// UN official languages
const UN_LANGUAGES = {
  'ar': 'Arabic',
  'zh': 'Chinese',
  'en': 'English',
  'fr': 'French',
  'ru': 'Russian',
  'es': 'Spanish'
};

// African languages prioritized for Azora
const AFRICAN_LANGUAGES = {
  'af': 'Afrikaans',
  'am': 'Amharic',
  'ha': 'Hausa',
  'ig': 'Igbo',
  'rw': 'Kinyarwanda',
  'ln': 'Lingala',
  'ny': 'Chichewa',
  'om': 'Oromo',
  'so': 'Somali',
  'sw': 'Swahili',
  'st': 'Sesotho',
  'tn': 'Setswana',
  'wo': 'Wolof',
  'xh': 'Xhosa',
  'yo': 'Yoruba',
  'zu': 'Zulu'
};

// World major languages
const MAJOR_LANGUAGES = {
  'bn': 'Bengali',
  'de': 'German',
  'hi': 'Hindi',
  'id': 'Indonesian',
  'it': 'Italian',
  'ja': 'Japanese',
  'ko': 'Korean',
  'ms': 'Malay',
  'pt': 'Portuguese',
  'pa': 'Punjabi',
  'ta': 'Tamil',
  'te': 'Telugu',
  'th': 'Thai',
  'tr': 'Turkish',
  'ur': 'Urdu',
  'vi': 'Vietnamese'
};

// Combined language set
const SUPPORTED_LANGUAGES = {
  ...UN_LANGUAGES,
  ...AFRICAN_LANGUAGES,
  ...MAJOR_LANGUAGES
};

// Translation storage
let translations = {};

// Initialize translations
async function initializeTranslations() {
  try {
    const files = await fs.readdir(TRANSLATIONS_DIR);
    const langFiles = files.filter(file => file.endsWith('.json'));
    
    for (const file of langFiles) {
      try {
        const langCode = file.replace('.json', '');
        const data = await fs.readFile(path.join(TRANSLATIONS_DIR, file), 'utf8');
        translations[langCode] = JSON.parse(data);
        console.log(`Loaded translations for ${langCode}`);
      } catch (err) {
        console.error(`Error loading ${file}:`, err);
      }
    }
    
    // If no translations found, create English base
    if (Object.keys(translations).length === 0) {
      await createBaseTranslations();
    }
  } catch (err) {
    if (err.code === 'ENOENT') {
      await createBaseTranslations();
    } else {
      console.error('Error initializing translations:', err);
    }
  }
}

// Create base translations
async function createBaseTranslations() {
  console.log('Creating base translations...');
  
  // Base English translations
  const baseTranslations = {
    'common': {
      'welcome': 'Welcome to Azora',
      'login': 'Log in',
      'signup': 'Sign up',
      'logout': 'Log out',
      'email': 'Email',
      'password': 'Password',
      'submit': 'Submit',
      'cancel': 'Cancel',
      'save': 'Save',
      'delete': 'Delete',
      'edit': 'Edit',
      'search': 'Search',
      'loading': 'Loading...',
      'error': 'An error occurred',
      'success': 'Success!'
    },
    'auth': {
      'login_title': 'Log in to your account',
      'signup_title': 'Create a new account',
      'forgot_password': 'Forgot password?',
      'reset_password': 'Reset password',
      'confirm_password': 'Confirm password',
      'passwords_dont_match': 'Passwords don\'t match',
      'invalid_credentials': 'Invalid email or password',
      'account_created': 'Account created successfully!'
    },
    'email': {
      'inbox': 'Inbox',
      'sent': 'Sent',
      'drafts': 'Drafts',
      'trash': 'Trash',
      'compose': 'Compose',
      'to': 'To',
      'from': 'From',
      'subject': 'Subject',
      'message': 'Message',
      'send': 'Send',
      'reply': 'Reply',
      'forward': 'Forward',
      'attachment': 'Attachment',
      'new_message': 'New Message'
    },
    'blockchain': {// filepath: /workspaces/azora-os/services/multi-language/index.js
const express = require('express');
const cors = require('cors');
const fs = require('fs/promises');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4087;
const DATA_DIR = path.join(__dirname, 'data');
const TRANSLATIONS_DIR = path.join(DATA_DIR, 'translations');

// Create necessary directories
(async () => {
  await fs.mkdir(DATA_DIR, { recursive: true }).catch(console.error);
  await fs.mkdir(TRANSLATIONS_DIR, { recursive: true }).catch(console.error);
})();

// UN official languages
const UN_LANGUAGES = {
  'ar': 'Arabic',
  'zh': 'Chinese',
  'en': 'English',
  'fr': 'French',
  'ru': 'Russian',
  'es': 'Spanish'
};

// African languages prioritized for Azora
const AFRICAN_LANGUAGES = {
  'af': 'Afrikaans',
  'am': 'Amharic',
  'ha': 'Hausa',
  'ig': 'Igbo',
  'rw': 'Kinyarwanda',
  'ln': 'Lingala',
  'ny': 'Chichewa',
  'om': 'Oromo',
  'so': 'Somali',
  'sw': 'Swahili',
  'st': 'Sesotho',
  'tn': 'Setswana',
  'wo': 'Wolof',
  'xh': 'Xhosa',
  'yo': 'Yoruba',
  'zu': 'Zulu'
};

// World major languages
const MAJOR_LANGUAGES = {
  'bn': 'Bengali',
  'de': 'German',
  'hi': 'Hindi',
  'id': 'Indonesian',
  'it': 'Italian',
  'ja': 'Japanese',
  'ko': 'Korean',
  'ms': 'Malay',
  'pt': 'Portuguese',
  'pa': 'Punjabi',
  'ta': 'Tamil',
  'te': 'Telugu',
  'th': 'Thai',
  'tr': 'Turkish',
  'ur': 'Urdu',
  'vi': 'Vietnamese'
};

// Combined language set
const SUPPORTED_LANGUAGES = {
  ...UN_LANGUAGES,
  ...AFRICAN_LANGUAGES,
  ...MAJOR_LANGUAGES
};

// Translation storage
let translations = {};

// Initialize translations
async function initializeTranslations() {
  try {
    const files = await fs.readdir(TRANSLATIONS_DIR);
    const langFiles = files.filter(file => file.endsWith('.json'));
    
    for (const file of langFiles) {
      try {
        const langCode = file.replace('.json', '');
        const data = await fs.readFile(path.join(TRANSLATIONS_DIR, file), 'utf8');
        translations[langCode] = JSON.parse(data);
        console.log(`Loaded translations for ${langCode}`);
      } catch (err) {
        console.error(`Error loading ${file}:`, err);
      }
    }
    
    // If no translations found, create English base
    if (Object.keys(translations).length === 0) {
      await createBaseTranslations();
    }
  } catch (err) {
    if (err.code === 'ENOENT') {
      await createBaseTranslations();
    } else {
      console.error('Error initializing translations:', err);
    }
  }
}

// Create base translations
async function createBaseTranslations() {
  console.log('Creating base translations...');
  
  // Base English translations
  const baseTranslations = {
    'common': {
      'welcome': 'Welcome to Azora',
      'login': 'Log in',
      'signup': 'Sign up',
      'logout': 'Log out',
      'email': 'Email',
      'password': 'Password',
      'submit': 'Submit',
      'cancel': 'Cancel',
      'save': 'Save',
      'delete': 'Delete',
      'edit': 'Edit',
      'search': 'Search',
      'loading': 'Loading...',
      'error': 'An error occurred',
      'success': 'Success!'
    },
    'auth': {
      'login_title': 'Log in to your account',
      'signup_title': 'Create a new account',
      'forgot_password': 'Forgot password?',
      'reset_password': 'Reset password',
      'confirm_password': 'Confirm password',
      'passwords_dont_match': 'Passwords don\'t match',
      'invalid_credentials': 'Invalid email or password',
      'account_created': 'Account created successfully!'
    },
    'email': {
      'inbox': 'Inbox',
      'sent': 'Sent',
      'drafts': 'Drafts',
      'trash': 'Trash',
      'compose': 'Compose',
      'to': 'To',
      'from': 'From',
      'subject': 'Subject',
      'message': 'Message',
      'send': 'Send',
      'reply': 'Reply',
      'forward': 'Forward',
      'attachment': 'Attachment',
      'new_message': 'New Message'
    },
    'blockchain': {
