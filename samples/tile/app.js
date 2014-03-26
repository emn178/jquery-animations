;(function($, window, document, undefined) {
  var animation = 'tile';
  var effect = '';
  var options = {};
  var lastChecked;
  var lastChecked2;

  function animate()
  {
    if($.isEmptyObject(options))
      $('#code').text("$('#image').animate('" + animation + "');");
    else
      $('#code').text("$('#image').animate('" + animation + "', " + JSON.stringify(options, null, 2) +  ");");
    $('#image').animate(animation, options);
  }

  function update()
  {
    var isCombine = $('#combine').is(':checked');
    if(!isCombine)
    {
      $('#effect .animation-check:checked').filter(function() {
        if(this.id == lastChecked)
          return;
        $(this).attr('checked', false);
      });
    }

    isCombine = $('#combine2').is(':checked');
    if(!isCombine)
    {
      $('#alternate .animation-check:checked').filter(function() {
        if(this.id == lastChecked2)
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
    {
      if(element.parents('#effect').length > 0)
        lastChecked = animationId;
      else
        lastChecked2 = animationId;
    }
  }

  function addButton(key, container)
  {
    var checkbox = $('<input type="checkbox" class="animation-check"/>');
    checkbox.attr('id', container + key).attr('animation', key);
    var label = $('<label class="animation input"></label>');
    label.text(key).attr('for', container + key).click(click);
    $('#' + container).append(checkbox).append(label);
  }

  $(document).ready(function() {
    for(var key in $.animations)
    {
      if(key == 'fn' || key == 'tile')
        continue;
      addButton(key, 'effects');
      addButton(key, 'alternates');
    }

    $('#submit').click(animate);
    $('body').on('change', 'input,select', update);

    var img = $('#image')[0];
    if(img.complete || img.readyState === 4)
      assemble();
    else
      $('#image').bind('load', assemble);

    $('#assemble').click(assemble);
    $('#blind').click(blind);
    $('#wave').click(wave);
    $('#flutter').click(flutter);
    $('#puzzle').click(puzzle);
  });

  function assemble() {
    options = {
      duration: 2000,
      rows: 12,
      cols: 8,
      effect: 'flyIn',
      fillMode: 'backwards'
    }
    animate();
  }

  function blind() {
    options = {
      duration: 2000,
      rows: 50,
      sequent: false,
      effect: 'slideFromDown'
    };
    animate();
  }

  function wave() {
    options = {
      duration: 2000,
      rows: 200,
      effect: 'shake',
      cycle: 50,
      sequence: 'tb',
      adjustDuration: false
    };
    animate();
  }

  function flutter() {
    options = {
      duration: 2000,
      cols: 200,
      effect: 'bounce',
      sequence: 'lr'
    };
    animate();
  }

  function puzzle() {
    options = {
      duration: 2000,
      rows: 9,
      cols: 9,
      effect: [
        'slideFromDown',
        'slideFromRight',
        'slideFromUp',
        'slideFromLeft'
      ],
      sequence: 'lrtb',
      sequent: false,
      adjustDuration: true
    };
    animate();
  }
})(jQuery, window, document);
