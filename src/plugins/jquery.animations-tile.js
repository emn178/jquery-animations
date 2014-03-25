;(function($, window, document, undefined) {
  function tile(wrapper, element, rows, cols) {
    var width = element.outerWidth();
    var height = element.outerHeight();
    var tileWidth = Math.round(width / cols);
    var tileHeight = Math.round(height / rows);
    var lastTileWidth = width - tileWidth * (cols - 1);
    var lastTileHeight = height - tileHeight * (rows - 1);
    var tiles = [];
    var isImg = element[0].tagName == 'IMG';
    if(isImg)
    {
      var src = element.attr('src');
      element.hide();
    }
    for(var i = 0;i < rows;++i)
    {
      var rowTiles = [];
      var useHeight = i == rows - 1 ? lastTileHeight : tileHeight;
      var y = -i * tileHeight;
      for(var j = 0;j < cols;++j)
      {
        var useWidth = j == cols - 1 ? lastTileWidth : tileWidth;
        var x = -j * tileWidth;
        if(isImg)
        {
          var tile = $('<span></span>');
          tile.css({
            width: useWidth,
            height: useHeight,
            display: 'inline-block',
            float: 'left',
            'background-position': x + 'px ' + y + 'px',
            'background-image': 'url(' + src + ')'
          });
        }
        else
        {
          var clone = i == 0 && j == 0 ? element : element.clone();
          var container = $.wrap(clone);
          container.css({
            width: width,
            height: height,
            display: 'inline-block'
          });
          container.vendorCss('transform', 'translate(' + x + 'px, ' + y + 'px)');
          var tile = $.wrap(container);
          tile.css({
            width: useWidth,
            height: useHeight,
            overflow: 'hidden',
            display: 'inline-block',
            float: 'left'
          });
        }
        
        rowTiles.push(tile);
        wrapper.append(tile);
      }
      tiles.push(rowTiles);
    }
    var display = wrapper.css('display') == 'block' ? 'block' : 'inline-block';
    wrapper.css({
      width: width,
      height: height,
      display: display
    });
    return tiles;
  }

  function validate(variable, defaultValue)
  {
    if(variable && $.isNumeric(variable) && variable > 0)
      return variable;
    return defaultValue;
  }

  function shuffle(array)
  {
    for(var i = 0;i < array.length;++i)
    {
      var r = parseInt(Math.random() * array.length);
      var tmp = array[i];
      array[i] = array[r];
      array[r] = tmp;
    }
    return array;
  }

  function createOrders(rows, cols, method)
  {
    if($.isArray(method))
      return method;
    if(!orderMethods[method])
      method = methodNames[parseInt(Math.random() * methodNames.length)];
    return orderMethods[method](rows, cols);
  }

  var orderMethods = {
    lr: function(rows, cols) {
      var orders = [];
      for(var j = 0;j < cols;++j)
      {
        var step = [];
        for(var i = 0;i < rows;++i)
          step.push([i, j]);
        orders.push(step);
      }
      return orders;
    },
    rl: function(rows, cols) {
      return orderMethods.lr(rows, cols).reverse();
    },
    tb: function(rows, cols) {
      var orders = [];
      for(var i = 0;i < rows;++i)
      {
        var step = [];
        for(var j = 0;j < cols;++j)
          step.push([i, j]);
        orders.push(step);
      }
      return orders;
    },
    bt: function(rows, cols) {
      return orderMethods.tb(rows, cols).reverse();
    },
    lrtb: function(rows, cols) {
      var orders = [];
      for(var i = 0;i < rows;++i)
        for(var j = 0;j < cols;++j)
          orders.push([[i, j]]);
      return orders;
    },
    rlbt: function(rows, cols) {
      return orderMethods.lrtb(rows, cols).reverse();
    },
    rltb: function(rows, cols) {
      var orders = [];
      for(var i = 0;i < rows;++i)
        for(var j = cols - 1;j >= 0;--j)
          orders.push([[i, j]]);
      return orders;
    },
    lrbt: function(rows, cols) {
      return orderMethods.rltb(rows, cols).reverse();
    },
    tblr: function(rows, cols) {
      var orders = [];
      for(var j = 0;j < cols;++j)
        for(var i = 0;i < rows;++i)
          orders.push([[i, j]]);
      return orders;
    },
    btrl: function(rows, cols) {
      return orderMethods.tblr(rows, cols).reverse();
    },
    tbrl: function(rows, cols) {
      var orders = [];
      for(var j = cols - 1;j >= 0;--j)
        for(var i = 0;i < rows;++i)
          orders.push([[i, j]]);
      return orders;
    },
    btlr: function(rows, cols) {
      return orderMethods.tbrl(rows, cols).reverse();
    },
    random: function(rows, cols) {
      return shuffle(orderMethods.lrtb(rows, cols))
    },
    randomCols: function(rows, cols) {
      return shuffle(orderMethods.lr(rows, cols))
    },
    randomRows: function(rows, cols) {
      return shuffle(orderMethods.tb(rows, cols))
    }
  };
  var methodNames = [];
  for(var key in orderMethods)
    methodNames.push(key);

  var animation = {
    duration: 1000,
    emptyAnimation: true,
    wrap: true,
    variables: {
      rows: 1,
      cols: 1,
      effect: 'flyOut',
      ordering: true,
      order: null,
      cycle: null,
      adjustDuration: true
    },
    prepare: function(options) {
      var element = $(this);
      options.save = $.saveStyle(this, ['marginLeft', 'marginRight', 'marginTop', 'marginBottom', 'width', 'height', 'display']);
      options.wrapper.css({
        'margin-left': element.css('margin-left'),
        'margin-right': element.css('margin-right'),
        'margin-top': element.css('margin-top'),
        'margin-bottom': element.css('margin-bottom')
      });
      element.css({
        width: element.outerWidth() + 'px',
        height: element.outerHeight() + 'px',
        margin: '0'
      });
      var rows = validate(options.variables.rows, 1);
      var cols = validate(options.variables.cols, 1);
      var tiles = tile(options.wrapper, element, rows, cols);

      var subOptions = {};
      subOptions.duration = options.duration;
      subOptions.easing = options.easing;
      subOptions.delay = options.delay;
      subOptions.direction = options.direction;
      subOptions.repeat = options.repeat;
      subOptions.fillMode = options.fillMode;
      subOptions.timeout = options.timeout;

      var orders = createOrders(rows, cols, options.variables.order);
      var effects = options.variables.effect;
      if($.isFunction(effects))
      {
        for(var i = 0;i < orders.length;++i)
        {
          var step = orders[i];
          for(var j = 0;j < step.length;++j)
          {
            var pair = step[j];
            var row = pair[0];
            var col = pair[1];
            var cloneOptions = $.extend({}, subOptions);
            var effect = effects.call(this, cloneOptions, row, col);
            cloneOptions.noClear = true;
            tiles[row][col].animate(effect, cloneOptions);
          }
        }
        return;
      }

      if(!$.isArray(effects))
        effects = [effects];
      var effectsOptions = [];
      for(var i = 0;i < effects.length;++i)
      {
        var effect = effects[i];
        if(typeof(effect) != 'object')
          effect = {effect: effect};
        effect = $.extend({}, subOptions, effect);
        effect.noClear = true;
        effectsOptions.push(effect);
      }
      var steps = orders.length;
      var delay = subOptions.duration / steps;
      var cycle = validate(options.variables.cycle, steps);
      for(var i = 0;i < orders.length;++i)
      {
        var step = orders[i];
        if(options.variables.ordering)
        {
          var count = i;
          if(parseInt(count / cycle) % 2 == 0)
            count = count % cycle;
          else
            count = cycle - (count % cycle);
          var stepDelay = delay * count;
        }
        for(var j = 0;j < step.length;++j)
        {
          var pair = step[j];
          var n = i * step.length + j;
          var effectOptions = effectsOptions[n % effectsOptions.length];
          var cloneOptions = $.extend({}, effectOptions);
          var effect = cloneOptions.effect;
          delete cloneOptions.effect;
          if(options.variables.ordering)
          {
            cloneOptions.delay += stepDelay;
            if(options.variables.adjustDuration)
              cloneOptions.duration -= cloneOptions.delay;
          }
          tiles[pair[0]][pair[1]].animate(effect, cloneOptions);
        }
      }
    },
    clear: function(options) {
      $.restoreStyle(this, options.save);
    }
  };

  $.animations['tile'] = animation;
})(jQuery, window, document);
