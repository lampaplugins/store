(function () {
  'use strict';

  var Storage = Lampa.Storage;
  var Lang = Lampa.Lang;
  var Platform = Lampa.Platform;

  Lang.add({
    nav_ext_settings_title: {
      en: 'Navigation Bar',
      ru: 'Навигационная панель'
    },
    nav_ext_scale_title: {
      en: 'Panel scale',
      ru: 'Масштаб панели'
    }
  });

  var config = {
    version: '1.0.0',
    plugin_name: 'navigation_bar',
    menuButtons: []
  };

  function t(key) {
    return Lang.translate(key) || key;
  }

  function extractMenuButtons() {
    var menuItems = [];
    var menuElement = document.querySelector('.menu__list');

    if (!menuElement) {
      return menuItems;
    }

    var items = menuElement.querySelectorAll('.menu__item[data-action]');

    items.forEach(function (item, index) {
      var action = item.getAttribute('data-action');
      var textElement = item.querySelector('.menu__text');
      var iconElement = item.querySelector('.menu__ico svg use');

      if (action && textElement) {
        var iconHref = iconElement ? iconElement.getAttribute('xlink:href') : null;
        var sprite = iconHref ? iconHref.replace('#sprite-', '') : 'home';

        menuItems.push({
          action: action,
          title: textElement.textContent.trim(),
          sprite: sprite,
          order: index,
          setting_key: 'nav_ext_enable_' + action
        });
      }
    });

    return menuItems;
  }

  function isButtonEnabled(buttonConfig) {
    return Storage.get(buttonConfig.setting_key, false);
  }

  function createButton(buttonConfig) {
    var html = '<div class="navigation-bar__item nav-ext-item" data-action="' + buttonConfig.action + '">';
    html += '    <div class="navigation-bar__icon">';
    html += '        <svg><use xlink:href="#sprite-' + buttonConfig.sprite + '"></use></svg>';
    html += '    </div>';
    html += '    <div class="navigation-bar__label">' + buttonConfig.title + '</div>';
    html += '</div>';
    return html;
  }

  function handleAction(action) {
    var menuItem = document.querySelector('.menu__item[data-action="' + action + '"]');

    if (menuItem) {
      $(menuItem).trigger('hover:enter');
      if (Lampa.Menu && Lampa.Menu.close) {
        Lampa.Menu.close();
      }
    } else {
      console.warn('NavBarExtension', 'Menu item not found for action:', action);
    }
  }

  function removeButtons() {
    var customButtons = document.querySelectorAll('.nav-ext-item');
    customButtons.forEach(function (btn) {
      btn.remove();
    });
  }

  function buildScaleValues() {
    var values = {};
    for (var p = 100; p <= 150; p += 5) {
      values[p.toString()] = p + '%';
    }
    return values;
  }

  function getScaleFactor() {
    var scale = Storage.get('nav_ext_scale', '100');
    var num = parseInt(scale, 10) / 100;
    if (num < 1) return 1;
    if (num > 1.5) return 1.5;
    return num;
  }

  function applyScale() {
    var bar = document.querySelector('.navigation-bar');
    if (!bar) return;
    var scaleFactor = getScaleFactor();
    bar.style.setProperty('--nav-ext-scale', String(scaleFactor));
  }

  function insertButtons() {
    var Platform = Lampa.Platform;

    if (!Platform.screen('mobile')) {
      return;
    }

    var navigationBar = document.querySelector('.navigation-bar__body');
    if (!navigationBar) return;

    removeButtons();

    if (config.menuButtons.length === 0) {
      config.menuButtons = extractMenuButtons();
      console.log('NavBarExtension', 'Extracted', config.menuButtons.length, 'buttons from menu');
    }

    var backButton = navigationBar.querySelector('[data-action="back"]');
    var searchButton = navigationBar.querySelector('[data-action="search"]');
    var mainButton = navigationBar.querySelector('[data-action="main"]');
    var settingsButton = navigationBar.querySelector('[data-action="settings"]');

    if (backButton) {
      backButton.classList.add('nav-ext-standard');
      backButton.style.order = '1';
    }
    if (searchButton) {
      searchButton.classList.add('nav-ext-standard');
      searchButton.style.order = '2';
    }
    if (mainButton) {
      mainButton.classList.add('nav-ext-standard', 'nav-ext-main');
      mainButton.style.order = '3';
    }

    var menuButtons = config.menuButtons.filter(function (btn) {
      return btn.action !== 'main' && btn.action !== 'settings' && isButtonEnabled(btn);
    }).sort(function (a, b) {
      return a.order - b.order;
    });

    var currentOrder = 4;
    menuButtons.forEach(function (buttonConfig) {
      var buttonElement = createButtonElement(buttonConfig);
      buttonElement.classList.add('nav-ext-custom');
      buttonElement.style.order = currentOrder.toString();
      currentOrder++;
      navigationBar.appendChild(buttonElement);
    });

    if (settingsButton) {
      settingsButton.classList.add('nav-ext-standard', 'nav-ext-settings');
      settingsButton.style.order = currentOrder.toString();
    }

    console.log('NavBarExtension', 'Total buttons:', 4 + menuButtons.length);
  }

  function createButtonElement(buttonConfig) {
    var buttonHtml = createButton(buttonConfig);
    var tempDiv = document.createElement('div');
    tempDiv.innerHTML = buttonHtml.trim();
    var buttonElement = tempDiv.firstChild;

    buttonElement.addEventListener('click', function () {
      handleAction(buttonConfig.action);
    });

    return buttonElement;
  }

  function addStyles() {
    var style = document.createElement('style');
    style.id = 'nav-ext-styles';
    style.textContent = `
            /* Масштаб задаётся через --nav-ext-scale на .navigation-bar (1 = 100%). Панель растёт вверх от нижнего края. */
            .navigation-bar {
                --nav-ext-scale: 1;
                overflow: visible !important;
                padding: 0 calc(1.5em * var(--nav-ext-scale)) calc(2em * var(--nav-ext-scale)) calc(1.5em * var(--nav-ext-scale)) !important;
                transition: padding 0.2s ease;
            }

            .navigation-bar__body {
                display: flex !important;
                flex-wrap: nowrap !important;
                align-items: center !important;
                justify-content: space-between !important;
                gap: 0 !important;
                padding: calc(0.8em * var(--nav-ext-scale)) calc(0.5em * var(--nav-ext-scale)) !important;
                overflow-x: auto;
                overflow-y: visible;
                flex-shrink: 0;
                border-radius: calc(1.4em * var(--nav-ext-scale)) !important;
                transition: padding 0.2s ease, border-radius 0.2s ease;
            }

            .navigation-bar__item {
                display: flex !important;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: opacity 0.2s ease, padding 0.2s ease;
                flex: 1 1 0;
                min-width: 0;
                min-height: 0;
                padding: 0 calc(0.3em * var(--nav-ext-scale));
                flex-shrink: 1;
            }

            .navigation-bar__item:hover,
            .navigation-bar__item:active {
                opacity: 0.7;
            }

            .nav-ext-main {
                font-weight: 500;
            }

            .navigation-bar__icon {
                width: calc(1.8em * var(--nav-ext-scale)) !important;
                height: calc(1.8em * var(--nav-ext-scale)) !important;
                margin: 0 auto calc(0.5em * var(--nav-ext-scale)) !important;
                flex-shrink: 0;
                transition: width 0.2s ease, height 0.2s ease, margin 0.2s ease;
            }

            .navigation-bar__icon svg {
                width: 100%;
                height: 100%;
            }

            .navigation-bar__label {
                font-size: calc(0.75em * var(--nav-ext-scale)) !important;
                margin-top: 0 !important;
                text-align: center;
                line-height: 1.2;
                word-wrap: break-word;
                max-width: 100%;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                transition: font-size 0.2s ease;
            }

            body.true--mobile.orientation--landscape .navigation-bar {
                padding: calc(1.5em * var(--nav-ext-scale)) !important;
                padding-left: 0 !important;
            }

            body.true--mobile.orientation--landscape .navigation-bar__body {
                padding: calc(0.5em * var(--nav-ext-scale)) calc(0.3em * var(--nav-ext-scale)) !important;
            }

            body.true--mobile.orientation--landscape .navigation-bar__item {
                padding: 0 calc(0.2em * var(--nav-ext-scale));
            }

            body.true--mobile.orientation--landscape .navigation-bar__icon {
                width: calc(1.5em * var(--nav-ext-scale)) !important;
                height: calc(1.5em * var(--nav-ext-scale)) !important;
                margin-bottom: calc(0.3em * var(--nav-ext-scale)) !important;
            }

            body.true--mobile.orientation--landscape .navigation-bar__label {
                font-size: calc(0.65em * var(--nav-ext-scale)) !important;
            }

            @media screen and (max-width: 380px) {
                .navigation-bar__body {
                    padding: calc(0.6em * var(--nav-ext-scale)) calc(0.3em * var(--nav-ext-scale)) !important;
                }

                .navigation-bar__item {
                    padding: 0 calc(0.2em * var(--nav-ext-scale));
                }

                .navigation-bar__icon {
                    width: calc(1.5em * var(--nav-ext-scale)) !important;
                    height: calc(1.5em * var(--nav-ext-scale)) !important;
                }

                .navigation-bar__label {
                    font-size: calc(0.65em * var(--nav-ext-scale)) !important;
                }
            }

            @media screen and (max-width: 320px) {
                .navigation-bar__body {
                    padding: calc(0.5em * var(--nav-ext-scale)) calc(0.2em * var(--nav-ext-scale)) !important;
                }

                .navigation-bar__item {
                    padding: 0 calc(0.1em * var(--nav-ext-scale));
                }

                .navigation-bar__icon {
                    width: calc(1.4em * var(--nav-ext-scale)) !important;
                    height: calc(1.4em * var(--nav-ext-scale)) !important;
                }

                .navigation-bar__label {
                    font-size: calc(0.6em * var(--nav-ext-scale)) !important;
                }
            }
        `;
    document.head.appendChild(style);
  }

  function addSettings() {
    Lampa.SettingsApi.addComponent({
      component: 'nav_bar_extension',
      name: t('nav_ext_settings_title'),
      icon: '<svg><use xlink:href="#sprite-favorite"></use></svg>'
    });

    setTimeout(function () {
      Lampa.SettingsApi.addParam({
        component: 'nav_bar_extension',
        param: {
          name: 'nav_ext_scale',
          type: 'select',
          values: buildScaleValues(),
          default: '100'
        },
        field: {
          name: t('nav_ext_scale_title')
        },
        onRender: function (item) {
          item.on('change', function () {
            applyScale();
          });
        }
      });

      if (config.menuButtons.length === 0) {
        config.menuButtons = extractMenuButtons();
      }

      config.menuButtons
        .filter(function (btn) {
          return btn.action !== 'main' && btn.action !== 'settings';
        })
        .forEach(function (button) {
          Lampa.SettingsApi.addParam({
            component: 'nav_bar_extension',
            param: {
              name: button.setting_key,
              type: 'trigger',
              default: false
            },
            field: {
              name: button.title
            },
            onRender: function (item) {
              item.on('change', insertButtons);
            }
          });
        });
    }, 1000);
  }

  function waitForElements(selectors, callback, maxAttempts) {
    var attempts = 0;
    var interval = setInterval(function () {
      attempts++;

      var elements = selectors.map(function (selector) {
        return document.querySelector(selector);
      });

      var allFound = elements.every(function (el) {
        return el !== null;
      });

      if (allFound) {
        clearInterval(interval);
        callback(elements);
      } else if (attempts >= maxAttempts) {
        clearInterval(interval);
        console.warn('NavBarExtension', 'Timeout waiting for elements:', selectors);
      }
    }, 500);
  }

  function init() {
    if (!Platform.screen('mobile')) {
      console.log('NavBarExtension', 'Plugin skipped - not a mobile platform');
      return;
    }

    console.log('NavBarExtension', 'Plugin loaded, version:', config.version);

    addSettings();

    if (!document.getElementById('nav-ext-styles')) {
      addStyles();
    }

    waitForElements(['.navigation-bar__body', '.menu__list'], function (elements) {
      config.menuButtons = extractMenuButtons();
      console.log('NavBarExtension', 'Extracted', config.menuButtons.length, 'menu buttons');
      insertButtons();
      applyScale();
    }, 30);

    Lampa.Storage.listener.follow('change', function (e) {
      if (e.name && e.name.indexOf('nav_ext_enable_') === 0) {
        setTimeout(insertButtons, 100);
      }
      if (e.name === 'nav_ext_scale') {
        applyScale();
      }
    });

    Lampa.Listener.follow('menu', function (event) {
      if (event.type === 'end') {
        setTimeout(function () {
          config.menuButtons = extractMenuButtons();
          insertButtons();
        }, 500);
      }
    });

    var orientationQuery = window.matchMedia('(orientation: landscape)');
    if (orientationQuery.addListener) {
      orientationQuery.addListener(applyScale);
    }
    if (orientationQuery.addEventListener) {
      orientationQuery.addEventListener('change', applyScale);
    }

    console.log('NavBarExtension', 'Plugin initialized');
  }

  if (window.appready) {
    init();
  } else {
    Lampa.Listener.follow('app', function (event) {
      if (event.type === 'ready') {
        init();
      }
    });
  }

})();
