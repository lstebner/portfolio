test_view = null

describe "App.View", ->
  beforeEach ->
    req =
      url: ""
    res = 
      render: (@view_to_render) ->
    app = {}
    test_view = new App.View {}, req, res, app

  it "should autogenerate a unique id"
  it "should be able to add to js_opts"
  it "should set the view"
  it "should be able to set some data"
  it "should be able to extend existing data"
  it "should not contain a js_block by default"
