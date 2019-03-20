const express = require("express");
const bodyParser = require('body-parser');
const port = 3002;
const cors = require('cors');
const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});

var bcrypt = require('bcrypt');

const server = app.listen(port, (error) => {
    if (error) return console.log(`Error: ${error}`);

    console.log(`Server listening on port ${server.address().port}`);
});

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT,  DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    next();
});

const mysql = require('mysql');
const config = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'proyecto',
};
const pool = mysql.createPool(config);
module.exports = pool;

app.get('/', (request, response) => {
    console.log(`URL: ${request.url}`);
    response.send('Hello, Server!');
});

app.get('/login', (request, response) => {
    var usuario = request.query.usuario;
    var password = request.query.password;
    if ((usuario.toString().length>0) && (usuario.toString().length<21) && (password.toString().length>7) && (password.toString().length<17))  {
        pool.query('SELECT * FROM usuarios WHERE usuario = ?', usuario, (error, result) => {
            if (error) throw error;
            if ((result.length > 0) && (bcrypt.compareSync(password, result[0].password))){
                response.status(200).send(result);
            } else {
                response.status(401).send('Usuario o contraseña incorrectos');
            }
        });
    } else {
        response.status(401).send('Usuario o contraseña incorrectos');
    }
});

app.get('/provincias', (request,response) => {
    pool.query('SELECT * FROM provincias',(error, result) => {
        if (error) throw error;
        if(result.length>0){
            response.status(200).send(result);
        }else{
            response.status(500).json({error:"Ha ocurrido un error"});
        }
    });
});

app.get('/deportes', (request,response) => {
    pool.query('SELECT * FROM deportes',(error, result) => {
        if (error) throw error;
        if(result.length>0){
            response.status(200).send(result);
        }else{
            response.status(500).json({error:"Ha ocurrido un error"});
        }
    });
});


app.get('/registro', (request, response) => {
    const emailRegexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    var email = request.query.email;
    var usuario = request.query.usuario;
    var nombre = request.query.nombre;
    var apellidos = request.query.apellidos;
    var password = request.query.password;
    if ((emailRegexp.test(email)) && (usuario.toString().length>0) && (usuario.toString().length<21) && (password.toString().length>7) && (password.toString().length<17))  {
        pool.query('SELECT * FROM usuarios WHERE usuario = ?', usuario, (error, result) => {
            if (error) throw error;
            if (result.length > 0) {
                response.status(401).json({error:"El nombre de usuario ya está registrado"});
            }else{
                pool.query('SELECT * FROM usuarios WHERE correo = ?', email, (error, result) => {
                    if (error) throw error;
                    if (result.length > 0) {
                        response.status(400).json({error:"El email ya está registrado"});
                    }else{
                        if (nombre.toString().length > 0 && nombre.toString().length < 21 && apellidos.toString().length > 0 && apellidos.toString().length < 41) {
                            console.log("pasa if");
                            bcrypt.hash(request.query.password, 12)
                    .then(function (passwordEncriptado) {
                        pool.query('INSERT INTO usuarios SET usuario=?,password=?,nombre=?,apellidos=?,correo=?,admin=0',[usuario,passwordEncriptado,nombre,apellidos,email],(error, result) => {
                            if (error) throw error;
                            if (result.affectedRows > 0) {
                                var id = result.insertId;
                                pool.query('UPDATE usuarios SET avatar = ? WHERE id = ?',[id, id], (error, result) => {
                                    if (error) throw error;
                                    response.status(200).json({id:id});
                                });
                                ///////COPIAR AVATAR PREDETERMINADO CON NOMBRE ID E INSERTARLO EN LA BASE DE DATOS
            
                            } else {
                                response.status(500).json({error:"Ha ocurrido un error"});
                            }
                        });
                    })
                    .catch(function (error) {
                        return "Error";
                        next();
                    });
                            
                        }
                    }
                   
                });
            }
        });
         
        
    } else {
        response.status(401).json({error:"Usuario o contraseña incorrectos"});
    }
});

