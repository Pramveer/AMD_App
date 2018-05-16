$("#volume").slider({
    min: 0,
    max: 4,
    value: 0,
		range: "min",
		animate: true,
    slide: function(event, ui) {
      setVolume((ui.value) / 100);
    }
  });

  var myMedia = document.createElement('audio');


function setVolume(myVolume) {
    var myMedia = document.getElementById('myMedia');
}