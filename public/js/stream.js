
var socket = io();
/*
 socket.on('connect', function(){
 	console.log('Connected to server');
 });

  socket.on('disonnect', function() {
 	console.log('Disconnected from server');
 });

socket.on('image', function(data) {
	console.log(data.buffer);
    var uint8Arr = new Uint8Array(data.buffer);
    console.log('here', uint8Arr);
    var binary = '';
    for (var i = 0; i < uint8Arr.length; i++) {
        binary += String.fromCharCode(uint8Arr[i]);
    }
    var base64String = window.btoa(binary);

    var img = new Image();

    img.src = 'data:image/jpg;base64,' + base64String;

    jQuery('.images').attr('src', img.src)

});*/