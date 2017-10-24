const express = require('express');
const app = express();
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');
const axios = require('axios');

const {generateMessage} = require('./utils/utils');
const {isRealString} = require('./utils/validation');
const {Users} = require('./utils/users');

app.use(express.static(path.join(__dirname, '../public')));

var server = http.createServer(app);
var io = socketIO(server);
var users = new Users();

io.on('connection', (socket) => {
	console.log('New user connected');

	socket.on('new user', (query, callback)=>{
		var rooms = users.getRoomList();
		callback(rooms);
	})

	socket.on('join', (params, callback) => {
		if(!isRealString(params.name) || !isRealString(params.room)){
			return callback('Name and room are required');
		} else if(users.userExists(params.name, params.room)){
			return callback('Username already taken. Select different username');
		}

		callback();
		socket.join(params.room);
		users.removeUser(socket.id);
		users.addUser(socket.id, params.name, params.room);
		io.to(params.room).emit('updateUserList', users.getUserList(params.room));
		socket.broadcast.to(params.room).emit('returnMessage', generateMessage('Admin', `${params.name} has joined`));
		socket.emit('returnMessage', generateMessage('Admin', 'Welcome to chat app'));
	});

	socket.on('createMessage', (data, callback)=>{
		var user = users.getUser(socket.id);
		if(user && isRealString(data.text)) {
			io.to(user.room).emit('returnMessage', generateMessage(user.name, data.text));
		}
		callback();
	});

	socket.on('currentLocation', (coords, callback) => {
		var user = users.getUser(socket.id);
		var mainUrl = 'http://maps.googleapis.com/maps/api/geocode/json';
		var locationUrl = `${mainUrl}?latlng=${coords.latitude},${coords.longitude}&sensor=true`;
		axios.get(locationUrl).then((res)=>{
			var text = `My location is ${res.data.results[0].formatted_address}`;
			io.to(user.room).emit('returnMessage', generateMessage(user.name, text));
		}).catch((e)=>{
			console.log('Error',e);
		});
		callback('cords received');
	});

	socket.on('disconnect', () => {
		console.log('User disconnected');
		var user = users.removeUser(socket.id);
		if(user) {
			io.to(user.room).emit('updateUserList', users.getUserList(user.room));
			io.to(user.room).emit('returnMessage', generateMessage('Admin', `${user.name} has left.`));
		}
	});
})

server.listen(4000, ()=>{
	console.log('Server is up on port 4000');
});