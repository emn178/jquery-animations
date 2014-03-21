# jQuery-animations
A CSS3 animation framework based on jQuery providing an easy way to develop cross browser CSS3 animations.

For the user, it could be easy to use jQuery method to perform and combine the animations.

For the developer, it could be easy to develop cross browser CSS3 animations by using JavaScript.

## Download
[Compress](https://raw.github.com/emn178/jquery-animations/master/build/jquery.animations.min.js)  
[Uncompress](https://raw.github.com/emn178/jquery-animations/master/build/jquery.animations.js)

## Demo
[Effects](http://emn178.github.io/jquery-animations/samples/effects/)  
[Tile](http://emn178.github.io/jquery-animations/samples/tile/)  
[Integrate with CSS Library](http://jsfiddle.net/emn178/vN8V8/)

## Browser Support
jQuery-animations currently supports IE10+, Chrome, Firefox, Safari and Opera.

## Usage
### Methods
#### animate(id, [options])
Perform CSS3 animations. This method extends from [jQuery.animate()](https://api.jquery.com/animate/), so the options naming follows its.

##### *id: `String`*

Sets the animation ID(s) or name(s) you want to perform. It could be a mutiple animations by including each one separated by a space.

Available animations please refer to [Effects](http://emn178.github.io/jquery-animations/samples/effects/).

ID means that predined in JavaScript plugins, and name means that declares in CSS.

##### *options: `Object`*
Sets the animations options.

###### *duration: `Number` (default: animation define or `400`)*
Sets the number determining how long the animation will run(ms).

###### *delay: `Number` (default: animation define or `0`)*
Sets the number determining when the animation will start.(ms).

###### *repeat: `Number` or `String` (default: animation define or `1`)*
Sets the number determining the number of times an animation is played.

Available values please refer to [animation-iteration-count](http://www.w3schools.com/cssref/css3_pr_animation-iteration-count.asp)

###### *easing: `String` (default: animation define or `"ease"`)*
Sets the easing function to use for the transition.

Available values please refer to [animation-timing-function](http://www.w3schools.com/cssref/css3_pr_animation-timing-function.asp)

###### *direction: `String` (default: animation define or `"normal"`)*
Sets the property whether or not the animation should play in reverse on alternate cycles.

Available values please refer to [animation-direction](http://www.w3schools.com/cssref/css3_pr_animation-direction.asp)

###### *fillMode: `String` (default: animation define or `"none"`)*
Sets the property specifies what styles will apply for the element when the animation is not playing. You can use `reset()` method to clear the state after `forwards` or `both`.

Available values please refer to [animation-fill-mode](http://www.w3schools.com/cssref/css3_pr_animation-fill-mode.asp)

###### *combinable: `Boolean` (default: `false`)*
Sets the flag determining the animation combines with other animations. It will stop running animation when sets false.

###### *wrap: `Boolean` (default: `false`)*
Sets the flag determining the animations applies to a new wrapper.

###### *prepare: `Function(options)`*
Sets the callback function to call once animations are ready to begin.

###### *start: `Function(options)`*
Sets the callback function to call once the animation begins..

###### *complete: `Function(options)`*
Sets the callback function to call once the animation is complete.

###### *fail: `Function(options)`*
Sets the callback function to call when the animation fails to complete.

###### *always: `Function(options)`*
Sets the callback function to call when the animation completes or stops without completing.

###### *end: `Function(options)`*
Sets the callback function to call when the animation completes or stops without completing. But, if there is any animation running inside target element, it won't trigger untill all done.

###### *clear: `Function(options)`*
Sets the callback function to call when the animation clear or reset triggered.

###### *custom: `Object`*
Set customized options for each animation. Defines the same key as animation ID or name in this object. Customized options structure is the same with options of global.

###### *animation defined options*
There could be some plugin defined options, eg. `strength` option in `shake` animation.

#### animate(animation)
Perform CSS3 inlince animations. 

##### *animation: `Object`*
Extends options structure previously, but there must be a option `keyframes` in this object.

###### *keyframes: `Object`*
Specifies the keyframes of animation, just like css structure.

#### finish()
Stop CSS3 animations and trigger complete event. This method extends from [jQuery.finish()](https://api.jquery.com/finish/)

#### stop()
Stop CSS3 animations and trigger fail event. This method extends from [jQuery.stop()](https://api.jquery.com/stop/)

#### reset()
Clear CSS3 keyframe stopped after `forwards` and `both`.

## Example
Basic usage
```JavaScript
$('#want-to-animate').animate('shake');
```
You can also combine multiple animations once
```JavaScript
$('#want-to-animate').animate('flyToUp flyToRight fadeOut', {
  complete: function(options) {
    $('#want-to-animate').remove();
  }
});
```
Or combine multiple animations in different time
```JavaScript
$('#want-to-animate').animate('shake', {combinable: true});
$('#want-to-animate').animate('fadeOut', {combinable: true});
```
Inline animation
```JavaScript
$('#want-to-animate').animate({
  keyframes: {
    to: {
      transform: 'rotate(360deg)'
    }
  }
});
```
Sometimes you could combine mutiple animations frequent use to a new one.
```JavaScript
$.animations['hit'] = { fusion: 'fadeOut shake bounce' };
// now you can call the new animation 'hit'
$('#want-to-animate').animate('hit');
```
With options
```JavaScript
$('#want-to-animate').animate('animation1 animation2', {
  // Sets the number determining how long the animation will run(ms).
  duration: 400,

  // Sets the number determining when the animation will start.(ms).
  delay: 0,

  // Sets the number determining the number of times an animation is played.
  repeat: 1,

  // Sets the easing function to use for the transition.
  easing: 'ease',

  // Sets the property whether or not the animation should play in reverse on alternate cycles.
  direction: 'normal',

  // Sets the property specifies what styles will apply for the element when the animation is not playing.
  fillMode: 'none',

  // Sets the flag determining the animation combines with other animations. It will stop running animation when sets false.
  combinable: false,

  // Sets the callback function to call once animations are ready to begin.
  prepare: function() { },

  // Sets the callback function to call once the animation begins..
  start: function() { },

  // Sets the callback function to call once the animation is complete.
  complete: function() { },

  // Sets the callback function to call when the animation fails to complete.
  fail: function() { },

  // Sets the callback function to call when the animation completes or stops without completing.
  always: function() { },

  // Sets the callback function to call when the animation completes or stops without completing. But, if there is any animation running inside target element, it won't trigger untill all done.
  end: function() { },

  // Set customized options for each animation. Defines the same key as animation ID or name in this object. Customized options structure is the same with options of global.
  custom: {
    animation1: {
      // specify options for this animation...

      duration: 1000

      // ...
    }
  },

  // There could be some plugin defined options.
  var1: 'something'

  // ...
});
```
## Developer Documentation
Coming soon.

## License
The project is released under the [MIT license](http://www.opensource.org/licenses/MIT).

## Contact
The project's website is located at https://github.com/emn178/jquery-animations  
Author: emn178@gmail.com
