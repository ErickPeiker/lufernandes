var express = require('express');
var bodyParser = require('body-parser');

//Biblioteca S3
var s3Library = require('s3');
//Biblioteca postgress
var pg = require('pg');
//Biblioteca para manipular emails
var nodemailer = require('nodemailer');
//Biblioteca de criptografia
var crypto = require('crypto');
//Biblioteca para manipular paths
var path = require('path');
//Funcoes para amazon
var s3 = require('./s3');
//Configurações gerais
var configuracoes = require('./env.json');

var app = express();
var port = process.env.PORT || 8080;
if (process.env.NODE_ENV != 'desen') {
	configuracoes.configBD.password = process.env.configBD_password;
	configuracoes.s3Config.secretKey = process.env.s3Config_secretKey;
	configuracoes.admin.senha = process.env.admin_senha;
}

var clientS3 = s3Library.createClient({
  maxAsyncS3: 20,
  s3RetryCount: 3,
  s3RetryDelay: 1000,
  multipartUploadThreshold: 20971520,
  multipartUploadSize: 15728640,
  s3Options: {
    accessKeyId: configuracoes.s3Config.accessKey,
    secretAccessKey: configuracoes.s3Config.secretKey
  },
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
pg.defaults.ssl = true;

app.get('/', function(req, res) {
	res.render('index');
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
});

app.post('/envia-contato', function (req, res) {
	var client = new pg.Client(configuracoes.configBD);
	client.connect(function (err) {
		  if (err){
		  	throw err;
		  }
		  client.query('SELECT * FROM CONFIG', function (err, result) {
		    if (err) {
		    	throw err;	
			}
			var config = result.rows[0];
			var transporter = nodemailer.createTransport("SMTP", {
			    service: "hotmail",
			    auth: {
			        user: config.email,
			        pass: config.senha_email
			    }
			});

			var htmlEmail = '<table>';
			htmlEmail += '<tr><td>Nome:</td><td>'+req.body.nome+'</td></tr>'
			htmlEmail += '<tr><td>Telefone:</td><td>'+req.body.phone+'</td></tr>'
			htmlEmail += '<tr><td>Email:</td><td>'+req.body.email+'</td></tr>'
			htmlEmail += '<tr><td>Mensagem:</td><td>'+req.body.message+'</td></tr>'
			htmlEmail += '</table>'

			var mailOptions = {
			    from: '"Contato - Site Lu Fernandes ?" <'+config.email+'>',
			    to: config.email,
			    subject: 'Contato - Site Lu Fernandes - '+req.body.nome,
			    text: 'Nome:'+req.body.nome+' - Telefone:'+req.body.phone+' - Email:'+req.body.email+' - Mensagem:'+req.body.message,
			    html: htmlEmail
			};

			transporter.sendMail(mailOptions, function(error, info){
			    if(error){
			    	res.status(500).json({ error: 'Não foi possível enviar o email - Favor ligar em meu contato no inicío do site! Falha:'+error});
			    }
			    res.json({ message: 'Email enviado com sucesso! '});
			});
		});
	});
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
		  parametros.push(req.body.senha_email);
		  parametros.push(req.body.topo_imagens);
		  client.query('UPDATE CONFIG SET NOME = $1, TITULO= $2, CELULAR= $3, GRUPOS= $4, CONTATO= $5, PRECO= $6, EMAIL=$7, SENHA_EMAIL=$8, TOPO_IMAGENS=$9', parametros, function (err, result) {
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
			client.query('INSERT INTO GRUPO (NOME, ORDEM) VALUES ($1, $2)', parametros, function (err, result) {
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

app.get('/info-s3', function(request, response) {
  if (request.query.filename) {
    var filename = crypto.randomBytes(16).toString('hex') + path.extname(request.query.filename);
    response.json(s3.s3Credentials(configuracoes.s3Config, filename));
  } else {
    response.status(400).send('filename is required');
  }
});

app.post('/remove-imagem', function (req, res) {
	var objeto = {
		Bucket: configuracoes.s3Config.bucket,
		Delete:{
			Objects: [
				{
					Key: req.body.file
				}
			]
		}
	}
	clientS3.deleteObjects(objeto, function(err, data) {
		console.log(err);
		console.log(data);
	});

	var client = new pg.Client(configuracoes.configBD);
	client.connect(function (err) {
		if (err){
			throw err;
		}
		var parametros = [];
		parametros.push(req.body.id);
		client.query('DELETE FROM IMAGEM WHERE ID = $1', parametros, function (err, result) {
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

		if (req.body.id_grupo > 0) {
			parametros.push(req.body.id_grupo);
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

app.listen(port, function() {
    console.log('Our app is running on http://localhost:' + port);
});