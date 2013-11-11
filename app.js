var express = require('express')
  , fs = require('fs')
  , oauthSecrets = JSON.parse(fs.readFileSync('./secrets.json', 'utf-8'))
  , http = require('http');

var path = require('path');  
var querystring = require('querystring');
		
var app = module.exports = express();
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);
app.use('/public',express.static(path.join(__dirname, '/public')));
app.use('/assets',express.static(path.join(__dirname, '/public/assets')));
app.use('/lib',express.static(path.join(__dirname, '/public/lib')));

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

app.get('/auth/box', function(req, res){
    var client_id = oauthSecrets.box.clientId;
    console.log('clientid:'+client_id)
    var provider = 'box';
    var redirect_uri = 'http://localhost:3000/auth/box/callback';
    var boxAuthUrl = 'https://www.box.com/api/oauth2/authorize?response_type=code&client_id='
    	+ client_id + '&state=authenticated&redirect_uri='+ redirect_uri;
    console.log('boxAuthUrl:'+boxAuthUrl);
    res.redirect(boxAuthUrl); 
});

var authCode;  
var clientId = oauthSecrets.box.clientId;
var clientSecret = oauthSecrets.box.clientSecret;

app.get('/auth/:provider/callback', function(req, res){
  console.log('callback called');
  authCode = res.req.query.code;
  console.log('authCode:' + authCode);
  
  var post_data = querystring.stringify({
    'grant_type' : 'authorization_code',
    'code' : authCode,
    'client_id': clientId,
    'client_secret': clientSecret,
    'redirect_uri' : 'http://localhost:3000/auth/box/token'
  });
  //post_data = post_data + '&redirect_uri=http://localhost:3000/auth/box/token';
  console.log('post_data::' + post_data);
  var post_options = {
    host: 'https://www.box.com',
    path: '/api/oauth2/token',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
      //'Content-Length': post_data.length
    }
  };
  var str = 'grant_type=authorization_code' +
  			'&code=' + authCode +
  			'&client_id=' + clientId +
  			'&client_secret=' + //clientSecret;// +
  			'&redirect_uri=http://localhost:3000/auth/box/token';
  //var redirect = '&redirect_uri=' + encodeURIComponent('http://localhost:3000/auth/box/token');	
  //var data_encoded = str + redirect;		
  var data_encoded = encodeURIComponent(str);
  console.log('data_encoded:' + data_encoded);
  var post_req = http.request(post_options, function(res2) {
      //res2.setEncoding('utf8');
      console.log('STATUS: ' + res2.statusCode);
      console.log('HEADERS: ' + JSON.stringify(res2.headers));
      res2.on('data', function (chunk) {
          console.log('Response: ' + chunk);
      });
  });
  post_req.on('error', function(errData) {
    console.log('====error:' + errData);
    console.log('====error:' + errData.stack); 
  });

  // post the data
  post_req.write(post_data);
  //post_req.write(data_encoded);
  //post_req.write(str);
  post_req.end();

});

app.get('/auth/box/token', function(req, res){
  console.log(res);
});

app.get('/home', function(req,res){
  console.log('home called');
  res.render('home');
});

if (!module.parent) {
    app.listen(3000);
    console.log("Express server listening on port 3000");
}
