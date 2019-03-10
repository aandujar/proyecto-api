const express = require("express");
const bodyParser = require('body-parser');
const port = 3002;
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

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
    pool.query('SELECT * FROM usuarios WHERE usuario = ?',request.query.usuario, (error, result) => {
        if (error) throw error;
        if((result.length>0) && (result[0].password==request.query.password)){
            response.status(200).send(result);
        }else{
            response.status(401).send('Usuario o contraseña incorrectos');
            }
    });
});

