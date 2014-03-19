;(function($, window, document, undefined) {
  var keyframes = {
    '0%, 100%': { transform: 'translateX(0)' },
    '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(${strength1}px)' },
    '20%, 40%, 60%, 80%': { transform: 'translateX(${strength2}px)' }
  };

  $.animations['shake'] = {
    duration: 1000,
    keyframes: keyframes,
    variables: {
      strength: 10
    },
    prepare: function(options) {
      var strength = options.variables.strength;
      if(!$.isNumeric(options.variables.strength))
        strength = 10;
      options.variables.strength1 = -strength;
      options.variables.strength2 = strength;
    }
  };
})(jQuery, window, document);
