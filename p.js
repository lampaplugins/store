(function () {
    'use strict';

    if (window.plugin_podborki_ready) return;
    window.plugin_podborki_ready = true;
  
    var ICON_TV = '<svg width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M117.294 33.2183H10.7061C9.05531 33.2183 7.47218 33.874 6.30494 35.0413C5.13769 36.2085 4.48193 37.7916 4.48193 39.4424V105.184C4.48193 106.835 5.13769 108.418 6.30494 109.585C7.47218 110.753 9.05531 111.408 10.7061 111.408H117.294C118.944 111.408 120.527 110.753 121.695 109.585C122.862 108.418 123.518 106.835 123.518 105.184V39.4424C123.518 37.7916 122.862 36.2085 121.695 35.0413C120.527 33.874 118.944 33.2183 117.294 33.2183ZM26.3207 91.8648C26.3184 93.7967 25.5494 95.6488 24.1825 97.0141C22.8156 98.3793 20.9627 99.1462 19.0307 99.1462C17.0988 99.1462 15.2459 98.3793 13.879 97.0141C12.5121 95.6488 11.7431 93.7967 11.7408 91.8648V52.7619C11.7431 50.8299 12.5121 48.9779 13.879 47.6126C15.2459 46.2473 17.0988 45.4805 19.0307 45.4805C20.9627 45.4805 22.8156 46.2473 24.1825 47.6126C25.5494 48.9779 26.3184 50.8299 26.3207 52.7619V91.8648ZM94.3624 96.434C94.1861 97.6065 93.6341 98.6901 92.7893 99.522C91.9445 100.354 90.8526 100.889 89.6775 101.047C72.6791 103.371 55.4432 103.368 38.4455 101.039C37.2823 100.883 36.1999 100.357 35.3582 99.5391C34.5164 98.7212 33.9597 97.6544 33.7702 96.4961C31.2966 80.4885 31.3147 64.1946 33.824 48.1926C34.0002 47.0201 34.5523 45.9366 35.397 45.1047C36.2418 44.2728 37.3338 43.7375 38.5088 43.5793C55.5073 41.2555 72.7431 41.2584 89.7408 43.5879C90.9041 43.7439 91.9864 44.2697 92.8282 45.0876C93.67 45.9055 94.2267 46.9722 94.4162 48.1305C96.8898 64.1381 96.8716 80.432 94.3624 96.434ZM116.445 91.8648C116.443 93.7967 115.674 95.6488 114.307 97.0141C112.94 98.3793 111.087 99.1462 109.156 99.1462C107.224 99.1462 105.371 98.3793 104.004 97.0141C102.637 95.6488 101.868 93.7967 101.866 91.8648V52.7619C101.868 50.8299 102.637 48.9779 104.004 47.6126C105.371 46.2473 107.224 45.4805 109.156 45.4805C111.087 45.4805 112.94 46.2473 114.307 47.6126C115.674 48.9779 116.443 50.8299 116.445 52.7619V91.8648Z" fill="currentColor"></path><path d="M41.6168 51.4161C39.6321 65.2724 39.6033 79.3388 41.5312 93.2031C51.3303 72.6982 66.3718 58.7718 86.6559 51.4239C71.7015 49.5501 56.5719 49.5475 41.6168 51.4161Z" fill="currentColor"></path><path d="M17.9078 122.941C17.7765 123.294 17.7324 123.674 17.7796 124.047C17.8267 124.421 17.9636 124.778 18.1785 125.087C18.3934 125.397 18.68 125.649 19.0138 125.824C19.3476 125.998 19.7186 126.089 20.0953 126.089H30.5842C30.9612 126.089 31.3327 125.998 31.6667 125.823C32.0008 125.648 32.2875 125.395 32.5023 125.085L37.4 118.021H19.7391L17.9078 122.941Z" fill="currentColor"></path><path d="M108.448 118.021H90.7793L95.6771 125.092C95.8919 125.402 96.1787 125.656 96.5128 125.831C96.847 126.006 97.2185 126.097 97.5958 126.097H108.093C108.469 126.097 108.84 126.006 109.174 125.832C109.508 125.657 109.795 125.405 110.009 125.095C110.224 124.786 110.361 124.429 110.409 124.056C110.456 123.682 110.412 123.303 110.281 122.95L108.448 118.021Z" fill="currentColor"></path><path d="M26.7978 7.14924L48.8866 16.1234C44.5656 18.7137 41.6351 22.3844 40.9866 26.5278H87.2005C86.552 22.3845 83.6214 18.7138 79.3005 16.1234L101.39 7.14924C102.059 6.87742 102.592 6.35093 102.873 5.6856C103.154 5.02026 103.159 4.27059 102.887 3.60149C102.616 2.93239 102.089 2.39868 101.424 2.11776C100.758 1.83685 100.009 1.83174 99.3397 2.10356L72.0828 13.1772C66.8369 11.87 61.3504 11.87 56.1045 13.1772L28.8476 2.10356C28.5163 1.96897 28.1617 1.90095 27.8041 1.90338C27.4466 1.90582 27.0929 1.97866 26.7635 2.11776C26.4341 2.25685 26.1352 2.45947 25.8841 2.71405C25.633 2.96863 25.4344 3.27018 25.2999 3.60148C25.1653 3.93279 25.0972 4.28736 25.0997 4.64495C25.1021 5.00254 25.175 5.35615 25.314 5.68559C25.4531 6.01503 25.6558 6.31385 25.9103 6.56498C26.1649 6.81612 26.4665 7.01465 26.7978 7.14924Z" fill="currentColor"></path></svg>';
    var ICON_HD = '<svg xmlns="http://www.w3.org/2000/svg" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" image-rendering="optimizeQuality" fill-rule="evenodd" clip-rule="evenodd" viewBox="0 0 512 414.89" height="30" fill="currentColor"><path fill-rule="nonzero" d="M189.688 279.224V256.79H119.88v-30.267l57.765-90.857h49.345v90.857h16.546v30.267H226.99v22.434h-37.302zM80.058 0h351.889c21.902 0 41.854 9.115 56.353 23.619C502.917 38.236 512 58.373 512 80.226v254.438c0 21.804-9.175 41.898-23.766 56.477-14.574 14.58-34.591 23.749-56.287 23.749H80.058c-21.744 0-41.827-9.076-56.423-23.683C9.121 376.698 0 356.686 0 334.664V80.226c0-22.065 9.028-42.131 23.57-56.672C38.101 9.022 58.101 0 80.058 0zm351.889 33.331H80.058c-13.004 0-24.792 5.286-33.293 13.787-8.496 8.495-13.771 20.218-13.771 33.108v254.438c0 12.809 5.34 24.488 13.836 32.978 8.577 8.583 20.403 13.917 33.228 13.917h351.889c12.744 0 24.515-5.399 33.092-13.982 8.572-8.566 13.967-20.283 13.967-32.913V80.226c0-12.711-5.33-24.471-13.901-33.043-8.501-8.501-20.24-13.852-33.158-13.852zM261.456 279.224V135.666h38.981v58.058h1.972l43.163-58.058H391l-48.519 63.946 49.639 79.612h-46.548l-32.239-53.82-12.896 16.812v37.008h-38.981zm-70.915-52.701v-50.464h-1.119l-31.12 49.345v1.119h32.239z"></path></svg>';
    var ICON_MULT = '<svg viewBox="0 0 514 514" xmlns="http://www.w3.org/2000/svg"><path d="m400 2c-79 6-142 75-142 156v14h-99l-98 1-5 2c-38 17-23 63 21 65h15l-3 6c-10 20-10 24-11 76v45l-5-8c-7-12-13-26-18-39-5-15-6-17-11-21-13-12-35-7-41 10-6 16 17 70 46 105 116 145 347 127 439-34 31-54 31-87-1-87-15 0-21 5-28 27-6 18-28 58-31 58-1 0-1-22-1-49v-50l-11-55c-12-60-12-58-6-63 8-7 15-3 24 11 14 24 29 30 47 21 20-9 21-17 10-71-10-52-10-53 2-53s21-14 20-28c-1-6-2-7-10-13-30-20-65-29-103-26m43 74c-10 3-14 17-6 25 13 13 32-4 23-19-3-5-11-8-17-6m-289 114v27l1 26 2 3 3 3h46 46l3-3 2-3v-27-27h-51c-36 0-51 0-52 1m78 116c-54 9-96 54-102 109l-1 6 10 6c70 45 158 47 230 4 9-5 8-4 7-15-7-71-73-122-144-110" fill="currentColor" fill-rule="evenodd"/></svg>';
    var ICON_ANIME = '<svg height="173" viewBox="0 0 180 173" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M126 3C126 18.464 109.435 31 89 31C68.5655 31 52 18.464 52 3C52 2.4505 52.0209 1.90466 52.0622 1.36298C21.3146 15.6761 0 46.8489 0 83C0 132.706 40.2944 173 90 173C139.706 173 180 132.706 180 83C180 46.0344 157.714 14.2739 125.845 0.421326C125.948 1.27051 126 2.13062 126 3ZM88.5 169C125.779 169 156 141.466 156 107.5C156 84.6425 142.314 64.6974 122 54.0966C116.6 51.2787 110.733 55.1047 104.529 59.1496C99.3914 62.4998 94.0231 66 88.5 66C82.9769 66 77.6086 62.4998 72.4707 59.1496C66.2673 55.1047 60.3995 51.2787 55 54.0966C34.6864 64.6974 21 84.6425 21 107.5C21 141.466 51.2208 169 88.5 169Z" fill="currentColor"></path><path d="M133 121.5C133 143.315 114.196 161 91 161C67.804 161 49 143.315 49 121.5C49 99.6848 67.804 116.5 91 116.5C114.196 116.5 133 99.6848 133 121.5Z" fill="currentColor"></path><path d="M72 81C72 89.8366 66.1797 97 59 97C51.8203 97 46 89.8366 46 81C46 72.1634 51.8203 65 59 65C66.1797 65 72 72.1634 72 81Z" fill="currentColor"></path><path d="M131 81C131 89.8366 125.18 97 118 97C110.82 97 105 89.8366 105 81C105 72.1634 110.82 65 118 65C125.18 65 131 72.1634 131 81Z" fill="currentColor"></path></svg>';
    var ICON_KIDS = '<svg fill="currentColor" version="1.1" viewBox="0 0 76.688 76.687" xmlns="http://www.w3.org/2000/svg"><g><path d="M75.191,30.104h-0.598c-0.574-6.778-4.99-12.47-11.062-14.894C57.993,7.232,48.773,1.992,38.345,1.992c-10.427,0-19.647,5.237-25.187,13.217c-6.07,2.424-10.485,8.114-11.06,14.895H1.5c-0.828,0-1.5,0.673-1.5,1.5c0,0.828,0.672,1.5,1.5,1.5h0.598C2.56,38.56,5.502,43.321,9.802,46.233l4.249,27.192c0.114,0.73,0.743,1.271,1.482,1.271h11.248c0.828,0,1.5-0.672,1.5-1.5c0-5.55,4.515-10.063,10.063-10.063c5.548,0,10.063,4.517,10.063,10.063c0,0.828,0.672,1.5,1.5,1.5h11.248c0.737,0,1.366-0.539,1.479-1.271l4.25-27.192c4.301-2.914,7.242-7.673,7.703-13.129h0.6c0.826,0,1.5-0.672,1.5-1.5C76.689,30.777,76.02,30.104,75.191,30.104z M38.345,4.992c8.084,0,15.374,3.49,20.434,9.042c-0.582-0.059-1.172-0.09-1.77-0.09c-9.229,0-16.816,7.123-17.582,16.157h-2.167c-0.765-9.034-8.352-16.156-17.582-16.156c-0.597,0-1.186,0.03-1.768,0.09C22.972,8.484,30.259,4.992,38.345,4.992z"/></g></svg>';
    var ICON_SETTINGS = '<svg height="36" viewBox="0 0 38 36" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="8" width="34" height="21" rx="3" stroke="currentColor" stroke-width="3"/><line x1="13.0925" y1="2.34874" x2="16.3487" y2="6.90754" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><line x1="1.5" y1="-1.5" x2="9.31665" y2="-1.5" transform="matrix(-0.757816 0.652468 0.652468 0.757816 26.197 2)" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><line x1="9.5" y1="34.5" x2="29.5" y2="34.5" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>';


    var CATEGORIES = [
        {
            key: 'hd', title: 'В качестве', icon: ICON_HD,
            group: 'main', default: '0',
            activity: {
                url: '?cat=&sort=now&uhd=true',
                title: 'В качестве',
                component: 'category_full',
                source: 'cub',
                sort: 'now',
                card_type: 'true',
                page: 1
            }
        },
        {
            key: 'rus', title: 'Русские', icon: ICON_TV,
            group: 'main', default: '0',
            activity: {
                url: '?cat=movie&airdate=2023-2026&without_genres=16&language=ru',
                title: 'Русские фильмы',
                component: 'category_full',
                source: 'cub',
                card_type: 'true',
                page: 1
            }
        },
        {
            key: 'kr', title: 'Дорамы', icon: ICON_TV,
            group: 'main', default: '0',
            activity: {
                url: '?cat=tv&without_genres=16&language=ko&sort=top',
                title: 'Дорамы',
                component: 'category_full',
                source: 'cub',
                card_type: 'true',
                page: 1
            }
        },

        // ─── Российские стриминги ───
        {
            key: 'okko', title: 'Okko', icon: ICON_TV,
            group: 'main', default: '0',
            activity: {
                url: 'discover/tv?with_networks=3871',
                title: 'Okko', component: 'category_full',
                source: 'tmdb', sort: 'now', card_type: 'true', page: 1
            }
        },
        {
            key: 'kp', title: 'Кинопоиск', icon: ICON_TV,
            group: 'main', default: '0',
            activity: {
                url: 'discover/tv?with_networks=3827',
                title: 'Кинопоиск', component: 'category_full',
                source: 'tmdb', sort: 'now', card_type: 'true', page: 1
            }
        },
        {
            key: 'ivi', title: 'ИВИ', icon: ICON_TV,
            group: 'main', default: '0',
            activity: {
                url: 'discover/tv?with_networks=3923',
                title: 'ИВИ', component: 'category_full',
                source: 'tmdb', sort: 'now', card_type: 'true', page: 1
            }
        },
        {
            key: 'wink', title: 'Wink', icon: ICON_TV,
            group: 'main', default: '0',
            activity: {
                url: 'discover/tv?with_networks=5806',
                title: 'Wink', component: 'category_full',
                source: 'tmdb', sort: 'now', card_type: 'true', page: 1
            }
        },
        {
            key: 'kion', title: 'KION', icon: ICON_TV,
            group: 'main', default: '0',
            activity: {
                url: 'discover/tv?with_networks=4085',
                title: 'KION', component: 'category_full',
                source: 'tmdb', sort: 'now', card_type: 'true', page: 1
            }
        },
        {
            key: 'premier', title: 'Premier', icon: ICON_TV,
            group: 'main', default: '0',
            activity: {
                url: 'discover/tv?with_networks=2452',
                title: 'Premier', component: 'category_full',
                source: 'tmdb', sort: 'now', card_type: 'true', page: 1
            }
        },
        {
            key: 'start', title: 'START', icon: ICON_TV,
            group: 'main', default: '0',
            activity: {
                url: 'discover/tv?with_networks=2493',
                title: 'START', component: 'category_full',
                source: 'tmdb', sort: 'now', card_type: 'true', page: 1
            }
        },
        {
            key: 'amediateka', title: 'Amediateka', icon: ICON_TV,
            group: 'main', default: '0',
            activity: {
                url: 'discover/tv?with_networks=2581',
                title: 'Amediateka', component: 'category_full',
                source: 'tmdb', sort: 'now', card_type: 'true', page: 1
            }
        },

        // ─── Зарубежные стриминги ───
        {
            key: 'netflix', title: 'Netflix', icon: ICON_TV,
            group: 'main', default: '0',
            activity: {
                url: 'discover/tv?with_networks=213',
                title: 'Netflix', component: 'category_full',
                source: 'tmdb', sort: 'now', card_type: 'true', page: 1
            }
        },
        {
            key: 'hbo', title: 'HBO', icon: ICON_TV,
            group: 'main', default: '0',
            activity: {
                url: 'discover/tv?with_networks=49',
                title: 'HBO', component: 'category_full',
                source: 'tmdb', sort: 'now', card_type: 'true', page: 1
            }
        },
        {
            key: 'disney_plus', title: 'Disney+', icon: ICON_TV,
            group: 'main', default: '0',
            activity: {
                url: 'discover/tv?with_networks=2739',
                title: 'Disney+', component: 'category_full',
                source: 'tmdb', sort: 'now', card_type: 'true', page: 1
            }
        },
        {
            key: 'apple_tv', title: 'Apple TV+', icon: ICON_TV,
            group: 'main', default: '0',
            activity: {
                url: 'discover/tv?with_networks=2552',
                title: 'Apple TV+', component: 'category_full',
                source: 'tmdb', sort: 'now', card_type: 'true', page: 1
            }
        },
        {
            key: 'prime', title: 'Prime Video', icon: ICON_TV,
            group: 'main', default: '0',
            activity: {
                url: 'discover/tv?with_networks=1024',
                title: 'Prime Video', component: 'category_full',
                source: 'tmdb', sort: 'now', card_type: 'true', page: 1
            }
        },

        // ─── Детям ───
        {
            key: 'mult_cub', title: 'Мультфильмы', icon: ICON_KIDS,
            group: 'kids', default: '1',
            activity: {
                url: '',
                title: 'Мультфильмы',
                component: 'category',
                genres: 16, id: 16,
                source: 'cub', card_type: true, page: 1
            }
        },
        {
            key: 'mult_tmdb', title: 'Мультфильмы (TMDB)', icon: ICON_MULT,
            group: 'kids', default: '0',
            activity: {
                url: 'discover/movie?with_genres=10751,16&sort_by=revenue.desc&with_original_language=ru|uk|en|be|zh|cn',
                title: 'Мультфильмы (TMDB)',
                component: 'category_full',
                source: 'tmdb', genres: 16, sort: 'now', card_type: 'true', page: 1
            }
        },
        {
            key: 'mult_series', title: 'Мультсериалы', icon: ICON_MULT,
            group: 'kids', default: '0',
            activity: {
                url: 'discover/tv?with_genres=10762,16&sort_by=revenue.desc&with_original_language=ru|uk|en|be|cn',
                title: 'Мультсериалы',
                component: 'category_full', genres: 16,
                source: 'tmdb', sort: 'now', card_type: 'true', page: 1
            }
        },
        {
            key: 'nickelodeon', title: 'Nickelodeon', icon: ICON_MULT,
            group: 'kids', default: '0',
            activity: {
                url: 'discover/tv?with_networks=13',
                title: 'Nickelodeon', component: 'category_full',
                source: 'tmdb', sort: 'now', card_type: 'true', page: 1
            }
        },
        {
            key: 'disney_mult', title: 'Disney (мульты)', icon: ICON_MULT,
            group: 'kids', default: '0',
            activity: {
                url: 'discover/movie?with_genres=16&with_companies=2',
                title: 'Disney — мультфильмы',
                component: 'category_full',
                source: 'tmdb', sort: 'now', card_type: 'true', page: 1
            }
        },
        {
            key: 'ghibli', title: 'Studio Ghibli', icon: ICON_ANIME,
            group: 'kids', default: '0',
            activity: {
                url: 'discover/movie?with_companies=10342',
                title: 'Studio Ghibli',
                component: 'category_full',
                source: 'tmdb', sort: 'now', card_type: 'true', page: 1
            }
        },
        {
            key: 'animes', title: 'Anime', icon: ICON_ANIME,
            group: 'kids', default: '0',
            activity: {
                url: 'keyword/210024/movies?include_adult=false',
                title: 'Аниме',
                component: 'category_full',
                source: 'tmdb', sort: 'now', card_type: 'true', page: 1
            }
        }
    ];

    function storageKey(cat) {
        return 'podborki_' + cat.key;
    }

    function buildItem(cat) {
        var $li = $(
            '<li class="menu__item selector" data-action="' + cat.key + '">' +
                '<div class="menu__ico">' + cat.icon + '</div>' +
                '<div class="menu__text">' + cat.title + '</div>' +
            '</li>'
        );

        $li.on('hover:enter', function () {
            // Клонируем activity, чтобы Lampa не мутировала наш конфиг
            var activity = $.extend(true, {}, cat.activity);
            Lampa.Activity.push(activity);
        });

        return $li;
    }

    function showCategory(cat) {
        if ($('.menu .menu__list [data-action="' + cat.key + '"]').length) return;
        $('.menu .menu__list').eq(0).append(buildItem(cat));
    }

    function hideCategory(cat) {
        $('.menu .menu__list [data-action="' + cat.key + '"]').remove();
    }

    function applyCategory(cat) {
        var value = Lampa.Storage.get(storageKey(cat), cat.default);
        if (value == '1') showCategory(cat);
        else hideCategory(cat);
    }

    function registerSettings() {
        Lampa.SettingsApi.addComponent({
            component: 'podborki',
            icon: ICON_SETTINGS,
            name: 'Подборки'
        });

        Lampa.SettingsApi.addComponent({
            component: 'podborki_kids',
            icon: ICON_MULT,
            name: 'Детям'
        });

        CATEGORIES.forEach(function (cat) {
            var component = cat.group === 'kids' ? 'podborki_kids' : 'podborki';

            Lampa.SettingsApi.addParam({
                component: component,
                param: {
                    name: storageKey(cat),
                    type: 'select',
                    values: { 1: 'Показать', 0: 'Скрыть' },
                    default: cat.default
                },
                field: { name: cat.title },
                onChange: function (value) {
                    Lampa.Storage.set(storageKey(cat), value);
                    applyCategory(cat);
                }
            });
        });
    }

    function init() {
        setTimeout(function () {
            CATEGORIES.forEach(applyCategory);
        }, 500);

        registerSettings();
    }

    if (window.appready) {
        init();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') init();
        });
    }
})();
