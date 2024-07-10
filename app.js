const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const axios = require('axios');
const path = require('path');
// import Groq from 'groq-sdk';

const users = new Set();

// Ganti YOUR_API_KEY dengan API key Groq Anda
const GROQ_API_KEY = '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';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Perbarui middleware untuk CSP
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
      "font-src 'self' https://fonts.gstatic.com; " +
      "img-src 'self' https://i.imgur.com; " +
      "connect-src 'self' ws: wss:;"
  );
  next();
});
// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

async function getTaskFromGroq(type) {
  try {
    const prompt =
      type === 'truth'
        ? 'Berikan satu pertanyaan truth  yang menarik untuk permainan Truth or Dare secara singkat beberapa kata dan dalam bahasa indonesia dan tanpa terjemahan inggrisnya.'
        : 'Berikan satu tantangan dare  yang menarik untuk permainan Truth or Dare secara singkat beberapa kata dan dalam bahasa indonesia dan tanpa terjemahan inggrisnya.';

    const response = await axios.post(
      GROQ_API_URL,
      {
        model: 'llama3-8b-8192',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 100,
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error getting task from Groq:', error);
    return type === 'truth' ? 'Apa hal terbaik yang pernah terjadi padamu?' : 'Tirukan suara hewan favoritmu.';
  }
}

io.on('connection', (socket) => {
  socket.on('join', (username) => {
    socket.username = username;
    users.add(username);
    io.emit('userJoined', Array.from(users));
  });

  socket.on('startGame', () => {
    const currentPlayer = Array.from(users)[Math.floor(Math.random() * users.size)];
    io.emit('newTurn', currentPlayer);
  });

  socket.on('choice', async (choice) => {
    const task = await getTaskFromGroq(choice);
    io.emit('task', { choice, task });
  });

  socket.on('disconnect', () => {
    users.delete(socket.username);
    io.emit('userLeft', Array.from(users));
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});
// 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;
