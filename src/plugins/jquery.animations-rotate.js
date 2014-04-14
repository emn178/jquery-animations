;(function($, window, document, undefined) {
  var keyframes = {
    from: { 
      transform: 'rotate(${startDeg}deg)',
      'transform-origin': '${startOrigin}'
    },
    to: { 
      transform: 'rotate(${endDeg}deg)',
      'transform-origin': '${endOrigin}'
    }
  };

  $.animations['rotate'] = {
    duration: 1000,
    keyframes: keyframes,
    variables: {
      startDeg: 0,
      endDeg: 360,
      startOrigin: '50% 50% 0',
      endOrigin: '50% 50% 0'
    }
  };
})(jQuery, window, document);
