;(function($, window, document, undefined) {
  var keyframes = {
    from: { 
      transform: 'rotate${axis}(${startDeg}deg)',
      'transform-origin': '${startOrigin}'
    },
    to: { 
      transform: 'rotate${axis}(${endDeg}deg)',
      'transform-origin': '${endOrigin}'
    }
  };

  var animation = {
    duration: 1000,
    wrap: true,
    keyframes: keyframes,
    variables: {
      startDeg: 0,
      endDeg: 360,
      startOrigin: '50% 50% 0',
      endOrigin: '50% 50% 0',
      perspective: 1000,
      perspectiveOrigin: '50% 50%'
    },
    prepare: function(options) {
      options.variables.axis = options.id.match(/flip(.*)$/)[1];
      $(this).vendorCss('transform-style', 'preserve-3d');
      options.wrapper.vendorCss('perspective', options.variables.perspective);
      options.wrapper.vendorCss('perspective-origin', options.variables.perspectiveOrigin);
    }
  };

  ['flipX', 'flipY'].forEach(function(name) {
    $.animations[name] = $.extend({}, animation);
  });
})(jQuery, window, document);
