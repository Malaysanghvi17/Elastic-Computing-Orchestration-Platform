const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
const cors = require('cors');
const Terminal = require('./Terminal');

const PORT = 5000;

const app = express();
const server = http.createServer(app);
const io = new Server(server);
app.use(cors());

io.on('connection', (socket) => {
	console.log("New User connected.");

	const term = new Terminal();

	// input
	const commandToMatch = "ssh root@localhost -p ";
	const pattern = /exit/;
	let i = 0;
	let command = '';

	socket.on('in', (data) => {
		command += data;

		if (i < commandToMatch.length) {
			if (data === commandToMatch[i]) {
				term.write(data);
				i++;
				console.log("Matching: " + command);
			} else {
				console.log("Failed matching: " + command);
				i = 0;
				command = '';
			}
		} else {
			console.log("Allowing user: " + command);
			term.write(data);

			// Check if the user entered "exit"
			if (pattern.test(command)) {
				// socket.emit('exit', "User requested exit");
				term.kill(); // Optionally kill the terminal
				console.log("User requested exit");
			}

		}
	});


	// output
	// output
	const pattern1 = /Permission denied, please try again./
	let command1 = '';
	term.onData((data) => {
		socket.emit('out', data);
		command1 += data;
		console.log(command1);
		if (pattern1.test(command1)) { // Change 'command' to 'command1'
			term.kill(); // Optionally kill the terminal
			console.log("User exited forcefully");
		}
	})


	// exit
	term.onExit((data) => {
		socket.emit('exit', data);
	})

	// kill by user
	socket.on('kill', () => {
		term.kill();
		console.log("User kill terminal");
	})

	// resize
	socket.on('resize', (cols, rows) => {
		term.resize(cols, rows);
	})

	// socket.on('disconnect', () => {
	// 	term.kill();
	// 	console.log("User disconnected");
	// })
})

server.listen(PORT, () => {
	console.log(`Listening on port ${PORT} ....`);
});
