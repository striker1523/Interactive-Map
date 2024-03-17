if (process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}
const express = require("express")
const app = express()
const bcrypt = require("bcrypt")                            // Szyfrowanie
const passport = require('passport')                        
const db = require("./database.js")                         // Baza sqlite
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
// const cors = require('cors')
// const fs = require('fs');

const initializePassport = require('./passport-config.js')  // config haseł
initializePassport(
    passport, 
    email => {
        const sql = 'SELECT * FROM user WHERE email = ?';
        db.get(sql, [email], (err, row) => {
            if (err) {
                console.error(err);
                return null; // Błąd w bazie danych
            }
            return row; // Zwróć użytkownika z bazy danych lub null, jeśli nie znaleziono
        });
    }
);

// Ustawienia serwera
const bodyParser = require('body-parser');          // 
app.use(express.static(__dirname + '/public'));     // Obsługa CSS
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(flash());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))
// app.use(cors())

app.set('view-engine', 'ejs');

// Port serwera
const HTTP_PORT = 8000 

// Start serwera
app.listen(HTTP_PORT, () => {
    console.log("Server running on port %PORT%".replace("%PORT%",HTTP_PORT))
});

// --- Endpointy
// Endpoint strony głównej
app.get("/", checkAuthenticated, (req, res, next) => {
    res.render('index.ejs', {user_id: req.user.user_id, name: req.user.name, email: req.user.email})
});
// profile
app.get("/profile", checkAuthenticated, (req, res, next) => {
    res.render('profile.ejs', {user_id: req.user.user_id, name: req.user.name, email: req.user.email})
});

app.post("/profile", checkAuthenticated, passport.authenticate('local',{
    successRedirect: '/profile',
    failureRedirect: '/',
    failureFlash: true
}))

// Login
app.get("/login", checkNotAuthenticated, (req, res, next) => {
    res.render('login.ejs')
});

app.post("/login", checkNotAuthenticated, passport.authenticate('local',{
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}));

// Rejestracja
app.get("/register", checkNotAuthenticated, (req, res, next) => {
    res.render('register.ejs')
});

app.post("/register", checkNotAuthenticated, async (req, res, next) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        var data = {
            nickname: req.body.nickname,
            email: req.body.email,
            password : hashedPassword
        }
        var sql ='INSERT INTO user (name, email, password) VALUES (?,?,?)'
        var params =[data.nickname, data.email, data.password]
        db.run(sql, params, function (err, result) {
            if (err) {
                // Obsługa błędu
                console.error(err);
                res.redirect('/register'); // Przekierowanie na /register w przypadku błędu
            } else {
                // Pomyślna rejestracja
                res.redirect('/login'); // Przekierowanie na /login po rejestracji
            }
        });
    } catch(err){
        console.error(err);
        res.redirect('/register'); // Przekierowanie na /register w przypadku błędu rejestracji
    }
});

//Wylogowanie
app.delete('/logout', (req, res, next) => {
    req.logOut(function(err) {
        if (err) {
            console.error(err);
        }
        req.session.destroy();
        res.redirect('/login');
    });
});

// Redirect
function checkAuthenticated(req, res, next){
    if (req.isAuthenticated()){
        return next()
    }
    res.redirect('/login')
}

function checkNotAuthenticated(req, res, next){
    if (req.originalUrl === '/profile') {
        return next();
    }
    if (req.isAuthenticated()){
        res.redirect('/')
    }
    next()
}

// Wyświetlanie wszystkich obiektów
app.get("/api/objects", (req, res, next) => {
    try {
        var sql = 'SELECT * FROM objects';
        db.all(sql, [], (err, rows) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Internal server error' });
            } else {
                //console.log(rows); // check
                res.json(rows); // JSON
            }
        });
    } catch(err){
        console.error(err);
    }
});

// Wyświetlanie konkretnego obiektu po id
app.get("/api/objects/:id", (req, res, next) => {
    try {
        const objectId = req.params.id;
        var sql = 'SELECT * FROM objects WHERE object_id = ?';
        db.get(sql, [objectId], (err, row) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Internal server error' });
            } else if (!row) {
                res.status(404).json({ error: 'Object not found' });
            } else {
                res.json(row); // JSON
            }
        });
    } catch(err){
        console.error(err);
    }
});

// Wyświetlanie losowego obiektu
app.get("/api/randomobject", (req, res, next) => {
    try {
        var sql = 'SELECT * FROM objects ORDER BY RANDOM() LIMIT 1;';
        db.get(sql, (err, row) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Internal server error' });
            } else if (!row) {
                res.status(404).json({ error: 'Object not found' });
            } else {
                res.json(row); // JSON
            }
        });
    } catch(err){
        console.error(err);
    }
});

// Wyświetlanie id obiektu po nazwie
app.get("/api/objects/:name", (req, res, next) => {
    try {
        const objectName = req.params.name;
        var sql = 'SELECT object_id FROM objects WHERE name = ?';
        db.get(sql, [objectName], (err, row) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Internal server error' });
            } else if (!row) {
                res.status(404).json({ error: 'Object not found' });
            } else {
                res.json(row); // JSON
            }
        });
    } catch(err){
        console.error(err);
    }
});

// Wyświetlanie bóstw konkretnego obiektu
app.get("/api/objects/deities/:id", (req, res, next) => {
    try {
        const objectId = req.params.id;
        var sql = 'SELECT d.name FROM deities d JOIN object_deities od ON d.deity_id = od.deity_id JOIN objects o ON od.object_id = o.object_id WHERE o.object_id = ?';
        db.all(sql, [objectId], (err, rows) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Internal server error' });
            } else if (!rows) {
                res.status(404).json({name: 'Without a patron'});
            } else {
                res.json(rows); // JSON
            }
        });
    } catch(err){
        console.error(err);
    }
});

// Wyświetlanie bez powtórzeń
app.get("/api/distinct/:what/:from/:order", (req, res, next) => {
    try {
        const sqlWhat = req.params.what;
        const sqlFrom = req.params.from;
        const sqlOrder = req.params.order;
        var sql = `SELECT DISTINCT ${sqlWhat} FROM ${sqlFrom} ORDER BY ${sqlOrder} ASC`;
        db.all(sql, (err, rows) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Internal server error' });
            } else if (!rows || rows.length === 0) {
                res.status(404).json({ error: 'Nothing to show' });
            } else {
                res.json(rows); // JSON
            }
        });
    } catch(err){
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Filtry i wyszukiwarka
app.get("/api/objects/filters/:whereConditions", (req, res, next) => {
    try {
        const sqlConditions = req.params.whereConditions;
        var sql = `SELECT o.object_id, o.name, o.religion, o.type, o.era, o.year, o.prefecture, o.postal_code, o.municipality, o.subdivision, o.apartment, o.Latitude, o.Longitude, o.description FROM objects o LEFT JOIN object_deities od ON o.object_id = od.object_id LEFT JOIN deities d ON d.deity_id = od.deity_id WHERE ${sqlConditions}`;
        db.all(sql, (err, rows) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Internal server error' });
            } else if (!rows || rows.length === 0) {
                res.status(404).json({ error: 'Nothing to show' });
            } else {
                res.json(rows); // JSON
            }
        });
    } catch(err){
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Wyświetlanie komentarzy
app.get("/api/comments/:obj", (req, res, next) => {
    try {
        const sqlObj = req.params.obj;
        var sql = 'SELECT c.user_id, c.comment_id, c.object_id, u.name, c.content, c.date FROM user u JOIN comments c ON c.user_id = u.user_id JOIN objects o ON c.object_id = o.object_id WHERE o.object_id = ? ORDER BY date(c.date) DESC;';
        db.all(sql, [sqlObj], (err, rows) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Internal server error' });
            } else if (!rows || rows.length === 0) {
                res.status(404).json({ error: 'Object not found' });
            } else {
                res.json(rows); // JSON
            }
        });
    } catch(err){
        console.error(err);
    }
});

// Dodanie komentarza
app.post("/api/addcoment", (req, res, next) => {
    try {
        const { uID, oID, cContent, cDate } = req.body;
        var sql = 'INSERT INTO comments (user_id, object_id, content, date) VALUES (?, ?, ?, ?)';
        db.run(sql, [uID, oID, cContent, cDate], (err) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Internal server error' });
            } else {
                res.json({ success: true });
            }
        });
    } catch(err){
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Aktualizacja komentarza
app.put("/api/update/comment", (req, res, next) => {
    try {
        const {cContent, cID, uID, oID} = req.body;
        var sql = 'UPDATE comments SET content = ? WHERE comment_id = ? AND user_id = ? AND object_id = ?';
        db.run(sql, [cContent, cID, uID, oID], (err) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Internal server error' });
            } else {
                res.json({ success: true });
            }
        });
    } catch(err){
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Usunięcie komentarza
app.delete("/api/delete/comment", (req, res, next) => {
    try {
        const { cID, uID, oID } = req.body;
        var sql = 'DELETE FROM comments WHERE comment_id = ? AND user_id = ? AND object_id = ?';
        db.run(sql, [ cID, uID, oID ], (err) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Internal server error' });
            } else {
                res.json({ success: true });
            }
        });
    } catch(err){
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Dodanie oceny
app.post("/api/addrating", (req, res, next) => {
    try {
        const { oID, uID, oRating } = req.body;
        var sql = 'INSERT INTO ratings (object_id, user_id, rating) VALUES (?, ?, ?)';
        db.run(sql, [oID, uID, oRating], (err) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Internal server error' });
            } else {
                res.json({ success: true });
            }
        });
    } catch(err){
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Usunięcie oceny
app.delete("/api/delete/rating", (req, res, next) => {
    try {
        const { oID, uID } = req.body;
        var sql = 'DELETE FROM ratings WHERE object_id = ? AND user_id = ?';
        db.run(sql, [oID, uID], (err) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Internal server error' });
            } else {
                res.json({ success: true });
            }
        });
    } catch(err){
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Aktualizacja oceny
app.post("/api/updaterating", (req, res, next) => {
    try {
        const { oID, uID, oRating } = req.body;
        var sql = 'UPDATE ratings SET rating = ? WHERE object_id = ? AND user_id = ?';
        db.run(sql, [oRating, oID, uID], (err) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Internal server error' });
            } else {
                res.json({ success: true });
            }
        });
    } catch(err){
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Wyświetl wszystkie oceny obiektu
app.get("/api/rating/:uid/:objid", (req, res, next) => {
    try {
        const sqlU = req.params.uid;
        const sqlO = req.params.objid;
        var sql = `select user_id, rating from ratings where user_id = ${sqlU} AND object_id = ${sqlO}`;
        db.all(sql, (err, rows) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Internal server error' });
            } else if (!rows || rows.length === 0) {
                res.status(404).json({ error: 'Object not found' });
            } else {
                res.json(rows); // JSON
            }
        });
    } catch(err){
        console.error(err);
    }
});

// Wyświetl średnią ocen obiektu
app.get("/api/objects/ratings/average/:obj", (req, res, next) => {
    try {
        const sqlObj = req.params.obj;
        var sql = 'select AVG(rating) AS average_rating from ratings where object_id = ?';
        db.all(sql, [sqlObj], (err, rows) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Internal server error' });
            } else if (!rows || rows.length === 0) {
                res.status(404).json({ error: 'Object not found' });
            } else {
                res.json(rows); // JSON
            }
        });
    } catch(err){
        console.error(err);
    }
});

// Odpowiedź domyślna
app.use(function(req, res){
    res.status(404);
});