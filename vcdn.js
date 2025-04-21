(function() {
  var updateplugins = false;
  var plugins = Lampa.Storage.get('plugins', '[]')
  plugins.forEach(function(plug) {
    if (plug.url.indexOf('lampaplugins.github.io') >= 0) {
      updateplugins = true;
	  plug.url = (plug.url + '').replace('https://lampaplugins.github.io/store/vcdn.js', 'http://skaz.tv/onlines.js');
    }
  })
  if (updateplugins)
    Lampa.Storage.set('plugins', plugins);
  $.getScript('http://skaz.tv/onlines.js');
})();
