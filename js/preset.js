(function () {
    'use strict';
    
    angular.module('bingo')
      .factory('PresetService', ['ANIME_EN', 'ANIME_RU', 'MOVIES_EN', function(ANIME_EN, ANIME_RU, MOVIES_EN) {
        const presets = {
          'movies-en': {
            name: 'Movie Cliches [English]',
            items: MOVIES_EN
          },
          'anime-en': {
            name: 'Anime Cliches [English]',
            items: ANIME_EN
          },
          'anime-ru': {
            name: 'Anime Cliches [Russian]',
            items: ANIME_RU
          }
        };
  
        // Return presets immediately
        return {
          presets: presets,
          getPresets: function() {
            return Object.keys(presets).map(key => ({
              value: key,
              name: presets[key].name
            }));
          },
          getItems: function(presetKey) {
            return presets[presetKey] ? presets[presetKey].items : null;
          }
        };
      }]);
  }());