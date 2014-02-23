;(function($, window, document, undefined) {
  var animation = '';
  var options = {};
  var optionIds = ['duration', 'repeat'];
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
      $('.animation-check:checked').filter(function(){
        if(this.id == lastChecked)
          return;
        $(this).attr('checked', false);
      });
    }

    animation = $.makeArray($('.animation-check:checked').map(function() {
      return $(this).attr('animation');
    })).join(' ');
    options = {};
    optionIds.forEach(function(id) {
      var input = $('#' + id);
      var name = input.attr('name');
      var value = input.val();
      if(input.attr('type') == 'number')
        value = parseInt(value);
      if(value)
        options[name] = value;
    });
    var optionsStr = JSON.stringify(options, null, 2);
    if(optionsStr == '{}')
      $('#code').text("$('#image').animate('" + animation + "');");
    else
      $('#code').text("$('#image').animate('" + animation + "', " + optionsStr +  "');");
  }

  function record()
  {
    var element = $('#' + $(this).attr('for'));
    if(element.is(':checked'))
      return;
    lastChecked = element.attr('id');
  }

  $(document).ready(function() {
    for(var key in $.animations)
    {
      if(key == 'fn')
        continue;
      var checkbox = $('<input type="checkbox" class="animation-check"/>');
      var id = 'a-' + key;
      checkbox.attr('id', id).attr('animation', key);
      var label = $('<label class="animation input"></lable>');
      label.text(key).attr('for', id).click(record);
      $('#animations').append(checkbox).append(label);

      var variables = $.animations[key].variables;
      if(!variables)
        continue;
      for(var variableName in variables)
      {
        var block = $('<div class="option-group"></div>');
        block.append('<h5>' + key + '\'s options</h5>');
        var type;
        switch(typeof variables[variableName])
        {
          case 'number':
            type = 'number';
            break;
          case 'boolean':
            type = 'checkbox';
            break;
          default:
            type = 'textbox';
            break
        }
        var input = $('<input>');
        id = 'o-' + key + '-' + variableName;
        input.attr('type', type).attr('id', id).attr('name', variableName);
        var label = $('<label></lable>');
        label.text(variableName).attr('for', id);
        optionIds.push(id);

        if(type == 'checkbox')
          block.append(input).append(label);
        else
          block.append(label).append(input);
        $('#options').append(block);
      }
    }

    $('#submit').click(animate);
    $('body').on('change', 'input', update);
  });
})(jQuery, window, document);
