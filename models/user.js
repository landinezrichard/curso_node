var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//Conexión con el modelo
mongoose.connect('mongodb://localhost/foto_facilito');

var posibles_valores_sexo = ["M","F"];

var email_match = [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,'Coloca un email valido'];

var password_validation ={
	validator: function(pass){
		return this.password_confirmation == pass;
	},
	message:'Las contraseñas no son iguales'
}

var user_Schema = new Schema({
	name: String,
	username: {type: String, required: true, maxlength: [50,'Username muy grande']},
	password: {
		type: String, 
		minlength: [8,'El password es muy corto'],
		validate: password_validation
	},
	age: {type: Number, min: [5,'La edad no puede ser menos que 5'], max: [100,'La edad no puede ser mayor de 100']},
	email: {type: String, required: 'El correo es obligatorio', match: email_match},
	date_of_birth: Date,
	sex: {type: String, enum: {values: posibles_valores_sexo, message: 'Opción no válida'}}
});

user_Schema.virtual('password_confirmation').get(function(){
	return this.p_c;
}).set(function(password){
	this.p_c = password;
});

//Creamos el modelo
var User = mongoose.model('User', user_Schema);
//exportamos el modelo
module.exports.User = User;