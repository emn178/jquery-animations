;(function($, window, document, undefined) {
  var keyframes = {
    from: { 
      transform: 'rotate${axis}(${from}deg)',
      'transform-style': 'preserve-3d',
      'transform-origin': '${origin}'
    },
    to: { 
      transform: 'rotate${axis}(${to}deg)',
    }
  };

  var animation = {
    duration: 1000,
    wrap: true,
    keyframes: keyframes,
    variables: {
      from: 0,
      to: 360,
      origin: '50%',
      perspective: 600
    },
    prepare: function(options) {
      options.variables.axis = options.id.match(/flip(.*)$/)[1];
      options.wrapper.vendorCss('perspective', options.variables.perspective);
    }
  };

  ['flipX', 'flipY'].forEach(function(name) {
    $.animations[name] = $.extend({}, animation);
  });
})(jQuery, window, document);
