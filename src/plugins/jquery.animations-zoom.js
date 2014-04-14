;(function($, window, document, undefined) {
  var keyframes = {
    from: { 
      'transform-origin': '${startOrigin}'
    },
    to: { 
      transform: 'scale(${x},${y})',
      'transform-origin': '${endOrigin}'
    }
  };

  var baseAnimation = {
    duration: 1000,
    keyframes: keyframes
  };

  (function() {
    var animation = $.extend({
      variables: {
        startOrigin: '50% 50% 0',
        endOrigin: '50% 50% 0'
      },
      prepare: function(options) {
        options.variables.x = 0;
        options.variables.y = 0;
      }
    }, baseAnimation);
    $.animations['zoomAway'] = animation;
    $.animations['zoomNear'] = $.extend({direction: 'reverse'}, animation);
  }());

  (function() {
    var animation = $.extend({
      variables: {
        scale: 1.2,
        startOrigin: '50% 50% 0',
        endOrigin: '50% 50% 0'
      },
      prepare: function(options) {
        options.variables.x = options.variables.scale;
        options.variables.y = options.variables.scale;
      }
    }, baseAnimation);
    $.animations['zoomIn'] = animation;
    $.animations['zoomOut'] = $.extend({direction: 'reverse'}, animation);
  }());

  (function() {
    var animation = $.extend({
      variables: {
        x: 1,
        y: 1,
        startOrigin: '50% 50% 0',
        endOrigin: '50% 50% 0'
      }
    }, baseAnimation);
    $.animations['scaleTo'] = animation;
    $.animations['scaleFrom'] = $.extend({direction: 'reverse'}, animation);
  }());
})(jQuery, window, document);
