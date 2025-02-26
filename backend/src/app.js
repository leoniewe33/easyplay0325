const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const cors = require('cors');
const path = require('path');

const app = express();
const EXP_PORT = 10042;
const User = require('./user');


app.use(express.json());

app.use(cors({
    origin: "http://localhost:1234", // Erlaubt nur dein Frontend
    credentials: true
  }));


// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../frontend/src")));

app.use(
    session({
      secret: "geheimes-passwort",
      resave: false,
      saveUninitialized: false,
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());


passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


const mongoURI = 'mongodb://webengineering.ins.hs-anhalt.de:10043/testdb'; // Passe die URI ggf. an
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB verbunden'))
    .catch(err => console.error('Fehler bei MongoDB-Verbindung:', err));



app.get('/', (req, res) => {
  //res.send('API läuft. Verfügbare Endpunkte: /users, /user (POST), /user/:name (DELETE)');
  res.sendFile(path.join(__dirname, "../frontend/src/index.html"));

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

app.post("/register", async (req, res) => {
    const { username, password } = req.body;
  
    if (!username || !password) {
      return res.status(400).json({ message: "Bitte alle Felder ausfüllen!" });
    }
  
    try {
        const newUser = new User({ username });
        await User.register(newUser, password); // `passport-local-mongoose` Methode

        res.json({ message: "Erfolgreich registriert!" });
    } catch (err) {
        res.status(500).json({ message: "Registrierung fehlgeschlagen!", error: err.message });
    }
});
// Login (POST)
app.post("/login", passport.authenticate("local"), (req, res) => {
    res.json({ message: "Login erfolgreich", user: req.user });
  });
  
  // Logout (GET)
  app.get("/logout", (req, res, next) => {
    req.logout();
    req.session.destroy((err) => {
        if (err) return next(err);
        res.json({ message: "Logout erfolgreich" });
    });
});

  
  // Geschützte Route
  app.get("/secret", isLoggedIn, (req, res) => {
    res.json({ message: "Willkommen auf der geheimen Seite!" });
  });
  
  // Middleware für Auth-Check
  function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.status(401).json({ error: "Nicht eingeloggt" });
  }

  
// Server starten
app.listen(EXP_PORT, () => {
    console.log(`Server läuft auf Port ${EXP_PORT}`);
});