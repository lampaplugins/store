(function () {
  'use strict';

  function patchInput() {
    if (typeof Lampa === 'undefined' || !Lampa.Input || typeof Lampa.Input.edit !== 'function') {
      return;
    }
    var original = Lampa.Input.edit;
    Lampa.Input.edit = function (params, callback) {
      var p = Object.assign({}, params || {});
      if (p.nomic !== false) {
        p.nomic = true;
      }
      return original.call(this, p, callback);
    };
  }

  function refocusInput(el) {
    if (typeof jQuery === 'undefined' || typeof Lampa === 'undefined' ||
      !Lampa.Controller || typeof Lampa.Controller.collectionSet !== 'function') {
      return;
    }
    try {
      if (!el || !el.ownerDocument || !el.ownerDocument.body.contains(el)) {
        return;
      }
      var $kb = jQuery(el);
      var $inp = $kb.find('.simple-keyboard-input').first();
      Lampa.Controller.collectionSet($kb);
      if (typeof Lampa.Controller.collectionFocus === 'function') {
        if ($inp.length) {
          Lampa.Controller.collectionFocus($inp, $kb);
          try {
            if ($inp[0] && typeof $inp[0].focus === 'function') {
              $inp[0].focus();
            }
          } catch (ignore) { }
        } else {
          Lampa.Controller.collectionFocus(false, $kb);
        }
      }
    } catch (ignore) { }
  }

  function stripMic(el) {
    if (!el || !el.querySelectorAll) {
      return false;
    }

    var removed = false;
    var micWidgets = el.querySelectorAll('.simple-keyboard-mic');
    var i;
    for (i = 0; i < micWidgets.length; i++) {
      micWidgets[i].remove();
      removed = true;
    }

    var micKeys = el.querySelectorAll('[data-skbtn="{MIC}"], [data-skbtn="{mic}"]');
    for (i = 0; i < micKeys.length; i++) {
      micKeys[i].remove();
      removed = true;
    }

    if (removed) {
      el.classList.remove('simple-keyboard--with-mic');
      refocusInput(el);
      requestAnimationFrame(function () {
        refocusInput(el);
      });
      setTimeout(function () {
        refocusInput(el);
      }, 0);
    }

    return removed;
  }

  function stripAllMics() {
    var nodes = document.querySelectorAll('.simple-keyboard');
    var k;
    for (k = 0; k < nodes.length; k++) {
      stripMic(nodes[k]);
    }
  }

  function onKeyboardBack() {
    if (typeof window === 'undefined' || typeof Lampa === 'undefined' || !Lampa.Controller) {
      return;
    }
    window.addEventListener(
      'keydown',
      function (e) {
        try {
          if (e.repeat) {
            return;
          }
          var code = e.keyCode != null ? e.keyCode : e.which;
          var key = e.key || '';
          var isBack =
            code === 27 ||
            code === 461 ||
            code === 10009 ||
            key === 'Escape';
          if (!isBack) {
            return;
          }
          var en = Lampa.Controller.enabled && Lampa.Controller.enabled();
          if (!en || en.name !== 'keybord') {
            return;
          }
          var active = document.activeElement;
          if (!active || !active.classList || !active.classList.contains('simple-keyboard-input')) {
            return;
          }
          if (e.defaultPrevented) {
            return;
          }
          e.preventDefault();
          e.stopPropagation();
          Lampa.Controller.back();
        } catch (ignore) { }
      },
      true
    );
  }

  function onKeyboardToggle() {
    if (typeof Lampa === 'undefined' || !Lampa.Controller || !Lampa.Controller.listener ||
      typeof Lampa.Controller.listener.follow !== 'function') {
      return;
    }

    function afterOpen() {
      requestAnimationFrame(function () {
        stripAllMics();
        requestAnimationFrame(function () {
          stripAllMics();
          var nodes = document.querySelectorAll('.simple-keyboard');
          var k;
          for (k = 0; k < nodes.length; k++) {
            refocusInput(nodes[k]);
          }
        });
      });
    }

    Lampa.Controller.listener.follow('toggle', function (event) {
      if (event && event.name === 'keybord') {
        afterOpen();
      }
    });
  }

  function init() {
    patchInput();
    onKeyboardBack();
    onKeyboardToggle();
  }

  if (typeof Lampa !== 'undefined') {
    init();
  } else {
    var wait = setInterval(function () {
      if (typeof Lampa !== 'undefined') {
        clearInterval(wait);
        init();
      }
    }, 10);

    setTimeout(function () {
      clearInterval(wait);
    }, 5000);
  }
})();
