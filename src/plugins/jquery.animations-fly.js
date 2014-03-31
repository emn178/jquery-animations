;(function($, window, document, undefined) {
  var keyframes = {
    from: { transform: 'translate(${x}px,${y}px)' },
    to: { transform: 'translate(0)' }
  };

  var baseAnimation = {
    duration: 1000,
    keyframes: keyframes
  };

  (function() {
    function setVariables(options, distance)
    {
      options.variables.x = 0;
      options.variables.y = 0;
      switch(options.variables.direction)
      {
        case 'up':
          options.variables.y = -distance || -documentHeight;
          break;
        case 'down':
          options.variables.y = distance || documentHeight;
          break;
        case 'left':
          options.variables.x = -distance || -documentWidth;
          break;
        case 'right':
          options.variables.x = distance || documentWidth;
          break;
      }
    }

    var animation = $.extend({}, baseAnimation, {
      variables: {
        distance: null
      },
      prepare: function(options) {
        var variables = options.variables;
        var distance;
        if(variables.distance && $.isNumeric(variables.distance))
          distance = variables.distance;
        else
          options.auto = true;
        variables.direction = options.id.match(/(From|To)(.*)$/)[2].toLowerCase();
        setVariables(options, distance);
      },
      resize: function(options) {
        if(!options.auto || options.remainingRepeat == 1)
          return;
        setVariables(options, 0);
      }
    });

    ['flyFromUp', 'flyFromDown', 'flyFromRight', 'flyFromLeft', 
     'flyToUp', 'flyToDown', 'flyToRight', 'flyToLeft'].forEach(function(name) {
      $.animations[name] = $.extend({}, animation);
      if(name.indexOf('To') != -1)
        $.animations[name].direction = 'reverse';
    });
  }());

  (function() {
    var animation = $.extend({}, baseAnimation, {
      variables: {
        x: 0,
        y: 0,
        relative: false
      },
      prepare: function(options) {
        var variables = options.variables;
        var position = $(this).position();
        if(!$.isNumeric(variables.x))
          variables.x = 0;
        if(!$.isNumeric(variables.y))
          variables.y = 0;
        if(!variables.relative)
        {
          var position = $(this).position();
          variables.x -= position.left;
          variables.y -= position.top;
        }
      }
    });

    ['flyFrom', 'flyTo'].forEach(function(name) {
      $.animations[name] = $.extend({}, animation);
      if(name.indexOf('To') != -1)
        $.animations[name].direction = 'reverse';
    });
  }());

  (function() {
    function setVariables(options)
    {
      var deg = options.variables.deg;
      var theta = deg * Math.PI / 180;
      var x = documentWidth;
      var y = documentHeight;
      if(deg > 180)
        y = -y;
      if(deg > 90 && deg < 270)
        x = -x;
      if(deg == 0 || deg == 180)
        y = 0;
      else if(deg == 90 || deg == 270)
        x = 0;
      else
      {
        var cos = Math.cos(theta);
        var sin = Math.sin(theta);
        var r1 = x / cos;
        var r2 = y / sin;
        if(r1 < r2)
          y = sin * r1;
        else
          x = cos * r2;
      }
      options.variables.x = x;
      options.variables.y = -y;
    }

    var animation = $.extend({}, baseAnimation, {
      variables: {
        deg: null
      },
      prepare: function(options) {
        if(!$.isNumeric(options.variables.deg))
          options.variables.deg = Math.random() * 360;
        options.variables.deg %= 360;
        if(options.variables.deg < 0)
          options.variables.deg += 360;
        setVariables(options);
      },
      resize: function(options) {
        if(options.remainingRepeat == 1)
          return;
        setVariables(options);
      }
    });

    ['flyIn', 'flyOut'].forEach(function(name) {
      $.animations[name] = $.extend({}, animation);
      if(name == 'flyOut')
        $.animations[name].direction = 'reverse';
    });
  }());

  var documentWidth, documentHeight;
  function resize()
  {
    documentWidth = $(document).width();
    documentHeight = $(document).height();
  }
  $(window).resize(resize);
  $(document).ready(resize);
})(jQuery, window, document);
