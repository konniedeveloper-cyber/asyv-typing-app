#!/usr/bin/env node

/**
 * MongoDB Connection Test
 * Tests if MongoDB connection is working
 */

const { MongoClient } = require('mongodb');
require('dotenv').config();

async function testMongoConnection() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('❌ DATABASE_URL not found in .env file');
    process.exit(1);
  }

  console.log('\n🔌 Testing MongoDB Connection\n');
  console.log('Connection URL:', databaseUrl.substring(0, 50) + '...\n');

  let client;
  try {
    client = new MongoClient(databaseUrl, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 5000,
    });

    console.log('⏳ Attempting to connect...\n');
    await client.connect();

    console.log('✅ ✅ ✅ MongoDB Connection SUCCESSFUL! ✅ ✅ ✅\n');

    // Get server info
    const admin = client.db('admin');
    const serverInfo = await admin.command({ serverStatus: 1 });

    console.log('Server Info:');
    console.log(`  Version: ${serverInfo.version}`);
    console.log(`  Uptime: ${serverInfo.uptime} seconds`);
    console.log(`  Current connections: ${serverInfo.connections.current}`);
    console.log(`  Available connections: ${serverInfo.connections.available}`);
    console.log('');

    // List databases
    const databases = await admin.listDatabases();
    console.log('Databases:');
    databases.databases.forEach((db) => {
      console.log(`  - ${db.name}`);
    });
    console.log('');

    await client.close();
    console.log('✅ Connection closed successfully\n');

  } catch (error) {
    console.error('❌ ❌ ❌ MongoDB Connection FAILED ❌ ❌ ❌\n');
    console.error('Error:', error.message);
    console.error('');

    if (error.message.includes('InternalError')) {
      console.log('💡 This is a MongoDB server-side error.');
      console.log('   Solutions:');
      console.log('   1. Check MongoDB Atlas dashboard for alerts');
      console.log('   2. Check if your cluster is running');
      console.log('   3. Verify IP whitelist includes your IP');
      console.log('   4. Wait if MongoDB is performing maintenance\n');
    } else if (error.message.includes('authentication failed')) {
      console.log('💡 This is an authentication error.');
      console.log('   Solutions:');
      console.log('   1. Check username in connection string');
      console.log('   2. Check password is URL encoded (replace special chars)');
      console.log('   3. Verify DATABASE_URL is correct in .env\n');
    } else if (error.message.includes('Server selection timeout')) {
      console.log('💡 MongoDB is not reachable.');
      console.log('   Solutions:');
      console.log('   1. Check if MongoDB cluster is active');
      console.log('   2. Check your internet connection');
      console.log('   3. Verify CONNECTION_STRING has correct host\n');
    }

    if (client) {
      await client.close();
    }
    process.exit(1);
  }
}

testMongoConnection();
