(function () {
  'use strict';

  angular.module('bingo', [])
    .factory('BingoCardService', ['ITEMS_EN', 'ITEMS_RU', function (ITEMS_EN, ITEMS_RU) {
      return {
        newCard: function (language) {
          const items = language === 'russian' ? ITEMS_RU.slice(0) : ITEMS_EN.slice(0);
          const card = [];

          for (let i = 0; i < 5; i++) {
            card[i] = [];
            for (let j = 0; j < 5; j++) {
              if (i === 2 && j === 2) {
                card[i][j] = "Free"; // Center cell is always "Free"
              } else {
                const index = Math.floor(Math.random() * items.length);
                card[i][j] = items.splice(index, 1)[0];
              }
            }
          }

          return card;
        }
      };
    }])
    .controller('bingoController', ['$scope', 'BingoCardService', function ($scope, BingoCardService) {
      // Default state
      $scope.selectedLanguage = 'english';
      $scope.selectedCells = {};
      $scope.winningLines = [];

      // Generate a new bingo card
      $scope.newCard = function () {
        $scope.card = { rows: BingoCardService.newCard($scope.selectedLanguage) };
        $scope.selectedCells = {}; // Reset selected cells
        $scope.winningLines = []; // Clear winning lines
      };

      // Change language and generate a new card
      $scope.changeLanguage = function () {
        $scope.newCard();
      };

      // Save the current layout to localStorage
      $scope.saveLayout = function () {
        const savedData = {
          card: $scope.card,
          selectedCells: $scope.selectedCells,
          language: $scope.selectedLanguage
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
          $scope.selectedLanguage = data.language;
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

      // Get button text based on selected language
      $scope.getButtonText = function (buttonType) {
        const translations = {
          english: { save: 'Save', load: 'Load', newCard: 'New Card' },
          russian: { save: 'Сохранить', load: 'Загрузить', newCard: 'Новая Карточка' }
        };
        return translations[$scope.selectedLanguage]?.[buttonType] || '';
      };

      $scope.newCard();
    }]);
}());