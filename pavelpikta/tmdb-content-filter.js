(function () {
  'use strict';

  if (window.__tmdb_content_filter_loaded) return;
  window.__tmdb_content_filter_loaded = true;

  var VERSION = '1.4.0';
  var COMPONENT = 'tmdb_cf';
  var SETTINGS_COMPONENT = 'tmdb';
  var LOG = 'TMDB Content Filter';

  var COUNTRY_GROUPS = {
    india: ['IN'],
    pakistan: ['PK'],
    bangladesh: ['BD'],
    south_asia: ['LK', 'NP', 'AF', 'BT', 'MV'],
    korea: ['KR', 'KP'],
    japan: ['JP'],
    china: ['CN', 'HK', 'TW', 'MO'],
    southeast: ['TH', 'VN', 'PH', 'ID', 'MY', 'SG', 'KH', 'LA', 'MM', 'BN', 'TL'],
    central_asia: ['MN', 'KZ', 'UZ', 'TM', 'TJ', 'KG'],
    caucasus: ['AM', 'GE', 'AZ'],
    middle_east: ['IR', 'IQ', 'SA', 'AE', 'IL', 'LB', 'SY', 'JO', 'YE', 'OM', 'QA', 'KW', 'BH', 'PS'],
    arab: ['SA', 'AE', 'EG', 'IQ', 'SY', 'JO', 'LB', 'PS', 'YE', 'OM', 'QA', 'KW', 'BH', 'MA', 'DZ', 'TN', 'LY', 'SD', 'MR', 'SO', 'DJ', 'KM'],
    turkey: ['TR', 'CY'],
    north_africa: ['MA', 'DZ', 'TN', 'LY', 'EG', 'EH', 'MR'],
    russia: ['RU'],
    north_america: ['US', 'CA', 'MX', 'PR', 'GU', 'VI', 'BM', 'KY'],
    latin_america: [
      'BR', 'AR', 'CL', 'CO', 'PE', 'VE', 'EC', 'UY', 'PY', 'BO', 'CR', 'PA', 'DO', 'CU', 'GT', 'HN', 'NI', 'SV',
      'HT', 'JM', 'TT', 'BB', 'BS', 'BZ', 'GY', 'SR', 'GF', 'AW',
    ],
    western_europe: [
      'GB', 'FR', 'DE', 'IT', 'ES', 'PT', 'NL', 'BE', 'CH', 'AT', 'IE', 'LU', 'MC', 'AD', 'LI', 'SM', 'VA', 'MT',
      'IS', 'NO', 'SE', 'DK', 'FI', 'FO', 'GL',
    ],
    eastern_europe: [
      'UA', 'BY', 'PL', 'CZ', 'SK', 'HU', 'RO', 'BG', 'HR', 'SI', 'RS', 'BA', 'ME', 'MK', 'AL', 'MD', 'EE', 'LV',
      'LT', 'GR', 'XK',
    ],
    africa: [
      'ZA', 'NG', 'KE', 'GH', 'ET', 'TZ', 'UG', 'SN', 'CI', 'CM', 'AO', 'MZ', 'ZW', 'RW', 'SD', 'SO', 'CD', 'CG',
      'BF', 'BJ', 'BW', 'NA', 'ZM', 'MW', 'ML', 'NE', 'TD', 'GA', 'GQ', 'GM', 'GN', 'GW', 'LR', 'SL', 'TG', 'BI',
      'DJ', 'ER', 'SS', 'CF', 'CV', 'KM', 'MG', 'MU', 'SC', 'ST', 'SZ', 'LS',
    ],
    oceania: ['AU', 'NZ', 'FJ', 'PG', 'WS', 'TO', 'VU', 'SB', 'NC', 'PF', 'CK', 'KI', 'MH', 'FM', 'PW', 'NR', 'TV', 'AS', 'MP'],
  };

  // Region-specific languages only — no global en/es/fr in groups (arab has ar).
  var LANGUAGE_GROUPS = {
    india: ['hi', 'ta', 'te', 'ml', 'kn', 'bn', 'pa', 'mr', 'gu', 'or', 'as'],
    pakistan: ['ur'],
    bangladesh: ['bn'],
    south_asia: ['si', 'ne', 'ps', 'dv'],
    korea: ['ko'],
    japan: ['ja'],
    china: ['zh'],
    southeast: ['th', 'vi', 'id', 'ms', 'km', 'lo', 'my', 'tl', 'jv'],
    central_asia: ['mn', 'kk', 'uz', 'ky', 'tg'],
    caucasus: ['hy', 'ka', 'az'],
    middle_east: ['fa', 'he', 'ku'],
    arab: ['ar'],
    turkey: ['tr'],
    russia: ['ru', 'ba', 'ce', 'cv', 'tt'],
    latin_america: ['gn', 'qu', 'ht'],
    eastern_europe: ['uk', 'pl', 'cs', 'sk', 'hu', 'ro', 'bg', 'hr', 'sl', 'sr', 'bs', 'mk', 'sq', 'et', 'lv', 'lt', 'el', 'be'],
    africa: ['sw', 'am', 'ha', 'yo', 'ig', 'zu', 'af', 'so', 'rw', 'mg', 'ln', 'st', 'sn', 'bm', 'ff', 'wo'],
    oceania: ['mi', 'sm', 'fj'],
  };

  var GROUP_ORDER = [
    'india',
    'pakistan',
    'bangladesh',
    'south_asia',
    'korea',
    'japan',
    'china',
    'southeast',
    'central_asia',
    'caucasus',
    'middle_east',
    'arab',
    'turkey',
    'north_africa',
    'russia',
    'north_america',
    'latin_america',
    'western_europe',
    'eastern_europe',
    'africa',
    'oceania',
  ];

  // TMDB genre IDs — full movie (19) + TV (16) lists; catalog rows use genre_ids.
  var GENRE_GROUPS = {
    action: [28, 10759],
    adventure: [12],
    animation: [16],
    comedy: [35],
    crime: [80],
    documentary: [99],
    drama: [18],
    family: [10751],
    kids: [10762],
    fantasy: [14],
    history: [36],
    horror: [27],
    music: [10402],
    mystery: [9648],
    news: [10763],
    reality: [10764],
    romance: [10749],
    sci_fi: [878, 10765],
    soap: [10766],
    talk: [10767],
    thriller: [53],
    tv_movie: [10770],
    war: [10752, 10768],
    western: [37],
  };

  var GENRE_ORDER = [
    'action',
    'adventure',
    'animation',
    'comedy',
    'crime',
    'documentary',
    'drama',
    'family',
    'kids',
    'fantasy',
    'history',
    'horror',
    'music',
    'mystery',
    'news',
    'reality',
    'romance',
    'sci_fi',
    'soap',
    'talk',
    'thriller',
    'tv_movie',
    'war',
    'western',
  ];

  var MANIFEST = {
    type: 'other',
    version: VERSION,
    name: 'TMDB Content Filter',
    description: 'Hide TMDB catalog rows by region, genre, or original language',
    author: '@pavelpikta',
    component: COMPONENT,
    icon:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a15 15 0 0 1 0 18"/><path d="M12 3a15 15 0 0 0 0 18"/><path d="M8 8l8 8" stroke-width="1.2"/></svg>',
  };

  function t(key) {
    return Lampa.Lang.translate(key);
  }

  function addLang() {
    Lampa.Lang.add({
      tmdb_cf_settings_name: { en: 'TMDB Content Filter', ru: 'Фильтр контента TMDB' },
      tmdb_cf_enabled: {
        en: 'Enable content filter',
        ru: 'Включить фильтр контента',
      },
      tmdb_cf_enabled_desc: {
        en: 'Hide catalog titles by region (country / language) or by TMDB genre',
        ru: 'Скрывать тайтлы по региону (страна / язык) или по жанру TMDB',
      },
      tmdb_cf_genres: {
        en: 'Genres to hide',
        ru: 'Жанры для скрытия',
      },
      tmdb_cf_genres_desc: {
        en: 'Titles with any selected genre are hidden from catalog rows and search',
        ru: 'Тайтлы с любым из выбранных жанров скрываются в каталоге и поиске',
      },
      tmdb_cf_genre_action: { en: 'Action / Action & Adventure', ru: 'Боевик' },
      tmdb_cf_genre_adventure: { en: 'Adventure', ru: 'Приключения' },
      tmdb_cf_genre_animation: { en: 'Anime / Animation', ru: 'Аниме / Анимация' },
      tmdb_cf_genre_comedy: { en: 'Comedy', ru: 'Комедия' },
      tmdb_cf_genre_crime: { en: 'Crime', ru: 'Криминал' },
      tmdb_cf_genre_documentary: { en: 'Documentary', ru: 'Документальный' },
      tmdb_cf_genre_drama: { en: 'Drama', ru: 'Драма' },
      tmdb_cf_genre_family: { en: 'Family', ru: 'Семейный' },
      tmdb_cf_genre_kids: { en: 'Kids', ru: 'Детский' },
      tmdb_cf_genre_fantasy: { en: 'Fantasy', ru: 'Фэнтези' },
      tmdb_cf_genre_history: { en: 'History', ru: 'Исторический' },
      tmdb_cf_genre_horror: { en: 'Horror', ru: 'Ужасы' },
      tmdb_cf_genre_music: { en: 'Music', ru: 'Музыка' },
      tmdb_cf_genre_mystery: { en: 'Mystery', ru: 'Детектив' },
      tmdb_cf_genre_news: { en: 'News', ru: 'Новости' },
      tmdb_cf_genre_reality: { en: 'Reality', ru: 'Реалити' },
      tmdb_cf_genre_romance: { en: 'Romance', ru: 'Мелодрама' },
      tmdb_cf_genre_sci_fi: { en: 'Sci-Fi & Fantasy', ru: 'Фантастика' },
      tmdb_cf_genre_soap: { en: 'Soap', ru: 'Мыльная опера' },
      tmdb_cf_genre_talk: { en: 'Talk', ru: 'Ток-шоу' },
      tmdb_cf_genre_thriller: { en: 'Thriller', ru: 'Триллер' },
      tmdb_cf_genre_tv_movie: { en: 'TV Movie', ru: 'Телефильм' },
      tmdb_cf_genre_war: { en: 'War / War & Politics', ru: 'Военный' },
      tmdb_cf_genre_western: { en: 'Western', ru: 'Вестерн' },
      tmdb_cf_regions: {
        en: 'Regions to hide',
        ru: 'Регионы для скрытия',
      },
      tmdb_cf_regions_desc: {
        en: 'One list — a region is hidden by its production country and its original language together',
        ru: 'Один список — регион скрывается и по стране производства, и по оригинальному языку сразу',
      },
      tmdb_cf_none: {
        en: 'Nothing selected — tap to choose',
        ru: 'Ничего не выбрано — нажмите для выбора',
      },
      tmdb_cf_block_india: { en: 'India', ru: 'Индия' },
      tmdb_cf_block_pakistan: { en: 'Pakistan', ru: 'Пакистан' },
      tmdb_cf_block_bangladesh: { en: 'Bangladesh', ru: 'Бангладеш' },
      tmdb_cf_block_south_asia: {
        en: 'Sri Lanka, Nepal, Afghanistan, …',
        ru: 'Шри-Ланка, Непал, Афганистан, …',
      },
      tmdb_cf_block_korea: { en: 'Korea (South & North)', ru: 'Корея (Южная и Северная)' },
      tmdb_cf_block_japan: { en: 'Japan', ru: 'Япония' },
      tmdb_cf_block_china: { en: 'China / Taiwan / Hong Kong', ru: 'Китай / Тайвань / Гонконг' },
      tmdb_cf_block_southeast: { en: 'Southeast Asia', ru: 'Юго-Восточная Азия' },
      tmdb_cf_block_central_asia: {
        en: 'Central Asia (Kazakhstan, Uzbekistan, …)',
        ru: 'Центральная Азия (Казахстан, Узбекистан, …)',
      },
      tmdb_cf_block_caucasus: {
        en: 'Caucasus (Armenia, Georgia, Azerbaijan)',
        ru: 'Кавказ (Армения, Грузия, Азербайджан)',
      },
      tmdb_cf_block_middle_east: {
        en: 'Middle East (Iran, Israel, Turkey neighbors, …)',
        ru: 'Ближний Восток (Иран, Израиль, соседи Турции, …)',
      },
      tmdb_cf_block_arab: {
        en: 'Arab countries (Arabic — ar)',
        ru: 'Арабские страны (арабский — ar)',
      },
      tmdb_cf_block_turkey: { en: 'Turkey / Cyprus', ru: 'Турция / Кипр' },
      tmdb_cf_block_north_africa: {
        en: 'North Africa (Morocco, Algeria, Egypt, …)',
        ru: 'Северная Африка (Марокко, Алжир, Египет, …)',
      },
      tmdb_cf_block_russia: { en: 'Russia', ru: 'Россия' },
      tmdb_cf_block_north_america: {
        en: 'North America (USA, Canada, Mexico, …)',
        ru: 'Северная Америка (США, Канада, Мексика, …)',
      },
      tmdb_cf_block_latin_america: {
        en: 'Latin America (Brazil, Argentina, …)',
        ru: 'Латинская Америка (Бразилия, Аргентина, …)',
      },
      tmdb_cf_block_western_europe: {
        en: 'Western Europe (UK, France, Germany, …)',
        ru: 'Западная Европа (Великобритания, Франция, Германия, …)',
      },
      tmdb_cf_block_eastern_europe: {
        en: 'Eastern Europe (Ukraine, Poland, Balkans, …)',
        ru: 'Восточная Европа (Украина, Польша, Балканы, …)',
      },
      tmdb_cf_block_africa: {
        en: 'Sub-Saharan Africa (Nigeria, South Africa, …)',
        ru: 'Тропическая Африка (Нигерия, ЮАР, …)',
      },
      tmdb_cf_block_oceania: {
        en: 'Oceania & Pacific (Australia, New Zealand, Fiji, …)',
        ru: 'Океания и Тихий океан (Австралия, Новая Зеландия, Фиджи, …)',
      },
      tmdb_cf_blocked: {
        en: 'This title is hidden by TMDB Content Filter',
        ru: 'Этот тайтл скрыт фильтром контента TMDB',
      },
    });
  }

  function isEnabled() {
    return !!Lampa.Storage.field(COMPONENT + '_enabled');
  }

  function normalizeCountry(code) {
    return String(code || '').toUpperCase();
  }

  function normalizeLanguage(code) {
    return String(code || '').toLowerCase();
  }

  function uniqueList(list) {
    var out = [];
    list.forEach(function (val) {
      if (val && out.indexOf(val) === -1) out.push(val);
    });
    return out;
  }

  function hasLanguageGroup(key) {
    var list = LANGUAGE_GROUPS[key];
    return Array.isArray(list) && list.length > 0;
  }

  function regionStorageKey(key) {
    return COMPONENT + '_region_' + key;
  }

  function regionEnabled(key) {
    return !!Lampa.Storage.get(regionStorageKey(key), false);
  }

  function setRegionEnabled(key, value) {
    Lampa.Storage.set(regionStorageKey(key), value);
  }

  function genreStorageKey(key) {
    return COMPONENT + '_genre_' + key;
  }

  function genreEnabled(key) {
    return !!Lampa.Storage.get(genreStorageKey(key), false);
  }

  function setGenreEnabled(key, value) {
    Lampa.Storage.set(genreStorageKey(key), value);
  }

  function getBlockedSets() {
    var countries = {};
    var languages = {};
    var genres = {};
    var i;
    var key;
    var j;
    var ids;

    for (i = 0; i < GROUP_ORDER.length; i++) {
      key = GROUP_ORDER[i];

      if (!regionEnabled(key)) continue;

      if (COUNTRY_GROUPS[key]) {
        COUNTRY_GROUPS[key].forEach(function (code) {
          countries[normalizeCountry(code)] = true;
        });
      }

      if (hasLanguageGroup(key)) {
        LANGUAGE_GROUPS[key].forEach(function (code) {
          languages[normalizeLanguage(code)] = true;
        });
      }
    }

    for (i = 0; i < GENRE_ORDER.length; i++) {
      key = GENRE_ORDER[i];

      if (!genreEnabled(key)) continue;

      ids = GENRE_GROUPS[key];
      if (!Array.isArray(ids)) continue;

      for (j = 0; j < ids.length; j++) {
        genres[ids[j]] = true;
      }
    }

    return { countries: countries, languages: languages, genres: genres };
  }

  function hasActiveBlocks(blocked) {
    return (
      Object.keys(blocked.countries).length > 0 ||
      Object.keys(blocked.languages).length > 0 ||
      Object.keys(blocked.genres).length > 0
    );
  }

  function isCatalogItem(item) {
    if (!item || typeof item !== 'object' || item.id == null) return false;
    return !!(item.title || item.name || item.original_title || item.original_name);
  }

  function getCountryCodes(item) {
    var codes = [];

    if (Array.isArray(item.origin_country)) {
      item.origin_country.forEach(function (code) {
        if (code) codes.push(normalizeCountry(code));
      });
    }

    if (Array.isArray(item.production_countries)) {
      item.production_countries.forEach(function (country) {
        if (country && country.iso_3166_1) {
          codes.push(normalizeCountry(country.iso_3166_1));
        }
      });
    }

    if (Array.isArray(item.production_companies)) {
      item.production_companies.forEach(function (company) {
        if (company && company.origin_country) {
          codes.push(normalizeCountry(company.origin_country));
        }
      });
    }

    return uniqueList(codes);
  }

  function getOriginalLanguage(item) {
    if (!item || !item.original_language) return '';
    return normalizeLanguage(item.original_language);
  }

  function getItemGenreIds(item) {
    var ids = [];
    var seen = {};

    function add(id) {
      var num = Number(id);
      if (!num || seen[num]) return;
      seen[num] = true;
      ids.push(num);
    }

    if (Array.isArray(item.genre_ids)) {
      item.genre_ids.forEach(add);
    }

    if (Array.isArray(item.genres)) {
      item.genres.forEach(function (genre) {
        if (genre && genre.id != null) add(genre.id);
      });
    }

    return ids;
  }

  function shouldBlockItem(item, blocked) {
    if (!isCatalogItem(item)) return false;
    blocked = blocked || getBlockedSets();
    if (!hasActiveBlocks(blocked)) return false;

    var codes = getCountryCodes(item);
    var lang = getOriginalLanguage(item);
    var i;

    if (Object.keys(blocked.countries).length > 0) {
      for (i = 0; i < codes.length; i++) {
        if (blocked.countries[codes[i]]) return true;
      }
    }

    if (Object.keys(blocked.languages).length > 0 && lang) {
      if (blocked.languages[lang]) return true;
    }

    if (Object.keys(blocked.genres).length > 0) {
      var genreIds = getItemGenreIds(item);
      for (i = 0; i < genreIds.length; i++) {
        if (blocked.genres[genreIds[i]]) return true;
      }
    }

    return false;
  }

  function filterCatalogData(data, blocked) {
    if (!data) return 0;
    blocked = blocked || getBlockedSets();
    if (!hasActiveBlocks(blocked)) return 0;
    return filterPayload(data, blocked);
  }

  function looksLikeCatalogResults(results) {
    if (!Array.isArray(results) || !results.length) return false;
    return isCatalogItem(results[0]);
  }

  function filterResultsList(results, blocked) {
    if (!looksLikeCatalogResults(results)) return 0;

    var before = results.length;
    var filtered = results.filter(function (item) {
      return !shouldBlockItem(item, blocked);
    });

    results.length = 0;
    filtered.forEach(function (item) {
      results.push(item);
    });

    return before - filtered.length;
  }

  function filterPayload(data, blocked) {
    if (!data || typeof data !== 'object') return 0;

    var removed = 0;

    if (Array.isArray(data.results)) {
      removed += filterResultsList(data.results, blocked);
      if (typeof data.total_results === 'number' && removed > 0) {
        data.total_results = Math.max(0, data.total_results - removed);
      }
    }

    if (Array.isArray(data)) {
      data.forEach(function (row) {
        if (row && Array.isArray(row.results)) {
          removed += filterResultsList(row.results, blocked);
        }
      });
    }

    if (data.movie && shouldBlockItem(data.movie, blocked)) {
      data.movie = null;
      removed += 1;
    }

    return removed;
  }

  function isCatalogRequest(url) {
    if (typeof url !== 'string') return true;

    var lower = url.toLowerCase();

    // Only skip endpoints that clearly are NOT movie/TV catalog lists.
    // Payload shape checks (isCatalogItem / looksLikeCatalogResults) are the real guard.
    if (lower.indexOf('/person/') !== -1) return false;
    if (lower.indexOf('configuration') !== -1) return false;
    if (lower.indexOf('/genre/') !== -1 && lower.indexOf('list') !== -1) return false;

    return true;
  }

  function onRequestSuccess(e) {
    if (!isEnabled()) return;
    if (!e || !e.data) return;

    var blocked = getBlockedSets();
    if (!hasActiveBlocks(blocked)) return;

    var url = e.params && e.params.url;
    if (!isCatalogRequest(url)) return;

    var removed = filterPayload(e.data, blocked);
    if (removed > 0) {
      console.log(LOG, 'filtered', removed, 'item(s)', url || '');
    }
  }

  function purgeBlockedLineItems(line, blocked) {
    if (!line || !Array.isArray(line.items) || !line.items.length) return false;

    var removed = false;
    var i;

    for (i = line.items.length - 1; i >= 0; i--) {
      var card = line.items[i];

      if (!card || !card.data || !shouldBlockItem(card.data, blocked)) continue;

      if (typeof card.destroy === 'function') card.destroy();
      line.items.splice(i, 1);
      removed = true;
    }

    if (removed && line.scroll) {
      try {
        var root = line.scroll.render(true);
        if (root && Lampa.Controller && Lampa.Controller.collectionSet) {
          Lampa.Controller.collectionSet(root);
        }
      } catch (err) { }
    }

    return removed;
  }

  function onLineEvent(e) {
    if (!isEnabled()) return;
    if (!e || (e.type !== 'create' && e.type !== 'append')) return;
    if (!e.data) return;

    var blocked = getBlockedSets();
    if (!hasActiveBlocks(blocked)) return;

    filterCatalogData(e.data, blocked);

    // Event module runs after Items.onCreate — drop cards that slipped through before line event.
    if (e.type === 'create') purgeBlockedLineItems(e.line, blocked);
  }

  function wrapOnComplite(oncomplite) {
    if (!oncomplite) return oncomplite;

    return function (data) {
      if (isEnabled()) filterCatalogData(data);
      oncomplite(data);
    };
  }

  function patchSourceMethod(source, methodName, flag) {
    if (!source || typeof source[methodName] !== 'function' || source[flag]) return;

    var original = source[methodName];

    source[methodName] = function () {
      var args = Array.prototype.slice.call(arguments);
      var oncompliteIndex = methodName === 'get' ? 2 : 1;

      if (typeof args[oncompliteIndex] === 'function') {
        args[oncompliteIndex] = wrapOnComplite(args[oncompliteIndex]);
      }

      return original.apply(source, args);
    };

    source[flag] = true;
  }

  function patchApiSources() {
    if (!Lampa.Api || !Lampa.Api.sources) return;

    ['tmdb', 'cub'].forEach(function (name) {
      var source = Lampa.Api.sources[name];
      if (!source) return;

      patchSourceMethod(source, 'get', '__tmdbCfGetPatched');
      patchSourceMethod(source, 'list', '__tmdbCfListPatched');
    });
  }

  function onFullCard(e) {
    if (!isEnabled()) return;
    if (e.type !== 'start') return;

    var blocked = getBlockedSets();
    if (!hasActiveBlocks(blocked)) return;

    var card =
      (e.object && (e.object.movie || e.object.card)) ||
      (e.data && e.data.movie) ||
      null;

    if (!card || !shouldBlockItem(card, blocked)) return;

    Lampa.Bell.push({ text: t('tmdb_cf_blocked') });

    setTimeout(function () {
      try {
        Lampa.Activity.backward();
      } catch (err) { }
    }, 120);
  }

  function onSettingsChanged() {
    Lampa.Settings.update();
  }

  function regionSelectItems() {
    return GROUP_ORDER.map(function (key) {
      return {
        title: t('tmdb_cf_block_' + key),
        key: key,
        checkbox: true,
        checked: regionEnabled(key),
      };
    });
  }

  function selectedRegionSummary() {
    var names = [];

    GROUP_ORDER.forEach(function (key) {
      if (regionEnabled(key)) names.push(t('tmdb_cf_block_' + key));
    });

    if (!names.length) return t('tmdb_cf_none');
    return names.join(', ');
  }

  function openRegionSelect() {
    Lampa.Select.show({
      title: t('tmdb_cf_regions'),
      items: regionSelectItems(),
      onCheck: function (item) {
        var next = !regionEnabled(item.key);
        setRegionEnabled(item.key, next);
        item.checked = next;
      },
      onBack: function () {
        Lampa.Controller.toggle('settings');
      },
    });
  }

  function addRegionSelect() {
    Lampa.SettingsApi.addParam({
      component: SETTINGS_COMPONENT,
      param: { name: COMPONENT + '_regions_btn', type: 'button' },
      field: {
        name: t('tmdb_cf_regions'),
        description: t('tmdb_cf_regions_desc'),
      },
      onRender: function (item) {
        item.toggleClass('hide', !isEnabled());
        item.find('.settings-param__descr').text(selectedRegionSummary());
        item.off('hover:enter.tmdb_cf_regions').on('hover:enter.tmdb_cf_regions', function () {
          openRegionSelect();
        });
      },
    });
  }

  function genreSelectItems() {
    return GENRE_ORDER.map(function (key) {
      return {
        title: t('tmdb_cf_genre_' + key),
        key: key,
        checkbox: true,
        checked: genreEnabled(key),
      };
    });
  }

  function selectedGenreSummary() {
    var names = [];

    GENRE_ORDER.forEach(function (key) {
      if (genreEnabled(key)) names.push(t('tmdb_cf_genre_' + key));
    });

    if (!names.length) return t('tmdb_cf_none');
    return names.join(', ');
  }

  function openGenreSelect() {
    Lampa.Select.show({
      title: t('tmdb_cf_genres'),
      items: genreSelectItems(),
      onCheck: function (item) {
        var next = !genreEnabled(item.key);
        setGenreEnabled(item.key, next);
        item.checked = next;
      },
      onBack: function () {
        Lampa.Controller.toggle('settings');
      },
    });
  }

  function addGenreSelect() {
    Lampa.SettingsApi.addParam({
      component: SETTINGS_COMPONENT,
      param: { name: COMPONENT + '_genres_btn', type: 'button' },
      field: {
        name: t('tmdb_cf_genres'),
        description: t('tmdb_cf_genres_desc'),
      },
      onRender: function (item) {
        item.toggleClass('hide', !isEnabled());
        item.find('.settings-param__descr').text(selectedGenreSummary());
        item.off('hover:enter.tmdb_cf_genres').on('hover:enter.tmdb_cf_genres', function () {
          openGenreSelect();
        });
      },
    });
  }

  function addSettings() {
    Lampa.SettingsApi.addParam({
      component: SETTINGS_COMPONENT,
      param: { name: COMPONENT + '_enabled', type: 'trigger', default: false },
      field: {
        name: t('tmdb_cf_enabled'),
        description: t('tmdb_cf_enabled_desc'),
      },
      onChange: onSettingsChanged,
    });

    addRegionSelect();
    addGenreSelect();
  }

  function init() {
    addLang();
    addSettings();
    Lampa.Manifest.plugins = MANIFEST;

    Lampa.Listener.follow('request_secuses', onRequestSuccess);
    Lampa.Listener.follow('line', onLineEvent);
    Lampa.Listener.follow('full', onFullCard);

    patchApiSources();

    console.log(LOG, 'loaded', VERSION);
  }

  if (window.appready) init();
  else
    Lampa.Listener.follow('app', function (e) {
      if (e.type === 'ready') init();
    });
})();
