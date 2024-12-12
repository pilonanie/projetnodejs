const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const db = require('./db');

const app = express();

// Configuration
app.set('view engine', 'ejs'); // Utilisation d'EJS pour les vues
app.use(express.static('public')); // Dossier pour les fichiers statiques (CSS, JS)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'votre-secret', // Changer pour un secret sécurisé
    resave: false,
    saveUninitialized: true
}));

// Page d'accueil (liste des utilisateurs)
app.get('/', (req, res) => {
    // Vérifier si l'utilisateur est connecté
    if (!req.session.loggedIn) {
        return res.redirect('/login'); // Rediriger si non connecté
    }

    const query = 'SELECT * FROM users';
    db.query(query, (err, results) => {
        if (err) throw err;
        res.render('index', { users: results });
    });
});

// Page de connexion
app.get('/login', (req, res) => {
    res.render('login');
});

// Soumettre le formulaire de connexion
app.post('/login', (req, res) => {
    const { username } = req.body;
    
    // Logique pour vérifier le nom d'utilisateur
    const query = 'SELECT * FROM users WHERE name = ?';
    db.query(query, [username], (err, results) => {
        if (err) throw err;

        if (results.length > 0) {
            // Connexion réussie, ajouter une session
            req.session.loggedIn = true;
            req.session.username = username;
            res.redirect('/');
        } else {
            // Si l'utilisateur n'existe pas
            res.send('Nom d\'utilisateur incorrect');
        }
    });
});

// Ajouter un utilisateur
app.post('/add', (req, res) => {
    const { name, email } = req.body;
    const query = 'INSERT INTO users (name, email) VALUES (?, ?)';
    db.query(query, [name, email], (err) => {
        if (err) throw err;
        res.redirect('/');
    });
});

// Modifier un utilisateur
app.post('/edit/:id', (req, res) => {
    const { name, email } = req.body;
    const query = 'UPDATE users SET name = ?, email = ? WHERE id = ?';
    db.query(query, [name, email, req.params.id], (err) => {
        if (err) throw err;
        res.redirect('/');
    });
});

// Supprimer un utilisateur
app.get('/delete/:id', (req, res) => {
    const query = 'DELETE FROM users WHERE id = ?';
    db.query(query, [req.params.id], (err) => {
        if (err) throw err;
        res.redirect('/');
    });
});

// Démarrage du serveur
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});

