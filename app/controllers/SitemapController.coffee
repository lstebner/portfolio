class App.SitemapController extends Portfolio.Controller
  name: "SitemapController"

  setup: ->
    @public_methods = ["index"]

    super

  load: ->
    @sitemap_urls = []
    @sitemap_urls.push App.base_url()

  index: ->
    @res.header 'Content-type', 'text/plain'
    @res.end _.uniq(@sitemap_urls).join("\n")
    return




