
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

var schemas = require('./schemas.js')(Schema)
    ,models = require('./models.js')(mongoose, schemas)
    ,cache = require('./cache.js')(models)
    ,conf = require('./conf.js')()
;

var page = new models.Page({
    uri: '/my-first-page'
    ,title: 'My first page'
    ,content_raw: '## My First Page \n\nThis is my first page'
});
page.content_html = md(page.content_raw);
//page.save();

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

  mongoose.connect('mongodb://localhost/simplesite');
});

function do_404(res){
    res.send('4040404040404', 404);
}

function listing_page(req, res, filters, view_data){
    filters = _.extend({
        find: {}
        ,limit: 15
        ,offset: 0
    }, filters || {})

    view_data = _.extend(conf.view_data_defaults, view_data || {});

    models.Page
        .find(filters.find)
        .limit(filters.limit)
        .skip(filters.offset)
        .exec(function(err, posts){
            if (err){
                do_404(res);
            }
            else{
                view_data.posts = posts;

                res.render('listing', view_data);
            }
        }
    );
}

function single_page(req, res, uri, view_data){
    view_data = _.extend(conf.view_data_defaults, view_data || {});

    models.Page.findOne({ uri: uri }, function(err, page){
        console.log(page);
        if (err){
            do_404(res);
        }
        else{
            view_data.page = page;

            res.render('single', view_data);
        }
    });
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
