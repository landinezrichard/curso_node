var Imagen = require('../models/imagenes');

module.exports = function(image, req, res){
	//True = si tiene permisos
	//false = No tiene permisos
	if(req.method === 'GET' && req.path.indexOf('edit') < 0 ){
		//ver la imagen
		return true;
	}

	if(typeof image.creator == 'undefined'){
		return false;
	}

	if(image.creator._id.toString() == res.locals.user._id){
		//es propietario imagen
		return true;
	}

	return false;

}