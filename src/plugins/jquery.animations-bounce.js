;(function($, window, document, undefined) {
  var keyframes = {
    '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
    '40%': { transform: 'translateY(${strength1}px)' },
    '60%': { transform: 'translateY(${strength2}px)' }
  };

  $.animations['bounce'] = {
    duration: 1000,
    keyframes: keyframes,
    variables: {
      strength: 20
    },
    prepare: function(options) {
      var strength = options.variables.strength;
      if(!$.isNumeric(options.variables.strength))
        strength = 20;
      options.variables.strength1 = -strength * 2;
      options.variables.strength2 = -strength;
    }
  };
})(jQuery, window, document);
