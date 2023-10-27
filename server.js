if (process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}
const express = require("express")
const app = express()
const bcrypt = require("bcrypt")                            // Szyfrowanie
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
// const cors = require('cors')
// const fs = require('fs');

const initializePassport = require('./passport-config.js')  // config haseł
const db = require("./database.js")                         // Baza sqlite
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
// app.use(cors())
const bodyParser = require('body-parser');
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

// Port serwera
const HTTP_PORT = 8000 

// Start serwera
app.listen(HTTP_PORT, () => {
    console.log("Server running on port %PORT%".replace("%PORT%",HTTP_PORT))
});

// Ustawienie endpointu dla głównej strony
app.get("/", checkAuthenticated, (req, res, next) => {
    res.render('index.ejs', {name: req.user.name})
});

// Endpointy
app.get("/login", checkNotAuthenticated, (req, res, next) => {
    res.render('login.ejs')
});

app.post("/login", checkNotAuthenticated, passport.authenticate('local',{
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

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

app.delete('/logout', (req, res, next) => {
    req.logOut(function(err) {
        if (err) {
            console.error(err);
        }
        res.redirect('/login');
    });
});

function checkAuthenticated(req, res, next){
    if (req.isAuthenticated()){
        return next()
    }
    res.redirect('/login')
}

function checkNotAuthenticated(req, res, next){
    if (req.isAuthenticated()){
        res.redirect('/')
    }
    next()
}

// Odpowiedź domyślna na żądania
app.use(function(req, res){
    res.status(404);
});