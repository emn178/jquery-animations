;(function($, window, document, undefined) {
  $.defineAnimation('fadeIn', {
    from: { opacity: 0 },
    to: { opacity: 1 }
  });

  var animation = {
    name: 'fadeIn',
    duration: 1000,
    easing: 'linear'
  };

  $.animations['fadeIn'] = animation;
  $.animations['fadeOut'] = $.extend({
    direction: 'reverse'
  }, animation);
})(jQuery, window, document);
