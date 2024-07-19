const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../db/notes.db');
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

router.post('/register', async (request, response) => {
  const { username, name, password, gender, location } = request.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const selectUserQuery = `SELECT * FROM users WHERE username = ?`;
  const dbUser = await db.get(selectUserQuery, [username]);
  if (!dbUser) {
    const createUserQuery = `
      INSERT INTO users (username, name, password, gender, location) 
      VALUES (?, ?, ?, ?, ?)`;
    const dbResponse = await db.run(createUserQuery, [username, name, hashedPassword, gender, location]);
    response.send(`Created new user with ID ${dbResponse.lastID}`);
  } else {
    response.status(400).send('User already exists');
  }
});

router.post('/login', async (request, response) => {
  const { username, password } = request.body;
  const selectUserQuery = `SELECT * FROM users WHERE username = ?`;
  const dbUser = await db.get(selectUserQuery, [username]);
  if (!dbUser) {
    response.status(400).send('Invalid User');
  } else {
    const isPasswordMatched = await bcrypt.compare(password, dbUser.password);
    if (isPasswordMatched) {
      const token = jwt.sign({ username }, 'MY_SECRET_TOKEN');
      response.send({ jwtToken: token });
    } else {
      response.status(400).send('Invalid Password');
    }
  }
});

module.exports = router;
