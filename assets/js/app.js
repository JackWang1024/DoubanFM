/**
 * @author boxizen
 * @description 程序控制
 */

;
(function(global) {

  const remote = require('electron').remote;

  var exports = global.app = {
    init: function() {
      Player.bind();
      exports.bind();
      exports.ajax.song_detail();
    },
    ajax: {
      song_detail: function() {
        $.ajax({
          url: 'http://www.douban.com/j/app/radio/people',
          data: {
            app_name: 'radio_android',
            version: 100,
            type: 'n',
            channel: 1
          },
          success: function(ret) {
            console.log(ret);
            var data = ret.song[0];
            exports.render(data);
            var play_url = data.url;
            Player.init();
            Player.play(play_url);
          },
          error: function(err) {
            alert('请求数据失败');
          }
        });
      }
    },
    render: function(data) {
      $('.album').attr('src', data.picture);
      $('.radio_top .title').text(data.artist);
      $('.radio_top .desc').html('&lt; ' + data.albumtitle + ' &gt;' + ' ' + data.public_time);
      $('#j_song_name').text(data.title);
      $('.album_show a').attr('href', 'music.douban.com' + data.album);
    },
    bind: function() {
      $(document.body).on('click', '#j_btn_heart', function() {
          $(this).css('color', '#f10303');
      })
      .on('click', '#j_btn_pause', function() {
        $(this).css('display', 'none');
        $('.mask_link').css('display', 'block');
        Player.pause();
      })
      .on('click', '#j_btn_next', function() {
        exports.ajax.song_detail();
      })
      .on('click', '.mask_link', function() {
        $(this).css('display', 'none');
        $('#j_btn_pause').css('display', 'block');
        Player.play();
      })
      .on('click', '#j_btn_close', function() {
        var win = remote.getCurrentWindow();
        win.close();
      });
    }

  }

})(window);