(($, dataName)->
  default_settings =
    colnum: 2,
    itemSelector: null,
    responsive: 0,
    resize: true,
    gutter: 10,
    throttle: 5,
    isAnimated: false,
    animationOptions: {
      duration: 200,
      easing: 'linear',
      queue: false
    }

  class Flipboard
    constructor:(target, @config)->
      @config._target = target
      @config._win = $(window)
      Flipboard.stack = Flipboard.stack || {}
      target.imagesLoaded( $.proxy(activate, @) )

    reload: ->
      @config._target.imagesLoaded( $.proxy(activate, @, true) )

    destroy: ->
      c = @config
      unbindEvents.call(@)
      detach.call(@)
      c._target.removeData(dataName)

    setOption: (opt, value)->
      if typeof opt == 'string' && value
        obj = {}
        obj[ opt ] = value
        opt = obj
      if typeof opt != 'object' then return
      @config = $.extend(true, {}, @config, default_settings, opt)
      @reload()

    activate = (reload)->
      c = @config
      c._items = getItems.call(@)
      c._clones = getClones.call(@)
      if c.responsive > 0 then c.colnum = getVarColnum.call(@)
      calcColHeights.call(@)
      calcColWidths.call(@)
      attach.call(@)
      if c.resize && reload isnt true then bindEvents.call(@)

    bindEvents = ->
      self = @
      c = @config
      c._id = new Date().getTime()
      Flipboard.stack[ c._id ] = {
        elem: c._target,
        data: @
      }
      Flipboard.event = Flipboard.event || false
      if !Flipboard.event
        Flipboard.event = true
        reload = ->
          reload.i = reload.i || 0
          if reload.i++ % c.throttle then return
          for k, v of Flipboard.stack
            if !v then continue
            v.elem.trigger('resize')
        c._win.on( 'resize.flipboard', reload)
      c._target.on( 'resize.flipboard', $.proxy(@reload, @) )

    unbindEvents = ->
      c = @config
      Flipboard.stack[ c._id ] = null
      f = false
      for k, v of Flipboard.stack
        if v then f = true
      if !f
        Flipboard.event = false
        c._win.off( 'resize.flipboard' )
      c._target.off( 'resize.flipboard' )

    attach = ->
      c = @config
      c._target.css('position', 'relative')
      c._clones.each( (index)->
        colIndex = index % c.colnum
        item = $(this)
        g = if (c.colnum - 1) == colIndex then c.gutter else 0
        item.outerWidth(c._colWidths[colIndex])
      )
      c._colHeights = []
      c._clones.each( $.proxy(addHeight, @) )
      max = 0
      for i in [0...c.colnum]
        max = Math.max(max, c._colHeights[i])
      diffHeights = []
      for i in [0...c.colnum]
        diffHeights[i] = diffHeights[i] || 0
        diffHeights[i] = max - c._colHeights[i]
      colCurrentHeight = []
      len = c._items.length
      n = Math.floor(len/c.colnum)
      d = len % c.colnum
      offset = getPaddingLeftTop(c._target)

      console.log(c._colHeights)

      c._items.each( (index)->
        colIndex = index % c.colnum
        colCurrentHeight[ colIndex ] = colCurrentHeight[ colIndex ] || 0
        cn = if d > colIndex then n+1 else n
        diff = diffHeights[colIndex]/cn
        item = $(this)
        clone = c._clones.eq(index)
        left = colIndex * c.gutter
        if colIndex > 0
          for i in [0...colIndex]
            left += c._colWidths[i]
        style =
          position: 'absolute',
          top: offset.top + colCurrentHeight[ colIndex ] + 'px',
          left: offset.left + left + 'px',
          margin: 0,
          height: clone.height() + diff,
          width: clone.width()
        if c.isAnimated
          item.css('position', 'absolute')
          .stop().animate(style, c.animationOptions.duration, c.animationOptions.easing, c.animationOptions.queue)
        else
          item.css(style)
        colCurrentHeight[ colIndex ] += clone.outerHeight() + diff + c.gutter
      )
      c._target.height(max - c.gutter)
      c._clones.remove()

    detach = ->
      @config._items.css(
        width: '',
        height: '',
        position: '',
        top: '',
        left: '',
        margin: ''
      )

    calcColHeights = ->
      c = @config
      c._colHeights = []
      c._clones.each( (index)->
        colIndex = index % c.colnum
        item = $(this)
        w = c._target.width()/c.colnum - c.gutter
        if c.colnum - 1 == colIndex then w += c.gutter
        item.outerWidth( w )
      )
      c._clones.css('height', 'auto')
      c._clones.each( $.proxy(addHeight, @) )

    addHeight = (index, item)->
      c = @config
      colIndex = index % c.colnum
      c._colHeights[ colIndex ] = c._colHeights[ colIndex ] || 0
      c._colHeights[ colIndex ] += $(item).outerHeight() + c.gutter

    calcColWidths = ->
      c = @config
      totalHeight = 0
      for i in [0..(c.colnum-1)]
        totalHeight += c._colHeights[i]
      currentItemWidth = c._clones.eq(0).outerWidth()
      newHeight = totalHeight / c.colnum
      c._colWidths = []
      for i in [0...c.colnum]
        c._colWidths[i] = currentItemWidth * (c._colHeights[i]/newHeight)

    getItems = ->
      c = @config
      return if c.itemSelector then $(c.itemSelector, c._target) else c._target.children()

    getClones = ->
      c = @config
      return c._items.clone().hide().css(
        transition: 'none',
        height: 'auto'
      ).appendTo(c._target)

    getVarColnum = ->
      c = @config
      n = Math.ceil( c._target.width() / c.responsive )
      max = c._items.length
      return Math.min(n, max)

    getPaddingLeftTop = (item)->
      top = item.css('padding-top')
      if typeof top == 'string'
        top = if top.indexOf('px') == -1 then 0 else top.replace('px','') - 0
      left = item.css('padding-left')
      if typeof left == 'string'
        left = if left.indexOf('px') == -1 then 0 else left.replace('px','') - 0
      return {
        top: top,
        left: left
      }

  $.fn.flipboard = (opt)->
    args = Array.prototype.slice.call(arguments)
    if args.length > 1 then args = Array.prototype.slice.call(arguments, 1)
    return this.each((n)->
      $this = $(this)
      obj = $this.data(dataName)
      if !obj && typeof opt != 'string'
        if typeof opt != 'object' then opt = {}
        $this.data(dataName, new Flipboard($this, $.extend(true, {}, default_settings, opt) ) )
      else if !obj
        return false
      else if opt == 'reload'
        obj.reload(true)
      else if opt == 'destroy'
        obj.destroy()
        obj = null
      else if opt == 'option'
        obj.setOption.apply(obj, args)
    )
)(jQuery, 'jquery-plugin-flipboard')