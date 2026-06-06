#!/usr/bin/env node

/**
 * Test signup endpoint
 */

import fetch from 'node-fetch';

async function testSignup() {
  const testUser = {
    username: 'testuser_' + Date.now(),
    email: 'test_' + Date.now() + '@example.com',
    password: 'TestPassword123!',
    gender: 'male'
  };

  console.log('🧪 Testing signup endpoint...\n');
  console.log('Payload:', testUser);
  console.log('\nSending request...\n');

  try {
    const response = await fetch('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser),
    });

    const data = await response.json();

    console.log('Response Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('\n✅ Signup successful!');
      console.log('User created:', data.user.username, '(' + data.user.email + ')');
      console.log('Role:', data.user.role);
    } else {
      console.log('\n❌ Signup failed!');
      console.log('Error:', data.error);
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

testSignup();
