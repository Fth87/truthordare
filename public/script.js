// script.js
const socket = io();
let username;

document.addEventListener('DOMContentLoaded', () => {
    username = prompt("Masukkan nama Anda:");
    socket.emit('join', username);

    const loader = document.getElementById('loader');
    const taskElement = document.getElementById('task');

    socket.on('userJoined', (users) => {
        document.getElementById('users').innerHTML = "Pemain: " + users.join(", ");
    });

    socket.on('newTurn', (player) => {
        document.getElementById('currentPlayer').textContent = `Giliran: ${player}`;
        document.getElementById('gameArea').style.display = 'block';
    });

    socket.on('task', ({ choice, task }) => {
        loader.style.display = 'none';
        taskElement.textContent = `${choice.toUpperCase()}: ${task}`;
        taskElement.style.display = 'block';
    });

    document.getElementById('startGame').addEventListener('click', () => {
        socket.emit('startGame');
    });

    document.getElementById('truth').addEventListener('click', () => {
        chooseOption('truth');
    });

    document.getElementById('dare').addEventListener('click', () => {
        chooseOption('dare');
    });

    function chooseOption(choice) {
        loader.style.display = 'block';
        taskElement.style.display = 'none';
        socket.emit('choice', choice);
    }
});