!function() {
    "use strict";
    if (window.location.protocol === 'https:') {
    	return false;
	}
    if(Lampa.Storage.get("cub_fix")=='2') $('.noty').hide();
    window.lampa_settings.torrents_use = true;
	window.lampa_settings.demo = false;
	window.lampa_settings.read_only = false;
    function checkApiAvailability(){var t=[{url:"https://cubnotrip.top/api/checker",name:"cubnotrip.top"}],i=0;!function n(){if(!(i>=t.length)){var e=t[i],o=new XMLHttpRequest;o.open("GET",e.url,!0),o.timeout=5e3,o.onload=function(){if(200===o.status)try{if(o.responseText)var t=o.responseText;if("ok"===t){localStorage.setItem("cub_domain",JSON.stringify([e.name]));return}}catch(r){}i++,n()},o.onerror=function(){i++,n()},o.ontimeout=function(){i++,n()},o.send()}}()}
    function t() {
        window.aplugin = !0, 
        Lampa.SettingsApi.addComponent({
            component: "lampa_alert",
            name: "CUB FIX",
            icon: '<svg xmlns="http://www.w3.org/2000/svg" height="32" viewBox="0 0 32 32"><path fill="white" d="M25.99 29.198c2.807 0 4.708-1.896 4.708-4.708v-19.781c0-2.807-1.901-4.708-4.708-4.708h-19.979c-2.807 0-4.708 1.901-4.708 4.708v27.292l2.411-2.802v-24.49c0.005-1.266 1.031-2.292 2.297-2.292h19.974c1.266 0 2.292 1.026 2.292 2.292v19.781c0 1.266-1.026 2.292-2.292 2.292h-16.755l-2.417 2.417-0.016-0.016zM11.714 15.286h-2.26v7.599h2.26c5.057 0 5.057-7.599 0-7.599zM11.714 21.365h-0.734v-4.557h0.734c2.958 0 2.958 4.557 0 4.557zM11.276 13.854h1.516v-6.083h1.891v-1.505h-5.302v1.505h1.896zM18.75 9.599l-2.625-3.333h-0.49v7.714h1.542v-4.24l1.573 2.042 1.578-2.042-0.010 4.24h1.542v-7.714h-0.479zM21.313 19.089c0.474-0.333 0.677-0.922 0.698-1.5 0.031-1.339-0.807-2.307-2.156-2.307h-3.005v7.609h3.005c1.24-0.010 2.245-1.021 2.245-2.26v-0.036c0-0.62-0.307-1.172-0.781-1.5zM18.37 16.802h1.354c0.432 0 0.698 0.339 0.698 0.766 0.031 0.406-0.286 0.76-0.698 0.76h-1.354zM19.724 21.37h-1.354v-1.516h1.37c0.411 0 0.745 0.333 0.745 0.745v0.016c0 0.417-0.333 0.755-0.75 0.755z"></path></svg>'
        }), 
        Lampa.SettingsApi.addParam({
            component: "lampa_alert",
            param: {
                name: "cub_fix",
                type: "select",
                values: {
                    1: "Отменить",
                    2: "Применить"
                },
                default: "1"
            },
            field: {
                name: "Применить фикс?"
            },
            onChange: function(t) {
                if(1 == t) {
                    // сохраним текущий источник и вернем при отмене фикса
                    "" != Lampa.Storage.get("protocolskaz") && (
                        Lampa.Storage.set("protocol", Lampa.Storage.get("protocolskaz")), 
                        Lampa.Storage.set("protocol", "https")
                    );
                    
                    var a = Lampa.Storage.get("plugins")
                        .filter(function(t) {
                            return "https://skaz.tv/t.js" !== t.url
                        })
                        .filter(function(t) {
                            return "http://skaz.tv/t.js" !== t.url
                        })
                        .filter(function(t) {
                            return "http://cub.red/plugin/tmdb-proxy" !== t.url
                        })
                        .filter(function(t) {
                            return "https://plugin.rootu.top/tmdb.js" !== t.url
                        })
                        .filter(function(t) {
                            return "https://khuyampa.best/tmdbproxy.js" !== t.url
                        });
                    
                    a.push({
                        url: "http://cub.red/plugin/tmdb-proxy",
                        name: "TMDB-Proxy",
                        status: 1
                    });
                    
                    Lampa.Storage.set("plugins", a);
                    Lampa.Storage.set('proxy_tmdb_auto', true);
                    Lampa.Storage.set('proxy_tmdb', true);
                    Lampa.Storage.set('cub_mirrors', '[]');
                    setTimeout(function() {
			 if(!window.location.origin){window.location.origin=window.location.protocol+"//"+window.location.hostname+(window.location.port ? ":"+window.location.port : "");}
                        window.location = window.location.origin
                    }, 1e3);
                    
                    Lampa.Noty.show("Lampa будет перезагружена");
                } 
                else if(2 == t) {
                    var a = Lampa.Storage.get("plugins")
                        .map(function(t) {
                            if("http://cub.red/plugin/tmdb-proxy" === t.url) {
                                t.status = 0;
                            }
                            return t;
                        })
                        .filter(function(t) {
                            return "https://plugin.rootu.top/tmdb.js" !== t.url
                        })
                        .filter(function(t) {
                            return "https://skaz.tv/t.js" !== t.url
                        })
                        .filter(function(t) {
                            return "http://skaz.tv/t.js" !== t.url
                        })
                        .filter(function(t) {
                            return "https://khuyampa.best/tmdbproxy.js" !== t.url
                        });
                    
                    a.push({
                        url: "http://skaz.tv/t.js",
                        name: "TMDB Proxy",
                        status: 1
                    });
                    
                    Lampa.Storage.set("plugins", a);
                    Lampa.Storage.set('proxy_tmdb_auto', true);
                    Lampa.Storage.set('proxy_tmdb', true);
		    checkApiAvailability();
                    if("http" != Lampa.Storage.get("protocol")) {
                        Lampa.Storage.set("protocolskaz", Lampa.Storage.get("protocol"));
                        Lampa.Storage.set("protocol", "http");
                    }
                    setTimeout(function() {
			 if(!window.location.origin){window.location.origin=window.location.protocol+"//"+window.location.hostname+(window.location.port ? ":"+window.location.port : "");}
                         window.location = window.location.origin
                    }, 1e3);
                    
                    Lampa.Noty.show("Lampa будет перезагружена");
                }
            }
        });
    }
    
    window.aplugin || (window.appready ? t() : Lampa.Listener.follow("app", function(a) {
        "ready" == a.type && t();
    }));
}();
