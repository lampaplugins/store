(function () {
	'use strict';
	function startPlugin() {
		window.onlyskaz_plugin = true;
		$.getScript('http://skaz.tv/onlines.js');
	}
	if (!window.onlyskaz_plugin) startPlugin();			
})();

