(function () {
  'use strict';

  // ============================================================================
  // PLUGIN METADATA
  // ============================================================================
  var PLUGIN_VERSION = '4.0.0';
  var PLUGIN_AUTHOR = '@pavelpikta';

  // Plugin Icon (Emerald gradient)
  var PLUGIN_ICON = '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="emerald_grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#43cea2"/><stop offset="100%" style="stop-color:#185a9d"/></linearGradient></defs><rect x="3" y="3" width="18" height="18" rx="3" stroke="url(#emerald_grad)" stroke-width="2"/><rect x="6" y="6" width="5" height="5" rx="1" fill="url(#emerald_grad)"/><rect x="13" y="6" width="5" height="3" rx="1" fill="url(#emerald_grad)" opacity="0.7"/><rect x="6" y="13" width="12" height="2" rx="1" fill="url(#emerald_grad)" opacity="0.5"/><rect x="6" y="17" width="8" height="2" rx="1" fill="url(#emerald_grad)" opacity="0.3"/></svg>';

  // ============================================================================
  // UTILITIES MODULE
  // ============================================================================
  var Utils = {
    log: function () {
      if (!State.debug) return;
      var args = Array.prototype.slice.call(arguments);
      args.unshift('[INMOD]');
      console.log.apply(console, args);
    },

    plural: function (number, one, two, five) {
      var n = Math.abs(number) % 100;
      if (n >= 5 && n <= 20) return five;
      n %= 10;
      if (n === 1) return one;
      if (n >= 2 && n <= 4) return two;
      return five;
    },

    translate: function (key) {
      return Lampa.Lang.translate(key);
    },

    removeStyleById: function (id) {
      var el = document.getElementById(id);
      if (el && el.parentNode) el.parentNode.removeChild(el);
    },

    addStyle: function (id, css) {
      Utils.removeStyleById(id);
      var style = document.createElement('style');
      style.id = id;
      style.textContent = css;
      document.head.appendChild(style);
    },

    safeDisconnect: function (observer) {
      if (!observer) return;
      try { observer.disconnect(); } catch (e) { }
    },

    safeClearInterval: function (id) {
      if (!id) return;
      try { clearInterval(id); } catch (e) { }
      try { clearTimeout(id); } catch (e2) { }
    },

    resetInlineStyles: function ($els) {
      try {
        $els.each(function () {
          $(this).removeAttr('style');
        });
      } catch (e) { }
    },

    supportsCSSAnimation: function () {
      var style = document.createElement('div').style;
      return 'animation' in style ||
        'webkitAnimation' in style ||
        'mozAnimation' in style ||
        'oAnimation' in style;
    },

    // Throttle function to limit execution frequency
    throttle: function (func, limit) {
      var inThrottle;
      return function () {
        var args = arguments;
        var context = this;
        if (!inThrottle) {
          func.apply(context, args);
          inThrottle = true;
          setTimeout(function () { inThrottle = false; }, limit);
        }
      };
    }
  };

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  var State = {
    debug: false,
    started: false,
    settings: {
      enabled: true,
      theme: 'emerald',
      seasons_info_mode: 'aired',
      label_position: 'top-right',
      patch_online_icons: true,
      show_movie_type: true,
      colored_ratings: true,
      colored_elements: true,
      use_custom_styles: true,
      show_online_buttons: true,
      torrent_styles: true,
      force_lampa_settings: false
    },
    observers: {},
    intervals: {},
    eventsFollowed: false
  };

  function isEnabled() {
    return !!State.settings.enabled;
  }

  function getActiveFullStart$() {
    try {
      var active = Lampa.Activity.active();
      if (!active || !active.activity || typeof active.activity.render !== 'function') return null;
      var $render = $(active.activity.render());
      var $full = $render.find('.full-start-new');
      if (!$full.length) $full = $render.filter('.full-start-new');
      return $full.length ? $full : null;
    } catch (e) {
      return null;
    }
  }

  function refreshCardsInRoot(root) {
    if (!isEnabled()) return;
    var $root = root && root.jquery ? root : $(root || document.body);
    if (!$root || !$root.length) return;
    $root.find('.card').each(function () {
      if (State.settings.use_custom_styles) CardEnhancer.processCard(this);
      if (State.settings.show_movie_type) MovieTypeLabels.addToCard(this);
    });
  }

  function scheduleOnlineIconsPatch() {
    clearTimeout(State.intervals.onlineIconsDebounce);
    State.intervals.onlineIconsDebounce = setTimeout(function () {
      if (!isEnabled() || !State.settings.patch_online_icons) return;
      try {
        var active = Lampa.Activity.active();
        if (active && active.activity && active.activity.render) {
          OnlineIcons.patchButtonsInRoot(active.activity.render());
        }
      } catch (e) { }
      try {
        OnlineIcons.patchButtonsInRoot(document.body);
      } catch (e2) { }
    }, 0);
  }

  function scheduleButtonsManagerRefresh() {
    clearTimeout(State.intervals.buttonsDebounce);
    State.intervals.buttonsDebounce = setTimeout(function () {
      if (!isEnabled() || !State.settings.show_online_buttons) return;
      var $full = getActiveFullStart$();
      if ($full && $full.length) ButtonsManager.processCard($full);
    }, 5);
  }

  function scheduleRatingsRefresh() {
    clearTimeout(State.intervals.ratingsDebounce);
    State.intervals.ratingsDebounce = setTimeout(function () {
      if (isEnabled() && State.settings.colored_ratings) ColoredRatings.update();
    }, 80);
  }

  function scheduleColoredElementsRefresh($scope) {
    clearTimeout(State.intervals.elementsDebounce);
    State.intervals.elementsDebounce = setTimeout(function () {
      if (!isEnabled() || !State.settings.colored_elements) return;
      try {
        var r = $scope;
        if ((!r || !r.length) && Lampa.Activity.active() && Lampa.Activity.active().activity) {
          r = $(Lampa.Activity.active().activity.render());
        }
        if (r && r.length) ColoredElements.updateAll(r);
        else ColoredElements.updateAll(document.body);
      } catch (e) { }
    }, 40);
  }

  function scheduleTorrentStylesSweep() {
    clearTimeout(State.intervals.torrentDebounce);
    State.intervals.torrentDebounce = setTimeout(function () {
      if (isEnabled() && State.settings.torrent_styles && typeof TorrentStyles !== 'undefined' && TorrentStyles.update) {
        TorrentStyles.update();
      }
    }, 0);
  }

  // ============================================================================
  // TRANSLATIONS
  // ============================================================================
  function registerTranslations() {
    Lampa.Lang.add({
      maxsm_themes: {
        ru: "Темы оформления",
        en: "Interface themes",
        uk: "Теми оформлення"
      },
      maxsm_themes_tvcaption: {
        ru: "СЕРИАЛ",
        en: "TV SERIES",
        uk: "СЕРІАЛ"
      },
      inmod_title: {
        ru: "Интерфейс Мод",
        en: "Interface Mod"
      },
      inmod_use_styles: {
        ru: "Кастомные стили",
        en: "Custom styles"
      },
      inmod_use_styles_descr: {
        ru: "Применять улучшенные стили к карточкам и элементам",
        en: "Apply improved styles to cards and elements"
      },
      inmod_show_online_buttons: {
        ru: "Все источники отдельно",
        en: "Show all sources separately"
      },
      inmod_show_online_buttons_descr: {
        ru: "Торренты, трейлеры и онлайн-провайдеры показываются как отдельные кнопки вместо меню \"Смотрю\"",
        en: "Torrents, trailers and online providers shown as separate buttons instead of \"Watch\" menu"
      },
      inmod_torrent_styles: {
        ru: "Стили торрентов",
        en: "Torrent styles"
      },
      inmod_torrent_styles_descr: {
        ru: "Цветные бейджи для сидов, размера, битрейта в списке торрентов",
        en: "Colored badges for seeds, size, bitrate in torrent list"
      },
      inmod_force_settings: {
        ru: "Принудительные настройки",
        en: "Force Lampa settings"
      },
      inmod_force_settings_descr: {
        ru: "Применять рекомендованные настройки Lampa для этой темы",
        en: "Apply recommended Lampa settings for this theme"
      },
      inmod_movie: { ru: "Фильм", en: "Movie", uk: "Фільм" },
      inmod_serial: { ru: "Сериал", en: "Serial", uk: "Серіал" },
      inmod_status_ended: { ru: "Завершен", en: "Ended", uk: "Завершений" },
      inmod_status_canceled: { ru: "Отменен", en: "Canceled", uk: "Скасовано" },
      inmod_status_returning: { ru: "Идет", en: "Returning", uk: "Виходить" },
      inmod_status_production: { ru: "В производстве", en: "In Production", uk: "У виробництві" },
      inmod_status_planned: { ru: "Запланирован", en: "Planned", uk: "Заплановано" },
      inmod_status_released: { ru: "Вышел", en: "Released", uk: "Вийшов" },
      inmod_status_post: { ru: "Скоро", en: "Post Production", uk: "Скоро" },
      inmod_status_unknown: { ru: "Неизвестно", en: "Unknown", uk: "Невідомо" },
      inmod_season_1: { ru: "сезон", en: "season", uk: "сезон" },
      inmod_season_2: { ru: "сезона", en: "seasons", uk: "сезони" },
      inmod_season_5: { ru: "сезонов", en: "seasons", uk: "сезонів" },
      inmod_episode_1: { ru: "серия", en: "episode", uk: "серія" },
      inmod_episode_2: { ru: "серии", en: "episodes", uk: "серії" },
      inmod_episode_5: { ru: "серий", en: "episodes", uk: "серій" },
      inmod_out_of: { ru: "из", en: "of", uk: "із" }
    });
  }

  function fixStatusTranslations() {
    Utils.log('Applying status translations');
    Lampa.Lang.add({
      tv_status_returning_series: { ru: Utils.translate('inmod_status_returning') },
      tv_status_planned: { ru: Utils.translate('inmod_status_planned') },
      tv_status_in_production: { ru: Utils.translate('inmod_status_production') },
      tv_status_ended: { ru: Utils.translate('inmod_status_ended') },
      tv_status_canceled: { ru: Utils.translate('inmod_status_canceled') },
      tv_status_pilot: { ru: "Пилот" },
      tv_status_released: { ru: Utils.translate('inmod_status_released') },
      tv_status_rumored: { ru: "По слухам" },
      tv_status_post_production: { ru: Utils.translate('inmod_status_post') }
    });
  }

  // ============================================================================
  // ONLINE PROVIDER ICONS MODULE
  // ============================================================================
  var OnlineIcons = {
    // Provider detection from button subtitle
    parseProvider: function (subtitleRaw) {
      var raw = ((subtitleRaw || '') + '').trim();
      if (!raw) return '';
      var token = (raw.split(/\s+/)[0] || '').trim().toLowerCase();
      if (token === 'onlyskaz') return 'onlyskaz';
      if (token === 'dso') return 'dso';
      if (token === 'lampac') return 'lampac';
      return '';
    },

    // SVG Icons for providers
    icons: {
      onlyskaz: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M12 22.5A10.5 10.5 0 1 1 12 1.5a10.5 10.5 0 0 1 0 21m0 1.5A12 12 0 1 0 12 0a12 12 0 0 0 0 24"/><path fill="currentColor" d="M9.407 7.583a.75.75 0 0 1 .78.057l5.25 3.75a.75.75 0 0 1 0 1.22l-5.25 3.75A.75.75 0 0 1 9 15.75v-7.5a.75.75 0 0 1 .407-.667"/></svg>',
      lampac: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="6.5" cy="9" r="2.2" stroke="currentColor" stroke-width="2.4"></circle><circle cx="6.5" cy="15" r="2.2" stroke="currentColor" stroke-width="2.4"></circle><rect x="9.4" y="8" width="7.8" height="8" rx="2.2" stroke="currentColor" stroke-width="2.4"></rect><circle cx="17.8" cy="12" r="1.6" stroke="currentColor" stroke-width="2.2"></circle><path d="M19.7 10.9L22.3 9.8V14.2L19.7 13.1" stroke="currentColor" stroke-width="2.0" stroke-linejoin="round"></path><path d="M8.2 19.8H18.2" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"></path><path d="M10.2 16V19.8" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"></path><path d="M16.2 16V19.8" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"></path></svg>',
      dso: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M0 4.75C0 3.784.784 3 1.75 3h20.5c.966 0 1.75.784 1.75 1.75v14.5A1.75 1.75 0 0 1 22.25 21H1.75A1.75 1.75 0 0 1 0 19.25Zm1.75-.25a.25.25 0 0 0-.25.25v14.5c0 .138.112.25.25.25h20.5a.25.25 0 0 0 .25-.25V4.75a.25.25 0 0 0-.25-.25Z"/><path fill="currentColor" d="M9 15.584V8.416a.5.5 0 0 1 .77-.42l5.576 3.583a.5.5 0 0 1 0 .842L9.77 16.005a.5.5 0 0 1-.77-.42Z"/></svg>'
    },

    storeOriginalHtml: function ($btn) {
      if ($btn.attr('data-inmod-orig')) return;
      try {
        var html = $btn.html() || '';
        $btn.attr('data-inmod-orig', encodeURIComponent(html));
      } catch (e) { }
    },

    restoreButton: function ($btn) {
      try {
        var orig = $btn.attr('data-inmod-orig');
        if (orig) $btn.html(decodeURIComponent(orig));
      } catch (e) { }
      $btn.removeAttr('data-inmod-online').removeAttr('data-inmod-orig');
    },

    patchButton: function (btn) {
      var $btn = $(btn);
      if (!$btn.length || !$btn.is('.full-start__button.view--online')) return;

      var subtitleRaw = (($btn.attr('data-subtitle') || $btn.data('subtitle') || '') + '').trim();
      var provider = OnlineIcons.parseProvider(subtitleRaw);
      if (!provider) return;

      var prev = ($btn.attr('data-inmod-online') || '').toLowerCase();
      if (prev === provider) return;

      OnlineIcons.storeOriginalHtml($btn);

      var titles = { onlyskaz: 'Skaz', dso: 'DSO', lampac: 'Lampac' };
      $btn.attr('data-inmod-online', provider);
      $btn.empty().append(OnlineIcons.icons[provider] + '<span>' + titles[provider] + '</span>');
    },

    patchButtonsInRoot: function (root) {
      var $root = root && root.jquery ? root : $(root || document.body);
      if ($root.is('.full-start__button.view--online')) OnlineIcons.patchButton($root);
      $root.find('.full-start__button.view--online').each(function () {
        OnlineIcons.patchButton(this);
      });
    },

    enable: function () {
      if (!isEnabled() || !State.settings.patch_online_icons) return;

      Utils.addStyle('inmod_online_icons', '.full-start__button.view--online svg{ width: 1.35em; height: 1.35em; }');

      // Patch current UI
      try {
        var active = Lampa.Activity.active();
        if (active && active.activity && active.activity.render) {
          OnlineIcons.patchButtonsInRoot(active.activity.render());
        }
      } catch (e) { }
      OnlineIcons.patchButtonsInRoot(document.body);

      scheduleOnlineIconsPatch();
    },

    disable: function () {
      Utils.removeStyleById('inmod_online_icons');

      // Restore patched buttons
      try {
        $('.full-start__button.view--online[data-inmod-online]').each(function () {
          OnlineIcons.restoreButton($(this));
        });
      } catch (e) { }
    }
  };

  // ============================================================================
  // CARD ENHANCER MODULE - Moves elements inside .card__view for proper positioning
  // ============================================================================
  var CardEnhancer = {
    processCard: function (card) {
      var $card = $(card);
      if ($card.attr('data-inmod-enhanced')) return;

      var $view = $card.find('.card__view').first();
      if (!$view.length) return;

      // Move .card__age inside .card__view if it exists outside
      var $age = $card.find('> .card__age');
      if ($age.length && !$age.closest('.card__view').length) {
        $age.detach().appendTo($view);
      }

      // Hide empty .card__icons-inner (no activity icons)
      var $iconsInner = $card.find('.card__icons-inner');
      if ($iconsInner.length) {
        // Check if has any actual icon elements
        var hasIcons = $iconsInner.find('.card__icon').length > 0;
        $iconsInner.toggleClass('inmod-empty', !hasIcons);
      }

      $card.attr('data-inmod-enhanced', '1');
    },

    processAll: function () {
      $('.card').each(function () {
        CardEnhancer.processCard(this);
      });
    },

    // Update icon visibility for a single card
    updateIconsVisibility: function ($card) {
      var $iconsInner = $card.find('.card__icons-inner');
      if ($iconsInner.length) {
        var hasIcons = $iconsInner.find('.card__icon').length > 0;
        $iconsInner.toggleClass('inmod-empty', !hasIcons);
      }
    },

    enable: function () {
      if (!isEnabled() || !State.settings.use_custom_styles) return;

      // Process existing cards
      CardEnhancer.processAll();

    },

    disable: function () {

      // Restore .card__age to original position and clean up
      $('.card[data-inmod-enhanced]').each(function () {
        var $card = $(this);
        var $view = $card.find('.card__view').first();
        var $age = $view.find('.card__age');

        if ($age.length) {
          $age.detach().insertAfter($card.find('.card__title'));
        }

        // Remove inmod-empty class from icons
        $card.find('.card__icons-inner').removeClass('inmod-empty');

        $card.removeAttr('data-inmod-enhanced');
      });
    }
  };

  // ============================================================================
  // CUSTOM STYLES MODULE
  // ============================================================================
  var CustomStyles = {
    // Generate all custom CSS
    generateCSS: function () {
      var tvCaption = Utils.translate('maxsm_themes_tvcaption') || 'СЕРИАЛ';
      var supportsAnimation = Utils.supportsCSSAnimation();

      var css = [
        // Mobile responsiveness
        '@media screen and (max-width: 480px) {',
        '  .full-start-new__head, .full-start-new__title, .full-start__title-original,',
        '  .full-start__rate, .full-start-new__reactions, .full-start-new__rate-line,',
        '  .full-start-new__buttons, .full-start-new__details, .full-start-new__tagline {',
        '    justify-content: center; text-align: center; max-width: 100%;',
        '  }',
        '  .full-start-new__right { background: transparent; }',
        '  .full-start-new__buttons { overflow: auto; }',
        '  .full-start-new__buttons .full-start__button:not(.focus) span { display: none; }',
        '}',

        '@media screen and (min-width: 581px) {',
        '  .full-start-new__left { width: 21em; }',
        '  .full-start-new__buttons .full-start__button:not(.focus) span { display: inline; }',
        '}',

        // Selectbox styling
        '.selectbox-item__checkbox { border-radius: 100%; }',
        '.selectbox-item--checked .selectbox-item__checkbox { background: #ccc; }',

        // Rating and status styling
        // Rating, age, and status badges - consistent styling
        '.full-start__rate { border-radius: 0.25em; padding: 0.3em; background-color: rgba(0, 0, 0, 0.3); }',
        '.full-start__pg, .full-start__status {',
        '  font-size: 1em;',
        '  background-color: rgba(0, 0, 0, 0.3);',
        '  border-radius: 0.25em;',
        '  padding: 0.3em 0.5em;',
        '  display: inline-flex;',
        '  align-items: center;',
        '  justify-content: center;',
        '}',

        // Details section - move down below main card content
        '.full-start-new__details {',
        '  margin-top: 3em !important;',
        '  padding-top: 2em;',
        '}',

        // Card styling
        '.card__title { height: 3.6em; text-overflow: ellipsis; -webkit-line-clamp: 3; line-clamp: 3; }',

        // .card__view needs position:relative for absolute children
        '.card__view { position: relative; }',

        // .card__age - positioned inside .card__view (moved by JS)
        '.card__view .card__age {',
        '  position: absolute;',
        '  right: 0;',
        '  bottom: 0;',
        '  z-index: 10;',
        '  background: rgba(0, 0, 0, 0.65);',
        '  color: #ffffff;',
        '  font-weight: 700;',
        '  padding: 0.3em 0.5em;',
        '  border-radius: 0.4em 0 0.4em 0;',
        '  line-height: 1.0;',
        '  font-size: 1.1em;',
        '}',

        // Card vote styling (inside .card__view)
        '.card__vote {',
        '  position: absolute;',
        '  bottom: auto;',
        '  right: 0;',
        '  top: 0;',
        '  background: rgba(0, 0, 0, 0.65);',
        '  font-weight: 700;',
        '  color: #fff;',
        '  border-radius: 0 0.4em 0 0.4em;',
        '  line-height: 1.0;',
        '  font-size: 1.3em;',
        '  padding: 0.3em 0.5em;',
        '  z-index: 10;',
        '}',

        // TV type badge
        '.card--tv .card__type, .card__type {',
        '  font-size: 1em;',
        '  background: transparent;',
        '  color: transparent;',
        '  left: 0;',
        '  top: 0;',
        '}',
        '.card__type::after {',
        '  content: "' + tvCaption + '";',
        '  color: #fff;',
        '  position: absolute;',
        '  left: 0;',
        '  top: 0;',
        '  padding: 0.3em 0.5em;',
        '  border-radius: 0.4em 0 0.4em 0;',
        '  font-weight: 700;',
        '  background: linear-gradient(to right, #43cea2, #185a9d);',
        '  z-index: 10;',
        '}',

        // Icons container positioning (activity status - play icon) - TOP LEFT under type label
        '.card__icons {',
        '  position: absolute;',
        '  top: 2.5em;',  // Below the type label (Сериал/Фильм)
        '  left: 0;',
        '  bottom: auto;',
        '  right: auto;',
        '  z-index: 10;',
        '}',
        // Icons inner - has background only when has content
        '.card__icons-inner {',
        '  display: flex;',
        '  justify-content: center;',
        '  background: rgba(0, 0, 0, 0.65);',
        '  color: #fff;',
        '  border-radius: 0 0.4em 0.4em 0;',
        '  padding: 0.2em 0.4em;',
        '}',
        // Hide inner when empty (no icons)
        '.card__icons-inner:empty,',
        '.card__icons-inner.inmod-empty {',
        '  display: none !important;',
        '}',

        // Marker styling (Смотрю, Запланировано, etc.) - BOTTOM LEFT corner
        '.card__marker {',
        '  position: absolute;',
        '  left: 0;',
        '  bottom: 0;',
        '  top: auto;',
        '  right: auto;',
        '  background: rgba(0, 0, 0, 0.65);',
        '  border-radius: 0 0.4em 0 0;',
        '  font-weight: 700;',
        '  font-size: 1.0em;',
        '  padding: 0.3em 0.5em;',
        '  display: flex;',
        '  align-items: center;',
        '  line-height: 1.0;',
        '  max-width: min(12em, 95%);',
        '  box-sizing: border-box;',
        '  z-index: 10;',
        '  color: #fff;',
        '  height: auto;',
        '}',
        '.card__marker > span { max-width: min(12em, 95%); }',

        // Quality badge (inside .card__view)
        '.card__quality {',
        '  position: absolute;',
        '  left: auto;',
        '  right: 0;',
        '  bottom: 1.8em;',
        '  padding: 0.3em 0.5em;',
        '  color: #fff;',
        '  font-weight: 700;',
        '  font-size: 1.0em;',
        '  border-radius: 0.5em 0 0 0.5em;',
        '  text-transform: uppercase;',
        '  background: linear-gradient(to right, #43cea2, #185a9d);',
        '}',

        // Items line spacing
        '.items-line.items-line--type-cards + .items-line.items-line--type-cards { margin-top: 0em; }',
        '.card--small .card__view { margin-bottom: -0.5em; }',

        // Background
        '.full-start__background.loaded { opacity: 0.85; }',
        '.full-start__background.dim { opacity: 0.2; }',

        // Torrent filter buttons
        '.explorer__files .torrent-filter .simple-button { font-size: 1.2em; border-radius: 0.5em; }',

        // Border radius for various elements
        '.full-review-add, .full-review, .extensions__item, .extensions__block-add,',
        '.search-source, .bookmarks-folder__layer, .bookmarks-folder__body, .card__img,',
        '.card__promo, .full-episode--next .full-episode__img:after, .full-episode__img img,',
        '.full-episode__body, .full-person__photo, .card-more__box, .full-start__button,',
        '.simple-button, .register { border-radius: 0.5em; }',

        // Focus states border radius
        '.extensions__item.focus::after, .extensions__block-add.focus::after,',
        '.full-episode.focus::after, .full-review-add.focus::after,',
        '.card-parser.focus::after, .card-episode.focus .full-episode::after,',
        '.card-episode.hover .full-episode::after, .card.focus .card__view::after,',
        '.card.hover .card__view::after, .card-more.focus .card-more__box::after,',
        '.register.focus::after { border-radius: 1em; }',

        // Focus states background
        '.search-source.focus, .simple-button.focus, .menu__item.focus,',
        '.menu__item.traverse, .menu__item.hover, .full-start__button.focus,',
        '.full-descr__tag.focus, .player-panel .button.focus,',
        '.full-person.selector.focus, .tag-count.selector.focus { border-radius: 0.5em; }',

        '.menu__item.focus { border-radius: 0 0.5em 0.5em 0; }',
        '.menu__list { padding-left: 0em; }'
      ];

      // Animation styles (only if supported)
      if (supportsAnimation) {
        css.push(
          // Card view animation (animate inner element, not scroll target)
          '.card .card__view {',
          '  position: relative;',
          '  transform: scale(1);',
          '  transition: transform 0.3s ease;',
          '}',
          '.card.focus .card__view { transform: scale(1.03); }',

          // Prevent scroll misalignment
          '.items-cards .card.selector,',
          '.items-cards .card.selector.focus { transform: none !important; }',

          // Torrent item animation
          '.torrent-item { transform: scale(1); transition: transform 0.3s ease; }',
          '.torrent-item.focus { transform: scale(1.01); }',

          // Various elements animation
          '.extensions__item, .extensions__block-add, .full-review-add, .full-review,',
          '.tag-count, .full-person, .full-episode, .simple-button, .full-start__button,',
          '.items-cards .selector, .card-more, .explorer-card__head-img.selector,',
          '.card-episode { transform: scale(1); transition: transform 0.3s ease; }',

          '.extensions__item.focus, .extensions__block-add.focus, .full-review-add.focus,',
          '.full-review.focus, .tag-count.focus, .full-person.focus, .full-episode.focus,',
          '.simple-button.focus, .full-start__button.focus, .items-cards .selector.focus,',
          '.card-more.focus, .explorer-card__head-img.selector.focus,',
          '.card-episode.focus { transform: scale(1.03); }',

          // Menu item animation
          '.menu__item { transition: transform 0.3s ease; }',
          '.menu__item.focus { transform: translateX(-0.2em); }',

          // Settings animation
          '.selectbox-item, .settings-folder, .settings-param { transition: transform 0.3s ease; }',
          '.selectbox-item.focus, .settings-folder.focus,',
          '.settings-param.focus { transform: translateX(0.2em); }'
        );
      }

      return css.join('\n');
    },

    enable: function () {
      if (!isEnabled() || !State.settings.use_custom_styles) return;
      Utils.addStyle('inmod_styles', CustomStyles.generateCSS());
    },

    disable: function () {
      Utils.removeStyleById('inmod_styles');
    }
  };

  // ============================================================================
  // LOADER STYLES MODULE
  // ============================================================================
  var LoaderStyles = {
    enable: function () {
      if (!isEnabled()) return;

      var svgDashed = 'data:image/svg+xml,' + encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="115" height="115" viewBox="0 0 115 115">' +
        '<circle cx="57.5" cy="57.5" r="52" fill="none" stroke="#43cea2" stroke-width="0.5" opacity="0.3"/>' +
        '<circle cx="57.5" cy="57.5" r="48" fill="none" stroke="#43cea2" stroke-width="2" stroke-dasharray="2 10"/>' +
        '<circle cx="57.5" cy="57.5" r="44" fill="none" stroke="#185a9d" stroke-width="1" stroke-dasharray="20 5" opacity="0.4"/>' +
        '</svg>'
      );

      var svgPlane = 'data:image/svg+xml,' + encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="115" height="115" viewBox="0 0 115 115">' +
        '<defs><filter id="glow" x="-50%" y="-50%" width="200%" height="200%">' +
        '<feGaussianBlur stdDeviation="2.5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>' +
        '</filter></defs>' +
        '<path d="M57.5 15 A 42.5 42.5 0 0 1 100 57.5" fill="none" stroke="#43cea2" stroke-width="5" stroke-linecap="round" filter="url(#glow)"/>' +
        '<path d="M57.5 35 L77 46 L77 69 L57.5 80 L38 69 L38 46 Z" fill="#43cea2" filter="url(#glow)">' +
        '<animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite"/>' +
        '</path></svg>'
      );

      var animDashed = Utils.supportsCSSAnimation() ? 'animation: inmodRotateDashed 15s linear infinite;' : '';
      var animPlane = Utils.supportsCSSAnimation() ? 'animation: inmodRotatePlane 2s linear infinite;' : '';

      var css = [
        '.screensaver__preload {',
        '  position: relative;',
        '  background: url(' + svgDashed + ') no-repeat 50% 50%;',
        '  ' + animDashed,
        '}',
        '.screensaver__preload::after {',
        '  content: "";',
        '  position: absolute;',
        '  top: 0; left: 0; width: 100%; height: 100%;',
        '  background: url(' + svgPlane + ') no-repeat 50% 50%;',
        '  ' + animPlane,
        '}',
        '.activity__loader {',
        '  position: absolute;',
        '  top: 0; left: 0; width: 100%; height: 100%;',
        '  display: none;',
        '  background: url(' + svgDashed + ') no-repeat 50% 50%;',
        '  zoom: 0.7;',
        '  ' + animDashed,
        '}',
        '.activity__loader::after {',
        '  content: "";',
        '  position: absolute;',
        '  top: 0; left: 0; width: 100%; height: 100%;',
        '  background: url(' + svgPlane + ') no-repeat 50% 50%;',
        '  zoom: 0.7;',
        '  ' + animPlane,
        '}',
        '@keyframes inmodRotateDashed { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }',
        '@keyframes inmodRotatePlane { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }'
      ];

      Utils.addStyle('inmod_loader', css.join('\n'));
    },

    disable: function () {
      Utils.removeStyleById('inmod_loader');
    }
  };

  // ============================================================================
  // THEME MODULE
  // ============================================================================
  var Theme = {
    apply: function (themeName) {
      Utils.log('Applying theme:', themeName);
      Utils.removeStyleById('inmod_theme');

      if (themeName === 'default') return;

      var themes = {
        emerald: [
          ':root {',
          '  --main-color: #43cea2;',
          '  --secondary-color: #185a9d;',
          '  --background-color: rgba(26, 42, 58, 0.98);',
          '  --text-color: #fff;',
          '  --transparent-accent: rgba(67, 206, 162, 0.1);',
          '}',
          '.navigation-bar__body { background: rgba(26, 42, 58, 0.98); }',
          '.card__quality, .card__type::after { background: linear-gradient(to right, #43cea2, #185a9d); }',
          'html, body, .extensions { background: linear-gradient(135deg, #1a2a3a, #2C5364, #203A43); color: #ffffff; }',
          '.company-start.icon--broken .company-start__icon, .explorer-card__head-img > img,',
          '.bookmarks-folder__layer, .card-more__box, .card__img, .extensions__block-add,',
          '.extensions__item { background-color: rgba(26, 42, 58, 0.98); }',
          '.watched-history.focus, .search-source.focus, .simple-button.focus, .menu__item.focus,',
          '.menu__item.traverse, .menu__item.hover, .full-start__button.focus, .full-descr__tag.focus,',
          '.player-panel .button.focus, .full-person.selector.focus, .tag-count.selector.focus,',
          '.full-review.focus {',
          '  background: linear-gradient(to right, #43cea2, #185a9d);',
          '  color: #fff;',
          '  box-shadow: 0 0 0.3em rgba(67, 206, 162, 0.4);',
          '  border-radius: 0.4em;',
          '}',
          '.selectbox-item.focus, .settings-folder.focus, .settings-param.focus {',
          '  background: linear-gradient(to right, #43cea2, #185a9d);',
          '  color: #fff;',
          '  box-shadow: 0 0 0.4em rgba(67, 206, 162, 0.4);',
          '  border-radius: 0.5em 0 0 0.5em;',
          '}',
          '.watched-history.focus::after, .full-episode.focus::after,',
          '.card-episode.focus .full-episode::after, .items-cards .selector.focus::after,',
          '.card-more.focus .card-more__box::after, .card.focus .card__view::after,',
          '.card.hover .card__view::after, .torrent-item.focus::after,',
          '.extensions__item.focus::after, .extensions__block-add.focus::after,',
          '.full-review-add.focus::after {',
          '  border: 0.24em solid #5cd4b0;',
          '  box-shadow: 0 0 0.6em rgba(92, 212, 176, 0.18);',
          '  border-radius: 0.9em;',
          '}',
          '.head__action.focus, .head__action.hover { background: linear-gradient(45deg, #43cea2, #185a9d); }',
          '.modal__content, .settings__content, .settings-input__content,',
          '.selectbox__content, .settings-input {',
          '  background: rgba(26, 42, 58, 0.98);',
          '  border: 1px solid rgba(67, 206, 162, 0.1);',
          '  box-shadow: 0 0 0.4em rgba(67, 206, 162, 0.1);',
          '}',
          '.torrent-serial { background: rgba(67, 206, 162, 0.1); border: 0.2em solid rgba(67, 206, 162, 0.1); }',
          '.torrent-serial.focus { background-color: rgba(26, 42, 58, 0.8); border: 0.2em solid #43cea2; }',
          '.full-start__background { opacity: 0.1; filter: brightness(0.8) saturate(0.8); }'
        ].join('\n')
      };

      var css = themes[themeName];
      if (css) {
        Utils.addStyle('inmod_theme', css);
      }

      // Force Lampa settings if enabled
      if (State.settings.force_lampa_settings && themeName === 'emerald') {
        Lampa.Storage.set('background', true);
        Lampa.Storage.set('background_type', 'simple');
        Lampa.Storage.set('card_interfice_type', 'new');
        Lampa.Storage.set('glass_style', 'false');
        Lampa.Storage.set('card_interfice_poster', 'true');
        Lampa.Storage.set('card_interfice_cover', 'true');
        Lampa.Storage.set('advanced_animation', 'false');
      }
    },

    disable: function () {
      Utils.removeStyleById('inmod_theme');
    }
  };

  // ============================================================================
  // SEASON INFO MODULE
  // ============================================================================
  var SeasonInfo = {
    add: function (data) {
      if (!isEnabled()) return;
      if (State.settings.seasons_info_mode === 'none') return;
      if (data.type !== 'complite' || !data.data.movie.number_of_seasons) return;

      var movie = data.data.movie;
      var status = movie.status;
      var totalSeasons = movie.number_of_seasons || 0;
      var totalEpisodes = movie.number_of_episodes || 0;
      var airedSeasons = 0;
      var airedEpisodes = 0;
      var currentDate = new Date();

      // Calculate aired episodes
      if (movie.seasons) {
        movie.seasons.forEach(function (season) {
          if (season.season_number === 0) return;
          var seasonAired = false;
          if (season.air_date) {
            var airDate = new Date(season.air_date);
            if (airDate <= currentDate) {
              seasonAired = true;
              airedSeasons++;
            }
          }
          if (season.episodes) {
            season.episodes.forEach(function (episode) {
              if (episode.air_date) {
                var epAirDate = new Date(episode.air_date);
                if (epAirDate <= currentDate) {
                  airedEpisodes++;
                }
              }
            });
          } else if (seasonAired && season.episode_count) {
            airedEpisodes += season.episode_count;
          }
        });
      } else if (movie.last_episode_to_air) {
        airedSeasons = movie.last_episode_to_air.season_number || 0;
        airedEpisodes = movie.last_episode_to_air.episode_number || 0;
      }

      if (airedSeasons === 0) airedSeasons = totalSeasons;
      if (airedEpisodes === 0) airedEpisodes = totalEpisodes;
      if (totalEpisodes > 0 && airedEpisodes > totalEpisodes) airedEpisodes = totalEpisodes;

      var getStatusText = function (s) {
        if (s === 'Ended') return Utils.translate('inmod_status_ended');
        if (s === 'Canceled') return Utils.translate('inmod_status_canceled');
        if (s === 'Returning Series') return Utils.translate('inmod_status_returning');
        if (s === 'In Production') return Utils.translate('inmod_status_production');
        return s || Utils.translate('inmod_status_unknown');
      };

      var isCompleted = (status === 'Ended' || status === 'Canceled');
      var displaySeasons = State.settings.seasons_info_mode === 'aired' ? airedSeasons : totalSeasons;
      var displayEpisodes = State.settings.seasons_info_mode === 'aired' ? airedEpisodes : totalEpisodes;
      var seasonsText = Utils.plural(displaySeasons, Utils.translate('inmod_season_1'), Utils.translate('inmod_season_2'), Utils.translate('inmod_season_5'));
      var episodesText = Utils.plural(displayEpisodes, Utils.translate('inmod_episode_1'), Utils.translate('inmod_episode_2'), Utils.translate('inmod_episode_5'));

      var $info = $('<div class="season-info-label"></div>');
      if (isCompleted) {
        var text = displaySeasons + ' ' + seasonsText + ' ' + displayEpisodes + ' ' + episodesText;
        $info.append($('<div></div>').text(text)).append($('<div></div>').text(getStatusText(status)));
      } else {
        var text = displaySeasons + ' ' + seasonsText + ' ';
        if (State.settings.seasons_info_mode === 'aired' && totalEpisodes > 0 && airedEpisodes < totalEpisodes) {
          text += airedEpisodes + ' ' + episodesText + ' ' + Utils.translate('inmod_out_of') + ' ' + totalEpisodes;
        } else {
          text += displayEpisodes + ' ' + episodesText;
        }
        $info.append($('<div></div>').text(text));
      }

      // Position styles
      var position = State.settings.label_position || 'top-right';
      var posStyles = {
        'top-right': { top: '0', right: '0', 'border-radius': '0 0 0 0.5em' },
        'top-left': { top: '0', left: '0', 'border-radius': '0 0 0.5em 0' },
        'bottom-right': { bottom: '0', right: '0', 'border-radius': '0.5em 0 0 0' },
        'bottom-left': { bottom: '0', left: '0', 'border-radius': '0 0.5em 0 0' }
      };

      var style = $.extend({
        'position': 'absolute',
        'background': 'linear-gradient(to right, #43cea2, #185a9d)',
        'color': '#fff',
        'padding': '0.4em 0.8em',
        'font-size': '0.9em',
        'font-weight': 'bold',
        'z-index': '999',
        'text-align': 'center',
        'white-space': 'nowrap',
        'line-height': '1.2em',
        'box-shadow': '0 2px 8px rgba(0, 0, 0, 0.4)',
        'text-transform': 'uppercase'
      }, posStyles[position]);

      $info.css(style);

      setTimeout(function () {
        if (!isEnabled()) return;
        var $poster = $(data.object.activity.render()).find('.full-start-new__poster');
        if ($poster.length) {
          $poster.css('position', 'relative').append($info);
        }
      }, 100);
    },

    remove: function () {
      $('.season-info-label').remove();
    }
  };

  // ============================================================================
  // MOVIE TYPE LABELS MODULE
  // ============================================================================
  var MovieTypeLabels = {
    enable: function () {
      if (!isEnabled() || !State.settings.show_movie_type) return;

      var css = [
        '.content-label {',
        '  position: absolute !important;',
        '  top: 0 !important;',
        '  left: 0 !important;',
        '  color: white !important;',
        '  padding: 0.3em 0.5em !important;',
        '  border-radius: 0.4em 0 0.4em 0 !important;',
        '  font-size: 0.9em !important;',
        '  font-weight: 700 !important;',
        '  z-index: 10 !important;',
        '  line-height: 1.0 !important;',
        '}',
        '.serial-label { background: linear-gradient(135deg, #3498db, #2980b9) !important; }',
        '.movie-label { background: linear-gradient(135deg, #2ecc71, #27ae60) !important; }',
        'body[data-movie-labels="on"] .card--tv .card__type { display: none !important; }'
      ];

      Utils.addStyle('inmod_movie_type', css.join('\n'));
      $('body').attr('data-movie-labels', 'on');

      // Process existing cards
      $('.card').each(function () { MovieTypeLabels.addToCard(this); });

    },

    addToCard: function (card) {
      if (!State.settings.show_movie_type || $(card).find('.content-label').length) return;
      var $view = $(card).find('.card__view');
      if (!$view.length) return;

      var isTV = $(card).hasClass('card--tv') ||
        $(card).data('card_type') === 'tv' ||
        $(card).data('type') === 'tv';

      if (!isTV) {
        var text = $(card).find('.card__type, .card__temp').text();
        if (text && text.match(/(сезон|серия|серии|эпизод|ТВ|TV)/i)) isTV = true;
      }

      var labelText = isTV ? Utils.translate('inmod_serial') : Utils.translate('inmod_movie');
      var $label = $('<div class="content-label"></div>')
        .addClass(isTV ? 'serial-label' : 'movie-label')
        .text(labelText);
      $view.append($label);
    },

    addToFullPoster: function (movie, root) {
      if (!State.settings.show_movie_type) return;
      var $poster = $(root).find('.full-start__poster');
      if (!$poster.length) return;

      $poster.find('.content-label').remove();
      var isTV = movie.number_of_seasons > 0 || movie.seasons || movie.type === 'tv';
      var labelText = isTV ? Utils.translate('inmod_serial') : Utils.translate('inmod_movie');
      var $label = $('<div class="content-label"></div>')
        .addClass(isTV ? 'serial-label' : 'movie-label')
        .text(labelText);
      $poster.css('position', 'relative').append($label);
    },

    disable: function () {
      $('.content-label').remove();
      $('body').removeAttr('data-movie-labels');
      Utils.removeStyleById('inmod_movie_type');
    }
  };

  // ============================================================================
  // COLORED RATINGS MODULE
  // ============================================================================
  var ColoredRatings = {
    update: function () {
      if (!State.settings.colored_ratings) {
        $(".card__vote, .full-start__rate, .full-start-new__rate, .info__rate, .card__imdb-rate, .card__kinopoisk-rate").css('color', '');
        return;
      }

      $(".card__vote, .full-start__rate, .full-start-new__rate, .info__rate, .card__imdb-rate, .card__kinopoisk-rate").each(function () {
        var voteStr = $(this).text().replace(',', '.').match(/(\d+(\.\d+)?)/);
        if (!voteStr) return;
        var vote = parseFloat(voteStr[0]);
        if (isNaN(vote)) return;

        var color = vote >= 8 ? "#43cea2" : (vote >= 6.5 ? "#5cd4b0" : (vote >= 4.5 ? "#ffc371" : "#ff5f6d"));
        $(this).css('color', color);
      });
    },

    enable: function () {
      if (!isEnabled() || !State.settings.colored_ratings) return;

      setTimeout(ColoredRatings.update, 500);

      scheduleRatingsRefresh();
    },

    disable: function () {
      clearTimeout(State.intervals.ratingsDebounce);
      $(".card__vote, .full-start__rate, .full-start-new__rate, .info__rate, .card__imdb-rate, .card__kinopoisk-rate").css('color', '');
    }
  };

  // ============================================================================
  // COLORED ELEMENTS MODULE (Status/Age)
  // ============================================================================
  var ColoredElements = {
    statusColors: {
      'Ended': '#43cea2',
      'Canceled': '#ff5f6d',
      'Return': '#ffc371',
      'Production': '#5cd4b0',
      'Planned': '#185a9d',
      'Pilot': '#e67e22',
      'Released': '#43cea2',
      'Rumored': '#95a5a6',
      'Post': '#00bcd4'
    },

    applyStatus: function (el) {
      if (!State.settings.colored_elements) {
        Utils.resetInlineStyles($(el));
        return;
      }

      var txt = $(el).text();
      var color = '#ffc371'; // Default amber for status

      for (var key in ColoredElements.statusColors) {
        if (txt.includes(key) ||
          (key === 'Ended' && (txt.includes('Заверш') || txt.includes('Ended'))) ||
          (key === 'Canceled' && (txt.includes('Отмен') || txt.includes('Canceled'))) ||
          (key === 'Return' && (txt.includes('Выход') || txt.includes('Идет') || txt.includes('Returning')))) {
          color = ColoredElements.statusColors[key];
          break;
        }
      }

      // Style like rating badges (.full-start__rate)
      $(el).css({
        'background-color': 'rgba(0, 0, 0, 0.3)',
        'color': color,
        'border-radius': '0.25em',
        'padding': '0.3em 0.5em',
        'display': 'inline-flex',
        'align-items': 'center',
        'justify-content': 'center',
        'font-weight': 'bold',
        'font-size': '1em',
        'border': 'none',
        'min-height': 'auto',
        'height': 'auto'
      });
    },

    applyAge: function (el) {
      if (!State.settings.colored_elements) {
        Utils.resetInlineStyles($(el));
        return;
      }

      var txt = $(el).text();
      var color = txt.match(/18|NC-17|X/) ? '#ff5f6d' :
        (txt.match(/16|17|R|MA/) ? '#ffc371' :
          (txt.match(/12|13|14|PG-13/) ? '#5cd4b0' : '#43cea2'));

      // Style like rating badges (.full-start__rate)
      $(el).css({
        'background-color': 'rgba(0, 0, 0, 0.3)',
        'color': color,
        'border-radius': '0.25em',
        'padding': '0.3em 0.5em',
        'display': 'inline-flex',
        'align-items': 'center',
        'justify-content': 'center',
        'font-weight': 'bold',
        'font-size': '1em',
        'border': 'none',
        'min-height': 'auto',
        'height': 'auto'
      });
    },

    updateAll: function (root) {
      var $root = $(root || document.body);
      $root.find('.full-start__status').each(function () { ColoredElements.applyStatus(this); });
      $root.find('.full-start__pg').each(function () { ColoredElements.applyAge(this); });
    },

    enable: function () {
      if (!isEnabled() || !State.settings.colored_elements) return;

    },

    disable: function () {
      clearTimeout(State.intervals.elementsDebounce);
      Utils.resetInlineStyles($('.full-start__status, .full-start__pg'));
    }
  };

  // ============================================================================
  // TORRENT STYLES MODULE - Colored badges for seeds, bitrate, size
  // ============================================================================
  var TorrentStyles = {
    // Thresholds for coloring
    thresholds: {
      seeds: { danger: 5, good: 10, top: 20 },
      bitrate: { warn: 50, danger: 100 },
      size: { mid: 50, high: 100, top: 200 }  // in GB
    },

    // Parse helpers
    parseFloat: function (text) {
      var t = ((text || '') + '').trim();
      var m = t.match(/(\d+(?:[.,]\d+)?)/);
      return m ? (parseFloat(m[1].replace(',', '.')) || 0) : 0;
    },

    parseInt: function (text) {
      var t = ((text || '') + '').trim();
      var v = parseInt(t, 10);
      return isNaN(v) ? 0 : v;
    },

    parseSizeToGb: function (text) {
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
    },

    // Apply tier class to element
    applyTier: function (el, classesToClear, classToAdd) {
      try {
        for (var i = 0; i < classesToClear.length; i++) {
          el.classList.remove(classesToClear[i]);
        }
        if (classToAdd) el.classList.add(classToAdd);
      } catch (e) { }
    },

    // Update torrent item styles; optional root scopes querySelectorAll (see `torrent` listener render).
    update: function (root) {
      if (!isEnabled() || !State.settings.torrent_styles) return;

      var TH = TorrentStyles.thresholds;

      try {
        var scope = root && typeof root.querySelectorAll === 'function' ? root : document;

        // Seeds (раздают)
        scope.querySelectorAll('.torrent-item__seeds span').forEach(function (span) {
          var value = TorrentStyles.parseInt(span.textContent);
          span.classList.add('ts-seeds');

          var tier = '';
          if (value < TH.seeds.danger) tier = 'low-seeds';
          else if (value >= TH.seeds.top) tier = 'high-seeds';
          else if (value >= TH.seeds.good) tier = 'good-seeds';
          TorrentStyles.applyTier(span, ['low-seeds', 'good-seeds', 'high-seeds'], tier);
        });

        // Bitrate
        scope.querySelectorAll('.torrent-item__bitrate span').forEach(function (span) {
          var value = TorrentStyles.parseFloat(span.textContent);
          span.classList.add('ts-bitrate');

          var tier = '';
          if (value > TH.bitrate.danger) tier = 'very-high-bitrate';
          else if (value >= TH.bitrate.warn) tier = 'high-bitrate';
          TorrentStyles.applyTier(span, ['high-bitrate', 'very-high-bitrate'], tier);
        });

        // Grabs/Peers (качают)
        scope.querySelectorAll('.torrent-item__grabs span').forEach(function (span) {
          var value = TorrentStyles.parseInt(span.textContent);
          span.classList.add('ts-grabs');
          TorrentStyles.applyTier(span, ['high-grabs'], value > 10 ? 'high-grabs' : '');
        });

        // Size
        scope.querySelectorAll('.torrent-item__size').forEach(function (el) {
          el.classList.add('ts-size');
          var gb = TorrentStyles.parseSizeToGb(el.textContent);

          if (gb === null) {
            TorrentStyles.applyTier(el, ['mid-size', 'high-size', 'top-size'], '');
            return;
          }

          var tier = '';
          if (gb > TH.size.top) tier = 'top-size';
          else if (gb >= TH.size.high) tier = 'high-size';
          else if (gb >= TH.size.mid) tier = 'mid-size';
          TorrentStyles.applyTier(el, ['mid-size', 'high-size', 'top-size'], tier);
        });
      } catch (e) {
        Utils.log('TorrentStyles.update error:', e);
      }
    },

    // Generate CSS for torrent styles
    generateCSS: function () {
      return [
        // Base badge styles
        '.torrent-item__bitrate > span.ts-bitrate,',
        '.torrent-item__seeds > span.ts-seeds,',
        '.torrent-item__grabs > span.ts-grabs,',
        '.torrent-item__size.ts-size {',
        '  display: inline-flex;',
        '  align-items: center;',
        '  justify-content: center;',
        '  box-sizing: border-box;',
        '  min-height: 1.7em;',
        '  padding: 0.15em 0.45em;',
        '  border-radius: 0.5em;',
        '  font-weight: 700;',
        '  font-size: 0.9em;',
        '  line-height: 1;',
        '  white-space: nowrap;',
        '  vertical-align: middle;',
        '  font-variant-numeric: tabular-nums;',
        '}',

        // Spacing
        '.torrent-item__bitrate, .torrent-item__grabs, .torrent-item__seeds {',
        '  margin-right: 0.55em;',
        '}',

        // Seeds - normal (5-9)
        '.torrent-item__seeds > span.ts-seeds {',
        '  color: #5cd4b0;',
        '  background-color: rgba(92, 212, 176, 0.14);',
        '  border: 0.15em solid rgba(92, 212, 176, 0.90);',
        '  box-shadow: 0 0 0.75em rgba(92, 212, 176, 0.28);',
        '}',

        // Seeds - low (danger, <5)
        '.torrent-item__seeds > span.ts-seeds.low-seeds {',
        '  color: #ff5f6d;',
        '  background-color: rgba(255, 95, 109, 0.14);',
        '  border: 0.15em solid rgba(255, 95, 109, 0.82);',
        '  box-shadow: 0 0 0.65em rgba(255, 95, 109, 0.26);',
        '}',

        // Seeds - good (10-19)
        '.torrent-item__seeds > span.ts-seeds.good-seeds {',
        '  color: #43cea2;',
        '  background-color: rgba(67, 206, 162, 0.16);',
        '  border: 0.15em solid rgba(67, 206, 162, 0.92);',
        '  box-shadow: 0 0 0.9em rgba(67, 206, 162, 0.34);',
        '}',

        // Seeds - top (>=20)
        '.torrent-item__seeds > span.ts-seeds.high-seeds {',
        '  color: #ffc371;',
        '  background: linear-gradient(135deg, rgba(255, 195, 113, 0.28), rgba(67, 206, 162, 0.10));',
        '  border: 0.15em solid rgba(255, 195, 113, 0.92);',
        '  box-shadow: 0 0 0.95em rgba(255, 195, 113, 0.38);',
        '}',

        // Grabs/Peers
        '.torrent-item__grabs > span.ts-grabs {',
        '  color: #4db6ff;',
        '  background-color: rgba(77, 182, 255, 0.12);',
        '  border: 0.15em solid rgba(77, 182, 255, 0.82);',
        '  box-shadow: 0 0 0.35em rgba(77, 182, 255, 0.16);',
        '}',
        '.torrent-item__grabs > span.ts-grabs.high-grabs {',
        '  color: #4db6ff;',
        '  background: linear-gradient(135deg, rgba(77, 182, 255, 0.18), rgba(52, 152, 219, 0.10));',
        '  border: 0.15em solid rgba(77, 182, 255, 0.92);',
        '  box-shadow: 0 0 0.55em rgba(77, 182, 255, 0.22);',
        '}',

        // Bitrate - base
        '.torrent-item__bitrate > span.ts-bitrate {',
        '  color: #5cd4b0;',
        '  background-color: rgba(67, 206, 162, 0.10);',
        '  border: 0.15em solid rgba(92, 212, 176, 0.78);',
        '  box-shadow: 0 0 0.45em rgba(92, 212, 176, 0.20);',
        '}',

        // Bitrate - high (50-100 Mbps)
        '.torrent-item__bitrate > span.ts-bitrate.high-bitrate {',
        '  color: #ffc371;',
        '  background: linear-gradient(135deg, rgba(255, 195, 113, 0.28), rgba(67, 206, 162, 0.10));',
        '  border: 0.15em solid rgba(255, 195, 113, 0.92);',
        '  box-shadow: 0 0 0.95em rgba(255, 195, 113, 0.38);',
        '}',

        // Bitrate - very high (>100 Mbps)
        '.torrent-item__bitrate > span.ts-bitrate.very-high-bitrate {',
        '  color: #ff5f6d;',
        '  background: linear-gradient(135deg, rgba(255, 95, 109, 0.28), rgba(67, 206, 162, 0.08));',
        '  border: 0.15em solid rgba(255, 95, 109, 0.92);',
        '  box-shadow: 0 0 1.05em rgba(255, 95, 109, 0.40);',
        '}',

        // Size - base (<50GB)
        '.torrent-item__size.ts-size {',
        '  color: #5cd4b0;',
        '  background-color: rgba(92, 212, 176, 0.12);',
        '  border: 0.15em solid rgba(92, 212, 176, 0.82);',
        '  box-shadow: 0 0 0.7em rgba(92, 212, 176, 0.26);',
        '  font-weight: 700;',
        '}',

        // Size - mid (50-100GB)
        '.torrent-item__size.ts-size.mid-size {',
        '  color: #43cea2;',
        '  background-color: rgba(67, 206, 162, 0.16);',
        '  border: 0.15em solid rgba(67, 206, 162, 0.92);',
        '  box-shadow: 0 0 0.9em rgba(67, 206, 162, 0.34);',
        '}',

        // Size - high (100-200GB)
        '.torrent-item__size.ts-size.high-size {',
        '  color: #ffc371;',
        '  background: linear-gradient(135deg, rgba(255, 195, 113, 0.28), rgba(67, 206, 162, 0.10));',
        '  border: 0.15em solid rgba(255, 195, 113, 0.95);',
        '  box-shadow: 0 0 1.05em rgba(255, 195, 113, 0.40);',
        '}',

        // Size - top (>200GB)
        '.torrent-item__size.ts-size.top-size {',
        '  color: #ff5f6d;',
        '  background: linear-gradient(135deg, rgba(255, 95, 109, 0.28), rgba(67, 206, 162, 0.08));',
        '  border: 0.15em solid rgba(255, 95, 109, 0.95);',
        '  box-shadow: 0 0 1.1em rgba(255, 95, 109, 0.42);',
        '}',

        // Focus states
        '.torrent-item.selector.focus {',
        '  box-shadow: 0 0 0 0.3em rgba(67, 206, 162, 0.4);',
        '}',
        '.torrent-serial.selector.focus {',
        '  box-shadow: 0 0 0 0.25em rgba(67, 206, 162, 0.4);',
        '}',
        '.torrent-file.selector.focus {',
        '  box-shadow: 0 0 0 0.25em rgba(67, 206, 162, 0.4);',
        '}',
        '.torrent-item.focus::after {',
        '  border: 0.24em solid #5cd4b0;',
        '  box-shadow: 0 0 0.6em rgba(92, 212, 176, 0.18);',
        '  border-radius: 0.9em;',
        '}'
      ].join('\n');
    },

    enable: function () {
      if (!isEnabled() || !State.settings.torrent_styles) return;

      // Add CSS
      Utils.addStyle('inmod_torrent', TorrentStyles.generateCSS());

      // Initial update
      TorrentStyles.update();

      if (TorrentStyles._torrentRenderFollow) {
        try {
          if (Lampa.Listener.remove) Lampa.Listener.remove('torrent', TorrentStyles._torrentRenderFollow);
        } catch (e1) { }
        TorrentStyles._torrentRenderFollow = null;
      }

      TorrentStyles._torrentRenderFollow = function (e) {
        if (!isEnabled() || !State.settings.torrent_styles) return;
        if (!e || e.type !== 'render' || !e.item) return;
        var node = e.item[0];
        if (!node && e.item.get && typeof e.item.get === 'function') node = e.item.get(0);
        if (node) TorrentStyles.update(node);
      };

      Lampa.Listener.follow('torrent', TorrentStyles._torrentRenderFollow);

      scheduleTorrentStylesSweep();
    },

    disable: function () {
      if (TorrentStyles._torrentRenderFollow) {
        try {
          if (Lampa.Listener.remove) Lampa.Listener.remove('torrent', TorrentStyles._torrentRenderFollow);
        } catch (e) { }
        TorrentStyles._torrentRenderFollow = null;
      }
      clearTimeout(State.intervals.torrentDebounce);
      Utils.removeStyleById('inmod_torrent');

      // Remove classes from elements
      document.querySelectorAll('.ts-seeds, .ts-bitrate, .ts-grabs, .ts-size').forEach(function (el) {
        el.classList.remove('ts-seeds', 'ts-bitrate', 'ts-grabs', 'ts-size',
          'low-seeds', 'good-seeds', 'high-seeds',
          'high-grabs', 'high-bitrate', 'very-high-bitrate',
          'mid-size', 'high-size', 'top-size');
      });
    }
  };

  // ============================================================================
  // BUTTONS MODULE - Global button management with early CSS application
  // Uses CSS-first approach: styles are applied immediately, JS handles cloning
  // ============================================================================
  var ButtonsManager = {
    // Unique ID counter for buttons
    _idCounter: 0,

    // Track processed cards to avoid double processing
    _processedCards: new WeakMap(),

    /**
     * Get unique button identifier by text content
     */
    getButtonId: function ($btn) {
      var text = ($btn.find('span').first().text() || '').trim().toLowerCase();
      if (text) return text;
      var subtitle = ($btn.attr('data-subtitle') || '').trim().toLowerCase();
      return subtitle || null;
    },

    /**
     * Get Lampa's hash for priority button detection
     */
    getLampaHash: function ($btn) {
      try {
        return Lampa.Utils.hash($btn.clone().removeClass('focus hover traverse').prop('outerHTML'));
      } catch (e) {
        return '';
      }
    },

    /**
     * Generate global CSS - applied ONCE at startup
     * This CSS is always active, ready for any card that opens
     */
    generateCSS: function () {
      return [
        // ===== GLOBAL BUTTON LAYOUT =====
        // Always apply flex layout to button containers
        '.full-start-new__buttons {',
        '  display: flex !important;',
        '  flex-wrap: wrap !important;',
        '  gap: 0.5em !important;',
        '}',

        // ===== BUTTON ORDERING (CSS order property) =====
        // Torrents button: -30 (FIRST - highest priority)
        '.full-start-new__buttons .inmod-source-btn.inmod-torrent-btn {',
        '  order: -30 !important;',
        '}',
        // Priority button: -20 (after torrents)
        '.full-start-new__buttons .button--priority {',
        '  order: -20 !important;',
        '}',
        // Other cloned source buttons: -10 (after priority)
        '.full-start-new__buttons .inmod-source-btn:not(.inmod-torrent-btn) {',
        '  order: -10 !important;',
        '}',
        // All other buttons: 0 (last)
        '.full-start-new__buttons > .full-start__button:not(.inmod-source-btn):not(.button--priority) {',
        '  order: 0;',
        '}',

        // ===== WATCH BUTTON VISIBILITY =====
        // Hide Watch button ONLY when we have source buttons
        // The .inmod-sources-ready class is added AFTER buttons are cloned
        '.full-start-new.inmod-sources-ready .button--play:not(.button--priority) {',
        '  display: none !important;',
        '}',

        // ===== SOURCE BUTTON STYLING =====
        '.inmod-source-btn {',
        '  opacity: 1;',
        '}'
      ].join('\n');
    },

    /**
     * Get visible source buttons from the hidden container
     */
    getSourceButtons: function ($full) {
      return $full.find('.buttons--container > .full-start__button').filter(function () {
        var $btn = $(this);
        if ($btn.hasClass('hide')) return false;
        // Include known button types or any with selector class
        return $btn.hasClass('selector') ||
          $btn.hasClass('view--torrent') ||
          $btn.hasClass('view--trailer') ||
          $btn.hasClass('view--online');
      });
    },

    /**
     * Process a single card - clone source buttons to main area
     * This is designed to be called multiple times safely
     */
    processCard: function ($full) {
      if (!$full || !$full.length) return;
      if (!isEnabled() || !State.settings.show_online_buttons) return;

      var fullEl = $full[0];
      var $mainButtons = $full.find('.full-start-new__buttons').first();
      if (!$mainButtons.length) return;

      // Get visible source buttons
      var $sources = ButtonsManager.getSourceButtons($full);

      // Get priority hash for comparison
      var priorityHash = (Lampa.Storage.get('full_btn_priority', '') + '').trim();
      var $priority = $mainButtons.find('.button--priority');

      // Track our cloned buttons
      var ourClones = {};
      $mainButtons.find('.inmod-source-btn').each(function () {
        var id = $(this).attr('data-inmod-id');
        if (id) ourClones[id] = $(this);
      });

      // Track ALL buttons already in main area (including Lampa's own buttons)
      // This prevents duplicating buttons that Lampa already shows
      var existingInMain = {};
      $mainButtons.find('.full-start__button').each(function () {
        var $btn = $(this);
        // Skip our own clones (handled separately)
        if ($btn.hasClass('inmod-source-btn')) return;
        var id = ButtonsManager.getButtonId($btn);
        if (id) existingInMain[id] = true;
      });

      // Also track priority button ID to avoid duplicating it
      if ($priority.length) {
        var priorityId = ButtonsManager.getButtonId($priority);
        if (priorityId) existingInMain[priorityId] = true;
      }

      var seenIds = {};
      var toAdd = [];

      $sources.each(function () {
        var $src = $(this);
        var id = ButtonsManager.getButtonId($src);
        if (!id || seenIds[id]) return;
        seenIds[id] = true;

        // Skip priority button (Lampa handles it separately)
        if (priorityHash && ButtonsManager.getLampaHash($src) === priorityHash) return;

        // Skip if button with same ID already exists in main area (not our clone)
        if (existingInMain[id]) return;

        // If we already cloned this, keep it
        if (ourClones[id]) {
          delete ourClones[id];
          return;
        }

        // Create new clone
        var $clone = $src.clone()
          .addClass('selector inmod-source-btn')
          .removeClass('hide focus hover traverse')
          .attr('data-inmod-id', id);

        // Mark torrent button for first position
        if ($src.hasClass('view--torrent')) {
          $clone.addClass('inmod-torrent-btn');
        }

        // Forward events to original button
        (function (original) {
          $clone.on('hover:enter', function () {
            original.trigger('hover:enter');
          }).on('hover:long', function () {
            original.trigger('hover:long');
          });
        })($src);

        toAdd.push($clone);
      });

      // Remove stale clones (buttons no longer in source)
      for (var oldId in ourClones) {
        ourClones[oldId].remove();
      }

      // Insert new buttons in correct order
      // Torrents go FIRST (before priority), then other buttons
      var buttonsAdded = false;
      if (toAdd.length) {
        // Separate torrents from other buttons
        var torrents = [];
        var others = [];
        for (var i = 0; i < toAdd.length; i++) {
          if (toAdd[i].hasClass('inmod-torrent-btn')) {
            torrents.push(toAdd[i]);
          } else {
            others.push(toAdd[i]);
          }
        }

        // Insert torrents FIRST (at the very beginning)
        for (var t = 0; t < torrents.length; t++) {
          $mainButtons.prepend(torrents[t]);
        }

        // Insert other buttons after priority (if exists) or after torrents
        var $insertAfter = $priority.length ? $priority : (torrents.length > 0 ? torrents[torrents.length - 1] : null);
        for (var o = 0; o < others.length; o++) {
          if ($insertAfter) {
            others[o].insertAfter($insertAfter);
          } else {
            $mainButtons.prepend(others[o]);
          }
          $insertAfter = others[o];
        }

        buttonsAdded = true;
      }

      // Toggle visibility - add class only when we have buttons ready
      var hasSourceBtns = $mainButtons.find('.inmod-source-btn').length > 0;
      var hasPriority = $priority.length > 0;

      if (hasSourceBtns || hasPriority) {
        $full.addClass('inmod-sources-ready');
      } else {
        $full.removeClass('inmod-sources-ready');
      }

      // IMPORTANT: Update Lampa's Controller collection so new buttons are navigable
      // This must be done after adding buttons to DOM
      if (buttonsAdded || toAdd.length > 0) {
        ButtonsManager.refreshNavigation($full, false);
      }
    },

    /**
     * Refresh Lampa's navigation controller to include new buttons
     * Optionally focus on torrent button if available
     */
    refreshNavigation: function ($full, focusOnTorrents) {
      try {
        var controller = Lampa.Controller.enabled();
        if (controller && controller.name === 'full_start') {
          // Re-scan for selectable elements
          Lampa.Controller.collectionSet($full);

          // If requested, focus on torrent button
          if (focusOnTorrents) {
            var $buttons = $full.find('.full-start-new__buttons');
            var $torrentBtn = $buttons.find('.inmod-torrent-btn.selector:visible').first();
            if ($torrentBtn.length) {
              // Use longer delay to override Lampa's saved focus state
              setTimeout(function () {
                try {
                  Lampa.Controller.collectionSet($full);
                  Lampa.Controller.collectionFocus($torrentBtn[0], $full);
                } catch (e) {
                  Utils.log('Focus torrents error:', e);
                }
              }, 20);
            }
          }
        }
      } catch (e) {
        Utils.log('refreshNavigation error:', e);
      }
    },

    /**
     * Process all visible cards (for initial load)
     */
    processAll: function () {
      $('.full-start-new').each(function () {
        ButtonsManager.processCard($(this));
      });
    },

    /**
     * Reset - remove all our additions
     */
    reset: function () {
      $('.inmod-source-btn').remove();
      $('.full-start-new').removeClass('inmod-sources-ready');
      // Note: inmod-torrent-btn is removed with inmod-source-btn
    },

    /**
     * Apply global styles (called once at startup)
     */
    applyGlobalStyles: function () {
      Utils.addStyle('inmod_buttons', ButtonsManager.generateCSS());
    },

    /**
     * Remove global styles
     */
    removeGlobalStyles: function () {
      Utils.removeStyleById('inmod_buttons');
    },

    /**
     * Enable the button manager
     */
    enable: function () {
      if (!isEnabled() || !State.settings.show_online_buttons) {
        ButtonsManager.removeGlobalStyles();
        return;
      }

      // Apply CSS immediately - this is instant, no flash
      ButtonsManager.applyGlobalStyles();

      // Process any existing cards
      ButtonsManager.processAll();

      scheduleButtonsManagerRefresh();
    },

    /**
     * Disable the button manager
     */
    disable: function () {
      clearTimeout(State.intervals.buttonsDebounce);
      ButtonsManager.removeGlobalStyles();
      ButtonsManager.reset();
    }
  };

  // ============================================================================
  // SETTINGS MODULE
  // ============================================================================
  var Settings = {
    // Helper to properly parse boolean from storage (handles string "false")
    getBool: function (key, defaultVal) {
      var val = Lampa.Storage.get(key, defaultVal);
      if (typeof val === 'string') {
        return val !== 'false' && val !== '0' && val !== '';
      }
      return !!val;
    },

    // Helper to get value from storage with fallback to default
    getValue: function (key, defaultVal) {
      var stored = Lampa.Storage.get(key);
      return stored !== undefined && stored !== null ? stored : defaultVal;
    },

    // Load all settings from localStorage
    load: function () {
      Utils.log('Loading settings from storage...');

      State.settings.enabled = Settings.getBool('inmod_enabled', true);
      State.settings.theme = Settings.getValue('inmod_theme_selected', 'emerald');
      State.settings.seasons_info_mode = Settings.getValue('inmod_seasons_info_mode', 'aired');
      State.settings.label_position = Settings.getValue('inmod_label_position', 'top-right');
      State.settings.patch_online_icons = Settings.getBool('inmod_patch_online_icons', true);
      State.settings.show_movie_type = Settings.getBool('inmod_show_movie_type', true);
      State.settings.colored_ratings = Settings.getBool('inmod_colored_ratings', true);
      State.settings.colored_elements = Settings.getBool('inmod_colored_elements', true);
      State.settings.use_custom_styles = Settings.getBool('inmod_use_custom_styles', true);
      State.settings.show_online_buttons = Settings.getBool('inmod_show_online_buttons', true);
      State.settings.torrent_styles = Settings.getBool('inmod_torrent_styles', true);
      State.settings.force_lampa_settings = Settings.getBool('inmod_force_lampa_settings', false);

      Utils.log('Settings loaded:', State.settings);
    },

    // Save setting to storage and update state
    save: function (key, value) {
      try {
        Lampa.Storage.set(key, value);
        Utils.log('Setting saved:', key, '=', value);
      } catch (e) {
        Utils.log('Error saving setting:', key, e);
      }
    },

    register: function () {
      // Register settings component
      Lampa.SettingsApi.addComponent({
        component: 'inmod_settings',
        name: Utils.translate('inmod_title'),
        icon: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 5C4 4.44772 4.44772 4 5 4H19C19.5523 4 20 4.44772 20 5V7C20 7.55228 19.5523 8 19 8H5C4.44772 8 4 7.55228 4 7V5Z" fill="currentColor"/><path d="M4 11C4 10.4477 4.44772 10 5 10H19C19.5523 10 20 10.4477 20 11V13C20 13.5523 19.5523 14 19 14H5C4.44772 14 4 13.5523 4 13V11Z" fill="currentColor"/><path d="M4 17C4 16.4477 4.44772 16 5 16H19C19.5523 16 20 16.4477 20 17V19C20 19.5523 19.5523 20 19 20H5C4.44772 20 4 19.5523 4 19V17Z" fill="currentColor"/></svg>'
      });

      // Plugin info
      Lampa.SettingsApi.addParam({
        component: 'inmod_settings',
        param: { name: 'inmod_plugin_info', type: 'static' },
        field: {
          name: '<div style="display: flex; align-items: center; gap: 0.5em;"><span style="width: 1.5em; height: 1.5em;">' + PLUGIN_ICON + '</span><span style="background: linear-gradient(to right, #43cea2, #185a9d); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Interface Mod</span> <span style="opacity: 0.6;">v' + PLUGIN_VERSION + '</span></div>'
        },
        onRender: function (item) {
          item.css({ 'opacity': '0.8', 'margin-top': '1.5em', 'padding-top': '1em', 'border-top': '1px solid rgba(255,255,255,0.1)' });
          item.append('<div style="font-size: 0.85em; padding: 0 1.2em; line-height: 1.5; opacity: 0.7;">Автор: ' + PLUGIN_AUTHOR + '<br>Модификация интерфейса Lampa с темой Emerald и улучшенными стилями.</div>');
        }
      });

      // Enable/disable toggle
      Lampa.SettingsApi.addParam({
        component: 'inmod_settings',
        param: {
          name: 'inmod_enabled',
          type: 'trigger',
          default: State.settings.enabled !== undefined ? State.settings.enabled : true
        },
        field: { name: 'Включить плагин', description: 'Применять/отменять модификации интерфейса' },
        onChange: function (v) {
          State.settings.enabled = v;
          Settings.save('inmod_enabled', v);
          if (v) Features.enableAll();
          else Features.disableAll();
          Lampa.Noty.show(v
            ? 'Interface Mod включен — тема Emerald, стили и кнопки активированы'
            : 'Interface Mod выключен — восстановлен стандартный интерфейс Lampa');
        }
      });

      // Theme selection
      Lampa.SettingsApi.addParam({
        component: 'inmod_settings',
        param: {
          name: 'inmod_theme_selected',
          type: 'select',
          values: { emerald: 'Emerald', default: 'Lampa' },
          default: State.settings.theme || 'emerald'
        },
        field: { name: Utils.translate('maxsm_themes'), description: '' },
        onChange: function (v) {
          State.settings.theme = v;
          Settings.save('inmod_theme_selected', v);
          if (isEnabled()) Theme.apply(v);
        }
      });

      // Seasons info mode
      Lampa.SettingsApi.addParam({
        component: 'inmod_settings',
        param: { name: 'inmod_seasons_info_mode', type: 'select', values: { none: 'Выключить', aired: 'Актуальная информация', total: 'Полное количество' }, default: 'aired' },
        field: { name: 'Информация о сериях', description: 'Отображение на постерах' },
        onChange: function (v) {
          State.settings.seasons_info_mode = v;
          Settings.save('inmod_seasons_info_mode', v);
          if (v === 'none') SeasonInfo.remove();
          Lampa.Noty.show('Информация о сезонах обновится при следующем открытии карточки');
        }
      });

      // Label position
      Lampa.SettingsApi.addParam({
        component: 'inmod_settings',
        param: { name: 'inmod_label_position', type: 'select', values: { 'top-right': 'Верхний правый', 'top-left': 'Верхний левый', 'bottom-right': 'Нижний правый', 'bottom-left': 'Нижний левый' }, default: 'top-right' },
        field: { name: 'Позиция лейбла', description: '' },
        onChange: function (v) {
          State.settings.label_position = v;
          Settings.save('inmod_label_position', v);
          Lampa.Noty.show('Позиция лейбла обновится при следующем открытии карточки');
        }
      });

      // Custom styles
      Lampa.SettingsApi.addParam({
        component: 'inmod_settings',
        param: { name: 'inmod_use_custom_styles', type: 'trigger', default: true },
        field: { name: Utils.translate('inmod_use_styles'), description: Utils.translate('inmod_use_styles_descr') },
        onChange: function (v) {
          State.settings.use_custom_styles = v;
          Settings.save('inmod_use_custom_styles', v);
          if (v) {
            CustomStyles.enable();
            CardEnhancer.enable();
          } else {
            CardEnhancer.disable();
            CustomStyles.disable();
          }
        }
      });

      // Show online buttons
      Lampa.SettingsApi.addParam({
        component: 'inmod_settings',
        param: { name: 'inmod_show_online_buttons', type: 'trigger', default: true },
        field: { name: Utils.translate('inmod_show_online_buttons'), description: Utils.translate('inmod_show_online_buttons_descr') },
        onChange: function (v) {
          State.settings.show_online_buttons = v;
          Settings.save('inmod_show_online_buttons', v);

          if (!isEnabled()) return;

          if (v) {
            ButtonsManager.enable();
          } else {
            ButtonsManager.disable();
          }
        }
      });

      // Online icons
      Lampa.SettingsApi.addParam({
        component: 'inmod_settings',
        param: { name: 'inmod_patch_online_icons', type: 'trigger', default: true },
        field: { name: 'Иконки Online-провайдеров', description: 'Onlyskaz / DSO / Lampac' },
        onChange: function (v) {
          State.settings.patch_online_icons = v;
          Settings.save('inmod_patch_online_icons', v);
          if (!isEnabled()) return;
          if (v) OnlineIcons.enable();
          else OnlineIcons.disable();
        }
      });

      // Movie type labels
      Lampa.SettingsApi.addParam({
        component: 'inmod_settings',
        param: { name: 'inmod_show_movie_type', type: 'trigger', default: true },
        field: { name: 'Лейблы типа контента', description: 'Фильм / Сериал' },
        onChange: function (v) {
          State.settings.show_movie_type = v;
          Settings.save('inmod_show_movie_type', v);
          if (!isEnabled()) return;
          if (v) MovieTypeLabels.enable();
          else MovieTypeLabels.disable();
        }
      });

      // Colored ratings
      Lampa.SettingsApi.addParam({
        component: 'inmod_settings',
        param: { name: 'inmod_colored_ratings', type: 'trigger', default: true },
        field: { name: 'Цветные рейтинги', description: '' },
        onChange: function (v) {
          State.settings.colored_ratings = v;
          Settings.save('inmod_colored_ratings', v);
          if (!isEnabled()) return;
          if (v) ColoredRatings.enable();
          else ColoredRatings.disable();
        }
      });

      // Colored elements
      Lampa.SettingsApi.addParam({
        component: 'inmod_settings',
        param: { name: 'inmod_colored_elements', type: 'trigger', default: true },
        field: { name: 'Цветные статусы/возраст', description: '' },
        onChange: function (v) {
          State.settings.colored_elements = v;
          Settings.save('inmod_colored_elements', v);
          if (!isEnabled()) return;
          if (v) ColoredElements.enable();
          else ColoredElements.disable();
        }
      });

      // Torrent styles
      Lampa.SettingsApi.addParam({
        component: 'inmod_settings',
        param: { name: 'inmod_torrent_styles', type: 'trigger', default: true },
        field: { name: Utils.translate('inmod_torrent_styles'), description: Utils.translate('inmod_torrent_styles_descr') },
        onChange: function (v) {
          State.settings.torrent_styles = v;
          Settings.save('inmod_torrent_styles', v);
          if (!isEnabled()) return;
          if (v) TorrentStyles.enable();
          else TorrentStyles.disable();
        }
      });

      // Force Lampa settings
      Lampa.SettingsApi.addParam({
        component: 'inmod_settings',
        param: { name: 'inmod_force_lampa_settings', type: 'trigger', default: false },
        field: { name: Utils.translate('inmod_force_settings'), description: Utils.translate('inmod_force_settings_descr') },
        onChange: function (v) {
          State.settings.force_lampa_settings = v;
          Settings.save('inmod_force_lampa_settings', v);
        }
      });

      // Position settings in menu
      Lampa.Settings.listener.follow('open', function () {
        setTimeout(function () {
          var folder = $('.settings-folder[data-component="inmod_settings"]');
          var standard = $('.settings-folder[data-component="interface"]');
          if (folder.length && standard.length) folder.insertAfter(standard);
        }, 100);
      });
    }
  };

  // ============================================================================
  // FEATURES MANAGER
  // ============================================================================
  var Features = {
    enableAll: function () {
      if (!isEnabled()) return;

      LoaderStyles.enable();
      CustomStyles.enable();
      CardEnhancer.enable();  // Process cards to move elements
      Theme.apply(State.settings.theme);
      ButtonsManager.enable();
      OnlineIcons.enable();
      MovieTypeLabels.enable();
      ColoredRatings.enable();
      ColoredElements.enable();
      TorrentStyles.enable();
    },

    disableAll: function () {
      // Disconnect all observers
      Object.keys(State.observers).forEach(function (key) {
        Utils.safeDisconnect(State.observers[key]);
        delete State.observers[key];
      });

      // Clear all intervals
      Object.keys(State.intervals).forEach(function (key) {
        Utils.safeClearInterval(State.intervals[key]);
        delete State.intervals[key];
      });

      // Disable all modules
      CardEnhancer.disable();  // Restore card elements to original positions
      LoaderStyles.disable();
      CustomStyles.disable();
      Theme.disable();
      ButtonsManager.disable();
      OnlineIcons.disable();
      MovieTypeLabels.disable();
      ColoredRatings.disable();
      ColoredElements.disable();
      TorrentStyles.disable();
      SeasonInfo.remove();

      // Reset inline styles
      Utils.resetInlineStyles($('.full-start__status, .full-start__pg'));
      $(".card__vote, .full-start__rate, .full-start-new__rate, .info__rate").css('color', '');
    }
  };

  // ============================================================================
  // EVENT LISTENERS
  // ============================================================================
  function setupEventListeners() {
    if (State.eventsFollowed) return;
    State.eventsFollowed = true;

    // Main full card listener
    Lampa.Listener.follow('full', function (data) {
      if (!isEnabled()) return;

      // incremental DOM during lazy full card build (full.js emits type `build`)
      if (data.type === 'build' && data.body) {
        scheduleOnlineIconsPatch();
        scheduleButtonsManagerRefresh();
        scheduleRatingsRefresh();
        refreshCardsInRoot(data.body);
        if (data.name === 'start') {
          scheduleColoredElementsRefresh(data.body);
        }
      }

      // Reset on new card start
      if (data.type === 'start') {
        ButtonsManager.reset();
      }

      // Process on card complete
      if (data.type === 'complite' && data.data.movie) {
        var $render = $(data.object.activity.render());
        var $full = $render.find('.full-start-new');
        if (!$full.length) $full = $render.filter('.full-start-new');

        // Season Info
        SeasonInfo.add(data);

        // Movie Type labels
        MovieTypeLabels.addToFullPoster(data.data.movie, data.object.activity.render());

        // Colored elements
        setTimeout(function () {
          ColoredElements.updateAll(data.object.activity.render());
          ColoredRatings.update();
        }, 50);

        // Process buttons immediately
        if ($full.length && State.settings.show_online_buttons) {
          ButtonsManager.processCard($full);
          // Focus on torrents button after processing
          setTimeout(function () {
            ButtonsManager.refreshNavigation($full, true);
          }, 50);
        }

        scheduleOnlineIconsPatch();
        scheduleButtonsManagerRefresh();
        scheduleRatingsRefresh();
        scheduleColoredElementsRefresh($render);

        setTimeout(function () {
          scheduleButtonsManagerRefresh();
          scheduleOnlineIconsPatch();
          scheduleRatingsRefresh();
          try {
            scheduleColoredElementsRefresh($(data.object.activity.render()));
          } catch (e1) { }
        }, 150);

        setTimeout(function () {
          scheduleButtonsManagerRefresh();
          scheduleOnlineIconsPatch();
        }, 400);
      }

      // Also handle when card is already loaded and user returns to it
      // This happens when navigating back from torrent list or other screens
      if (data.type === 'render' || data.type === 'show') {
        setTimeout(function () {
          try {
            var active = Lampa.Activity.active();
            if (active && active.activity && active.activity.render) {
              var $render = $(active.activity.render());
              var $full = $render.find('.full-start-new');
              if (!$full.length) $full = $render.filter('.full-start-new');

              if ($full.length && $full.hasClass('inmod-sources-ready')) {
                // Ensure buttons are processed
                ButtonsManager.processCard($full);
                scheduleOnlineIconsPatch();
                scheduleButtonsManagerRefresh();
                // Always focus on torrents when returning
                ButtonsManager.refreshNavigation($full, true);
              }
            }
          } catch (e) {
            Utils.log('Return to card focus error:', e);
          }
        }, 30);
      }
    });

    Lampa.Listener.follow('activity', function (e) {
      if (!isEnabled()) return;
      if (!e || e.type !== 'start') return;

      if (e.component === 'full') {
        scheduleButtonsManagerRefresh();
        scheduleOnlineIconsPatch();
        scheduleRatingsRefresh();
        scheduleColoredElementsRefresh();
        setTimeout(scheduleButtonsManagerRefresh, 100);
        setTimeout(scheduleOnlineIconsPatch, 100);
      }

      if (e.component === 'torrents') {
        scheduleTorrentStylesSweep();
      }
    });

    Lampa.Listener.follow('line', function (e) {
      if (!isEnabled()) return;
      if (!e || (e.type !== 'append' && e.type !== 'create')) return;
      refreshCardsInRoot(e.body);
      scheduleRatingsRefresh();
    });

    // Fix focus when controller toggles to full_start
    // Always focus on torrents button when returning to card
    Lampa.Controller.listener.follow('toggle', function (e) {
      if (!isEnabled() || !State.settings.show_online_buttons) return;
      if (e.name !== 'full_start') return;

      // Process immediately when controller activates
      setTimeout(function () {
        try {
          var active = Lampa.Activity.active();
          if (!active || !active.activity || !active.activity.render) return;

          var $render = $(active.activity.render());
          var $full = $render.find('.full-start-new');
          if (!$full.length) $full = $render.filter('.full-start-new');
          if (!$full.length) return;

          // Process buttons first to ensure they're added
          ButtonsManager.processCard($full);
          scheduleOnlineIconsPatch();

          // If we've added sources, always focus on torrents
          if (!$full.hasClass('inmod-sources-ready')) return;

          var $buttons = $full.find('.full-start-new__buttons');
          var $torrentBtn = $buttons.find('.inmod-torrent-btn.selector:visible').first();

          if ($torrentBtn.length) {
            // Always focus on torrents when returning to card
            Lampa.Controller.collectionSet($full);
            Lampa.Controller.collectionFocus($torrentBtn[0], $full);
          } else {
            // Fallback: focus on first visible button if no torrents
            var $focused = $full.find('.button--play.focus:not(.button--priority)');
            if ($focused.length) {
              var $firstBtn = $buttons.find('.button--priority.selector:visible').first();
              if (!$firstBtn.length) {
                $firstBtn = $buttons.find('.inmod-source-btn.selector:visible').first();
              }
              if (!$firstBtn.length) {
                $firstBtn = $buttons.find('.selector:not(.hide):visible').first();
              }

              if ($firstBtn.length) {
                Lampa.Controller.collectionSet($full);
                Lampa.Controller.collectionFocus($firstBtn[0], $full);
              }
            }
          }
        } catch (err) {
          Utils.log('Focus fix error:', err);
        }
      }, 15);
    });
  }

  // ============================================================================
  // PLUGIN INITIALIZATION
  // ============================================================================
  function startPlugin() {
    Utils.log('Starting plugin v' + PLUGIN_VERSION);
    if (State.started) return;
    State.started = true;

    // Step 1: Register translations (needed for settings UI)
    registerTranslations();
    fixStatusTranslations();

    // Step 2: Load settings from localStorage FIRST
    // This ensures we have saved values before registering UI
    Settings.load();

    // Step 3: Register settings UI
    // Settings UI will use loaded values from State.settings
    Settings.register();

    // Step 4: Setup event listeners (before enabling features)
    setupEventListeners();

    // Step 5: Apply features ONLY if plugin is enabled
    // Features will use loaded settings from State.settings
    if (isEnabled()) {
      Utils.log('Plugin enabled, applying features...');
      Features.enableAll();
    } else {
      Utils.log('Plugin disabled, skipping features');
    }
  }

  // Register plugin manifest
  if (Lampa.Manifest && Lampa.Manifest.plugins) {
    Lampa.Manifest.plugins = {
      type: 'interface',
      version: PLUGIN_VERSION,
      name: 'Interface Mod',
      description: 'Модификация интерфейса Lampa с темой Emerald и улучшенными стилями',
      author: PLUGIN_AUTHOR,
      icon: PLUGIN_ICON
    };
  }

  // Start plugin when app is ready
  if (window.appready) {
    startPlugin();
  } else {
    Lampa.Listener.follow('app', function (event) {
      if (event.type === 'ready') {
        startPlugin();
      }
    });
  }

  // Expose for debugging
  if (State.debug) {
    window.interface_mod_v2 = {
      State: State,
      Utils: Utils,
      Features: Features
    };
  }

})();
