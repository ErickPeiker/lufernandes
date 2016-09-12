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

app.post('/login', function(req, res) {
	var client = new pg.Client();

	usuario = req.body;
	if (usuario.nome === 'LU' && usuario.senha === 'f&rn@nde$') {
		res.render('login');
	} else {
		res.status(500).json({ error: 'Usuario ou senha inválidos'});
	}
});


app.listen(port, function() {
    console.log('Our app is running on http://localhost:' + port);
});