/**
 * @author boxizen
 * @description 音乐播放
 * @param {object} config
 * @param {string} opts.bar   进度条
 * @param {string} opts.buf   缓存进度
 * @param {string} opts.pro   当前进度
 * @param {string} opts.dot   当前进度原点
 * @param {string} opts.crt   当前时间文本
 * @param {string} opts.total 总时长文本
 *
 */

;
(function(global) {

  function Player(config) {
    this.config = config;
    this.audio = $('audio')[0];
    this.init();
  }

  Player.prototype = {
    init: function() {      
      this.bind();
    },
    bind: function() {
      
      var self = this, audio = this.audio;
      var bar = self.config.bar, 
          dot = self.config.dot, 
          pro = self.config.pro, 
          buf = self.config.buf, 
          crt = self.config.crt, 
          total = self.config.total;
      var params = {
          pro_width: $(bar).width(),
          pro_down: false,
          pro_move: false,
          canplay: false,
          initX: 0,
          startX: 0,
          deltaX: 0,
          ratio: 0
        };
            
    $(document.body).on('mousedown', dot, function(e) {
      params.pro_down = true;
      params.initX = $(pro).width();
      params.startX = e.pageX;
    })
    .on('mousemove', function(e) {
      if (params.pro_down && audio.duration) {
        params.pro_move = true;
        params.moveX = e.pageX;
        params.deltaX = params.moveX - params.startX;

        params.ratio = Math.min(1, Math.max(0, (params.initX + params.deltaX) / params.pro_width));
        $(pro).css('width', params.ratio * 100 + '%');
        e.preventDefault();
      }
    })
    .on('mouseup', function() {
      if (params.pro_move && params.pro_down) {
        params.pro_down = false;
        params.pro_move = false;
          if (audio && audio.duration) {
            audio.currentTime = params.ratio * audio.duration;
          }
      }
    })
    .on('click', bar, function(e) {
      if (!audio.duration) {
        return;
      }
      var cx = e.pageX;
      var ratio = (cx - $(bar).offset().left) / params.pro_width;
      params.ratio = Math.min(1, Math.max(0, ratio));
      $(pro).css('width', params.ratio * 100 + '%');
      audio.currentTime = params.ratio * audio.duration;
    });

    $(audio).on('timeupdate', function() {
      if (audio.paused) {
        return;
      }
      var duration = audio.duration;
      var currentTime = audio.currentTime;
      var percent = currentTime / duration * 100;
      if (!params.pro_move) {
        $(pro).width(percent + '%');
      }
      if (params.canplay) {
        self.showCrtLrc(currentTime);
        var fcrtTime = self.timeFormat(currentTime);
        var fduration = self.timeFormat(duration);
        $(crt).html(fcrtTime);
        $(total).html(fduration);
        try {
          var loadPercent = audio.buffered.end(0) / duration * 100;
          $(buf).width(loadPercent + '%');
        } catch (err) {
          console.log(err);
        }
      }
    })    
    .on('canplay', function() {
        params.canplay = true;
    })
    .on('error', function(e) {
      switch (e.target.error.code) {
        case e.target.error.MEDIA_ERR_ABORTED:
          alert('You aborted the video playback.');
          break;
        case e.target.error.MEDIA_ERR_NETWORK:
          alert('A network error caused the audio download to fail.');
          break;
        case e.target.error.MEDIA_ERR_DECODE:
          alert('The audio playback was aborted due to a corruption problem or because the video used features your browser did not support.');
          break;
        case e.target.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
          alert('The video audio not be loaded, either because the server or network failed or because the format is not supported.');
          break;
        default:
          alert('An unknown error occurred.');
          break;
        }
    })
   },
   reset: function() {
     var audio = this.audio, 
         crt = this.config.crt, 
         total = this.config.total, 
         pro = this.config.pro, 
         buf = this.config.buf;

     if (audio) {
       audio.pause();
     }

     $(crt).html('00:00');
     $(total).html('00:00');
     $(pro).css('width', '0%');
     $(buf).css('width', '0%');
   },
   play: function(src) {
     var audio = this.audio;
     if (src) {
       audio.src = src;
     }
     audio.play();
   },
   pause: function() {
     var audio = this.audio;
     if (audio.src && typeof(audio.src) != 'undefined') {
       audio.pause();
     }
   },
   timeFormat: function(time) {
     if (isNaN(time)) {
       return '00:00';
     }
     var min = parseInt(time / 60);
     var sec = parseInt(time % 60);
     min = min >= 10 ? min : '0' + min;
     sec = sec >= 10 ? sec : '0' + sec;
     return min + ':' + sec;
   },
   getLrcHtml: function(lrcData) {
     var lrc = lrcData.lyric, listStr = '';     
     var htm = lrc.replace(/\[(\d+):(\d+).(\d+)\]([^\r\n]+|)/g, function($0, $1, $2, $3, $4) {
       var sec = parseInt($1 * 60) + parseInt($2);
       listStr += '<li data-time="' + sec + '">' + $4 + '</li>';
       return '<li data-time="' + sec + '">' + $4 + '</li>';
     });        
     return htm;
   },
   showCrtLrc: function(time) {
     var lis = $(this.config.lrc_li), el;
     for (var i = 0; i < lis.length; i++) {
       var li = lis.eq(i);
       if (time < li.attr('data-time')) {
         el = lis.eq(Math.max(0, i - 1));
         break;
       }
     }
     if (time > lis.eq(lis.length - 1).attr('data-time')) {
       el = lis.eq(lis.length - 1);
     }
     if (el && el.length > 0) {
       $(this.config.lrc_text).text(el.text());
     }
   }
  }
  global.Player = Player;
})(window);