import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const url = process.env.DATABASE_URL;

if (!url) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

console.log('Testing MongoDB connection...');
console.log('Connection string (masked):', url.replace(/password=[^@]+/, 'password=***'));

const client = new MongoClient(url, {
  serverSelectionTimeoutMS: 5000,
});

(async () => {
  try {
    await client.connect();
    console.log('✓ MongoDB connection successful!');
    
    const admin = client.db('admin');
    const status = await admin.command({ ping: 1 });
    console.log('✓ Ping successful:', status);
    
    await client.close();
    process.exit(0);
  } catch (error) {
    console.error('✗ MongoDB connection failed:');
    console.error('Error:', error.message);
    console.error('\nPossible solutions:');
    console.error('1. Check credentials in .env.local');
    console.error('2. Whitelist your IP in MongoDB Atlas (0.0.0.0/0 for testing)');
    console.error('3. Ensure DATABASE_URL is correctly formatted');
    console.error('4. Check network connectivity to MongoDB Atlas');
    process.exit(1);
  }
})();
