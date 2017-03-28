var express = require('express'),
	User = require('./models/user').User,
	session = require('express-session'),
	router_app = require('./routes_app'),
	session_middleware = require('./middlewares/session'),
	methodOverride = require('method-override'),
	formidable = require('express-formidable'),
	http = require('http'),
	RedisStore = require('connect-redis')(session),
	realtime = require('./realtime');

var	app = express();
//creamos un nuevo servidor al cual le pasamos nuestra app de express, para que la configuración siga igual.
var server = http.Server(app);

app.use( methodOverride('_method') );

app.use(express.static('./public'));

var sessionMiddleware = session({
	store : new RedisStore({}), // XXX redis server config
	secret: 'super ultra secret word',
	resave: true,
	saveUninitialized: true
});

app.use(sessionMiddleware);

realtime(server,sessionMiddleware);

app.use(formidable({
	keepExtensions: true
}) );

app.set('view engine','pug');

app.get("/",function(req,res){
	res.render('index');
});

app.get("/signup",function(req,res){
	res.render('signup');
});

app.get("/login",function(req,res){
	res.render('login');
});

app.post("/users",function(req,res){
	var user = new User({
		email: req.fields.email,
		password: req.fields.password,
		password_confirmation: req.fields.password_confirmation,
		username: req.fields.username
	});
	
	user.save().then(function(us){
		res.send('Guardamos el usuario exitosamente');
	},function(err){
		console.log( String(err) );
		res.send('Hubo un error al guardar el usuario');
	});
});

app.post("/sessions",function(req,res){
	User.findOne({
		email: req.fields.email,
		password: req.fields.password
	}, function(err,user){
		console.log(user);
		req.session.user_id = user._id;
		res.redirect('/app');
	});
});

app.use('/app', session_middleware);

app.use('/app', router_app);

/*
en vez de app.listen(8080)
le indicamos que sea el servidor de http el que escuche las peticiones	
*/
server.listen(8080);