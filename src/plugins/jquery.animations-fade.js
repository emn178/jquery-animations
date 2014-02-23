;(function($, window, document, undefined) {
  var keyframes = {
    from: {
      opacity: 0
    },
    to: {
      opacity: 1
    }
  };

  var animation = {
    duration: 1000,
    keyframes: keyframes
  };

  $.animations['fadeIn'] = animation;
  $.animations['fadeOut'] = $.extend({
    direction: 'reverse'
  }, animation);
})(jQuery, window, document);
