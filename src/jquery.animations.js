/*
 * jQuery-animations v0.4.1
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
  var animationiteration = 'animationiteration webkitAnimationIteration oAnimationIteration';
  var vendorPrefix = '';
  $(['WebkitTransform', 'MozTransform', 'msTransform', 'OTransform']).each(function(i, v) {
    if(v in document.documentElement.style)
      vendorPrefix = ['-webkit-', '-moz-', '-ms-', '-o-'][i];
  });

  var testElement = document.createElement('DIV');
  testElement.style.display = 'inline-flex';
  var supportFlex = testElement.style.display == 'inline-flex';
  testElement = null;

  var firefox = navigator.userAgent.toLowerCase().indexOf('firefox') != -1;

  var id = 0;
  var taskId = 0;
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
      if(this.shortcuts.length > 0)
      {
        this.shortcuts[0].prepare =  [this.taskOptions.prepare, this.shortcuts[0].prepare];
        this.shortcuts[0].start =  [this.taskOptions.start, this.shortcuts[0].start];
        this.shortcuts[0].complete =  [this.taskOptions.complete, this.shortcuts[0].complete];
        this.shortcuts[0].always =  [this.taskOptions.always, this.shortcuts[0].always];
        this.shortcuts[0].fail =  [this.taskOptions.fail, this.shortcuts[0].fail];
        this.shortcuts[0].end =  [this.taskOptions.end, this.shortcuts[0].end];
        this.shortcuts[0].clear =  [this.taskOptions.clear, this.shortcuts[0].clear];
      }
    }
    else
    {
      this.elements.each(function(i, element) {
        new Task(element, this.taskOptions, this.jobsOptions).start();
      }.bind(this));
    }
    for(var i = 0;i < this.shortcuts.length;++i)
      animate.call(this.elements, this.shortcuts[i].shortcut, this.shortcuts[i]);
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
    this.shortcuts = [];
    var custom = this.taskOptions.custom || {};
    for(var i = 0;i < this.animations.length;++i)
    {
      // prepare options
      var animation = this.animations[i];
      var options;
      if(animation.shortcut)
      {
        options = $.extend({}, this.taskOptions, animation, custom[animation.id]);
        this.taskOptions.combinable = true;
        options.combinable = true;
        options.shortcut = animation.shortcut;
        this.shortcuts.push(options);
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
      options.resize = animation.resize;
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
    this.taskId = taskId++;
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
    var tasks = this.element.attr('animation-tasks') || 0;
    if(tasks == 0)
      this.cleaner = true;
    this.element.attr('animation-tasks', tasks + 1);
    addTaskId(this.element, this.taskId);
    if(!this.options.derivative && !this.element.attr('animation-wrapper'))
    {
      this.styleState = $.saveStyle(this.element, ['marginLeft', 'marginRight', 'marginTop', 'marginBottom', 'width', 'height', 'display', 'position']);
      this.styleState2 = $.saveStyle(this.element.children().first(), ['marginTop']);
    }
    this.ontasksend = this.ontasksend.bind(this);
    this.onstart = this.onstart.bind(this);
    this.oncancel = this.oncancel.bind(this);
    this.onfinish = this.onfinish.bind(this);
    this.onresize = this.onresize.bind(this);
    this.onremove = this.onremove.bind(this);
    this.element.on('animationtasksend', this.ontasksend);
    this.element.on('animationcancel', this.oncancel);
    this.element.on('animationfinish', this.onfinish);
    this.element.on('animationresize', this.onresize);
    this.element.on('remove', this.onremove);
    callback(this.options.prepare, this.element[0], [this.options]);

    this.actor = this.element;
    this.jobs = [];
    this.jobsOptions.sort(function(a, b) {
      return a.wrap ? -1 : (b.wrap ? 1 : 0);
    });

    if(!this.options.autoWrap)
      this.combineOptions();

    var css = '';
    for(var i = 0;i < this.jobsOptions.length;++i)
    {
      var options = $.extend({}, this.jobsOptions[i]);
      var logs = [];
      if(this.options.combinable || i > 0)
      {
        var element = this.actor;
        this.actor = wrap(this.actor);
        logs.push({element: element, wrapper: this.actor});
      }
      if(options.fillMode == 'forwards' || options.fillMode == 'both')
        this.reset = false;
      if(options.wrap)
      {
        options.wrapper = wrap(this.actor);
        logs.push({element: this.actor, wrapper: options.wrapper});
      }

      var preparesOptions = options.combinedJobs || [options];
      for(var j = 0;j < preparesOptions.length;++j)
      {
        var prepareOptions = preparesOptions[j];
        prepareOptions.variables = $.extend({}, prepareOptions.variables);
        callback(prepareOptions.prepare, this.actor[0], [prepareOptions]);
        if(prepareOptions.keyframes)
        {
          prepareOptions.name = 'a' + ++id;
          prepareOptions.keyframeCss = generateKeyframeCss({
            name: prepareOptions.name,
            keyframes: prepareOptions.keyframes,
            variables: prepareOptions.variables
          });
          css += prepareOptions.keyframeCss;
        }
      }

      options.start = [options.start, this.onstart.bind(this)];
      options.complete = [options.complete, this.oncomplete.bind(this)];
      options.fail = [options.fail, this.onfail.bind(this)];
      options.always = [options.always, this.onalways.bind(this)];
      options.originalElement = this.element;
      options.element = this.actor;
      var job = new Job(this.actor, options);
      job.logs = logs;
      this.jobs.push(job);
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

  Task.prototype.onresize = function(e) {
    e.stopPropagation();
    if(!this.options.derivative)
    {
      $.restoreStyle(this.element, this.styleState);
      $.restoreStyle(this.element.children().first(), this.styleState2);
    }
    var changed = false;
    var css = '';
    for(var i = 0;i < this.jobs.length;++i)
    {
      var job = this.jobs[i];
      for(var j = 0;j < job.logs.length;++j)
      {
        var log = job.logs[j];
        formatStyle(log.element, log.wrapper);
      }
      job.resize();

      var preparesOptions = job.preparesOptions;
      for(var j = 0;j < preparesOptions.length;++j)
      {
        var prepareOptions = preparesOptions[j];
        if(prepareOptions.keyframes)
        {
          var keyframeCss = generateKeyframeCss({
            name: prepareOptions.name,
            keyframes: prepareOptions.keyframes,
            variables: prepareOptions.variables
          });
          css += keyframeCss;
          if(prepareOptions.keyframeCss != keyframeCss)
          {
            job.refresh(prepareOptions.name);
            prepareOptions.keyframeCss = keyframeCss;
            changed = true;
          }
        }
      }
    }
    if(changed && this.style)
      this.style.html(css);
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
    var tasks = parseInt(this.element.attr('animation-tasks'));
    if(tasks == 1 && !this.hasOtherTasks())
    {
      this.element.removeAttr('animation-tasks');
      this.element.trigger('animationtasksend');
    }
    else
      this.element.attr('animation-tasks', tasks - 1);
  };

  Task.prototype.ontasksend = function() {
    if(!this.isDone())
      return;
    this.element.off('animationtasksend', this.onend);
    this.element.off('animationcancel', this.oncancel);
    this.element.off('animationfinish', this.onfinish);
    this.element.removeAttr('animation-combinable');
    if(!this.options.derivative && (this.reset || this.counter.fail == this.counter.always))
      this.clear();
    else
    {
      this.element.attr('animation-resetable', 1);
      this.onreset = this.onreset.bind(this);
      this.element.on('animationreset animationcancel animationfinish', this.onreset);
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
    this.element.off('animationcancel', this.onreset);
    this.element.off('animationfinish', this.onreset);
    this.element.removeAttr('animation-resetable');
    this.clear();
  };

  Task.prototype.onremove = function(e) {
    if(this.style)
      this.style.remove();
  };

  Task.prototype.isDone = function() {
    return this.counter.always == this.jobsOptions.length
  };

  Task.prototype.hasOtherTasks = function() {
    return this.element.find('[animation-tasks]').length > 0;
  };

  Task.prototype.clear = function() {
    this.element.off('animationresize', this.onresize);
    this.element.off('remove', this.onremove);
    removeTaskId(this.element, this.taskId);
    this.element.removeAttr('animation-display');
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
    $.restoreStyle(this.element, this.styleState);
    $.restoreStyle(this.element.children().first(), this.styleState2);
  };

  function Job(element, options)
  {
    this.element = $(element);
    this.options = options;
    this.updateAnimations = {};
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
      for(var i = 0;i < this.preparesOptions.length;++i)
      {
        var prepareOptions = this.preparesOptions[i];
        this.startTimer = setTimeout(this.execStart.bind(this), prepareOptions.delay);
        var repeat = parseInt(prepareOptions.repeat);
        if(!isNaN(repeat))
        {
          this.endTimer = setTimeout(function() {
            this.finish(true);
          }.bind(this), prepareOptions.delay + prepareOptions.duration * repeat);
        }
      }
    }
    else
    {
      element.vendorCss('animation', element.attr('animation-prepare'));
      element.removeAttr('animation-prepare');
      this.onend = this.onend.bind(this);
      this.oniteration = this.oniteration.bind(this);
      element.on(animationend, this.onend);
      element.on(animationiteration, this.oniteration);
      for(var i = 0;i < this.preparesOptions.length;++i)
        observe(element, new Date().getTime() + this.preparesOptions[i].delay + this.preparesOptions[i].timeout);
    }
  };

  Job.prototype.prepare = function() {
    this.preparesOptions = this.options.combinedJobs || [this.options];
    for(var i = 0;i < this.preparesOptions.length;++i)
      this.preparesOptions[i].remainingRepeat = this.preparesOptions[i].repeat;
    this.combinedCount = this.preparesOptions.length;
    this.element.attr('animation-prepare', this.generateAnimationCss(this.preparesOptions));
  };

  Job.prototype.generateAnimationCss = function(preparesOptions) {
    var properties = [];
    for(var i = 0;i < preparesOptions.length;++i)
    {
      var options = preparesOptions[i];
      properties.push([
        options.name, 
        options.duration / 1000 + 's', 
        options.easing, 
        options.delay / 1000 + 's', 
        options.remainingRepeat, 
        options.direction,
        options.fillMode,
      ].join(' '));
    }
    return properties.join(',');
  };

  Job.prototype.onstart = function(e) {
    e.stopPropagation();
    this.execStart();
  };

  Job.prototype.execStart = function() {
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

  Job.prototype.oniteration = function(e) {
    e.stopPropagation();
    var animationName = e.originalEvent.animationName;
    var tempOptions = []
    for(var i = 0;i < this.preparesOptions.length;++i)
    {
      var options = this.preparesOptions[i];
      if(options.name != animationName)
      {
        tempOptions.push(options);
        continue;
      }
      if(options.remainingRepeat != 'infinite')
        --options.remainingRepeat;
    }
    if(!this.updateAnimations[animationName])
      return;
    this.updateAnimations[animationName] = false;

    var element = this.element;
    element.vendorCss('animation', this.generateAnimationCss(tempOptions));
    setTimeout(function() {
      element.vendorCss('animation', this.generateAnimationCss(this.preparesOptions));
    }.bind(this), 1);
  };

  Job.prototype.onfinish = function(e) {
    this.finish(true);
  };

  Job.prototype.finish = function(success) {
    var options = this.options;
    var element = this.element;
    element.off(animationstart, this.onstart);
    element.off(animationend, this.onend);
    element.off(animationiteration, this.oniteration);
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

  Job.prototype.resize = function() {
    callback(this.options.resize, this.element[0], [this.options]);
  };

  Job.prototype.refresh = function(animationName) {
    this.updateAnimations[animationName] = true;
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
      && !options.emptyAnimation
      && isEmptyCallbacks(options.start)
      && isEmptyCallbacks(options.complete)
      && isEmptyCallbacks(options.always)
      && isEmptyCallbacks(options.fail)
      && isEmptyCallbacks(options.end)
      && isEmptyCallbacks(options.clear)
      && isEmptyCallbacks(options.reset);
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
    formatStyle(element, wrapper);
    element.wrap(wrapper);
    return element.parent();
  }

  function formatStyle(element, wrapper)
  {
    if(wrapper.attr('animation-display'))
      wrapper.css('display', wrapper.attr('animation-display'));
    else
    {
      var display = element.attr('animation-display') || element.css('display');
      element.attr('animation-display', display);
      
      if(display == 'inline')
      {
        if(supportFlex)
          display = 'inline-flex';
        else
          display = 'inline-block';
      }
      wrapper.css('display', display);
    }

    wrapper.attr('animation-wrapper', 1);
    if(element.css('float') != 'none')
      wrapper.css('float', element.css('float'));

    var margin = {
      'margin-left': element.css('margin-left'),
      'margin-right': element.css('margin-right'),
      'margin-top': element.css('margin-top'),
      'margin-bottom': element.css('margin-bottom'),
    };
    if(firefox)
    {
      var rect = element[0].getBoundingClientRect();
      element.css('margin', 0);
      var rect2 = element[0].getBoundingClientRect();
      if(margin['margin-left'] == '0px')
        margin['margin-left'] = rect.left - rect2.left;
    }
    wrapper.css(margin);
    wrapper.css({
      'width': element.outerWidth(),
      'height': element.outerHeight(),
    });
    element.css({
      width: element.width(),
      height: element.height(),
      margin: 0
    });
    if(!element.attr('animation-wrapper'))
      element.children().first().css('margin-top', 0);

    if(element.css('position') != 'static')
    {
      wrapper.css('position', element.css('position'));
      wrapper.css('z-index', element.css('z-index'));
      wrapper.css('left', element.css('left'));
      wrapper.css('right', element.css('right'));
      wrapper.css('top', element.css('top'));
      wrapper.css('bottom', element.css('bottom'));
      element.css('position', 'static');
    }
  }


  function saveStyle(element, properties)
  {
    element = $(element)[0];
    if(!element)
      return;
    var style = {};
    for(var i = 0;i < properties.length;++i)
      style[properties[i]] = element.style[properties[i]];
    return style;
  }

  function restoreStyle(element, style)
  {
    element = $(element)[0];
    if(!element)
      return;
    for(var propertyName in style)
      element.style[propertyName] = style[propertyName];
  }

  function addTaskId(element, taskId)
  {
    var taskIds = getTaskIds(element);
    taskIds.push(taskId);
    element.attr('animation-tasksIds', taskIds.join(','));
  }

  function removeTaskId(element, taskId)
  {
    var taskIds = getTaskIds(element).filter(function(id) {
      return id != taskId;
    });
    var attr = taskIds.join(',');
    if(attr)
      element.attr('animation-tasksIds', attr);
    else
      element.removeAttr('animation-tasksIds');
  }

  function getTaskIds(element)
  {
    var taskIds = element.attr('animation-tasksIds');
    return taskIds ? taskIds.split(',') : [];
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

  var exclusions = ['id', 'prepare', 'start', 'complete', 'always', 'fail', 'end', 'clear', 'reset', 'name', 'keyframes', 'emptyAnimation', 'wrap', 'combinable', 'wrapper', 'element', 'originalElement', 'prepareOptions'];
  function cloneBasicOptions(options)
  {
    var cloneOptions = $.extend({}, options);
    exclusions.forEach(function(key) {
      delete cloneOptions[key];
    });
    return cloneOptions;
  }

  $.animations = {};
  $.wrap = wrap;
  $.defineAnimation = defineAnimation;
  $.saveStyle = saveStyle;
  $.restoreStyle = restoreStyle;
  $.cloneBasicOptions = cloneBasicOptions;
  $.resizeDebouncing = 150;

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

  $.event.special.remove = {
    remove: function(o) {
      if (o.handler) {
        o.handler()
      }
    }
  };

  var resizeTimer;
  function resize()
  {
    if(resizeTimer)
    {
      clearTimeout(resizeTimer);
      resizeTimer = null;
    }
    resizeTimer = setTimeout(function() {
      $('[animation-wrapper]').css({
        display: '',
        width: '',
        height: '',
        float: '',
        position: '',
        margin: ''
      });

      var tasks = [];
      var ids = {};
      $('[animation-tasksIds]').each(function(){
        var element = $(this);
        var taskIds = getTaskIds(element);
        for(var i = 0;i < taskIds.length;++i)
        {
          var id = taskIds[i];
          if(ids[id])
            continue;
          ids[id] = true;
          tasks.push({id: id, element: element});
        }
      });
      tasks = tasks.sort(function(a, b) {
        return a.id - b.id;
      });
      for(var i = 0;i < tasks.length;++i)
        tasks[i].element.trigger('animationresize');
    }, $.resizeDebouncing);
  }

  $(window).resize(resize);

  var timer = setInterval(checkFail, 100);
})(jQuery, window, document);
