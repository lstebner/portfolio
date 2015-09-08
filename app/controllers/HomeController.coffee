class App.HomeController extends Portfolio.Controller
  {fs} = Requires

  name: "HomeController"
  view_class: Portfolio.HomeView

  setup: ->
    @projects_data = []
    @public_methods = ["index"]
    @requires "sites_projects", "index"
    @requires "labs_projects", "labs"
    super

  load: (load_what) ->
    return unless super

    if load_what.indexOf("sites_projects") > -1
      App.Models.Project.find({ archived: false, group: "sites" }).sort({ order: 1 }).exec (err, docs) =>
        @sites_projects = docs
        @loaded "sites_projects"
    if load_what.indexOf("labs_projects") > -1
      App.Models.Project.find({ archived: false, group: "labs" }).sort({ order: 1 }).exec (err, docs) =>
        @labs_projects = docs
        @loaded "labs_projects"

  index: ->
    @view_data.title = "Luke Stebner | Bay Area Web Developer"
    @view_data.projects = @sites_projects
    @view_data.js_opts = projects_data: @sites_projects
    @render "index"

  labs: ->
    @view_data.title = "Labs - Luke Stebner | Bay Area Web Developer"
    @view_data.projects = @labs_projects
    @view_data.js_opts = projects_data: @labs_projects
    @render "index"
