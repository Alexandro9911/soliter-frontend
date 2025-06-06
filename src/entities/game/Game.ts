
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

import {EmptyCoords, Point, Solution, StepResult} from "@/entities/types/types";
import Field from "@/entities/field/Field";
import Chip from "@/entities/chip/Chip";
import {EMPTY_COORDS} from "@/entities/constants";

export default class Game {

  private board: Field[][] = [];
  constructor() {
    this.board = this.initBoard()
  }

  /**
   * Создает доску и наполняет ее фишками.
   * Исползуется в начале игры.
   */
  private initBoard = () => {
    let rows : Field[][] = [];
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

  public setBoard = (board: Field[][]) => {
    this.board = board
  }

  /**
   * Делает ход после выполнения всех проверок.
   * @param chip - фишка которая делает ход
   * @param targetField - поле куда фишка делает ход.
   */
  public moveChip = (chip: Chip, targetField: Field) : StepResult => {
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
    const remainingChips = this.getRemainingChipsCount(this.board);
    const isWin = remainingChips == 1;
    return {board: this.board, isEnd: !hasMovements, isWin: isWin, remainingChips: remainingChips };
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
  public checkMoveOnBoard(start: Point, end: Point, board: Field[][]): boolean {
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

    const direction = this.getDirection(start, end);
    if (!direction) {
      return false;
    }

    const midPoint = this.eatableChipCoords(start, direction);
    return board[midPoint.x][midPoint.y].hasChip();
  }


  /**
   * Считает количество оставшихся фишек.
   * @param board
   * @private
   */
  public getRemainingChipsCount(board: Field[][]): number {
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


  public restartGame = () => {
    const newBoard = this.initBoard();
    this.setBoard(newBoard)
    return newBoard;
  }

}