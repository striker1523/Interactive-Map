var sqlite3 = require('sqlite3').verbose()
var md5 = require('md5')

const DBSOURCE = "../Interactive-Map/database/db.db"

let db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
      // Błąd z otwarciem bazy
      console.error(err.message)
      throw err
    }else{
        console.log('Connected to the SQLite database.')
    }
});


module.exports = db