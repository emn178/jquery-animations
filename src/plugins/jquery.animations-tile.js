;(function($, window, document, undefined) {
  function tile(wrapper, element, rows, cols) {
    var isImg = element[0].tagName == 'IMG';
    var tiles = [], tile, src;
    if(isImg)
      src = element.attr('src');
    for(var i = 0;i < rows;++i)
    {
      var rowTiles = [];
      for(var j = 0;j < cols;++j)
      {
        if(isImg)
          tile = $('<span></span>').css('background-image', 'url(' + src + ')');
        else
        {
          var clone = i == 0 && j == 0 ? element : element.clone();
          var container = $.wrap(clone);
          tile = $.wrap(container);
        }
        rowTiles.push(tile);
        wrapper.append(tile);
      }
      tiles.push(rowTiles);
    }
    styleTiles(element, rows, cols, tiles)
    if(wrapper.css('display') == 'inline-flex')
      wrapper.css('display', 'inline-block');
    wrapper.attr('animation-display', wrapper.css('display'));
    return tiles;
  }

  function styleTiles(element, rows, cols, tiles)
  {
    var width = element.outerWidth();
    var height = element.outerHeight();
    var tileWidth = parseInt(width / cols);
    var tileHeight = parseInt(height / rows);
    var remainWidth = width - tileWidth * cols;
    var remainHeight = height - tileHeight * rows;

    var isImg = element[0].tagName == 'IMG';
    if(isImg)
      element.hide();
    var offsetY = 0;
    for(var i = 0;i < rows;++i)
    {
      var rowTiles = tiles[i];
      var useHeight = i < remainHeight ? tileHeight + 1 : tileHeight;
      var y = -offsetY;
      offsetY += useHeight;
      var offsetX = 0;
      for(var j = 0;j < cols;++j)
      {
        var tile = rowTiles[j];
        var useWidth = j < remainWidth ? tileWidth + 1 : tileWidth;
        var x = -offsetX;
        offsetX += useWidth;
        if(isImg)
        {
          tile.css({
            width: useWidth,
            height: useHeight,
            display: 'inline-block',
            float: 'left',
            'background-position': x + 'px ' + y + 'px',
            'background-size': width + 'px ' + height + 'px'
          });
        }
        else
        {
          var container = tile.children().first();
          container.css({
            width: width,
            height: height,
            display: 'inline-block'
          });
          container.vendorCss('transform', 'translate(' + x + 'px, ' + y + 'px)');
          tile.css({
            width: useWidth,
            height: useHeight,
            overflow: 'hidden',
            display: 'inline-block',
            float: 'left'
          });
        }
      }
    }
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

  function createSequences(rows, cols, method)
  {
    if($.isArray(method))
      return method;
    return sequenceMethods[method || 'random'](rows, cols);
  }

  var sequenceMethods = {
    lr: function(rows, cols) {
      var sequences = [];
      for(var j = 0;j < cols;++j)
      {
        var step = [];
        for(var i = 0;i < rows;++i)
          step.push([i, j]);
        sequences.push(step);
      }
      return sequences;
    },
    rl: function(rows, cols) {
      return sequenceMethods.lr(rows, cols).reverse();
    },
    tb: function(rows, cols) {
      var sequences = [];
      for(var i = 0;i < rows;++i)
      {
        var step = [];
        for(var j = 0;j < cols;++j)
          step.push([i, j]);
        sequences.push(step);
      }
      return sequences;
    },
    bt: function(rows, cols) {
      return sequenceMethods.tb(rows, cols).reverse();
    },
    lrtb: function(rows, cols) {
      var sequences = [];
      for(var i = 0;i < rows;++i)
        for(var j = 0;j < cols;++j)
          sequences.push([[i, j]]);
      return sequences;
    },
    rlbt: function(rows, cols) {
      return sequenceMethods.lrtb(rows, cols).reverse();
    },
    rltb: function(rows, cols) {
      var sequences = [];
      for(var i = 0;i < rows;++i)
        for(var j = cols - 1;j >= 0;--j)
          sequences.push([[i, j]]);
      return sequences;
    },
    lrbt: function(rows, cols) {
      return sequenceMethods.rltb(rows, cols).reverse();
    },
    tblr: function(rows, cols) {
      var sequences = [];
      for(var j = 0;j < cols;++j)
        for(var i = 0;i < rows;++i)
          sequences.push([[i, j]]);
      return sequences;
    },
    btrl: function(rows, cols) {
      return sequenceMethods.tblr(rows, cols).reverse();
    },
    tbrl: function(rows, cols) {
      var sequences = [];
      for(var j = cols - 1;j >= 0;--j)
        for(var i = 0;i < rows;++i)
          sequences.push([[i, j]]);
      return sequences;
    },
    btlr: function(rows, cols) {
      return sequenceMethods.tbrl(rows, cols).reverse();
    },
    random: function(rows, cols) {
      return shuffle(sequenceMethods.lrtb(rows, cols))
    },
    randomCols: function(rows, cols) {
      return shuffle(sequenceMethods.lr(rows, cols))
    },
    randomRows: function(rows, cols) {
      return shuffle(sequenceMethods.tb(rows, cols))
    }
  };

  var animation = {
    duration: 2000,
    emptyAnimation: true,
    wrap: true,
    variables: {
      rows: 1,
      cols: 1,
      effect: 'flyOut',
      sequent: true,
      sequence: null,
      cycle: null,
      adjustDuration: true
    },
    prepare: function(options) {
      var element = $(this);
      var rows = validate(options.variables.rows, 1);
      var cols = validate(options.variables.cols, 1);
      var tiles = tile(options.wrapper, element, rows, cols);
      options.wrapper.hide();

      var subOptions = $.cloneBasicOptions(options);
      delete subOptions.effect;
      var sequences = createSequences(rows, cols, options.variables.sequence);
      var effects = options.variables.effect;
      var fail = function() {
        element.stop();
      };
      if($.isFunction(effects))
      {
        for(var i = 0;i < sequences.length;++i)
        {
          var step = sequences[i];
          for(var j = 0;j < step.length;++j)
          {
            var pair = step[j];
            var row = pair[0];
            var col = pair[1];
            var cloneOptions = $.extend({fail:fail}, subOptions);
            var effect = effects.call(this, cloneOptions, row, col);
            cloneOptions.derivative = true;
            tiles[row][col].animate(effect, cloneOptions);
          }
        }
        options.wrapper.show();
        return;
      }
      if(options.variables.adjustDuration)
        subOptions.duration /= 2;

      if(!$.isArray(effects))
        effects = [effects];
      var effectsOptions = [];
      for(var i = 0;i < effects.length;++i)
      {
        var effect = effects[i];
        if(typeof(effect) != 'object')
          effect = {effect: effect};
        effect = $.extend({fail:fail}, subOptions, effect);
        effect.derivative = true;
        effectsOptions.push(effect);
      }
      var steps = sequences.length;
      var delay = subOptions.duration / steps;
      var cycle = validate(options.variables.cycle, steps);
      for(var i = 0;i < sequences.length;++i)
      {
        var step = sequences[i];
        if(options.variables.sequent)
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
          if(options.variables.sequent)
            cloneOptions.delay += stepDelay;
          tiles[pair[0]][pair[1]].animate(effect, cloneOptions);
        }
      }
      options.wrapper.show();
      options.tiles = tiles;
    },
    resize: function(options) {
      var element = $(this);
      var rows = options.variables.rows;
      var cols = options.variables.cols;
      var width = element.width();
      var height = element.height();
      if(this.tagName != 'IMG')
        for(var i = 0;i < rows;++i)
          for(var j = 0;j < cols;++j)
            options.tiles[i][j].children().first().children().first().css({width: width, height: height});
      styleTiles(element, rows, cols, options.tiles);
    }
  };
  $.animations['tile'] = animation;
})(jQuery, window, document);
