;(function($, window, document, undefined) {

  function setVariables(options, element)
  {
    if(options.wrapper.css('position') == 'static')
      options.wrapper.css('position', 'relative');
    options.wrapper.css('overflow', 'hidden');
    var canvas = options.canvas;
    var width = element.width();
    var height = element.height();

    canvas[0].width = width * 2;
    canvas[0].height = height * 2;
    var context = canvas[0].getContext("2d");
    context.fillStyle = options.variables.color;
    context.fillRect(0, 0, canvas[0].width, canvas[0].height);
    context.beginPath();
    context.arc(width, height, options.radius, 0, 2 * Math.PI, false);
    context.clip();
    context.clearRect(0, 0, canvas[0].width, canvas[0].height);
  }

  $.animations['discover'] = {
    duration: 5000,
    emptyAnimation: true,
    wrap: true,
    variables: {
      color: 'rgba(0,0,0,0.8)',
      radius: 100,
      count: 5,
      stopX: null,
      stopY: null
    },
    prepare: function(options) {
      var element = $(this);
      var width = element.width();
      var height = element.height();
      var canvas = $('<canvas />')
      canvas.css({
        position: 'absolute',
        top: 0,
        left: 0
      });
      options.radius = Math.min(options.variables.radius, height, width);
      options.canvas = canvas;
      setVariables(options, element);

      var keyframes = {};
      var count = options.variables.count || 3;
      var base = parseInt(count / 0.8);
      for(var i = 0;i < count;++i)
      {
        var percent = i / base * 100 + '%';
        var x = -Math.random() * 50;
        var y = -Math.random() * 50;
        if(i == count - 1 && options.variables.stopX !== null && options.variables.stopY !== null)
        {
          var stopX = Math.max(Math.min(options.variables.stopX, 100), 0);
          var stopY = Math.max(Math.min(options.variables.stopY, 100), 0);
          x = (stopX - 100) / 2;
          y = (stopY - 100) / 2;
        }
        var frame = { transform: 'translate(' + x + '%, ' + y + '%)' };
        keyframes[percent] = frame;
      }
      var frame = { transform: 'scale(${scale})' };
      keyframes['100%'] = frame;

      var cloneOptions = $.cloneBasicOptions(options);
      cloneOptions.keyframes = keyframes;
      cloneOptions.derivative = true;
      cloneOptions.prepare = cloneOptions.resize = function(options) {
        options.variables.scale = Math.max(element.height(), element.width()) / options.radius * Math.sqrt(2);
      };
      cloneOptions.fail = function() {
        element.stop();
      };
      canvas.animate(cloneOptions);

      options.wrapper.append(canvas);
    },
    resize: function(options) {
      setVariables(options, $(this));
    }
  };
})(jQuery, window, document);
