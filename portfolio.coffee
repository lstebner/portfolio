# @codekit-prepend "app/core/_main"
# @codekit-append "app/views/__index"
# @codekit-append "app/controllers/__index"

class Portfolio.App extends App
  {express, mongoose} = Requires

  @init: (opts={}) ->
    @site = new Portfolio.App _.extend {
      app: express()
      mongoose: mongoose
      config:
        port: 3020
        title: "Home of Luke Stebner"
        base_url: 'http://lstebner.com'
        meta_keywords: ''
        meta_description: ''
        css_version: (new Date()).getTime()
        js_version: (new Date()).getTime()
      , opts
    }

  ready: ->

  setup_routes: ->
    @route "/", "home#index"
    @route "/contact-submit", "contact#submit", "post"
    @route "/sitemap", "sitemap#index"

  always_configure: ->
    express = express
    oneYear = 31557600000
    @app.set 'port', process.env.PORT or @conf("port")
    @app.set 'views', __dirname + '/views'
    @app.set 'view engine', 'jade'
    # @app.use express.favicon(__dirname + '/public/favicon.ico')
    @app.use express.logger('dev')
    @app.use express.cookieParser()
    @app.use express.bodyParser()
    @app.use express.session(secret: 'specif1call33r0bist')
    @app.use express.methodOverride()
    @app.use express.static("#{__dirname}/public", maxAge: oneYear)
    @app.use @app.router

  configure_for_development: ->
    @app.use express.errorHandler()
    @app.locals.pretty = true

  configure_for_production: ->



class Portfolio.Controller extends App.Controller

