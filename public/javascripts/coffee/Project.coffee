class Project
    constructor: (data={}) ->
        @set_data data

    set_data: (data={}) ->
        @data = _.extend
            title: ''
            description: ''
            images: []
            display_url: ''
            full_url: ''
        , data


class ProjectOverlayView
    constructor: (container, @projects=[]) ->
        @container = $ container
        @overlay = $('#master-overlay').hide()
        @current_project = 0
        @current_image_idx = 0
        @open = false
        @template = _.template $('#project-overlay-template').html()

        @setup_events()

    setup_events: ->
        @overlay.on 'click', (e) =>
            @hide()

        @container.on 'click', (e) =>
            $el = $(e.target)

            if $el.is 'span'
                $el.parent().trigger('click')
                return false

            if _.indexOf(['next_image', 'prev_image', 'hide'], $el.data('action')) > -1
                e.preventDefault()

            switch $el.data 'action'
                when 'hide' then @hide()
                when 'next_image' then @cycle_images 1
                when 'prev_image' then @cycle_images -1

    cycle_images: (dir=1) ->
        return @current_image_idx = 0 unless @project

        next_idx = @current_image_idx + dir
        if next_idx > @project.images.length - 1
            next_idx = next_idx % @project.images.length
        else if next_idx < 0
            next_idx += @project.images.length

        @current_image_idx = next_idx

        $viewed = @images_container.find('.viewing').removeClass('viewing')
        if dir > 0
            $viewed.addClass('viewed')
        $viewing = $(@images_container.find('img')[@current_image_idx]).removeClass('viewed').addClass('viewing')
        if $viewing.height() < 1
            $viewing.load =>
                @container.find('.images-column').height $viewing.height() + 2
        else
            @container.find('.images-column').height $viewing.height() + 2

        @current_image_idx

    open_project: (index=0) ->
        return false unless _.has @projects, index

        @current_project = index
        @project = @projects[index]
        window.location.hash = @project.slug
        @current_image_idx = 0
        @render()
        @setup_paddles()
        @cycle_images(0)
        @show()

    setup_paddles: ->
        return unless @project

        @paddles.filter('.next').children('a').data('action', 'next_image')#prop('data-action', 'next_image')
        @paddles.filter('.prev').children('a').data('action', 'prev_image')#prop('data-action', 'prev_image')

        if @project.images.length < 2
            @paddles.hide()
        else
            @paddles.show()

    show: ->
        return if @open

        @open = true
        @overlay.fadeIn()
        @container.fadeIn()

    hide: ->
        return if !@open

        @open = false
        window.location.hash = ""
        @container.fadeOut()
        @overlay.fadeOut()

    render: ->
        return unless @template

        @container.empty()
        @container.html @template { project: @project }
        @images_container = @container.find('.images-container')
        @paddles = @container.find('.paddle')





