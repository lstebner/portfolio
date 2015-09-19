# @codekit-prepend "__includes"

app = null

test_app =
  configure: -> 1
  listen: -> 0
  get: -> 1
  post: -> 1

test_mongoose =
  connect: ->

test_config = null

describe "app/core/App", ->
  before ->
    app = App.init
      app: test_app
      mongoose: test_mongoose

  it "should be set up", ->
    expect(app.is_setup).to.equal(true)

  it "should return http://testingbaseurl.com/ when base_url is called with no parameters", ->
    expect(app.base_url(null, true)).to.equal("http://testingbaseurl.com/")

  it "should return http://testingbaseurl.com/hotsauce when base_url is passed a uri", ->
    expect(app.base_url("/hotsauce", true)).to.equal("http://testingbaseurl.com/hotsauce")

  it "should return a correct conf value", ->
    expect(app.conf("meta_keywords")).to.equal("meta keywords value")

  it "should return false for a conf key that doesn't have a value", ->
    expect(app.conf("jibberjabber")).to.equal(false)

  it "should return false for conf if no key is passed", ->
    expect(app.conf()).to.equal(false)

