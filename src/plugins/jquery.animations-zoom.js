;(function($, window, document, undefined) {
  var keyframes = {
    to: { transform: 'scale(${x},${y})' }
  };

  var baseAnimation = {
    duration: 1000,
    keyframes: keyframes
  };

  (function() {
    var animation = $.extend({
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
        scale: 1.2
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
        y: 1
      }
    }, baseAnimation);
    $.animations['scaleTo'] = animation;
    $.animations['scaleFrom'] = $.extend({direction: 'reverse'}, animation);
  }());
})(jQuery, window, document);
