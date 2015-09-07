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
    return unless super

    if load_what.indexOf("projects_data") > -1
      fs.readFile './projects_data.json', 'UTF-8', (err, contents) =>
        return console.log "error reading projects_data: #{err}" if err
        @projects_data = JSON.parse contents
        @projects_data.sort (a, b) => if a.order > b.order then 1 else -1
        @loaded "projects_data"

  index: ->
    @view_data.title = "Luke Stebner | Bay Area Web Developer"
    @view_data.projects = @projects_data
    @view_data.js_opts = projects_data: @projects_data
    @render "index"
