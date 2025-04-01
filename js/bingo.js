(function () {
  'use strict';
  
  // Create the module first
  var bingoApp = angular.module('bingo', []);
  
  // Then add services and controllers
  bingoApp.factory('BingoCardService', ['PresetService', function (PresetService) {
    return {
      newCard: function (preset, customItems = null) {
        let items;
        if (preset === 'custom' && customItems && customItems.length >= 24) {
          items = customItems.slice(0);
        } else {
          items = PresetService.getItems(preset)?.slice(0) || [];
        }
        
        const card = [];
        for (let i = 0; i < 5; i++) {
          card[i] = [];
          for (let j = 0; j < 5; j++) {
            if (i === 2 && j === 2) {
              card[i][j] = "Free";
            } else {
              const index = Math.floor(Math.random() * items.length);
              card[i][j] = items.splice(index, 1)[0];
            }
          }
        }
        return card;
      }
    };
  }]);

  bingoApp.controller('bingoController', ['$scope', 'BingoCardService', 'PresetService', 
    function ($scope, BingoCardService, PresetService) {
      // Default state
      $scope.presets = PresetService.getPresets();
      $scope.selectedPreset = $scope.presets[0].value;
      $scope.selectedCells = {};
      $scope.winningLines = [];
      $scope.showCustomInput = false;
      $scope.customItemsText = '';
      $scope.customItemCount = 0;

      // Update item count when custom items change
      $scope.updateItemCount = function() {
        if ($scope.customItemsText) {
          $scope.customItemCount = $scope.customItemsText.split('\n')
            .map(item => item.trim())
            .filter(item => item.length > 0).length;
        } else {
          $scope.customItemCount = 0;
        }
      };

      // Generate a new bingo card
      $scope.newCard = function () {
        let customItems = null;
        if ($scope.selectedPreset === 'custom' && $scope.customItemsText) {
          customItems = $scope.customItemsText.split('\n')
            .map(item => item.trim())
            .filter(item => item.length > 0);
        }
        $scope.card = { rows: BingoCardService.newCard($scope.selectedPreset, customItems) };
        $scope.selectedCells = {};
        $scope.winningLines = [];
        if ($scope.selectedPreset !== 'custom') {
          $scope.showCustomInput = false;
        }
      };

            // Toggle custom items input
            $scope.toggleCustomInput = function() {
              if (!$scope.showCustomInput) {
                $scope.selectedPreset = 'custom';
              }
              $scope.showCustomInput = !$scope.showCustomInput;
              
              if ($scope.showCustomInput) {
                setTimeout(() => {
                  document.getElementById('customItemsTextarea').focus();
                }, 400); // Match with CSS transition duration
              }
            };

      // Change preset
      $scope.changePreset = function() {
        if ($scope.selectedPreset === 'custom') {
          $scope.showCustomInput = true;
          setTimeout(() => {
            document.getElementById('customItemsTextarea').focus();
          }, 0);
        } else {
          $scope.showCustomInput = false;
          $scope.newCard();
        }
      };

      // Save the current layout to localStorage
      $scope.saveLayout = function () {
        const savedData = {
          card: $scope.card,
          selectedCells: $scope.selectedCells,
          preset: $scope.selectedPreset,
          customItems: $scope.customItemsText
        };
        localStorage.setItem('bingoData', JSON.stringify(savedData));
        alert('Layout saved!');
      };

      // Load the saved layout from localStorage
      $scope.loadLayout = function () {
        const savedData = localStorage.getItem('bingoData');
        if (savedData) {
          const data = JSON.parse(savedData);
          $scope.card = data.card;
          $scope.selectedCells = data.selectedCells;
          $scope.selectedPreset = data.preset || 'english';
          $scope.customItemsText = data.customItems || '';
          $scope.showCustomInput = $scope.selectedPreset === 'custom';
          $scope.checkBingo();
        } else {
          alert('No saved layout found.');
        }
      };

      $scope.hasWinningCells = function () {
        return $scope.winningLines && $scope.winningLines.length > 0;
      };

      // Toggle cell selection
      $scope.handleCellClick = function (rowIndex, colIndex) {
        if (rowIndex === 2 && colIndex === 2) return; // Skip the "Free" cell

        const cellKey = `${rowIndex}-${colIndex}`;
        $scope.selectedCells[cellKey] = !$scope.selectedCells[cellKey];
        $scope.checkBingo();
      };

      // Check if a cell is selected
      $scope.isSelected = function (rowIndex, colIndex) {
        return rowIndex === 2 && colIndex === 2 || !!$scope.selectedCells[`${rowIndex}-${colIndex}`];
      };

      // Check for bingo and update winning lines
      $scope.checkBingo = function () {
        $scope.winningLines = [];
      
        // Check rows
        for (let i = 0; i < 5; i++) {
          if ([0, 1, 2, 3, 4].every(j => $scope.isSelected(i, j))) {
            $scope.winningLines.push({
              type: 'row',
              cells: [0, 1, 2, 3, 4].map(j => ({ row: i, col: j }))
            });
          }
        }
      
        // Check columns
        for (let j = 0; j < 5; j++) {
          if ([0, 1, 2, 3, 4].every(i => $scope.isSelected(i, j))) {
            $scope.winningLines.push({
              type: 'column',
              cells: [0, 1, 2, 3, 4].map(i => ({ row: i, col: j }))
            });
          }
        }
      
        // Check diagonals
        if ([0, 1, 2, 3, 4].every(i => $scope.isSelected(i, i))) {
          $scope.winningLines.push({
            type: 'diagonal-left',
            cells: [0, 1, 2, 3, 4].map(i => ({ row: i, col: i }))
          });
        }
        if ([0, 1, 2, 3, 4].every(i => $scope.isSelected(i, 4 - i))) {
          $scope.winningLines.push({
            type: 'diagonal-right',
            cells: [0, 1, 2, 3, 4].map(i => ({ row: i, col: 4 - i }))
          });
        }
      };

      // Get CSS classes for a cell
      $scope.getCellClass = function (rowIndex, colIndex) {
        return {
          selected: $scope.isSelected(rowIndex, colIndex),
          free: rowIndex === 2 && colIndex === 2,
          winning: $scope.isWinningCell(rowIndex, colIndex)
        };
      };

      // Check if a cell is part of a winning line
      $scope.isWinningCell = function (rowIndex, colIndex) {
        return $scope.winningLines.some(line =>
          line.cells.some(cell => cell.row === rowIndex && cell.col === colIndex)
        );
      };

      $scope.newCard();
    }]);
}());
