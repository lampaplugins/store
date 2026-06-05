(function () {
  'use strict';

  var config = {
    author: '@pavelpikta',
    version: '3.1.0',
    name: 'Torrent Styles MOD',
    pluginId: 'torrent_styles_mod'
  };

  // Apple HIG system colors (dark mode)
  var APPLE = {
    red: '#FF3B30',
    orange: '#FF9500',
    yellow: '#FFCC00',
    green: '#34C759',
    blue: '#007AFF'
  };

  // Thresholds â€” keep in sync with color matrix comments below
  var TH = {
    seeds: {
      danger_below: 5,
      good_from: 10,
      top_from: 20
    },
    bitrate: {
      warn_from: 50,
      orange_from: 75,
      danger_from: 100
    },
    size: {
      mid_from_gb: 50,
      high_from_gb: 100,
      top_from_gb: 200
    },
    peers: {
      high_from: 10
    },
    debounce_ms: 60
  };

  var TIER_CLASSES = {
    seeds: ['low-seeds', 'good-seeds', 'high-seeds'],
    bitrate: ['high-bitrate', 'mid-bitrate', 'very-high-bitrate'],
    grabs: ['high-grabs'],
    size: ['mid-size', 'high-size', 'top-size']
  };

  var FOCUS_SCOPES = [
    '.torrent-item ',
    '.torrent-item.focus ',
    '.torrent-item.selector.focus ',
    '.torrent-item.selector.hover '
  ];

  // Color matrix (Apple HIG heat scale):
  //
  // Seeds (more is better):  RED â†’ ORANGE â†’ YELLOW â†’ GREEN
  //   - <5: red | 5..9: orange | 10..19: yellow | >=20: green
  //
  // Peers (info only): BLUE (stronger fill when >10)
  //
  // Size (bigger is worse): GREEN â†’ YELLOW â†’ ORANGE â†’ RED
  //   - <50 GB | 50..<100 | 100..200 | >200
  //
  // Bitrate (heavier is worse): GREEN â†’ YELLOW â†’ ORANGE â†’ RED
  //   - <50 | 50..<75 | 75..100 | >100 Mbps

  function appleBadge(hex, opts) {
    opts = opts || {};
    var r = parseInt(hex.slice(1, 3), 16);
    var g = parseInt(hex.slice(3, 5), 16);
    var b = parseInt(hex.slice(5, 7), 16);
    var bgA = opts.bg != null ? opts.bg : 0.14;
    return {
      color: hex,
      '-webkit-text-fill-color': hex,
      opacity: '1',
      'background-color': 'rgba(' + r + ', ' + g + ', ' + b + ', ' + bgA + ')',
      border: '0.15em solid ' + hex,
      'box-shadow': 'none',
      'text-shadow': 'none'
    };
  }

  function tsExpandSelectors(selector) {
    return FOCUS_SCOPES.map(function (prefix) {
      return prefix + selector;
    }).join(', ');
  }

  function tsSetRule(styles, selector, props) {
    styles[tsExpandSelectors(selector)] = props;
  }

  function tsBitrateSelector(tierClass) {
    var suffix = tierClass ? '.' + tierClass : '';
    return '.torrent-item__bitrate > span.ts-bitrate' + suffix + ', .torrent-item__bitrate.bitrate > span.ts-bitrate' + suffix;
  }

  function tsSetBitrateBadge(styles, tierClass, hex, opts) {
    tsSetRule(styles, tsBitrateSelector(tierClass), appleBadge(hex, opts));
  }

  function buildStyles() {
    var styles = {};
    var badgeBase = tsExpandSelectors(
      tsBitrateSelector('') + ', ' +
      '.torrent-item__seeds > span.ts-seeds, ' +
      '.torrent-item__grabs > span.ts-grabs, ' +
      '.torrent-item__size.ts-size'
    );

    styles[badgeBase] = {
      'display': 'inline-flex',
      '-webkit-box-align': 'center',
      '-webkit-align-items': 'center',
      '-moz-box-align': 'center',
      '-ms-flex-align': 'center',
      'align-items': 'center',
      '-webkit-box-pack': 'center',
      '-webkit-justify-content': 'center',
      '-moz-box-pack': 'center',
      '-ms-flex-pack': 'center',
      'justify-content': 'center',
      'box-sizing': 'border-box',
      'min-height': '1.7em',
      'padding': '0.15em 0.45em',
      'border-radius': '0.5em',
      'font-weight': '700',
      'font-size': '0.9em',
      'line-height': '1',
      'white-space': 'nowrap',
      'vertical-align': 'middle',
      'font-variant-numeric': 'tabular-nums',
      opacity: '1'
    };

    tsSetRule(styles, '.torrent-item__bitrate, .torrent-item__grabs, .torrent-item__seeds', {
      'margin-right': '0.55em'
    });

    // Seeds (Ñ€Ð°Ð·Ð´Ð°ÑŽÑ‚)
    tsSetRule(styles, '.torrent-item__seeds > span.ts-seeds', appleBadge(APPLE.orange));
    tsSetRule(styles, '.torrent-item__seeds > span.ts-seeds.low-seeds', appleBadge(APPLE.red));
    tsSetRule(styles, '.torrent-item__seeds > span.ts-seeds.good-seeds', appleBadge(APPLE.yellow, { bg: 0.16 }));
    tsSetRule(styles, '.torrent-item__seeds > span.ts-seeds.high-seeds', appleBadge(APPLE.green, { bg: 0.18 }));

    // Peers (ÐºÐ°Ñ‡Ð°ÑŽÑ‚) â€” solid blue border matches text
    tsSetRule(styles, '.torrent-item__grabs > span.ts-grabs', appleBadge(APPLE.blue, { bg: 0.12 }));
    tsSetRule(styles, '.torrent-item__grabs > span.ts-grabs.high-grabs', appleBadge(APPLE.blue, { bg: 0.18 }));

    // Bitrate
    tsSetBitrateBadge(styles, '', APPLE.green, { bg: 0.12 });
    tsSetBitrateBadge(styles, 'high-bitrate', APPLE.yellow, { bg: 0.16 });
    tsSetBitrateBadge(styles, 'mid-bitrate', APPLE.orange, { bg: 0.18 });
    tsSetBitrateBadge(styles, 'very-high-bitrate', APPLE.red, { bg: 0.18 });

    // Size
    tsSetRule(styles, '.torrent-item__size.ts-size', Object.assign(appleBadge(APPLE.green, { bg: 0.12 }), {
      'font-weight': '700'
    }));
    tsSetRule(styles, '.torrent-item__size.ts-size.mid-size', appleBadge(APPLE.yellow, { bg: 0.16 }));
    tsSetRule(styles, '.torrent-item__size.ts-size.high-size', appleBadge(APPLE.orange, { bg: 0.18 }));
    tsSetRule(styles, '.torrent-item__size.ts-size.top-size', appleBadge(APPLE.red, { bg: 0.18 }));

    // Focus â€” single neutral ring + subtle zoom (no accent color, no double border)
    var focusRing = 'rgba(255, 255, 255, 0.2)';

    styles['.torrent-item'] = {
      transform: 'scale(1)',
      transition: 'transform 0.28s cubic-bezier(0.22, 0.61, 0.36, 1), filter 0.28s ease',
      'transform-origin': 'center center'
    };
    styles['.torrent-item.selector.focus'] = {
      outline: 'none',
      'box-shadow': 'none',
      transform: 'scale(1.025)',
      position: 'relative',
      'z-index': '2',
      filter: 'brightness(1.02)'
    };
    styles['.torrent-serial.selector.focus'] = {
      outline: 'none',
      'box-shadow': 'inset 0 0 0 0.16em ' + focusRing
    };
    styles['.torrent-file.selector.focus'] = {
      outline: 'none',
      'box-shadow': 'inset 0 0 0 0.16em ' + focusRing
    };
    styles['.torrent-item.focus::after'] = {
      border: '0.16em solid ' + focusRing,
      'box-shadow': 'none',
      'border-radius': '0.9em'
    };
    styles['.scroll__body'] = {
      margin: '5px'
    };

    return styles;
  }

  var styles = buildStyles();
  var tsUpdateTimer = null;
  var torrentRenderHooked = false;

  function injectStyles() {
    try {
      if (document.querySelector('[data-' + config.pluginId + '-styles="true"]')) return;

      var style = document.createElement('style');
      var css = Object.keys(styles)
        .map(function (selector) {
          var props = styles[selector];
          var rules = Object.keys(props)
            .map(function (prop) {
              return prop + ': ' + props[prop] + ' !important';
            })
            .join('; ');
          return selector + ' { ' + rules + ' }';
        })
        .join('\n');

      style.setAttribute('data-' + config.pluginId + '-styles', 'true');
      style.innerHTML = css;
      document.head.appendChild(style);
    } catch (e) {
      console.error(config.name, 'style injection error:', e);
    }
  }

  function scheduleUpdate(delayMs) {
    try {
      if (tsUpdateTimer) clearTimeout(tsUpdateTimer);
    } catch (e) { }

    var ms = typeof delayMs === 'number' ? delayMs : TH.debounce_ms;
    tsUpdateTimer = setTimeout(function () {
      tsUpdateTimer = null;
      updateTorrentStyles();
    }, ms);
  }

  function tsParseFloat(text) {
    var t = ((text || '') + '').trim();
    var m = t.match(/(\d+(?:[.,]\d+)?)/);
    return m ? (parseFloat(m[1].replace(',', '.')) || 0) : 0;
  }

  function tsParseInt(text) {
    var t = ((text || '') + '').trim();
    var v = parseInt(t, 10);
    return isNaN(v) ? 0 : v;
  }

  function tsHasNumber(text) {
    return /(\d+(?:[.,]\d+)?)/.test(((text || '') + '').trim());
  }

  function tsApplyTier(el, classesToClear, classToAdd) {
    try {
      for (var i = 0; i < classesToClear.length; i++) el.classList.remove(classesToClear[i]);
      if (classToAdd) el.classList.add(classToAdd);
    } catch (e) { }
  }

  function tsParseSizeToGb(text) {
    try {
      var t = ((text || '') + '').replace(/\u00A0/g, ' ').trim();
      var m = t.match(/(\d+(?:[.,]\d+)?)\s*(kb|mb|gb|tb|ÐºÐ±|Ð¼Ð±|Ð³Ð±|Ñ‚Ð±)/i);
      if (!m) return null;

      var num = parseFloat((m[1] || '0').replace(',', '.')) || 0;
      var unit = (m[2] || '').toLowerCase();

      if (unit === 'tb' || unit === 'Ñ‚Ð±') return num * 1024;
      if (unit === 'gb' || unit === 'Ð³Ð±') return num;
      if (unit === 'mb' || unit === 'Ð¼Ð±') return num / 1024;
      if (unit === 'kb' || unit === 'ÐºÐ±') return num / (1024 * 1024);
      return 0;
    } catch (e) {
      return null;
    }
  }

  function tsResolveTorrentNode(e) {
    if (!e) return null;
    var raw = e.item || e.element;
    if (!raw) return null;
    if (raw.nodeType === 1) return raw;
    if (raw[0]) return raw[0];
    if (raw.get && typeof raw.get === 'function') return raw.get(0);
    return null;
  }

  function tsSeedTier(value) {
    if (value < TH.seeds.danger_below) return 'low-seeds';
    if (value >= TH.seeds.top_from) return 'high-seeds';
    if (value >= TH.seeds.good_from) return 'good-seeds';
    return '';
  }

  function tsBitrateTier(value) {
    if (value > TH.bitrate.danger_from) return 'very-high-bitrate';
    if (value >= TH.bitrate.orange_from) return 'mid-bitrate';
    if (value >= TH.bitrate.warn_from) return 'high-bitrate';
    return '';
  }

  function tsSizeTier(gb) {
    if (gb > TH.size.top_from_gb) return 'top-size';
    if (gb >= TH.size.high_from_gb) return 'high-size';
    if (gb >= TH.size.mid_from_gb) return 'mid-size';
    return '';
  }

  function updateTorrentStyles(root) {
    try {
      var scope = root && typeof root.querySelectorAll === 'function' ? root : document;

      scope.querySelectorAll('.torrent-item__seeds span').forEach(function (span) {
        if (!tsHasNumber(span.textContent)) return;
        span.classList.add('ts-seeds');
        tsApplyTier(span, TIER_CLASSES.seeds, tsSeedTier(tsParseInt(span.textContent)));
      });

      scope.querySelectorAll('.torrent-item__bitrate span').forEach(function (span) {
        if (!tsHasNumber(span.textContent)) return;
        span.classList.add('ts-bitrate');
        tsApplyTier(span, TIER_CLASSES.bitrate, tsBitrateTier(tsParseFloat(span.textContent)));
      });

      scope.querySelectorAll('.torrent-item__grabs span').forEach(function (span) {
        if (!tsHasNumber(span.textContent)) return;
        span.classList.add('ts-grabs');
        tsApplyTier(
          span,
          TIER_CLASSES.grabs,
          tsParseInt(span.textContent) > TH.peers.high_from ? 'high-grabs' : ''
        );
      });

      scope.querySelectorAll('.torrent-item__size').forEach(function (el) {
        el.classList.add('ts-size');
        var gb = tsParseSizeToGb(el.textContent || '');
        tsApplyTier(el, TIER_CLASSES.size, gb === null ? '' : tsSizeTier(gb));
      });
    } catch (e) {
      console.error(config.name, 'torrent update error:', e);
    }
  }

  /**
   * Lampa: Listener.send('torrent', { type: 'render', element, item })
   * from src/components/torrents.js
   */
  function attachTorrentRenderHook() {
    if (torrentRenderHooked) return;
    if (typeof Lampa === 'undefined' || !Lampa.Listener || typeof Lampa.Listener.follow !== 'function') return;

    torrentRenderHooked = true;

    Lampa.Listener.follow('torrent', function (e) {
      if (!e || e.type !== 'render') return;
      var node = tsResolveTorrentNode(e);
      if (node) updateTorrentStyles(node);
    });

    scheduleUpdate(0);
  }

  function registerPlugin() {
    try {
      if (typeof Lampa !== 'undefined') {
        Lampa.Manifest = Lampa.Manifest || {};
        Lampa.Manifest.plugins = Lampa.Manifest.plugins || {};

        Lampa.Manifest.plugins[config.pluginId] = {
          type: 'other',
          name: config.name,
          version: config.version,
          description: 'Ð”Ð¾Ð¿Ð¾Ð»Ð½Ð¸Ñ‚ÐµÐ»ÑŒÐ½Ñ‹Ðµ ÑÑ‚Ð¸Ð»Ð¸ Ð´Ð»Ñ ÐºÐ°Ñ€Ñ‚Ð¾Ñ‡ÐµÐº Ñ‚Ð¾Ñ€Ñ€ÐµÐ½Ñ‚Ð¾Ð².'
        };
      }
    } catch (e) {
      console.error(config.name, 'register error:', e);
    } finally {
      window['plugin_' + config.pluginId + '_ready'] = true;
    }
  }

  function onAppReady() {
    attachTorrentRenderHook();
    registerPlugin();
    scheduleUpdate(200);
  }

  function init() {
    injectStyles();

    if (window.appready) {
      onAppReady();
    } else if (typeof Lampa !== 'undefined' && Lampa.Listener && typeof Lampa.Listener.follow === 'function') {
      Lampa.Listener.follow('app', function (e) {
        if (e.type === 'ready') onAppReady();
      });
    } else {
      setTimeout(onAppReady, 500);
    }

    console.log(config.name, 'loaded, version:', config.version);
  }

  init();

})();
