const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const User = require('./user');

const app = express();
const EXP_PORT = 10042;

app.use(express.json());
app.use(cors({
    origin: "http://localhost:1234",
    credentials: true
}));

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

const mongoURI = 'mongodb://webengineering.ins.hs-anhalt.de:10043/testdb';
mongoose.connect(mongoURI).then(() => console.log('MongoDB verbunden'))
    .catch(err => console.error('Fehler bei MongoDB-Verbindung:', err));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/src/index.html"));
});

app.get('/users', async (req, res) => {
    try {
        const users = await User.find({});
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/user', async (req, res) => {
    try {
        const { name, password } = req.body;
        if (!name || !password) {
            return res.status(400).json({ error: 'Name und Passwort sind erforderlich' });
        }

        const newUser = new User({ name });
        await User.register(newUser, password);
        res.json({ message: 'Benutzer erstellt', user: newUser });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

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
        await User.register(newUser, password);
        res.json({ message: "Erfolgreich registriert!" });
    } catch (err) {
        res.status(500).json({ message: "Registrierung fehlgeschlagen!", error: err.message });
    }
});

app.post("/login", passport.authenticate("local"), (req, res) => {
    res.json({ message: "Login erfolgreich", user: req.user });
});

app.get("/logout", (req, res, next) => {
    req.logout(function(err) {
        if (err) return next(err);
        req.session.destroy((err) => {
            if (err) return next(err);
            res.json({ message: "Logout erfolgreich" });
        });
    });
});

app.get("/session", (req, res) => {
    if (req.isAuthenticated()) {
        res.json({ loggedIn: true, user: req.user });
    } else {
        res.json({ loggedIn: false });
    }
});

app.get("/secret", isLoggedIn, (req, res) => {
    res.json({ message: "Willkommen auf der geheimen Seite!" });
});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.status(401).json({ error: "Nicht eingeloggt" });
}

app.listen(EXP_PORT, () => {
    console.log(`Server läuft auf Port ${EXP_PORT}`);
});