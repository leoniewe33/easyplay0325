async function main() {
    const { MongoClient } = require('mongodb');
    const uri = 'mongodb://webengineering.ins.hs-anhalt.de:10043/testdb';
    const client = new MongoClient(uri);
  
    try {
      await client.connect();
      console.log('Verbindung erfolgreich');
  
      const db = client.db('testdb');
      const collection = db.collection('users');

      const result = await collection.insertOne({ name: 'Leonie', password: '1234' });
      console.log('Eingefügt');
    } catch (err) {
      console.error('Fehler:', err);
    } finally {
      await client.close();
    }
  }
  
  main().catch(console.error);