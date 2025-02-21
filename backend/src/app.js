const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const EXP_PORT = 10042;

// Middleware
app.use(express.static('public'));
app.use(bodyParser.json());

const mongoURI = 'mongodb://webengineering.ins.hs-anhalt.de:10043/testdb'; // Passe die URI ggf. an
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB verbunden'))
    .catch(err => console.error('Fehler bei MongoDB-Verbindung:', err));


const userSchema = new mongoose.Schema({
    name: String,
    password: String
});

const User = mongoose.model('User', userSchema);

app.get('/', (req, res) => {
  res.send('API läuft. Verfügbare Endpunkte: /users, /user (POST), /user/:name (DELETE)');
});

// GET - Alle Benutzer abrufen
app.get('/users', async (req, res) => {
    try {
        const users = await User.find({});
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST - Neuen Benutzer erstellen
app.post('/user', async (req, res) => {
    try {
        const { name, password } = req.body;
        if (!name || !password) {
            return res.status(400).json({ error: 'Name und Passwort sind erforderlich' });
        }

        const newUser = new User({ name, password });
        await newUser.save();
        res.json({ message: 'Benutzer erstellt', user: newUser });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE - Benutzer löschen
app.delete('/user/:name', async (req, res) => {
    try {
        const result = await User.findOneAndDelete({ name: req.params.name });
        if (!result) {
            return res.status(404).json({ error: 'Benutzer nicht gefunden' });
        }
        res.json({ message: 'Benutzer gelöscht', user: result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Server starten
app.listen(EXP_PORT, () => {
    console.log(`Server läuft auf Port ${EXP_PORT}`);
});