module.exports = function(server, sessionMiddleware){
	var io = require('socket.io')(server);

	//middleware
	io.use(function(socket, next){
		/*
		Configuramos sessionMiddleware, para que la sockect comparta los mismos datos de session con express
		*/
		sessionMiddleware(socket.request, socket.request.res, next);
	});


	/*
	Evento que escucha cuando un nuevo cliente se conecta por websocket
	*/
	io.sockets.on('connection', onConnection);

	function onConnection(socket){
		console.log('Id de usuario conectado: '+socket.request.session.user_id);
	}
}