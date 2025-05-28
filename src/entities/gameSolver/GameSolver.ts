import Game from "@/entities/game/Game";
import {Point, Solution} from "@/entities/types/types";
import Field from "@/entities/field/Field";
import Chip from "@/entities/chip/Chip";

export class GameSolver {

  private game: Game;
  private solutionSteps: {from: Point, to: Point}[] = [];
  private visitedStates = new Set<string>();
  private startTime: number = 0;
  private moveCount: number = 0;
  private bestSolution: {moves: {from: Point, to: Point}[], remaining: number} = {
    moves: [],
    remaining: Infinity
  };

  private readonly MAX_MOVES = 50;
  private readonly TIME_LIMIT = 10000; // 10 секунд

  constructor(game: Game) {
    this.game = game;
  }

  /**
   * Вызов поиска автоматического решения.
   * Выдает либо полное решение (до одной фишки)
   * либо тупиковое решение когда нет возможности решить задачу до одной фишки.
   */
  public solve(): Solution {
    console.log('Поиск оптимального решения...');
    this.startTime = Date.now();
    this.solutionSteps = [];
    this.visitedStates.clear();
    this.moveCount = 0;
    this.bestSolution = {moves: [], remaining: Infinity};

    const boardCopy = this.deepCopyBoard();
    this.tryFindBestSolution(boardCopy);

    if (this.bestSolution.remaining === 1) {
      console.log('Найдено полное решение!');
      return {solution: this.bestSolution.moves};
    } else if (this.bestSolution.moves.length > 0) {
      console.log(`Найдено частичное решение (осталось фишек: ${this.bestSolution.remaining})`);
      return {
        solution: null,
        partialSolution: this.bestSolution.moves,
        stuckPosition: this.deepCopyBoard(boardCopy)
      };
    } else {
      console.log('Решение не найдено');
      return {solution: null};
    }
  }

  /**
   * Находит все возможные решения с помощью алгоритма backTracking
   * Т.е. рекурсивно перебирает все возможные исходы и комбинации и записывает их,
   * а потом выбирает лучшее из возможных
   * Записывает уже опробованные комбинации в Set visitedStates. но хранит он там только хеш
   * (подробнее в getOptimizedBoardHash)
   * @param board
   * @private
   */
  private tryFindBestSolution(board: Field[][]): void {
    if (Date.now() - this.startTime > this.TIME_LIMIT) {
      return;
    }

    if (this.moveCount > this.MAX_MOVES) {
      return;
    }

    const remainingChips = this.getRemainingChipsCount(board);

    // Обновляем лучшее решение, если нашли вариант с меньшим количеством фишек
    if (remainingChips < this.bestSolution.remaining) {
      this.bestSolution = {
        moves: [...this.solutionSteps],
        remaining: remainingChips
      };
    }

    // Если нашли полное решение, можно завершать
    if (remainingChips === 1) {
      return;
    }

    const boardHash = this.getOptimizedBoardHash(board);
    if (this.visitedStates.has(boardHash)) {
      return;
    }
    this.visitedStates.add(boardHash);

    for (let x = 0; x < 7; x++) {
      for (let y = 0; y < 7; y++) {
        const field = board[x][y];
        if (field.getIsDisabled() || !field.hasChip()) continue;

        const directions = [
          {dx: 0, dy: -2}, {dx: 0, dy: 2},
          {dx: -2, dy: 0}, {dx: 2, dy: 0}
        ];

        for (const dir of directions) {
          const targetX = x + dir.dx;
          const targetY = y + dir.dy;

          if (targetX < 0 || targetX >= 7 || targetY < 0 || targetY >= 7) continue;

          const startPoint = {x, y};
          const targetPoint = {x: targetX, y: targetY};

          if (this.game.checkMoveOnBoard(startPoint, targetPoint, board)) {
            const newBoard = this.deepCopyBoard(board);
            const midX = x + dir.dx/2;
            const midY = y + dir.dy/2;

            const startField = newBoard[x][y];
            const midField = newBoard[midX][midY];
            const targetField = newBoard[targetX][targetY];
            const chip = startField.getChip()!;

            startField.resetFieldChip();
            midField.resetFieldChip();
            targetField.setChip(chip);
            chip.setPosition(targetPoint);

            this.solutionSteps.push({from: startPoint, to: targetPoint});
            this.moveCount++;

            this.tryFindBestSolution(newBoard);

            this.solutionSteps.pop();
            this.moveCount--;

            // Если нашли идеальное решение, можно досрочно завершить
            if (this.bestSolution.remaining === 1) {
              return;
            }
          }
        }
      }
    }
  }


  /**
   * делает хеш по игровому полю, создает строку из координат фишек.
   * @param board
   * @private
   */
  private getOptimizedBoardHash(board: Field[][]): string {
    // Быстрый хеш только по позициям фишек
    let hash = '';
    for (let x = 0; x < 7; x++) {
      for (let y = 0; y < 7; y++) {
        if (board[x][y].hasChip() && !board[x][y].getIsDisabled()) {
          hash += `${x},${y};`;
        }
      }
    }
    return hash;
  }

  /**
   * Копирует игровое поле. Необходимо для автоматического поиска решений, т. к.
   * исходная доска должна остаться неизменной
   * @param sourceBoard
   * @private
   */
  private deepCopyBoard(sourceBoard?: Field[][]): Field[][] {
    const boardToCopy = sourceBoard || this.game.getBoard();
    return boardToCopy.map(row =>
      row.map((field : Field )=> {
        const newField = new Field(field.getCoords(), field.getIsDisabled());
        if (field.hasChip()) {
          const chip = new Chip(field.getChip()!.getPosition());
          newField.setChip(chip);
        }
        return newField;
      })
    );
  }


  /**
   * Считает количество оставшихся фишек.
   * @param board
   * @private
   */
  private getRemainingChipsCount(board: Field[][]): number {
    let count = 0;
    for (let x = 0; x < 7; x++) {
      for (let y = 0; y < 7; y++) {
        const field = board[x]?.[y];
        if (field && !field.getIsDisabled() && field.hasChip()) {
          count++;
        }
      }
    }
    return count;
  }
}