var express = require("express"),
	app = express();

app.configure(function(){
	app.set('views', __dirname + '/tpl');
	app.set('view engine', "jade");
	app.engine('jade', require('jade').__express);
	app.use(express.static(__dirname + '/public'));
	//app.use(express.cookieParser());
	//app.use(express.session({key:'secret', secret:'express.sid'}));
});

io = require('socket.io').listen(app.listen(3700)),

app.get("/", function(req, res){
	// points to a jade template
    res.render("page");
});

// usernames which are currently connected to the chat
var usernames = {};

io.sockets.on('connection', function (socket) {
	//socket.log.info(socket.handshake.session);

	// when the client emits 'sendchat', this listens and executes
	socket.on('sendchat', function (data) {
		// we tell the client to execute 'updatechat' with 2 parameters
		io.sockets.emit('updatechat', socket.username, data);
	});

	// when the client emits 'adduser', this listens and executes
	socket.on('adduser', function(username){
		// we store the username in the socket session for this client
		socket.username = username;
		// add the client's username to the global list
		usernames[username] = username;
		// echo to client they've connected
		socket.emit('updatechat', 'SERVER', 'you have connected');
		// echo globally (all clients) that a person has connected (broadcast - tell everyone else except the added user)
		socket.broadcast.emit('updatechat', 'SERVER', username + ' has connected');
		// update the list of users in chat, client-side
		io.sockets.emit('updateusers', usernames);
	});

	// when the user disconnects.. perform this
	socket.on('disconnect', function(){
		// remove the username from global usernames list
		delete usernames[socket.username];
		// update list of users in chat, client-side
		io.sockets.emit('updateusers', usernames);
		// echo globally that this client has left
		socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
	});
});