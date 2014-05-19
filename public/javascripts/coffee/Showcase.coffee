class Showcase
    constructor: (container, opts={}) ->
        @container = $ container
        @items = @container.find('li[data-project]')

        @fetch_projects()

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

    fetch_projects: ->
        @projects = {}

        for li in @items
            $li = $ li
            @projects[$li.data('project')] = {}

        $.ajax
            type: 'GET'
            url: '/get_projects'
            dataType: 'json'
            success: (msg) =>
                console.log 'got projects', msg
                for project in msg
                    if _.has @projects, project.slug
                        @projects[project.slug] = project

                @setup_project_overlay_view()

    setup_project_overlay_view: ->
        @project_overlay_view = new ProjectOverlayView '#project-overlay', @projects

    open_project_overlay: (for_project) ->
        @project_overlay_view.open_project for_project
