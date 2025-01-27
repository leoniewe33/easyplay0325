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
  async function createUser(userName, userPassword) {
    const { MongoClient } = require('mongodb');
    const uri = 'mongodb://webengineering.ins.hs-anhalt.de:10043/testdb';
    const client = new MongoClient(uri);

    try {
      await client.connect();
      const db = client.db('testdb');
      const collection = db.collection('users');

      // 检查用户是否已存在
      const existingUser = await collection.findOne({ name: userName });
      if (existingUser) {
        return 'User already exists';
      }

      // 创建新用户
      const result = await collection.insertOne({ name: userName, password: userPassword });
      return 'User created successfully';
    } catch (err) {
      console.error('Error creating user:', err);
      return 'Error creating user';
    } finally {
      await client.close();
    }
}
async function deleteUser(userName) {
  const { MongoClient } = require('mongodb');
  const uri = 'mongodb://webengineering.ins.hs-anhalt.de:10043/testdb';
  const client = new MongoClient(uri);

  try {
      await client.connect();
      const db = client.db('testdb');
      const collection = db.collection('users');

      const result = await collection.deleteOne({ name: userName });
      if (result.deletedCount === 1) {
          console.log(`Successfully deleted one document.`);
          return 'Successfully deleted one document.';
      } else {
          console.log(`No documents matched the query. Deleted 0 documents.`);
          return 'No documents matched the query. Deleted 0 documents.';
      }
  } catch (err) {
      console.error('Delete error:', err);
      return 'Error in deleting user';
  } finally {
      await client.close();
  }
}

  main().catch(console.error);