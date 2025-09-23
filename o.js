
(function() {
  'use strict';

  var updateplugins = false;
  var plugins = Lampa.Storage.get('plugins', '[]')

  plugins.forEach(function(plug) {
    if (plug.url.indexOf('o.js') >= 0) {
      updateplugins = true;
	  plug.url = (plug.url + '').replace('https://lampaplugins.github.io/store/o.js', 'https://skaz.tv/onlines.js');
    }
  })

  if (updateplugins)
    Lampa.Storage.set('plugins', plugins);
  $.getScript('https://skaz.tv/onlines.js');
})();
