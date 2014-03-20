;(function($, window, document, undefined) {
  function tile(wrapper, element, rows, cols) {
    var width = element.outerWidth();
    var height = element.outerHeight();
    var tileWidth = width / cols;
    var tileHeight = height / rows;
    var tiles = [];
    for(var i = 0;i < rows;++i)
    {
      var rowTiles = [];
      for(var j = 0;j < cols;++j)
      {
        var clone = i == 0 && j == 0 ? element : element.clone();
        var container = $.wrap(clone);
        container.css({
          width: width,
          height: height,
          display: 'inline-block'
        });
        var x = -j * tileWidth;
        var y = -i * tileHeight;
        container.vendorCss('transform', 'translate(' + x + 'px, ' + y + 'px)');
        var tile = $.wrap(container);
        tile.css({
          width: tileWidth,
          height: tileHeight,
          overflow: 'hidden',
          display: 'inline-block',
          float: 'left'
        });
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

  var animation = {
    duration: 1000,
    emptyAnimation: true,
    variables: {
      rows: 2,
      cols: 2,
      effect: 'flyOut',
      alternate: null,
      ordering: true,
      order: 'lrtb',
      cycle: null,
      adjustDuration: true
    },
    prepare: function(options) {
      var element = $(this);
      options.save = $.saveStyle(this, ['marginLeft', 'marginRight', 'marginTop', 'marginBottom', 'width', 'height']);
      element.css({
        width: element.width() + 'px',
        height: element.height() + 'px'
      });
      var wrapper = $.wrap(element);wrapper.css({
        'margin-left': element.css('margin-left'),
        'margin-right': element.css('margin-right'),
        'margin-top': element.css('margin-top'),
        'margin-bottom': element.css('margin-bottom')
      });
      element.css('margin', '0');
      var rows = validate(options.variables.rows, 1);
      var cols = validate(options.variables.cols, 1);
      var tiles = tile(wrapper, element, rows, cols);

      var subOptions = {};
      subOptions.duration = options.duration;
      subOptions.easing = options.easing;
      subOptions.delay = options.delay;
      subOptions.direction = options.direction;
      subOptions.repeat = options.repeat;
      subOptions.fillMode = options.fillMode;

      var tilesCount = rows * cols;
      var delay = subOptions.duration / tilesCount;
      var alternate = options.variables.alternate || options.variables.effect;
      var cycle = validate(options.variables.cycle, tilesCount);
      var leftToRight = true;
      var topToBottom = true;
      switch(options.variables.order)
      {
        case 'rl':
        case 'rltb':
        case 'tbrl':
          leftToRight = false;
          break;
        case 'bt':
        case 'lrbt':
        case 'btlr':
          topToBottom = false;
          break;
        case 'btrl':
        case 'rlbt':
          leftToRight = false;
          topToBottom = false;
          break;
        case 'lrtb':
        default:
          break;
      }

      if(!topToBottom)
        tiles = tiles.reverse();

      for(var i = 0;i < rows;++i)
      {
        var rowTiles = tiles[i];
        if(!leftToRight)
          rowTiles = rowTiles.reverse();
        for(var j = 0;j < cols;++j)
        {
          var cloneOptions = $.extend({}, subOptions);
          if(options.variables.ordering)
          {
            var count = (j + i * cols);
            if(parseInt(count / cycle) % 2 == 0)
              count = count % cycle;
            else
              count = cycle - (count % cycle);
            cloneOptions.delay += delay * count;
            if(options.variables.adjustDuration)
              cloneOptions.duration -= cloneOptions.delay;
          }
          if((j % 2) ^ (i % 2))
            rowTiles[j].animate(options.variables.effect, cloneOptions);
          else
            rowTiles[j].animate(alternate, cloneOptions);
        }
      }
    },
    end: function(options) {
      $.restoreStyle(this, options.save);
    }
  };

  $.animations['tile'] = animation;
})(jQuery, window, document);
