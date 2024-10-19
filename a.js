(function () {
    'use strict';
	
function startMe() {
	window.aplugin = true;
	Lampa.SettingsApi.addComponent({
            component: 'lampa_alert',
            name: 'CUB FIX',
	    icon: '<svg xmlns="http://www.w3.org/2000/svg" height="32" viewBox="0 0 32 32"><path fill="white" d="M25.99 29.198c2.807 0 4.708-1.896 4.708-4.708v-19.781c0-2.807-1.901-4.708-4.708-4.708h-19.979c-2.807 0-4.708 1.901-4.708 4.708v27.292l2.411-2.802v-24.49c0.005-1.266 1.031-2.292 2.297-2.292h19.974c1.266 0 2.292 1.026 2.292 2.292v19.781c0 1.266-1.026 2.292-2.292 2.292h-16.755l-2.417 2.417-0.016-0.016zM11.714 15.286h-2.26v7.599h2.26c5.057 0 5.057-7.599 0-7.599zM11.714 21.365h-0.734v-4.557h0.734c2.958 0 2.958 4.557 0 4.557zM11.276 13.854h1.516v-6.083h1.891v-1.505h-5.302v1.505h1.896zM18.75 9.599l-2.625-3.333h-0.49v7.714h1.542v-4.24l1.573 2.042 1.578-2.042-0.010 4.24h1.542v-7.714h-0.479zM21.313 19.089c0.474-0.333 0.677-0.922 0.698-1.5 0.031-1.339-0.807-2.307-2.156-2.307h-3.005v7.609h3.005c1.24-0.010 2.245-1.021 2.245-2.26v-0.036c0-0.62-0.307-1.172-0.781-1.5zM18.37 16.802h1.354c0.432 0 0.698 0.339 0.698 0.766 0.031 0.406-0.286 0.76-0.698 0.76h-1.354zM19.724 21.37h-1.354v-1.516h1.37c0.411 0 0.745 0.333 0.745 0.745v0.016c0 0.417-0.333 0.755-0.75 0.755z"></path></svg>'
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
