(function () {
  'use strict';

  if (window.__dso_torrserver_settings_loaded) return;
  window.__dso_torrserver_settings_loaded = true;

  var VERSION = '1.1.1';
  var COMPONENT = 'dso_torrserver_settings';
  var STORAGE_PREFIX = 'dso_ts_bt_';
  var LOG = 'DSO TS Settings';

  var MANIFEST = {
    type: 'other',
    version: VERSION,
    author: '@pavelpikta',
    name: 'TorrServer Settings',
    description: 'TorrServer BTSets in Lampa Settings (POST /settings)',
    component: COMPONENT,
    icon:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<circle cx="12" cy="12" r="3"/>' +
      '<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>' +
      '</svg>',
  };

  var SECTIONS = [
    { id: 'cache', titleKey: 'dso_ts_settings_sec_cache' },
    { id: 'disk', titleKey: 'dso_ts_settings_sec_disk' },
    { id: 'torrent', titleKey: 'dso_ts_settings_sec_torrent' },
    { id: 'dlna', titleKey: 'dso_ts_settings_sec_dlna' },
    { id: 'search', titleKey: 'dso_ts_settings_sec_search' },
    { id: 'tmdb', titleKey: 'dso_ts_settings_sec_tmdb' },
    { id: 'network', titleKey: 'dso_ts_settings_sec_network' },
    { id: 'lpd', titleKey: 'dso_ts_settings_sec_lpd' },
    { id: 'https', titleKey: 'dso_ts_settings_sec_https' },
    { id: 'other', titleKey: 'dso_ts_settings_sec_other' },
  ];

  var RETRACKERS_VALUES = {
    '0': '#{dso_ts_settings_retrackers_0}',
    '1': '#{dso_ts_settings_retrackers_1}',
    '2': '#{dso_ts_settings_retrackers_2}',
    '3': '#{dso_ts_settings_retrackers_3}',
  };

  var FIELD_META = {
    CacheSize: { section: 'cache', titleKey: 'dso_ts_settings_CacheSize', type: 'cache_mb' },
    ReaderReadAHead: { section: 'cache', titleKey: 'dso_ts_settings_ReaderReadAHead' },
    PreloadCache: { section: 'cache', titleKey: 'dso_ts_settings_PreloadCache' },
    UseDisk: { section: 'disk', titleKey: 'dso_ts_settings_UseDisk' },
    TorrentsSavePath: { section: 'disk', titleKey: 'dso_ts_settings_TorrentsSavePath' },
    RemoveCacheOnDrop: { section: 'disk', titleKey: 'dso_ts_settings_RemoveCacheOnDrop' },
    ForceEncrypt: { section: 'torrent', titleKey: 'dso_ts_settings_ForceEncrypt' },
    RetrackersMode: {
      section: 'torrent',
      titleKey: 'dso_ts_settings_RetrackersMode',
      type: 'select',
      values: RETRACKERS_VALUES,
    },
    TrackersListURL: { section: 'torrent', titleKey: 'dso_ts_settings_TrackersListURL' },
    DefaultTrackers: { section: 'torrent', titleKey: 'dso_ts_settings_DefaultTrackers' },
    TorrentDisconnectTimeout: { section: 'torrent', titleKey: 'dso_ts_settings_TorrentDisconnectTimeout' },
    EnableDebug: { section: 'torrent', titleKey: 'dso_ts_settings_EnableDebug' },
    EnableDLNA: { section: 'dlna', titleKey: 'dso_ts_settings_EnableDLNA' },
    EnableBonjour: { section: 'dlna', titleKey: 'dso_ts_settings_EnableBonjour' },
    FriendlyName: { section: 'dlna', titleKey: 'dso_ts_settings_FriendlyName' },
    EnableRutorSearch: { section: 'search', titleKey: 'dso_ts_settings_EnableRutorSearch' },
    EnableTorznabSearch: { section: 'search', titleKey: 'dso_ts_settings_EnableTorznabSearch' },
    TorznabUrls: { section: 'search', titleKey: 'dso_ts_settings_TorznabUrls', type: 'torznab' },
    'TMDBSettings.APIKey': { section: 'tmdb', titleKey: 'dso_ts_settings_TMDB_APIKey' },
    'TMDBSettings.APIURL': { section: 'tmdb', titleKey: 'dso_ts_settings_TMDB_APIURL' },
    'TMDBSettings.ImageURL': { section: 'tmdb', titleKey: 'dso_ts_settings_TMDB_ImageURL' },
    'TMDBSettings.ImageURLRu': { section: 'tmdb', titleKey: 'dso_ts_settings_TMDB_ImageURLRu' },
    EnableIPv6: { section: 'network', titleKey: 'dso_ts_settings_EnableIPv6' },
    DisableTCP: { section: 'network', titleKey: 'dso_ts_settings_DisableTCP' },
    DisableUTP: { section: 'network', titleKey: 'dso_ts_settings_DisableUTP' },
    DisableUPNP: { section: 'network', titleKey: 'dso_ts_settings_DisableUPNP' },
    DisableDHT: { section: 'network', titleKey: 'dso_ts_settings_DisableDHT' },
    DisablePEX: { section: 'network', titleKey: 'dso_ts_settings_DisablePEX' },
    DisableUpload: { section: 'network', titleKey: 'dso_ts_settings_DisableUpload' },
    DownloadRateLimit: { section: 'network', titleKey: 'dso_ts_settings_DownloadRateLimit' },
    UploadRateLimit: { section: 'network', titleKey: 'dso_ts_settings_UploadRateLimit' },
    ConnectionsLimit: { section: 'network', titleKey: 'dso_ts_settings_ConnectionsLimit' },
    PeersListenPort: { section: 'network', titleKey: 'dso_ts_settings_PeersListenPort' },
    EnableLPD: { section: 'lpd', titleKey: 'dso_ts_settings_EnableLPD' },
    LPDIPv6: { section: 'lpd', titleKey: 'dso_ts_settings_LPDIPv6' },
    SslPort: { section: 'https', titleKey: 'dso_ts_settings_SslPort' },
    SslCert: { section: 'https', titleKey: 'dso_ts_settings_SslCert' },
    SslKey: { section: 'https', titleKey: 'dso_ts_settings_SslKey' },
    ResponsiveMode: { section: 'other', titleKey: 'dso_ts_settings_ResponsiveMode' },
    ShowFSActiveTorr: { section: 'other', titleKey: 'dso_ts_settings_ShowFSActiveTorr' },
    StoreSettingsInJson: { section: 'other', titleKey: 'dso_ts_settings_StoreSettingsInJson' },
    StoreViewedInJson: { section: 'other', titleKey: 'dso_ts_settings_StoreViewedInJson' },
    TrackTimecode: { section: 'other', titleKey: 'dso_ts_settings_TrackTimecode' },
  };

  var network = null;
  var draft = null;
  var fields = [];
  var dirty = false;
  var loading = false;
  var skipCreateHook = false;
  var statusText = '';
  var leavingDirty = false;

  function getNetwork() {
    if (!network) network = new Lampa.Reguest();
    return network;
  }

  function t(key) {
    return Lampa.Lang.translate(key);
  }

  function notify(text) {
    if (Lampa.Bell && typeof Lampa.Bell.push === 'function') {
      Lampa.Bell.push({ text: text });
      return;
    }
    if (Lampa.Noty && typeof Lampa.Noty.show === 'function') Lampa.Noty.show(text);
  }

  function isPlainObject(val) {
    return !!val && typeof val === 'object' && !Array.isArray(val);
  }

  function humanizeKey(key) {
    var leaf = String(key || '').split('.').pop();
    return String(leaf)
      .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
      .replace(/_/g, ' ')
      .trim();
  }

  function looksLikeTorznab(list) {
    if (!Array.isArray(list) || !list.length) return false;
    var first = list[0];
    return isPlainObject(first) && ('Host' in first || 'Key' in first || 'Name' in first);
  }

  function inferType(key, value) {
    var meta = FIELD_META[key];
    if (meta && meta.type) return meta.type;
    if (typeof value === 'boolean') return 'bool';
    if (typeof value === 'number') return key === 'CacheSize' ? 'cache_mb' : 'int';
    if (typeof value === 'string') return 'string';
    if (Array.isArray(value)) return looksLikeTorznab(value) ? 'torznab' : 'json';
    if (isPlainObject(value)) return 'json';
    return 'string';
  }

  function makeField(key, value) {
    var meta = FIELD_META[key] || {};
    var field = {
      key: key,
      type: inferType(key, value),
      section: meta.section || 'other',
      storage: STORAGE_PREFIX + key.replace(/\./g, '__'),
    };
    if (meta.titleKey) field.titleKey = meta.titleKey;
    else field.title = humanizeKey(key);
    if (meta.values) field.values = meta.values;
    return field;
  }

  function buildFieldsFromSets(sets) {
    var out = [];
    if (!isPlainObject(sets)) return out;
    Object.keys(sets).forEach(function (key) {
      var value = sets[key];
      if (isPlainObject(value)) {
        Object.keys(value).forEach(function (child) {
          out.push(makeField(key + '.' + child, value[child]));
        });
        return;
      }
      out.push(makeField(key, value));
    });
    return out;
  }

  function fieldTitle(field) {
    if (field.titleKey) return t(field.titleKey);
    return field.title || humanizeKey(field.key);
  }

  function getPath(obj, path) {
    var parts = String(path).split('.');
    var cur = obj;
    for (var i = 0; i < parts.length; i++) {
      if (cur == null) return undefined;
      cur = cur[parts[i]];
    }
    return cur;
  }

  function setPath(obj, path, value) {
    var parts = String(path).split('.');
    var cur = obj;
    for (var i = 0; i < parts.length - 1; i++) {
      if (!cur[parts[i]] || typeof cur[parts[i]] !== 'object' || Array.isArray(cur[parts[i]])) {
        cur[parts[i]] = {};
      }
      cur = cur[parts[i]];
    }
    cur[parts[parts.length - 1]] = value;
  }

  function cloneSets(sets) {
    try {
      return JSON.parse(JSON.stringify(sets || {}));
    } catch (e) {
      return {};
    }
  }

  function normalizeDraft(next) {
    if (!next || typeof next !== 'object') return next;
    if (Object.prototype.hasOwnProperty.call(next, 'TorznabUrls') && !Array.isArray(next.TorznabUrls)) {
      next.TorznabUrls = [];
    }
    return next;
  }

  function tsBase() {
    if (Lampa.Torserver && typeof Lampa.Torserver.url === 'function') {
      var u = Lampa.Torserver.url();
      if (u) return String(u).replace(/\/+$/, '');
    }
    var link = Lampa.Storage.field('torrserver_use_link');
    var raw =
      link === 'two'
        ? Lampa.Storage.get('torrserver_url_two') || Lampa.Storage.get('torrserver_url')
        : Lampa.Storage.get('torrserver_url') || Lampa.Storage.get('torrserver_url_two');
    if (!raw) return '';
    return String(raw).replace(/\/+$/, '');
  }

  function addLang() {
    Lampa.Lang.add({
      dso_ts_settings_title: { en: 'TorrServer Settings', ru: 'Настройки TorrServer' },
      dso_ts_settings_reload: { en: 'Reload from server', ru: 'Обновить с сервера' },
      dso_ts_settings_save: { en: 'Save to server', ru: 'Сохранить на сервер' },
      dso_ts_settings_reset: { en: 'Reset to defaults', ru: 'Сбросить по умолчанию' },
      dso_ts_settings_saved: { en: 'Settings saved', ru: 'Настройки сохранены' },
      dso_ts_settings_reset_ok: { en: 'Defaults applied', ru: 'Значения по умолчанию применены' },
      dso_ts_settings_no_url: {
        en: 'TorrServer URL is not configured',
        ru: 'URL TorrServer не настроен',
      },
      dso_ts_settings_load_error: {
        en: 'Failed to load settings',
        ru: 'Не удалось загрузить настройки',
      },
      dso_ts_settings_save_error: {
        en: 'Failed to save settings',
        ru: 'Не удалось сохранить настройки',
      },
      dso_ts_settings_status_idle: {
        en: 'Open this page to load settings from TorrServer',
        ru: 'Откройте раздел, чтобы загрузить настройки TorrServer',
      },
      dso_ts_settings_status_loading: { en: 'Loading…', ru: 'Загрузка…' },
      dso_ts_settings_status_ready: { en: 'Loaded from server', ru: 'Загружено с сервера' },
      dso_ts_settings_status_dirty: {
        en: 'Unsaved local changes',
        ru: 'Есть несохранённые изменения',
      },
      dso_ts_settings_dirty_title: { en: 'Unsaved changes', ru: 'Несохранённые изменения' },
      dso_ts_settings_dirty_discard: { en: 'Discard and leave', ru: 'Выйти без сохранения' },
      dso_ts_settings_dirty_stay: { en: 'Stay', ru: 'Остаться' },
      dso_ts_settings_confirm_reset: {
        en: 'Reset all TorrServer settings to defaults?',
        ru: 'Сбросить все настройки TorrServer?',
      },
      dso_ts_settings_yes: { en: 'Yes', ru: 'Да' },
      dso_ts_settings_no: { en: 'No', ru: 'Нет' },
      dso_ts_settings_sec_cache: { en: 'Cache', ru: 'Кэш' },
      dso_ts_settings_sec_disk: { en: 'Disk', ru: 'Диск' },
      dso_ts_settings_sec_torrent: { en: 'Torrent', ru: 'Торрент' },
      dso_ts_settings_sec_dlna: { en: 'DLNA / Bonjour', ru: 'DLNA / Bonjour' },
      dso_ts_settings_sec_search: { en: 'Search', ru: 'Поиск' },
      dso_ts_settings_sec_tmdb: { en: 'TMDB', ru: 'TMDB' },
      dso_ts_settings_sec_network: { en: 'Network', ru: 'Сеть' },
      dso_ts_settings_sec_lpd: { en: 'LPD', ru: 'LPD' },
      dso_ts_settings_sec_https: { en: 'HTTPS', ru: 'HTTPS' },
      dso_ts_settings_sec_other: { en: 'Other', ru: 'Прочее' },
      dso_ts_settings_retrackers_0: { en: 'Do not add', ru: 'Не добавлять' },
      dso_ts_settings_retrackers_1: { en: 'Add retrackers', ru: 'Добавлять ретрекеры' },
      dso_ts_settings_retrackers_2: { en: 'Remove retrackers', ru: 'Удалять ретрекеры' },
      dso_ts_settings_retrackers_3: { en: 'Replace retrackers', ru: 'Заменять ретрекеры' },
      dso_ts_settings_CacheSize: { en: 'Cache size (MB)', ru: 'Размер кэша (МБ)' },
      dso_ts_settings_ReaderReadAHead: { en: 'Reader read-ahead %', ru: 'Read-ahead чтения %' },
      dso_ts_settings_PreloadCache: { en: 'Preload cache %', ru: 'Предзагрузка кэша %' },
      dso_ts_settings_UseDisk: { en: 'Use disk cache', ru: 'Кэш на диске' },
      dso_ts_settings_TorrentsSavePath: { en: 'Torrents save path', ru: 'Путь сохранения торрентов' },
      dso_ts_settings_RemoveCacheOnDrop: { en: 'Remove cache on drop', ru: 'Удалять кэш при drop' },
      dso_ts_settings_ForceEncrypt: { en: 'Force encrypt', ru: 'Принудительное шифрование' },
      dso_ts_settings_RetrackersMode: { en: 'Retrackers mode', ru: 'Режим ретрекеров' },
      dso_ts_settings_TrackersListURL: { en: 'Trackers list URL', ru: 'URL списка трекеров' },
      dso_ts_settings_DefaultTrackers: { en: 'Default trackers', ru: 'Трекеры по умолчанию' },
      dso_ts_settings_TorrentDisconnectTimeout: {
        en: 'Disconnect timeout (sec)',
        ru: 'Таймаут отключения (сек)',
      },
      dso_ts_settings_EnableDebug: { en: 'Debug logs', ru: 'Отладочные логи' },
      dso_ts_settings_EnableDLNA: { en: 'Enable DLNA', ru: 'Включить DLNA' },
      dso_ts_settings_EnableBonjour: { en: 'Enable Bonjour', ru: 'Включить Bonjour' },
      dso_ts_settings_FriendlyName: { en: 'Friendly name', ru: 'Отображаемое имя' },
      dso_ts_settings_EnableRutorSearch: { en: 'Rutor search', ru: 'Поиск Rutor' },
      dso_ts_settings_EnableTorznabSearch: { en: 'Torznab search', ru: 'Поиск Torznab' },
      dso_ts_settings_TorznabUrls: { en: 'Torznab indexes', ru: 'Индексы Torznab' },
      dso_ts_settings_torznab_count: { en: '{0} index(es)', ru: 'Индексов: {0}' },
      dso_ts_settings_torznab_add: { en: 'Add index', ru: 'Добавить индекс' },
      dso_ts_settings_torznab_edit: { en: 'Edit', ru: 'Изменить' },
      dso_ts_settings_torznab_remove: { en: 'Remove', ru: 'Удалить' },
      dso_ts_settings_torznab_host: { en: 'Host', ru: 'Хост' },
      dso_ts_settings_torznab_key: { en: 'API key', ru: 'API-ключ' },
      dso_ts_settings_torznab_name: { en: 'Name', ru: 'Имя' },
      dso_ts_settings_torznab_empty: { en: '(empty)', ru: '(пусто)' },
      dso_ts_settings_json_invalid: { en: 'Invalid JSON', ru: 'Некорректный JSON' },
      dso_ts_settings_edit_json: { en: 'Edit JSON', ru: 'Редактировать JSON' },
      dso_ts_settings_TMDB_APIKey: { en: 'TMDB API key', ru: 'TMDB API-ключ' },
      dso_ts_settings_TMDB_APIURL: { en: 'TMDB API URL', ru: 'TMDB API URL' },
      dso_ts_settings_TMDB_ImageURL: { en: 'TMDB image URL', ru: 'TMDB image URL' },
      dso_ts_settings_TMDB_ImageURLRu: { en: 'TMDB image URL (RU)', ru: 'TMDB image URL (RU)' },
      dso_ts_settings_EnableIPv6: { en: 'Enable IPv6', ru: 'Включить IPv6' },
      dso_ts_settings_DisableTCP: { en: 'Disable TCP', ru: 'Отключить TCP' },
      dso_ts_settings_DisableUTP: { en: 'Disable uTP', ru: 'Отключить uTP' },
      dso_ts_settings_DisableUPNP: { en: 'Disable UPnP', ru: 'Отключить UPnP' },
      dso_ts_settings_DisableDHT: { en: 'Disable DHT', ru: 'Отключить DHT' },
      dso_ts_settings_DisablePEX: { en: 'Disable PEX', ru: 'Отключить PEX' },
      dso_ts_settings_DisableUpload: { en: 'Disable upload', ru: 'Отключить раздачу' },
      dso_ts_settings_DownloadRateLimit: { en: 'Download limit (KB/s)', ru: 'Лимит загрузки (КБ/с)' },
      dso_ts_settings_UploadRateLimit: { en: 'Upload limit (KB/s)', ru: 'Лимит отдачи (КБ/с)' },
      dso_ts_settings_ConnectionsLimit: { en: 'Connections limit', ru: 'Лимит соединений' },
      dso_ts_settings_PeersListenPort: { en: 'Peers listen port', ru: 'Порт пиров' },
      dso_ts_settings_EnableLPD: { en: 'Enable LPD', ru: 'Включить LPD' },
      dso_ts_settings_LPDIPv6: { en: 'LPD IPv6', ru: 'LPD IPv6' },
      dso_ts_settings_SslPort: { en: 'SSL port', ru: 'SSL-порт' },
      dso_ts_settings_SslCert: { en: 'SSL certificate path', ru: 'Путь к SSL-сертификату' },
      dso_ts_settings_SslKey: { en: 'SSL key path', ru: 'Путь к SSL-ключу' },
      dso_ts_settings_ResponsiveMode: { en: 'Responsive reader', ru: 'Responsive reader' },
      dso_ts_settings_ShowFSActiveTorr: { en: 'Show active torrents in FS', ru: 'Активные торренты в FS' },
      dso_ts_settings_StoreSettingsInJson: {
        en: 'Store settings in JSON',
        ru: 'Хранить настройки в JSON',
      },
      dso_ts_settings_StoreViewedInJson: { en: 'Store viewed in JSON', ru: 'Хранить viewed в JSON' },
      dso_ts_settings_TrackTimecode: { en: 'Track playback timecode', ru: 'Сохранять таймкод' },
    });
  }

  function markDirty() {
    dirty = true;
    statusText = t('dso_ts_settings_status_dirty');
  }

  function clearDirty() {
    dirty = false;
  }

  function syncStorageFromDraft() {
    if (!draft) return;
    fields.forEach(function (field) {
      var val = getPath(draft, field.key);
      if (field.type === 'bool') {
        Lampa.Storage.set(field.storage, !!val);
      } else if (field.type === 'cache_mb') {
        var mb = Math.round((parseInt(val, 10) || 0) / (1024 * 1024));
        Lampa.Storage.set(field.storage, String(mb));
      } else if (field.type === 'select' || field.type === 'int') {
        Lampa.Storage.set(field.storage, String(val == null ? 0 : val));
      } else if (field.type === 'torznab' || field.type === 'json') {
        /* button rows */
      } else {
        Lampa.Storage.set(field.storage, val == null ? '' : String(val));
      }
    });
  }

  function applyStorageToDraft(field, raw) {
    if (!draft) return;
    if (field.type === 'bool') {
      setPath(draft, field.key, raw === true || raw === 'true');
      return;
    }
    if (field.type === 'cache_mb') {
      var n = parseInt(String(raw).replace(/[^\d-]/g, ''), 10);
      if (!isFinite(n) || n < 0) n = 64;
      setPath(draft, field.key, n * 1024 * 1024);
      return;
    }
    if (field.type === 'int' || field.type === 'select') {
      var num = parseInt(String(raw), 10);
      setPath(draft, field.key, isFinite(num) ? num : 0);
      return;
    }
    setPath(draft, field.key, raw == null ? '' : String(raw));
  }

  function onFieldChange(field) {
    return function (value) {
      if (!draft) return;
      if (typeof value === 'undefined') {
        value = Lampa.Storage.get(field.storage, '');
      }
      applyStorageToDraft(field, value);
      markDirty();
      refreshStatusRow();
    };
  }

  function torznabCountText(field) {
    var key = field && field.key ? field.key : 'TorznabUrls';
    var list = draft ? getPath(draft, key) : null;
    var n = Array.isArray(list) ? list.length : 0;
    return t('dso_ts_settings_torznab_count').replace('{0}', String(n));
  }

  function restoreSettingsController() {
    setTimeout(function () {
      try {
        Lampa.Controller.toggle('settings_component');
      } catch (e) {}
    }, 10);
  }

  function editText(title, value, callback) {
    if (Lampa.Input && typeof Lampa.Input.edit === 'function') {
      Lampa.Input.edit(
        {
          title: title,
          value: value == null ? '' : String(value),
          free: true,
          nosave: true,
        },
        function (next) {
          callback(next == null ? '' : String(next));
        }
      );
      return;
    }
    var prompted = window.prompt(title, value == null ? '' : String(value));
    if (prompted !== null) callback(String(prompted));
    restoreSettingsController();
  }

  function openTorznabEditor(field) {
    if (!draft) return;
    var list = getPath(draft, field.key);
    if (!Array.isArray(list)) {
      setPath(draft, field.key, []);
      list = getPath(draft, field.key);
    }

    var items = [];
    list.forEach(function (entry, idx) {
      items.push({
        title: (entry && (entry.Name || entry.Host)) || t('dso_ts_settings_torznab_empty'),
        subtitle: (entry && entry.Host) || '',
        value: 'edit:' + idx,
      });
    });
    items.push({ title: t('dso_ts_settings_torznab_add'), value: 'add' });

    Lampa.Select.show({
      title: fieldTitle(field),
      items: items,
      onSelect: function (item) {
        if (item.value === 'add') {
          editTorznabEntry(field, -1);
          return;
        }
        var idx = parseInt(String(item.value).split(':')[1], 10);
        if (isFinite(idx)) openTorznabActions(field, idx);
        else restoreSettingsController();
      },
      onBack: restoreSettingsController,
    });
  }

  function openTorznabActions(field, idx) {
    var list = getPath(draft, field.key) || [];
    var entry = list[idx] || {};
    Lampa.Select.show({
      title: entry.Name || entry.Host || fieldTitle(field),
      items: [
        { title: t('dso_ts_settings_torznab_edit'), value: 'edit' },
        { title: t('dso_ts_settings_torznab_remove'), value: 'remove' },
      ],
      onSelect: function (item) {
        if (item.value === 'remove') {
          list.splice(idx, 1);
          markDirty();
          rebuildAndRefresh();
          return;
        }
        editTorznabEntry(field, idx);
      },
      onBack: restoreSettingsController,
    });
  }

  function editTorznabEntry(field, idx) {
    var list = getPath(draft, field.key) || [];
    var entry =
      idx >= 0 && list[idx]
        ? {
            Host: list[idx].Host || '',
            Key: list[idx].Key || '',
            Name: list[idx].Name || '',
          }
        : { Host: '', Key: '', Name: '' };

    editText(t('dso_ts_settings_torznab_host'), entry.Host, function (host) {
      entry.Host = host;
      editText(t('dso_ts_settings_torznab_key'), entry.Key, function (key) {
        entry.Key = key;
        editText(t('dso_ts_settings_torznab_name'), entry.Name, function (name) {
          entry.Name = name;
          if (idx >= 0) list[idx] = entry;
          else list.push(entry);
          markDirty();
          rebuildAndRefresh();
        });
      });
    });
  }

  function openJsonEditor(field) {
    var current = '';
    try {
      current = JSON.stringify(getPath(draft, field.key), null, 2);
    } catch (e) {
      current = '[]';
    }
    editText(fieldTitle(field), current, function (raw) {
      try {
        setPath(draft, field.key, JSON.parse(String(raw || '')));
        markDirty();
        rebuildAndRefresh();
      } catch (err) {
        notify(t('dso_ts_settings_json_invalid'));
        restoreSettingsController();
      }
    });
  }

  function currentStatus() {
    if (statusText) return statusText;
    if (loading) return t('dso_ts_settings_status_loading');
    if (dirty) return t('dso_ts_settings_status_dirty');
    if (draft) return t('dso_ts_settings_status_ready');
    return t('dso_ts_settings_status_idle');
  }

  function refreshStatusRow() {
    var $row = $('.settings [data-name="' + COMPONENT + '_status"]');
    if ($row.length) {
      $row.find('.settings-param__descr').text(currentStatus());
    }
  }

  function registerParams() {
    Lampa.SettingsApi.removeParams(COMPONENT);

    Lampa.SettingsApi.addParam({
      component: COMPONENT,
      param: { type: 'static', name: COMPONENT + '_status' },
      field: {
        name: t('dso_ts_settings_title'),
        description: currentStatus(),
      },
      onRender: function (item) {
        item.attr('data-name', COMPONENT + '_status').removeClass('selector');
      },
    });

    Lampa.SettingsApi.addParam({
      component: COMPONENT,
      param: { type: 'button', name: COMPONENT + '_reload' },
      field: { name: t('dso_ts_settings_reload') },
      onChange: function () {
        loadFromServer(true);
      },
    });

    Lampa.SettingsApi.addParam({
      component: COMPONENT,
      param: { type: 'button', name: COMPONENT + '_save' },
      field: { name: t('dso_ts_settings_save') },
      onChange: function () {
        saveToServer();
      },
    });

    Lampa.SettingsApi.addParam({
      component: COMPONENT,
      param: { type: 'button', name: COMPONENT + '_reset' },
      field: { name: t('dso_ts_settings_reset') },
      onChange: function () {
        confirmReset();
      },
    });

    if (!fields.length) return;

    SECTIONS.forEach(function (sec) {
      var sectionFields = fields.filter(function (f) {
        return f.section === sec.id;
      });
      if (!sectionFields.length) return;

      Lampa.SettingsApi.addParam({
        component: COMPONENT,
        param: { type: 'title', name: COMPONENT + '_sec_' + sec.id },
        field: { name: t(sec.titleKey) },
      });

      sectionFields.forEach(function (field) {
        if (field.type === 'bool') {
          Lampa.SettingsApi.addParam({
            component: COMPONENT,
            param: { type: 'trigger', name: field.storage, default: !!getPath(draft, field.key) },
            field: { name: fieldTitle(field) },
            onChange: onFieldChange(field),
          });
          return;
        }

        if (field.type === 'select') {
          Lampa.SettingsApi.addParam({
            component: COMPONENT,
            param: {
              type: 'select',
              name: field.storage,
              values: field.values || RETRACKERS_VALUES,
              default: String(getPath(draft, field.key) == null ? 1 : getPath(draft, field.key)),
            },
            field: { name: fieldTitle(field) },
            onChange: onFieldChange(field),
          });
          return;
        }

        if (field.type === 'torznab') {
          Lampa.SettingsApi.addParam({
            component: COMPONENT,
            param: { type: 'button', name: field.storage },
            field: {
              name: fieldTitle(field),
              description: torznabCountText(field),
            },
            onChange: function () {
              openTorznabEditor(field);
            },
            onRender: function (item) {
              item.find('.settings-param__descr').text(torznabCountText(field));
            },
          });
          return;
        }

        if (field.type === 'json') {
          Lampa.SettingsApi.addParam({
            component: COMPONENT,
            param: { type: 'button', name: field.storage },
            field: {
              name: fieldTitle(field),
              description: t('dso_ts_settings_edit_json'),
            },
            onChange: function () {
              openJsonEditor(field);
            },
          });
          return;
        }

        Lampa.SettingsApi.addParam({
          component: COMPONENT,
          param: {
            type: 'input',
            name: field.storage,
            values: '',
            default: '',
            placeholder: field.type === 'cache_mb' ? '64' : '',
          },
          field: { name: fieldTitle(field) },
          onChange: onFieldChange(field),
        });
      });
    });
  }

  function rebuildAndRefresh() {
    syncStorageFromDraft();
    registerParams();
    skipCreateHook = true;
    if (Lampa.Settings && typeof Lampa.Settings.update === 'function') {
      Lampa.Settings.update();
    }
  }

  function applyDraft(sets) {
    draft = normalizeDraft(cloneSets(sets));
    fields = buildFieldsFromSets(draft);
    clearDirty();
    statusText = t('dso_ts_settings_status_ready');
    syncStorageFromDraft();
  }

  function clearMirrorStorage() {
    var seen = {};
    fields.forEach(function (field) {
      if (!field || !field.storage || seen[field.storage]) return;
      seen[field.storage] = true;
      try {
        window.localStorage.removeItem(field.storage);
      } catch (e) {}
    });
    try {
      for (var i = window.localStorage.length - 1; i >= 0; i--) {
        var key = window.localStorage.key(i);
        if (key && key.indexOf(STORAGE_PREFIX) === 0) {
          window.localStorage.removeItem(key);
        }
      }
    } catch (e2) {}
  }

  function clearSession() {
    clearMirrorStorage();
    draft = null;
    fields = [];
    dirty = false;
    loading = false;
    statusText = t('dso_ts_settings_status_idle');
    if (network && typeof network.clear === 'function') network.clear();
  }

  function reopenComponent() {
    skipCreateHook = true;
    if (Lampa.Settings && typeof Lampa.Settings.create === 'function') {
      Lampa.Settings.create(COMPONENT);
    } else {
      restoreSettingsController();
    }
  }

  function askLeaveIfDirty() {
    if (leavingDirty) return;
    leavingDirty = true;
    Lampa.Select.show({
      title: t('dso_ts_settings_dirty_title'),
      items: [
        { title: t('dso_ts_settings_dirty_discard'), value: 'discard' },
        { title: t('dso_ts_settings_dirty_stay'), value: 'stay', selected: true },
      ],
      onSelect: function (item) {
        leavingDirty = false;
        if (item.value === 'discard') {
          clearSession();
          registerParams();
          Lampa.Controller.toggle('settings');
          return;
        }
        reopenComponent();
      },
      onBack: function () {
        leavingDirty = false;
        reopenComponent();
      },
    });
  }

  function leaveComponentClean() {
    clearSession();
    registerParams();
    Lampa.Controller.toggle('settings');
  }

  function loadFromServer(forceNotify) {
    var base = tsBase();
    if (!base) {
      notify(t('dso_ts_settings_no_url'));
      statusText = t('dso_ts_settings_no_url');
      draft = null;
      fields = [];
      clearMirrorStorage();
      registerParams();
      skipCreateHook = true;
      if (Lampa.Settings && Lampa.Settings.update) Lampa.Settings.update();
      return;
    }
    if (loading) return;
    loading = true;
    statusText = t('dso_ts_settings_status_loading');
    refreshStatusRow();

    var net = getNetwork();
    net.clear();
    net.timeout(10000);
    net.silent(
      base + '/settings',
      function (json) {
        loading = false;
        if (!isPlainObject(json) || !Object.keys(json).length) {
          notify(t('dso_ts_settings_load_error'));
          statusText = t('dso_ts_settings_load_error');
          draft = null;
          fields = [];
          clearMirrorStorage();
          rebuildAndRefresh();
          return;
        }
        applyDraft(json);
        rebuildAndRefresh();
        if (forceNotify) notify(t('dso_ts_settings_reload'));
      },
      function (a, c) {
        loading = false;
        var msg = net.errorDecode ? net.errorDecode(a, c) : t('dso_ts_settings_load_error');
        notify(msg || t('dso_ts_settings_load_error'));
        statusText = msg || t('dso_ts_settings_load_error');
        draft = null;
        fields = [];
        clearMirrorStorage();
        rebuildAndRefresh();
      },
      JSON.stringify({ action: 'get' })
    );
  }

  function saveToServer() {
    var base = tsBase();
    if (!base || !draft) {
      notify(t('dso_ts_settings_no_url'));
      return;
    }
    var net = getNetwork();
    net.clear();
    net.timeout(15000);
    net.silent(
      base + '/settings',
      function () {
        clearDirty();
        statusText = t('dso_ts_settings_saved');
        notify(t('dso_ts_settings_saved'));
        loadFromServer(false);
      },
      function (a, c) {
        var msg = net.errorDecode ? net.errorDecode(a, c) : t('dso_ts_settings_save_error');
        notify(msg || t('dso_ts_settings_save_error'));
      },
      JSON.stringify({ action: 'set', sets: draft }),
      { dataType: 'text' }
    );
  }

  function confirmReset() {
    Lampa.Select.show({
      title: t('dso_ts_settings_confirm_reset'),
      items: [
        { title: t('dso_ts_settings_yes'), value: 'yes' },
        { title: t('dso_ts_settings_no'), value: 'no', selected: true },
      ],
      onSelect: function (item) {
        restoreSettingsController();
        if (item.value === 'yes') resetOnServer();
      },
      onBack: restoreSettingsController,
    });
  }

  function resetOnServer() {
    var base = tsBase();
    if (!base) {
      notify(t('dso_ts_settings_no_url'));
      return;
    }
    var net = getNetwork();
    net.clear();
    net.timeout(15000);
    net.silent(
      base + '/settings',
      function () {
        notify(t('dso_ts_settings_reset_ok'));
        loadFromServer(false);
      },
      function (a, c) {
        var msg = net.errorDecode ? net.errorDecode(a, c) : t('dso_ts_settings_save_error');
        notify(msg || t('dso_ts_settings_save_error'));
      },
      JSON.stringify({ action: 'def' }),
      { dataType: 'text' }
    );
  }

  function componentOnBack() {
    if (dirty) askLeaveIfDirty();
    else leaveComponentClean();
  }

  function patchSettingsCreate() {
    if (!Lampa.Settings || typeof Lampa.Settings.create !== 'function') return;
    if (Lampa.Settings.create.__dso_ts_settings_patched) return;

    var orig = Lampa.Settings.create.bind(Lampa.Settings);
    Lampa.Settings.create = function (name, params) {
      params = params || {};
      if (name === COMPONENT) {
        var next = {};
        for (var key in params) {
          if (Object.prototype.hasOwnProperty.call(params, key)) next[key] = params[key];
        }
        next.onBack = componentOnBack;
        params = next;
      }
      var out = orig(name, params);
      if (name === COMPONENT) {
        if (skipCreateHook) {
          skipCreateHook = false;
        } else if (!loading && !leavingDirty) {
          if (!dirty) {
            setTimeout(function () {
              loadFromServer(false);
            }, 0);
          }
        }
      }
      return out;
    };
    Lampa.Settings.create.__dso_ts_settings_patched = true;
  }

  function addSettings() {
    if (!Lampa.SettingsApi || typeof Lampa.SettingsApi.addComponent !== 'function') return;

    Lampa.SettingsApi.addComponent({
      component: COMPONENT,
      name: t('dso_ts_settings_title'),
      icon: MANIFEST.icon,
      after: 'server',
    });

    statusText = t('dso_ts_settings_status_idle');
    registerParams();
    patchSettingsCreate();
  }

  function init() {
    if (window.lampa_settings && window.lampa_settings.torrents_use === false) {
      console.log(LOG, 'skipped: torrents_use=false');
      return;
    }

    network = new Lampa.Reguest();
    addLang();
    Lampa.Manifest.plugins = MANIFEST;
    addSettings();
    console.log(LOG, 'loaded', VERSION);
  }

  if (window.appready) init();
  else
    Lampa.Listener.follow('app', function (e) {
      if (e.type === 'ready') init();
    });
})();
