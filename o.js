function otzyv_kp_imdb(kpid,imdbid,num) {
    $.get(Lampa.Utils.protocol() + 'api.skaz.tv/otzyv.php?kp='+kpid+'&tmdb='+imdbid+'&num='+num, function (data) {
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
            if (reviewType.includes('Позитивный')) {
                colorClass = 'positive';
            } else if (reviewType.includes('Негативный')) {
                colorClass = 'negative';
            } else if (reviewType.includes('Нейтральный')) {
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
