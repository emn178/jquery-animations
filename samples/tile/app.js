;(function($, window, document, undefined) {
  var animation = 'tile';
  var effect = '';
  var options = {};
  var lastChecked;

  function animate()
  {
    $('#image').animate(animation, options);
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

    options = {};
    options.effect = $.makeArray($('#effect .animation-check:checked').map(function() {
      return $(this).attr('animation');
    })).join(' ');
    if(!options.effect)
      delete options.effect;
    var alternate = $.makeArray($('#alternate .animation-check:checked').map(function() {
      return $(this).attr('animation');
    })).join(' ');
    if(alternate)
      if(options.effect)
        options.effect = [options.effect, alternate];
      else
        options.effect = alternate;
    $('.option-group select, .option-group input').each(function() {
      var element = $(this);
      var name = element.attr('name');
      var value = element.val();
      if(element.attr('type') == 'checkbox')
      {
        options[name] = element.is(':checked');
        return;
      }
      if(element.attr('type') == 'number')
        value = parseInt(value);
      if(value)
        options[name] = value;
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

  function addButton(key, container)
  {
    var checkbox = $('<input type="checkbox" class="animation-check"/>');
    checkbox.attr('id', container + key).attr('animation', key);
    var label = $('<label class="animation input"></lable>');
    label.text(key).attr('for', container + key).click(click);
    $('#' + container).append(checkbox).append(label);
  }

  $(document).ready(function() {
    for(var key in $.animations)
    {
      if(key == 'fn' || key == 'tile')
        continue;
      addButton(key, 'effect');
      addButton(key, 'alternate');
      // add(key);
    }

    $('#submit').click(animate);
    $('body').on('change', 'input,select', update);

    var img = $('#image')[0];
    if(img.complete || img.readyState === 4)
      splash();
    else
      $('#image').bind('load', splash);
  });

  function splash()
  {
    $('#image').animate('tile', {
      duration: 2500,
      rows: 12,
      cols: 8,
      effect: 'flyIn',
      fillMode: 'backwards'
    });
  }
})(jQuery, window, document);
