const sqlite3 = require('sqlite3').verbose();
const express = require('express');
const PORT = process.env.PORT || 3001;
const app = express();
const inputCheck = require('./utils/inputCheck');

app.use(express.urlencoded({ extended: false}));
app.use(express.json());

//connected to database
const db = new sqlite3.Database('./db/election.db', err => {
    if (err) {
        return console.error(err.message);
    }
    console.log('connected to the election database.');
});
//create a candidate
//const sql = `INSERT INTO candidates (id, first_name, last_name, industry_connected)
//    VALUES (?,?,?,?)`;
//    const params = [1, 'Ronald', 'Firbank', 1];
// ES5 function, not arrow function, to use this
//db.run(sql, params, function(err, result) {
//  if (err) {
//    console.log(err);
//  }
//  console.log(result, this.lastID);
//});
// Delete a candidate
app.delete('/api/candidate/:id', (req, res) => {
    const sql = `DELETE FROM candidates WHERE id = ?`;
    const params = [req.params.id];
    db.run(sql, params, function(err, result) {
      if (err) {
        res.status(400).json({ error: res.message });
        return;
      }
  
      res.json({
        message: 'successfully deleted',
        changes: this.changes
      });
    });
  });
  // Create a candidate
app.post('/api/candidate', ({ body }, res) => {
    const errors = inputCheck(body, 'first_name', 'last_name', 'industry_connected');
    if (errors) {
      res.status(400).json({ error: errors });
      return;
    }
    const sql = `INSERT INTO candidates (first_name, last_name, industry_connected) 
              VALUES (?,?,?)`;
    const params = [body.first_name, body.last_name, body.industry_connected];
    // ES5 function, not arrow function, to use `this`
    db.run(sql, params, function(err, result) {
    if (err) {
    res.status(400).json({ error: err.message });
    return;
    }

    res.json({
    message: 'success',
    data: body,
    id: this.lastID
        });
    });
  });

app.get('/api/candidate/:id', (req, res) => {
    const sql =`SELECT candidates.*, parties.name
    AS party_name
    FROM candidates
    LEFT JOIN parties
    ON candidates.party_id = parties.id
    WHERE cadidates.id = ?`;
const params = [req.params.id];
db.get(sql, params, (err, row) => {
    if (err) {
        res.status(400).json({ error: err.message });
        return;
    }
    res.json({
        message: 'success',
        data: row
    });
});
});

app.get('/api/candidates', (req, res) => {
    const sql = `SELECT candidates.*, parties.name
    AS party_name
    FROM candidates
    LEFT JOIN parties
    ON candidates.party_id = parties.id`;
    const params = [];
    db.all(sql, params, (err, rows) =>{
        if (err) {
            res.status(500).json({ error: err.message});
            return;
        }
        res.json({
            message: 'success',
            data: rows
        });
    });
});

app.use((req, res) => {
    res.status(404).end();
  });

db.on('open', () => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
});
