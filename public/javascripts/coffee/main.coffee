# @codekit-prepend "EventTracker.coffee";
# @codekit-prepend "Project.coffee";
# @codekit-prepend "Showcase.coffee";

$ ->
    overlay = $(".overlay").hide()

    World.showcase = new Showcase "#showcase"
