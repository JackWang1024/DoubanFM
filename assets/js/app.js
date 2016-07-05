/**
 * @author boxizen
 * @description 程序控制
 */

;(function(global) {
  
  var exports = global.app = {
    init: function() {
      exports.bind();
      exports.ajax.song_detail();
    },
    bind: function() {
      $(document.body)
      .on('click', '#j_pause', function() {
        $(this).css('display', 'none');
      	$('.mask_link').css('display', 'block');
      })
      .on('click', '.mask_link', function() {
      	$(this).css('display', 'none');
      	$('#j_pause').css('display', 'block');
      })
    },
    ajax: {
      song_detail: function() {
      	$.ajax({
          url : 'http://www.douban.com/j/app/radio/people',
          data: {
          	app_name: 'radio_android',
          	version: 100,
          	type: 'n',
          	channel: 1
          },
          success: function(ret) {    
            console.log(ret);                     
            var data = ret.song[0];
            $('.album').attr('src', data.picture);     
            $('.radio_top .title').text(data.artist);    
            $('.radio_top .desc').html('&lt; ' + data.albumtitle +' &gt;' + ' ' + data.public_time);
            $('#j_song_name').text(data.title);

            var play_url = data.url;
          }, 
          error: function(err) {

          }
        });
      }
    }
  }

})(window);