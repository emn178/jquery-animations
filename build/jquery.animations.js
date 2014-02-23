/*
 * jQuery-animations v0.1.1
 * https://github.com/emn178/jquery-animations
 *
 * Copyright 2014, emn178@gmail.com
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
;(function($, window, document, undefined) {
  var animationend = 'animationend webkitAnimationEnd oAnimationEnd';
  var vendorPrefix = '';
  $(['WebkitTransform', 'MozTransform', 'msTransform', 'OTransform']).each(function(i, v) {
    if(v in document.documentElement.style)
      vendorPrefix = ['-webkit-', '-moz-', '-ms-', '-o-'][i];
  });

  var testElement = document.createElement('DIV');
  testElement.style.display = 'inline-flex';
  var supportFlex = testElement.style.display == 'inline-flex';
  testElement = null;

  var batches = {};
  var id = 0;

  function AnimationHandler(element, options)
  {
    this.id = ++id;
    this.batchId = this.id;
    this.element = $(element);
    this.options = options;
    this.name = this.options.animation;
  }

  AnimationHandler.prototype.animate = function() {
    var element = this.element;
    var options = this.options;

    if(element.attr('animating') == '1')
    {
      if(options.overlay)
      {
        this.wrap();
        element = this.wrapper;
      }
      else
        element.trigger('animationcancel');
    }
    else
      element.attr('batchId', this.id)
    element.attr('animating', 1);

    callback(options.start, element[0], [options]);

    if(this.options.keyframes)
      this.createKeyframesStyle();

    // name duration timing-function delay iteration-count direction fill-mode play-state
    var properties = [
      this.name, 
      options.duration / 1000 + 's', 
      options.easing, 
      options.delay / 1000 + 's', 
      options.repeat, 
      options.direction,
      options.fillMode
      // 'forwards'
    ].join(' ');
    element.css('animation', properties);
    element.css(vendorPrefix + 'animation', properties);

    this.animationEnd = this.animationEnd.bind(this);
    this.animationCancel = this.animationCancel.bind(this);
    element.on(animationend, this.animationEnd);
    element.on('animationfinish', this.animationEnd);
    element.on('animationcancel', this.animationCancel);
  };

  AnimationHandler.prototype.wrap = function() {
    this.batchId = this.element.attr('batchId');
    if(!batches[this.batchId])
    {
      batches[this.batchId] = {};
      batches[this.batchId][this.batchId] = 0;
    }
    batches[this.batchId][this.id] = 0;
    this.element.wrap($('<span></span>'));
    this.wrapper = this.element.parent();
    wrap(this.element, this.wrapper);
  };

  AnimationHandler.prototype.createKeyframesStyle = function() {
    this.name = 'a' + this.id;
    this.style = $('<style/>');
    this.style.append(this.getKeyframeCss('')).append(this.getKeyframeCss(vendorPrefix));
    $('head').append(this.style);
  };

  AnimationHandler.prototype.getKeyframeCss = function(prefix) {
    var options = this.options;
    var css = '@';
    css += prefix + 'keyframes ' + this.name + '{';
    for(var selector in options.keyframes)
    {
      var keyframe = options.keyframes[selector];
      css += selector + '{';
      for(var propertyName in keyframe)
      {
        var property = keyframe[propertyName];
        if(typeof property == 'string')
        {
          for(var variableName in options.variables)
          {
            var reg = new RegExp('\\${' + variableName + '}', 'g');
            property = property.replace(reg, options.variables[variableName]);
          }
        }
        css += propertyName + ':' + property + ';';
        css += prefix + propertyName + ':' + property + ';';
      }
      css += '}';
    }
    css += '}';
    return css;
  };

  AnimationHandler.prototype.animationEnd = function(e) {
    this.success = true;
    if(this.checkBatch())
      this.finish();
    if(e.type != 'animationfinish')
      e.stopPropagation();
  };

  AnimationHandler.prototype.animationCancel = function() {
    this.success = false;
    if(this.checkBatch())
      this.finish();
  };

  AnimationHandler.prototype.checkBatch = function() {
    if(!batches[this.batchId])
      return true;
    var done = true;
    var batch = batches[this.batchId];
    for(var hid in batch)
    {
      if(hid == this.id)
        continue;
      var cb = batch[hid];
      if(!cb)
      {
        done = false;
        break;
      }
    }
    if(done)
    {
      for(var hid in batch)
      {
        if(hid == this.id)
          continue;
        var cb = batch[hid]();
      }
      delete batches[this.batchId];
      return true;
    }
    batch[this.id] = this.finish.bind(this);
    return false;
  };

  AnimationHandler.prototype.finish = function() {
    this.clear();
    var options = this.options;
    callback(this.success ? options.complete : options.fail, this.element[0], [options]);
    callback(options.always, this.element[0], [this.options]);
  };

  AnimationHandler.prototype.clear = function() {
    var element = this.wrapper || this.element;
    element.removeAttr('animating');
    element.removeAttr('batchId');
    element.off(animationend, this.animationEnd);
    element.off('animationfinish', this.animationEnd);
    element.off('animationcancel', this.animationCancel);
    element.css('animation', '');
    element.css(vendorPrefix + 'animation', '');
    if(this.style)
      this.style.remove();
    if(this.wrapper)
      this.wrapper.children().first().unwrap();
  };

  function callback(callbacks, thisArg, argsArray) 
  {
    if(!$.isArray(callbacks))
      callbacks = [callbacks];
    for(var i = 0;i < callbacks.length;++i)
    {
      if($.isFunction(callbacks[i]))
        callbacks[i].apply(thisArg, argsArray);
    }
  };

  function wrap(element, wrapper) 
  {
    if(element.css('display') == 'block')
      wrapper.css('display', 'block');
    else if(supportFlex)
      wrapper.css('display', 'inline-flex');
    else
      wrapper.css('display', 'inline-block');
  }

  function createHandler(elements, animation, options, customOptions)
  {
    options = $.extend({}, options, customOptions);
    options.duration = options.duration || animation.duration || 400;
    options.direction = options.direction || animation.direction || 'normal';
    options.easing = options.easing || animation.easing || 'ease';
    options.delay = options.delay || animation.delay || 0;
    options.repeat = options.repeat || animation.repeat || 1;
    options.fillMode = options.fillMode || animation.fillMode || 'none';
    options.start = [options.start, animation.start];
    options.complete = [animation.complete, options.complete];
    options.always = [animation.always, options.always];
    options.fail = [animation.fail, options.fail];
    options.animation = animation.name;
    options.keyframes = animation.keyframes;
    options.variables = {};
    for(var variableName in animation.variables)
      options.variables[variableName] = options[variableName] || animation.variables[variableName];
    elements.each(function() {
      var cloneOptions = $.extend({}, options);
      new AnimationHandler(this, cloneOptions).animate();
    });
  }

  $.animations = {};
  $.animations.fn = {
    wrap: wrap
  };
  
  function animate(animationId, options)
  {
    options = options || {};
    var animationIds = animationId.split(' ');
    options.overlay = options.overlay || animationIds.length > 1;
    var custom = options.custom || {};
    delete options.custom;
    for(var i = 0;i < animationIds.length;++i)
    {
      var animationId = animationIds[i];
      if(!$.animations[animationId])
        continue;
      options.id = animationId;
      createHandler(this, $.animations[animationId], options, custom[animationId] || {});
      delete options.start;
      delete options.complete;
      delete options.always;
      delete options.fail;
    }
  }

  var origAnimate = $.fn.animate;
  $.fn.animate = function(param1, param2) {
    if(typeof param1 == 'string' || 
       typeof param1 == 'object' && (param1.name || param1.keyframes))
    {
      animate.call(this, param1, param2);
      return;
    }
    return origAnimate.apply(this, arguments);
  };

  var origStop = $.fn.stop;
  $.fn.stop = function() {
    if(arguments.length == 0)
      this.trigger('animationcancel');
    return origStop.apply(this, arguments);
  };

  var origFinish = $.fn.finish;
  $.fn.finish = function() {
    if(arguments.length == 0)
      this.trigger('animationfinish');
    return origFinish.apply(this, arguments);
  };
})(jQuery, window, document);
;;(function($, window, document, undefined) {
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
    start: function(options) {
      var strength = options.variables.strength;
      if(!$.isNumeric(options.variables.strength))
        strength = 20;
      options.variables.strength1 = -strength * 2;
      options.variables.strength2 = -strength;
    }
  };
})(jQuery, window, document);
;;(function($, window, document, undefined) {
  var keyframes = {
    from: { opacity: 0 },
    to: { opacity: 1 }
  };

  var animation = {
    duration: 1000,
    easing: 'linear',
    keyframes: keyframes
  };

  $.animations['fadeIn'] = animation;
  $.animations['fadeOut'] = $.extend({
    direction: 'reverse'
  }, animation);
})(jQuery, window, document);
;;(function($, window, document, undefined) {
  var keyframes = {
    from: { transform: 'translate${axis}(${distance}px)' },
    to: { transform: 'translate${axis}(0)' }
  };

  var animation = {
    duration: 1000,
    keyframes: keyframes,
    variables: {
      distance: null
    },
    start: function(options) {
      var variables = options.variables;
      var distance;
      if(variables.distance && $.isNumeric(variables.distance))
        distance = variables.distance;
      var direction = options.id.match(/(From|To)(.*)$/)[2].toLowerCase();
      switch(direction)
      {
        case 'up':
          variables.axis = 'Y';
          variables.distance = distance || -$(window).height();
          break;
        case 'down':
          variables.axis = 'Y';
          variables.distance = distance || $(document).height();
          break;
        case 'left':
          variables.axis = 'X';
          variables.distance = distance || -$(window).width();
          break;
        case 'right':
          variables.axis = 'X';
          variables.distance = distance || $(document).width();
          break;
      }
    }
  };

  ['flyFromUp', 'flyFromDown', 'flyFromRight', 'flyFromLeft', 
   'flyToUp', 'flyToDown', 'flyToRight', 'flyToLeft'].forEach(function(name) {
    $.animations[name] = $.extend({}, animation);
    if(name.indexOf('To') != -1)
      $.animations[name].direction = 'reverse';
  });
})(jQuery, window, document);
;;(function($, window, document, undefined) {
  var keyframes = {
    '0%, 100%': { transform: 'translateX(0)' },
    '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(${strength1}px)' },
    '20%, 40%, 60%, 80%': { transform: 'translateX(${strength2}px)' }
  };

  $.animations['shake'] = {
    duration: 2000,
    keyframes: keyframes,
    variables: {
      strength: 10
    },
    start: function(options) {
      var strength = options.variables.strength;
      if(!$.isNumeric(options.variables.strength))
        strength = 10;
      options.variables.strength1 = -strength;
      options.variables.strength2 = strength;
    }
  };
})(jQuery, window, document);
;;(function($, window, document, undefined) {
  var keyframes = {
    from: { transform: 'translate${axis}(${distance}px)' },
    to: { transform: 'translate${axis}(0)' }
  };

  var animation = {
    duration: 1000,
    keyframes: keyframes,
    variables: {
      distance: null
    },
    start: function(options) {
      var element = $(this);
      var wrapper = $('<span></span>');
      $.animations.fn.wrap(element, wrapper);
      wrapper.css('overflow', 'hidden');
      var w = element.width();
      var h = element.height();
      wrapper.width(w);
      wrapper.height(h);
      element.wrap(wrapper);
      options.wrapper = element.parent();
      var variables = options.variables;
      var distance;
      if(variables.distance && $.isNumeric(variables.distance))
        distance = variables.distance;
      var direction = options.id.match(/(From|To)(.*)$/)[2].toLowerCase();
      switch(direction)
      {
        case 'up':
          variables.axis = 'Y';
          options.variables.distance = distance || -h;
          break;
        case 'down':
          variables.axis = 'Y';
          options.variables.distance = distance || h;
          break;
        case 'left':
          variables.axis = 'X';
          options.variables.distance = distance || -w;
          break;
        case 'right':
          variables.axis = 'X';
          options.variables.distance = distance || w;
          break;
      }
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
  });
})(jQuery, window, document);
