;(function($, window, document, undefined) {
  var keyframes = {
    up: {
      from: { transform: 'translateY(-${distance}px)' },
      to: { transform: 'translateY(0)' }
    },
    down: {
      from: { transform: 'translateY(${distance}px)' },
      to: { transform: 'translateY(0)' }
    },
    left: {
      from: { transform: 'translateX(-${distance}px)' },
      to: { transform: 'translateX(0)' }
    },
    right: {
      from: { transform: 'translateX(${distance}px)' },
      to: { transform: 'translateX(0)' }
    }
  };

  var animation = {
    duration: 1000,
    variables: {
      distance: 500
    },
    start: function(options) {
      var element = $(this);
      var wrapper = $('<span></span>');
      $.animations.fn.wrap(element, wrapper);
      wrapper.css('overflow', 'hidden');
      wrapper.width(element.width());
      wrapper.height(element.height());
      element.wrap(wrapper);
      options.wrapper = element.parent();
    },
    always: function(options) {
      options.wrapper.children().first().unwrap();
    }
  };

  ['slideFromUp', 'slideFromDown', 'slideFromRight', 'slideFromLeft', 
   'slideToUp', 'slideToDown', 'slideToRight', 'slideToLeft'].forEach(function(name) {
    $.animations[name] = $.extend({}, animation);
    if(name.indexOf('To') != -1)
      $.animations[name].direction = 'reverse';
    $.animations[name].keyframes = keyframes[name.match(/(From|To)(.*)$/)[2].toLowerCase()];
  });
})(jQuery, window, document);
