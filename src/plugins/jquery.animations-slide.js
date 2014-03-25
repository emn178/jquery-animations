;(function($, window, document, undefined) {
  var keyframes = {
    from: { transform: 'translate${axis}(${distance}px)' },
    to: { transform: 'translate${axis}(0)' }
  };

  var animation = {
    duration: 1000,
    keyframes: keyframes,
    wrap: true,
    variables: {
      distance: null
    },
    prepare: function(options) {
      var element = $(this);
      options.save = $.saveStyle(this, ['marginLeft', 'marginRight', 'marginTop', 'marginBottom', 'width', 'height']);
      var w = element.outerWidth();
      var h = element.outerHeight();
      options.wrapper.css({
        'margin-left': element.css('margin-left'),
        'margin-right': element.css('margin-right'),
        'margin-top': element.css('margin-top'),
        'margin-bottom': element.css('margin-bottom'),
        'width': w + 'px',
        'height': h + 'px',
        'overflow': 'hidden'
      });
      element.css({
        width: w + 'px',
        height: h + 'px',
        margin: '0'
      });
      var variables = options.variables;
      var distance;
      if(variables.distance && $.isNumeric(variables.distance))
        distance = variables.distance;
      var direction = options.id.match(/(From|To)(.*)$/)[2].toLowerCase();
      switch(direction)
      {
        case 'up':
          variables.axis = 'Y';
          options.variables.distance = -distance || -h;
          break;
        case 'down':
          variables.axis = 'Y';
          options.variables.distance = distance || h;
          break;
        case 'left':
          variables.axis = 'X';
          options.variables.distance = -distance || -w;
          break;
        case 'right':
          variables.axis = 'X';
          options.variables.distance = distance || w;
          break;
      }
    },
    clear: function(options) {
      $.restoreStyle(this, options.save);
    }
  };

  ['slideFromUp', 'slideFromDown', 'slideFromRight', 'slideFromLeft', 
   'slideToUp', 'slideToDown', 'slideToRight', 'slideToLeft'].forEach(function(name) {
    $.animations[name] = $.extend({}, animation);
    if(name.indexOf('To') != -1)
      $.animations[name].direction = 'reverse';
  });
})(jQuery, window, document);
