;(function($, window, document, undefined) {
  var keyframes = {
    from: { transform: 'translate${axis}(${distance}px)' },
    to: { transform: 'translate${axis}(0)' }
  };

  function setVariables(options, element, distance)
  {
    var w = element.outerWidth();
    var h = element.outerHeight();
    switch(options.variables.direction)
    {
      case 'up':
        options.variables.axis = 'Y';
        options.variables.distance = -distance || -h;
        break;
      case 'down':
        options.variables.axis = 'Y';
        options.variables.distance = distance || h;
        break;
      case 'left':
        options.variables.axis = 'X';
        options.variables.distance = -distance || -w;
        break;
      case 'right':
        options.variables.axis = 'X';
        options.variables.distance = distance || w;
        break;
    }
  }

  var animation = {
    duration: 1000,
    keyframes: keyframes,
    wrap: true,
    variables: {
      distance: null
    },
    prepare: function(options) {
      var variables = options.variables;
      var distance;
      if(variables.distance && $.isNumeric(variables.distance))
        distance = variables.distance;
      else
        options.auto = true;
      options.variables.direction = options.id.match(/(From|To)(.*)$/)[2].toLowerCase();

      setVariables(options, $(this), distance);
      options.wrapper.css('overflow', 'hidden');
    },
    resize: function(options) {
      if(!options.auto || options.remainingRepeat == 1)
        return;
      setVariables(options, $(this), 0);
    }
  };

  ['slideFromUp', 'slideFromDown', 'slideFromRight', 'slideFromLeft', 
   'slideToUp', 'slideToDown', 'slideToRight', 'slideToLeft'].forEach(function(name) {
    $.animations[name] = $.extend({}, animation);
    if(name.indexOf('To') != -1)
      $.animations[name].direction = 'reverse';
  });
})(jQuery, window, document);
