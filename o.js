(function () {
	'use strict';
	var num;
	function otzyv_kp_imdb(kpid,imdbid,num) {
			
			$.get('https://skaz.tv/otzyv.php?kp='+kpid+'&tmdb='+imdbid+'&num='+num, function (data) {
			var modal = $('<div><div class="broadcast__text" style="text-align:left"><div class="otzyv">'+data+'</div></div></div>');
			var enabled = Lampa.Controller.enabled().name;
			Lampa.Modal.open({
                title: "",
                html: modal,
                size: "large",
                mask: !0,
                onBack: function() {
                    Lampa.Modal.close(), Lampa.Controller.toggle(enabled)
                },
                onSelect: function() {}
            });
			});
			
	}
	$('.otzyvb').on('hover:enter', function () {
		console.log(123);
	});
	
	function startPlugin() {
		window.otzyv_plugin = true;
		Lampa.Listener.follow('full', function (e) {
			if (e.type == 'complite') {
					var num=0;
					$('.full-start-new__buttons').append('<div class="full-start__button selector button--otzyv"><svg height="34" viewBox="0 0 28 34" fill="none" xmlns="http://www.w3.org/2000/svg"> <rect x="1.5" y="1.5" width="25" height="31" rx="2.5" stroke="currentColor" stroke-width="3"></rect><rect x="6" y="7" width="9" height="9" rx="1" fill="currentColor"></rect><rect x="6" y="19" width="16" height="3" rx="1.5" fill="currentColor"></rect><rect x="6" y="25" width="11" height="3" rx="1.5" fill="currentColor"></rect><rect x="17" y="7" width="5" height="3" rx="1.5" fill="currentColor"></rect> </svg><span>Отзывы</span></div>');
					$('.button--otzyv').on('hover:enter', function (card) {
					if (num > 9) num = 0;
					otzyv_kp_imdb(e.data.movie['kinopoisk_id'],e.data.movie['imdb_id'],num);
					num += 1;
				});
		}
			
		});
			
	}
	if (!window.otzyv_plugin) startPlugin();
				
})();

