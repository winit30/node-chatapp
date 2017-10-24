var socket = io();

 socket.on('connect', function(){
 	socket.emit('new user',{
 		newUser: 'new user'
 	}, function(roomArray){
 		console.log(roomArray);
 		if(roomArray.length > 0) {
 			
 			jQuery('input[name=room]').remove();

 			var select = jQuery('<select name="room"></select>');
 			roomArray.forEach(function(room) {
 				select.append(jQuery('<option></option>').text(room))
 			});

 			jQuery('#roomlist').append(select);
 			jQuery('#roomlist label').text('Select room')	
 		}
 	});
 });

  socket.on('disonnect', function() {
 	console.log('Disconnected from server');
 });

