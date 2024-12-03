const { MongoClient } = require('mongodb');
const url = 'mongodb://webengineering.ins.hs-anhalt.de:10042';
const client = new MongoClient(url);


    async function createUser(uname, upassword)
{
    try {
        // connect to MongoDB
        await client.connect();
        console.log('Verbindung zur MongoDB erfolgreich hergestellt.');

        const dbName = 'testdb';
        const collectionName = 'users';

        // create or collcte the databank
        const db = client.db(dbName);

        // get the collection
        const collection = db.collection(collectionName);

        // add a test file
        const user = { name: uname, password: upassword }; 
        const result = await collection.insertOne(user);
        console.log('Nutzer erfolgreich eingefügt:', result.insertedId);

    } catch (error) {
        console.error('Fehler beim Verbinden oder Arbeiten mit der MongoDB:', error);
    } finally {
        // close the connection
        await client.close();
        console.log('Verbindung zur MongoDB geschlossen.');
    }
}

createUser("Nils","12345678");