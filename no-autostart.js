(function () {
  'use strict';

  var manifest = {
    type: "other",
    version: "1.0.0",
    name: "No Autostart",
    description: "Disables automatic torrent playback start",
    component: "no-autostart"
  };

  function stopAutostart() {
    if (typeof Lampa !== 'undefined' && Lampa.Keypad && Lampa.Keypad.listener) {
      Lampa.Keypad.listener.send('keydown', {
        code: 0,
        enabled: false,
        event: {}
      });
    }
  }

  function stopAutostartSoon() {
    setTimeout(stopAutostart, 0);
  }

  function initNoAutostart() {
    var listOpened = false;

    Lampa.Listener.follow('torrent_file', function (data) {
      if (data.type == 'list_open') {
        listOpened = true;
        if (data.items && data.items.length == 1) {
          stopAutostartSoon();
        }
      }
      if (data.type == 'list_close') {
        listOpened = false;
      }
      if (data.type == 'render' && listOpened && data.items && data.items.length == 1) {
        stopAutostartSoon();
      }
    });
  }

  function add() {
    Lampa.Manifest.plugins = manifest;
    initNoAutostart();
  }

  function startPlugin() {
    window.plugin_no_autostart_ready = true;
    if (window.appready) {
      add();
    } else {
      Lampa.Listener.follow("app", function (e) {
        if (e.type === "ready") {
          add();
        }
      });
    }
  }

  if (!window.plugin_no_autostart_ready) {
    startPlugin();
  }

})();
