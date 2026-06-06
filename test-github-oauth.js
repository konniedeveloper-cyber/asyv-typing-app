#!/usr/bin/env node

/**
 * GitHub OAuth Debug Script
 * Run: node test-github-oauth.js
 */

const envVars = {
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
};

console.log('🔍 GitHub OAuth Configuration Check\n');
console.log('Environment Variables:');
console.log('  ✓ GITHUB_CLIENT_ID:', envVars.GITHUB_CLIENT_ID ? '✅ SET' : '❌ MISSING');
console.log('  ✓ GITHUB_CLIENT_SECRET:', envVars.GITHUB_CLIENT_SECRET ? '✅ SET' : '❌ MISSING');
console.log('  ✓ NEXTAUTH_URL:', envVars.NEXTAUTH_URL || '❌ MISSING');
console.log('  ✓ NEXTAUTH_SECRET:', envVars.NEXTAUTH_SECRET ? '✅ SET' : '❌ MISSING');

console.log('\n📋 Required Callback URLs to Configure in GitHub App:\n');
console.log('Local Development:');
console.log('  http://localhost:3000/api/auth/callback/github\n');
console.log('Production (Vercel):');
console.log('  https://asyvtyper.vercel.app/api/auth/callback/github\n');

console.log('🔗 GitHub Settings URL:');
console.log('  https://github.com/settings/developers\n');

console.log('✅ Checklist:');
console.log('  [ ] GitHub OAuth app created');
console.log('  [ ] Client ID matches environment variable');
console.log('  [ ] Client Secret matches environment variable');
console.log('  [ ] Authorization callback URL(s) added correctly');
console.log('  [ ] Your GitHub email is PUBLIC (not private)');
console.log('  [ ] NEXTAUTH_URL is set correctly for your environment');

console.log('\n💡 Tips:');
console.log('  - If getting OAuthCreateAccount error: Check callback URL in GitHub app');
console.log('  - If getting OAuth error: Make sure GitHub email is public');
console.log('  - Test with different GitHub account if current one has private email');
