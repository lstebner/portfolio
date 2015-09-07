class Showcase
    constructor: (container, opts={}) ->
        {@projects_data} = opts
        @first_load = true
        @container = $ container
        @items = @container.find('li[data-project]')

        @setup_projects()

        @setup_events()

    setup_events: ->
        @container.on 'click', (e) =>
            $el = $(e.target)

            return if $el.is('a')

            e.preventDefault()

            if $el.is('[data-project]')
                @open_project_overlay $el.data('project')        
                
            else if $el.closest('[data-project]').length
                $el.closest('[data-project]').click()
                return false

    setup_projects: ->
        @projects = {}

        for li in @items
            $li = $ li
            @projects[$li.data('project')] = {}

        for project in @projects_data 
            if _.has @projects, project.slug
                @projects[project.slug] = project

        @setup_project_overlay_view()

    setup_project_overlay_view: ->
        @project_overlay_view = new World.ProjectOverlayView '#project-overlay', @projects

        if @first_load && window.location.hash.length > 1
            $first_load = false
            @open_project_overlay window.location.hash.replace('#', '')

    open_project_overlay: (for_project) ->
        World.event_tracker?.track_event 'user_action', 'click', 'view_project', for_project
        @project_overlay_view.open_project for_project
