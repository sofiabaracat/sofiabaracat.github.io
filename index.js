let express = require('express'),
    path = require('path'),
    http = require('http'),
    app = express(),
    Usuario = require('./app/controller/Usuario'),
    Publi = require('./app/controller/Publi'),
    user = require('./app/Model/User'),
    cookieParser = require('cookie-parser'),
    db = require("./app/Model/MongoDocument"),
    hbs = require('hbs');
    
    
    hbs.registerHelper('dateFormat', require('handlebars-dateformat'));
    
    app.set('view engine', 'hbs');
    app.set('views', path.join(__dirname, '/app/views'));
    app.use(express.urlencoded({extended: false}));
    app.use(cookieParser());
    app.use(express.static(__dirname + '/app/public'));

    app.get('/cadastro', (req, res) =>{
        console.log("Estou no Cadasro");   
        res.render('cadastro');
    });

    app.get('/novoUsuario', (req, res) =>{
        let u = null;
        u = new Usuario(req, res);
        u.create();
        res.redirect('/');
    });

    app.get('/novaPublicacao', (req, res) => { 
        if (req.cookies && req.cookies.login) {
            res.render('novaPublicacao', {
                user: req.cookies.email
            });
            return ;
        } else {
            res.redirect('/login');
        }   
    });

    app.get('/novoPubli', (req, res) =>{
        let p = null;
        p = new Publi(req, res);
        console.log(p);
        p.createPubli();
        
        res.end();
    });
    app.get('/login', (req, res) => {   
        res.render('login');
    });

    app.post('/logar', (req, res) =>{
        //console.log(req);
        
        var email = req.body.email;
        console.log(email);
        var senha = req.body.senha;
        var promise_user = db.findOne(email, "usuarios");
        promise_user.then(function (user) {
            console.log(user);
            var Email = user.email;
            var Senha = user.senha;
            if (Email == null){
                res.render('/login');
                res.send("Email não cadastrado.");
            }

            if(Email == email && Senha == senha){
                res.cookie('login', Email);
                res.cookie('nome', user.nome);
                console.log("cookie");
                console.log(req.cookies);
                if (req.cookies && req.cookies.login) {
                    console.log("login ok");
                    res.render('index', {
                        user: req.cookies.email
                    });
                  //  res.redirect('/');
                    return ;
                } else {
                    res.redirect('/login');
                }
            }else{
                res.redirect('/login');
                console.log("login errado");
            };
            
        });
        promise_user.catch((error) => {
            console.error("Failed to add new friend. Error: " + error);
            return Promise.reject(error);
        });
    });

    app.get('/logout',function(req,res){
        res.clearCookie('login'); 
        res.clearCookie('nome'); 
        res.redirect('/');
    }); 

app.get('/', function(req, res) {
    // Fazendo uma consulta no banco de dados
    var query = { };
    var mysort = { };
    var cursor = db.find(query, mysort, 100, "publicacoes" );
    cursor
        .then(function (publicacoes) {
            res.render('index', {publicacoes: publicacoes});
        })
        // .finally(function(){
            // db.close();
        // });
    
}); 

http.createServer(app).listen(8000);

