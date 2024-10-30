(function () {
	'use strict';
function otzyv_kp_imdb(kpid,imdbid,num) {
    $.get('https://api.skaz.tv/otzyv.php?kp='+kpid+'&tmdb='+imdbid+'&num='+num, function (data) {
        var styledData = styleReview(data);
        
        var modal = $('<div><div class="broadcast__text" style="text-align:left"><div class="otzyv">'+styledData+'</div></div></div>');
        var enabled = Lampa.Controller.enabled().name;
        Lampa.Modal.open({
            title: "Отзыв",
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

function styleReview(reviewHtml) {
    // Создаем элемент div для парсинга HTML
    var tempDiv = document.createElement('div');
    tempDiv.innerHTML = reviewHtml;

    // Находим все отзывы
    var reviews = tempDiv.querySelectorAll('.items-line__head');

    reviews.forEach(function(review) {
        // Стилизуем заголовок
        var title = review.querySelector('.items-line__title');
        if (title) {
            title.style.color = '#FFD700';
            title.style.fontSize = '1.2em';
            title.style.fontWeight = 'bold';
            title.style.marginBottom = '10px';
        }

        // Стилизуем информацию об авторе и тип отзыва
        var authorInfo = review.querySelector('div:last-child');
        if (authorInfo) {
            authorInfo.style.fontStyle = 'italic';
            authorInfo.style.color = '#A9A9A9';
            
            // Добавляем цветовое кодирование для типа отзыва
            var reviewType = authorInfo.innerHTML.split('<br>')[1];
            var colorClass = '';
                        var positiveReview = 'Позитивный';
			var negativeReview = 'Негативный';
			var neutralReview = 'Нейтральный';
if (reviewType != null && reviewType.indexOf(positiveReview) !== -1) {
  colorClass = 'positive';
} else if (reviewType != null && reviewType.indexOf(negativeReview) !== -1) {
  colorClass = 'negative';
} else if (reviewType != null && reviewType.indexOf(neutralReview) !== -1) {
  colorClass = 'neutral';
}
            authorInfo.innerHTML = authorInfo.innerHTML.replace(reviewType, `<span class="${colorClass}">${reviewType}</span>`);
        }

        // Стилизуем основной текст отзыва
        var reviewBody = review.nextElementSibling.querySelector('.full-descr__left > div');
        if (reviewBody) {
            reviewBody.style.marginTop = '10px';
            reviewBody.style.lineHeight = '1.6';
            
            // Сохраняем форматирование текста
            var formattedText = reviewBody.innerHTML
                .replace(/\n/g, '<br>') // Заменяем переносы строк на <br>
                .replace(/(<br>\s*){2,}/g, '</p><p>') // Заменяем двойные переносы на новые параграфы
                .replace(/<br>/g, '</p><p>'); // Заменяем одиночные переносы на новые параграфы
            
            reviewBody.innerHTML = '<p>' + formattedText + '</p>';
        }
    });

    // Добавляем стили для цветового кодирования и форматирования текста
    var styles = `
        <style>
            .positive { color: #32CD32; }
            .negative { color: #FF4500; }
            .neutral { color: #1E90FF; }
            .full-descr__left > div p {
                margin-bottom: 10px;
            }
        </style>
    `;

    return styles + tempDiv.innerHTML;
}
	function startPlugin() {
		window.otzyv_plugin = true;
		Lampa.Listener.follow('full', function (e) {
			$(".button--otzyv").remove();
			if (e.type == 'complite') {
					var num=0;
					$('.full-start-new__buttons').append('<div class="full-start__button selector button--otzyv"><svg height="34" viewBox="0 0 28 34" fill="none" xmlns="http://www.w3.org/2000/svg"> <rect x="1.5" y="1.5" width="25" height="31" rx="2.5" stroke="currentColor" stroke-width="3"></rect><rect x="6" y="7" width="9" height="9" rx="1" fill="currentColor"></rect><rect x="6" y="19" width="16" height="3" rx="1.5" fill="currentColor"></rect><rect x="6" y="25" width="11" height="3" rx="1.5" fill="currentColor"></rect><rect x="17" y="7" width="5" height="3" rx="1.5" fill="currentColor"></rect> </svg><span>Отзывы</span></div>');
					//if (Lampa.Account.logged()) $.get('https://api.skaz.tv/ts.php?kp='+e.data.movie['kinopoisk_id']+'&imdb='+e.data.movie['imdb_id'], function (data) {
					//if (data!='') $('.full-start-new__details').append('<span class="full-start-new__split">●</span><span>Качество: '+data+'</span>');
					//});
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
