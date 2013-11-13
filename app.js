var express = require('express')
  , fs = require('fs')
  , passport = require('passport')
  , util = require('util')
  , BoxStrategy = require('passport-box').Strategy
  , oauthSecrets = JSON.parse(fs.readFileSync('./secrets.json', 'utf-8'))
  , http = require('http');

var path = require('path');  
//var querystring = require('querystring');

// Passport session setup.
passport.serializeUser( function(user, done) {
        done(null, user);
});
passport.deserializeUser( function(obj, done) {
        done(null, obj);
});

var aToken;
var rToken;
var boxProfile;
passport.use(new BoxStrategy({
    clientID: oauthSecrets.box.clientId,
    clientSecret: oauthSecrets.box.clientSecret,
    callbackURL: "http://127.0.0.1:3000/auth/box/callback"
  },
  function(accessToken, refreshToken, profile, done) {
  	console.log('accessToken:' + accessToken);
  	console.log('refreshToken:' + refreshToken);
  	aToken = accessToken;
  	rToken = refreshToken;
  	// asynchronous verification, for effect...
    process.nextTick(function () {
      
      // To keep the example simple, the user's Box profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the Box account with a user record in your database,
      // and return that user instead.
      return done(null, profile);
    });
  }
));

		
var app = module.exports = express();
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);
app.use('/public',express.static(path.join(__dirname, '/public')));
app.use('/assets',express.static(path.join(__dirname, '/public/assets')));
app.use('/lib',express.static(path.join(__dirname, '/public/lib')));

app.configure(function(){   
  app.use(express.bodyParser());
  // Initialize Passport!  Also use passport.session() middleware, to support
  // persistent login sessions (recommended).
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(express.logger());
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

app.get('/login', function(req, res){
  res.redirect('/auth/box');
});

app.get('/auth/box',
  passport.authenticate('box'),
  function(req, res){
    // The request will be redirected to Box for authentication, so this
    // function will not be called.
});

app.get('/auth/box/callback', 
  passport.authenticate('box', { failureRedirect: '/login' }),
  function(req, res) {
  	console.log('auth callback');
  	//console.log(res);
    res.redirect('/home');
});

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});


app.get('/home', function(req,res){
  console.log('home called');
  res.render('home');
});

app.post('/saveLabel', function(req,res){
  console.log('saveLabel called');
  console.log('input param:' + req.body.labelName);
  //Add this label into labels.txt
  var body = 'Label Saved';
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Content-Length', body.length);
  res.end(body);
});

app.post('/saveCategory', function(req,res){
  console.log('saveCategory called');
  console.log('input param:' + req.body.categoryName);
  //Add this category into labels.txt
  var body = 'Category Saved';
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Content-Length', body.length);
  res.end(body);
});
if (!module.parent) {
    app.listen(3000);
    console.log("Express server listening on port 3000");
}
