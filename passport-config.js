const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')
const db = require("./database.js")

function initialize(passport) {
    const authenticateUser = async (email, password, done) => {
        const sql = 'SELECT * FROM user WHERE email = ?';
        db.get(sql, [email], async (err, row) => {
            if (err) {
                return done(err);
            }

            if (!row) {
                return done(null, false, { message: 'No user with that email' });
            }

            try {
                if (await bcrypt.compare(password, row.password)) {
                    return done(null, row);
                } else {
                    return done(null, false, { message: 'Password incorrect' });
                }
            } catch (err) {
                return done(err);
            }
        });
    }

    passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser));

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        const sql = 'SELECT * FROM user WHERE id = ?';
        db.get(sql, [id], (err, row) => {
            if (err) {
                return done(err);
            }
            done(null, row);
        });
    });
}

module.exports = initialize