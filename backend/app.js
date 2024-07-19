const express = require('express');
const path = require('path');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const app = express();

app.use(express.json());
const dbPath = path.join(__dirname, 'db', 'notes.db');
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/');
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

// Middleware for logging
const logger = (request, response, next) => {
  console.log(request.query);
  next();
};

// Middleware for authenticating token
const authenticateToken = (request, response, next) => {
  const authHeader = request.headers['authorization'];
  if (authHeader) {
    const jwtToken = authHeader.split(' ')[1];
    jwt.verify(jwtToken, 'MY_SECRET_TOKEN', (err, user) => {
      if (err) {
        return response.status(403).send('Invalid JWT Token');
      }
      request.user = user;
      next();
    });
  } else {
    response.status(401).send('Missing JWT Token');
  }
};

// User registration endpoint
app.post('/users/', async (request, response) => {
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

// User login endpoint
app.post('/login', async (request, response) => {
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

// Create note endpoint
app.post('/notes', authenticateToken, async (request, response) => {
  const { title, content, tags, backgroundColor } = request.body;
  const { username } = request.user;
  const createNoteQuery = `
    INSERT INTO notes (username, title, content, tags, backgroundColor) 
    VALUES (?, ?, ?, ?, ?)`;
  await db.run(createNoteQuery, [username, title, content, tags, backgroundColor]);
  response.send('Note added successfully');
});

// Get all notes endpoint
app.get('/notes', authenticateToken, async (request, response) => {
  const { username } = request.user;
  const getNotesQuery = `SELECT * FROM notes WHERE username = ?`;
  const notes = await db.all(getNotesQuery, [username]);
  response.send(notes);
});

// Get notes by label endpoint
app.get('/notes/label/:label', authenticateToken, async (request, response) => {
  const { username } = request.user;
  const { label } = request.params;
  const getNotesByLabelQuery = `SELECT * FROM notes WHERE username = ? AND tags LIKE ?`;
  const notes = await db.all(getNotesByLabelQuery, [username, `%${label}%`]);
  response.send(notes);
});

// Archive note endpoint
app.post('/notes/archive/:id', authenticateToken, async (request, response) => {
  const { id } = request.params;
  const archiveNoteQuery = `UPDATE notes SET archived = 1 WHERE id = ?`;
  await db.run(archiveNoteQuery, [id]);
  response.send('Note archived successfully');
});

// Trash note endpoint
app.post('/notes/trash/:id', authenticateToken, async (request, response) => {
  const { id } = request.params;
  const trashNoteQuery = `UPDATE notes SET trashed = 1 WHERE id = ?`;
  await db.run(trashNoteQuery, [id]);
  response.send('Note moved to trash');
});

// Get trashed notes endpoint
app.get('/notes/trashed', authenticateToken, async (request, response) => {
  const { username } = request.user;
  const getTrashedNotesQuery = `SELECT * FROM notes WHERE username = ? AND trashed = 1 AND datetime('now') < datetime(created_at, '+30 days')`;
  const notes = await db.all(getTrashedNotesQuery, [username]);
  response.send(notes);
});
