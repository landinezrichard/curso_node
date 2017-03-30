module.exports = function(server, sessionMiddleware){
	var io = require('socket.io')(server);
	var redis = require('redis');
	var client = redis.createClient();

	//hacemos que el cliente se suscriba al clanal "images"
	client.subscribe('images');

	//middleware
	io.use(function(socket, next){
		/*
		Configuramos sessionMiddleware, para que la sockect comparta los mismos datos de session con express
		*/
		sessionMiddleware(socket.request, socket.request.res, next);
	});

	/*Creamos un callback que se ejecuta cada vez que halla un nuevo message (en este caso una nueva imagen)*/
	client.on('message', function(channel, message){
		console.log('Recibimos un mensage del canal: '+channel);
		console.log(message);
	});


	/*
	Evento que escucha cuando un nuevo cliente se conecta por websocket
	*/
	io.sockets.on('connection', onConnection);

	function onConnection(socket){
		console.log('Id de usuario conectado: '+socket.request.session.user_id);
	}
}