class App.Router
  @debug: true
  constructor: (@app, @opts={}) ->
    console.error("app required") if !@app
    @routes = []

  register: (type, path, controller, method) ->
    console.log "router: add_route #{type.toUpperCase()} #{path}, #{controller.name}##{method}" if Router.debug
    @routes.push [type, path, controller, method]
    @app[type] path, (req, res) =>
      c = new controller(req, res)
      if !c.do method
        console.error "method '#{method}' not found for controller #{controller}"
        @do_404(res)

  do_404: (res) -> res.status(404).send "Sorry, page not found!"

  get: (path, controller, method) ->
    @register 'get', path, controller, method

  post: (path, controller, method) ->
    @register 'post', path, controller, method

  #add in bulk!
  add_routes: (controller) ->
    for path, route of controller.routes
      data =
        type: "get"
        path: path
        controller: controller
        method: null

      if _.isObject(route)
        data = _.extend data, route
      else
        data.method = route

      @register data.type, data.path, data.controller, data.method
