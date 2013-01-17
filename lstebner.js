
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , _ = require('underscore')
  , _str = require('underscore.string')
  , md = require('node-markdown').Markdown
;

var cache = require('./cache.js')
    ,conf = require('./conf.js')()
;

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3020);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

function do_404(res){
    res.send('4040404040404', 404);
}

app.get('/', function(req, res){
  res.render('index', {
    title: 'Luke Stebner'
  });
});

app.get('/:uri', function(req, res){
    single_page(req, res, req.params.uri);
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
