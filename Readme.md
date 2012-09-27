#jQuery Fluid Board

A dynamic fluid layout plugin for jQuery.

##Demo
* [jQuery Fluid Board - Demo](http://fc2ist.github.com/jquery.fluidboard/demo.html)

##Usage
~~~~~
// Options(Default value)
var options = {
  itemSelector: null  // Filters item elements to selector
       ,colnum: 2     // Number of columns
   ,responsive: 0     // Settings max width(px) of columns and dynamic "colnum"
       ,gutter: 10    // Gitter width
     ,throttle: 10    // Throttle number of resize event
       ,resize: true  // Settings Resize event
   ,isAnimated: false // Enable jQuery animation on layout changes
   ,animationOptions: {
      duration: 200
       ,easing: 'linear'
        ,queue: false
    }
};

// Attach .container
$('.container').fluidboard(options);
~~~~~

##Animation
I recommend *CSS3* `transition`
~~~~~
.container .item {
  -webkit-transition: .2s;
  -moz-transition   : .2s;
  -o-transition     : .2s;
  -ms-transition    : .2s;
  transition        : .2s;
}
~~~~~

##Operations

###Destroy

~~~~~
$('.container').fluidboard('destroy');
~~~~~

###Reload

~~~~~
$('.container').fluidboard('reload');
~~~~~

###Reset Options

~~~~~
$('.container').fluidboard('option', 'colnum', 4);

or

$('.container').fluidboard('option', {
  colnum: 4,
  gutter: 20
});
~~~~~

##Dependence
jQuery v1.8+ (Vender prefix of `.css` be omitted)
