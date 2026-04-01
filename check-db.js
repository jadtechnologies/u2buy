const { MongoClient } = require('mongodb');

async function main() {
    const uri = 'mongodb+srv://digitalexpertsjad_db_user:5e8KBRcNIrGXzzNV@cluster0.ppovtcx.mongodb.net/?appName=Cluster0';
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const dbs = await client.db().admin().listDatabases();
        console.log("Databases:");
        console.log(dbs.databases.map(db => db.name));
        
        for (const dbInfo of dbs.databases) {
            const dbName = dbInfo.name;
            if (dbName === 'admin' || dbName === 'local') continue;
            const collections = await client.db(dbName).listCollections().toArray();
            console.log(`\nCollections in ${dbName}:`, collections.map(c => c.name));
            if (collections.map(c => c.name).includes('Product')) {
                 const count = await client.db(dbName).collection('Product').countDocuments();
                 console.log(`  Products in ${dbName}: ${count}`);
            }
        }
    } finally {
        await client.close();
    }
}

main().catch(console.error);
