// Generated by CoffeeScript 1.9.3
(function() {
  var App, Requires, Schema, _, _str, app, expect, process, test_app, test_config, test_controller, test_mongoose, test_req, test_res, test_router, test_view;

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
    var CONF_DEFAULTS, ROOT_DIR, express, fs;

    fs = Requires.fs, express = Requires.express;

    CONF_DEFAULTS = {
      title: "",
      base_url: '',
      meta_keywords: '',
      meta_description: '',
      css_version: 1,
      js_version: 1,
      port: 3000,
      debug: false
    };

    ROOT_DIR = __dirname.replace(/spec(\/|)/, "");

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
      if (appclass === App) {
        return this.site = new App(opts);
      } else {
        return this.site = appclass["init"](opts);
      }
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
      this.config = _.extend(CONF_DEFAULTS, this.config || {});
      this.load_environment_config();
      this.setup();
    }

    App.prototype.load_environment_config = function() {
      var contents, e, env_conf, filepath;
      filepath = ROOT_DIR + "/app/conf/" + this.env + ".conf";
      contents = fs.readFileSync(filepath, "UTF-8");
      try {
        env_conf = JSON.parse(contents);
        this.config = _.extend(this.config, env_conf);
        if (this.config.debug) {
          return console.log(this.env + " config loaded");
        }
      } catch (_error) {
        e = _error;
        if (this.config.debug) {
          return console.log("error! parsing json in " + this.env + " conf");
        }
      }
    };

    App.prototype.before_ready = function() {
      return 1;
    };

    App.prototype.setup = function() {
      var key, val;
      for (key in Requires) {
        val = Requires[key];
        this[key] = val;
      }
      this.configure_app();
      this.router = new App.Router(this.app);
      this.setup_mongoose();
      this.setup_routes();
      this.listener = this.app.listen(this.config.port);
      if (this.listener) {
        if (this.config.debug) {
          console.log("Express server listening on port %d in %s mode", this.listener.address().port, this.app.settings.env);
        }
      } else {
        if (this.config.debug) {
          console.log("listener did not start");
        }
      }
      this.before_ready();
      this.is_setup = true;
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
      if ((key != null) && ((ref = this.config) != null ? ref.hasOwnProperty(key) : void 0)) {
        return this.config[key];
      } else {
        return false;
      }
    };

    App.prototype.base_url = function(uri, force_full) {
      var url;
      if (uri == null) {
        uri = "/";
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
        return (this.config.debug ? console.log("App route error, controller not found: " + controller_name) : false);
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
      this.app.configure("production", (function(_this) {
        return function() {
          _this.app.use(express.errorHandler());
          return _this.configure_for_production();
        };
      })(this));
      return this.is_configured = true;
    };

    App.prototype.always_configure = function() {
      this.app.set("views", ROOT_DIR + "/views");
      this.app.set("view engine", "jade");
      this.app.use(express.bodyParser());
      this.app.use(express.methodOverride());
      this.app.use(this.app.router);
      return this.app.use(express["static"](ROOT_DIR + "/public"));
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

  App.Schemas.Project = new Schema({
    title: {
      type: String,
      required: true
    },
    order: {
      type: Number,
      "default": 0
    },
    slug: {
      type: String,
      require: true,
      unique: true
    },
    description: {
      type: String,
      "default": ""
    },
    display_url: {
      type: String,
      "default": ""
    },
    full_url: {
      type: String,
      defalut: ""
    },
    technologies: {
      type: Schema.Types.Mixed,
      "default": []
    },
    images: {
      type: Schema.Types.Mixed,
      "default": []
    },
    archived: {
      type: Boolean,
      "default": false
    },
    group: {
      type: String,
      "default": "default"
    }
  });

  App.Models = {
    Project: Requires.mongoose.model("Project", App.Schemas.Project)
  };

  App.Router = (function() {
    Router.debug = false;

    function Router(app1, opts1) {
      this.app = app1;
      this.opts = opts1 != null ? opts1 : {};
      if (!this.app) {
        throw new Error("an app is required to create a Router");
      }
      this.routes = [];
    }

    Router.prototype.register = function(type, path, controller, method) {
      var new_route;
      if (Router.debug) {
        console.log("router: add_route " + (type.toUpperCase()) + " " + path + ", " + controller.name + "#" + method);
      }
      new_route = [type, path, controller, method];
      this.routes.push(new_route);
      this.app[type](path, (function(_this) {
        return function(req, res) {
          var c;
          c = new controller(req, res);
          if (!c["do"](method)) {
            console.error("method '" + method + "' not found for controller " + controller);
            return _this.do_404(res);
          }
        };
      })(this));
      return new_route;
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

  App.View = (function() {
    function View(data1, req1, res1, app1) {
      this.data = data1 != null ? data1 : {};
      this.req = req1;
      this.res = res1;
      this.app = app1;
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
      if (!_.isArray(needs_list)) {
        needs_list = [needs_list];
      }
      _register = (function(_this) {
        return function(method_name, needs_list) {
          return _this.requirements_list[method_name] = _this.requirements_list[method_name] != null ? _.union(_this.requirements_list[method_name], needs_list) : needs_list;
        };
      })(this);
      if (_.isObject(for_what)) {
        methods = for_what.except != null ? _.difference(this.public_methods, for_what.except) : for_what.only != null ? _.intersection(this.public_methods, for_what.only) : void 0;
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
          console.log("method not found or not public", this.name + "::" + this.requested_method);
          this.do_404();
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
      if (_.isEmpty(this.current_needs)) {
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
      if (!this.view_class) {
        return false;
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

  expect = require("expect.js");

  process = {
    env: {
      NODE_ENV: "test"
    }
  };

  app = null;

  test_app = {
    configure: function() {
      return 1;
    },
    listen: function() {
      return 0;
    },
    get: function() {
      return 1;
    },
    post: function() {
      return 1;
    }
  };

  test_mongoose = {
    connect: function() {
      return this.connected = true;
    }
  };

  Requires.mongoose = test_mongoose;

  test_config = null;

  describe("App", function() {
    before(function() {
      return app = App.init({
        app: test_app,
        mongoose: test_mongoose
      });
    });
    describe("#setup", function() {
      it("should be configured", function() {
        return expect(app.is_configured).to.equal(true);
      });
      it("should attempt to connect mongoose", function() {
        return expect(app.mongoose.connected).to.equal(true);
      });
      return it("should be set up", function() {
        return expect(app.is_setup).to.equal(true);
      });
    });
    describe("#base_url", function() {
      it("should return the root url when called with no parameters", function() {
        return expect(app.base_url(null, true)).to.equal("http://testingbaseurl.com/");
      });
      return it("should apped a URI when passed", function() {
        return expect(app.base_url("/hotsauce", true)).to.equal("http://testingbaseurl.com/hotsauce");
      });
    });
    return describe("#conf", function() {
      it("should lookup a value by key", function() {
        return expect(app.conf("meta_keywords")).to.equal("meta keywords value");
      });
      it("should return false for a key that isn't found", function() {
        return expect(app.conf("jibberjabber")).to.equal(false);
      });
      return it("should return false by default", function() {
        return expect(app.conf()).to.equal(false);
      });
    });
  });

  test_controller = null;

  test_req = {
    params: {
      key1: 1,
      key2: 2
    },
    query: {
      key1: 1,
      key2: 2
    },
    cookies: {
      key1: 1,
      key2: 2
    },
    body: {
      key1: 1,
      key2: 2
    }
  };

  test_res = {
    status: function(status1) {
      this.status = status1;
    },
    render: function(view_name1, view_data) {
      this.view_name = view_name1;
      this.view_data = view_data;
    },
    redirect: function(redirect_status, redirect_dest) {
      this.redirect_status = redirect_status;
      this.redirect_dest = redirect_dest;
    },
    json: function(json_data) {
      this.json_data = json_data;
    }
  };

  describe("App.Controller", function() {
    var check_values_in, j, len, thing;
    beforeEach(function() {
      return test_controller = new App.Controller(test_req, test_res);
    });
    describe("#set_view", function() {
      return it("sets the view", function() {
        test_controller.set_view("jibberjabber");
        return expect(test_controller.view_to_render).to.equal("jibberjabber");
      });
    });
    describe("#do_404", function() {
      before(function() {
        return test_controller.do_404();
      });
      it("sets status to 404", function() {
        return expect(test_res.status).to.equal(404);
      });
      return it("set the view to 404", function() {
        return expect(test_res.view_name).to.be("404");
      });
    });
    check_values_in = ["param", "query", "cookie", "body"];
    for (j = 0, len = check_values_in.length; j < len; j++) {
      thing = check_values_in[j];
      describe("#" + thing, function() {
        it("returns false by default", function() {
          return expect(test_controller[thing]()).to.equal(false);
        });
        it("returns false for an invalid key", function() {
          return expect(test_controller[thing]("hoozah")).to.equal(false);
        });
        return it("returns a param value by key", function() {
          return expect(test_controller[thing]("key1")).to.equal(1);
        });
      });
    }
    describe("#redirect", function() {
      it("should set the destination", function() {
        test_controller.redirect("/somewhere_else");
        return expect(test_res.redirect_dest).to.be("/somewhere_else");
      });
      it("should set the status to 302 by default", function() {
        test_controller.redirect("/blahblah");
        return expect(test_res.redirect_status).to.be(302);
      });
      return it("should set the status to anything requested", function() {
        test_controller.redirect("/blahblah", 404);
        return expect(test_res.redirect_status).to.be(404);
      });
    });
    describe("#requires", function() {
      beforeEach(function() {
        var k, len1, m, pub_methods;
        pub_methods = ["pub_method1", "pub_method2", "pub_method3"];
        for (k = 0, len1 = pub_methods.length; k < len1; k++) {
          m = pub_methods[k];
          test_controller[m] = function() {
            return 1;
          };
        }
        return test_controller.public_methods = pub_methods;
      });
      it("should have no requirements by default", function() {
        return expect(test_controller.requirements_list).to.be.empty();
      });
      it("should add requirements for 'all' by default", function() {
        var k, len1, r, ref, results;
        test_controller.requires("apples");
        ref = test_controller.requirements_list;
        results = [];
        for (k = 0, len1 = ref.length; k < len1; k++) {
          r = ref[k];
          results.push(expect(r).to.contain("apples"));
        }
        return results;
      });
      it("should add requirements for the requested method only", function() {
        test_controller.requires("apples");
        test_controller.requires("bananas", "pub_method1");
        expect(test_controller.requirements_list["pub_method1"]).to.contain("bananas");
        return expect(test_controller.requirements_list["pub_method2"]).to.not.contain("bananas");
      });
      it("should add requirements to only the methods requested", function() {
        test_controller.requires("apples");
        test_controller.requires("oranges", {
          only: ["pub_method1", "pub_method2"]
        });
        expect(test_controller.requirements_list["pub_method1"]).to.contain("oranges");
        return expect(test_controller.requirements_list["pub_method3"]).to.not.contain("oranges");
      });
      return it("should add requirements to all the methods except where requested", function() {
        test_controller.requires("apples");
        test_controller.requires("strawberries", {
          except: ["pub_method1", "pub_method2"]
        });
        expect(test_controller.requirements_list["pub_method1"]).to.not.contain("strawberries");
        return expect(test_controller.requirements_list["pub_method3"]).to.contain("strawberries");
      });
    });
    describe("#loaded", function() {
      return it("should add to loaded_items", function() {
        expect(test_controller.loaded_items).to.not.contain("onions");
        test_controller.loaded("onions");
        return expect(test_controller.loaded_items).to.contain("onions");
      });
    });
    describe("#has_needs_met", function() {
      before(function() {
        test_controller.pina_colada = function() {};
        return test_controller.load = function(load_needs) {
          this.load_needs = load_needs;
        };
      });
      it("should be ok when there are no current needs", function() {
        return expect(test_controller.has_needs_met()).to.be.ok();
      });
      return it("should set current_needs for requested method", function() {
        test_controller.requires(["pineapples", "coconuts"], "pina_colada");
        test_controller.preload("pina_colada");
        expect(test_controller.current_needs.join("")).to.be(["pineapples", "coconuts"].join(""));
        return it("should have called load with needs list", function() {
          return expect(test_controller.load_needs).to.be("pineapples coconuts");
        });
      });
    });
    describe("#preload", function() {
      before(function() {
        test_controller.load = function(what) {
          return this.loaded(what);
        };
        return test_controller.requires("watermelon", "testload");
      });
      it("should be ok if a method has no requirements", function() {
        return expect(test_controller.preload("methodwithnorequirements")).to.be.ok();
      });
      it("should load a missing requirement");
      it("should give up trying to load after timeout is reached if needs aren't met");
      return it("should be able to load multiple items");
    });
    describe("#json", function() {
      return it("should send json", function() {
        test_controller.json({
          some: "obj"
        });
        return expect(JSON.stringify(test_res.json_data)).to.be(JSON.stringify({
          some: "obj"
        }));
      });
    });
    return describe("#render", function() {
      it("should render the requested method by default", function() {
        var result;
        test_controller.requested_method = "onion_rings";
        result = test_controller.render();
        expect(result).to.be.ok();
        return expect(test_controller.view_data.view).to.be("onion_rings");
      });
      it("should render the view_to_render when set", function() {
        var result;
        test_controller.view_to_render = "pineapple_rings";
        result = test_controller.render();
        expect(result).to.be.ok();
        return expect(test_controller.view_data.view).to.be("pineapple_rings");
      });
      it("should render a requested view", function() {
        var result;
        result = test_controller.render("index");
        expect(result).to.be.ok();
        return expect(test_controller.view_data.view).to.be("index");
      });
      it("should not render when cancelled", function() {
        var result;
        test_controller.cancel_render = true;
        result = test_controller.render("index");
        return expect(result).to.be(false);
      });
      return it("should not render when there is no view class", function() {
        var result;
        test_controller.view_class = null;
        result = test_controller.render("index");
        return expect(result).to.be(false);
      });
    });
  });

  test_router = null;

  describe("App.Router", function() {
    beforeEach(function() {
      return test_router = new App.Router(test_app);
    });
    describe("#constructor", function() {
      return it("should throw an error when no app is passed", function() {
        var fn;
        fn = function() {
          return new App.Router();
        };
        return expect(fn).to.throwException(/app is required/);
      });
    });
    describe("#register", function() {
      it("should store a route when registered", function() {
        var controller, new_route;
        controller = new App.Controller();
        new_route = test_router.register("get", "/get_cake", controller, "cake");
        return expect(new_route[1]).to.eql("/get_cake");
      });
      it("should store a route as GET by default", function() {
        var controller, new_route;
        controller = new App.Controller();
        new_route = test_router.register("get", "/get_cake", controller, "cake");
        return expect(new_route[0]).to.eql("get");
      });
      return it("should store a route as POST when requested", function() {
        var controller, new_route;
        controller = new App.Controller();
        new_route = test_router.register("post", "/eat_cake", controller, "eat_cake");
        expect(new_route[0]).to.eql("post");
        return expect(new_route[1]).to.eql("/eat_cake");
      });
    });
    describe("#do_404", function() {
      return it("should set the status to 404", function() {
        var res;
        res = {
          status: function(page_status) {
            this.page_status = page_status;
            return {
              send: function() {}
            };
          }
        };
        test_router.do_404(res);
        return expect(res.page_status).to.be(404);
      });
    });
    describe("#get", function() {
      return it("should register a new route as get");
    });
    return describe("#post", function() {
      return it("should register a new route as post");
    });
  });

  test_view = null;

  describe("App.View", function() {
    beforeEach(function() {
      var req, res;
      req = {
        url: ""
      };
      res = {
        render: function(view_to_render) {
          this.view_to_render = view_to_render;
        }
      };
      app = {};
      return test_view = new App.View({}, req, res, app);
    });
    it("should autogenerate a unique id");
    it("should be able to add to js_opts");
    it("should set the view");
    it("should be able to set some data");
    it("should be able to extend existing data");
    return it("should not contain a js_block by default");
  });

}).call(this);
