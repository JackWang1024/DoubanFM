/**
 * @author boxizen
 * @description 音乐播放
 */
;
(function(global) {

	var audio = $('audio')[0], bufferTimer;
    var buf = '#j_song_buf',
        pro = '#j_song_prg_now',
        crt = '#j_song_pro_crt',
        dot = '#j_song_pro_dot',
        total = '#j_song_pro_total',
        playBtn = '#j_btn_play',            
        logger = console;

    var pro_move = false;
    var canplay = false;

    var exports = global.Player = {  
    	initResource: true,     
        init: function() {                                
	        exports.reset();
	        exports.initResource = false;                   
        },
        bind: function() {
        	var params = {
            	pro_width: $('.mod_progress__bar').width(),
                pro_down :  false,
                initX    :  0,
                startX   :  0,
                deltaX   :  0,
                ratio    :  0
        	};

            $(document.body).on('touchstart', '.mod_progress #j_song_pro_dot', function(e) {
                params.pro_down = true;
                params.initX = $(pro).width();
                params.startX = e.touches[0].pageX;   
            })
            .on('touchmove', function(e) {
                if(params.pro_down && audio.duration) {
                    pro_move = true;
                    
                    params.moveX = e.touches[0].pageX;                    
                    params.deltaX = params.moveX - params.startX;

                    params.ratio = Math.min(1, Math.max(0, (params.initX + params.deltaX) / params.pro_width));
                    $(pro).css('width', params.ratio * 100 + '%');
                    e.preventDefault();                                                    
                }                                        
            })
            .on('touchend', function() {
                if(pro_move && params.pro_down) {                                                
                    params.pro_down = false;
                    pro_move = false;    
                    if(audio && audio.duration) {
                        audio.currentTime = params.ratio * audio.duration;
                    }           
                } 
            })
            .on('touchstart', '.mod_progress__bar', function(e) {
                if(!audio.duration) { return; }
                var cx = e.touches[0].pageX;
                var ratio = (cx-$('.mod_progress__bar').offset().left)/params.pro_width;
                params.ratio = Math.min(1, Math.max(0, ratio));
                $(pro).css('width', params.ratio * 100 + '%');
                audio.currentTime = params.ratio * audio.duration;  
            });

            $('#audio').on('timeupdate',function() {
                if(audio.paused) {
                    return ;
                }
                var duration = audio.duration;
                var currentTime = audio.currentTime;
                var percent = currentTime / duration * 100;
                if(!pro_move) {
                    $(pro).width(percent + '%');    
                }                    
                if(canplay) {
                    var fcrtTime = exports.timeFormat(currentTime);
                    var fduration = exports.timeFormat(duration);
                    $(crt).html(fcrtTime);
                    $(total).html(fduration);
                    try {
                        var loadPercent = audio.buffered.end(0)/duration*100;
                        $(buf).width(loadPercent+'%');
                    } catch(err) {
                        console.log(err);
                    }
                }                    
            })                
            .on('ended', function() {
                $(crt).html('00:00');
                $(pro).css('width', '0%');
                if(audio) {          
                    audio.pause();
                }    
                app.ajax.song_detail();
            })
            .on('canplay', function() {
                canplay = true;
            })
            .on('error', function(e) {
                switch (e.target.error.code) {
                 case e.target.error.MEDIA_ERR_ABORTED:
                   alert('You aborted the video playback.');
                   break;
                 case e.target.error.MEDIA_ERR_NETWORK:
                   alert('A network error caused the    audio download to fail.');
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
            if(audio) {          
                audio.pause();
                $(playBtn).removeClass('btn_pause').addClass('btn_play');   
            }    
            $(crt).html('00:00');
            $(total).html('00:00');
            $(pro).css('width', '0%');
            $(buf).css('width', '0%');                     
        },
        buffer: function() {
            clearInterval(bufferTimer);
            bufferTimer = setInterval(function(){   
                try{                        
                    var bufferIndex = audio.buffered.length;
                    if(bufferIndex != 0) {
                        var percent = audio.buffered.end(bufferIndex-1)/audio.duration*100;
                        $(buf).width(percent+'%');
                        if (Math.abs(audio.duration - audio.buffered.end(bufferIndex-1)) < 1) {
                             clearInterval(bufferTimer);
                        }
                    }                         
                } catch(ex) {
                    logger.error('[Exception]: ' + ex);
                    clearInterval(bufferTimer);
                }
            },1000);
        },
        play: function(src) {
            if(src) {
                audio.src = src;    
            }            
            audio.play();           
        },
        pause: function() {
            if(audio.src && typeof(audio.src) != 'undefined') {                   
                audio.pause();
                $(playBtn).addClass('btn_play').removeClass('btn_pause');        
            }                
        },
        timeFormat: function(time) {                                   
            if(isNaN(time)) {
                return '00:00';
            }
            var min = parseInt(time / 60);
            var sec = parseInt(time % 60);
            min = min >= 10 ? min : '0' + min;
            sec = sec >= 10 ? sec : '0' + sec;
            return min + ':' + sec;
        },
        getLrcData: function(lrcData) {
            var lrc = lrcData.data.lyric, listStr = '';
            var str = lrc.replace(/\[(\d+):(\d+).(\d+)\]([^\r\n]+|)/g, function($0, $1, $2, $3, $4) {       
                var sec = parseInt($1 * 60) + parseInt($2);         
                listStr += '<li data-time="' + sec + '">' + $4 + '</li>';
                return '<li data-time="' + sec + '">' + $4 + '</li>'; 
            });
            $('#j_lrc_list').html(listStr);
        },
        showCrtLrc: function(time) {
            var lis = $('#j_lrc_list li'), el;

            for(var i = 0; i < lis.length; i++) {
                var li = lis.eq(i);
                if(time < li.attr('data-time')) {
                    el = lis.eq(Math.max(0, i - 1));
                    break;
                }
            }
            if(time > lis.eq(lis.length - 1).attr('data-time')){
                el = lis.eq(lis.length - 1);
            }
            if(el && el.length > 0) {
                $('.radio_show__item.crt .radio_show__lyric p').text(el.text());
            }          
        }
    }        
})(window);