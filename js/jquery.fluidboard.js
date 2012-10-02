/*! jQuery Fluid Board - v1.0.0 - 2012-10-02
* Copyright (c) 2012 moi; Licensed MIT */


(function($, dataName) {
  var Fluidboard, default_settings;
  default_settings = {
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
  };
  Fluidboard = (function() {
    var activate, addHeight, attach, bindEvents, calcColHeights, calcColWidths, detach, getClones, getItems, getPaddingLeftTop, getVarColnum, unbindEvents;

    function Fluidboard(target, config) {
      this.config = config;
      this.config._target = target;
      this.config._win = $(window);
      Fluidboard.stack = Fluidboard.stack || {};
      target.imagesLoaded($.proxy(activate, this));
    }

    Fluidboard.prototype.reload = function() {
      return this.config._target.imagesLoaded($.proxy(activate, this, true));
    };

    Fluidboard.prototype.destroy = function() {
      var c;
      c = this.config;
      unbindEvents.call(this);
      detach.call(this);
      return c._target.removeData(dataName);
    };

    Fluidboard.prototype.setOption = function(opt, value) {
      var obj;
      if (typeof opt === 'string' && value) {
        obj = {};
        obj[opt] = value;
        opt = obj;
      }
      if (typeof opt !== 'object') {
        return;
      }
      this.config = $.extend(true, {}, this.config, default_settings, opt);
      return this.reload();
    };

    activate = function(reload) {
      var c;
      c = this.config;
      c._items = getItems.call(this);
      c._clones = getClones.call(this);
      if (c.responsive > 0) {
        c.colnum = getVarColnum.call(this);
      }
      calcColHeights.call(this);
      calcColWidths.call(this);
      attach.call(this);
      if (c.resize && reload !== true) {
        return bindEvents.call(this);
      }
    };

    bindEvents = function() {
      var c, reload, self;
      self = this;
      c = this.config;
      c._id = new Date().getTime();
      Fluidboard.stack[c._id] = {
        elem: c._target,
        data: this
      };
      Fluidboard.event = Fluidboard.event || false;
      if (!Fluidboard.event) {
        Fluidboard.event = true;
        reload = function() {
          var k, v, _ref, _results;
          reload.i = reload.i || 0;
          if (reload.i++ % c.throttle) {
            return;
          }
          _ref = Fluidboard.stack;
          _results = [];
          for (k in _ref) {
            v = _ref[k];
            if (!v) {
              continue;
            }
            _results.push(v.elem.trigger('resize'));
          }
          return _results;
        };
        c._win.on('resize.fluidboard', reload);
      }
      return c._target.on('resize.fluidboard', $.proxy(this.reload, this));
    };

    unbindEvents = function() {
      var c, f, k, v, _ref;
      c = this.config;
      Fluidboard.stack[c._id] = null;
      f = false;
      _ref = Fluidboard.stack;
      for (k in _ref) {
        v = _ref[k];
        if (v) {
          f = true;
        }
      }
      if (!f) {
        Fluidboard.event = false;
        c._win.off('resize.fluidboard');
      }
      return c._target.off('resize.fluidboard');
    };

    attach = function() {
      var c, colCurrentHeight, d, diffHeights, i, len, max, n, offset, _i, _j, _ref, _ref1;
      c = this.config;
      c._target.css('position', 'relative');
      c._clones.each(function(index) {
        var colIndex, g, item;
        colIndex = index % c.colnum;
        item = $(this);
        g = (c.colnum - 1) === colIndex ? c.gutter : 0;
        return item.outerWidth(c._colWidths[colIndex]);
      });
      c._colHeights = [];
      c._clones.each($.proxy(addHeight, this));
      max = 0;
      for (i = _i = 0, _ref = c.colnum; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        max = Math.max(max, c._colHeights[i]);
      }
      diffHeights = [];
      for (i = _j = 0, _ref1 = c.colnum; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; i = 0 <= _ref1 ? ++_j : --_j) {
        diffHeights[i] = diffHeights[i] || 0;
        diffHeights[i] = max - c._colHeights[i];
      }
      colCurrentHeight = [];
      len = c._items.length;
      n = Math.floor(len / c.colnum);
      d = len % c.colnum;
      offset = getPaddingLeftTop(c._target);
      c._items.each(function(index) {
        var clone, cn, colIndex, diff, item, left, style, _k;
        colIndex = index % c.colnum;
        colCurrentHeight[colIndex] = colCurrentHeight[colIndex] || 0;
        cn = d > colIndex ? n + 1 : n;
        diff = diffHeights[colIndex] / cn;
        item = $(this);
        clone = c._clones.eq(index);
        left = colIndex * c.gutter;
        if (colIndex > 0) {
          for (i = _k = 0; 0 <= colIndex ? _k < colIndex : _k > colIndex; i = 0 <= colIndex ? ++_k : --_k) {
            left += c._colWidths[i];
          }
        }
        style = {
          position: 'absolute',
          top: offset.top + colCurrentHeight[colIndex] + 'px',
          left: offset.left + left + 'px',
          margin: 0,
          height: clone.height() + diff,
          width: clone.width()
        };
        if (c.isAnimated) {
          item.css('position', 'absolute').stop().animate(style, c.animationOptions.duration, c.animationOptions.easing, c.animationOptions.queue);
        } else {
          item.css(style);
        }
        return colCurrentHeight[colIndex] += clone.outerHeight() + diff + c.gutter;
      });
      c._target.height(max - c.gutter);
      return c._clones.remove();
    };

    detach = function() {
      return this.config._items.css({
        width: '',
        height: '',
        position: '',
        top: '',
        left: '',
        margin: ''
      });
    };

    calcColHeights = function() {
      var c;
      c = this.config;
      c._colHeights = [];
      c._clones.each(function(index) {
        var colIndex, item, w;
        colIndex = index % c.colnum;
        item = $(this);
        w = c._target.width() / c.colnum - c.gutter;
        if (c.colnum - 1 === colIndex) {
          w += c.gutter;
        }
        return item.outerWidth(w);
      });
      c._clones.css('height', 'auto');
      return c._clones.each($.proxy(addHeight, this));
    };

    addHeight = function(index, item) {
      var c, colIndex;
      c = this.config;
      colIndex = index % c.colnum;
      c._colHeights[colIndex] = c._colHeights[colIndex] || 0;
      return c._colHeights[colIndex] += $(item).outerHeight() + c.gutter;
    };

    calcColWidths = function() {
      var c, currentItemWidth, i, newHeight, totalHeight, _i, _j, _ref, _ref1, _results;
      c = this.config;
      totalHeight = 0;
      for (i = _i = 0, _ref = c.colnum - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        totalHeight += c._colHeights[i];
      }
      currentItemWidth = c._clones.eq(0).outerWidth();
      newHeight = totalHeight / c.colnum;
      c._colWidths = [];
      _results = [];
      for (i = _j = 0, _ref1 = c.colnum; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; i = 0 <= _ref1 ? ++_j : --_j) {
        _results.push(c._colWidths[i] = currentItemWidth * (c._colHeights[i] / newHeight));
      }
      return _results;
    };

    getItems = function() {
      var c;
      c = this.config;
      if (c.itemSelector) {
        return $(c.itemSelector, c._target);
      } else {
        return c._target.children();
      }
    };

    getClones = function() {
      var c;
      c = this.config;
      return c._items.clone().hide().css({
        transition: 'none',
        height: 'auto'
      }).appendTo(c._target);
    };

    getVarColnum = function() {
      var c, max, n;
      c = this.config;
      n = Math.ceil(c._target.width() / c.responsive);
      max = c._items.length;
      return Math.min(n, max);
    };

    getPaddingLeftTop = function(item) {
      var left, top;
      top = item.css('padding-top');
      if (typeof top === 'string') {
        top = top.indexOf('px') === -1 ? 0 : top.replace('px', '') - 0;
      }
      left = item.css('padding-left');
      if (typeof left === 'string') {
        left = left.indexOf('px') === -1 ? 0 : left.replace('px', '') - 0;
      }
      return {
        top: top,
        left: left
      };
    };

    return Fluidboard;

  })();
  return $.fn.fluidboard = function(opt) {
    var args;
    args = Array.prototype.slice.call(arguments);
    if (args.length > 1) {
      args = Array.prototype.slice.call(arguments, 1);
    }
    return this.each(function(n) {
      var $this, obj;
      $this = $(this);
      obj = $this.data(dataName);
      if (!obj && typeof opt !== 'string') {
        if (typeof opt !== 'object') {
          opt = {};
        }
        return $this.data(dataName, new Fluidboard($this, $.extend(true, {}, default_settings, opt)));
      } else if (!obj) {
        return false;
      } else if (opt === 'reload') {
        return obj.reload(true);
      } else if (opt === 'destroy') {
        obj.destroy();
        return obj = null;
      } else if (opt === 'option') {
        return obj.setOption.apply(obj, args);
      }
    });
  };
})(jQuery, 'jquery-plugin-fluidboard');

/*!
 * jQuery imagesLoaded plugin v2.0.1
 * http://github.com/desandro/imagesloaded
 *
 * MIT License. by Paul Irish et al.
 */
(function(c,n){var k="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";c.fn.imagesLoaded=function(l){function m(){var b=c(h),a=c(g);d&&(g.length?d.reject(e,b,a):d.resolve(e));c.isFunction(l)&&l.call(f,e,b,a)}function i(b,a){b.src===k||-1!==c.inArray(b,j)||(j.push(b),a?g.push(b):h.push(b),c.data(b,"imagesLoaded",{isBroken:a,src:b.src}),o&&d.notifyWith(c(b),[a,e,c(h),c(g)]),e.length===j.length&&(setTimeout(m),e.unbind(".imagesLoaded")))}var f=this,d=c.isFunction(c.Deferred)?c.Deferred():
0,o=c.isFunction(d.notify),e=f.find("img").add(f.filter("img")),j=[],h=[],g=[];e.length?e.bind("load.imagesLoaded error.imagesLoaded",function(b){i(b.target,"error"===b.type)}).each(function(b,a){var e=a.src,d=c.data(a,"imagesLoaded");if(d&&d.src===e)i(a,d.isBroken);else if(a.complete&&a.naturalWidth!==n)i(a,0===a.naturalWidth||0===a.naturalHeight);else if(a.readyState||a.complete)a.src=k,a.src=e}):m();return d?d.promise(f):f}})(jQuery);