var express = require('express');
var Imagen = require('./models/imagenes');
var image_finder_middleware = require('./middlewares/find_image');
var fse= require('fs-extra'),
	redis = require('redis');

var client = redis.createClient();

var router = express.Router();

router.get('/', function(req, res){
	Imagen.find({})
		.populate('creator')
		.exec(function(err, imagenes){
			if(err) console.log(err);
			res.render('app/home',{imagenes: imagenes})			
		});
});

/* REST */

//ruta nueva, muestra el formulario para crear la imagen
router.get('/imagenes/new', function(req, res){
	res.render('app/imagenes/new');
});

router.all('/imagenes/:id*', image_finder_middleware);

//ruta nueva, muestra el formulario para editar una imagen ya existente
router.get('/imagenes/:id/edit', function(req, res){
	res.render('app/imagenes/edit');
});

//recurso imagen individual
router.route('/imagenes/:id')
	.get(function(req, res){
		//mostrar imagen
		res.render('app/imagenes/show');
	})
	.put(function(req, res){
		//actualizar imagen
		res.locals.imagen.title = req.fields.title;
		res.locals.imagen.save(function(err){
			if(!err){
				res.render('app/imagenes/show');
			}else{
				res.render('app/imagenes/'+req.params.id+'/edit');
			}
		});
	})
	.delete(function(req, res){
		//borrar imagen
		Imagen.findOneAndRemove({ _id: req.params.id },function(err){
			if(!err){
				res.redirect('/app/imagenes');
			}else{
				console.log(err);
				res.redirect('/app/imagenes'+req.params.id);
			}
		});
	});

//recurso colección de imagenes
router.route('/imagenes')
	.get(function(req, res){
		//obtener todas las imagenes, de las cuales soy propietario
		Imagen.find({ creator: res.locals.user._id }, function(err, imagenes){
			if(err){
				res.redirect('/app'); 
				return;
			}
			res.render('app/imagenes/index',{imagenes: imagenes});
		});
	})
	.post(function(req, res){
		//crear una nueva imagen individual		
		var extension = req.files.archivo.name.split('.').pop();

		var data = {
			title: req.fields.title,
			creator: res.locals.user._id,
			extension: extension
		}

		var imagen = new Imagen(data);

		imagen.save(function(err){
			if(!err){
				//hacemos que el cliente publique al canal "images" cada vez que se crea una nueva imagen
				client.publish('images', imagen.toString());
				fse.copy(req.files.archivo.path, 'public/images/'+imagen._id+'.'+extension);
				res.redirect('/app/imagenes/'+imagen._id);
			}else{
				res.render(err);
			}
		});
	});

module.exports = router;