
class Users {
	constructor() {
		this.users = [];
	}

	addUser(id, name, room) {
		var user = {id, name, room};
		this.users.push(user);
		return user;
	}

	removeUser(id) {
		var user = this.getUser(id);
		if(user) {
			this.users = this.users.filter((user) => user.id !== id);
		}
		return user;
	}

	getUser(id) {
		return this.users.filter((user)=> user.id === id)[0];
	}

	getUserList(room) {
		var users = this.users.filter((user) => user.room === room);
		var namesArray = users.map((user) => user.name);
		return namesArray;
	}

	getRoomList() {
		var rooms = this.users.map((user)=>user.room);
		rooms = rooms.filter((item, index, array)=> index === array.indexOf(item))
		return rooms;
	}

	userExists(name, room) {
		var user = this.users.filter((user)=> {
			return name === user.name && room === user.room;
		});
		console.log(user);
		if(user.length > 0){
			return true;
		} else {
			return false;
		}
	}
}

module.exports = {Users};