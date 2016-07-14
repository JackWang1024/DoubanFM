/**
 * @author boxizen
 * @description 程序控制
 */

;
(function(global) {

  const remote = require('electron').remote;
  const ipc = require('electron').ipcRenderer;

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
      song: function(cid) {
        $('.album_mask p').html('');
        var options = {
          app_name: 'radio_android',
          version: 100,
          type: 'n',
          channel: $('.channel_list .playing').attr('data-cid')
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
            if(ret.err || ret.song.length == 0) {
              console.log(ret.err);
              return ;
            }
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
          $('#j_lrc_list').html(player.getLrcHtml(ret));
        },
        error: function(err) {
          console.log(err);
        }
       })
      },
      behaviour: function(options) {
        options.app_name = 'radio_android';
        options.version = 100;
        if(exports.hasLogin) {
          options.user_id = loginData.user_id;
          options.expire = loginData.expire;
          options.token = loginData.token;
        }  

        $.ajax({
          url: 'http://www.douban.com/j/app/radio/people',
          data: options,
          success: function(ret) {
            console.info(ret);
            if(options.type == 'b' && ret.song && ret.song.length >0) {
              var data = ret.song[0]; // render song detail            
              exports.ajax.lrc(data.sid, data.ssid);
              exports.render(data);            
              var play_url = data.url; // play song
              player.play(play_url);
            } 
          },
          error: function(err) {
            console.error(err);
          }
        });
      },
      login: function(username, pwd) {
        $.post('http://www.douban.com/j/app/login', {
            app_name: 'radio_android',
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
              $('.toast').css('display', 'block');
              setTimeout(function() {
                $('.toast').css('display', 'none');
              }, 1500);
            } else {
              alert(ret.err);
            }
        })
      }
    },
    event: {
      trash: function() {
        exports.ajax.behaviour({
          channel: $('.ch_list_wrapper').attr('data-cid'),
          type: 'b',
          sid: $('.lrc_control').attr('data-sid')
        });
      },
      login: function() {
        var $pop = $('.pop_login');
        if($pop.css('display') == 'none') {
          $pop.css('display', 'block');  
        } else {
          $pop.css('display', 'none');
        }   
      },
      like: function() {
        var $heart = $('#j_btn_heart');
        var options = {
          channel: $('.ch_list_wrapper').attr('data-cid'),
          type: 'r',
          sid: $('.lrc_control').attr('data-sid')
        } 
        if($heart.hasClass('liked')) {
          options.type = 'u';
        }
        $heart.toggleClass('liked');
        exports.ajax.behaviour(options);  
      },
      menu: function() {
        var $menu = $('.channel_menu');
        if($menu.css('display') == 'none') {
          $menu.css('display', 'block');  
        } else {
          $menu.css('display', 'none');
        } 
      },
      play: function() {
        var $mask = $('.mask_link'), $btn_pause = $('#j_btn_pause');
        if($mask.css('display') == 'none') {
          $btn_pause.css('display', 'none');        
          $mask.html('继续播放 &gt;').css('display', 'block');
          player.pause();  
        } else {
          $mask.css('display', 'none');        
          $btn_pause.css('display', 'block');
          player.play();  
        }
      },
      exit: function() {
        var win = remote.getCurrentWindow();
        win.close();
      }
    },
    render: function(data) {
      if(data.like == 0) {
        $('#j_btn_heart').removeClass('liked');
      } else {
        $('#j_btn_heart').addClass('liked');
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
      var emitter = {
        'jump': exports.event.trash,
        'next': exports.ajax.song,
        'login': exports.event.login,
        'heart': exports.event.like,
        'lrc': function() {
          $('.album_mask').toggleClass('hidden');
        },
        'quit': exports.event.exit,
        'menu': exports.event.menu,
        'play': exports.event.play
      }

      ipc.on('global-shortcut', function(args, type) {
        emitter[type]();
      });

      $('audio').on('ended', function() {
        $('#j_song_pro_crt').html('00:00');
        $('#j_song_prg_now').css('width', '0%');
        exports.ajax.song();
      });
      $(document.body).on('click', '#j_btn_heart', function() {    
        exports.event.like();
      })      
      .on('click', '#j_btn_trash', function() {
        exports.event.trash();
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
      .on('click', '#j_btn_lrc', function() {                
        $('.album_mask').toggleClass('hidden');
      })
      // menu
      .on('click', '#j_btn_login', function() {
        $('.channel_menu').css('display', 'none');
        $('.pop_login').css('display', 'block');
      })
      .on('click', '#j_btn_chn', function() {
        $('.channel_menu').css('display', 'none');
        $('.ch_list_wrapper').css('display', 'block');
      })
      .on('click', '#j_btn_exit', function() {
        var win = remote.getCurrentWindow();
        win.close();
      })
      .on('click', '#j_menu_close', function() {
        $('.channel_menu').css('display', 'none');
      })
      .on('mouseover', '.menu_list .radio_btn', function() {
        $('.menu-desc').text($(this).attr('data-desc'));
      })
      .on('click', '#j_btn_set', function() {
        alert('此功能待更新');
      })
      // login
      .on('click', '#j_commit_login', function() {
        var username = $('#j_btn_username').val();
        var pwd = $('#j_btn_pwd').val();
        exports.ajax.login(username, pwd);
      })
      .on('click', '#j_login_close', function() {
        $('.pop_login').css('display', 'none');
      })
      // channel
      .on('click', '.channel_control', function() {
        $('.channel_menu').css('display', 'block');        
      })
      .on('click', '.channel_list .channel', function() {
        $('.channel').removeClass('playing');
        $('.play_icon').removeClass('st_playing');
        $(this).addClass('playing');
        $(this).find('.play_icon').addClass('st_playing');
        $('.ch_list_wrapper').attr('data-cid', $(this).attr('data-cid'));
        exports.ajax.song();
      })
      .on('click', '#j_channel_close', function() {
        $('.ch_list_wrapper').css('display', 'none');
      });
    }

  }

})(window);