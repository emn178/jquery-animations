;(function($, window, document, undefined) {
  var animation = '';
  var options = {};
  var lastChecked;

  function animate()
  {
    $('#image').animate(animation, options);
  }

  function add(animationId)
  {
    var element = $('.global').clone();
    element.removeClass('global').addClass('custom disable').attr('id', 'option-' + animationId).attr('animation-id', animationId);
    element.find('h5').text(animationId);
    var animation = $.animations[animationId];
    element.find('label').each(function() {
      var label = $(this);
      var variable = label.attr('for');
      if(label.hasClass('custom') && !(animation.variables && variable in animation.variables))
      {
        element.find('[name=' + variable + ']').remove();
        label.remove();
      }
      else
        label.attr('for', animationId + '-' + variable);
    });
    element.find('input,select').each(function(){
      $(this).attr('id', animationId + '-' + $(this).attr('id'));
      $(this).val('');
    });
    $('#options-wrap').append(element);
  }

  function update()
  {
    var isCombine = $('#combine').is(':checked');
    if(!isCombine)
    {
      $('.animation-check:checked').filter(function() {
        if(this.id == lastChecked)
          return;
        $(this).attr('checked', false);
      });
    }

    animation = $.makeArray($('.animation-check:checked').map(function() {
      return $(this).attr('animation');
    })).join(' ');
    if(!animation)
    {
      $('#code').text(' ');
      return;
    }
    options = {};
    $('.global select, .global input').each(function() {
      var element = $(this);
      var name = element.attr('name');
      var value = element.val();
      if(element.attr('type') == 'number')
        value = parseInt(value);
      if(value)
        options[name] = value;
    });


    $('.custom:not(.disable)').each(function() {
      var custom = $(this);
      var id = custom.attr('animation-id');
      options.custom = options.custom || {};
      var customOptions = options.custom[id] = {};
      custom.find('input, select').each(function() {
        var element = $(this);
        var name = element.attr('name');
        var value = element.val();
        if(element.attr('type') == 'number')
          value = parseInt(value);
        if(value)
          customOptions[name] = value;
      });
      if($.isEmptyObject(customOptions))
        delete options.custom[id];
    });
    if($.isEmptyObject(options.custom))
      delete options.custom;

    if($.isEmptyObject(options))
      $('#code').text("$('#image').animate('" + animation + "');");
    else
      $('#code').text("$('#image').animate('" + animation + "', " + JSON.stringify(options, null, 2) +  ");");
  }

  function click()
  {
    var element = $('#' + $(this).attr('for'));
    var animationId = element.attr('id');
    $('#option-' + animationId).toggleClass('disable');
    if(!element.is(':checked'))
      lastChecked = animationId;
  }

  $(document).ready(function() {
    for(var key in $.animations)
    {
      if(key == 'fn')
        continue;
      var checkbox = $('<input type="checkbox" class="animation-check"/>');
      checkbox.attr('id', key).attr('animation', key);
      var label = $('<label class="animation input highlight"></lable>');
      label.text(key).attr('for', key).click(click);
      $('#animations').append(checkbox).append(label);
      add(key);
    }

    $('#submit').click(animate);
    $('body').on('change', 'input,select', update);

    $('.animation').animate('flyIn', {
      duration: 1500,
      always: function() {
        $(this).removeClass('highlight');
      }
    });
  });
})(jQuery, window, document);
