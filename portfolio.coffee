# @codekit-prepend "app/core/_main"
# @codekit-append "app/views/__index"
# @codekit-append "app/controllers/__index"

class Portfolio.App extends App
  {express, mongoose, fs} = Requires

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
    @route "/labs", "home#labs"
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

  before_ready: ->
    @init_projects()

  init_projects: ->
    console.log "updating projects data"
    App.Models.Project.find({}).remove (err) ->

    fs.readdir "#{__dirname}/projects_data", (err, files) =>
      num_groups = 0
      read_projects = (group_name) =>
        num_groups += 1
        fs.readFile "#{__dirname}/projects_data/#{filename}", 'UTF-8', (err, contents) =>
          return console.log "error reading projects_data: #{err}" if err
          projects_data = JSON.parse contents
          errors = []
          for project in projects_data
            project.group = group_name
            p = new App.Models.Project project
            p.save (err) => errors.push(err) if err

          console.log "done updating projects for group '#{group_name}': #{projects_data.length} projects, #{errors.length} errors"
          if errors.length
            for err, i in errors
              console.log "projects err #{i}: #{err}"

      for filename in files
        if filename.indexOf(".json") > -1
          group_name = filename.substr 0, filename.indexOf(".")
          read_projects group_name

class Portfolio.Query
  @get_projects: (query, fn) ->
    query = _.extend
      group: "sites"
      orderby: "order"
      , query

    find =
      archived: false
      group: query.group
    sort = {}
    sort[query.orderby] = 1

    App.Models.Project.find(find).sort(sort).exec (err, docs) =>
      fn? err, docs


class Portfolio.Controller extends App.Controller

