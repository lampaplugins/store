(function () {
    'use strict';

    // Открыть ссылку во внешнем Android-приложении через intent
    function openExternal(url, title) {
        // VLC/1DM/ADM подхватят поток. type video/* — чтобы система предложила плееры/качалки
        var intent = 'intent:' + url + '#Intent;' +
            'action=android.intent.action.VIEW;' +
            'type=video/*;' +
            'S.title=' + encodeURIComponent(title || 'video') + ';' +
            'end';

        try {
            window.location.href = intent;
        } catch (e) {
            // запасной путь — просто открыть ссылку
            window.open(url, '_blank');
        }
    }

    // Достаём ссылку потока из текущего проигрывателя/карточки
    function getStreamUrl() {
        // Lampa хранит последний выбранный файл в плеере
        try {
            if (Lampa.Player && Lampa.Player.opened && Lampa.Player.opened()) {
                var data = Lampa.Player.video();
                if (data && data.url) return data.url;
            }
        } catch (e) {}
        return null;
    }

    // Добавляем пункт в контекстное меню плеера
    Lampa.Listener.follow('full', function (e) {
        if (e.type !== 'complite') return;

        var btn = $('<div class="full-start__button selector view--external_dl">' +
            '<svg width="24" height="24" viewBox="0 0 24 24" fill="none">' +
            '<path d="M12 16l-5-5h3V4h4v7h3l-5 5zM4 20v-2h16v2H4z" fill="currentColor"/>' +
            '</svg><span>Скачать (внешнее)</span></div>');

        btn.on('hover:enter click', function () {
            var url = getStreamUrl();
            if (!url) {
                // плеер ещё не открывали — попробуем взять из активной карточки
                Lampa.Noty.show('Сначала запустите воспроизведение, затем нажмите «Скачать»');
                return;
            }
            var title = (e.data && e.data.movie && (e.data.movie.title || e.data.movie.name)) || 'video';
            openExternal(url, title);
        });

        // вставляем кнопку рядом с остальными
        e.object.activity.render().find('.full-start__buttons').append(btn);
    });

    console.log('external_download.js loaded');
})();
