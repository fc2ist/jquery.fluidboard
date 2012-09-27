(($, dataName)->
  defaults =
    colnum: 2,
    itemSelector: null,
    responsive: 0,
    fluid: true,
    gutter: 10

  class Flipboard
    constructor:(target, @config)->
      @config._target = target
      @config._win = $(window)
      activate.apply(@)

    reload: ->
      activate.apply(@, [true])

    destroy: ->
      c = @config
      unbindEvents.apply(@)
      detach.apply(@)
      c._target.removeData(dataName)

    setOption: (opt, value)->
      if typeof opt == 'string' && value?
        obj = {}
        obj[ opt ] = value
        opt = obj
      if typeof opt != 'object' then return
      @config = $.extend(defaults, opt)

    activate = (reload)->
      c = @config
      c._items = getItems.apply(@)
      if c.responsive > 0 then c.colnum = getVarColnum.apply(@)
      calcColHeights.apply(@)
      calcColWidths.apply(@)
      attach.apply(@)
      if c.fluid && !reload then bindEvents.apply(@)

    bindEvents = ->
      c = @config
      c._win.on( 'resize.flipboard', $.proxy(@reload, @) )

    unbindEvents = ->
      c = @config
      c._win.off( 'resize.flipboard', @reload )

    attach = ->
      c = @config
      c._target.css('position', 'relative')
      c._items.each( (index)->
        colIndex = index % c.colnum
        item = $(this)
        g = if (c.colnum - 1) == colIndex then c.gutter else 0
        item.outerWidth( c._colWidths[colIndex] + g)
      )
      c._colHeights = []
      c._items.each( $.proxy(addHeight, @) )
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
      c._items.each( (index)->
        colIndex = index % c.colnum
        colCurrentHeight[ colIndex ] = colCurrentHeight[ colIndex ] || 0
        item = $(this)
        left = colIndex * c.gutter
        if colIndex > 0
          for i in [0...colIndex]
            left += c._colWidths[i]
        item.css(
          position: 'absolute',
          top: offset.top + colCurrentHeight[ colIndex ] + 'px',
          left: offset.left + left + 'px',
          margin: 0
        )
        cn = if d > colIndex then n+1 else n
        newHeight = item.outerHeight() + diffHeights[colIndex]/cn
        item.outerHeight( newHeight  )
        colCurrentHeight[ colIndex ] += newHeight + c.gutter
      )

    detach = ->
      c = @config
      c._items.css('position', '')
      c._items.css(
        width: '',
        position: '',
        top: '',
        left: '',
        margin: ''
      )

    calcColHeights = ->
      c = @config
      c._colHeights = []
      c._items.each( (index)->
        colIndex = index % c.colnum
        item = $(this)
        w = c._target.width()/c.colnum - c.gutter
        if c.colnum - 1 == colIndex then w += c.gutter
        item.outerWidth( w )
      )
      c._items.css('height', 'auto')
      c._items.each( $.proxy(addHeight, @) )

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
      currentItemWidth = c._items.eq(0).outerWidth()
      newHeight = totalHeight / c.colnum
      c._colWidths = []
      for i in [0..(c.colnum-1)]
        c._colWidths[i] = currentItemWidth * (c._colHeights[i]/newHeight)

    getItems = ->
      c = @config
      return if c.itemSelector then $(c.itemSelector, c._target) else c._target.children()

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
    return this.each((n)->
      $this = $(this)
      obj = $this.data(dataName)
      if !obj
        if typeof opt != 'object' then opt = {}
        $this.data(dataName, new Flipboard($this, $.extend(defaults, opt) ) )
      else if opt == 'reload'
        obj.reload()
      else if opt == 'destroy'
        obj.destroy()
        obj = null
    )
)(jQuery, 'jquery-plugin-flipboard')