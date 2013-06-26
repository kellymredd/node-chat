window.onload = function() {

	var socket = io.connect('http://10.2.253.46:3700');

	//fetchMsgs();
	function fetchMsgs(){
        var html = '',
        ls = localStorage.getItem("chatEntry") ? JSON.parse( localStorage.getItem("chatEntry") ) : 0 ;
        	
        for( var i=0; i<ls.length; i++ ) {
            msgs.push( ls[i] );
            html += '<div class="msg"><b>' + (ls[i].username ? ls[i].username : 'Anon') + ': </b>';
            html += ls[i].message + '</div>';
        }
        conversation.innerHTML = html;
        conversation.scrollTop = conversation.scrollHeight;

		// populate username if avail
		//name.value = localStorage.getItem("chatUser") ? localStorage.getItem("chatUser") : '';
    }
 
    // on connection to server, ask for user's name with an anonymous callback
    socket.on('connect', function(client){
        //console.log(client);

        // use stored value or prompt for new
        var localUser = localStorage.getItem('localUser');
        if( localUser == null ){
            // get prompt value
            var p = prompt("What's your name?");
            // add to chat
            socket.emit('adduser', p);
            // save
            localStorage.setItem('localUser', p);
        } else {
            socket.emit('adduser', localUser);
        }
    });

    // listener, whenever the server emits 'updatechat', this updates the chat body
    socket.on('updatechat', function (username, data) {
        $('#conversation').append('<div class="msg"><b>'+username + ':</b> ' + data + '</div>');
        conversation.scrollTop = conversation.scrollHeight;
    });

    // listener, whenever the server emits 'updateusers', this updates the username list
    socket.on('updateusers', function(data) {
        $('#users > div').empty();
        $.each(data, function(key, value) {
            $('#users > div').append('<div>' + key + '</div>');
        });
    });

    // on load of page
    $(function(){
        // when the client clicks SEND
        $('#datasend').click( function() {
            var message = $('#data').val();
            $('#data').val('');
            // tell server to execute 'sendchat' and send along one parameter
            socket.emit('sendchat', message);
        });

        // when the client hits ENTER on their keyboard
        $('#data').keypress(function(e) {
            if(e.which == 13) {
                $('#datasend').click();
            }
        });
    }); 
}