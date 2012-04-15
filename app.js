/**
 * Module dependencies.
 */
var express = require('express');

var app = module.exports = express.createServer();

// ln -s '../common' ./lib/client/common
var bundle = require('browserify')({
  entry:__dirname + '/lib/client/index.js',
  watch:true
});


// Server Configuration
app.configure(function(){

  app.use(express.bodyParser());
  app.use(express.methodOverride());

  //static files
  app.use(express.static(__dirname + '/public'));
  app.use(express.static(__dirname + '/public/js'));

  app.use(bundle);

  // Session support
  app.use(express.cookieParser());

  var RedisStore = require('connect-redis')(express);

  store = new RedisStore();

  app.use(express.session({
    secret: "Rush 2112",
    store: store
  }));

});

// Server Routes

app.listen(3000);

console.log("Server ready: Throw 'em up!!!");


var io = require('socket.io').listen(app);

//io.set('log level', 1);

io.sockets.on('connection', function (socket) {
  require('./lib/controllers')(socket);
});