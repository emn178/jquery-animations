;(function($, window, document, undefined) {
  var keyframes = {
    from: { transform: 'translate${axis}(${distance}px)' },
    to: { transform: 'translate${axis}(0)' }
  };

  var animation = {
    duration: 1000,
    keyframes: keyframes,
    variables: {
      distance: null
    },
    start: function(options) {
      var element = $(this);
      var wrapper = $.wrap(element, $('<span></span>'));
      wrapper.css('overflow', 'hidden');
      var w = element.width();
      var h = element.height();
      wrapper.width(w);
      wrapper.height(h);
      var variables = options.variables;
      var distance;
      if(variables.distance && $.isNumeric(variables.distance))
        distance = variables.distance;
      var direction = options.id.match(/(From|To)(.*)$/)[2].toLowerCase();
      switch(direction)
      {
        case 'up':
          variables.axis = 'Y';
          options.variables.distance = distance || -h;
          break;
        case 'down':
          variables.axis = 'Y';
          options.variables.distance = distance || h;
          break;
        case 'left':
          variables.axis = 'X';
          options.variables.distance = distance || -w;
          break;
        case 'right':
          variables.axis = 'X';
          options.variables.distance = distance || w;
          break;
      }
    }
  };

  ['slideFromUp', 'slideFromDown', 'slideFromRight', 'slideFromLeft', 
   'slideToUp', 'slideToDown', 'slideToRight', 'slideToLeft'].forEach(function(name) {
    $.animations[name] = $.extend({}, animation);
    if(name.indexOf('To') != -1)
      $.animations[name].direction = 'reverse';
  });
})(jQuery, window, document);
