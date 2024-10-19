(function () {
    'use strict';
	
function startMe() {
	window.aplugin = true;
	Lampa.SettingsApi.addComponent({
            component: 'lampa_alert',
            name: 'CUB FIX'
  });
  
  Lampa.SettingsApi.addParam({
    component: 'lampa_alert',
    param: {
        name: 'location_server',
        type: 'select',
        values: {
			0: 'По умолчанию',
			1: 'Починить карточки'
		},
        default: '0',
    },
    field: {
        name: 'Если главная пустая или не работает cub.red'
    },
    onChange: function(value) {
       if (value==0)
	   {
		 	if (Lampa.Storage.get('sourceskaz')!='') {
				Lampa.Storage.set('source',Lampa.Storage.get('sourceskaz'));	
				Lampa.Storage.set('sourceskaz','');	
			}
		var plugArray = Lampa.Storage.get('plugins');
		var newplugArray = plugArray.filter(function(obj) {
              return obj.url !== 'https://plugin.rootu.top/tmdb.js';
			});
			newplugArray = newplugArray.filter(function(obj) {
              return obj.url !== 'http://cub.red/plugin/tmdb-proxy';
			});
				
		newplugArray.push({"url": "http://cub.red/plugin/tmdb-proxy","name":"TMDB-proxy", "status": 1});
        Lampa.Storage.set('plugins', newplugArray);	
		location.reload();
	   } else {
		   if (Lampa.Storage.get('source')!='tmdb') { 
				Lampa.Storage.set('sourceskaz',Lampa.Storage.get('source'));
				Lampa.Storage.set('source','tmdb');	
			}
		var plugArray = Lampa.Storage.get('plugins');
		var newplugArray = plugArray.map(function(obj) {
		if (obj.url === 'http://cub.red/plugin/tmdb-proxy') {
			obj.status = 0; 
		}
		return obj; 
		});
		newplugArray = newplugArray.filter(function(obj) {
              return obj.url !== 'https://plugin.rootu.top/tmdb.js';
			});
		newplugArray.push({"url": "https://plugin.rootu.top/tmdb.js","name":"RootU TMDB", "status": 1});
        Lampa.Storage.set('plugins', newplugArray);		
		location.reload();
	   }

    }
}); 
		   
}

	if (!window.aplugin) {
	if(window.appready) startMe();
	else {
 		Lampa.Listener.follow('app', function(e) {
			if(e.type == 'ready') {
				startMe();
			}
		});
	}
	}			
			
})();