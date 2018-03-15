process.setMaxListeners(0);

var Gpio = require('onoff').Gpio; //include onoff to interact with the GPIO
var LED = new Gpio(4, 'out'); //use GPIO pin 4 as output
var magSwitch = new Gpio(17, 'in', 'both'); //use GPIO pin 17 as input, and 'both' button presses, and releases should be handled

magSwitch.watch(function (err, value) { //Watch for hardware interrupts on magSwitch GPIO, specify callback function
	  if (err) { //if an error
		      // console.error('There was an error', err); //output error message to console
		    return;
		    }
	  LED.writeSync(1 - value); //turn LED on or off depending on the magSwitch state (0 or 1)

	// console.log(value ? "Bathroom is occupied." : "Bathroom is vacant.");

	io.emit('door change', value);

});

function unexportOnClose() { //function to run when exiting program
	  LED.writeSync(0); // Turn LED off
	  LED.unexport(); // Unexport LED GPIO to free resources
	  magSwitch.unexport(); // Unexport Button GPIO to free resources
};

process.on('SIGINT', unexportOnClose); //function to run when user closes using ctrl+c 


var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// app.use(express.static('images'));

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/monitor.html');
});

io.on('connection', function(socket){
	// console.log('a user connected');

	var doorStart = magSwitch.readSync();
	socket.emit('door change', doorStart);
	// console.log(doorStart ? "Bathroom is occupied." : "Bathroom is vacant.");

	if (1 - doorStart) {
		LED.writeSync(1 - doorStart);
	}

// 	socket.on('disconnect', function(){
// 		      console.log('user disconnected');
// 		    });
});

http.listen(8080, function() {
	// console.log('listening on port 8080!');
});
