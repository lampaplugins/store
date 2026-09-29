(function () {
  'use strict';

  if (window.__dso_torrent_styles_loaded) return;
  window.__dso_torrent_styles_loaded = true;

  var LOG_TAG = 'DSO Torrent Styles';

  var config = {
    version: '1.2.1',
    name: 'Torrent Styles',
    pluginId: 'dso_torrent_styles',
    settingsComponent: 'dso_torrent_styles_settings'
  };

  var defaults = {
    coloredBadges: true,
    enhancedFocus: true,
    metricStyle: 'both'
  };

  var translations = {
    settings_title: { ru: 'Torrent Styles', en: 'Torrent Styles' },
    settings_colored_badges: { ru: 'Цветные метки', en: 'Colored badges' },
    settings_colored_badges_desc: {
      ru: 'Apple HIG бейджи для сидов, битрейта, размера и пиров',
      en: 'Apple HIG tier badges for seeds, bitrate, size, and peers'
    },
    settings_metric_style: { ru: 'Подписи метрик', en: 'Metric labels' },
    settings_metric_style_desc: {
      ru: 'Текст, иконки с текстом или только иконки для битрейта, сидов и пиров',
      en: 'Text, icons with text, or icons only for bitrate, seeds, and peers'
    },
    settings_metric_text: { ru: 'Текст', en: 'Text' },
    settings_metric_both: { ru: 'Иконки и текст', en: 'Icons and text' },
    settings_metric_icons: { ru: 'Иконки', en: 'Icons' },
    settings_enhanced_focus: { ru: 'Усиленный фокус карточек', en: 'Enhanced card focus' },
    settings_enhanced_focus_desc: {
      ru: 'Лёгкий zoom на карточках; обводка — нативная белая Lampa',
      en: 'Subtle zoom on cards; focus ring stays native Lampa white'
    }
  };

  // Lucide (ISC). circle-gauge fills the box; the semicircle gauge sinks to the bottom at 1em.
  function lucideIcon(paths) {
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" class="ts-ico" aria-hidden="true">' +
      paths +
      '</svg>'
    );
  }

  var METRIC_FIELDS = [
    { suffix: '__seeds', icon: 'seeds' },
    { suffix: '__grabs', icon: 'grabs' },
    { suffix: '__bitrate', icon: 'bitrate' }
  ];

  var METRIC_SVGS = {
    seeds: lucideIcon('<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>'),
    grabs: lucideIcon('<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>'),
    bitrate: lucideIcon(
      '<path d="M15.6 2.7a10 10 0 1 0 5.7 5.7"/><circle cx="12" cy="12" r="2"/><path d="M13.4 10.6 19 5"/>'
    )
  };

  // Apple HIG system colors (dark mode)
  var APPLE = {
    red: '#FF3B30',
    orange: '#FF9500',
    yellow: '#FFCC00',
    green: '#34C759',
    blue: '#007AFF',
    white: '#EBEBF5'
  };

  // Thresholds — keep in sync with color matrix comments below
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

  var BADGE_MARKER_CLASSES = ['ts-seeds', 'ts-bitrate', 'ts-grabs', 'ts-size'];

  var FOCUS_SCOPES = [
    '.torrent-list .torrent-item ',
    '.torrent-list .torrent-item.focus ',
    '.torrent-list .torrent-item.selector.focus ',
    '.torrent-list .torrent-item.selector.hover '
  ];

  var tsUpdateTimer = null;
  var applySettingsTimer = null;
  var torrentRenderHooked = false;
  var settingsRegistered = false;

  function t(key) {
    var lang =
      typeof Lampa !== 'undefined' && Lampa.Storage
        ? Lampa.Storage.get('language', 'ru')
        : 'ru';
    var entry = translations[key];
    return (entry && (entry[lang] || entry.ru)) || key;
  }

  function translate(key) {
    if (typeof Lampa !== 'undefined' && Lampa.Lang && typeof Lampa.Lang.translate === 'function') {
      return Lampa.Lang.translate(config.pluginId + '_' + key) || t(key);
    }
    return t(key);
  }

  function settingKey(name) {
    return config.pluginId + '_' + name;
  }

  function readSetting(name) {
    var key = settingKey(name);
    var fallback = defaults[name];

    if (!settingsRegistered) return fallback;

    if (typeof Lampa !== 'undefined' && Lampa.Storage && typeof Lampa.Storage.field === 'function') {
      return Lampa.Storage.field(key);
    }

    if (typeof Lampa !== 'undefined' && Lampa.Storage && typeof Lampa.Storage.get === 'function') {
      return Lampa.Storage.get(key, fallback);
    }

    return fallback;
  }

  function isColoredBadges() {
    return readSetting('coloredBadges') !== false;
  }

  function isEnhancedFocus() {
    return readSetting('enhancedFocus') !== false;
  }

  function metricStyle() {
    var value = readSetting('metricStyle');
    if (value === 'both' || value === 'icons') return value;
    return 'text';
  }

  function isTorrentItemNode(node) {
    return !!(node && node.nodeType === 1 && node.classList && node.classList.contains('torrent-item'));
  }

  function metricSelector(suffix, root) {
    if (isTorrentItemNode(root)) return '.torrent-item' + suffix;
    return '.torrent-list .torrent-item' + suffix;
  }

  function queryMetrics(root, suffix) {
    var scope = root && typeof root.querySelectorAll === 'function' ? root : document;
    var selector = metricSelector(suffix, scope === document ? document : scope);
    return scope.querySelectorAll(selector);
  }

  function appleBadge(hex, opts) {
    opts = opts || {};
    var r = parseInt(hex.slice(1, 3), 16);
    var g = parseInt(hex.slice(3, 5), 16);
    var b = parseInt(hex.slice(5, 7), 16);
    var bgA = opts.bg != null ? opts.bg : 0.12;
    return {
      color: hex,
      '-webkit-text-fill-color': hex,
      opacity: '1',
      'background-color': 'rgba(' + r + ', ' + g + ', ' + b + ', ' + bgA + ')',
      border: '0.1em solid ' + hex,
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
    return (
      '.torrent-item__bitrate > span.ts-bitrate' +
      suffix +
      ', .torrent-item__bitrate.bitrate > span.ts-bitrate' +
      suffix
    );
  }

  function tsSetBitrateBadge(styles, tierClass, hex, opts) {
    tsSetRule(styles, tsBitrateSelector(tierClass), appleBadge(hex, opts));
  }

  function buildBadgeStyles(styles) {
    var badgeBase = tsExpandSelectors(
      tsBitrateSelector('') +
      ', ' +
      '.torrent-item__seeds > span.ts-seeds, ' +
      '.torrent-item__grabs > span.ts-grabs, ' +
      '.torrent-item__size.ts-size'
    );

    styles[badgeBase] = {
      display: 'inline-flex',
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
      padding: '0.15em 0.45em',
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

    tsSetRule(styles, '.torrent-item__seeds > span.ts-seeds', appleBadge(APPLE.orange));
    tsSetRule(styles, '.torrent-item__seeds > span.ts-seeds.low-seeds', appleBadge(APPLE.red));
    tsSetRule(styles, '.torrent-item__seeds > span.ts-seeds.good-seeds', appleBadge(APPLE.yellow, { bg: 0.14 }));
    tsSetRule(styles, '.torrent-item__seeds > span.ts-seeds.high-seeds', appleBadge(APPLE.green, { bg: 0.16 }));

    tsSetRule(styles, '.torrent-item__grabs > span.ts-grabs', appleBadge(APPLE.blue, { bg: 0.1 }));
    tsSetRule(styles, '.torrent-item__grabs > span.ts-grabs.high-grabs', appleBadge(APPLE.blue, { bg: 0.16 }));

    tsSetBitrateBadge(styles, '', APPLE.green, { bg: 0.1 });
    tsSetBitrateBadge(styles, 'high-bitrate', APPLE.yellow, { bg: 0.14 });
    tsSetBitrateBadge(styles, 'mid-bitrate', APPLE.orange, { bg: 0.16 });
    tsSetBitrateBadge(styles, 'very-high-bitrate', APPLE.red, { bg: 0.16 });

    tsSetRule(
      styles,
      '.torrent-item__size.ts-size',
      Object.assign(appleBadge(APPLE.green, { bg: 0.1 }), {
        'font-weight': '700'
      })
    );
    tsSetRule(styles, '.torrent-item__size.ts-size.mid-size', appleBadge(APPLE.yellow, { bg: 0.14 }));
    tsSetRule(styles, '.torrent-item__size.ts-size.high-size', appleBadge(APPLE.orange, { bg: 0.16 }));
    tsSetRule(styles, '.torrent-item__size.ts-size.top-size', appleBadge(APPLE.red, { bg: 0.16 }));
  }

  function buildFocusStyles(styles) {
    // Zoom + brightness only — ::after ring stays Lampa native (0.3em solid #fff)
    styles['.torrent-list .torrent-item'] = {
      transform: 'scale(1)',
      transition: 'transform 0.28s cubic-bezier(0.22, 0.61, 0.36, 1), filter 0.28s ease',
      'transform-origin': 'center center'
    };
    styles['.torrent-list .torrent-item.selector.focus'] = {
      transform: 'scale(1.02)',
      position: 'relative',
      'z-index': '2',
      filter: 'brightness(1.04)'
    };
  }

  function iconColor(styles, selector, hex) {
    styles[selector] = {
      color: hex,
      '-webkit-text-fill-color': hex
    };
  }

  function buildIconStyles(styles) {
    // Icons-only: glyph stays inside the number pill.
    styles['.ts-metric--icons .ts-ico'] = {
      display: 'block',
      width: '1em',
      height: '1em',
      'margin-right': '0.28em',
      flex: 'none'
    };
    styles['.ts-metric--icons > .ts-label'] = {
      display: 'none'
    };

    // Text + icons: colored glyph, then the label, then the number pill.
    styles[
      '.torrent-item__bitrate.ts-metric--both, .torrent-item__grabs.ts-metric--both, .torrent-item__seeds.ts-metric--both'
    ] = {
      display: 'inline-flex',
      '-webkit-box-align': 'center',
      '-webkit-align-items': 'center',
      'align-items': 'center',
      'vertical-align': 'middle'
    };
    styles['.ts-metric--both > .ts-ico'] = {
      display: 'block',
      width: '1.15em',
      height: '1.15em',
      margin: '0 0.4em 0 0',
      flex: 'none'
    };
    styles['.ts-metric--both > .ts-label'] = {
      'line-height': '1',
      'margin-right': '0.35em'
    };
    // Lampa paints every direct span in the metric as a chip. The label must stay plain text.
    styles[
      '.torrent-item__bitrate > .ts-label, .torrent-item__grabs > .ts-label, .torrent-item__seeds > .ts-label'
    ] = {
      background: 'none',
      'background-color': 'transparent',
      border: '0',
      padding: '0',
      'min-width': '0',
      'border-radius': '0',
      'box-shadow': 'none',
      color: 'inherit',
      '-webkit-text-fill-color': 'inherit',
      'text-align': 'left'
    };

    iconColor(styles, '.ts-metric--both > .ts-ico.ts-seeds', APPLE.orange);
    iconColor(styles, '.ts-metric--both > .ts-ico.ts-seeds.low-seeds', APPLE.red);
    iconColor(styles, '.ts-metric--both > .ts-ico.ts-seeds.good-seeds', APPLE.yellow);
    iconColor(styles, '.ts-metric--both > .ts-ico.ts-seeds.high-seeds', APPLE.green);
    iconColor(styles, '.ts-metric--both > .ts-ico.ts-grabs', APPLE.blue);
    iconColor(styles, '.ts-metric--both > .ts-ico.ts-grabs.high-grabs', APPLE.blue);
    iconColor(styles, '.ts-metric--both > .ts-ico.ts-bitrate', APPLE.green);
    iconColor(styles, '.ts-metric--both > .ts-ico.ts-bitrate.high-bitrate', APPLE.yellow);
    iconColor(styles, '.ts-metric--both > .ts-ico.ts-bitrate.mid-bitrate', APPLE.orange);
    iconColor(styles, '.ts-metric--both > .ts-ico.ts-bitrate.very-high-bitrate', APPLE.red);
  }

  function buildStyles(options) {
    options = options || {};
    var styles = {};

    if (options.badges) buildBadgeStyles(styles);
    if (options.focus) buildFocusStyles(styles);
    if (options.icons) buildIconStyles(styles);

    return styles;
  }

  function stylesToCss(styles) {
    return Object.keys(styles)
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
  }

  function injectStyles() {
    try {
      var attr = 'data-' + config.pluginId + '-styles';
      var existing = document.querySelector('[' + attr + '="true"]');
      if (existing) existing.remove();

      var styles = buildStyles({
        badges: isColoredBadges(),
        focus: isEnhancedFocus(),
        icons: metricStyle() !== 'text'
      });

      if (!Object.keys(styles).length) return;

      var style = document.createElement('style');
      style.setAttribute(attr, 'true');
      style.innerHTML = stylesToCss(styles);
      document.head.appendChild(style);
    } catch (e) {
      console.error(LOG_TAG, 'style injection error:', e);
    }
  }

  function allTierClasses() {
    var out = [];
    Object.keys(TIER_CLASSES).forEach(function (key) {
      out = out.concat(TIER_CLASSES[key]);
    });
    return out;
  }

  function stripClassesFromNodes(nodes, tierClasses) {
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var j;
      for (j = 0; j < BADGE_MARKER_CLASSES.length; j++) el.classList.remove(BADGE_MARKER_CLASSES[j]);
      for (j = 0; j < tierClasses.length; j++) el.classList.remove(tierClasses[j]);
    }
  }

  function stripBadgeClasses(root) {
    try {
      var tierClasses = allTierClasses();

      stripClassesFromNodes(queryMetrics(root, '__seeds span'), tierClasses);
      stripClassesFromNodes(queryMetrics(root, '__bitrate span'), tierClasses);
      stripClassesFromNodes(queryMetrics(root, '__grabs span'), tierClasses);
      stripClassesFromNodes(queryMetrics(root, '__size'), tierClasses);
    } catch (e) {
      console.error(LOG_TAG, 'strip badges error:', e);
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
    return m ? parseFloat(m[1].replace(',', '.')) || 0 : 0;
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
      var m = t.match(/(\d+(?:[.,]\d+)?)\s*(kb|mb|gb|tb|кб|мб|гб|тб)/i);
      if (!m) return null;

      var num = parseFloat((m[1] || '0').replace(',', '.')) || 0;
      var unit = (m[2] || '').toLowerCase();

      if (unit === 'tb' || unit === 'тб') return num * 1024;
      if (unit === 'gb' || unit === 'гб') return num;
      if (unit === 'mb' || unit === 'мб') return num / 1024;
      if (unit === 'kb' || unit === 'кб') return num / (1024 * 1024);
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

  function directLabel(container) {
    var child = container.firstChild;
    while (child) {
      if (child.nodeType === 1 && child.classList && child.classList.contains('ts-label')) return child;
      child = child.nextSibling;
    }
    return null;
  }

  function valueSpan(container) {
    var spans = container.getElementsByTagName('span');
    for (var i = 0; i < spans.length; i++) {
      if (!spans[i].classList.contains('ts-label')) return spans[i];
    }
    return null;
  }

  function wrapLabel(container) {
    if (directLabel(container)) return;
    var child = container.firstChild;
    while (child) {
      var next = child.nextSibling;
      if (child.nodeType === 3 && ((child.textContent || '').replace(/\u00A0/g, ' ').trim())) {
        var wrap = document.createElement('span');
        wrap.className = 'ts-label';
        container.insertBefore(wrap, child);
        wrap.appendChild(child);
      }
      child = next;
    }
  }

  function unwrapLabel(container) {
    var label = directLabel(container);
    if (!label || !label.parentNode) return;
    var parent = label.parentNode;
    while (label.firstChild) parent.insertBefore(label.firstChild, label);
    parent.removeChild(label);
  }

  function ensureIcon(parent, svgHtml) {
    var existing = null;
    var child = parent.firstChild;
    while (child) {
      if (child.nodeType === 1 && child.classList && child.classList.contains('ts-ico')) {
        existing = child;
        break;
      }
      child = child.nextSibling;
    }
    if (existing) return existing;
    parent.insertAdjacentHTML('afterbegin', svgHtml);
    return parent.firstChild;
  }

  function removeIcons(el) {
    if (!el || !el.querySelectorAll) return;
    var icons = el.querySelectorAll('.ts-ico');
    for (var i = icons.length - 1; i >= 0; i--) {
      if (icons[i].parentNode) icons[i].parentNode.removeChild(icons[i]);
    }
  }

  function clearMetricMode(container) {
    container.classList.remove('ts-metric--both', 'ts-metric--icons');
  }

  function iconPaintClasses() {
    return ['ts-seeds', 'ts-bitrate', 'ts-grabs'].concat(allTierClasses());
  }

  function clearIconPaint(ico) {
    var classes = iconPaintClasses();
    for (var i = 0; i < classes.length; i++) ico.classList.remove(classes[i]);
  }

  function directIcon(container) {
    var child = container.firstChild;
    while (child) {
      if (child.nodeType === 1 && child.classList && child.classList.contains('ts-ico')) return child;
      child = child.nextSibling;
    }
    return null;
  }

  function syncBothIcon(container, span, marker) {
    var ico = directIcon(container);
    if (!ico) return;
    clearIconPaint(ico);
    if (!span || !isColoredBadges()) return;
    ico.classList.add(marker);
    var tiers = allTierClasses();
    for (var i = 0; i < tiers.length; i++) {
      if (span.classList.contains(tiers[i])) ico.classList.add(tiers[i]);
    }
  }

  function applyMetricIcons(root, mode) {
    METRIC_FIELDS.forEach(function (field) {
      queryMetrics(root, field.suffix).forEach(function (container) {
        var span = valueSpan(container);
        if (mode === 'text') {
          removeIcons(container);
          unwrapLabel(container);
          clearMetricMode(container);
          return;
        }
        wrapLabel(container);
        removeIcons(container);
        if (mode === 'icons') {
          if (span) ensureIcon(span, METRIC_SVGS[field.icon]);
        } else {
          ensureIcon(container, METRIC_SVGS[field.icon]);
        }
        clearMetricMode(container);
        container.classList.add(mode === 'icons' ? 'ts-metric--icons' : 'ts-metric--both');
      });
    });
  }

  function updateTorrentStyles(root) {
    try {
      applyMetricIcons(root, metricStyle());

      if (!isColoredBadges()) {
        stripBadgeClasses(root);
        return;
      }

      queryMetrics(root, '__seeds span').forEach(function (span) {
        if (span.classList.contains('ts-label')) return;
        if (!tsHasNumber(span.textContent)) return;
        span.classList.add('ts-seeds');
        tsApplyTier(span, TIER_CLASSES.seeds, tsSeedTier(tsParseInt(span.textContent)));
        syncBothIcon(span.parentNode, span, 'ts-seeds');
      });

      queryMetrics(root, '__bitrate span').forEach(function (span) {
        if (span.classList.contains('ts-label')) return;
        if (!tsHasNumber(span.textContent)) return;
        span.classList.add('ts-bitrate');
        tsApplyTier(span, TIER_CLASSES.bitrate, tsBitrateTier(tsParseFloat(span.textContent)));
        syncBothIcon(span.parentNode, span, 'ts-bitrate');
      });

      queryMetrics(root, '__grabs span').forEach(function (span) {
        if (span.classList.contains('ts-label')) return;
        if (!tsHasNumber(span.textContent)) return;
        span.classList.add('ts-grabs');
        tsApplyTier(
          span,
          TIER_CLASSES.grabs,
          tsParseInt(span.textContent) > TH.peers.high_from ? 'high-grabs' : ''
        );
        syncBothIcon(span.parentNode, span, 'ts-grabs');
      });

      queryMetrics(root, '__size').forEach(function (el) {
        el.classList.add('ts-size');
        var gb = tsParseSizeToGb(el.textContent || '');
        tsApplyTier(el, TIER_CLASSES.size, gb === null ? '' : tsSizeTier(gb));
      });
    } catch (e) {
      console.error(LOG_TAG, 'torrent update error:', e);
    }
  }

  function applySettingsNow() {
    injectStyles();
    scheduleUpdate(0);
  }

  function applySettings() {
    try {
      if (applySettingsTimer) clearTimeout(applySettingsTimer);
    } catch (e) { }

    applySettingsTimer = setTimeout(function () {
      applySettingsTimer = null;
      applySettingsNow();
    }, 0);
  }

  function onSettingChange() {
    applySettings();
  }

  function addTranslations() {
    if (typeof Lampa === 'undefined' || !Lampa.Lang || typeof Lampa.Lang.add !== 'function') return;

    var payload = {};
    Object.keys(translations).forEach(function (key) {
      payload[config.pluginId + '_' + key] = translations[key];
    });
    Lampa.Lang.add(payload);
  }

  function addSettings() {
    if (settingsRegistered) return;
    if (typeof Lampa === 'undefined' || !Lampa.SettingsApi) return;

    settingsRegistered = true;

    Lampa.SettingsApi.addComponent({
      component: config.settingsComponent,
      name: 'Torrent Styles',
      icon:
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">' +
        '<rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" stroke-width="1.5"/>' +
        '<path d="M7 10h6M7 13h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>' +
        '<circle cx="17" cy="12" r="2" stroke="currentColor" stroke-width="1.5"/>' +
        '</svg>'
    });

    Lampa.SettingsApi.addParam({
      component: config.settingsComponent,
      param: { name: config.pluginId + '_title', type: 'title' },
      field: { name: translate('settings_title') }
    });

    Lampa.SettingsApi.addParam({
      component: config.settingsComponent,
      param: {
        name: settingKey('coloredBadges'),
        type: 'trigger',
        default: defaults.coloredBadges
      },
      field: {
        name: translate('settings_colored_badges'),
        description: translate('settings_colored_badges_desc')
      },
      onChange: onSettingChange
    });

    Lampa.SettingsApi.addParam({
      component: config.settingsComponent,
      param: {
        name: settingKey('metricStyle'),
        type: 'select',
        default: defaults.metricStyle,
        values: {
          text: translate('settings_metric_text'),
          both: translate('settings_metric_both'),
          icons: translate('settings_metric_icons')
        }
      },
      field: {
        name: translate('settings_metric_style'),
        description: translate('settings_metric_style_desc')
      },
      onChange: onSettingChange
    });

    Lampa.SettingsApi.addParam({
      component: config.settingsComponent,
      param: {
        name: settingKey('enhancedFocus'),
        type: 'trigger',
        default: defaults.enhancedFocus
      },
      field: {
        name: translate('settings_enhanced_focus'),
        description: translate('settings_enhanced_focus_desc')
      },
      onChange: onSettingChange
    });
  }

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
          component: config.settingsComponent,
          description:
            'Стили списка торрентов: цветовые бейджи, иконки метрик и фокус карточек. Модалка «Файлы» — нативный фокус Lampa.'
        };
      }
    } catch (e) {
      console.error(LOG_TAG, 'register error:', e);
    }
  }

  function onAppReady() {
    addTranslations();
    addSettings();
    attachTorrentRenderHook();
    registerPlugin();
    applySettingsNow();
  }

  function init() {
    if (window.appready) {
      onAppReady();
    } else if (typeof Lampa !== 'undefined' && Lampa.Listener && typeof Lampa.Listener.follow === 'function') {
      Lampa.Listener.follow('app', function (e) {
        if (e.type === 'ready') onAppReady();
      });
    } else {
      setTimeout(onAppReady, 500);
    }

    console.log(LOG_TAG, 'loaded, version:', config.version);
  }

  init();
})();
