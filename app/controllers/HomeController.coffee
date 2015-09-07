class App.HomeController extends Portfolio.Controller
  {fs} = Requires

  name: "HomeController"
  view_class: Portfolio.HomeView

  setup: ->
    @projects_data = []
    @public_methods = ["index", "get_projects"]
    @requires ["projects_data"]
    super

  load: (load_what) ->
    if load_what.indexOf("projects_data") > -1
      fs.readFile './projects_data.json', 'UTF-8', (err, contents) =>
        return console.log "error reading projects_data: #{err}" if err
        @projects_data = JSON.parse contents
        @loaded "projects_data"

  index: ->
    @view_data.title = "Luke Stebner | Bay Area Web Developer"
    @render "index"

  get_projects: ->
    @json @projects_data
