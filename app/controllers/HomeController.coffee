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
      App.Models.Project.find({}).sort({ order: 1 }).exec (err, docs) =>
        @projects_data = docs
        @loaded "projects_data"

  index: ->
    @view_data.title = "Luke Stebner | Bay Area Web Developer"
    @view_data.projects = @projects_data
    @view_data.js_opts = projects_data: @projects_data
    @render "index"
