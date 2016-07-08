/**
 * @author boxizen
 * @description 程序控制
 */

;
(function(global) {

  const remote = require('electron').remote;

  var player = new Player({
        bar: '.radio_progress__bar',
        buf: '#j_song_buf',
        pro: '#j_song_prg_now',
        crt: '#j_song_pro_crt',
        dot: '#j_song_pro_dot',
        total: '#j_song_pro_total',
        lrc_li: '#j_lrc_list li',
        lrc_text: '.album_mask p'
      });

  var exports = global.app = {
    init: function() {       
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
            // render song detail
            var data = ret.song[0];
            exports.ajax.lrc(data.sid, data.ssid);
            exports.render(data);
            // play song
            var play_url = data.url;
            player.play(play_url);
          },
          error: function(err) {
            alert('请求数据失败');
          }
        });
      },
      lrc: function(sid, ssid) {
       $.ajax({
        url: 'http://api.douban.com/v2/fm/lyric',
        data: {
          method: 'POST',
          sid: sid,
          ssid: ssid
        },
        success: function(ret) {
          console.log(ret.lyric);
          $('#j_lrc_list').html(player.getLrcHtml(ret));
        },
        error: function(err) {
          console.log(err);
        }
       })
      }
    },
    render: function(data) {
      $('.album').attr('src', data.picture);
      $('.radio_top .title').text(data.artist);
      $('.radio_top .desc').html('&lt; ' + data.albumtitle + ' &gt;' + ' ' + data.public_time);
      $('#j_song_name').text(data.title);
      $('.album_show a').attr('href', 'music.douban.com' + data.album);
      $('.lrc_control').attr('data-sid', data.sid);
      $('.lrc_control').attr('data-ssid', data.ssid);
    },
    bind: function() {
      $(document.body).on('click', '#j_btn_heart', function() {
          $(this).css('color', '#f10303');
      })
      .on('click', '#j_btn_pause', function() {
        $(this).css('display', 'none');
        $('.mask_link').css('display', 'block');
        player.pause();
      })
      .on('click', '#j_btn_next', function() {
        exports.ajax.song_detail();
      })
      .on('click', '.mask_link', function() {
        $(this).css('display', 'none');
        $('#j_btn_pause').css('display', 'block');
        player.play();
      })
      .on('click', '#j_btn_close', function() {
        var win = remote.getCurrentWindow();
        win.close();
      })
      .on('click', '#j_btn_lrc', function() {                
        $('.album_mask').toggleClass('hidden');
      });
    }

  }

})(window);