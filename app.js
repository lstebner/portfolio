// Generated by CoffeeScript 1.9.3
var App, Portfolio, Requires, Schema, _, _str,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Portfolio = {};

_ = require('underscore');

_str = require('underscore.string');

Requires = {
  express: require('express'),
  http: require('http'),
  path: require('path'),
  mongoose: require('mongoose'),
  fs: require('fs'),
  md: require('node-markdown').Markdown,
  nodemailer: require('nodemailer')
};

Requires.Schema = Requires.mongoose.Schema;

App = (function() {
  var CONF_DEFAULTS, express, fs;

  fs = Requires.fs, express = Requires.express;

  CONF_DEFAULTS = {
    title: "",
    base_url: '',
    meta_keywords: '',
    meta_description: '',
    css_version: 1,
    js_version: 1,
    port: 3000
  };

  App.set_site = function(site) {
    this.site = site;
  };

  App.init = function(opts, appclass) {
    if (opts == null) {
      opts = {};
    }
    if (appclass == null) {
      appclass = App;
    }
    return this.site = appclass["init"](opts);
  };

  App.slugify = function(title, d) {
    var replace, str;
    replace = "-";
    str = title.toString().replace(/[\s\.]+/g, replace).toLowerCase().replace(new RegExp("[^a-z0-9" + replace + "]", "g"), replace).replace(new RegExp(replace + "+", "g"), replace);
    if (str.charAt(str.length - 1) === replace) {
      str = str.substring(0, str.length - 1);
    }
    if (str.charAt(0) === replace) {
      str = str.substring(1);
    }
    if (d != null) {
      return str + "-" + d.getDate() + "-" + (d.getMonth() + 1) + "-" + d.getFullYear();
    } else {
      return str;
    }
  };

  App.pretty_date = function(date) {
    return moment(date).fromNow();
  };

  App.base_url = function(uri, force_full) {
    var ref;
    if (force_full == null) {
      force_full = false;
    }
    return (ref = this.site) != null ? ref.base_url(uri, force_full) : void 0;
  };

  App.conf = function(key) {
    var ref;
    return (ref = this.site) != null ? ref.conf(key) : void 0;
  };

  App.get_conf = function() {
    var ref;
    return (ref = this.site) != null ? ref.config : void 0;
  };

  function App(opts) {
    if (opts == null) {
      opts = {};
    }
    this.env = process.env.NODE_ENV;
    this.site_name = opts.site_name, this.config = opts.config, this.app = opts.app, this.mongoose = opts.mongoose;
    this.config = _.extend(CONF_DEFAULTS, this.config);
    this.load_environment_config();
    this.setup();
  }

  App.prototype.load_environment_config = function() {
    var contents, e, env_conf;
    contents = fs.readFileSync(__dirname + "/app/conf/" + this.env + ".conf", "UTF-8");
    try {
      env_conf = JSON.parse(contents);
      this.config = _.extend(this.config, env_conf);
    } catch (_error) {
      e = _error;
      console.log("error! parsing json in " + this.env + " conf");
    }
    return console.log(this.env + " config loaded");
  };

  App.prototype.setup = function() {
    var key, ref, val;
    for (key in Requires) {
      val = Requires[key];
      this[key] = val;
    }
    this.configure_app();
    this.router = new App.Router(this.app);
    this.setup_mongoose();
    this.setup_routes();
    this.listener = this.app.listen(this.config.port);
    console.log("Express server listening on port %d in %s mode", (ref = this.listener) != null ? ref.address().port : void 0, this.app.settings.env);
    return this.ready();
  };

  App.prototype.ready = function() {
    return 1;
  };

  App.prototype.setup_mongoose = function() {
    return this.mongoose.connect("mongodb://" + (this.conf('db_host')) + "/" + (this.conf('db_name')));
  };

  App.prototype.conf = function(key) {
    var ref;
    if ((ref = this.config) != null ? ref.hasOwnProperty(key) : void 0) {
      return this.config[key];
    } else {
      return false;
    }
  };

  App.prototype.base_url = function(uri, force_full) {
    var url;
    if (uri == null) {
      uri = "";
    }
    if (force_full == null) {
      force_full = false;
    }
    if (process.env.NODE_ENV === 'development' && !force_full) {
      return uri;
    }
    return url = "" + (this.conf('base_url')) + uri;
  };

  App.prototype.route = function(uri, dest, type) {
    var controller, controller_name, default_method, dest_sp, dest_wedge, method_name;
    if (type == null) {
      type = "get";
    }
    default_method = "index";
    dest_wedge = "#";
    dest_sp = dest.split(dest_wedge);
    controller_name = dest_sp[0].substr(0, 1).toUpperCase() + dest_sp[0].substring(1);
    controller = App[controller_name + "Controller"];
    if (controller == null) {
      return console.log("App route error, controller not found: " + controller_name);
    }
    method_name = dest_sp[1] != null ? dest_sp[1] : default_method;
    switch (type) {
      case "get":
        return this.router.get(uri, controller, method_name);
      case "post":
        return this.router.post(uri, controller, method_name);
    }
  };

  App.prototype.setup_routes = function() {
    this.route("/sitemap", "sitemap");
    this.route("/post/:slug", "post#index");
    this.route("/category/:category", "listing#by_category");
    this.route("/tag/:tag", "listing#by_tag");
    this.route("/blog", "listing#latest");
    this.route("/store", "store");
    this.route("/about-me", "home#about");
    return this.route("/", "home");
  };

  App.prototype.configure_app = function() {
    express = express;
    this.app.configure((function(_this) {
      return function() {
        return _this.always_configure();
      };
    })(this));
    this.app.configure("development", (function(_this) {
      return function() {
        _this.app.use(express.errorHandler({
          dumpExceptions: true,
          showStack: true
        }));
        return _this.configure_for_development();
      };
    })(this));
    return this.app.configure("production", (function(_this) {
      return function() {
        _this.app.use(express.errorHandler());
        return _this.configure_for_production();
      };
    })(this));
  };

  App.prototype.always_configure = function() {
    this.app.set("views", __dirname + "/views");
    this.app.set("view engine", "jade");
    this.app.use(express.bodyParser());
    this.app.use(express.methodOverride());
    this.app.use(this.app.router);
    return this.app.use(express["static"](__dirname + "/public"));
  };

  App.prototype.configure_for_development = function() {
    return 1;
  };

  App.prototype.configure_for_production = function() {
    return 1;
  };

  return App;

})();

App.Schemas = {};

Schema = Requires.Schema;

App.Schemas.User = new Schema({
  date_registered: {
    type: Date,
    "default": null
  },
  ip: {
    type: String,
    "default": null
  },
  registration_key: {
    type: String,
    "default": null
  }
});

App.Schemas.Like = new Schema({
  date: {
    type: Date,
    "default": new Date()
  },
  username: {
    type: String,
    required: true
  }
});

App.Schemas.Tag = new Schema({
  name: {
    type: String,
    required: true,
    "default": ''
  },
  slug: {
    type: String,
    required: true,
    "default": ''
  }
});

App.Schemas.Comment = new Schema({
  date: {
    type: Date,
    "default": new Date()
  },
  edited: {
    type: Boolean,
    "default": false
  },
  last_edited_date: {
    type: Date,
    "default": null
  },
  deleted: {
    type: Boolean,
    "default": false
  },
  deleted_date: {
    type: Date,
    "default": null
  },
  user: {
    type: Schema.Types.Mixed,
    "default": {}
  },
  content: {
    type: String,
    "default": ''
  }
});

App.Schemas.Upload = new Schema({
  date_uploaded: {
    type: Date,
    "default": new Date()
  },
  title: {
    type: String,
    "default": ''
  },
  slug: {
    type: String,
    "default": ''
  },
  desc: {
    type: String,
    "default": ''
  },
  file_ext: {
    type: String,
    "default": ''
  },
  likes: [App.Schemas.Like],
  num_likes: {
    type: Number,
    "default": 0
  },
  permalink: {
    type: String,
    "default": '',
    unique: true
  },
  tags: [App.Schemas.Tag],
  source_url: {
    type: String,
    "default": ''
  },
  comments: [App.Schemas.Comment],
  num_comments: 0,
  is_private: false,
  upload_error: {
    type: Schema.Types.Mixed,
    "default": null
  },
  has_error: {
    type: Boolean,
    "default": false
  },
  uploaded_by: {
    type: String,
    "default": ''
  }
});

App.Schemas.Admin = new Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  logged_in: {
    type: Boolean,
    "default": false
  },
  session_id: {
    type: String,
    "default": ''
  },
  session_expires: {
    type: Date,
    "default": null
  }
});

App.Schemas.DataCache = new Schema({
  created: {
    type: Date,
    required: true
  },
  expires: {
    type: Date,
    required: true
  },
  slug: {
    type: String,
    required: true
  },
  parameters: {
    type: String,
    "default": ""
  },
  data: {
    type: Schema.Types.Mixed,
    "default": []
  }
});

App.Models = {
  Upload: Requires.mongoose.model("Upload", App.Schemas.Upload),
  Tag: Requires.mongoose.model("Tag", App.Schemas.Tag),
  Admin: Requires.mongoose.model("Admin", App.Schemas.Admin),
  DataCache: Requires.mongoose.model("DataCache", App.Schemas.DataCache)
};

App.Router = (function() {
  Router.debug = true;

  function Router(app, opts1) {
    this.app = app;
    this.opts = opts1 != null ? opts1 : {};
    if (!this.app) {
      console.error("app required");
    }
    this.routes = [];
  }

  Router.prototype.register = function(type, path, controller, method) {
    if (Router.debug) {
      console.log("router: add_route " + (type.toUpperCase()) + " " + path + ", " + controller.name + "#" + method);
    }
    this.routes.push([type, path, controller, method]);
    return this.app[type](path, (function(_this) {
      return function(req, res) {
        var c;
        c = new controller(req, res);
        if (!c["do"](method)) {
          console.error("method '" + method + "' not found for controller " + controller);
          return _this.do_404(res);
        }
      };
    })(this));
  };

  Router.prototype.do_404 = function(res) {
    return res.status(404).send("Sorry, page not found!");
  };

  Router.prototype.get = function(path, controller, method) {
    return this.register('get', path, controller, method);
  };

  Router.prototype.post = function(path, controller, method) {
    return this.register('post', path, controller, method);
  };

  Router.prototype.add_routes = function(controller) {
    var data, path, ref, results, route;
    ref = controller.routes;
    results = [];
    for (path in ref) {
      route = ref[path];
      data = {
        type: "get",
        path: path,
        controller: controller,
        method: null
      };
      if (_.isObject(route)) {
        data = _.extend(data, route);
      } else {
        data.method = route;
      }
      results.push(this.register(data.type, data.path, data.controller, data.method));
    }
    return results;
  };

  return Router;

})();

App.Controller = (function() {
  Controller.prototype.name = "base";

  Controller.prototype.view_class = App.View;

  function Controller(req1, res1) {
    this.req = req1;
    this.res = res1;
    this.requirements_list = {};
    this.loaded_items = [];
    this.current_needs = [];
    this.public_methods = [];
    this.view_data = {};
    this.view_to_render = "";
    this.setup();
  }

  Controller.prototype.setup = function() {
    return this.setup_preload();
  };

  Controller.prototype.setup_preload = function() {
    return 1;
  };

  Controller.prototype.requires = function(needs_list, for_what) {
    var _register, j, k, len, len1, m, methods, ref, results, results1;
    if (for_what == null) {
      for_what = "all";
    }
    _register = (function(_this) {
      return function(method_name, needs_list) {
        return _this.requirements_list[method_name] = _this.requirements_list[method_name] != null ? _.union(_this.requirements_list[method_name], needs_list) : needs_list;
      };
    })(this);
    if (_.isObject(for_what)) {
      methods = for_what.except != null ? _.difference(this.public_methods, for_what) : for_what.only != null ? _.intersection(this.public_methods, for_what) : void 0;
      results = [];
      for (j = 0, len = methods.length; j < len; j++) {
        m = methods[j];
        results.push(_register(m, needs_list));
      }
      return results;
    } else if (for_what === "all") {
      ref = this.public_methods;
      results1 = [];
      for (k = 0, len1 = ref.length; k < len1; k++) {
        m = ref[k];
        results1.push(_register(m, needs_list));
      }
      return results1;
    } else {
      return _register(for_what, needs_list);
    }
  };

  Controller.prototype.preload = function(for_method) {
    if (this.requirements_list[for_method] == null) {
      return true;
    }
    this.current_needs = this.requirements_list[for_method];
    return this.load(this.current_needs.join(" "));
  };

  Controller.prototype["do"] = function(requested_method, prevent_render) {
    this.requested_method = requested_method;
    this.prevent_render = prevent_render != null ? prevent_render : true;
    this.preload(this.requested_method);
    if (this.has_needs_met()) {
      if ((this[this.requested_method] != null) && _.indexOf(this.public_methods, this.requested_method) > -1) {
        this[this.requested_method]();
        if (!this.prevent_render) {
          this.render();
        }
        true;
      } else {
        false;
      }
    } else {
      setTimeout((function(_this) {
        return function() {
          return _this["do"](_this.requested_method, _this.prevent_render);
        };
      })(this), 50);
    }
    return true;
  };

  Controller.prototype.do_404 = function() {
    this.res.status(404);
    return this.res.render('404', {
      title: ' 404, man'
    });
  };

  Controller.prototype.param = function(key) {
    if (this.req.params.hasOwnProperty(key)) {
      return this.req.params[key];
    } else {
      return false;
    }
  };

  Controller.prototype.query = function(key) {
    if (this.req.query.hasOwnProperty(key)) {
      return this.req.query[key];
    } else {
      return false;
    }
  };

  Controller.prototype.cookie = function(key) {
    if (this.req.cookies && this.req.cookies.hasOwnProperty(key)) {
      return this.req.cookies[key];
    } else {
      return false;
    }
  };

  Controller.prototype.body = function(key) {
    if (this.req.body && this.req.body.hasOwnProperty(key)) {
      return this.req.body[key];
    } else {
      return false;
    }
  };

  Controller.prototype.redirect = function(dest, status) {
    if (status == null) {
      status = 302;
    }
    return this.res.redirect(status, dest);
  };

  Controller.prototype.load = function(load_items) {
    var i, j, len, ref;
    if (this.loaded_items) {
      ref = this.loaded_items;
      for (j = 0, len = ref.length; j < len; j++) {
        i = ref[j];
        load_items = load_items.replace("" + i, "");
      }
      load_items = _str.trim(load_items.replace(/\s\s/g, ""));
    } else {
      this.loaded_items = [];
    }
    if (!load_items.length) {
      return false;
    }
    return true;
  };

  Controller.prototype.loaded = function(item_name) {
    this.loaded_items || (this.loaded_items = []);
    return this.loaded_items.push(item_name);
  };

  Controller.prototype.has_needs_met = function() {
    var has_everything, j, len, need, ref;
    if (!this.current_needs) {
      return true;
    }
    has_everything = true;
    ref = this.current_needs;
    for (j = 0, len = ref.length; j < len; j++) {
      need = ref[j];
      has_everything = has_everything && _.indexOf(this.loaded_items, need) > -1;
    }
    return has_everything;
  };

  Controller.prototype.json = function(obj) {
    return this.res.json(obj);
  };

  Controller.prototype.render = function(view_name, data) {
    if (view_name == null) {
      view_name = null;
    }
    if (data == null) {
      data = this.view_data;
    }
    this.before_render();
    if (this.cancel_render) {
      return this.cancel_render = false;
    }
    this.view_data.view = !_.isEmpty(view_name) ? view_name : !_.isEmpty(this.view_to_render) ? this.view_to_render : this.requested_method;
    this.current_view = new this.view_class(this.view_data, this.req, this.res, this.app);
    this.current_view.render();
    this.after_render();
    this.cancel_render = false;
    return this.current_view;
  };

  Controller.prototype.set_view = function(view_to_render) {
    this.view_to_render = view_to_render;
    return 1;
  };

  Controller.prototype.before_render = function() {
    return 1;
  };

  Controller.prototype.after_render = function() {
    return 1;
  };

  return Controller;

})();

App.View = (function() {
  function View(data1, req1, res1, app) {
    this.data = data1 != null ? data1 : {};
    this.req = req1;
    this.res = res1;
    this.app = app;
    this.js_opts = {};
    this.default_data();
    this.set_view(this.data.view);
  }

  View.prototype.default_data = function() {
    this.data = _.extend({
      layout: true,
      title: App.conf("site_name"),
      site_name: App.conf("site_name"),
      meta: {
        keywords: App.conf("site_keywords"),
        description: App.conf("site_description")
      },
      this_url: this.req.url,
      _: _,
      view: 'index',
      disqus_shortname: App.conf("disqus_shortname"),
      cookies: null,
      body_class: '',
      single_upload_view: false,
      this_url: this.req.url,
      pagination_data: {},
      uploads_filter: {},
      load_more: true,
      display_comments: false,
      no_uploads_message: false,
      css_version: App.conf("css_version"),
      js_version: App.conf("js_version"),
      base_url: App.base_url(),
      auto_generated_id: this.auto_generate_id(),
      js_opts: this.js_opts,
      compiled_js: false
    }, this.data);
    return this.data;
  };

  View.prototype.auto_generate_id = function() {
    return "auto_id_" + ((new Date()).getTime().toString(36));
  };

  View.prototype.add_js_opts = function(new_opts) {
    if (new_opts == null) {
      new_opts = {};
    }
    return this.js_opts = _.extend(this.js_opts, new_opts);
  };

  View.prototype.set_view = function(view) {
    this.view = view;
  };

  View.prototype.set_data = function(key, val) {
    return this.data[key] = val;
  };

  View.prototype.extend_data = function(more_data) {
    if (more_data == null) {
      more_data = {};
    }
    return this.data = _.extend(this.data, more_data);
  };

  View.prototype.js_block = function() {
    return false;
  };

  View.prototype.render = function() {
    if (this.data.js_opts) {
      this.add_js_opts(this.data.js_opts);
    }
    this.data.compiled_js = this.js_block();
    return this.res.render(this.view, _.extend(App.get_conf(), this.data, {
      js_opts: JSON.stringify(this.js_opts)
    }));
  };

  return View;

})();

Portfolio.App = (function(superClass) {
  var express, mongoose;

  extend(App, superClass);

  function App() {
    return App.__super__.constructor.apply(this, arguments);
  }

  express = Requires.express, mongoose = Requires.mongoose;

  App.init = function(opts) {
    if (opts == null) {
      opts = {};
    }
    return this.site = new Portfolio.App(_.extend({
      app: express(),
      mongoose: mongoose,
      config: {
        port: 3020,
        title: "Home of Luke Stebner",
        base_url: 'http://lstebner.com',
        meta_keywords: '',
        meta_description: '',
        css_version: (new Date()).getTime(),
        js_version: (new Date()).getTime()
      },
      opts: opts
    }));
  };

  App.prototype.ready = function() {};

  App.prototype.setup_routes = function() {
    this.route("/", "home#index");
    this.route("/contact-submit", "contact#submit", "post");
    return this.route("/sitemap", "sitemap#index");
  };

  App.prototype.always_configure = function() {
    var oneYear;
    express = express;
    oneYear = 31557600000;
    this.app.set('port', process.env.PORT || this.conf("port"));
    this.app.set('views', __dirname + '/views');
    this.app.set('view engine', 'jade');
    this.app.use(express.logger('dev'));
    this.app.use(express.cookieParser());
    this.app.use(express.bodyParser());
    this.app.use(express.session({
      secret: 'specif1call33r0bist'
    }));
    this.app.use(express.methodOverride());
    this.app.use(express["static"](__dirname + "/public", {
      maxAge: oneYear
    }));
    return this.app.use(this.app.router);
  };

  App.prototype.configure_for_development = function() {
    this.app.use(express.errorHandler());
    return this.app.locals.pretty = true;
  };

  App.prototype.configure_for_production = function() {};

  return App;

})(App);

Portfolio.Controller = (function(superClass) {
  extend(Controller, superClass);

  function Controller() {
    return Controller.__super__.constructor.apply(this, arguments);
  }

  return Controller;

})(App.Controller);

Portfolio.HomeView = (function(superClass) {
  extend(HomeView, superClass);

  function HomeView() {
    return HomeView.__super__.constructor.apply(this, arguments);
  }

  HomeView.prototype.js_block = function() {
    return "World.Home.init(\"#" + this.data.auto_generated_id + "\", " + (JSON.stringify(this.data.js_opts)) + ");";
  };

  return HomeView;

})(App.View);

App.SitemapController = (function(superClass) {
  extend(SitemapController, superClass);

  function SitemapController() {
    return SitemapController.__super__.constructor.apply(this, arguments);
  }

  SitemapController.prototype.name = "SitemapController";

  SitemapController.prototype.setup = function() {
    this.public_methods = ["index"];
    return SitemapController.__super__.setup.apply(this, arguments);
  };

  SitemapController.prototype.load = function() {
    this.sitemap_urls = [];
    return this.sitemap_urls.push(App.base_url());
  };

  SitemapController.prototype.index = function() {
    this.res.header('Content-type', 'text/plain');
    this.res.end(_.uniq(this.sitemap_urls).join("\n"));
  };

  return SitemapController;

})(Portfolio.Controller);

App.HomeController = (function(superClass) {
  var fs;

  extend(HomeController, superClass);

  function HomeController() {
    return HomeController.__super__.constructor.apply(this, arguments);
  }

  fs = Requires.fs;

  HomeController.prototype.name = "HomeController";

  HomeController.prototype.view_class = Portfolio.HomeView;

  HomeController.prototype.setup = function() {
    this.projects_data = [];
    this.public_methods = ["index", "get_projects"];
    this.requires(["projects_data"]);
    return HomeController.__super__.setup.apply(this, arguments);
  };

  HomeController.prototype.load = function(load_what) {
    if (load_what.indexOf("projects_data") > -1) {
      return fs.readFile('./projects_data.json', 'UTF-8', (function(_this) {
        return function(err, contents) {
          if (err) {
            return console.log("error reading projects_data: " + err);
          }
          _this.projects_data = JSON.parse(contents);
          return _this.loaded("projects_data");
        };
      })(this));
    }
  };

  HomeController.prototype.index = function() {
    this.view_data.title = "Luke Stebner | Bay Area Web Developer";
    this.view_data.projects = this.projects_data;
    this.view_data.js_opts = {
      projects_data: this.projects_data
    };
    return this.render("index");
  };

  return HomeController;

})(Portfolio.Controller);

App.ContactController = (function(superClass) {
  var nodemailer;

  extend(ContactController, superClass);

  function ContactController() {
    return ContactController.__super__.constructor.apply(this, arguments);
  }

  nodemailer = Requires.nodemailer;

  ContactController.prototype.name = "ContactController";

  ContactController.prototype.setup = function() {
    this.public_methods = ["submit"];
    this.setup_transport();
    return ContactController.__super__.setup.apply(this, arguments);
  };

  ContactController.prototype.setup_transport = function() {
    return this.transport = nodemailer.createTransport("SES", {
      AWSAccessKeyID: App.conf("AWSAccessKeyID"),
      AWSSecretKey: App.conf("AWSSecretKey")
    });
  };

  ContactController.prototype.submit = function() {
    var data, done, message_data;
    if (!this.transport) {
      return console.log("transport not set up!");
    }
    data = _.extend({
      name: "",
      email: "",
      message: ""
    }, this.req.body);
    message_data = {
      from: App.conf("contact_email"),
      to: App.conf("contact_email"),
      subject: "Contact Form from " + data.name,
      text: "From: " + data.name + "\n\nEmail: " + data.email + "\n\n\n" + data.message
    };
    done = (function(_this) {
      return function(err, message) {
        return _this.json({
          error: err,
          message: message
        });
      };
    })(this);
    return this.transport.sendMail(message_data, (function(_this) {
      return function(err, msg) {
        if (err) {
          console.log('sendMail error: ' + err);
          return done(true, 'Error sending message, please try again.');
        } else {
          return done(false, false);
        }
      };
    })(this));
  };

  return ContactController;

})(Portfolio.Controller);

App.init({}, Portfolio.App);
