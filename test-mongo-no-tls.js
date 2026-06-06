const { MongoClient, ServerApiVersion } = require('mongodb');

// Try without TLS strict mode
const uri = "mongodb+srv://konnie:%2Adishimwe930%23@cluster0.csjlaiv.mongodb.net/typing-auth?retryWrites=true&w=majority";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: false,  // Changed to false
    deprecationErrors: false,  // Changed to false
  },
  tls: false,  // Try without TLS
});

async function run() {
  try {
    console.log('🔌 Connecting to MongoDB (without strict TLS)...\n');
    
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("✅ Connected to MongoDB!\n");
    
  } catch (error) {
    console.error('❌ Still failed. Error:', error.message);
    console.log('\n💡 Solutions:');
    console.log('1. Go to https://cloud.mongodb.com/v2/');
    console.log('2. Click Cluster0');
    console.log('3. Check if it says ACTIVE (not PAUSED)');
    console.log('4. If paused, click "Resume" button');
    console.log('5. Wait 2-3 minutes for cluster to start');
    console.log('6. Try again\n');
  } finally {
    await client.close();
  }
}

run().catch(console.dir);
