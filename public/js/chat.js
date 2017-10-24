
 var socket = io();

 function scrollToBottom() {

 	var message = jQuery('#messages');
 	var newMessage = message.children('li:last-child');

 	var clientHeight = message.prop('clientHeight');
 	var scrollTop = message.prop('scrollTop');
 	var scrollHeight = message.prop('scrollHeight');

 	var newMessageHeight = newMessage.innerHeight();
 	var lastMessageHeight = newMessage.prev().innerHeight();

 	if(lastMessageHeight + newMessageHeight + clientHeight + scrollTop >= scrollHeight) {
 		message.scrollTop(scrollHeight);
 	}
 }

 socket.on('connect', function(){
 	console.log('Connected to server');
 	var params = jQuery.deparam(window.location.search);

 	socket.emit('join', params, function(err){
 		if(err){
 			alert(err);
 			window.location.href = '/';
 		} else {
 			console.log('No error')
 		}
 	})
 });

 socket.on('disonnect', function() {
 	console.log('Disconnected from server');
 });

 socket.on('updateUserList', function(users){
 	var ol = jQuery('<ol></ol>');

 	users.forEach(function(user) {
 		ol.append(jQuery('<li></li>').text(user));
 	})

 	jQuery('#users').html(ol);
 })

socket.on('returnMessage', function(data){
	if(data.text === 'SERVER-ERROR-FETCH-ADDRESS'){
		return alert('Unable to fetch data. Try again.');
	}
	var formattedTime = moment(data.createdAt).format('h:mm a');
	var template = jQuery('#message-template').html();

	var html = Mustache.render(template, {
		from: data.from,
		text: data.text,
		createdAt: formattedTime
	});

	jQuery('#messages').append(html);
	scrollToBottom();
})

jQuery('#message-form').on('submit', function(e){
	e.preventDefault();
	socket.emit('createMessage', {
		text: jQuery('[name=message]').val()
	}, function(){
		console.log('Got it.');
		jQuery('[name=message]').val('');
	});
});

jQuery('#send-location').on('click', function(){
	var button = jQuery(this);
	if(!navigator.geolocation){
		return alert('Your browser does not support geolocation');
	}

	button.attr('disabled', 'disabled').text('Sending location...');
	navigator.geolocation.getCurrentPosition(function(position){

		button.removeAttr('disabled').text('Send location');

		socket.emit('currentLocation', {
			latitude: position.coords.latitude,
			longitude: position.coords.longitude
		}, function(res){
			console.log(res);
		});

	}, function(){
		button.removeAttr('disabled').text('Send location');
		alert('Unable to fetch data.');
	})
});