const { MongoClient, ServerApiVersion } = require('mongodb');

// Password: *dishimwe930# → URL encoded: %2Adishimwe930%23
const uri = "mongodb+srv://konnie:%2Adishimwe930%23@cluster0.csjlaiv.mongodb.net/typing-auth?retryWrites=true&w=majority";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    console.log('🔌 Connecting to MongoDB...\n');
    
    // Connect the client to the server
    await client.connect();
    
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("✅ Pinged your deployment. You successfully connected to MongoDB!");
    
    // Get database info
    const database = client.db("typing-auth");
    const collections = await database.listCollections().toArray();
    
    console.log('\n📊 Database: typing-auth');
    console.log(`Collections: ${collections.length}`);
    collections.forEach(col => {
      console.log(`  - ${col.name}`);
    });
    
    console.log('\n✅ MongoDB connection is working!\n');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed!');
    console.error('Error:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Check if cluster is ACTIVE: https://cloud.mongodb.com/v2/');
    console.error('2. Verify IP whitelist includes your IP (Security → Network Access)');
    console.error('3. Check username/password are correct');
    console.error('4. Ensure special characters are URL encoded');
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

run().catch(console.dir);
