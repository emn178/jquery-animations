/*
 * jQuery-animations v0.3.5
 * https://github.com/emn178/jquery-animations
 *
 * Copyright 2014, emn178@gmail.com
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
;(function($, window, document, undefined) {
  var animationstart = 'animationstart webkitAnimationStart oAnimationStart';
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

  var id = 0;
  var observations = [];

  function Action(elements, animations, options)
  {
    this.elements = elements;
    this.animations = animations;
    this.options = options;
  }

  Action.prototype.start = function() {
    this.prepare();
    if(this.jobsOptions.length == 0)
    {
      if(this.fusions.length > 0)
      {
        this.fusions[0].prepare =  [this.taskOptions.prepare, this.fusions[0].prepare];
        this.fusions[0].start =  [this.taskOptions.start, this.fusions[0].start];
        this.fusions[0].complete =  [this.taskOptions.complete, this.fusions[0].complete];
        this.fusions[0].always =  [this.taskOptions.always, this.fusions[0].always];
        this.fusions[0].fail =  [this.taskOptions.fail, this.fusions[0].fail];
        this.fusions[0].end =  [this.taskOptions.end, this.fusions[0].end];
        this.fusions[0].clear =  [this.taskOptions.clear, this.fusions[0].clear];
      }
    }
    else
    {
      this.elements.each(function(i, element) {
        new Task(element, this.taskOptions, this.jobsOptions).start();
      }.bind(this));
    }
    for(var i = 0;i < this.fusions.length;++i)
      animate.call(this.elements, this.fusions[i].fusion, this.fusions[i]);
  };

  Action.prototype.prepare = function() {
    this.taskOptions = $.extend({}, this.options);
    delete this.taskOptions.prepare;
    delete this.taskOptions.start;
    delete this.taskOptions.complete;
    delete this.taskOptions.always;
    delete this.taskOptions.fail;
    delete this.taskOptions.end;
    delete this.taskOptions.clear;
    this.jobsOptions = [];
    this.fusions = [];
    var custom = this.taskOptions.custom || {};
    for(var i = 0;i < this.animations.length;++i)
    {
      // prepare options
      var animation = this.animations[i];
      var options;
      if(animation.fusion)
      {
        options = $.extend({}, this.taskOptions, animation, custom[animation.id]);
        this.taskOptions.combinable = true;
        options.combinable = true;
        options.fusion = animation.fusion;
        this.fusions.push(options);
        continue;
      }
      options = $.extend({}, this.taskOptions, custom[animation.id]);
      options.id = animation.id;
      options.duration = options.duration || animation.duration || 400;
      options.direction = calculateDirection(animation.direction, options.direction);
      options.easing = options.easing || animation.easing || 'ease';
      options.delay = options.delay || animation.delay || 0;
      options.repeat = options.repeat || animation.repeat || 1;
      options.fillMode = options.fillMode || animation.fillMode || 'none';
      options.timeout = options.timeout || 500;
      options.prepare = [options.prepare, animation.prepare];
      options.start = [options.start, animation.start];
      options.complete = [animation.complete, options.complete];
      options.always = [animation.always, options.always];
      options.fail = [animation.fail, options.fail];
      options.end = [animation.end, options.end];
      options.clear = [animation.clear, options.clear];
      options.name = animation.name;
      options.keyframes = animation.keyframes;
      options.emptyAnimation = animation.emptyAnimation;
      options.wrap = animation.wrap || options.wrap;
      options.variables = {};
      for(var variableName in animation.variables)
      {
        options.variables[variableName] = options[variableName];
        if(options[variableName] === undefined)
          options.variables[variableName] = animation.variables[variableName];
      }

      this.jobsOptions.push(options);
    } 
    this.taskOptions.prepare = this.options.prepare;
    this.taskOptions.start = this.options.start;
    this.taskOptions.complete = this.options.complete;
    this.taskOptions.always = this.options.always;
    this.taskOptions.fail = this.options.fail;
    this.taskOptions.end = this.options.end;
    this.taskOptions.clear = this.options.clear;
    if(this.taskOptions.autoWrap === undefined)
      this.taskOptions.autoWrap = true;
  };

  function Task(element, options, jobsOptions)
  {
    this.element = $(element);
    this.options = options;
    this.options.element = this.element;
    this.options.originalElement = this.element;
    this.jobsOptions = jobsOptions;
    this.reset = true;
    this.started = false;
    this.counter = {
      complete: 0,
      fail: 0,
      always: 0
    };
  }

  Task.prototype.start = function() {
    this.element.reset();
    this.combine();
    var tasks = parseInt(this.element.attr('animation-tasks')) || 0;
    if(!tasks)
      this.cleaner = true;
    ++tasks;
    this.element.attr('animation-tasks', tasks);
    this.ontasksend = this.ontasksend.bind(this);
    this.onstart = this.onstart.bind(this);
    this.oncancel = this.oncancel.bind(this);
    this.onfinish = this.onfinish.bind(this);
    this.element.on('animationtasksend', this.ontasksend);
    this.element.on('animationcancel', this.oncancel);
    this.element.on('animationfinish', this.onfinish);
    callback(this.options.prepare, this.element[0], [this.options]);

    this.actor = this.element;
    var css = '';
    this.jobs = [];
    this.jobsOptions.sort(function(a, b) {
      return a.wrap ? -1 : (b.wrap ? 1 : 0);
    });

    if(!this.options.autoWrap)
      this.combineOptions();

    for(var i = 0;i < this.jobsOptions.length;++i)
    {
      var options = $.extend({}, this.jobsOptions[i]);
      if(this.options.combinable || i > 0)
        this.actor = wrap(this.actor);
      if(options.fillMode == 'forwards' || options.fillMode == 'both')
        this.reset = false;
      if(options.wrap)
        options.wrapper = wrap(this.actor);

      var preparesOptions = options.combinedJobs || [options];
      for(var j = 0;j < preparesOptions.length;++j)
      {
        var prepareOptions = preparesOptions[j];
        callback(prepareOptions.prepare, this.actor[0], [prepareOptions]);
        if(prepareOptions.keyframes)
        {
          prepareOptions.name = 'a' + ++id;
          css += generateKeyframeCss({
            name: prepareOptions.name,
            keyframes: prepareOptions.keyframes,
            variables: prepareOptions.variables
          });
        }
      }

      options.start = [options.start, this.onstart.bind(this)];
      options.complete = [options.complete, this.oncomplete.bind(this)];
      options.fail = [options.fail, this.onfail.bind(this)];
      options.always = [options.always, this.onalways.bind(this)];
      options.originalElement = this.element;
      options.element = this.actor;
      this.jobs.push(new Job(this.actor, options));

      if(options.wrap)
        this.actor = options.wrapper;
    }

    if(css)
    {
      this.style = $('<style></style>');
      this.style.html(css);
      $('head').append(this.style);
    }

    for(var i = 0;i < this.jobs.length;++i)
      this.jobs[i].start();

    this.actor.find('[animation-prepare]').each(function() {
      var element = $(this);
      element.vendorCss('animation', element.attr('animation-prepare'));
      element.removeAttr('animation-prepare');
    });
  };

  Task.prototype.combine = function() {
    var animating = this.element.attr('animation-tasks');
    if(!animating)
    {
      if(this.options.combinable)
        this.element.attr('animation-combinable', 1);
      return;
    }
    if(!this.options.combinable)
    {
      this.element.trigger('animationcancel');
      return;
    }
    var previousCombinable = this.element.attr('animation-combinable');
    if(previousCombinable)
      return;
    this.element.trigger('animationcancel');
    this.element.attr('animation-combinable', 1);
  };

  Task.prototype.combineOptions = function() {
    var newJobsOptions = [];
    var combinedOptions = [];
    for(var i = 0;i < this.jobsOptions.length;++i)
    {
      var jobOptions = this.jobsOptions[i];
      if(isCombiableOptions(jobOptions))
        combinedOptions.push(jobOptions);
      else
        newJobsOptions.push(jobOptions);
    }
    if(combinedOptions.length > 0)
    {
      var first = combinedOptions[0];
      first.combinedJobs = combinedOptions;
      newJobsOptions.push(first);
    }
    this.jobsOptions = newJobsOptions;
  };

  Task.prototype.onstart = function() {
    if(this.started)
      return;
    this.started = true;
    callback(this.options.start, this.element[0], [this.options]);
  };

  Task.prototype.oncomplete = function() {
    ++this.counter.complete;
  };

  Task.prototype.onfail = function() {
    ++this.counter.fail;
  };

  Task.prototype.onalways = function() {
    ++this.counter.always;
    if(!this.isDone())
      return;
    if(this.counter.complete > 0)
      callback(this.options.complete, this.element[0], [this.options]);
    if(this.counter.fail == this.counter.always)
      callback(this.options.fail, this.element[0], [this.options]);
    callback(this.options.always, this.element[0], [this.options]);
    var tasks = parseInt(this.element.attr('animation-tasks')) || 0;
    if(tasks == 1)
      this.element.removeAttr('animation-tasks');
    else
      this.element.attr('animation-tasks', tasks - 1);
    if(tasks == 1 && !this.hasOtherTasks())
      this.element.trigger('animationtasksend');
  };

  Task.prototype.ontasksend = function() {
    if(!this.isDone())
      return;
    this.element.off('animationtasksend', this.onend);
    this.element.off('animationcancel', this.oncancel);
    this.element.off('animationfinish', this.onfinish);
    this.element.removeAttr('animation-combinable');
    this.element.removeAttr('animation-display');
    if(!this.options.noClear && (this.reset || this.counter.fail == this.counter.always))
      this.clear();
    else
    {
      this.element.attr('animation-resetable', 1);
      this.onreset = this.onreset.bind(this);
      this.element.on('animationreset', this.onreset);
    }
    for(var i = 0;i < this.jobs.length;++i)
      this.jobs[i].end();
    callback(this.options.end, this.element[0], [this.options]);
  };

  Task.prototype.oncancel = function(e) {
    if(e.target != this.element[0])
      e.stopPropagation();
  };

  Task.prototype.onfinish = function(e) {
    if(e.target != this.element[0])
      e.stopPropagation();
  };

  Task.prototype.onreset = function(e) {
    e.stopPropagation();
    if(e.target != this.element[0])
      return;
    this.element.off('animationreset', this.onreset);
    this.element.removeAttr('animation-resetable');
    this.clear();
  };

  Task.prototype.isDone = function() {
    return this.counter.always == this.jobsOptions.length
  };

  Task.prototype.hasOtherTasks = function() {
    return this.element.find('[animation-tasks]').length > 0;
  };

  Task.prototype.clear = function() {
    this.element.vendorCss('animation', '');
    if(this.style)
      this.style.remove();
    if(!this.cleaner)
      return;
    for(var i = 0;i < this.jobs.length;++i)
      this.jobs[i].clear();
    callback(this.options.clear, this.element[0], [this.options]);
    var wrapper = this.actor;
    while(wrapper.parent().attr('animation-wrapper') == 1)
      wrapper = wrapper.parent();

    if(wrapper != this.element)
    {
      var inner = this.element;
      while(!inner.parent().attr('animation-wrapper'))
        inner = inner.parent();
      wrapper.replaceWith(inner);
    }
  };

  function Job(element, options)
  {
    this.element = $(element);
    this.options = options;
    this.prepare();
    this.counter = {
      complete: 0,
      fail: 0,
      always: 0,
      start: 0
    };
  }

  Job.prototype.start = function() {
    var options = this.options;
    var element = this.element;

    this.onstart = this.onstart.bind(this);
    this.onfail = this.onfail.bind(this);
    this.oncancel = this.oncancel.bind(this);
    this.onfinish = this.onfinish.bind(this);
    element.on(animationstart, this.onstart);
    element.on('animationfail', this.onfail);
    element.on('animationcancel', this.oncancel);
    element.on('animationfinish', this.onfinish);
    if(options.emptyAnimation)
    {
      this.startTimer = setTimeout(this.onstart, options.delay);
      var repeat = parseInt(options.repeat);
      if(!isNaN(repeat))
      {
        this.endTimer = setTimeout(function() {
          this.finish(true);
        }.bind(this), options.delay + options.duration * repeat);
      }
    }
    else
    {
      element.vendorCss('animation', element.attr('animation-prepare'));
      element.removeAttr('animation-prepare');
      this.onend = this.onend.bind(this);
      element.on(animationend, this.onend);
      for(var i = 0;i < this.preparesOptions.length;++i)
        observe(element, new Date().getTime() + this.preparesOptions[i].delay + this.preparesOptions[i].timeout);
    }
  };

  Job.prototype.prepare = function() {
    var preparesOptions = this.options.combinedJobs || [this.options];
    var properties = [];
    for(var i = 0;i < preparesOptions.length;++i)
    {
      var options = preparesOptions[i];
      properties.push([
        options.name, 
        options.duration / 1000 + 's', 
        options.easing, 
        options.delay / 1000 + 's', 
        options.repeat, 
        options.direction,
        options.fillMode,
      ].join(' '));
    }
    this.combinedCount = preparesOptions.length;
    this.preparesOptions = preparesOptions;
    this.element.attr('animation-prepare', properties.join(','));
  };

  Job.prototype.onstart = function(e) {
    e.stopPropagation();
    ++this.counter.start;
    if(this.combinedCount == this.counter.start)
      unobserve(this.element);
    callback(this.options.start, this.element[0], [this.options]);
  };

  Job.prototype.onfail = function(e) {
    e.stopPropagation();
    ++this.counter.always;
    ++this.counter.fail;
    if(this.combinedCount == this.counter.always)
    {
      if(this.counter.fail == this.counter.always)
        this.finish(false);
      else
        this.finish(true);
    }
  };

  Job.prototype.oncancel = function(e) {
    this.finish(false);
  };

  Job.prototype.onend = function(e) {
    e.stopPropagation();
    ++this.counter.always;
    ++this.counter.complete;
    if(this.combinedCount == this.counter.always)
      this.finish(true);
  };

  Job.prototype.onfinish = function(e) {
    this.finish(true);
  };

  Job.prototype.finish = function(success) {
    var options = this.options;
    var element = this.element;
    element.off(animationstart, this.onstart);
    element.off(animationend, this.onend);
    element.off('animationfail', this.onfail);
    element.off('animationcancel', this.oncancel);
    element.off('animationfinish', this.onfinish);
    if(this.startTimer)
      clearTimeout(this.startTimer);
    if(this.endTimer)
      clearTimeout(this.endTimer);
    callback(success ? options.complete : options.fail, this.element[0], [options]);
    callback(options.always, this.element[0], [this.options]);
  };

  Job.prototype.end = function() {
    callback(this.options.end, this.element[0], [this.options]);
  };

  Job.prototype.clear = function() {
    callback(this.options.clear, this.element[0], [this.options]);
  };

  var directions = {
    'alternate-reverse': -2,
    'reverse': -1,
    'normal': 1,
    'alternate': 2
  };

  function calculateDirection(direction1, direction2) 
  {
    direction1 = direction1 || 'normal';
    direction2 = direction2 || 'normal';
    switch(directions[direction1] * directions[direction2])
    {
      case -2:
      case -4:
        return 'alternate-reverse';
      case -1:
        return 'reverse';
      case 2:
        return 'alternate';
      case 1:
        return 'normal';
      default:
        return direction1;
    }
  }

  function checkFail()
  {
    var remains = [];
    var now = new Date().getTime();
    for(var i = 0;i < observations.length;++i)
    {
      var observation = observations[i];
      var deadline = observation.attr('animation-deadline');
      if(!deadline)
        continue;
      var deadlines = deadline.split(',');
      var result = [];
      for(var j = 0;j < deadlines.length;++j)
      {
        deadline = parseInt(deadlines[j]);
        if(now > deadline)
          observation.trigger('animationfail');
        else
          result.push(deadline);
      }
      if(result.length == 0)
        observation.removeAttr('animation-deadline');
      else
      {
        observation.attr('animation-deadline', result.join(','));
        remains.push(observation);
      }
    }
    observations = remains;
  }

  function observe(element, deadline)
  {
    var pre = element.attr('animation-deadline');
    if(pre)
      deadline = pre + ',' + deadline;
    element.attr('animation-deadline', deadline);
    observations.push(element);
  }

  function unobserve(element)
  {
    element.removeAttr('animation-deadline');
  }

  function isCombiableOptions(options)
  {
    return !options.wrap
      && isEmptyCallbacks(options.start)
      && isEmptyCallbacks(options.complete)
      && isEmptyCallbacks(options.always)
      && isEmptyCallbacks(options.fail)
      && isEmptyCallbacks(options.end)
      && isEmptyCallbacks(options.clear);
  }

  function isEmptyCallbacks(callbacks)
  {
    if(!$.isArray(callbacks))
      return !$.isFunction(callbacks);
    
    for(var i = 0;i < callbacks.length;++i)
      if(!isEmptyCallbacks(callbacks[i]))
        return false;
    return true;
  }

  function callback(callbacks, thisArg, argsArray) 
  {
    if(!$.isArray(callbacks))
      callbacks = [callbacks];
    for(var i = 0;i < callbacks.length;++i)
    {
      if($.isFunction(callbacks[i]))
        callbacks[i].apply(thisArg, argsArray);
      else if($.isArray(callbacks[i]))
        callback(callbacks[i], thisArg, argsArray);
    }
  }

  function wrap(element) 
  {
    var wrapper = $('<span></span>');
    var display = element.attr('animation-display') || element.css('display');
    if(display == 'block')
      wrapper.css('display', 'block');
    else if(display == 'none')
      wrapper.css('display', 'none');
    else if(supportFlex)
      wrapper.css('display', 'inline-flex');
    else
      wrapper.css('display', 'inline-block');
    wrapper.attr('animation-wrapper', 1);
    if(element.css('float') != 'none')
      wrapper.css('float', element.css('float'));
    element.wrap(wrapper);
    element.attr('animation-display', display);
    return element.parent();
  }

  function saveStyle(element, properties)
  {
    element = $(element)[0];
    var style = {};
    for(var i = 0;i < properties.length;++i)
      style[properties[i]] = element.style[properties[i]];
    return style;
  }

  function restoreStyle(element, style)
  {
    element = $(element)[0];
    for(var propertyName in style)
      element.style[propertyName] = style[propertyName];
  }

  function generateKeyframeCss(options) {
    return generateKeyframeCssByPrefix('', options) + generateKeyframeCssByPrefix(vendorPrefix, options);
  }

  function generateKeyframeCssByPrefix(prefix, options) {
    var css = '@';
    css += prefix + 'keyframes ' + options.name + '{';
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
  }

  function defineAnimation(name, keyframes)
  {
    var css = generateKeyframeCss({
      name: name,
      keyframes: keyframes
    });
    $('head').append($('<style></style>').append(css));
  }

  function animate(animationIds, options)
  {
    var animations = [];
    animationIds = animationIds.split(' ');
    for(var i = 0;i < animationIds.length;++i)
    {
      var id = animationIds[i];
      if(!id)
        continue;
      var animation = $.animations[id];
      if(!animation)
        animation = {name: id};
      animation.id = id;
      animations.push(animation);
    }
    new Action(this, animations, options || {}).start();
  }

  $.animations = {};
  $.wrap = wrap;
  $.defineAnimation = defineAnimation;
  $.saveStyle = saveStyle;
  $.restoreStyle = restoreStyle;

  var origAnimate = $.fn.animate;
  $.fn.animate = function(param1, param2) {
    if(typeof param1 == 'string')
    {
      animate.call(this, param1, param2);
      return this;
    }
    else if(typeof param1 == 'object' && param1.keyframes)
    {
      new Action(this, [param1], {}).start();
      return this;
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

  $.fn.reset = function() {
    if(this.attr('animation-resetable'))
      return this.trigger('animationreset');
  };

  $.fn.vendorCss = function(propertyName, value) {
    this.css(propertyName, value);
    this.css(vendorPrefix + propertyName, value);
  };

  var timer = setInterval(checkFail, 100);
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
    prepare: function(options) {
      var strength = options.variables.strength;
      if(!$.isNumeric(options.variables.strength))
        strength = 20;
      options.variables.strength1 = -strength * 2;
      options.variables.strength2 = -strength;
    }
  };
})(jQuery, window, document);
;;(function($, window, document, undefined) {
  $.defineAnimation('fadeIn', {
    from: { opacity: 0 },
    to: { opacity: 1 }
  });

  var animation = {
    name: 'fadeIn',
    duration: 1000,
    easing: 'linear'
  };

  $.animations['fadeIn'] = animation;
  $.animations['fadeOut'] = $.extend({
    direction: 'reverse'
  }, animation);
})(jQuery, window, document);
;;(function($, window, document, undefined) {
  var keyframes = {
    from: { transform: 'translate(${x}px,${y}px)' },
    to: { transform: 'translate(0)' }
  };

  var animation = {
    duration: 1000,
    keyframes: keyframes,
    variables: {
      distance: null
    },
    prepare: function(options) {
      var variables = options.variables;
      var distance;
      if(variables.distance && $.isNumeric(variables.distance))
        distance = variables.distance;
      if(options.id == 'flyIn' || options.id == 'flyOut')
      {
        distance = distance || Math.max($(document).height(), $(document).width());
        variables.x = parseInt(Math.random() * 2 * distance - distance);
        variables.y = (distance - Math.abs(variables.x)) * (Math.random() > 0.5 ? 1 : -1);
        return;
      }

      var direction = options.id.match(/(From|To)(.*)$/)[2].toLowerCase();
      variables.x = 0;
      variables.y = 0;
      switch(direction)
      {
        case 'up':
          variables.y = -distance || -$(document).height();
          break;
        case 'down':
          variables.y = distance || $(document).height();
          break;
        case 'left':
          variables.x = -distance || -$(document).width();
          break;
        case 'right':
          variables.x = distance || $(document).width();
          break;
      }
    }
  };

  ['flyFromUp', 'flyFromDown', 'flyFromRight', 'flyFromLeft', 
   'flyToUp', 'flyToDown', 'flyToRight', 'flyToLeft', 'flyIn', 'flyOut'].forEach(function(name) {
    $.animations[name] = $.extend({}, animation);
    if(name.indexOf('To') != -1 || name == 'flyOut')
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
;;(function($, window, document, undefined) {
  var keyframes = {
    from: { transform: 'translate${axis}(${distance}px)' },
    to: { transform: 'translate${axis}(0)' }
  };

  var animation = {
    duration: 1000,
    keyframes: keyframes,
    wrap: true,
    variables: {
      distance: null
    },
    prepare: function(options) {
      var element = $(this);
      options.save = $.saveStyle(this, ['marginLeft', 'marginRight', 'marginTop', 'marginBottom', 'width', 'height']);
      var w = element.outerWidth();
      var h = element.outerHeight();
      options.wrapper.css({
        'margin-left': element.css('margin-left'),
        'margin-right': element.css('margin-right'),
        'margin-top': element.css('margin-top'),
        'margin-bottom': element.css('margin-bottom'),
        'width': w + 'px',
        'height': h + 'px',
        'overflow': 'hidden'
      });
      element.css({
        width: w + 'px',
        height: h + 'px',
        margin: '0'
      });
      var variables = options.variables;
      var distance;
      if(variables.distance && $.isNumeric(variables.distance))
        distance = variables.distance;
      var direction = options.id.match(/(From|To)(.*)$/)[2].toLowerCase();
      switch(direction)
      {
        case 'up':
          variables.axis = 'Y';
          options.variables.distance = -distance || -h;
          break;
        case 'down':
          variables.axis = 'Y';
          options.variables.distance = distance || h;
          break;
        case 'left':
          variables.axis = 'X';
          options.variables.distance = -distance || -w;
          break;
        case 'right':
          variables.axis = 'X';
          options.variables.distance = distance || w;
          break;
      }
    },
    clear: function(options) {
      $.restoreStyle(this, options.save);
    }
  };

  ['slideFromUp', 'slideFromDown', 'slideFromRight', 'slideFromLeft', 
   'slideToUp', 'slideToDown', 'slideToRight', 'slideToLeft'].forEach(function(name) {
    $.animations[name] = $.extend({}, animation);
    if(name.indexOf('To') != -1)
      $.animations[name].direction = 'reverse';
  });
})(jQuery, window, document);
;;(function($, window, document, undefined) {
  function tile(wrapper, element, rows, cols) {
    var width = element.outerWidth();
    var height = element.outerHeight();
    var tileWidth = Math.round(width / cols);
    var tileHeight = Math.round(height / rows);
    var lastTileWidth = width - tileWidth * (cols - 1);
    var lastTileHeight = height - tileHeight * (rows - 1);
    var tiles = [];
    var isImg = element[0].tagName == 'IMG';
    if(isImg)
    {
      var src = element.attr('src');
      element.hide();
    }
    for(var i = 0;i < rows;++i)
    {
      var rowTiles = [];
      var useHeight = i == rows - 1 ? lastTileHeight : tileHeight;
      var y = -i * tileHeight;
      for(var j = 0;j < cols;++j)
      {
        var useWidth = j == cols - 1 ? lastTileWidth : tileWidth;
        var x = -j * tileWidth;
        if(isImg)
        {
          var tile = $('<span></span>');
          tile.css({
            width: useWidth,
            height: useHeight,
            display: 'inline-block',
            float: 'left',
            'background-position': x + 'px ' + y + 'px',
            'background-image': 'url(' + src + ')'
          });
        }
        else
        {
          var clone = i == 0 && j == 0 ? element : element.clone();
          var container = $.wrap(clone);
          container.css({
            width: width,
            height: height,
            display: 'inline-block'
          });
          container.vendorCss('transform', 'translate(' + x + 'px, ' + y + 'px)');
          var tile = $.wrap(container);
          tile.css({
            width: useWidth,
            height: useHeight,
            overflow: 'hidden',
            display: 'inline-block',
            float: 'left'
          });
        }
        
        rowTiles.push(tile);
        wrapper.append(tile);
      }
      tiles.push(rowTiles);
    }
    var display = wrapper.css('display') == 'block' ? 'block' : 'inline-block';
    wrapper.css({
      width: width,
      height: height,
      display: display
    });
    return tiles;
  }

  function validate(variable, defaultValue)
  {
    if(variable && $.isNumeric(variable) && variable > 0)
      return variable;
    return defaultValue;
  }

  function shuffle(array)
  {
    for(var i = 0;i < array.length;++i)
    {
      var r = parseInt(Math.random() * array.length);
      var tmp = array[i];
      array[i] = array[r];
      array[r] = tmp;
    }
    return array;
  }

  function createOrders(rows, cols, method)
  {
    if($.isArray(method))
      return method;
    if(!orderMethods[method])
      method = shuffle(methodNames)[0];
    return orderMethods[method](rows, cols);
  }

  var orderMethods = {
    lr: function(rows, cols) {
      var orders = [];
      for(var j = 0;j < cols;++j)
      {
        var step = [];
        for(var i = 0;i < rows;++i)
          step.push([i, j]);
        orders.push(step);
      }
      return orders;
    },
    rl: function(rows, cols) {
      return orderMethods.lr(rows, cols).reverse();
    },
    tb: function(rows, cols) {
      var orders = [];
      for(var i = 0;i < rows;++i)
      {
        var step = [];
        for(var j = 0;j < cols;++j)
          step.push([i, j]);
        orders.push(step);
      }
      return orders;
    },
    bt: function(rows, cols) {
      return orderMethods.tb(rows, cols).reverse();
    },
    lrtb: function(rows, cols) {
      var orders = [];
      for(var i = 0;i < rows;++i)
        for(var j = 0;j < cols;++j)
          orders.push([[i, j]]);
      return orders;
    },
    rlbt: function(rows, cols) {
      return orderMethods.lrtb(rows, cols).reverse();
    },
    rltb: function(rows, cols) {
      var orders = [];
      for(var i = 0;i < rows;++i)
        for(var j = cols - 1;j >= 0;--j)
          orders.push([[i, j]]);
      return orders;
    },
    lrbt: function(rows, cols) {
      return orderMethods.rltb(rows, cols).reverse();
    },
    tblr: function(rows, cols) {
      var orders = [];
      for(var j = 0;j < cols;++j)
        for(var i = 0;i < rows;++i)
          orders.push([[i, j]]);
      return orders;
    },
    btrl: function(rows, cols) {
      return orderMethods.tblr(rows, cols).reverse();
    },
    tbrl: function(rows, cols) {
      var orders = [];
      for(var j = cols - 1;j >= 0;--j)
        for(var i = 0;i < rows;++i)
          orders.push([[i, j]]);
      return orders;
    },
    btlr: function(rows, cols) {
      return orderMethods.tbrl(rows, cols).reverse();
    },
    random: function(rows, cols) {
      return shuffle(orderMethods.lrtb(rows, cols))
    },
    randomCols: function(rows, cols) {
      return shuffle(orderMethods.lr(rows, cols))
    },
    randomRows: function(rows, cols) {
      return shuffle(orderMethods.tb(rows, cols))
    }
  };
  var methodNames = [];
  for(var key in orderMethods)
    methodNames.push(key);

  var animation = {
    duration: 1000,
    emptyAnimation: true,
    wrap: true,
    variables: {
      rows: 1,
      cols: 1,
      effect: 'flyOut',
      ordering: true,
      order: null,
      cycle: null,
      adjustDuration: true
    },
    prepare: function(options) {
      var element = $(this);
      options.save = $.saveStyle(this, ['marginLeft', 'marginRight', 'marginTop', 'marginBottom', 'width', 'height', 'display']);
      options.wrapper.css({
        'margin-left': element.css('margin-left'),
        'margin-right': element.css('margin-right'),
        'margin-top': element.css('margin-top'),
        'margin-bottom': element.css('margin-bottom')
      });
      element.css({
        width: element.outerWidth() + 'px',
        height: element.outerHeight() + 'px',
        margin: '0'
      });
      var rows = validate(options.variables.rows, 1);
      var cols = validate(options.variables.cols, 1);
      var tiles = tile(options.wrapper, element, rows, cols);

      var subOptions = {};
      subOptions.duration = options.duration;
      subOptions.easing = options.easing;
      subOptions.delay = options.delay;
      subOptions.direction = options.direction;
      subOptions.repeat = options.repeat;
      subOptions.fillMode = options.fillMode;
      subOptions.timeout = options.timeout;

      var orders = createOrders(rows, cols, options.variables.order);
      var effects = options.variables.effect;
      if($.isFunction(effects))
      {
        for(var i = 0;i < orders.length;++i)
        {
          var step = orders[i];
          for(var j = 0;j < step.length;++j)
          {
            var pair = step[j];
            var row = pair[0];
            var col = pair[1];
            var cloneOptions = $.extend({}, subOptions);
            var effect = effects.call(this, cloneOptions, row, col);
            cloneOptions.noClear = true;
            tiles[row][col].animate(effect, cloneOptions);
          }
        }
        return;
      }

      if(!$.isArray(effects))
        effects = [effects];
      var effectsOptions = [];
      for(var i = 0;i < effects.length;++i)
      {
        var effect = effects[i];
        if(typeof(effect) != 'object')
          effect = {effect: effect};
        effect = $.extend({}, subOptions, effect);
        effect.noClear = true;
        effectsOptions.push(effect);
      }
      var steps = orders.length;
      var delay = subOptions.duration / steps;
      var cycle = validate(options.variables.cycle, steps);
      for(var i = 0;i < orders.length;++i)
      {
        var step = orders[i];
        if(options.variables.ordering)
        {
          var count = i;
          if(parseInt(count / cycle) % 2 == 0)
            count = count % cycle;
          else
            count = cycle - (count % cycle);
          var stepDelay = delay * count;
        }
        for(var j = 0;j < step.length;++j)
        {
          var pair = step[j];
          var n = i * step.length + j;
          var effectOptions = effectsOptions[n % effectsOptions.length];
          var cloneOptions = $.extend({}, effectOptions);
          var effect = cloneOptions.effect;
          delete cloneOptions.effect;
          if(options.variables.ordering)
          {
            cloneOptions.delay += stepDelay;
            if(options.variables.adjustDuration)
              cloneOptions.duration -= cloneOptions.delay;
          }
          tiles[pair[0]][pair[1]].animate(effect, cloneOptions);
        }
      }
    },
    clear: function(options) {
      $.restoreStyle(this, options.save);
    }
  };

  $.animations['tile'] = animation;
})(jQuery, window, document);
