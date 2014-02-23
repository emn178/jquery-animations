# jQuery-animations
A jQuery plugin provides CSS3 animations and develop framework.

## Download
[Compress](https://raw.github.com/emn178/jquery-animations/master/build/jquery.animations.min.js)  
[Uncompress](https://raw.github.com/emn178/jquery-animations/master/build/jquery.animations.js)

## Demo
[Effects](http://emn178.github.io/jquery-animations/samples/effects/)

## Browser Support
jQuery-animations currently supports IE10+, Chrome, Firefox, Safari and Opera.

## Usage
### Methods
#### .animate(name, [options])
Perform CSS3 animations. This method extends from [jQuery.animate()](https://api.jquery.com/animate/), so the options naming follows the its.

##### *name: `String`*

Sets the animation name(s) you want to perform. It could be a mutiple animations by including each one separated by a space.

Available animations please refer [Effects](http://emn178.github.io/jquery-animations/samples/effects/).

##### *options: `Object`*
Sets the customized options.

###### *duration: `Number` (default: animation define or `400`)*
Sets the number determining how long the animation will run(ms).

###### *delay: `Number` (default: animation define or `0`)*
Sets the number determining when the animation will start.(ms).

###### *repeat: `Number` or `String` (default: animation define or `1`)*
Sets the number determining the number of times an animation is played.

Available values please refer [animation-iteration-count](http://www.w3schools.com/cssref/css3_pr_animation-iteration-count.asp)

###### *easing: `String` (default: animation define or `ease`)*
Sets the easing function to use for the transition.

Available values please refer [animation-timing-function](http://www.w3schools.com/cssref/css3_pr_animation-timing-function.asp)

###### *complete: `Function(options)`*
Sets the callback function to call once the animation is complete.

###### *start: `Function(options)`*
Sets the callback function to call once the animation begins..

###### *fail: `Function(options)`*
Sets the callback function to call when the animation fails to complete .

###### *always: `Function(options)`*
Sets the callback function to call when the animation completes or stops without completing.

### Methods
#### .finish()
Stop CSS3 animations and trigger complete event. This method extends from [jQuery.finish()](https://api.jquery.com/finish/)

### Methods
#### .stop()
Stop CSS3 animations and trigger fail event. This method extends from [jQuery.stop()](https://api.jquery.com/stop/)

## Example

HTML
```HTML
<div id="#want-to-animate">
</div>
```
JavaScript
```JavaScript
$('#want-to-animate').animate('shake');
$('#want-to-animate').stop();
```
You can also combine multiple animations
```JavaScript
$('#want-to-animate').animate('flyToUp flyToRight fadeOut', {
  complete: function(options) {
    $('#want-to-animate').remove();
  }
});
```

## License
The project is released under the [MIT license](http://www.opensource.org/licenses/MIT).

## Contact
The project's website is located at https://github.com/emn178/jquery-animations  
Author: emn178@gmail.com
