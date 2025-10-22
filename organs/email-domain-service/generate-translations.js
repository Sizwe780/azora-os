/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const fs = require('fs').promises;
const path = require('path');

// UN official languages plus widely used languages
const LANGUAGES = {
  'en': 'English',
  'ar': 'Arabic',
  'zh': 'Chinese',
  'fr': 'French',
  'ru': 'Russian',
  'es': 'Spanish',
  'sw': 'Swahili',
  'zu': 'Zulu',
  'xh': 'Xhosa',
  'af': 'Afrikaans',
  'pt': 'Portuguese',
  'hi': 'Hindi',
  'ur': 'Urdu',
  'de': 'German',
  'ja': 'Japanese',
  'ko': 'Korean',
  'tr': 'Turkish',
  'it': 'Italian',
};

// Base translations (English)
const BASE_TRANSLATIONS = {
  welcome: 'Welcome to Azora Mail!',
  email_created: 'Your email account has been created.',
  login_success: 'You have successfully logged in.',
  invalid_credentials: 'Invalid email or password.',
  email_sent: 'Email sent successfully.',
  email_error: 'Failed to send email.',
  domain_registered: 'Domain registered successfully.',
  domain_error: 'Failed to register domain.',
  logout_success: 'You have successfully logged out.',
  settings_saved: 'Your settings have been saved.',
  password_changed: 'Your password has been changed.',
  email_deleted: 'Email deleted successfully.',
  email_restored: 'Email restored from trash.',
  email_permanent_delete: 'Email permanently deleted.',
  session_expired: 'Your session has expired. Please log in again.',
  unauthorized: 'Unauthorized access.',
  inbox_empty: 'Your inbox is empty.',
  compliance_notice: 'This email service follows all international regulations and data protection laws.',
};

async function generateTranslations() {
  const translationsDir = path.join(__dirname, 'translations');
  await fs.mkdir(translationsDir, { recursive: true });

  // Create English translation first (as base)
  await fs.writeFile(
    path.join(translationsDir, 'en.json'),
    JSON.stringify({ translation: BASE_TRANSLATIONS }, null, 2)
  );

  console.log(`✓ Created English (en) translations`);

  // In a real application, you would use a translation API
  // For demo, we'll create template files for other languages
  for (const [code, name] of Object.entries(LANGUAGES)) {
    if (code === 'en') continue; // Skip English

    // Create a template with English text (would be translated in production)
    await fs.writeFile(
      path.join(translationsDir, `${code}.json`),
      JSON.stringify({ translation: BASE_TRANSLATIONS }, null, 2)
    );

    console.log(`✓ Created ${name} (${code}) translation template`);
  }

  console.log('\nTranslation files generated. To properly translate:');
  console.log('1. Edit each language file in the translations directory');
  console.log('2. Restart the email service to load the new translations');
}

generateTranslations().catch(console.error);