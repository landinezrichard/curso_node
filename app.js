var express = require('express'),
	User = require('./models/user').User,
	cookieSession = require('cookie-session'),
	router_app = require('./routes_app'),
	session_middleware = require('./middlewares/session'),
	methodOverride = require('method-override'),
	formidable = require('express-formidable');
var	app = express();

app.use( methodOverride('_method') );

app.use(express.static('./public'));

app.use(cookieSession({
	name: 'session',
	keys: ['llave-1','llave-2']
}));

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

app.listen(8080);