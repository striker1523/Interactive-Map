if (process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}
const express = require("express")
const app = express()
const bcrypt = require("bcrypt")
const passport = require('passport')                        
const db = require("./database.js")
const session = require('express-session')
const flash = require('express-flash')                          
const methodOverride = require('method-override')
const bodyParser = require('body-parser');
const initializePassport = require('./passport-config.js')
initializePassport(
    passport, 
    email => {
        const sql = 'SELECT * FROM user WHERE email = ?';
        db.get(sql, [email], (err, row) => {
            if (err) {
                console.error(err);
                return null; // Błąd w bazie danych
            }
            return row; // Zwróć użytkownika z bazy danych lub null
        });
    }
);
app.use(express.static(__dirname + '/public'));
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

app.set('view-engine', 'ejs');

const HTTP_PORT = process.env.PORT

app.listen(HTTP_PORT, () => {
    console.log("Server running on port %PORT%".replace("%PORT%",HTTP_PORT))
});

// Endpoint strony głównej
app.get("/", checkAuthenticated, (req, res, next) => {
    res.render('index.ejs', {user_id: req.user.user_id, name: req.user.name, email: req.user.email, user_type: req.user.isAdmin})
});
// profile
app.get("/profile", checkAuthenticated, (req, res, next) => {
    res.render('profile.ejs', {user_id: req.user.user_id, name: req.user.name, email: req.user.email, user_type: req.user.isAdmin})
});
// admin
app.get("/admin", checkAdmin, (req, res, next) => {
    res.render('admin-panel.ejs', {user_id: req.user.user_id, name: req.user.name, email: req.user.email, user_type: req.user.isAdmin})
});

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
        const password = req.body.password;
        if (!password.match(/^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})/)) {
            return res.redirect('/register');
        }
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        var data = {
            nickname: req.body.nickname,
            email: req.body.email,
            password : hashedPassword
        }
        var sql ='INSERT INTO user (name, email, password, isAdmin) VALUES (?,?,?,0)'
        var params =[data.nickname, data.email, data.password]
        db.run(sql, params, function (err, result) {
            if (err) {
                console.error(err);
                res.redirect('/register'); 
            } else {
                res.redirect('/login'); 
            }
        });
    } catch(err){
        console.error(err);
        res.redirect('/register'); 
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

// MAPBOX Token
app.get("/api/mapbox-token", (req, res) => {
    const Token = process.env.MAPBOX_TOKEN
    res.json({ Token });
});

// Redirect
function checkAuthenticated(req, res, next){
    if (req.isAuthenticated()){
        return next()
    }
    res.redirect('/login')
}

function checkNotAuthenticated(req, res, next){
    if (!req.isAuthenticated()) {
        return next();
    }
    if (req.isAuthenticated()){
        res.redirect('/')
    }
    next()
}
function isAdmin(user) {
    return user.isAdmin === 1;
}
function checkAdmin(req, res, next) {
    if (req.isAuthenticated() && isAdmin(req.user)) {
        return next();
    }
    res.redirect('/profile');
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
        var sql = `SELECT o.object_id, o.name, o.religion, o.type, o.era, 
        o.year, o.prefecture, o.postal_code, o.municipality, o.subdivision, 
        o.apartment, o.Latitude, o.Longitude, o.description FROM objects o 
        LEFT JOIN object_deities od ON o.object_id = od.object_id 
        LEFT JOIN deities d ON d.deity_id = od.deity_id WHERE ${sqlConditions}`;
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

// Wyświetl obiekty do tras
app.get("/api/route/objects/:deityid", (req, res, next) => {
    try {
        const deityID = req.params.deityid;
        var sql = 'SELECT o.object_id, o.name, o.type, o.Latitude, o.Longitude FROM objects o JOIN object_deities od ON o.object_id = od.object_id WHERE od.deity_id = ?';
        db.all(sql, [deityID], (err, rows) => {
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

// Wyświetl skomentowane obiekty
app.get("/api/profile/object/activity/:id", (req, res, next) => {
    try {
        const userid = req.params.id;
        var sql = 'SELECT DISTINCT o.object_id, o.name, o.image, o.description FROM objects o JOIN comments c ON o.object_id = c.object_id JOIN ratings r ON o.object_id = r.object_id WHERE c.user_id = 1 OR r.user_id = ?';
        db.all(sql, [userid], (err, rows) => {
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

// Wyświetl komentarze użytkownika dla obiektu
app.get("/api/profile/comments/:uid/:oid", (req, res, next) => {
    try {
        const uid = req.params.uid;
        const oid = req.params.oid;
        var sql = 'SELECT c.comment_id, c.user_id, c.content, c.date FROM comments c WHERE user_id = ? AND object_id = ?';
        db.all(sql, [uid, oid], (err, rows) => {
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

// Sprawdź czy hasła się zgadzają
app.get("/api/profile/passwordmatch/:email/:op", (req, res, next) => {
    try {
        const uem = req.params.email;
        const oldpass = req.params.op;
        var sql = 'SELECT password FROM user WHERE email = ?';
        db.all(sql, [uem], (err, rows) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Internal server error' });
            } else if (!rows || rows.length === 0) {
                res.status(404).json({ error: 'Object not found' });
            } else {
                bcrypt.compare(oldpass, rows[0].password)
                .then((result) => {
                    res.json({ match: result });
                })
                .catch((error) => {
                    console.error(error);
                });
            }
        });
    } catch(err){
        console.error(err);
    }
});

// Zmiana hasła
app.put("/api/profile/updatepassword/:email", async (req, res, next) => {
    try {
        const uemail = req.params.email;
        const newpassword = req.body.password;
        const hashedPassword = await bcrypt.hash(newpassword, 10);
        
        var sql = 'UPDATE user SET password = ? WHERE email = ?';
        db.run(sql, [hashedPassword, uemail], (err) => {
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

// Dodanie trasy
app.post("/api/addroute", (req, res, next) => {
    try {
        const { name, uID } = req.body;
        var sql = 'INSERT INTO routes (route_name, user_id) VALUES (?, ?)';
        db.run(sql, [name, uID], (err) => {
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

// Wyświetlanie id trasy po nazwie
app.get("/api/routename/:name", (req, res, next) => {
    try {
        const routeName = req.params.name;
        var sql = 'SELECT route_id FROM routes WHERE route_name = ?';
        db.get(sql, [routeName], (err, row) => {
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

// Wyświetlanie id obiektu po współrzędnych
app.get("/api/routeobjectid/:lat/:lng", (req, res, next) => {
    try {
        const objLat = req.params.lat;
        const objLng = req.params.lng;
        var sql = 'SELECT object_id FROM objects WHERE Latitude = ? AND Longitude = ?';
        db.get(sql, [objLat, objLng], (err, row) => {
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

// Dodanie obiektów do trasy
app.post("/api/addrouteobject", (req, res, next) => {
    try {
        const { rID, oID } = req.body;
        var sql = 'INSERT INTO route_objects (route_id, object_id) VALUES (?, ?)';
        db.run(sql, [rID, oID], (err) => {
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

// Wyświetl wszystkie trasy użytkownika
app.get("/api/userroutes/:user_ID", (req, res, next) => {
    try {
        const userID = req.params.user_ID;
        var sql = 'SELECT route_id from routes WHERE user_id = ?';
        db.all(sql, [userID], (err, rows) => {
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

// Wyświetl dane obiektów w trasie
app.get("/api/routecoordinates/:route_ID", (req, res, next) => {
    try {
        const routeID = req.params.route_ID;
        var sql = 'SELECT o.object_id, o.name, o.type, o.Latitude, o.Longitude, r.route_name FROM objects o JOIN route_objects ro ON ro.object_id = o.object_id JOIN routes r ON ro.route_id = r.route_id WHERE r.route_id = ?';
        db.all(sql, [routeID], (err, rows) => {
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

// Usunięcie konta
app.delete("/api/accountDelete/:userID", (req, res, next) => {
    try {
        const uID = req.params.userID;
        var sql = `DELETE FROM user WHERE user_id = ?`;
        db.run(sql, [uID], function(err) {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Internal server error' });
            } else {
                if (this.changes === 0) {
                    res.status(404).json({ error: 'Record not found' });
                } else {
                    res.status(200).json({ message: 'Record deleted successfully' });
                }
            }
        });
    } catch(err){
        console.error(err);
    }
});

// DO PANELU ADMINA
//////////////////////////////////////////////////////////////////////////////////////////
// Wyświetlanie wszystkich obiektów
app.get("/api/admin/:what", (req, res, next) => {
    try {
        const tabela = req.params.what;
        var sql = `SELECT * FROM ${tabela}`;
        db.all(sql, [], (err, rows) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Internal server error' });
            } else {
                res.json(rows); // JSON
            }
        });
    } catch(err){
        console.error(err);
    }
});

// INSERT
app.post("/api/admin/:table", async (req, res, next) => {
    try {
        const table = req.params.table;
        const newData = req.body;

        var sql = `INSERT INTO ${table} (`;
        var placeholders = '';
        var params = [];

        // Tworzenie listy kolumn
        for (const [key, value] of Object.entries(newData)) {
            sql += `${key}`;
            if (key === 'password') {
                const hashedPassword = await bcrypt.hash(value, 10);
                params.push(hashedPassword);
            } else {
                params.push(value);
            }
            placeholders += `?`;
            if (Object.keys(newData).indexOf(key) < Object.keys(newData).length - 1) {
                sql += ', ';
                placeholders += ', ';
            }
        }

        sql += `) VALUES (${placeholders})`;
        db.run(sql, params, function(err) {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Internal server error' });
            } else {
                res.json({ message: 'Record inserted successfully' });
            }
        });
    } catch(err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update
app.put("/api/admin/:table/:id/:whatid", async (req, res, next) => {
    try {
        const table = req.params.table;
        const id = req.params.id;
        const whatid = req.params.whatid
        const updatedData = req.body;

        var sql = `UPDATE ${table} SET `;
        var params = [];
        
        // Tworzenie listy kolumn
        for (const [key, value] of Object.entries(updatedData)) {
            sql += `${key} = ?`;
            if (key === 'password') {
                const hashedPassword = await bcrypt.hash(value, 10);
                params.push(hashedPassword);
            } else {
                params.push(value);
            }
            if (Object.keys(updatedData).indexOf(key) < Object.keys(updatedData).length - 1) {
                sql += ', ';
            }
        }

        sql += ` WHERE ${whatid} = ?`;
        params.push(id);
        db.run(sql, params, function(err) {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Internal server error' });
            } else {
                res.json({ message: 'Record updated successfully' });
            }
        });
    } catch(err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete
app.delete("/api/admin/delete/:table/:id/:whatid", (req, res, next) => {
    try {
        const table = req.params.table;
        const id = req.params.id;
        const whatid = req.params.whatid;
        var sql = `DELETE FROM ${table} WHERE ${whatid} = ?`;
        db.run(sql, [id], function(err) {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Internal server error' });
            } else {
                if (this.changes === 0) {
                    res.status(404).json({ error: 'Record not found' });
                } else {
                    res.status(200).json({ message: 'Record deleted successfully' });
                }
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