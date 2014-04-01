;(function($, window, document, undefined) {
  var keyframes = {
    from: { 
      transform: 'rotate(0deg)',
      'transform-origin': '${origin}'
    },
    to: { 
      transform: 'rotate(${degree}deg)',
    }
  };

  $.animations['rotate'] = {
    duration: 1000,
    keyframes: keyframes,
    variables: {
      degree: 360,
      origin: '50% 50%'
    }
  };
})(jQuery, window, document);
