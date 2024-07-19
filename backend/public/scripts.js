let jwtToken = '';

async function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    
    const response = await fetch('/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok) {
        jwtToken = data.jwtToken;
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('notes-container').style.display = 'block';
        fetchNotes();
    } else {
        alert(data);
    }
}

async function fetchNotes() {
    const response = await fetch('/notes', {
        headers: {
            Authorization: `Bearer ${jwtToken}`,
        },
    });

    const notes = await response.json();
    const notesList = document.getElementById('notes-list');
    notesList.innerHTML = '';

    notes.forEach(note => {
        const noteDiv = document.createElement('div');
        noteDiv.className = 'note';
        noteDiv.innerHTML = `
            <h3>${note.title}</h3>
            <p>${note.content}</p>
            <p><strong>Tags:</strong> ${note.tags}</p>
            <button onclick="archiveNote(${note.id})">Archive</button>
            <button onclick="trashNote(${note.id})">Trash</button>
        `;
        notesList.appendChild(noteDiv);
    });
}

async function createNote() {
    const title = document.getElementById('note-title').value;
    const content = document.getElementById('note-content').value;
    const tags = document.getElementById('note-tags').value;

    await fetch('/notes', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify({ title, content, tags }),
    });

    hideCreateNote();
    fetchNotes();
}

function showCreateNote() {
    document.getElementById('create-note-container').style.display = 'block';
    document.getElementById('notes-container').style.display = 'none';
}

function hideCreateNote() {
    document.getElementById('create-note-container').style.display = 'none';
    document.getElementById('notes-container').style.display = 'block';
}

async function archiveNote(id) {
    await fetch(`/notes/archive/${id}`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${jwtToken}`,
        },
    });

    fetchNotes();
}

async function trashNote(id) {
    await fetch(`/notes/trash/${id}`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${jwtToken}`,
        },
    });

    fetchNotes();
}

function logout() {
    jwtToken = '';
    document.getElementById('login-container').style.display = 'block';
    document.getElementById('notes-container').style.display = 'none';
}
