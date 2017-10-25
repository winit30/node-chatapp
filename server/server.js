const express = require('express');
const app = express();
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');
const axios = require('axios');
const fs = require('fs');
const Jimp = require("jimp");
const {generateMessage} = require('./utils/utils');
const {isRealString} = require('./utils/validation');
const {Users} = require('./utils/users');

const port = process.env.PORT || 4000;
app.use(express.static(path.join(__dirname, '../public')));

var server = http.createServer(app);
var io = socketIO(server);
var users = new Users();

var imageFileOrig = './server/images/image3.jpg';
var imageFileComp = './server/images/imageDom.jpg';

io.on('connection', (socket) => {
	console.log('New user connected');

	Jimp.read(imageFileOrig).then((image) => {
	    	 image.quality(60).write(imageFileComp);
	}).then(()=> {
		 fs.readFile(imageFileComp, function(err,buffer){
	    	var imageArray = new Uint8Array(buffer);
	    	console.log(imageArray);
	    	if(err){
	    		return console.log(err);
	    	}
	        socket.emit('image', { buffer: buffer });
	    }); 
	}).catch(function (err) {
	    console.error(err);
	});

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
			try {
				var text = `My location is ${res.data.results[0].formatted_address}`;
			} catch(e){
				var text = 'SERVER-ERROR-FETCH-ADDRESS';
			}
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

server.listen(port, ()=>{
	console.log(`Server is up on port ${port}`);
});