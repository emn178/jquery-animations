;(function($, window, document, undefined) {
  var keyframes = {
    from: { transform: 'translate(${x}px,${y}px)' },
    to: { transform: 'translate(0)' }
  };

  var animation = {
    duration: 1000,
    keyframes: keyframes,
    variables: {
      distance: null
    },
    start: function(options) {
      var variables = options.variables;
      var distance;
      if(variables.distance && $.isNumeric(variables.distance))
        distance = variables.distance;
      if(options.id == 'flyIn' || options.id == 'flyOut')
      {
        distance = distance || Math.max($(document).height(), $(document).width());
        variables.x = parseInt(Math.random() * 2 * distance - distance);
        variables.y = (distance - Math.abs(variables.x)) * (Math.random() > 0.5 ? 1 : -1);
        return;
      }

      var direction = options.id.match(/(From|To)(.*)$/)[2].toLowerCase();
      variables.x = 0;
      variables.y = 0;
      switch(direction)
      {
        case 'up':
          variables.y = distance || -$(document).height();
          break;
        case 'down':
          variables.y = distance || $(document).height();
          break;
        case 'left':
          variables.x = distance || -$(document).width();
          break;
        case 'right':
          variables.x = distance || $(document).width();
          break;
      }
    }
  };

  ['flyFromUp', 'flyFromDown', 'flyFromRight', 'flyFromLeft', 
   'flyToUp', 'flyToDown', 'flyToRight', 'flyToLeft', 'flyIn', 'flyOut'].forEach(function(name) {
    $.animations[name] = $.extend({}, animation);
    if(name.indexOf('To') != -1 || name == 'flyOut')
      $.animations[name].direction = 'reverse';
  });
})(jQuery, window, document);
