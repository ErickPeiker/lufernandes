var express = require('express');
var bodyParser = require('body-parser');
var pg = require('pg');

var app = express();
var port = process.env.PORT || 8080;
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

var configBD = {
	user: 'mrxtnwahmyzycx', 
	database: 'de1oqvahu5tfo0', 
	password: '8twbcQ1k2-2fScK8BA3hgeLSVI', 
	host: 'ec2-23-23-162-78.compute-1.amazonaws.com', 
	port: 5432
}

pg.defaults.ssl = true;

app.get('/', function(req, res) {
	var client = new pg.Client(configBD);
	client.connect(function (err) {
		  if (err){
		  	throw err;
		  }

		  client.query('SELECT * FROM CONFIG', function (err, result) {
		    if (err) {
		    	throw err;	
			}
			var site = {};
			site.config = result.rows[0];
			client.query('SELECT * FROM GRUPO', function (err, result) {
				if (err) {
					throw err;	
				}
				site.grupos = result.rows;
				client.query('SELECT * FROM IMAGEM', function (err, result) {
					if (err) {
						throw err;	
					}
					site.imagens = result.rows;
					client.end(function (err) {
						if (err) {
							throw err;
						}
						console.log(site);
						res.render('index', site);
					});
				});
		      });
		  });
	});
    
});


app.get('/adm', function(req, res) {
    res.render('login');
});

app.get('/geral', function(req, res) {
    res.render('administrar');
});

app.get('/imagem', function(req, res) {
    res.render('imagem');
});

app.get('/grupo', function(req, res) {
    res.render('grupo');
});

app.get('/get-config', function(req, res) {
    var client = new pg.Client(configBD);
	client.connect(function (err) {
		  if (err){
		  	throw err;
		  }
		  client.query('SELECT * FROM CONFIG', function (err, result) {
		    if (err) {
		    	throw err;	
			}
			client.end(function (err) {
				if (err) {
					throw err;
				}
				console.log(result.rows[0]);
				res.json(result.rows[0]);
			});
		  });
	});
});

app.post('/login', function(req, res) {
	var client = new pg.Client();
	usuario = req.body;
	if (usuario.nome === 'LU' && usuario.senha === 'f&rn@nde$') {
		res.render('administrar');
	} else {
		res.status(500).json({ error: 'Usuario ou senha inválidos'});
	}
});

app.post('/altera-config', function(req, res) {
	var client = new pg.Client(configBD);
	client.connect(function (err) {
		  if (err){
		  	throw err;
		  }
		  var parametros = [];
		  parametros.push(req.body.nome);
		  parametros.push(req.body.titulo);
		  parametros.push(req.body.celular);
		  parametros.push(req.body.grupos);
		  parametros.push(req.body.contato);
		  parametros.push(req.body.preco);
		  parametros.push(req.body.email);
		  client.query('UPDATE CONFIG SET NOME = $1, TITULO= $2, CELULAR= $3, GRUPOS= $4, CONTATO= $5, PRECO= $6, EMAIL=$7', parametros, function (err, result) {
		    if (err) {
		    	res.json(err);
			}
			client.end(function (err) {
				if (err) {
					res.json(err);
				}
				res.json(result);
			});
		  });
	});
});


app.listen(port, function() {
    console.log('Our app is running on http://localhost:' + port);
});