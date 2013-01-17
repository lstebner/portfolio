
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
  , nodemailer = require('nodemailer')
  , fs = require('fs')
;

var cache = require('./cache.js')
    ,conf = require('./conf.js')()
    ,transport = null
;

//read in hte "secrets" stuff
fs.exists('./secrets.json', function(exists){
  //if it exists...
  if (exists){
    //...read it
    fs.readFile('./secrets.json', 'UTF-8', function(err, data){
      if (!err){
        //parse content
        data = JSON.parse(data);

        //update conf
        conf = _.extend(conf, data);

        //set up mailer transport
        transport = nodemailer.createTransport("SES", {
            AWSAccessKeyID: conf.AWSAccessKeyID,
            AWSSecretKey: conf.AWSSecretKey
        });
      }
    });
  }
});

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

app.post('/contact-submit', function(req, res){
  var data = _.extend({ name:'', email:'', message:'' }, req.body)
      ,done = function(error, message){
        res.json({
          error: error
          ,message: message
        });
      }
      ,message_data = {
        from: conf.contact_email
        ,to: conf.contact_email
        ,subject: 'Contact Form from ' + data.name
        //keepin it classy
        ,text: "From: " + data.name + "\n" + "Email: " + data.email + "\n\n" + data.message
      }
  ;

  //send me the message
  transport.sendMail(message_data, function(err, msg){
    if (err){
      console.log('sendMail error: ' + err);
      done(true, 'Error sending message, please try again.');
    }
    else{
      done(false, false);
    }
  });
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
