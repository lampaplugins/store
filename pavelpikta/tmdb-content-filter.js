(function () {
  'use strict';

  if (window.__tmdb_content_filter_loaded) return;
  window.__tmdb_content_filter_loaded = true;

  var VERSION = '1.0.0';
  var COMPONENT = 'tmdb_cf';
  var LOG = 'TMDB Content Filter';

  // ISO codes aligned with TMDB
  var REGIONS = {
    india: {
      countries: ['IN'],
      languages: ['hi', 'ta', 'te', 'ml', 'kn', 'bn', 'pa', 'mr', 'gu', 'or', 'as'],
    },
    pakistan: {
      countries: ['PK'],
      languages: ['ur'],
    },
    bangladesh: {
      countries: ['BD'],
      languages: ['bn'],
    },
    south_asia: {
      countries: ['LK', 'NP', 'AF', 'BT', 'MV'],
      languages: ['si', 'ne', 'ps', 'dv'],
    },
    korea: {
      countries: ['KR', 'KP'],
      languages: ['ko'],
    },
    japan: {
      countries: ['JP'],
      languages: ['ja'],
    },
    china: {
      countries: ['CN', 'HK', 'TW', 'MO'],
      languages: ['zh'],
    },
    southeast: {
      countries: ['TH', 'VN', 'PH', 'ID', 'MY', 'SG', 'KH', 'LA', 'MM', 'BN', 'TL'],
      languages: ['th', 'vi', 'id', 'ms', 'km', 'lo', 'my', 'tl', 'jv'],
    },
    central_asia: {
      countries: ['MN', 'KZ', 'UZ', 'TM', 'TJ', 'KG'],
      languages: ['mn', 'kk', 'uz', 'ky', 'tg'],
    },
    caucasus: {
      countries: ['AM', 'GE', 'AZ'],
      languages: ['hy', 'ka', 'az'],
    },
    middle_east: {
      countries: ['IR', 'IQ', 'SA', 'AE', 'IL', 'LB', 'SY', 'JO', 'YE', 'OM', 'QA', 'KW', 'BH', 'PS'],
      languages: ['fa', 'ar', 'he', 'ku'],
    },
    turkey: {
      countries: ['TR', 'CY'],
      languages: ['tr'],
    },
    north_africa: {
      countries: ['MA', 'DZ', 'TN', 'LY', 'EG', 'EH', 'MR'],
      languages: ['ar', 'fr'],
    },
    russia: {
      countries: ['RU'],
      languages: ['ru', 'ba', 'ce', 'cv', 'tt'],
    },
    north_america: {
      countries: ['US', 'CA', 'MX', 'PR', 'GU', 'VI', 'BM', 'KY'],
      languages: ['en', 'es', 'fr'],
    },
    latin_america: {
      countries: [
        'BR', 'AR', 'CL', 'CO', 'PE', 'VE', 'EC', 'UY', 'PY', 'BO', 'CR', 'PA', 'DO', 'CU', 'GT', 'HN', 'NI', 'SV',
        'HT', 'JM', 'TT', 'BB', 'BS', 'BZ', 'GY', 'SR', 'GF', 'AW',
      ],
      languages: ['es', 'pt', 'gn', 'qu', 'ht'],
    },
    western_europe: {
      countries: [
        'GB', 'FR', 'DE', 'IT', 'ES', 'PT', 'NL', 'BE', 'CH', 'AT', 'IE', 'LU', 'MC', 'AD', 'LI', 'SM', 'VA', 'MT',
        'IS', 'NO', 'SE', 'DK', 'FI', 'FO', 'GL',
      ],
      languages: ['en', 'fr', 'de', 'it', 'es', 'pt', 'nl', 'sv', 'no', 'da', 'fi', 'is', 'ca', 'eu', 'gl', 'cy', 'ga', 'mt'],
    },
    eastern_europe: {
      countries: [
        'UA', 'BY', 'PL', 'CZ', 'SK', 'HU', 'RO', 'BG', 'HR', 'SI', 'RS', 'BA', 'ME', 'MK', 'AL', 'MD', 'EE', 'LV',
        'LT', 'GR', 'XK',
      ],
      languages: ['uk', 'pl', 'cs', 'sk', 'hu', 'ro', 'bg', 'hr', 'sl', 'sr', 'bs', 'mk', 'sq', 'et', 'lv', 'lt', 'el', 'be'],
    },
    africa: {
      countries: [
        'ZA', 'NG', 'KE', 'GH', 'ET', 'TZ', 'UG', 'SN', 'CI', 'CM', 'AO', 'MZ', 'ZW', 'RW', 'SD', 'SO', 'CD', 'CG',
        'BF', 'BJ', 'BW', 'NA', 'ZM', 'MW', 'ML', 'NE', 'TD', 'GA', 'GQ', 'GM', 'GN', 'GW', 'LR', 'SL', 'TG', 'BI',
        'DJ', 'ER', 'SS', 'CF', 'CV', 'KM', 'MG', 'MU', 'SC', 'ST', 'SZ', 'LS',
      ],
      languages: ['sw', 'am', 'ha', 'yo', 'ig', 'zu', 'af', 'so', 'rw', 'mg', 'ln', 'st', 'sn', 'bm', 'ff', 'wo'],
    },
    oceania: {
      countries: ['AU', 'NZ', 'FJ', 'PG', 'WS', 'TO', 'VU', 'SB', 'NC', 'PF', 'CK', 'KI', 'MH', 'FM', 'PW', 'NR', 'TV', 'AS', 'MP'],
      languages: ['en', 'mi', 'sm', 'fj'],
    },
  };

  var REGION_ORDER = [
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

  var MANIFEST = {
    type: 'other',
    version: VERSION,
    name: 'TMDB Content Filter',
    description: 'Hide TMDB catalog rows by country or original language',
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
        en: 'Hide movies and series from selected regions in TMDB and CUB catalogs',
        ru: 'Скрывать фильмы и сериалы выбранных регионов в каталогах TMDB и CUB',
      },
      tmdb_cf_regions_title: { en: 'Hide content from', ru: 'Скрывать контент из' },
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
      tmdb_cf_block_caucasus: { en: 'Caucasus (Armenia, Georgia, Azerbaijan)', ru: 'Кавказ (Армения, Грузия, Азербайджан)' },
      tmdb_cf_block_middle_east: {
        en: 'Middle East (Iran, Arab states, Israel, …)',
        ru: 'Ближний Восток (Иран, арабские страны, Израиль, …)',
      },
      tmdb_cf_block_turkey: { en: 'Turkey / Cyprus', ru: 'Турция / Кипр' },
      tmdb_cf_block_north_africa: {
        en: 'North Africa (Morocco, Algeria, Egypt, …)',
        ru: 'Северная Африка (Марокко, Алжир, Египет, …)',
      },
      tmdb_cf_block_russia: { en: 'Russia', ru: 'Россия' },
      tmdb_cf_title_americas: { en: 'Americas', ru: 'Америка' },
      tmdb_cf_block_north_america: {
        en: 'North America (USA, Canada, Mexico, …)',
        ru: 'Северная Америка (США, Канада, Мексика, …)',
      },
      tmdb_cf_block_latin_america: {
        en: 'Latin America (Brazil, Argentina, …)',
        ru: 'Латинская Америка (Бразилия, Аргентина, …)',
      },
      tmdb_cf_title_europe: { en: 'Europe', ru: 'Европа' },
      tmdb_cf_block_western_europe: {
        en: 'Western Europe (UK, France, Germany, …)',
        ru: 'Западная Европа (Великобритания, Франция, Германия, …)',
      },
      tmdb_cf_block_eastern_europe: {
        en: 'Eastern Europe (Ukraine, Poland, Balkans, …)',
        ru: 'Восточная Европа (Украина, Польша, Балканы, …)',
      },
      tmdb_cf_title_other: { en: 'Africa & Oceania', ru: 'Африка и Океания' },
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
      tmdb_cf_note: {
        en: 'Matches TMDB country codes and original language. Movie lists often only include language, not country.',
        ru: 'Сопоставление по кодам стран TMDB и оригинальному языку. В списках фильмов часто есть только язык.',
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

  var SETTINGS_SECTIONS = [
    { title: null, keys: ['india', 'pakistan', 'bangladesh', 'south_asia', 'korea', 'japan', 'china', 'southeast', 'central_asia', 'caucasus', 'middle_east', 'turkey', 'north_africa', 'russia'] },
    { title: 'tmdb_cf_title_americas', keys: ['north_america', 'latin_america'] },
    { title: 'tmdb_cf_title_europe', keys: ['western_europe', 'eastern_europe'] },
    { title: 'tmdb_cf_title_other', keys: ['africa', 'oceania'] },
  ];

  function regionEnabled(key) {
    return !!Lampa.Storage.field(COMPONENT + '_block_' + key);
  }

  function getBlockedSets() {
    var countries = {};
    var languages = {};
    var i;
    var key;
    var region;

    for (i = 0; i < REGION_ORDER.length; i++) {
      key = REGION_ORDER[i];
      if (!regionEnabled(key)) continue;

      region = REGIONS[key];
      region.countries.forEach(function (code) {
        countries[normalizeCountry(code)] = true;
      });
      region.languages.forEach(function (code) {
        languages[normalizeLanguage(code)] = true;
      });
    }

    return { countries: countries, languages: languages };
  }

  function hasActiveBlocks(blocked) {
    return (
      Object.keys(blocked.countries).length > 0 || Object.keys(blocked.languages).length > 0
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

  function getLanguageCodes(item) {
    var codes = [];

    if (item.original_language) {
      codes.push(normalizeLanguage(item.original_language));
    }

    if (Array.isArray(item.spoken_languages)) {
      item.spoken_languages.forEach(function (lang) {
        if (lang && lang.iso_639_1) {
          codes.push(normalizeLanguage(lang.iso_639_1));
        }
      });
    }

    return uniqueList(codes);
  }

  function shouldBlockItem(item, blocked) {
    if (!isCatalogItem(item)) return false;
    blocked = blocked || getBlockedSets();
    if (!hasActiveBlocks(blocked)) return false;

    var codes = getCountryCodes(item);
    var langs = getLanguageCodes(item);
    var i;

    for (i = 0; i < codes.length; i++) {
      if (blocked.countries[codes[i]]) return true;
    }

    for (i = 0; i < langs.length; i++) {
      if (blocked.languages[langs[i]]) return true;
    }

    return false;
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

    if (lower.indexOf('/person/') !== -1) return false;
    if (lower.indexOf('configuration') !== -1) return false;
    if (lower.indexOf('/genre/') !== -1 && lower.indexOf('list') !== -1) return false;

    if (lower.indexOf('themoviedb') !== -1) return true;
    if (lower.indexOf('tmdb.') !== -1) return true;
    if (lower.indexOf('/tmdb') !== -1) return true;
    if (lower.indexOf('cub.rip') !== -1 && lower.indexOf('/3/') !== -1) return true;

    return (
      lower.indexOf('discover') !== -1 ||
      lower.indexOf('search') !== -1 ||
      lower.indexOf('trending') !== -1 ||
      lower.indexOf('popular') !== -1 ||
      lower.indexOf('/movie/') !== -1 ||
      lower.indexOf('/tv/') !== -1 ||
      lower.indexOf('recommendations') !== -1 ||
      lower.indexOf('similar') !== -1
    );
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

    if (Lampa.Noty && Lampa.Noty.show) {
      Lampa.Noty.show(t('tmdb_cf_blocked'), { style: 'error', time: 3500 });
    } else if (Lampa.Bell) {
      Lampa.Bell.push({ text: t('tmdb_cf_blocked') });
    }

    setTimeout(function () {
      try {
        Lampa.Activity.backward();
      } catch (err) { }
    }, 120);
  }

  function onSettingsChanged() {
    Lampa.Settings.update();
  }

  function addSettings() {
    Lampa.SettingsApi.addComponent({
      component: COMPONENT,
      name: t('tmdb_cf_settings_name'),
      icon: MANIFEST.icon,
    });

    Lampa.SettingsApi.addParam({
      component: COMPONENT,
      param: { name: COMPONENT + '_enabled', type: 'trigger', default: false },
      field: {
        name: t('tmdb_cf_enabled'),
        description: t('tmdb_cf_enabled_desc'),
      },
      onChange: onSettingsChanged,
    });

    Lampa.SettingsApi.addParam({
      component: COMPONENT,
      param: { name: COMPONENT + '_regions_title', type: 'title' },
      field: { name: t('tmdb_cf_regions_title') },
      onRender: function (item) {
        item.toggleClass('hide', !isEnabled());
      },
    });

    SETTINGS_SECTIONS.forEach(function (section) {
      if (section.title) {
        Lampa.SettingsApi.addParam({
          component: COMPONENT,
          param: { name: COMPONENT + '_title_' + section.title, type: 'title' },
          field: { name: t(section.title) },
          onRender: function (item) {
            item.toggleClass('hide', !isEnabled());
          },
        });
      }

      section.keys.forEach(function (key) {
        if (!REGIONS[key]) return;

        Lampa.SettingsApi.addParam({
          component: COMPONENT,
          param: {
            name: COMPONENT + '_block_' + key,
            type: 'trigger',
            default: false,
          },
          field: { name: t('tmdb_cf_block_' + key) },
          onChange: onSettingsChanged,
          onRender: function (item) {
            item.toggleClass('hide', !isEnabled());
          },
        });
      });
    });

    Lampa.SettingsApi.addParam({
      component: COMPONENT,
      param: { name: COMPONENT + '_note', type: 'static' },
      field: { name: t('tmdb_cf_note') },
      onRender: function (item) {
        item.toggleClass('hide', !isEnabled());
      },
    });
  }

  function init() {
    addLang();
    addSettings();
    Lampa.Manifest.plugins = MANIFEST;

    Lampa.Listener.follow('request_secuses', onRequestSuccess);
    Lampa.Listener.follow('full', onFullCard);

    console.log(LOG, 'loaded', VERSION);
  }

  if (window.appready) init();
  else
    Lampa.Listener.follow('app', function (e) {
      if (e.type === 'ready') init();
    });
})();
