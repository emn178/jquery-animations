;(function($, window, document, undefined) {
  var keyframes = {
    '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
    '40%': { transform: 'translateY(-${strength}px)' },
    '60%': { transform: 'translateY(-${strength}px)' }
  }

  $.animations['bounce'] = {
    duration: 1000,
    keyframes: keyframes,
    variables: {
      strength: 20
    }
  };
})(jQuery, window, document);
