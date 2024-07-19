const express = require('express');
const router = express.Router();
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const path = require('path');
const jwt = require('jsonwebtoken');

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

router.post('/notes', authenticateToken, async (request, response) => {
  const { title, content, tags, backgroundColor } = request.body;
  const { username } = request.user;
  const createNoteQuery = `
    INSERT INTO notes (username, title, content, tags, backgroundColor) 
    VALUES (?, ?, ?, ?, ?)`;
  await db.run(createNoteQuery, [username, title, content, tags, backgroundColor]);
  response.send('Note added successfully');
});

router.get('/notes', authenticateToken, async (request, response) => {
  const { username } = request.user;
  const getNotesQuery = `SELECT * FROM notes WHERE username = ?`;
  const notes = await db.all(getNotesQuery, [username]);
  response.send(notes);
});

router.get('/notes/label/:label', authenticateToken, async (request, response) => {
  const { username } = request.user;
  const { label } = request.params;
  const getNotesByLabelQuery = `SELECT * FROM notes WHERE username = ? AND tags LIKE ?`;
  const notes = await db.all(getNotesByLabelQuery, [username, `%${label}%`]);
  response.send(notes);
});

router.post('/notes/archive/:id', authenticateToken, async (request, response) => {
  const { id } = request.params;
  const archiveNoteQuery = `UPDATE notes SET archived = 1 WHERE id = ?`;
  await db.run(archiveNoteQuery, [id]);
  response.send('Note archived successfully');
});

router.post('/notes/trash/:id', authenticateToken, async (request, response) => {
  const { id } = request.params;
  const trashNoteQuery = `UPDATE notes SET trashed = 1 WHERE id = ?`;
  await db.run(trashNoteQuery, [id]);
  response.send('Note moved to trash');
});

router.get('/notes/trashed', authenticateToken, async (request, response) => {
  const { username } = request.user;
  const getTrashedNotesQuery = `SELECT * FROM notes WHERE username = ? AND trashed = 1 AND datetime('now') < datetime(created_at, '+30 days')`;
  const notes = await db.all(getTrashedNotesQuery, [username]);
  response.send(notes);
});

module.exports = router;
