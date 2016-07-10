/**
 * @author boxizen
 * @description 程序控制
 */

;(function(global) {
  
  function AudioEffect(audio) {
    this.audio = audio;
    this.init();
  }

  AudioEffect.prototype = {
  	/*BiquadFilterType: {
	    "lowpass",
	    "highpass",
	    "bandpass",
	    "lowshelf",
	    "highshelf",
	    "peaking",
	    "notch",
	    "allpass"
	},*/
    init: function() {
      var AudioContext = AudioContext || webkitAudioContext;
	  var context = new AudioContext;
	  // var media = context.createMediaElementSource(this.audio);
	  // var filter = context.createBiquadFilter();     
      
      // media.connect(filter);
	  // filter.connect(context.destination);
    },
    bidquadFilter: {
      lowpass: function(val) {
        filter.type=filter.LOWPASS;
	    filter.frequency.value=val;
      }
    }
  }

  global.AudioEffect = AudioEffect;
})(window);