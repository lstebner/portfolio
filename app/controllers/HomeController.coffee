class App.HomeController extends Portfolio.Controller
  {fs} = Requires
  query = Portfolio.Query

  name: "HomeController"
  view_class: Portfolio.HomeView

  setup: ->
    @projects_data = []
    @public_methods = ["index", "labs", "archive"]
    @requires "showcase_projects", "index"
    @requires "labs_projects", "labs"
    @requires "archive_projects", "archive"
    super

  load: (load_what) ->
    return unless super

    if load_what.indexOf("showcase_projects") > -1
      query.get_projects {group: "showcase"}, (err, docs) =>
        @showcase_projects = docs
        @loaded "showcase_projects"
    if load_what.indexOf("labs_projects") > -1
      query.get_projects {group: "labs"}, (err, docs) =>
        @labs_projects = docs
        @loaded "labs_projects"
    if load_what.indexOf("archive_projects") > -1
      query.get_projects {group: "archive"}, (err, docs) =>
        @archive_projects = docs
        @loaded "archive_projects"

  index: ->
    @view_data.title = "Luke Stebner | Bay Area Web Developer"
    @view_data.projects = @showcase_projects
    @view_data.js_opts = projects_data: @showcase_projects
    @render "index"

  labs: ->
    @view_data.title = "Labs Projects - Luke Stebner"
    @view_data.projects = @labs_projects
    @view_data.js_opts = projects_data: @labs_projects
    @render "index"

  archive: ->
    @view_data.title = "Archived Projects - Bay Area Web Developer"
    @view_data.projects = @archive_projects
    @view_data.js_opts = projects_data: @archive_projects
    @render "index"
