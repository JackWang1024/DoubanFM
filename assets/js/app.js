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
  
  var loginData = {};

  var exports = global.app = {
    hasLogin: false,
    init: function() {       
      exports.bind();
      exports.ajax.song();
      // var effect = new AudioEffect(document.getElementById('audio'));
    },
    ajax: {
      song: function() {
        $('.album_mask p').html('');
        var options = {
          app_name: 'radio_android',
          version: 100,
          type: 'n',
          channel: 1
        };
        if(exports.hasLogin) {
          options.user_id = loginData.user_id;
          options.expire = loginData.expire;
          options.token = loginData.token;
        }        
        $.ajax({
          url: 'http://www.douban.com/j/app/radio/people',
          data: options,
          success: function(ret) {            
            var data = ret.song[0]; // render song detail
            exports.ajax.lrc(data.sid, data.ssid);
            exports.render(data);            
            var play_url = data.url; // play song
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
      },
      behaviour: function(options) {
        $.ajax({
          url: 'http://www.douban.com/j/app/radio/people',
          data: options,
          success: function(ret) {
            console.info(ret);
          },
          error: function(err) {
            console.error(err);
          }
        });
      },
      login: function(username, pwd) {
        $.post('http://www.douban.com/j/app/login', {
            app_name: 'radio_desktop_win',
            version: 100, 
            email: username, 
            password: pwd
          }, 
          function (ret) {        
            if(ret.r == 0) {
              loginData = {
                user_id : ret.user_id,
                token : ret.token,
                expire : ret.expire,
                user_name : ret.user_name,
                email : ret.email
              };
              exports.hasLogin = true;
              $('.pop_login').css('display', 'none');
            } else {
              alert(ret.err);
            }
        })
      }
    },
    render: function(data) {
      if(data.like == 0) {
        $('#j_btn_heart').css('color', '#000');
      } else {
        $('#j_btn_heart').css('color', '#f10303');
      }
      $('.album').attr('src', data.picture);
      $('.radio_top .title').text(data.artist);
      $('.radio_top .desc').html('&lt; ' + data.albumtitle + ' &gt;' + ' ' + data.public_time);
      $('#j_song_name').text(data.title);
      $('.album_show a').attr('href', 'music.douban.com' + data.album);
      $('.lrc_control').attr('data-sid', data.sid);
      $('.lrc_control').attr('data-ssid', data.ssid);
    },
    bind: function() {
      $('audio').on('ended', function() {
        $('#j_song_pro_crt').html('00:00');
        $('#j_song_prg_now').css('width', '0%');
        exports.ajax.song();
      });
      $(document.body).on('click', '#j_btn_heart', function() {
          $(this).css('color', '#f10303');
      })
      .on('click', '#j_btn_pause', function() {
        $(this).css('display', 'none');        
        $('.mask_link').html('继续播放 &gt;').css('display', 'block');
        player.pause();
      })
      .on('click', '#j_btn_next', function() {
        exports.ajax.song();
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
      .on('click', '#j_btn_login', function() {
        var username = $('#j_btn_username').val();
        var pwd = $('#j_btn_pwd').val();
        exports.ajax.login(username, pwd);
      })
      .on('click', '#j_btn_lrc', function() {                
        $('.album_mask').toggleClass('hidden');
      })
      .on('click', '#j_btn_set', function() {
        $('.pop_login').css('display', 'block');
      })
      .on('click', '#j_login_close', function() {
        $('.pop_login').css('display', 'none');
      })
      .on('click', '.channel_control', function() {
        $('.ch_list_wrapper').css('display', 'block');
      })
      .on('click', '#j_channel_close', function() {
        $('.ch_list_wrapper').css('display', 'none');
      })
    }

  }

})(window);