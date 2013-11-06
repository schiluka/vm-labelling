var express = require('express')
  , fs = require('fs')
  , oauthSecrets = JSON.parse(fs.readFileSync('./secrets.json', 'utf-8'))
  , Oauth2 = require('./node_modules/oauth2/lib/oauth2')
  , http = require('http');

var app = module.exports = express();

// Configuration

/*app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'your secret here' }));
  app.use(require('stylus').middleware({ src: __dirname + '/public' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});*/

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
var authCode = '';  
var clientId = oauthSecrets.box.clientId;
var clientSecret = oauthSecrets.box.clientSecret;

app.get('/auth/:provider/callback', function(req, res){
  console.log('box callback return');
  authCode = res.req.query.code;
  console.log('authCode:'+authCode);
  var oauthPath = '/api/oauth2/token'; 
  var data = ' -d ' +
    '\'grant_type=authorization_code&code=' + authCode +
    '&client_id=' + clientId +
    '&client_secret=' + clientSecret + '\'';
  oauthPath = oauthPath + data;
  console.log('oauth path:' + oauthPath);
  // the post options
  var optionspost = {
    host : 'https://www.box.com/',
    path : oauthPath,
    method : 'POST'
  };
  var reqPost = http.request(optionspost, function(res2) {
    console.log("statusCode: ", res2.statusCode); 
    res2.on('data', function(d) {
      console.info('POST result:\n');
      process.stdout.write(d);
      console.info('\n\nPOST completed');
    });
  });
  reqPost.end();
  reqPost.on('error', function(e) {
    console.error('=====Error:'+e);
    console.error('=====Error:'+e.stack);
  });  
});


if (!module.parent) {
    app.listen(3000);
    console.log("Express server listening on port 3000");
}
