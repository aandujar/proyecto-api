const express = require("express");
const bodyParser = require('body-parser');
const port = 3002;
const cors = require('cors');
const fs = require('fs');
var nodemailer = require('nodemailer');
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

app.use(express.static('public'));

var bcrypt = require('bcrypt');

var transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
      user: 'correosportmates@gmail.com',
      pass: 'Sportmates92*'
    },
  });

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

app.get('/localidades', (request,response) => {
    pool.query('SELECT * FROM localidades',(error, result) => {
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



app.get('/eventos', (request,response) => {
    var id = request.query.id;
    var hoy = new Date();
    var mes = parseInt(hoy.getMonth());
    mes++;
    var fechaBuscar = new Date(hoy.getFullYear(),mes,hoy.getDate());
    pool.query('SELECT * FROM evento WHERE fecha > ? AND idUsuario != ?', [fechaBuscar,id], (error, result) => {
            if (error) throw error;
            if (result.length > 0){
                response.status(200).json({codigo:"200",resultado:result});
            } else {
                response.status(400).json({codigo:500,error:"No hay eventos disponibles"});
            }
        });  
});

app.get('/eventosProvincia', (request, response) => {
    var provincia = request.query.provincia;
    if ((provincia.toString().length>0) && (provincia.toString().length<31)){
        pool.query('SELECT * FROM evento WHERE provincia = ?', provincia, (error, result) => {
            if (error) throw error;
            if (result.length > 0){
                response.status(200).json({codigo:"200",resultado:result});
            } else {
                response.status(400).json({codigo:"400",error:"No hay eventos disponibles en esa comunidad"});
            }
        });
    } else {
        response.status(401).json({codigo:"401",error:"Datos incorrectos"});
    }
});

app.get('/eventosLocalidad', (request, response) => {
    var localidad = request.query.localidad;
    var provincia = request.query.provincia;
    if ((localidad.toString().length>0) && (localidad.toString().length<31) && (provincia.toString().length>0) && (provincia.toString().length<31)){
        pool.query('SELECT * FROM evento WHERE localidad = ? AND provincia = ?',[localidad, provincia], (error, result) => {
            if (error) throw error;
            if (result.length > 0){
                response.status(200).json({codigo:"200",resultado:result});
            } else {
                response.status(400).json({codigo:"400",error:"No hay eventos disponibles en esa localidad"});
            }
        });
    } else {
        response.status(401).json({codigo:"401",error:"Datos incorrectos"});
    }
});

app.get('/eventosDeporte', (request, response) => {
    var deporte = request.query.deporte;
    if ((deporte.toString().length>0) && (deporte.toString().length<21)){
        pool.query('SELECT * FROM evento WHERE deporte = ?', deporte, (error, result) => {
            if (error) throw error;
            if (result.length > 0){
                response.status(200).json({codigo:"200",resultado:result});
            } else {
                response.status(400).json({codigo:"400",error:"No hay eventos disponibles con esa deporte"});
            }
        });
    } else {
        response.status(401).json({codigo:"401",error:"Datos incorrectos"});
    }
});

app.get('/eventosDeporteProvincia', (request, response) => {
    var deporte = request.query.deporte;
    var provincia = request.query.provincia;
    if ((deporte.toString().length>0) && (deporte.toString().length<21) && (provincia.toString().length>0) && (provincia.toString().length<21)){
        pool.query('SELECT * FROM evento WHERE deporte = ? AND provincia = ?',[deporte, provincia], (error, result) => {
            if (error) throw error;
            if (result.length > 0){
                response.status(200).json({codigo:"200",resultado:result});
            } else {
                response.status(400).json({codigo:"400",error:"No hay eventos disponibles con esa deporte"});
            }
        });
    } else {
        response.status(401).json({codigo:"401",error:"Datos incorrectos"});
    }
});

app.get('/eventosDeporteProvinciaLocalidad', (request, response) => {
    var deporte = request.query.deporte;
    var provincia = request.query.provincia;
    var localidad = request.query.localidad;
    if ((deporte.toString().length>0) && (deporte.toString().length<21) && (provincia.toString().length>0) && (provincia.toString().length<21)){
        pool.query('SELECT * FROM evento WHERE deporte = ? AND provincia = ? AND localidad = ?',[deporte, provincia, localidad], (error, result) => {
            if (error) throw error;
            if (result.length > 0){
                response.status(200).json({codigo:"200",resultado:result});
            } else {
                response.status(400).json({codigo:"400",error:"No hay eventos disponibles con esa deporte"});
            }
        });
    } else {
        response.status(401).json({codigo:"401",error:"Datos incorrectos"});
    }
});

app.post('/registro', (request, response) => {
    const emailRegexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    var email = request.body.data.email;
    var usuario = request.body.data.usuario;
    var nombre = request.body.data.nombre;
    var apellidos = request.body.data.apellidos;
    var password = request.body.data.password;
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
                            bcrypt.hash(password, 12)
                    .then(function (passwordEncriptado) {
                        pool.query('INSERT INTO usuarios SET usuario=?,password=?,nombre=?,apellidos=?,correo=?,admin=0',[usuario,passwordEncriptado,nombre,apellidos,email],(error, result) => {
                            if (error) throw error;
                            if (result.affectedRows > 0) {
                                var id = result.insertId;
                                var avatar = id + ".jpg";
                                pool.query('UPDATE usuarios SET avatar = ? WHERE id = ?',[avatar, id], (error, result) => {
                                    if (error) throw error;
                                    fs.copyFileSync('./public/imagenes/avatares/predeterminado.jpg','./public/imagenes/avatares/' + id + '.jpg');
                                    var mailOptions = {
                                        from: 'correosportmates@gmail.com',
                                        to: email,
                                        subject: 'Bienvenido a SportMates',
                                        text: 'Hola ' + usuario + ', bienvenido a SportMates, te informamos de que tu usuario ya ha sido dado de alta y puedes utilizar nuestra web. Bienvenido!'
                                      };
                                      transporter.sendMail(mailOptions, function (error, info) {
                                            if (error) throw error;
                                        });
                                     response.status(200).json({codigo:"200",id:id,usuario:usuario,avatar:avatar});
                                });
                            } else {
                                response.status(500).json({error:"Ha ocurrido un error"});
                            }
                        });
                    })
                    .catch(function (error) {
                        response.status(500).json({error:"Ha ocurrido un error"});
                        next();
                    });
                            
                        }
                    }
                   
                });
            }
        });    
    } else {
        console.log("error 401");
        response.status(401).json({error:"Usuario o contraseña incorrectos"});
    }
});



app.post('/crearEvento', (request,response) => {
    var idUsuario =  request.body.data.id;
    var email =  request.body.data.email;
    var localidad = request.body.data.localidad;
    var provincia = request.body.data.provincia;
    var descripcion = request.body.data.descripcion;
    var deporte = request.body.data.deporte;
    var fecha = request.body.data.fecha;
    var hora = request.body.data.hora;
    var participantes = request.body.data.participantes;

    var trocearFecha = fecha.split("-");
        

    var hoy = new Date();
    var mes = hoy.getMonth();
    mes++;
    var hour = hora.split(":");
   
  
    
    if(!isNaN(idUsuario) && (deporte.toString().length>0) && (deporte.toString().length<21) && (localidad.toString().length>0) && (localidad.toString().length<31) && (provincia.toString().length>0) && (provincia.toString().length<31) && (descripcion.toString().length>0) && (descripcion.toString().length<201) && (!isNaN(idUsuario)) && (hour.length==2) && (!isNaN(hour[0])) && (hour[0]<24) && (hour[0]>0) && (hour[0].length==2) && (!isNaN(hour[1])) && (hour[1]<60) && (hour[1]>=0) && (hour[1].length==2) && (!isNaN(participantes)) && (participantes>1) && (participantes<101)){
       if(((trocearFecha[2]>=hoy.getFullYear()) && (trocearFecha[1]>=mes) && (trocearFecha[0]>hoy.getDate())) || (((trocearFecha[2]>=hoy.getFullYear()) && (trocearFecha[1]>mes))) || (trocearFecha[2]>hoy.getFullYear())) {
        pool.query('SELECT latitud,longitud FROM localidades WHERE nombre = ?',localidad,(error, result) => {
            if (error) throw error;
            var longitud;
            var latitud;
            if(result.length>0){
               longitud = result[0].longitud;
               latitud = result[0].latitud;
               var fechaFormato = new Date(trocearFecha[2],trocearFecha[1],trocearFecha[0]);
               pool.query('INSERT INTO evento SET idUsuario=?,localidad=?,provincia=?,fecha=?,hora=?,usuariosActuales=1,usuariosMaximos=?,deporte=?,descripcion=?,latitud=?,longitud=?',[idUsuario,localidad,provincia,fechaFormato,hora,participantes,deporte,descripcion,latitud,longitud],(error, result) => {
                if (error) throw error;
                if (result.affectedRows > 0) {
                    var idEvento = result.insertId;
                    pool.query('INSERT INTO lineaevento SET idEvento=?,idUsuarioInscrito=?',[idEvento,idUsuario],(error, result) => {
                        if (result.affectedRows > 0) {
                            var mailOptions = {
                                from: 'correosportmates@gmail.com',
                                to: email,
                                subject: 'Has creado un evento',
                                text: 'Hola, te informamos de que acabas de crear un evento, te recordamos los datos <br />' + 'Localidad: ' + localidad + " <br /> provincia: " + provincia + " <br /> fecha: " + fecha + " <br /> hora: " + hora + " <br /> deporte: " + deporte
                              };
                              transporter.sendMail(mailOptions, function (error, info) {
                                    if (error) throw error;
                                });
                            response.status(200).json({codigo:"200",mensaje:"Evento insertado correctamente"});
                        }else{
                            response.status(500).json({codigo:"500",error:"Ha ocurrido un error"});
                        }
                });
                }else{
                    response.status(500).json({codigo:"500",error:"Ha ocurrido un error"});
                }
            });
            }else{
                response.status(500).json({codigo:"500",error:"Ha ocurrido un error"});
            }
        });
         }else{
            response.status(401).json({codigo:"401",error:"Datos incorrectos"});
          }   
    }else{
        response.status(401).json({codigo:"401",error:"Datos incorrectos"});
    }
});

app.post('/inscribirse', (request,response) => {
    var idEvento =  request.body.data.idUsuario;
    var idUsuario =  request.body.data.idEvento;
    var email =  request.body.data.email;
    console.log(request.body.data);
    
    if(!isNaN(idEvento) && (!isNaN(idUsuario))){
        pool.query('INSERT INTO lineaevento SET idEvento=?,idUsuarioInscrito=?',[idEvento,idUsuario],(error, result) => {
            if (error) throw error;
            if (result.affectedRows > 0) {
                pool.query('SELECT * FROM evento WHERE id = ?',idEvento,(error, result) => {
                    if (error) throw error;
                    if (result.length > 0) {
                        var mailOptions = {
                            from: 'correosportmates@gmail.com',
                            to: email,
                            subject: 'Inscripción a evento',
                            text: 'Hola te informamos dque te has inscrito correctamente a un evento, te recordamos los datos, localidad: ' + result[0].localidad + ', provincia: ' + result[0].provincia + ', fecha: ' + result[0].fecha + ', hora: ' + result[0].hora + ', deporte: ' + result[0].deporte
                          };
                          transporter.sendMail(mailOptions, function (error, info) {
                                if (error) throw error;
                            });
                    }
                    
                });
        
            }
       
        });
    }else{
        response.status(401).json({codigo:"401",error:"Datos incorrectos"});
    }
});


