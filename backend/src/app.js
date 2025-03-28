const express = require('express');
const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const bcrypt = require("bcrypt");
const session = require('express-session');
const MongoStore = require('connect-mongo');
cont path = require('path');
const fileURLToPath = ('url');

const LogSchema = new mongoose.Schema({
    timestamp: { type: Date, default: Date.now },
    userId: mongoose.Schema.Types.ObjectId,
    username: String,
    action: String,
    details: String
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const Log = mongoose.model('Log', LogSchema);

async function logUserAction(req, user, action, details = '') {
    try {
        const logEntry = new Log({
            userId: user?._id || null,
            username: user?.username || 'unknown',
            action,
            details
        });
        await logEntry.save();
    } catch (err) {
        console.error('Fehler beim Logging:', err);
    }
}

const mongoURI = 'mongodb://webengineering.ins.hs-anhalt.de:10043/testdb';
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
const cors = require('cors');
const path = require('path');
const { userInfo } = require('os');

const app = express();
const EXP_PORT = 3000;

app.use(
    session({
        secret: "e53990a04f75dc79f5a045daffd2b5c4debf4b9ca72b6de42f0",
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: mongoURI,
            ttl: 14 * 24 * 60 * 60 // 14 Tage
        }),
        cookie: {
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 1000 * 60 * 60 * 24 // 24 Stunden
        }
    })
);

app.use(express.json());
app.use(cors({
    origin: "http://frontend'",
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../frontend/src")));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

mongoose.connect(mongoURI).then(() => console.log('MongoDB verbunden'))
    .catch(err => console.error('Fehler bei MongoDB-Verbindung:', err));

app.use(express.static(path.join(__dirname, '../frontend/src')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/src/index.html"));
});

//Alle Nutzer
app.get('/users', async (req, res) => {
    try {
        const users = await User.find({});
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/*/ Alter Code
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
});*/

//Registrieren
app.post("/register", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: "Bitte alle Felder ausfüllen!" });
    }
    prüf = await User.findOne({username});
    if(prüf){
        return res.status(400).json({
            error: true,
            message: "Username existiert bereits. Bitte wähle einen anderen!",
        });
    }
    try {
        const newUser = new User({ username });
        await User.register(newUser, password);
        await logUserAction(req, newUser, 'REGISTRATION', 'Neuer Benutzer registriert');
        res.json({ message: "Erfolgreich registriert!" });
    } catch (err) {
        await logUserAction(req, null, 'REGISTRATION_ERROR', err.message);
        res.status(500).json({ message: "Registrierung fehlgeschlagen!", error: err.message });
    }
});

//Einloggen
app.post("/login", passport.authenticate("local"), (req, res) => {

    const {username, password} = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: "Bitte alle Felder ausfüllen!" });
    }
    logUserAction(req, req.user, 'LOGIN', 'Erfolgreicher Login');
    res.json({ message: "Login erfolgreich", user: req.user });

});

// Ausloggen
app.get("/logout", (req, res, next) => {
    const user = req.user;
    req.logout(function(err) {
        if (err) return next(err);
        req.session.destroy(async (err) => {
            await logUserAction(req, user, 'LOGOUT');
            res.json({ message: "Logout erfolgreich" });
        });
    });
});

//Prüfen ob der Nutzer angemeldet ist
app.get("/session", (req, res) => {
    if (req.isAuthenticated()) {
        res.json({ loggedIn: true, user: req.user });
    } else {
        res.json({ loggedIn: false });
    }
});

// Favorit hinzufügen
app.post('/favorites', async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Nicht eingeloggt" });

    const { podcastId } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
        return res.status(404).json({ message: "Benutzer nicht gefunden" });
    }

    if (!Array.isArray(user.favorites)) {
        user.favorites =[];
    }

    if (!user.favorites.includes(podcastId)) {
        user.favorites.push(podcastId);
        await user.save();
    }

    res.json({ message: "Favorit hinzugefügt", favorites: user.favorites });
});

// Favoriten für Nutzer erhalten
app.get('/favorites', async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Nicht eingeloggt" });

    const user = await User.findById(req.user._id);
    res.json({ favorites: user.favorites });
});

// Favorit löschen
app.delete('/favorites/:podcastId', async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Nicht eingeloggt" });

    const podcastId = req.params.podcastId;

    try {
        const result = await User.updateOne(
            { _id: req.user._id },
            { $pull: { favorites: podcastId } }
        );
        if (result.modifiedCount === 0) {
            return res.status(404).json({ message: "Favorit nicht gefunden" });
        }

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
        prüf = await User.findOne({ username: newUsername });
        if(prüf){
            return res.status(400).json({
                error: true,
                message: "Username existiert bereits. Bitte wähle einen anderen!",
            });
        }
        // Aktualisiere den Benutzernamen
        const user = await User.findById(req.user._id);
        const oldUsername = user.username;

        if (!user) {
            return res.status(404).json({ message: 'Benutzer nicht gefunden' });
        }

        user.username = newUsername;
        await user.save();
        await logUserAction(req, user, 'USERNAME_CHANGE',
            `Geändert von ${oldUsername} zu ${newUsername}`);

        // Aktualisiere die Session des Benutzers
        req.login(user, (err) => {
            if (err) {
                return res.status(500).json({ message: 'Fehler beim Aktualisieren der Session' });
            }
            res.json({ message: 'Benutzername erfolgreich geändert', user: user });
        });

    } catch (err) {
        await logUserAction(req, req.user, 'USERNAME_CHANGE_ERROR', err.message);
        res.status(500).json({ message: 'Fehler beim Ändern des Benutzernamens', error: err.message });
    }
});

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

        await new Promise((resolve, reject) => {
            user.setPassword(newPassword, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        await user.save();
        await logUserAction(req, req.user, 'PASSWORD_CHANGE');
        res.json({ message: 'Passwort erfolgreich geändert' });
    } catch (err) {
        await logUserAction(req, req.user, 'PASSWORD_CHANGE_ERROR', err.message);
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
        const user = req.user;
        req.session.destroy(async (err) => {
            if (err) throw err;
            const deletedUser = await User.findByIdAndDelete(req.user._id);
            if (!deletedUser) return res.status(404).json({ message: 'User not found' });

            await req.sessionStore.destroy(req.sessionID);

            res.clearCookie('connect.sid', {
                path: '/',
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production'
            });

            await logUserAction(req, user, 'ACCOUNT_DELETION');
            res.json({ message: 'Account erfolgreich gelöscht' });
        });

    } catch (err) {
        await logUserAction(req, req.user, 'ACCOUNT_DELETION_ERROR', err.message);
        console.error('Delete error:', err);
        res.status(500).json({
            message: 'Server error',
            error: err.message // Detaillierte Fehlermeldung
        });
    }
});

// Progress für eine Episode hinzufügen
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

//Progress der Podcast Folgen getten
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

//Logs aus der API abrufbar
app.get('/logs', isLoggedIn, async (req, res) => {
    try {
        const logs = await Log.find({})
            .sort({ timestamp: -1 })
            .limit(100)
            .lean();
        res.json(logs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
