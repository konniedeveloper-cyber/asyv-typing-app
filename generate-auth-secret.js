#!/usr/bin/env node

/**
 * Generate a secure NEXTAUTH_SECRET for your application
 * Run: node generate-auth-secret.js
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

function generateSecret() {
  // Generate 32 bytes (256 bits) of random data and convert to base64
  const secret = crypto.randomBytes(32).toString('base64');
  return secret;
}

function updateEnvFile(secret) {
  const envPath = path.join(__dirname, '.env');
  
  if (!fs.existsSync(envPath)) {
    console.error('❌ Error: .env file not found');
    return false;
  }

  let envContent = fs.readFileSync(envPath, 'utf-8');
  
  // Replace or add NEXTAUTH_SECRET
  if (envContent.includes('NEXTAUTH_SECRET=')) {
    envContent = envContent.replace(
      /NEXTAUTH_SECRET="[^"]*"/,
      `NEXTAUTH_SECRET="${secret}"`
    );
  } else {
    envContent += `\nNEXTAUTH_SECRET="${secret}"\n`;
  }

  fs.writeFileSync(envPath, envContent);
  return true;
}

async function main() {
  console.log('🔐 Generating Secure NEXTAUTH_SECRET\n');
  
  const secret = generateSecret();
  
  console.log('Generated Secret:');
  console.log(`"${secret}"\n`);
  
  console.log('This is a 256-bit random secret suitable for production.\n');
  
  // Ask if user wants to update .env
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('Update .env file with this secret? (y/n): ', (answer) => {
    rl.close();
    
    if (answer.toLowerCase() === 'y') {
      if (updateEnvFile(secret)) {
        console.log('✅ .env file updated successfully!');
        console.log('\n💡 Remember to:');
        console.log('1. Restart your development server (npm run dev)');
        console.log('2. Use different secrets for development and production');
        console.log('3. Never commit secrets to version control');
      } else {
        console.log('❌ Failed to update .env file');
      }
    } else {
      console.log('\n📋 To update manually, add this to your .env:');
      console.log(`NEXTAUTH_SECRET="${secret}"`);
    }
  });
}

main();
