(function () {
  'use strict';

  if (window.__jellyfinPlugin_loaded) return;
  window.__jellyfinPlugin_loaded = true;

  var STORAGE_PREFIX = 'jellyfin';
  var SETTINGS_COMPONENT = STORAGE_PREFIX;
  var PANEL_COMPONENT = STORAGE_PREFIX + 'Panel';
  var HUB_COMPONENT = STORAGE_PREFIX + 'Hub';
  var HUB_PREVIEW_LIMIT = 12;

  var DEFAULT_URL = '';
  var DEFAULT_API_KEY = '';

  var HTTP_TIMEOUT_MS = 15000;
  var TMDB_TIMEOUT_MS = 10000;
  var TMDB_ENRICH_CONCURRENCY = 8;
  var PAGE_SIZE = 48;
  var IMG_PLACEHOLDER = './img/img_load.svg';
  var LIBRARY_INDEX_TTL_MS = 5 * 60 * 1000;

  var RELEASE_FOLDER_RE =
    /(Season\s*\d+)|(S\d{1,2}\s*E\d{0,2}\s*WEB)|WEB-DL|WEBRip|BluRay|2160p|1080p|720p|HDR10|HDR\b|\bDV\b|NOIR\s+VER|COLOR\s+VER|x265|x264/i;

  var MANIFEST = {
    type: 'video',
    version: '1.0.0',
    author: '@pavelpikta',
    name: 'Jellyfin',
    description: 'Browse and play your Jellyfin library in Lampa',
    component: SETTINGS_COMPONENT,
    icon:
      '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 2 7l10 5 10-5-10-5Z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/></svg>',
  };

  var FULLSTART_BTN_ICON =
    '<svg class="jellyfin-fullstart__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2 2 7l10 5 10-5-10-5Z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/></svg>';

  var HEAD_ICON_SVG =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 2 7l10 5 10-5-10-5Z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/></svg>';

  var cachedUserId = '';
  var cachedAutoUserName = '';
  var libraryIndex = { byTmdb: {}, loadedAt: 0 };
  var tmdbMetaCache = {};
  var tmdbPosterInflight = {};

  function addLang() {
    Lampa.Lang.add({
      jellyfin_title: { en: 'Jellyfin', ru: 'Jellyfin' },
      jellyfin_movies: { en: 'Movies', ru: 'Фильмы' },
      jellyfin_series: { en: 'TV Series', ru: 'Сериалы' },
      jellyfin_resume: { en: 'Continue watching', ru: 'Продолжить просмотр' },
      jellyfin_latest: { en: 'Latest added', ru: 'Недавно добавлено' },
      jellyfin_stat_resume: { en: 'Continue', ru: 'Продолжить' },
      jellyfin_stat_latest: { en: 'Latest', ru: 'Недавние' },
      jellyfin_stat_movies: { en: 'Movies', ru: 'Фильмы' },
      jellyfin_stat_series: { en: 'Series', ru: 'Сериалы' },
      jellyfin_play: { en: 'Play', ru: 'Смотреть' },
      jellyfin_open_card: { en: 'Open card', ru: 'Открыть карточку' },
      jellyfin_episodes: { en: 'Episodes', ru: 'Эпизоды' },
      jellyfin_pick_episode: { en: 'Choose episode', ru: 'Выберите эпизод' },
      jellyfin_empty: { en: 'Library is empty', ru: 'Библиотека пуста' },
      jellyfin_empty_descr: {
        en: 'Add media to Jellyfin or check connection settings',
        ru: 'Добавьте медиа в Jellyfin или проверьте настройки подключения',
      },
      jellyfin_retry: { en: 'Retry', ru: 'Повторить' },
      jellyfin_open_settings: { en: 'Open settings', ru: 'Открыть настройки' },
      jellyfin_auth_ok: { en: 'Connection OK', ru: 'Подключение успешно' },
      jellyfin_auth_fail: { en: 'Connection failed', ru: 'Не удалось подключиться' },
      jellyfin_test: { en: 'Test connection', ru: 'Проверить подключение' },
      jellyfin_url: { en: 'Server URL', ru: 'URL сервера' },
      jellyfin_key: { en: 'API key', ru: 'API-ключ' },
      jellyfin_no_tmdb: {
        en: 'No TMDB id on this item',
        ru: 'Нет TMDB id у этого элемента',
      },
      jellyfin_error: { en: 'Something went wrong', ru: 'Что-то пошло не так' },
      jellyfin_settings_name: { en: 'Jellyfin', ru: 'Jellyfin' },
      jellyfin_settings_hint: {
        en: 'Jellyfin URL and API key from Dashboard → API Keys',
        ru: 'URL Jellyfin и API-ключ из Панель → Ключи API',
      },
      jellyfin_set_dedupe: {
        en: 'Merge duplicates (TMDB)',
        ru: 'Объединять дубликаты (TMDB)',
      },
      jellyfin_set_hide_folders: {
        en: 'Hide release folders',
        ru: 'Скрывать папки релизов',
      },
      jellyfin_set_tmdb_posters: {
        en: 'TMDB posters & titles',
        ru: 'Постеры и названия из TMDB',
      },
      jellyfin_set_full_button: {
        en: 'Play button on Lampa card',
        ru: 'Кнопка воспроизведения на карточке',
      },
      jellyfin_more: { en: 'More', ru: 'Ещё' },
      jellyfin_libraries: { en: 'Library', ru: 'Библиотека' },
      jellyfin_set_tap_play: {
        en: 'Tap card to play (long = menu)',
        ru: 'Нажатие — смотреть (долгое — меню)',
      },
      jellyfin_play_from_library: {
        en: 'Play from Jellyfin',
        ru: 'Смотреть из Jellyfin',
      },
      jellyfin_watched: { en: 'Watched', ru: 'Просмотрено' },
      jellyfin_mark_watched: { en: 'Mark as watched', ru: 'Отметить просмотренным' },
      jellyfin_mark_unwatched: { en: 'Mark as unwatched', ru: 'Снять отметку просмотра' },
      jellyfin_mark_watched_ok: { en: 'Marked as watched', ru: 'Отмечено как просмотрено' },
      jellyfin_mark_unwatched_ok: { en: 'Marked as unwatched', ru: 'Отметка просмотра снята' },
      jellyfin_season_n: { en: 'Season {0}', ru: 'Сезон {0}' },
      jellyfin_user: { en: 'Jellyfin user', ru: 'Пользователь Jellyfin' },
      jellyfin_user_pick: { en: 'Choose user', ru: 'Выбрать пользователя' },
      jellyfin_user_auto: { en: 'First user (auto)', ru: 'Первый пользователь (авто)' },
    });
  }

  function storageStr(suffix, fallback) {
    try {
      var v =
        String(Lampa.Storage.get(STORAGE_PREFIX + suffix) || '').trim() ||
        String(Lampa.Storage.field(STORAGE_PREFIX + suffix) || '').trim();
      if (v) return v;
    } catch (e) { }
    return fallback == null ? '' : String(fallback);
  }

  function storageToggle(suffix, defaultOn) {
    try {
      var v = Lampa.Storage.field(STORAGE_PREFIX + suffix);
      if (v === true) return true;
      if (v === false) return false;
    } catch (e) { }
    return defaultOn !== false;
  }

  function normalizeBase(raw) {
    var s = String(raw || '').trim().replace(/\/+$/, '');
    if (!s.length) return '';
    if (!/^https?:\/\//i.test(s)) s = 'https://' + s;
    return s;
  }

  function apiBase() {
    return normalizeBase(storageStr('Url', DEFAULT_URL));
  }

  function apiKey() {
    return storageStr('Key', DEFAULT_API_KEY);
  }

  var netInstance = null;
  function network() {
    if (!netInstance && Lampa.Reguest) netInstance = new Lampa.Reguest();
    return netInstance;
  }

  function jfHttp(path, opts) {
    opts = opts || {};
    var base = apiBase();
    var key = apiKey();
    if (!base || !key) return Promise.reject(new Error('Jellyfin URL or API key is empty'));

    var p = String(path || '');
    var url = base + (p.charAt(0) === '/' ? p : '/' + p);
    var sep = url.indexOf('?') >= 0 ? '&' : '?';
    if (url.indexOf('api_key=') < 0) url += sep + 'api_key=' + encodeURIComponent(key);

    var timeout = typeof opts.timeout === 'number' ? opts.timeout : HTTP_TIMEOUT_MS;
    var dataType = opts.dataType || 'json';
    var method = (opts.method || 'GET').toUpperCase();
    var postData = method === 'POST' && opts.jsonBody === undefined ? opts.data : undefined;
    var net = network();
    var useJsonAjax = opts.jsonBody !== undefined || method === 'DELETE';

    return new Promise(function (resolve, reject) {
      function ok(raw) {
        if (dataType === 'json' && typeof raw === 'string' && raw.length) {
          try {
            raw = JSON.parse(raw);
          } catch (ignore) { }
        }
        resolve(raw);
      }
      function fail(err) {
        var msg =
          (err && (err.decode_error || err.responseText || err.statusText || err.message)) ||
          (err && err.responseJSON && err.responseJSON.title) ||
          'Request failed';
        reject(new Error(msg));
      }

      if (useJsonAjax) {
        $.ajax({
          url: url,
          type: method,
          timeout: timeout,
          dataType: dataType === 'text' ? 'text' : 'json',
          contentType: opts.jsonBody !== undefined ? 'application/json' : undefined,
          data: opts.jsonBody !== undefined ? JSON.stringify(opts.jsonBody) : undefined,
        })
          .done(ok)
          .fail(fail);
        return;
      }

      if (!net) {
        Lampa.Network.silent(url, ok, fail, postData, { timeout: timeout, dataType: dataType });
        return;
      }

      net.timeout(timeout);
      net.silent(url, ok, fail, postData, { timeout: timeout, dataType: dataType });
    });
  }

  function tmdbJson(url) {
    if (tmdbPosterInflight[url]) return tmdbPosterInflight[url];
    var net = network();
    var inner = new Promise(function (resolve, reject) {
      if (!net) {
        Lampa.Network.silent(url, resolve, reject, null, {
          timeout: TMDB_TIMEOUT_MS,
          dataType: 'json',
        });
        return;
      }
      net.timeout(TMDB_TIMEOUT_MS);
      net.silent(url, resolve, reject, null, { timeout: TMDB_TIMEOUT_MS, dataType: 'json' });
    });
    tmdbPosterInflight[url] = inner.finally(function () {
      delete tmdbPosterInflight[url];
    });
    return tmdbPosterInflight[url];
  }

  function storedUserId() {
    return storageStr('UserId', '');
  }

  function storedUserLabel() {
    return storageStr('UserLabel', '');
  }

  function invalidateUserCache() {
    cachedUserId = '';
    cachedAutoUserName = '';
    libraryIndex.loadedAt = 0;
  }

  function fetchUsers() {
    return jfHttp('/Users').then(function (users) {
      if (!Array.isArray(users) || !users.length) throw new Error('No Jellyfin users');
      return users;
    });
  }

  function defaultUserFromList(users) {
    if (!users || !users.length) return null;
    var i;
    for (i = 0; i < users.length; i++) {
      if (users[i] && users[i].EnableAutoLogin) return users[i];
    }
    return users
      .slice()
      .sort(function (a, b) {
        return String(a.Name || '').localeCompare(String(b.Name || ''), undefined, {
          sensitivity: 'base',
        });
      })[0];
  }

  function rememberAutoUser(user) {
    if (!user) return;
    cachedAutoUserName = String(user.Name || '');
    if (!storedUserId()) cachedUserId = String(user.Id || '');
  }

  function prefetchAutoUser() {
    if (storedUserId()) return;
    fetchUsers()
      .then(function (users) {
        rememberAutoUser(defaultUserFromList(users));
        try {
          Lampa.Settings.update();
        } catch (e) { }
        syncUserInfoField();
      })
      .catch(function () { });
  }

  function resolveUserId() {
    var picked = storedUserId();
    if (picked) {
      cachedUserId = picked;
      return Promise.resolve(picked);
    }
    if (cachedUserId) return Promise.resolve(cachedUserId);
    return fetchUsers().then(function (users) {
      var user = defaultUserFromList(users);
      if (!user || !user.Id) throw new Error('Invalid Jellyfin user id');
      rememberAutoUser(user);
      return cachedUserId;
    });
  }

  function currentUserLabel() {
    var label = storedUserLabel();
    if (label) return label;
    if (cachedAutoUserName) return cachedAutoUserName;
    return Lampa.Lang.translate('jellyfin_user_auto');
  }

  function autoUserPickTitle(users) {
    var user = defaultUserFromList(users);
    var title = Lampa.Lang.translate('jellyfin_user_auto');
    if (user && user.Name) title += ' — ' + user.Name;
    return title;
  }

  function syncUserInfoField() {
    var $descr = $('[data-name="' + STORAGE_PREFIX + 'UserInfo"] .settings-param__descr');
    if ($descr.length) $descr.text(currentUserLabel());
  }

  function pickUserFromList(onDone) {
    var ctl = enabledControllerName('settings');
    fetchUsers()
      .then(function (users) {
        var items = users.map(function (user) {
          return { title: user.Name || user.Id, userId: String(user.Id || '') };
        });
        rememberAutoUser(defaultUserFromList(users));
        items.unshift({
          title: autoUserPickTitle(users),
          userId: '',
        });
        Lampa.Select.show({
          title: Lampa.Lang.translate('jellyfin_user_pick'),
          items: items,
          onBack: function () {
            deferControllerToggle(ctl);
            if (typeof onDone === 'function') onDone();
          },
          onSelect: function (item) {
            if (!item) return;
            if (item.userId) {
              Lampa.Storage.set(STORAGE_PREFIX + 'UserId', item.userId);
              Lampa.Storage.set(STORAGE_PREFIX + 'UserLabel', item.title || '');
            } else {
              Lampa.Storage.set(STORAGE_PREFIX + 'UserId', '');
              Lampa.Storage.set(STORAGE_PREFIX + 'UserLabel', '');
            }
            invalidateUserCache();
            if (item.userId) cachedAutoUserName = '';
            else prefetchAutoUser();
            Lampa.Settings.update();
            syncUserInfoField();
            deferControllerToggle(ctl);
            if (typeof onDone === 'function') onDone();
          },
        });
      })
      .catch(function () {
        Lampa.Bell.push({ text: Lampa.Lang.translate('jellyfin_auth_fail') });
      });
  }

  function posterUrl(item) {
    if (!item) return IMG_PLACEHOLDER;
    var tag =
      (item.ImageTags && item.ImageTags.Primary) || item.SeriesPrimaryImageTag || '';
    if (!tag) return IMG_PLACEHOLDER;
    var id = item.Id;
    if (!id && item.SeriesId) id = item.SeriesId;
    if (!id) return IMG_PLACEHOLDER;
    return (
      apiBase() +
      '/Items/' +
      encodeURIComponent(id) +
      '/Images/Primary?maxHeight=500&tag=' +
      encodeURIComponent(tag) +
      '&api_key=' +
      encodeURIComponent(apiKey())
    );
  }

  function buildTmdbImageUrl(path) {
    var posterSize = Lampa.Storage.field('poster_size') || 'w342';
    return Lampa.Api.img(path, posterSize);
  }

  function streamUrl(itemId) {
    return (
      apiBase() +
      '/Videos/' +
      encodeURIComponent(itemId) +
      '/stream?Static=true&api_key=' +
      encodeURIComponent(apiKey())
    );
  }

  function ticksToSeconds(ticks) {
    var n = Number(ticks);
    if (!isFinite(n) || n <= 0) return 0;
    return Math.floor(n / 10000000);
  }

  function tmdbFromItem(item) {
    if (!item || !item.ProviderIds) return null;
    var id = item.ProviderIds.Tmdb || item.ProviderIds.tmdb;
    if (!id) return null;
    var method = item.Type === 'Series' || item.SeriesName ? 'tv' : 'movie';
    if (item.Type === 'Episode' && item.SeriesId) method = 'tv';
    return { method: method, id: String(id) };
  }

  function detectQuality(name) {
    var n = String(name || '');
    if (/2160p|\b4K\b/i.test(n)) return '4K';
    if (/1080p/i.test(n)) return '1080p';
    if (/720p/i.test(n)) return '720p';
    if (/HDR/i.test(n)) return 'HDR';
    return '';
  }

  function pad2(n) {
    n = Number(n) || 0;
    return n < 10 ? '0' + n : String(n);
  }

  function cleanJellyfinName(name) {
    return String(name || '')
      .replace(RELEASE_FOLDER_RE, '')
      .replace(/\(\s*\)|\s{2,}/g, ' ')
      .trim();
  }

  function episodeNumbers(item) {
    item = item || {};
    return {
      season: Number(item.ParentIndexNumber) || 0,
      episode: Number(item.IndexNumber) || 0,
    };
  }

  function episodeCode(item) {
    var n = episodeNumbers(item);
    return 'S' + pad2(n.season) + 'E' + pad2(n.episode);
  }

  function episodeCodeShort(item) {
    var n = episodeNumbers(item);
    return 'S' + n.season + ':E' + n.episode;
  }

  function cleanEpisodeName(name) {
    var n = String(name || '').trim();
    if (!n || /^s\d+\s*e\d+/i.test(n) || RELEASE_FOLDER_RE.test(n)) return '';
    return n;
  }

  function sortEpisodeRows(rows) {
    return rows.slice().sort(function (a, b) {
      var na = episodeNumbers(a.raw);
      var nb = episodeNumbers(b.raw);
      if (na.season !== nb.season) return na.season - nb.season;
      if (na.episode !== nb.episode) return na.episode - nb.episode;
      return String(a.title || '').localeCompare(String(b.title || ''), undefined, {
        sensitivity: 'base',
      });
    });
  }

  function episodeTitle(item, seriesTitle) {
    var series = seriesTitle || cleanJellyfinName(item.SeriesName) || '';
    var epName = String(item.Name || '').trim();
    if (epName && !/^s\d+\s*e\d+/i.test(epName) && !RELEASE_FOLDER_RE.test(epName)) {
      return series ? series + ' — ' + epName : epName;
    }
    return series ? series + ' — ' + episodeCode(item) : episodeCode(item);
  }

  function cardTitle(item) {
    if (!item) return '';
    if (item.Type === 'Episode') return episodeTitle(item);
    return cleanJellyfinName(item.Name) || item.Name || '';
  }

  function displayTitleFromMeta(item, meta) {
    if (!meta) return cardTitle(item);
    if (item.Type === 'Episode') return episodeTitle(item, meta.title);
    return meta.title || cardTitle(item);
  }

  function hubCardTitle(row) {
    var title = row.title || '';
    if (Lampa.Utils && typeof Lampa.Utils.shortText === 'function') {
      return Lampa.Utils.shortText(title, 54);
    }
    return title.length > 54 ? title.slice(0, 51) + '...' : title;
  }

  function cardYear(item, meta) {
    if (meta && meta.year) return String(meta.year);
    return item.ProductionYear ? String(item.ProductionYear) : '';
  }

  function itemScore(raw) {
    var s = 0;
    if (raw.ImageTags && raw.ImageTags.Primary) s += 100;
    if (tmdbFromItem(raw)) s += 50;
    var name = String(raw.Name || '');
    if (name.length < 42) s += 10;
    if (!RELEASE_FOLDER_RE.test(name)) s += 30;
    if (raw.UserData && Number(raw.UserData.PlayedPercentage) > 0) s += 5;
    return s;
  }

  function mapRow(item, meta) {
    meta = meta || null;
    var tmdb = tmdbFromItem(item);
    var jellyPoster = posterUrl(item);
    var displayTitle = meta ? displayTitleFromMeta(item, meta) : cardTitle(item);
    return {
      id: item.Id,
      raw: item,
      title: displayTitle,
      subtitle: meta && meta.subtitle ? meta.subtitle : '',
      year: cardYear(item, meta),
      poster: jellyPoster,
      displayPoster:
        meta && meta.poster
          ? meta.poster
          : jellyPoster !== IMG_PLACEHOLDER
            ? jellyPoster
            : IMG_PLACEHOLDER,
      type: item.Type || '',
      tmdb: tmdb,
      quality: detectQuality(item.Name),
      rating:
        item.CommunityRating && Number(item.CommunityRating) > 0
          ? parseFloat(item.CommunityRating).toFixed(1)
          : '',
      resumeSec: item.UserData ? ticksToSeconds(item.UserData.PlaybackPositionTicks) : 0,
      playedPct: item.UserData ? Number(item.UserData.PlayedPercentage) || 0 : 0,
      watched: !!(item.UserData && item.UserData.Played),
    };
  }

  function fetchTmdbMeta(tmdb) {
    var key = tmdb.method + '/' + tmdb.id;
    if (tmdbMetaCache[key]) return Promise.resolve(tmdbMetaCache[key]);
    var lang =
      Lampa.Storage.field('tmdb_lang') || Lampa.Storage.get('language') || 'en';
    var url = Lampa.TMDB.api(
      tmdb.method +
      '/' +
      tmdb.id +
      '?api_key=' +
      Lampa.TMDB.key() +
      '&language=' +
      lang
    );
    return tmdbJson(url)
      .then(function (data) {
        var meta = {
          title:
            data.title ||
            data.name ||
            data.original_title ||
            data.original_name ||
            '',
          year: String(
            (data.release_date || data.first_air_date || '').slice(0, 4) || ''
          ),
          poster: data.poster_path ? buildTmdbImageUrl(data.poster_path) : '',
          subtitle: data.tagline || '',
        };
        tmdbMetaCache[key] = meta;
        return meta;
      })
      .catch(function () {
        return null;
      });
  }

  function promiseAllChunks(items, size, fn) {
    if (!items.length) return Promise.resolve([]);
    size = Math.max(1, size || 8);
    var chunks = [];
    var i;
    for (i = 0; i < items.length; i += size) chunks.push(items.slice(i, i + size));
    var seq = Promise.resolve([]);
    chunks.forEach(function (chunk) {
      seq = seq.then(function (acc) {
        return Promise.all(chunk.map(fn)).then(function (part) {
          return acc.concat(part);
        });
      });
    });
    return seq;
  }

  function enrichRowsFromTmdb(rows) {
    if (!storageToggle('TmdbPosters', true)) return Promise.resolve(rows);
    return promiseAllChunks(rows, TMDB_ENRICH_CONCURRENCY, function (row) {
      if (!row.tmdb) return Promise.resolve(row);
      var raw = row.raw || {};
      var needsPoster = !row.poster || row.poster === IMG_PLACEHOLDER;
      var needsTitle =
        RELEASE_FOLDER_RE.test(raw.Name || '') ||
        RELEASE_FOLDER_RE.test(raw.SeriesName || '') ||
        raw.Type === 'Episode';
      if (!needsPoster && !needsTitle) return Promise.resolve(row);
      return fetchTmdbMeta(row.tmdb).then(function (meta) {
        if (!meta) return row;
        return Object.assign({}, row, mapRow(row.raw, meta));
      });
    });
  }

  function dedupeRows(rows) {
    var best = {};
    var loose = [];
    rows.forEach(function (row) {
      if (row.tmdb) {
        var key = row.tmdb.method + '/' + row.tmdb.id;
        if (!best[key] || itemScore(row.raw) > itemScore(best[key].raw)) best[key] = row;
      } else {
        loose.push(row);
      }
    });
    var out = Object.keys(best).map(function (k) {
      return best[k];
    });
    var seen = {};
    loose.forEach(function (row) {
      var nk = String(row.title || '')
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim();
      if (!nk.length || seen[nk]) return;
      seen[nk] = true;
      out.push(row);
    });
    out.sort(function (a, b) {
      return String(a.title).localeCompare(String(b.title), undefined, { sensitivity: 'base' });
    });
    return out;
  }

  function filterRows(rows, category) {
    if (!storageToggle('HideFolders', true)) return rows;
    return rows.filter(function (row) {
      if (row.tmdb) return true;
      if (RELEASE_FOLDER_RE.test(row.raw.Name || row.title || '')) return false;
      if (
        category === 'Series' &&
        (!row.poster || row.poster === IMG_PLACEHOLDER) &&
        (!row.displayPoster || row.displayPoster === IMG_PLACEHOLDER)
      ) {
        return false;
      }
      return true;
    });
  }

  function processRows(items, category) {
    var rows = items.map(function (item) {
      return mapRow(item);
    });
    if (category === 'Episode') {
      rows = sortEpisodeRows(rows);
      return enrichRowsFromTmdb(rows).then(function (enriched) {
        return sortEpisodeRows(enriched);
      });
    }
    if (storageToggle('Dedupe', true)) rows = dedupeRows(rows);
    return enrichRowsFromTmdb(rows).then(function (enriched) {
      return filterRows(enriched, category);
    });
  }

  function listPath(category, userId, startIndex) {
    var fields =
      'ProviderIds,ImageTags,ProductionYear,SeriesName,ParentIndexNumber,IndexNumber,UserData,SeriesId,SeriesPrimaryImageTag,CommunityRating,OfficialRating,RunTimeTicks';
    var common =
      'StartIndex=' +
      (startIndex || 0) +
      '&Limit=' +
      PAGE_SIZE +
      '&Fields=' +
      encodeURIComponent(fields) +
      '&EnableImageTypes=Primary&SortBy=SortName&SortOrder=Ascending';

    if (category === 'Resume') {
      return (
        '/Users/' +
        encodeURIComponent(userId) +
        '/Items/Resume?MediaTypes=Video&' +
        common
      );
    }

    var type = category === 'Series' ? 'Series' : 'Movie';
    return (
      '/Items?UserId=' +
      encodeURIComponent(userId) +
      '&Recursive=true&IncludeItemTypes=' +
      type +
      '&' +
      common
    );
  }

  function latestFieldsQuery() {
    return (
      'Limit=' +
      PAGE_SIZE +
      '&Fields=' +
      encodeURIComponent(
        'ProviderIds,ImageTags,ProductionYear,SeriesName,ParentIndexNumber,IndexNumber,UserData,SeriesId,SeriesPrimaryImageTag,CommunityRating,RunTimeTicks'
      ) +
      '&EnableImageTypes=Primary'
    );
  }

  function fetchLatest(userId) {
    return jfHttp(
      '/Users/' +
      encodeURIComponent(userId) +
      '/Items/Latest?' +
      latestFieldsQuery()
    ).then(function (data) {
      var items = Array.isArray(data) ? data : (data && data.Items) || [];
      return processRows(items, 'Latest').then(function (rows) {
        return {
          rows: rows,
          total: rows.length,
          next: items.length,
          hasMore: false,
        };
      });
    });
  }

  function fetchItems(category, startIndex) {
    return resolveUserId().then(function (userId) {
      if (category === 'Latest') return fetchLatest(userId);

      return jfHttp(listPath(category, userId, startIndex)).then(function (data) {
        var items = (data && data.Items) || [];
        var total =
          data && typeof data.TotalRecordCount === 'number'
            ? data.TotalRecordCount
            : items.length;
        return processRows(items, category).then(function (rows) {
          return {
            rows: rows,
            total: total,
            next: (startIndex || 0) + items.length,
            hasMore: (startIndex || 0) + items.length < total,
          };
        });
      });
    });
  }

  function hubSection(result, category) {
    var rows = (result && result.rows) || [];
    return {
      category: category,
      rows: rows.slice(0, HUB_PREVIEW_LIMIT),
      total: (result && result.total) || rows.length,
      previewPosters: rows
        .slice(0, 3)
        .map(function (row) {
          return row.displayPoster || row.poster;
        })
        .filter(function (url) {
          return url && url !== IMG_PLACEHOLDER;
        }),
    };
  }

  function fetchHubData() {
    return Promise.all([
      fetchItems('Resume', 0),
      fetchItems('Latest', 0),
      fetchItems('Movie', 0),
      fetchItems('Series', 0),
    ]).then(function (parts) {
      return {
        resume: hubSection(parts[0], 'Resume'),
        latest: hubSection(parts[1], 'Latest'),
        movies: hubSection(parts[2], 'Movie'),
        series: hubSection(parts[3], 'Series'),
      };
    });
  }

  function bindJellyfinCard($card, row, ctx) {
    $card.on('hover:focus', function () {
      if (ctx.onFocus) ctx.onFocus(this, $card, row);
    });
    if (ctx.interactive !== false) {
      var tapToPlay = ctx.tapToPlay;
      $card.on('hover:enter', function () {
        if (tapToPlay) playMediaRow(row);
        else showItemMenu(row);
      });
      $card.on('hover:long', function () {
        showItemMenu(row);
      });
    }
    $card.on('jf:update', function (_e, updated) {
      injectCardChrome($card, updated, { hubLine: !!(ctx && ctx.compact) });
      updateCardPoster($card, updated);
      $card.find('.card__title').text(ctx && ctx.compact ? hubCardTitle(updated) : updated.title);
      if (updated.year) $card.find('.card__age').text(updated.year);
      if (ctx && ctx.compact) applyHubCardMeta($card, updated);
    });
  }

  function applyHubCardMeta($card, row) {
    var $view = $card.find('.card__view');
    $view.find('.card__vote').remove();

    if (row.rating && parseFloat(row.rating) > 0) {
      $view.append($('<div class="card__vote"></div>').text(row.rating));
    }

    var isEpisode = row.raw && row.raw.Type === 'Episode';
    var $quality = $view.find('.card__quality');
    if (row.quality && !isEpisode) {
      if (!$quality.length) {
        $quality = $('<div class="card__quality"><div></div></div>');
        $view.append($quality);
      }
      $quality.find('div').text(row.quality);
    } else {
      $quality.remove();
    }
  }

  function makeJellyfinCard(row, ctx) {
    var title = ctx && ctx.compact ? hubCardTitle(row) : row.title;
    var $card = Lampa.Template.get('card', {
      title: title,
      release_year: row.year,
    });
    $card.addClass('card--loaded jellyfin-card');
    if (ctx && ctx.compact) $card.addClass('jellyfin-card--hub-line');
    updateCardPoster($card, row);
    injectCardChrome($card, row, { hubLine: !!(ctx && ctx.compact) });
    if (ctx && ctx.compact) applyHubCardMeta($card, row);
    bindJellyfinCard($card, row, ctx);
    if (ctx.cardsById) ctx.cardsById[String(row.id)] = { $card: $card, row: row };
    return $card;
  }

  function makeFolderCard(folder, onFocus, opts) {
    opts = opts || {};
    var $card = Lampa.Template.get('jellyfin_folder', {});
    $card.find('.bookmarks-folder__title').text(folder.title || '');
    $card.find('.bookmarks-folder__num').text(String(folder.count || 0));

    var posters = (folder.posters || []).slice(0, 3);
    if (!posters.length) posters = [IMG_PLACEHOLDER];

    var $body = $card.find('.bookmarks-folder__body');
    posters.forEach(function (src, idx) {
      var $img = $('<img class="card__img i-' + idx + '">');
      $img.attr('src', src || IMG_PLACEHOLDER);
      $body.append($img);
    });

    $card.addClass('card--loaded');
    $card.on('hover:focus', function () {
      if (onFocus) onFocus(this, $card);
      var bg = posters[0];
      if (bg && bg !== IMG_PLACEHOLDER) Lampa.Background.change(bg);
    });
    if (!opts.noEnter) {
      $card.on('hover:enter', function () {
        if (folder.category) openCategory(folder.category);
      });
    }
    return $card;
  }

  function hubCategoryFromKey(key) {
    if (key === 'resume') return 'Resume';
    if (key === 'latest') return 'Latest';
    if (key === 'movies') return 'Movie';
    if (key === 'series') return 'Series';
    return '';
  }

  function hubLibraryFolders(data) {
    var folders = [];
    if (data.movies.total) {
      folders.push({
        title: Lampa.Lang.translate('jellyfin_movies'),
        count: data.movies.total,
        posters: data.movies.previewPosters,
        category: 'Movie',
      });
    }
    if (data.series.total) {
      folders.push({
        title: Lampa.Lang.translate('jellyfin_series'),
        count: data.series.total,
        posters: data.series.previewPosters,
        category: 'Series',
      });
    }
    return folders;
  }

  function buildHubLines(data) {
    var lines = [];
    var stats = [
      {
        key: 'resume',
        label: Lampa.Lang.translate('jellyfin_stat_resume'),
        value: data.resume.total,
      },
      {
        key: 'latest',
        label: Lampa.Lang.translate('jellyfin_stat_latest'),
        value: data.latest.total,
      },
      {
        key: 'movies',
        label: Lampa.Lang.translate('jellyfin_stat_movies'),
        value: data.movies.total,
      },
      {
        key: 'series',
        label: Lampa.Lang.translate('jellyfin_stat_series'),
        value: data.series.total,
      },
    ];
    var folders = hubLibraryFolders(data);

    if (hubHasContent(data)) {
      lines.push({
        title: '',
        nomore: true,
        line_type: 'cards',
        _jf_stats: true,
        results: stats.map(function (stat) {
          return {
            title: stat.label,
            count: stat.value,
            _jf_stat: stat,
          };
        }),
      });
    }

    function pushSection(spec) {
      var results = [];
      (spec.folders || []).forEach(function (folder) {
        results.push({ jellyfin_folder: folder });
      });
      spec.rows.forEach(function (row) {
        results.push({
          jellyfin_row: row,
          title: hubCardTitle(row),
          release_year: row.year,
        });
      });
      if (!results.length) return;

      lines.push({
        title: spec.title,
        category: spec.category,
        _jf_key: spec.key,
        noimage: true,
        more: spec.total > spec.rows.length,
        nomore: spec.total <= spec.rows.length,
        results: results,
      });
    }

    if (data.resume.rows.length) {
      pushSection({
        key: 'resume',
        title: Lampa.Lang.translate('jellyfin_resume'),
        category: 'Resume',
        rows: data.resume.rows,
        total: data.resume.total,
      });
    }

    if (data.latest.rows.length || folders.length) {
      pushSection({
        key: 'latest',
        title: Lampa.Lang.translate('jellyfin_latest'),
        category: 'Latest',
        rows: data.latest.rows,
        total: data.latest.total,
        folders: folders,
      });
    }

    if (data.movies.rows.length) {
      pushSection({
        key: 'movies',
        title: Lampa.Lang.translate('jellyfin_movies'),
        category: 'Movie',
        rows: data.movies.rows,
        total: data.movies.total,
      });
    }

    if (data.series.rows.length) {
      pushSection({
        key: 'series',
        title: Lampa.Lang.translate('jellyfin_series'),
        category: 'Series',
        rows: data.series.rows,
        total: data.series.total,
      });
    }

    return lines;
  }

  function attachHubRowListener(hubCtx) {
    function onRowUpdated(e) {
      if (!e || !e.row) return;
      var slot = hubCtx.cardsById[String(e.row.id)];
      if (!slot) return;
      slot.row = e.row;
      slot.$card.trigger('jf:update', [e.row]);
    }
    hubCtx.onRowUpdated = onRowUpdated;
    Lampa.Listener.follow('jellyfin:row-updated', onRowUpdated);
  }

  function detachHubRowListener(hubCtx) {
    if (hubCtx.onRowUpdated) Lampa.Listener.remove('jellyfin:row-updated', hubCtx.onRowUpdated);
  }

  function hubHasContent(data) {
    return !!(
      data.resume.rows.length ||
      data.latest.rows.length ||
      data.movies.rows.length ||
      data.series.rows.length
    );
  }

  function HubFallbackComponent(object, hubCtx) {
    var self = this;
    var scroll = new Lampa.Scroll({ mask: true, over: true, scroll_by_item: true, end_ratio: 1.5 });
    var html = $('<div class="jellyfin-hub"></div>');
    var lines = [];
    var active = 0;

    this.create = function () {
      self.activity.loader(true);
      html.append(scroll.render());

      scroll.onWheel = function (step) {
        if (step > 0) self.down();
        else if (active > 0) self.up();
      };

      fetchHubData()
        .then(function (data) {
          if (!hubHasContent(data)) {
            scroll.append(
              $('<div class="jellyfin-state jellyfin-hub-empty"><div class="jellyfin-state__title">' +
                Lampa.Lang.translate('jellyfin_empty') +
                '</div></div>')
            );
            return;
          }
          buildHubLines(data).forEach(function (lineData) {
            if (!lineData.results || !lineData.results.length) return;
            var line = new HubLineFallback(lineData, hubCtx);
            line.create();
            line.onDown = self.down.bind(self);
            line.onUp = self.up.bind(self);
            line.onBack = self.back.bind(self);
            scroll.append(line.render());
            lines.push(line);
          });
          scroll.minus();
          if (lines.length) scroll.update(lines[0].render());
          if (Lampa.Layer && Lampa.Layer.visible) Lampa.Layer.visible(scroll.render()[0]);
          if (lines.length) {
            try {
              var act = Lampa.Activity.active();
              if (act && act.activity === self.activity) lines[active].toggle();
            } catch (e) { }
          }
        })
        .catch(function () {
          scroll.append(
            $('<div class="jellyfin-state"><div class="jellyfin-state__title">' +
              Lampa.Lang.translate('jellyfin_error') +
              '</div></div>')
          );
        })
        .then(function () {
          self.activity.loader(false);
          self.activity.toggle();
        });

      return html;
    };

    this.down = function () {
      if (!lines.length) return;
      active = Math.min(active + 1, lines.length - 1);
      scroll.update(lines[active].render());
      lines[active].toggle();
    };

    this.up = function () {
      if (!lines.length) return;
      active--;
      if (active < 0) {
        active = 0;
        Lampa.Controller.toggle('head');
      } else {
        lines[active].toggle();
        scroll.update(lines[active].render());
      }
    };

    this.start = function () {
      self.background();
      if (Lampa.Activity.active().activity !== self.activity) return;
      Lampa.Controller.add('content', {
        link: self,
        toggle: function () {
          if (lines.length) {
            scroll.restorePosition();
            lines[active].toggle();
          }
        },
        left: function () {
          if (Navigator.canmove('left')) Navigator.move('left');
          else Lampa.Controller.toggle('menu');
        },
        right: function () {
          Navigator.move('right');
        },
        up: function () {
          if (Navigator.canmove('up')) Navigator.move('up');
          else if (active > 0) self.up();
          else Lampa.Controller.toggle('head');
        },
        down: function () {
          if (Navigator.canmove('down')) Navigator.move('down');
          else self.down();
        },
        back: self.back,
      });
      Lampa.Controller.toggle('content');
    };

    this.background = function () {
      Lampa.Background.immediately('');
    };
    this.pause = function () { };
    this.stop = function () { };
    this.render = function () {
      return html;
    };
    this.destroy = function () {
      detachHubRowListener(hubCtx);
      hubCtx.cardsById = {};
      lines.forEach(function (line) {
        line.destroy();
      });
      lines = [];
      scroll.destroy();
      html.remove();
    };
    this.back = function () {
      Lampa.Activity.backward();
    };
  }

  function HubComponent(object) {
    var hubCtx = {
      tapToPlay: storageToggle('TapPlay', false),
      cardsById: {},
    };

    attachHubRowListener(hubCtx);
    return new HubFallbackComponent(object, hubCtx);
  }

  function HubLineFallback(data, hubCtx) {
    var content = Lampa.Template.get('items_line', { title: data.title || '' });
    var body = content.find('.items-line__body');
    var scroll = new Lampa.Scroll({ horizontal: true, step: 300 });
    var last = null;

    content.addClass('items-line--type-' + (data._jf_stats ? 'default' : 'cards'));
    if (data._jf_stats) content.addClass('items-line--jf-stats');
    if (!data.title) content.addClass('items-line--jf-no-title');

    this.create = function () {
      scroll.body().addClass('items-cards mapping--line');
      if (data.title) content.find('.items-line__title').text(data.title);

      (data.results || []).forEach(function (element) {
        var $render = null;
        var focusBg = null;

        if (element._jf_stat) {
          var stat = element._jf_stat;
          $render = Lampa.Template.get('register');
          $render.addClass('selector register--line');
          $render.find('.register__name').text(stat.label || '');
          $render.find('.register__counter').text(String(stat.value == null ? 0 : stat.value));
          $render.on('hover:enter', function () {
            var category = hubCategoryFromKey(stat.key);
            if (category) openCategory(category);
          });
        } else if (element.jellyfin_folder) {
          var folder = element.jellyfin_folder;
          $render = makeFolderCard(folder);
          focusBg = (folder.posters && folder.posters[0]) || null;
        } else if (element.jellyfin_row) {
          var row = element.jellyfin_row;
          $render = makeJellyfinCard(row, {
            tapToPlay: hubCtx.tapToPlay,
            cardsById: hubCtx.cardsById,
            compact: true,
          });
          focusBg = row.displayPoster || row.poster;
        }

        if (!$render) return;

        $render.on('hover:focus', function (e) {
          last = e.target;
          scroll.update($render, true);
          if (focusBg && focusBg !== IMG_PLACEHOLDER) Lampa.Background.change(focusBg);
        });
        scroll.append($render);
      });

      if (data.category && data.more && !data.nomore) {
        var $more = $('<div class="items-line__more selector"></div>').text(
          Lampa.Lang.translate('jellyfin_more')
        );
        $more.on('hover:enter', function () {
          openCategory(data.category);
        });
        $more.on('hover:focus', function (e) {
          last = e.target;
        });
        content.find('.items-line__head').append($more);
      }

      body.append(scroll.render());
      setTimeout(function () {
        content.trigger('visible');
        if (Lampa.Layer && Lampa.Layer.visible) Lampa.Layer.visible(scroll.render()[0]);
      }, 0);
    };

    this.toggle = function () {
      var self = this;
      Lampa.Controller.add('items_line', {
        toggle: function () {
          Lampa.Controller.collectionSet(scroll.render());
          Lampa.Controller.collectionFocus(last || false, scroll.render());
        },
        right: function () {
          if (Navigator.canmove('right')) Navigator.move('right');
        },
        left: function () {
          if (Navigator.canmove('left')) Navigator.move('left');
          else if (self.onLeft) self.onLeft();
          else Lampa.Controller.toggle('menu');
        },
        down: this.onDown,
        up: this.onUp,
        gone: function () { },
        back: this.onBack,
      });
      Lampa.Controller.toggle('items_line');
    };

    this.render = function () {
      return content;
    };

    this.destroy = function () {
      scroll.destroy();
      content.remove();
    };
  }

  function fetchEpisodes(seriesId) {
    return resolveUserId().then(function (userId) {
      return jfHttp(
        '/Items?UserId=' +
        encodeURIComponent(userId) +
        '&ParentId=' +
        encodeURIComponent(seriesId) +
        '&IncludeItemTypes=Episode&Recursive=true&Fields=' +
        encodeURIComponent(
          'ProviderIds,ImageTags,IndexNumber,ParentIndexNumber,UserData,SeriesName,SeriesPrimaryImageTag,Name'
        ) +
        '&SortBy=ParentIndexNumber&SortBy=IndexNumber&SortOrder=Ascending'
      ).then(function (data) {
        return processRows((data && data.Items) || [], 'Episode');
      });
    });
  }

  function refreshLibraryIndex(force) {
    if (!force && libraryIndex.loadedAt && Date.now() - libraryIndex.loadedAt < LIBRARY_INDEX_TTL_MS) {
      return Promise.resolve(libraryIndex.byTmdb);
    }
    return resolveUserId().then(function (userId) {
      return jfHttp(
        '/Items?UserId=' +
        encodeURIComponent(userId) +
        '&Recursive=true&IncludeItemTypes=Movie,Series&Fields=' +
        encodeURIComponent('ProviderIds,Type,Id,Name,UserData,ImageTags') +
        '&Limit=500'
      );
    })
      .then(function (data) {
        var byTmdb = {};
        ((data && data.Items) || []).forEach(function (item) {
          var tmdb = tmdbFromItem(item);
          if (!tmdb) return;
          var key = tmdb.method + '/' + tmdb.id;
          var row = mapRow(item);
          if (!byTmdb[key] || itemScore(item) > itemScore(byTmdb[key].raw)) {
            byTmdb[key] = row;
          }
        });
        libraryIndex.byTmdb = byTmdb;
        libraryIndex.loadedAt = Date.now();
        return byTmdb;
      })
      .catch(function () {
        return libraryIndex.byTmdb;
      });
  }

  function findLibraryRow(method, id) {
    var key = String(method || '') + '/' + String(id || '');
    return libraryIndex.byTmdb[key] || null;
  }

  function enabledControllerName(fallback) {
    fallback = fallback || 'content';
    try {
      var cur = Lampa.Controller.enabled();
      return (cur && cur.name) || fallback;
    } catch (e) {
      return fallback;
    }
  }

  function deferControllerToggle(name) {
    setTimeout(function () {
      try {
        Lampa.Controller.toggle(name);
      } catch (e) { }
    }, 10);
  }

  function pushCard(tmdb) {
    Lampa.Activity.push({
      url: '',
      component: 'full',
      id: tmdb.id,
      method: tmdb.method,
      source: Lampa.Storage.get('source') || 'tmdb',
    });
  }

  function playRow(row, playlist) {
    var title = row.title;
    var url = streamUrl(row.id);
    var timeline =
      row.resumeSec > 0 ? { time: row.resumeSec, duration: 0, percent: 0 } : null;
    var payload = { title: title, url: url, timeline: timeline, movie: row.raw };

    Lampa.Player.play(payload);
    if (playlist && playlist.length) Lampa.Player.playlist(playlist);
    else Lampa.Player.playlist([payload]);
  }

  function buildPlaylist(rows, startRow) {
    return rows.map(function (row) {
      return {
        title: row.title,
        url: streamUrl(row.id),
        timeline: row.resumeSec > 0 ? { time: row.resumeSec } : null,
      };
    });
  }

  function episodePickerItem(row) {
    var raw = row.raw || {};
    var code = episodeCodeShort(raw);
    var name = cleanEpisodeName(raw.Name);
    var subtitle = name || '';
    if (row.playedPct >= 100) {
      subtitle = subtitle
        ? subtitle + ' · ' + Lampa.Lang.translate('jellyfin_watched')
        : Lampa.Lang.translate('jellyfin_watched');
    } else if (row.playedPct > 0) {
      subtitle = subtitle
        ? subtitle + ' · ' + Math.round(row.playedPct) + '%'
        : Math.round(row.playedPct) + '%';
    }
    return { title: code, subtitle: subtitle, row: row };
  }

  function applyWatchedState(row, watched) {
    row.watched = watched;
    row.playedPct = watched ? 100 : 0;
    row.resumeSec = 0;
    if (!row.raw.UserData) row.raw.UserData = {};
    row.raw.UserData.Played = watched;
    row.raw.UserData.PlayedPercentage = watched ? 100 : 0;
    row.raw.UserData.PlaybackPositionTicks = 0;
    return row;
  }

  function setItemWatched(row, watched) {
    return resolveUserId().then(function (userId) {
      var path =
        '/Users/' +
        encodeURIComponent(userId) +
        '/PlayedItems/' +
        encodeURIComponent(row.id);
      if (watched) return jfHttp(path, { method: 'POST', jsonBody: {} });
      return jfHttp(path, { method: 'DELETE', dataType: 'text' });
    });
  }

  function notifyRowWatchedChange(row, watched) {
    applyWatchedState(row, watched);
    Lampa.Bell.push({
      text: Lampa.Lang.translate(
        watched ? 'jellyfin_mark_watched_ok' : 'jellyfin_mark_unwatched_ok'
      ),
    });
    try {
      Lampa.Listener.send('jellyfin:row-updated', { row: row });
    } catch (e) { }
  }

  function showEpisodePicker(rows, onBack) {
    var ctl = enabledControllerName();
    Lampa.Select.show({
      title: Lampa.Lang.translate('jellyfin_pick_episode'),
      items: rows.map(episodePickerItem),
      onBack: function () {
        if (typeof onBack === 'function') onBack();
        else deferControllerToggle(ctl);
      },
      onSelect: function (sel) {
        if (!sel || !sel.row) return;
        playRow(sel.row, buildPlaylist(rows, sel.row));
        deferControllerToggle(ctl);
      },
    });
  }

  function playMediaRow(row) {
    if (row.type === 'Series') {
      fetchEpisodes(row.id)
        .then(function (eps) {
          if (!eps.length) {
            Lampa.Bell.push({ text: Lampa.Lang.translate('jellyfin_empty') });
            return;
          }
          var resume = eps.find(function (ep) {
            return ep.playedPct > 0 && ep.playedPct < 100;
          });
          if (resume) {
            playRow(resume, buildPlaylist(eps, resume));
            return;
          }
          if (eps.length === 1) {
            playRow(eps[0], buildPlaylist(eps, eps[0]));
            return;
          }
          showEpisodePicker(eps);
        })
        .catch(function () {
          Lampa.Bell.push({ text: Lampa.Lang.translate('jellyfin_error') });
        });
      return;
    }
    playRow(row);
  }

  function openMediaCard(row) {
    var tmdb = row.tmdb;
    if (tmdb) {
      pushCard(tmdb);
      return;
    }
    if (row.type === 'Episode' && row.raw.SeriesId) {
      jfHttp('/Items/' + encodeURIComponent(row.raw.SeriesId))
        .then(function (series) {
          var fromSeries = tmdbFromItem(series);
          if (!fromSeries) {
            Lampa.Bell.push({ text: Lampa.Lang.translate('jellyfin_no_tmdb') });
            return;
          }
          pushCard(fromSeries);
        })
        .catch(function () {
          Lampa.Bell.push({ text: Lampa.Lang.translate('jellyfin_error') });
        });
      return;
    }
    Lampa.Bell.push({ text: Lampa.Lang.translate('jellyfin_no_tmdb') });
  }

  function showItemMenu(row) {
    var ctl = enabledControllerName();
    var items = [{ title: Lampa.Lang.translate('jellyfin_play'), action: 'play' }];

    if (row.tmdb || row.type === 'Episode' || row.type === 'Series') {
      items.push({ title: Lampa.Lang.translate('jellyfin_open_card'), action: 'card' });
    }
    if (row.type === 'Series') {
      items.push({ title: Lampa.Lang.translate('jellyfin_episodes'), action: 'episodes' });
    }
    items.push({
      title: Lampa.Lang.translate(row.watched ? 'jellyfin_mark_unwatched' : 'jellyfin_mark_watched'),
      action: row.watched ? 'unwatched' : 'watched',
    });

    Lampa.Select.show({
      title: row.title,
      items: items,
      onBack: function () {
        deferControllerToggle(ctl);
      },
      onSelect: function (sel) {
        if (!sel) return;
        if (sel.action === 'play') playMediaRow(row);
        else if (sel.action === 'card') openMediaCard(row);
        else if (sel.action === 'episodes') {
          fetchEpisodes(row.id).then(function (eps) {
            if (!eps.length) Lampa.Bell.push({ text: Lampa.Lang.translate('jellyfin_empty') });
            else showEpisodePicker(eps);
          });
        } else if (sel.action === 'watched' || sel.action === 'unwatched') {
          var markWatched = sel.action === 'watched';
          setItemWatched(row, markWatched)
            .then(function () {
              notifyRowWatchedChange(row, markWatched);
            })
            .catch(function () {
              Lampa.Bell.push({ text: Lampa.Lang.translate('jellyfin_error') });
            });
        }
        deferControllerToggle(ctl);
      },
    });
  }

  function injectCardChrome($card, row, opts) {
    opts = opts || {};
    var $view = $card.find('.card__view');
    if (!$view.length) return;

    $view.find('.jellyfin-card-chrome,.jellyfin-card-shade').remove();
    $view.append('<div class="jellyfin-card-shade" aria-hidden="true"></div>');

    var $chrome = $('<div class="jellyfin-card-chrome" aria-hidden="true"></div>');
    if (row.raw && row.raw.Type === 'Episode') {
      $chrome.append(
        '<div class="jellyfin-badge jellyfin-badge-episode">' +
        episodeCodeShort(row.raw) +
        '</div>'
      );
    }
    if (row.quality && !opts.hubLine) {
      var qualityClass =
        row.raw && row.raw.Type === 'Episode'
          ? 'jellyfin-badge-quality jellyfin-badge-quality--episode'
          : 'jellyfin-badge-quality';
      $chrome.append('<div class="jellyfin-badge ' + qualityClass + '">' + row.quality + '</div>');
    } else if (row.quality && opts.hubLine && row.raw && row.raw.Type === 'Episode') {
      $chrome.append(
        '<div class="jellyfin-badge jellyfin-badge-quality jellyfin-badge-quality--episode">' +
        row.quality +
        '</div>'
      );
    }
    if (row.watched || row.playedPct >= 100) {
      $chrome.append('<div class="jellyfin-badge jellyfin-badge-watched">✓</div>');
    }
    if (row.playedPct > 0 && row.playedPct < 100) {
      $chrome.append(
        '<div class="jellyfin-card-progress"><span style="width:' +
        Math.min(100, Math.round(row.playedPct)) +
        '%"></span></div>'
      );
    }
    $view.append($chrome);
  }

  function updateCardPoster($card, row) {
    var src = row.displayPoster || row.poster;
    if (src && src !== IMG_PLACEHOLDER) $card.find('.card__img').attr('src', src);
  }

  function PanelComponent(object) {
    var self = this;
    var category = (object && object.category) || 'Movie';
    var scroll = new Lampa.Scroll({ mask: true, over: true, step: 250 });
    var head = $('<div class="jellyfin-head"></div>');
    var body = $('<div class="category-full mapping--grid cols--6 jellyfin-grid"></div>');
    var html = $('<div class="jellyfin-module"></div>');
    var last = null;
    var rows = [];
    var loading = false;
    var hasMore = true;
    var startIndex = 0;
    var tapToPlay = storageToggle('TapPlay', false);
    var cardsById = {};

    function onRowUpdated(e) {
      if (!e || !e.row) return;
      var slot = cardsById[String(e.row.id)];
      if (!slot) return;
      slot.row = e.row;
      slot.$card.trigger('jf:update', [e.row]);
    }

    Lampa.Listener.follow('jellyfin:row-updated', onRowUpdated);

    scroll.append(head);
    scroll.append(body);
    scroll.minus(head);
    html.append(scroll.render());

    scroll.onWheel = function (step) {
      if (Navigator && Navigator.move) Navigator.move(step > 0 ? 'down' : 'up');
    };

    scroll.onEnd = function () {
      if (loading || !hasMore) return;
      loadMore();
    };

    function headTitle() {
      if (category === 'Series') return Lampa.Lang.translate('jellyfin_series');
      if (category === 'Resume') return Lampa.Lang.translate('jellyfin_resume');
      if (category === 'Latest') return Lampa.Lang.translate('jellyfin_latest');
      return Lampa.Lang.translate('jellyfin_movies');
    }

    function renderHead() {
      head.html(
        '<div class="jellyfin-head__title">' + $('<div>').text(headTitle()).html() + '</div>'
      );
    }

    function cardCtx() {
      return {
        tapToPlay: tapToPlay,
        cardsById: cardsById,
        onFocus: function (el, $card, row) {
          last = el;
          scroll.update($card, false);
          var bg = row.displayPoster || row.poster;
          if (bg && bg !== IMG_PLACEHOLDER) Lampa.Background.change(bg);
        },
      };
    }

    function buildGrid(list, append) {
      if (!append) {
        body.empty();
        cardsById = {};
      }
      body.removeClass('jellyfin-catalog--state');

      if (!list.length && !append) {
        renderEmpty();
        return;
      }

      list.forEach(function (row) {
        body.append(makeJellyfinCard(row, cardCtx()));
      });

      setTimeout(function () {
        try {
          Lampa.Controller.collectionSet(scroll.render());
          Lampa.Controller.collectionFocus(last || false, scroll.render());
        } catch (e) { }
      }, 0);
    }

    function renderEmpty(opts) {
      body.empty().addClass('jellyfin-catalog--state');
      opts = opts || {};
      var $box = $('<div class="jellyfin-state"></div>');
      $box.append(
        '<div class="jellyfin-state__title">' +
        $('<div>').text(opts.title || Lampa.Lang.translate('jellyfin_empty')).html() +
        '</div>'
      );
      $box.append(
        '<div class="jellyfin-state__descr">' +
        $('<div>').text(opts.descr || Lampa.Lang.translate('jellyfin_empty_descr')).html() +
        '</div>'
      );
      var $retry = $(
        '<div class="simple-button selector">' + Lampa.Lang.translate('jellyfin_retry') + '</div>'
      );
      $retry.on('hover:enter', reload);
      $retry.on('hover:focus', function () {
        last = this;
        scroll.update($retry, true);
      });
      $box.append($retry);
      body.append($box);
      last = $retry[0];
    }

    function reload() {
      Lampa.Activity.replace({
        url: '',
        title: headTitle(),
        component: PANEL_COMPONENT,
        category: category,
        page: 1,
      });
    }

    function loadInitial() {
      loading = true;
      self.activity.loader(true);
      fetchItems(category, 0)
        .then(function (result) {
          rows = result.rows;
          startIndex = result.next;
          hasMore = result.hasMore;
          renderHead();
          buildGrid(rows, false);
        })
        .catch(function () {
          renderHead();
          renderEmpty({
            title: Lampa.Lang.translate('jellyfin_error'),
            descr: Lampa.Lang.translate('jellyfin_settings_hint'),
          });
        })
        .then(function () {
          loading = false;
          self.activity.loader(false);
          self.activity.toggle();
        });
    }

    function loadMore() {
      loading = true;
      fetchItems(category, startIndex)
        .then(function (result) {
          rows = rows.concat(result.rows);
          startIndex = result.next;
          hasMore = result.hasMore;
          buildGrid(result.rows, true);
        })
        .catch(function () { })
        .then(function () {
          loading = false;
        });
    }

    this.create = function () {
      loadInitial();
      return html;
    };

    this.start = function () {
      self.background();
      Lampa.Controller.add('content', {
        toggle: function () {
          scroll.restorePosition();
          Lampa.Controller.collectionSet(scroll.render());
          Lampa.Controller.collectionFocus(last || false, scroll.render());
        },
        left: function () {
          if (Navigator.canmove('left')) Navigator.move('left');
          else Lampa.Controller.toggle('menu');
        },
        right: function () {
          if (Navigator.canmove('right')) Navigator.move('right');
        },
        up: function () {
          if (Navigator.canmove('up')) Navigator.move('up');
          else Lampa.Controller.toggle('head');
        },
        down: function () {
          if (Navigator.canmove('down')) Navigator.move('down');
        },
        back: self.back,
      });
      Lampa.Controller.toggle('content');
    };

    this.background = function () {
      Lampa.Background.immediately('');
    };
    this.pause = function () { };
    this.stop = function () { };
    this.render = function () {
      return html;
    };
    this.destroy = function () {
      Lampa.Listener.remove('jellyfin:row-updated', onRowUpdated);
      cardsById = {};
      scroll.destroy();
      html.remove();
    };
    this.back = function () {
      Lampa.Activity.backward();
    };
  }

  function openCategory(category) {
    var title = Lampa.Lang.translate('jellyfin_movies');
    if (category === 'Series') title = Lampa.Lang.translate('jellyfin_series');
    else if (category === 'Resume') title = Lampa.Lang.translate('jellyfin_resume');
    else if (category === 'Latest') title = Lampa.Lang.translate('jellyfin_latest');

    Lampa.Activity.push({
      url: '',
      title: title,
      component: PANEL_COMPONENT,
      category: category,
      page: 1,
    });
  }

  function openHub() {
    Lampa.Activity.push({
      url: '',
      title: Lampa.Lang.translate('jellyfin_title'),
      component: HUB_COMPONENT,
      page: 1,
    });
  }

  function listenFullCard() {
    Lampa.Listener.follow('full', function (e) {
      if (!storageToggle('FullButton', true)) return;
      if (e.type !== 'complite' || !e.object) return;

      var method = String(e.object.method || '');
      var id = String(e.object.id || '');
      if (!method || !id) return;

      function mountButton(row) {
        if (!row || !e.object.activity || typeof e.object.activity.render !== 'function') return;
        var $root = e.object.activity.render();
        if ($root.find('.button--jellyfin').length) return;

        var label = Lampa.Lang.translate('jellyfin_play_from_library');
        if (row.playedPct > 0 && row.playedPct < 100) {
          label += ' (' + Math.round(row.playedPct) + '%)';
        }

        var $btn = $(
          '<div class="full-start__button selector button--jellyfin" data-subtitle="Jellyfin">' +
          FULLSTART_BTN_ICON +
          '<span></span></div>'
        );
        $btn.find('span').text(label);
        $btn.on('hover:enter', function () {
          playMediaRow(row);
        });

        var $anchor = $root.find('.view--torrent').first();
        if ($anchor.length) $anchor.after($btn);
        else $root.find('.full-start-new__buttons').append($btn);
      }

      var cached = findLibraryRow(method, id);
      if (cached) {
        mountButton(cached);
        return;
      }

      refreshLibraryIndex(false).then(function () {
        mountButton(findLibraryRow(method, id));
      });
    });
  }

  function injectHeadIcon() {
    var $icon = Lampa.Head.addIcon(HEAD_ICON_SVG);
    $icon.addClass('jellyfin-head-icon selector');
    $icon.on('hover:enter', openHub);
  }

  function registerMenuButtons() {
    Lampa.Menu.addButton(MANIFEST.icon, Lampa.Lang.translate('jellyfin_title'), openHub);
  }

  function registerStyles() {
    Lampa.Template.add(
      'jellyfin_folder',
      '<div class="bookmarks-folder card selector layer--visible layer--render jellyfin-folder">' +
      '<div class="bookmarks-folder__inner card__view">' +
      '<div class="bookmarks-folder__layer">' +
      '<div class="bookmarks-folder__head">' +
      '<div class="bookmarks-folder__title"></div>' +
      '<div class="bookmarks-folder__num"></div>' +
      '</div>' +
      '<div class="bookmarks-folder__body"></div>' +
      '</div></div></div>'
    );

    Lampa.Template.add(
      'jellyfin_style',
      '<style>' +
      '.jellyfin-head{padding:.8em 1em .4em}' +
      '.jellyfin-head__title{font-size:1.05em;font-weight:700;opacity:.92}' +
      '.jellyfin-hub .items-line--jf-stats{min-height:0!important;padding-bottom:1em}' +
      '.jellyfin-hub .items-line--jf-stats .items-line__body{margin-top:0}' +
      '.jellyfin-hub .items-line--jf-stats .register__name{max-width:none}' +
      '.jellyfin-hub .items-line--jf-no-title .items-line__head{display:none}' +
      '.jellyfin-hub-empty{margin-top:2em}' +
      '.jellyfin-hub .register--line{flex:0 0 auto;position:relative}' +
      '.jellyfin-hub .jellyfin-card--hub-line .card__view{margin-bottom:0}' +
      '.jellyfin-hub .jellyfin-card--hub-line .card__title{' +
      'position:absolute;left:.55em;right:.55em;bottom:1.65em;z-index:3;margin:0;color:#fff;' +
      'font-size:1.05em;max-height:2.4em;-webkit-line-clamp:2;line-clamp:2;' +
      'text-shadow:0 1px 3px rgba(0,0,0,.85)}' +
      '.jellyfin-hub .jellyfin-card--hub-line .card__age{' +
      'position:absolute;left:.55em;bottom:.45em;z-index:3;margin:0;opacity:.9;font-size:.85em}' +
      '.jellyfin-hub .bookmarks-folder{width:11.5em;flex:0 0 auto}' +
      '.jellyfin-hub .bookmarks-folder__layer{background-color:#3e3e3e;border-radius:1em}' +
      '.jellyfin-hub .bookmarks-folder__body{position:relative;overflow:hidden;border-radius:0 0 1em 1em}' +
      '.jellyfin-hub .bookmarks-folder__body .card__img{position:absolute;left:0;width:100%;object-fit:cover;border-radius:.5em}' +
      '.jellyfin-hub .bookmarks-folder__body .i-0{height:100%;top:0;z-index:1}' +
      '.jellyfin-hub .bookmarks-folder__body .i-1{height:80%;top:20%;z-index:2}' +
      '.jellyfin-hub .bookmarks-folder__body .i-2{height:60%;top:40%;z-index:3}' +
      '.jellyfin-hub .bookmarks-folder__head{padding:.85em 1em;line-height:1.25}' +
      '.jellyfin-hub .bookmarks-folder__title{font-weight:300;font-size:1.1em}' +
      '.jellyfin-hub .bookmarks-folder__num{font-weight:700;font-size:1.15em;margin-top:.15em}' +
      '.jellyfin-hub .card.jellyfin-card .card__title{line-height:1.25;max-height:2.5em;overflow:hidden}' +
      '.jellyfin-card.card,.jellyfin-module .jellyfin-card.card{position:relative}' +
      '.jellyfin-card .card__view{overflow:hidden;position:relative;border-radius:.5em}' +
      '.jellyfin-card .card__img{border-radius:inherit}' +
      '.jellyfin-hub .bookmarks-folder.card{position:relative}' +
      '.jellyfin-hub .bookmarks-folder .card__view{overflow:hidden;position:relative;border-radius:1em}' +
      '.jellyfin-hub .card.jellyfin-card.focus::after,' +
      '.jellyfin-module .card.jellyfin-card.focus::after,' +
      '.jellyfin-hub .items-cards .card.jellyfin-card.selector.focus::after,' +
      '.jellyfin-module .items-cards .card.jellyfin-card.selector.focus::after,' +
      '.jellyfin-hub .card.jellyfin-card.focus .card__view::after,' +
      '.jellyfin-module .card.jellyfin-card.focus .card__view::after,' +
      '.jellyfin-hub .bookmarks-folder.focus::after,' +
      '.jellyfin-hub .bookmarks-folder.focus .card__view::after{' +
      'display:none!important;content:none!important}' +
      '.jellyfin-hub .card.jellyfin-card.focus .card__view,' +
      '.jellyfin-module .card.jellyfin-card.focus .card__view{' +
      'box-shadow:0 0 0 .22em #fff;border-radius:.5em}' +
      '.jellyfin-hub .register.selector.focus::after{' +
      'content:"";position:absolute;display:block;pointer-events:none;z-index:-1;' +
      'top:-.5em;left:-.5em;right:-.5em;bottom:-.5em;border:.3em solid #fff;border-radius:1.4em;box-shadow:none}' +
      '.jellyfin-hub .bookmarks-folder.focus .card__view{' +
      'box-shadow:0 0 0 .22em #fff;border-radius:1em}' +
      '.jellyfin-card-shade{pointer-events:none;position:absolute;left:0;right:0;bottom:0;height:42%;z-index:2;background:linear-gradient(180deg,rgba(0,0,0,0) 0%,rgba(0,0,0,.55) 100%)}' +
      '.jellyfin-card-chrome{pointer-events:none;position:absolute;left:0;top:0;right:0;bottom:0;z-index:4}' +
      '.jellyfin-badge{position:absolute;padding:.28em .55em;font-size:.62em;border-radius:.7em;font-weight:800;line-height:1.1;backdrop-filter:blur(8px);box-shadow:0 3px 8px rgba(0,0,0,.25)}' +
      '.jellyfin-badge-episode{left:.4em;top:.4em;background:rgba(0,0,0,.72);color:#fff}' +
      '.jellyfin-badge-quality{left:.4em;top:.4em;background:rgba(0,122,255,.92);color:#fff}' +
      '.jellyfin-badge-quality--episode{top:2.1em}' +
      '.jellyfin-badge-watched{right:.4em;top:.4em;background:rgba(52,199,89,.92);color:#fff}' +
      '.jellyfin-card-progress{position:absolute;left:0;right:0;bottom:0;height:.28em;background:rgba(255,255,255,.18);z-index:5}' +
      '.jellyfin-card-progress>span{display:block;height:100%;background:rgba(0,122,255,.95)}' +
      '.jellyfin-state{padding:2em 1.2em;text-align:center;max-width:36em;margin:0 auto}' +
      '.jellyfin-state__title{font-size:1.1em;font-weight:700;margin-bottom:.6em}' +
      '.jellyfin-state__descr{opacity:.75;margin-bottom:1.2em;line-height:1.45}' +
      '.button--jellyfin{display:inline-flex;align-items:center;gap:.35em}' +
      '.button--jellyfin .jellyfin-fullstart__icon{width:1.75em;height:1.75em;flex-shrink:0}' +
      '.torrent-customqbit-icon.jellyfin-head-icon,.jellyfin-head-icon{display:flex;align-items:center;justify-content:center}' +
      '</style>'
    );
  }

  function addSettings() {
    Lampa.SettingsApi.addComponent({
      component: SETTINGS_COMPONENT,
      name: Lampa.Lang.translate('jellyfin_settings_name'),
      icon: MANIFEST.icon,
    });

    Lampa.SettingsApi.addParam({
      component: SETTINGS_COMPONENT,
      param: { name: STORAGE_PREFIX + 'Hint', type: 'static' },
      field: { name: Lampa.Lang.translate('jellyfin_settings_hint') },
    });

    Lampa.SettingsApi.addParam({
      component: SETTINGS_COMPONENT,
      param: {
        name: STORAGE_PREFIX + 'Url',
        type: 'input',
        default: DEFAULT_URL,
        values: '',
      },
      field: { name: Lampa.Lang.translate('jellyfin_url') },
      onChange: function () {
        invalidateUserCache();
        prefetchAutoUser();
        Lampa.Settings.update();
        syncUserInfoField();
      },
    });

    Lampa.SettingsApi.addParam({
      component: SETTINGS_COMPONENT,
      param: {
        name: STORAGE_PREFIX + 'Key',
        type: 'input',
        default: DEFAULT_API_KEY,
        values: '',
      },
      field: { name: Lampa.Lang.translate('jellyfin_key') },
      onChange: function () {
        invalidateUserCache();
        prefetchAutoUser();
        Lampa.Settings.update();
        syncUserInfoField();
      },
    });

    Lampa.SettingsApi.addParam({
      component: SETTINGS_COMPONENT,
      param: { name: STORAGE_PREFIX + 'UserInfo', type: 'static' },
      field: {
        name: Lampa.Lang.translate('jellyfin_user'),
        description: currentUserLabel(),
      },
    });

    Lampa.SettingsApi.addParam({
      component: SETTINGS_COMPONENT,
      param: { type: 'button', name: STORAGE_PREFIX + 'PickUser' },
      field: { name: Lampa.Lang.translate('jellyfin_user_pick') },
      onChange: function () {
        pickUserFromList(function () {
          Lampa.Settings.update();
        });
      },
    });

    Lampa.SettingsApi.addParam({
      component: SETTINGS_COMPONENT,
      param: { type: 'button', name: STORAGE_PREFIX + 'Test' },
      field: { name: Lampa.Lang.translate('jellyfin_test') },
      onChange: function () {
        resolveUserId()
          .then(function () {
            return refreshLibraryIndex(true);
          })
          .then(function () {
            Lampa.Bell.push({ text: Lampa.Lang.translate('jellyfin_auth_ok') });
          })
          .catch(function () {
            Lampa.Bell.push({ text: Lampa.Lang.translate('jellyfin_auth_fail') });
          });
      },
    });

    Lampa.SettingsApi.addParam({
      component: SETTINGS_COMPONENT,
      param: { type: 'trigger', default: true, name: STORAGE_PREFIX + 'Dedupe' },
      field: { name: Lampa.Lang.translate('jellyfin_set_dedupe') },
      onChange: function () {
        Lampa.Settings.update();
      },
    });

    Lampa.SettingsApi.addParam({
      component: SETTINGS_COMPONENT,
      param: { type: 'trigger', default: true, name: STORAGE_PREFIX + 'HideFolders' },
      field: { name: Lampa.Lang.translate('jellyfin_set_hide_folders') },
      onChange: function () {
        Lampa.Settings.update();
      },
    });

    Lampa.SettingsApi.addParam({
      component: SETTINGS_COMPONENT,
      param: { type: 'trigger', default: true, name: STORAGE_PREFIX + 'TmdbPosters' },
      field: { name: Lampa.Lang.translate('jellyfin_set_tmdb_posters') },
      onChange: function () {
        tmdbMetaCache = {};
        Lampa.Settings.update();
      },
    });

    Lampa.SettingsApi.addParam({
      component: SETTINGS_COMPONENT,
      param: { type: 'trigger', default: true, name: STORAGE_PREFIX + 'FullButton' },
      field: { name: Lampa.Lang.translate('jellyfin_set_full_button') },
      onChange: function () {
        Lampa.Settings.update();
      },
    });

    Lampa.SettingsApi.addParam({
      component: SETTINGS_COMPONENT,
      param: { type: 'trigger', default: false, name: STORAGE_PREFIX + 'TapPlay' },
      field: { name: Lampa.Lang.translate('jellyfin_set_tap_play') },
      onChange: function () {
        Lampa.Settings.update();
      },
    });
  }

  function init() {
    addLang();
    registerStyles();
    $('body').append(Lampa.Template.get('jellyfin_style', {}, true));

    Lampa.Component.add(PANEL_COMPONENT, PanelComponent);
    Lampa.Component.add(HUB_COMPONENT, HubComponent);
    Lampa.Manifest.plugins = MANIFEST;
    addSettings();
    registerMenuButtons();
    injectHeadIcon();
    listenFullCard();

    prefetchAutoUser();
    refreshLibraryIndex(false).catch(function () { });
  }

  if (window.appready) init();
  else
    Lampa.Listener.follow('app', function (e) {
      if (e.type === 'ready') init();
    });
})();
