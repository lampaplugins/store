(function () {
  'use strict';

  Lampa.Platform.tv();

  try {
    localStorage.setItem(
      "widget_mirror_list",
      JSON.stringify(["lampa.mx", "lampa.byskaz.ru"])
    );
  } catch (e) {
    console.error("Failed to write widget_mirror_list to localStorage:", e);
  }

})();
