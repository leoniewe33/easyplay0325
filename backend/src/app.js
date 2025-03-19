const express = require('express');
const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    favorites: [{ type: String }],
    progress: [{
        episodeId: String,
        timestamp: Number
    }]
});
UserSchema.plugin(passportLocalMongoose);

const User = mongoose.models.User || mongoose.model('User', UserSchema);
module.exports = User;
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const cors = require('cors');
const path = require('path');

const app = express();
const EXP_PORT = 10045;

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

app.post('/favorites', async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Nicht eingeloggt" });

    const { podcastId } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
        return res.status(404).json({ message: "Benutzer nicht gefunden" });
    }

    if (!Array.isArray(user.favorites)) {
        user.favorites = [];
    }

    if (!user.favorites.includes(podcastId)) {
        user.favorites.push(podcastId);
        await user.save();
    }

    res.json({ message: "Favorit hinzugefügt", favorites: user.favorites });
});

app.get('/favorites', async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Nicht eingeloggt" });

    const user = await User.findById(req.user._id);
    res.json({ favorites: user.favorites });
});

app.delete('/favorites/:podcastId', async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Nicht eingeloggt" });

    const podcastId = req.params.podcastId;

    try {
        // 1. Update des User-Dokuments: Entferne podcastId aus dem favorites-Array
        const result = await User.updateOne(
            { _id: req.user._id }, 
            { $pull: { favorites: podcastId } }  // $pull entfernt das Element aus dem Array
        );

        // 2. Überprüfe, ob das Element tatsächlich entfernt wurde
        if (result.modifiedCount === 0) {
            return res.status(404).json({ message: "Favorit nicht gefunden" });
        }

        // 3. Gib die aktualisierten Favoriten zurück
        const updatedUser = await User.findById(req.user._id);
        res.json({ message: "Favorit entfernt", favorites: updatedUser.favorites });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// Ändern des Benutzernamens
app.put('/user/username', isLoggedIn, async (req, res) => {
    const { newUsername } = req.body;

    if (!newUsername) {
        return res.status(400).json({ message: 'Neuer Benutzername ist erforderlich' });
    }

    try {
        // Aktualisiere den Benutzernamen
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'Benutzer nicht gefunden' });
        }

        user.username = newUsername;
        await user.save();

        // Aktualisiere die Session des Benutzers
        req.login(user, (err) => {
            if (err) {
                return res.status(500).json({ message: 'Fehler beim Aktualisieren der Session' });
            }
            res.json({ message: 'Benutzername erfolgreich geändert', user: user });
        });

    } catch (err) {
        res.status(500).json({ message: 'Fehler beim Ändern des Benutzernamens', error: err.message });
    }
});

// Ändern des Passworts
// Ändern des Passworts
app.put('/user/password', isLoggedIn, async (req, res) => {
    const { newPassword } = req.body;

    if (!newPassword) {
        return res.status(400).json({ message: 'Neues Passwort ist erforderlich' });
    }

    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'Benutzer nicht gefunden' });
        }

        // Verwende setPassword von passport-local-mongoose
        await new Promise((resolve, reject) => {
            user.setPassword(newPassword, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        await user.save();
        res.json({ message: 'Passwort erfolgreich geändert' });
    } catch (err) {
        res.status(500).json({ message: 'Fehler beim Ändern des Passworts', error: err.message });
    }
});
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.status(401).json({ error: "Nicht eingeloggt" });
}

app.listen(EXP_PORT, () => {
    console.log(`Server läuft auf Port ${EXP_PORT}`);
});


// Account löschen
app.delete('/user/delete', isLoggedIn, async (req, res) => {
    try {
        // Versuche, den Benutzer anhand seiner ID zu löschen
        const user = await User.findByIdAndDelete(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'Benutzer nicht gefunden' });
        }

        // Logout den Benutzer nach der Löschung
        req.logout((err) => {
            if (err) {
                return res.status(500).json({ message: 'Fehler beim Logout' });
            }
            // Sende eine Antwort zurück, die den Erfolg des Löschens und des Logouts bestätigt
            res.json({ message: 'Benutzer erfolgreich gelöscht und abgemeldet' });
        });
    } catch (err) {
        res.status(500).json({ message: 'Fehler beim Löschen des Benutzers', error: err.message });
    }
});

// Ersetze die bestehende /progress-Route durch diese erweiterte Version
app.post('/progress', async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Nicht eingeloggt" });

    let { episodeId, timestamp } = req.body;

    if (!episodeId || timestamp == null) {
        return res.status(400).json({ message: "episodeId und timestamp sind erforderlich" });
    }

    timestamp = Number(timestamp);

    if (isNaN(timestamp) || timestamp < 0) {
        return res.status(400).json({ message: "Ungültiger timestamp" });
    }

    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: "Benutzer nicht gefunden" });

        // Update oder erstelle Progress-Eintrag
        const existingIndex = user.progress.findIndex(p => p.episodeId === episodeId);
        
        if (existingIndex > -1) {
            user.progress[existingIndex].timestamp = timestamp;
        } else {
            user.progress.push({ episodeId, timestamp });
        }

        await user.save();
        res.json({ 
            message: "Fortschritt gespeichert",
            progress: user.progress.find(p => p.episodeId === episodeId)
        });

    } catch (err) {
        res.status(500).json({ 
            message: "Fehler beim Speichern des Fortschritts", 
            error: err.message 
        });
    }
});

// Füge eine GET-Route für Progress hinzu
app.get('/progress', async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Nicht eingeloggt" });

    const { episodeId } = req.query;
    if (!episodeId) return res.status(400).json({ message: "episodeId erforderlich" });

    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: "Benutzer nicht gefunden" });

        const progress = user.progress.find(p => p.episodeId === episodeId);
        res.json({ timestamp: progress ? progress.timestamp : 0 });

    } catch (err) {
        res.status(500).json({ 
            message: "Fehler beim Laden des Fortschritts", 
            error: err.message 
        });
    }
});