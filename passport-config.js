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
                return done(null, false, { message: 'No user with that email!' });
            }

            try {
                if (await bcrypt.compare(password, row.password)) {
                    return done(null, row);
                } else {
                    return done(null, false, { message: 'Wrong password!' });
                }
            } catch (err) {
                return done(err);
            }
        });
    }

    passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser));

    passport.serializeUser((user, done) => {
        done(null, user.user_id);
    });

    passport.deserializeUser((user_id, done) => {
    const sql = 'SELECT * FROM user WHERE user_id = ?';
    db.get(sql, [user_id], (err, row) => {
        if (err) {
            return done(err);
        }
        if (!row) {
            return done(null, false); // Zwróć fałsz, jeśli użytkownik nie został znaleziony
        }
        done(null, row);
    });
});
}

module.exports = initialize