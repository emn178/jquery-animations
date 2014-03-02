/*
 * jQuery-animations v0.2.2
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
        this.fusions[0].start =  [this.taskOptions.start, this.fusions[0].start];
        this.fusions[0].complete =  [this.taskOptions.complete, this.fusions[0].complete];
        this.fusions[0].always =  [this.taskOptions.always, this.fusions[0].always];
        this.fusions[0].fail =  [this.taskOptions.fail, this.fusions[0].fail];
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
    delete this.taskOptions.start;
    delete this.taskOptions.complete;
    delete this.taskOptions.always;
    delete this.taskOptions.fail;
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
      options.direction = options.direction || animation.direction || 'normal';
      options.easing = options.easing || animation.easing || 'ease';
      options.delay = options.delay || animation.delay || 0;
      options.repeat = options.repeat || animation.repeat || 1;
      options.fillMode = options.fillMode || animation.fillMode || 'none';
      options.timeout = options.timeout || 500;
      options.start = [options.start, animation.start];
      options.complete = [animation.complete, options.complete];
      options.always = [animation.always, options.always];
      options.fail = [animation.fail, options.fail];
      options.name = animation.name;
      options.keyframes = animation.keyframes;
      options.variables = {};
      for(var variableName in animation.variables)
        options.variables[variableName] = options[variableName] || animation.variables[variableName];

      this.jobsOptions.push(options);
    } 
    this.taskOptions.start = this.options.start;
    this.taskOptions.complete = this.options.complete;
    this.taskOptions.always = this.options.always;
    this.taskOptions.fail = this.options.fail;
  };

  function Task(element, options, jobsOptions)
  {
    this.element = $(element);
    this.options = options;
    this.jobsOptions = jobsOptions;
    this.counter = {
      complete: 0,
      fail: 0,
      always: 0
    };
  }

  Task.prototype.start = function() {
    this.combine();
    var tasks = parseInt(this.element.attr('animation-tasks')) || 0;
    if(!tasks)
      this.cleaner = true;
    ++tasks;
    this.element.attr('animation-tasks', tasks);
    this.ontasksend = this.ontasksend.bind(this);
    this.oncancel = this.oncancel.bind(this);
    this.onfinish = this.onfinish.bind(this);
    this.element.on('tasksend', this.ontasksend);
    this.element.on('animationcancel', this.oncancel);
    this.element.on('animationfinish', this.onfinish);
    callback(this.options.start, this.element, [this.options]);

    this.actor = this.element;
    var css = '';
    var jobs = [];
    for(var i = 0;i < this.jobsOptions.length;++i)
    {
      if(this.options.combinable || i > 0)
        this.actor = wrap(this.actor, $('<span></span>'));
      var options = $.extend({}, this.jobsOptions[i]);

      callback(options.start, this.actor[0], [options])
      if(options.keyframes)
      {
        options.name = 'a' + ++id;
        css += generateKeyframeCss({
          name: options.name,
          keyframes: options.keyframes,
          variables: options.variables
        });
      }

      options.complete = [options.complete, this.oncomplete.bind(this)];
      options.fail = [options.fail, this.onfail.bind(this)];
      options.always = [options.always, this.onalways.bind(this)];
      jobs.push(new Job(this.actor, options));
    }

    this.style = $('<style></style>');
    this.style.html(css);
    $('head').append(this.style);

    for(var i = 0;i < jobs.length;++i)
      jobs[i].start();
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
    var tasks = parseInt(this.element.attr('animation-tasks')) || 0;
    if(tasks == 1)
      this.element.removeAttr('animation-tasks');
    else
      this.element.attr('animation-tasks', tasks - 1);
    if(tasks == 1 && !this.hasOtherTasks())
      this.element.trigger('tasksend');
  };

  Task.prototype.ontasksend = function() {
    if(!this.isDone())
      return;
    this.clear();
    if(this.counter.complete > 0)
      callback(this.options.complete, this.element[0], [this.options]);
    if(this.counter.fail == this.counter.always)
      callback(this.options.fail, this.element[0], [this.options]);
    callback(this.options.always, this.element[0], [this.options]);
  };

  Task.prototype.oncancel = function(e) {
    if(e.target != this.element[0])
      e.stopPropagation();
  };

  Task.prototype.onfinish = function(e) {
    if(e.target != this.element[0])
      e.stopPropagation();
  };

  Task.prototype.isDone = function() {
    return this.counter.always == this.jobsOptions.length
  };

  Task.prototype.hasOtherTasks = function() {
    return this.element.find('[animation-tasks]').length > 0;
  };

  Task.prototype.clear = function() {
    this.element.off('tasksend', this.onend);
    this.element.off('animationcancel', this.oncancel);
    this.element.off('animationfinish', this.onfinish);
    this.element.removeAttr('animation-combinable');
    this.style.remove();
    if(!this.cleaner)
      return;
    var wrapper = this.actor;
    while(wrapper.parent().attr('animation-wrapper') == 1)
      wrapper = wrapper.parent();
    if(wrapper != this.element)
      wrapper.replaceWith(this.element);
  };

  function Job(element, options)
  {
    this.element = $(element);
    this.options = options;
  }

  Job.prototype.start = function() {
    var options = this.options;
    var element = this.element;

    // name duration timing-function delay iteration-count direction fill-mode play-state
    var properties = [
      options.name, 
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

    this.onstart = this.onstart.bind(this);
    this.onend = this.onend.bind(this);
    this.onfail = this.onfail.bind(this);
    this.oncancel = this.oncancel.bind(this);
    this.onfinish = this.onfinish.bind(this);
    element.on(animationstart, this.onstart);
    element.on(animationend, this.onend);
    element.on('animationfail', this.onfail);
    element.on('animationcancel', this.oncancel);
    element.on('animationfinish', this.onfinish);
    observe(element, new Date().getTime() + options.delay + options.timeout);
  };

  Job.prototype.onstart = function(e) {
    unobserve(this.element);
  };

  Job.prototype.onfail = function(e) {
    e.stopPropagation();
    this.finish(false);
  };

  Job.prototype.oncancel = function(e) {
    this.finish(false);
  };

  Job.prototype.onend = function(e) {
    e.stopPropagation();
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
    element.css('animation', '');
    element.css(vendorPrefix + 'animation', '');
    callback(success ? options.complete : options.fail, this.element[0], [options]);
    callback(options.always, this.element[0], [this.options]);
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
      deadline = parseInt(deadline);
      if(now > deadline)
      {
        observation.removeAttr('animation-deadline');
        observation.trigger('animationfail');
      }
      else
        remains.push(observation);
    }
    observations = remains;
  }

  function observe(element, deadline)
  {
    element.attr('animation-deadline', deadline);
    observations.push(element);
  }

  function unobserve(element)
  {
    element.removeAttr('animation-deadline');
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
  };

  function wrap(element, wrapper) 
  {
    if(element.css('display') == 'block')
      wrapper.css('display', 'block');
    else if(supportFlex)
      wrapper.css('display', 'inline-flex');
    else
      wrapper.css('display', 'inline-block');
    wrapper.attr('animation-wrapper', 1);
    element.wrap(wrapper);
    return element.parent();
  }

  function generateKeyframeCss(options) {
    return generateKeyframeCssByPrefix('', options) + generateKeyframeCssByPrefix(vendorPrefix, options);
  };

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
  };

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

  var timer = setInterval(checkFail, 100);
})(jQuery, window, document);
