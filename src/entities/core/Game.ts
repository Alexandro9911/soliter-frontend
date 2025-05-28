
/*
Поле

    0 1 2 3 4 5 6   X
   ===============
0 |     * * *     |
1 |     * * *     |
2 | * * * * * * * |
3 | * * *   * * * |
4 | * * * * * * * |
5 |     * * *     |
6 |     * * *     |
   ===============
Y
 */

import {EmptyCoords, Point, Solution} from "@/entities/types/types";
import Field from "@/entities/core/Field";
import Chip from "@/entities/core/Chip";
import {EMPTY_COORDS} from "@/entities/constants";

export default class Game {

  private board: any[] = [];

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

  constructor() {
    this.board = this.initBoard()
  }

  /**
   * Создает доску и наполняет ее фишками.
   * Исползуется в начале игры.
   */
  private initBoard = () => {
    let rows : any[] = [];
    for (let x = 0; x < 7; x++) {
      let col : Field[] = [];
      for(let y = 0; y < 7; y++) {
        const point : Point = {x,y}
        const isDisabled = this.isDisabledCoords(point)
        const newField = new Field(point,isDisabled);
        if(!this.isCenterCoord(point)){
          if (!isDisabled) {
            const chip = new Chip(point);
            newField.setChip(chip);
          }
        }
        col.push(newField)
        if(y == 6) {
          rows.push(col);
        }
      }
    }
    return rows;
  }

  /**
   * Выводит текущие состояние доски.
   */
  public getBoard = () => {
    return this.board;
  }

  /**
   * Делает ход после выполнения всех проверок.
   * @param chip - фишка которая делает ход
   * @param targetField - поле куда фишка делает ход.
   */
  public moveChip = (chip: Chip, targetField: Field) : any[] => {
    const startField = this.getFieldByChip(chip)
    const coordStart : Point = {
      x: startField.getX(),
      y: startField.getY(),
    }
    const coordEnd : Point = {
      x: targetField.getX(),
      y: targetField.getY(),
    }
    if(this.checkMove(coordStart,coordEnd)){
      chip.setPosition(coordEnd);
      targetField.setChip(chip);
      startField.resetFieldChip();
      const eatableField = this.getEatableFieldByCoordsStartFinish(coordStart,coordEnd);
      eatableField?.resetFieldChip();
    }
    const hasMovements = this.hasPossibleMoves(this.board);
    if(!hasMovements){
      console.log('Это тупик')
    }
    return this.board;
  }

  /**
   * Проверяет, можно ли сделать ход из точки в точку
   * критерии:
   *  корректное направление
   *  ход в приделах доски
   *  во время хода обязательно съестся другая фишка
   *  конечное поле - пустое
   *
   * @param coordStart - начальная точка хода
   * @param coordEnd - конечная точка хода
   */
  public checkMove = (coordStart: Point, coordEnd: Point) : boolean => {
    const directionCheck = this.checkDirection(coordStart,coordEnd);
    const finishCoordCheck = !this.isDisabledCoords(coordEnd);
    const partialEat = this.hasChipBetweenCoords(coordStart,coordEnd);
    const targetFieldIsEmpty = this.isPointEmpty(coordEnd);
    return (
      directionCheck
      && finishCoordCheck
      && partialEat
      && targetFieldIsEmpty
    )
  }

  /**
   * проверяет направление хода на соответствие правилам игры.
   *
   * @param coordStart начальная точка хода
   * @param coordEnd конечная точка хода
   */
  private checkDirection = (coordStart: Point, coordEnd: Point) : boolean => {
    const partialCoords : Point[] = this.getPartialCoordsByStartCoords(coordStart)
    return partialCoords.findIndex((partialPoint: Point) =>
      partialPoint.y === coordEnd.y
      && partialPoint.x === coordEnd.x
    ) !== -1
  }

  /**
   * Выводит возможные конечные точки для хода в зависимости от начальной точки.
   * Важно! не проверяет правила на занятость конечной точки
   * и наличия фишки между конечной и стартовой точкой
   * @param coordStart
   */
  private getPartialCoordsByStartCoords = (coordStart: Point) => {
    const partialTop : Point = {x: coordStart.x, y: coordStart.y - 2}
    const partialBottom : Point = {x: coordStart.x, y: coordStart.y + 2}
    const partialLeft : Point = {x: coordStart.x - 2, y: coordStart.y}
    const partialRight : Point = {x: coordStart.x + 2, y: coordStart.y}
    return [partialTop,partialRight,partialBottom,partialLeft]
  }

  /**
   * определяет направление движения фишки в зависимости от начальной и конечной точки
   * @param coordStart начальная точка
   * @param coordEnd конечная точка
   */
  private getDirection = (coordStart: Point, coordEnd: Point) => {
    const directions = ['top','right','bottom','left'];
    const tmpFinalCoord = this.getPartialCoordsByStartCoords(coordStart);
    let currDirection = null;
    tmpFinalCoord.forEach((itemCoord: Point, index) => {
      if(itemCoord.x === coordEnd.x && itemCoord.y === coordEnd.y) {
        currDirection = directions[index];
      }
    })
    return currDirection
  }

  /**
   * Проверяет наличие фишки меду началной и конечной точкой хода.
   * @param coordStart начальная точка хода
   * @param coordEnd конечная точка хода
   */
  private hasChipBetweenCoords = (coordStart: Point,coordEnd: Point) : boolean => {
    const direction = this.getDirection(coordStart, coordEnd);
    if(!direction) {
      return false;
    }

    const eatableChipCoords = this.eatableChipCoords(coordStart, direction);
    const fieldUnderEat : Field = this.getBoard()[eatableChipCoords.x][eatableChipCoords.y];
    return fieldUnderEat.hasChip();
  }

  /**
   *  Возвращает !поле! которое под ударом. Т.е. поле на котором должна быть сьедена фишка.
   * @param coordStart
   * @param coordEnd
   */
  private getEatableFieldByCoordsStartFinish = (coordStart: Point, coordEnd: Point) : Field | null => {
    const direction = this.getDirection(coordStart, coordEnd);
    if(!direction) {
      return null;
    }

    const eatableChipCoords = this.eatableChipCoords(coordStart, direction);
    return  this.getBoard()[eatableChipCoords.x][eatableChipCoords.y];
  }

  /**
   * Проверяет есть ли по координатам поля фишка.
   * @param targetPoint - координаты поля
   * @param board - игровая доска, может быть пустой.
   */
  private isPointEmpty = (targetPoint: Point, board?: Field[][]) : boolean => {
    const targetField = this.getFieldByPoint(targetPoint, board);
    return !targetField.hasChip();
  }

  /**
   * определяет координаты фишки которая будет съедена.
   * @param coordStart начальная координата хода
   * @param direction направление хода
   */
  private eatableChipCoords = (coordStart: Point, direction: string): Point => {
    switch (direction) {
      case 'top' : {
        return {x: coordStart.x, y: coordStart.y - 1} as Point
      }
      case 'bottom' : {
        return {x: coordStart.x, y: coordStart.y + 1} as Point
      }
      case 'right' : {
        return {x: coordStart.x + 1, y: coordStart.y} as Point
      }
      case 'left' : {
        return {x: coordStart.x - 1, y: coordStart.y} as Point
      }
      default : {
        return {x: -1, y: -1}
      }
    }
  }

  /**
   * проверяет, запрещенное поле или нет
   * @param point
   */
  private isDisabledCoords = (point: Point) : boolean => {
    const partialColumn = EMPTY_COORDS[point.x as keyof EmptyCoords];
    if(!partialColumn) {
      return false;
    }
    return partialColumn.includes(point.y);
  }

  /**
   * Проверяет координаты точки на признак центра поля.
   * @param point
   */
  private isCenterCoord = (point: Point) : boolean => {
    return point.x === 3 && point.y === 3
  }

  /**
   * Выдает обьект поля по фишке
   * @param chip
   */
  private getFieldByChip = (chip: Chip) : Field => {
    const chipPos = chip.getPosition()
    return this.getBoard()[chipPos.x][chipPos.y]
  }

  /**
   * выдает обьект поля по координатам.
   * Если передано игровое поле - выдаст обьект поля в зависимости от состояний в том поле.
   * @param point - координаты поля
   * @param board - игровое поле
   */
  private getFieldByPoint = (point: Point, board?:Field[][]): Field => {
    if (board) {
      return board[point.x][point.y];
    } else {
      return this.getBoard()[point.x][point.y]
    }
  }

  // тут идет код который позволяет найти решение автоматически

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

          if (this.checkMoveOnBoard(startPoint, targetPoint, board)) {
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

  // то же что и checkMove, но работает с доской
  /**
   * Проверяет наличие ходов в зависимости от состояния игрового поля.
   * @param board
   * @private
   */
  private hasPossibleMoves(board: Field[][]): boolean {
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

          if (targetX >= 0 && targetX < 7 && targetY >= 0 && targetY < 7) {
            const startPoint = {x, y};
            const targetPoint = {x: targetX, y: targetY};

            if (this.checkMoveOnBoard(startPoint, targetPoint, board)) {
              return true;
            }
          }
        }
      }
    }
    return false;
  }

  /**
   * Проверяет возможност хода из одной точки в другую в зависимости от состояния игрового поля.
   * @param start
   * @param end
   * @param board
   * @private
   */
  // Исправленный метод для работы с любым начальным ходом
  private checkMoveOnBoard(start: Point, end: Point, board: Field[][]): boolean {
    // Проверка направления
    if (!this.checkDirection(start, end)) {
      return false;
    }

    // Проверка конечной позиции
    if (this.isDisabledCoords(end)) {
      return false;
    }

    // Проверка что конечная позиция свободна
    if (board[end.x][end.y].hasChip()) {
      return false;
    }

    // Проверка что есть фишка для "прыжка"
    const direction = this.getDirection(start, end);
    if (!direction) {
      return false;
    }

    const midPoint = this.eatableChipCoords(start, direction);
    return board[midPoint.x][midPoint.y].hasChip();
  }


  /**
   * Копирует игровое поле. Необходимо для автоматического поиска решений, т. к.
   * исходная доска должна остаться неизменной
    * @param sourceBoard
   * @private
   */
  private deepCopyBoard(sourceBoard?: Field[][]): Field[][] {
    const boardToCopy = sourceBoard || this.board;
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