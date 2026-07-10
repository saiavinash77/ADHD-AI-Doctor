import fs from 'fs';

const content = fs.readFileSync('./src/App.tsx', 'utf8');
const lines = content.split('\n');
const targets = [
  'setAuthError',
  'setAuthSuccessMessage',
  'setAuthEmail',
  'setAuthPassword',
  'setOtpCode',
  'otpDigits',
  'handleDigitChange',
  'handleKeyDown',
  'handlePaste',
  'termsAccepted',
  'setTermsAccepted',
  'showAuthModal',
  'authMode'
];

lines.forEach((line, idx) => {
  const lineNum = idx + 1;
  const match = targets.find(t => line.includes(t));
  if (match) {
    console.log(`${lineNum}: ${line.trim()}`);
  }
});
