/* jshint unused:false */
var express = require('express');
var http = require('http');
var config = require('./config').config;
var logger = require('./logger');
var app = express();

app.use(express.bodyParser());
app.use(express.static(__dirname + "/../static"));
app.use(app.router);

var server = http.createServer(app);

// development settings
app.configure('development', function() {
  app.use('/test', express.static(__dirname + '/../test'));
});

// production settings
app.configure('production', function() {
});

// test settings
app.configure('test', function() {
  app.use('/test', express.static(__dirname + '/../test'));
});

function uncaughtError(err, req, res, next) {
  logger.error({err: err});
  res.send(500);
}
app.use(uncaughtError);

var api = {
  config: function(req, res) {
    res.header('Content-Type', 'application/json');
    res.send(200, JSON.stringify(config));
  }
};

app.get('/config.json', api.config);
app.get('/room/:user', function(req, res) {
   res.sendfile('static/room.html');
});

app.start = function(serverPort, callback) {
  app.set('users', {});

  server.listen(serverPort, callback);
};

app.shutdown = function(callback) {
  server.close(callback);
};

module.exports.app = app;
module.exports.api = api;
module.exports.server = server;
