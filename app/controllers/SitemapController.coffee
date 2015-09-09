class App.SitemapController extends Portfolio.Controller
  name: "SitemapController"

  setup: ->
    @public_methods = ["index"]
    @requires "sitemap_urls"

    super

  load: ->
    urls = ["/", "/labs", "/archive"]
    @sitemap_urls = []
    for url in urls
      @sitemap_urls.push App.base_url url, true
      
    @loaded "sitemap_urls"

  index: ->
    @res.header 'Content-type', 'text/plain'
    @res.end _.uniq(@sitemap_urls).join("\n")
    return




