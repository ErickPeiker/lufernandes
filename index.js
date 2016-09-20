var express = require('express');
var bodyParser = require('body-parser');
var pg = require('pg');

var s3 = require('./s3');
var crypto = require('crypto');
var path = require('path');

var app = express();
var port = process.env.PORT || 8080;

var configuracoes = require('./env.json');

console.log(configuracoes);

configuracoes.configBD.password = process.env.configBD_password;
configuracoes.s3Config.secretKey = process.env.s3Config_secretKey;
configuracoes.admin.senha = process.env.admin_senha;

console.log(configuracoes);


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
pg.defaults.ssl = true;



app.get('/info-s3', function(request, response) {
  if (request.query.filename) {
    var filename =
      crypto.randomBytes(16).toString('hex') +
      path.extname(request.query.filename);
    response.json(s3.s3Credentials(configuracoes.s3Config, filename));
  } else {
    response.status(400).send('filename is required');
  }
});

app.get('/', function(req, res) {
	res.render('index');
});

app.get('/get-site', function (req, res){
	var client = new pg.Client(configuracoes.configBD);
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
						res.json(site);
					});
				});
		      });
		  });
	});
})


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
    var client = new pg.Client(configuracoes.configBD);
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
				res.json(result.rows[0]);
			});
		  });
	});
});

app.get('/get-grupos', function (req, res){
	var client = new pg.Client(configuracoes.configBD);
	client.connect(function (err) {
		if (err){
			throw err;
		}
		client.query('SELECT * FROM GRUPO', function (err, result) {
			if (err) {
		    	throw err;	
			}
			client.end(function (err) {
				if (err) {
					throw err;
				}
				res.json(result.rows);
			});
		});
	});
});

app.post('/grava-grupo', function(req, res) {
	var client = new pg.Client(configuracoes.configBD);
	client.connect(function (err) {
		if (err){
			throw err;
		}
		var parametros = [];
		if (req.body.id > 0) {
			parametros.push(req.body.id);
			parametros.push(req.body.nome);
			parametros.push(req.body.ordem);
			client.query('UPDATE GRUPO SET NOME = $2, ORDEM = $3 WHERE ID = $1', parametros, function (err, result) {
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
		} else {
			parametros.push(req.body.nome);
			parametros.push(req.body.ordem);
			client.query('INSERT INTO GRUPO (NOME) VALUES ($1, $2)', parametros, function (err, result) {
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
		}
	});
});

app.post('/exclui-grupo', function(req, res) {
	var client = new pg.Client(configuracoes.configBD);
	client.connect(function (err) {
		if (err){
			throw err;
		}
		var parametros = [];
		parametros.push(req.body.id);
		client.query('DELETE FROM GRUPO WHERE ID = $1', parametros, function (err, result) {
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

app.get('/get-imagens', function (req, res) {
	var client = new pg.Client(configuracoes.configBD);
	client.connect(function (err) {
		if (err){
			throw err;
		}
		client.query('SELECT * FROM IMAGEM', function (err, result) {
			if (err) {
		    	throw err;	
			}
			client.end(function (err) {
				if (err) {
					throw err;
				}
				res.json(result.rows);
			});
		});
	});
});

app.post('/grava-imagem', function (req, res) {
	var client = new pg.Client(configuracoes.configBD);
	client.connect(function (err) {
		if (err){
			throw err;
		}
		var parametros = [];
		parametros.push(req.body.file);
		client.query('INSERT INTO IMAGEM (FILE) VALUES ($1) RETURNING ID', parametros, function (err, result) {
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

app.post('/atualiza-imagem', function (req, res) {
	var client = new pg.Client(configuracoes.configBD);
	client.connect(function (err) {
		if (err){
			throw err;
		}
		var ok = true;
		var parametros = [];

		if (req.body.nome.length > 0) {
			parametros.push(req.body.nome);
		}else{ok=false}

		if (req.body.preco.length > 0) {
			parametros.push(req.body.preco);
		}else{parametros.push(0)}

		if (req.body.grupo.length > 0) {
			parametros.push(req.body.grupo);
		}else{ok=false}

		parametros.push(req.body.principal);

		if (ok) {
			parametros.push(req.body.id);
		}

		client.query('UPDATE IMAGEM SET NOME = $1, PRECO = $2, ID_GRUPO = $3, PRINCIPAL = $4 WHERE ID = $5', parametros, function (err, result) {
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

app.post('/login', function(req, res) {
	var client = new pg.Client();
	usuario = req.body;
	if (usuario.nome === configuracoes.admin.usuario && usuario.senha === configuracoes.admin.senha) {
		res.render('administrar');
	} else {
		res.status(500).json({ error: 'Usuario ou senha inválidos'});
	}
});

app.post('/altera-config', function(req, res) {
	var client = new pg.Client(configuracoes.configBD);
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