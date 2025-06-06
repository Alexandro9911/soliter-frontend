import Game from '@/entities/game/Game';
import { EMPTY_COORDS } from '@/entities/constants';
import Chip from "@/entities/chip/Chip";
import {Point} from "@/entities/types/types";
import Field from "@/entities/field/Field";

describe('Game', () => {
  let game: Game;
  const testPoint : Point = {x: 2, y: 3};
  const startPoint: Point = { x: 3, y: 3 };
  let testBoard : Field[][]


  beforeEach(() => {
    game = new Game();
    testBoard = Array(7).fill(null).map((_, x) =>
      Array(7).fill(null).map((_, y) => {
        const isDisabled = EMPTY_COORDS[x as keyof typeof EMPTY_COORDS]?.includes(y) || false;
        return new Field({ x, y }, isDisabled);
      })
    );
  });

  test('Проверка инициализации поля', () => {
    const board = game.getBoard();
    expect(board.length).toBe(7);
    expect(board[0].length).toBe(7);
  });

  test('Проверка определения недоступных полей', () => {
    // Проверяем несколько известных координат
    expect(game['isDisabledCoords']({ x: 0, y: 0 })).toBe(true);
    expect(game['isDisabledCoords']({ x: 3, y: 3 })).toBe(false);
    expect(game['isDisabledCoords']({ x: 6, y: 6 })).toBe(true);
  });

  test('Проверка расположения фишек на поле', () => {
    const board = game.getBoard();
    let chipCount = 0;

    for (let x = 0; x < 7; x++) {
      for (let y = 0; y < 7; y++) {
        if (!EMPTY_COORDS[x as keyof typeof EMPTY_COORDS]?.includes(y) && !(x === 3 && y === 3)) {
          expect(board[x][y].hasChip()).toBe(true);
          chipCount++;
        }
      }
    }

    expect(chipCount).toBe(32); // Всего должно быть 32 фишки в начале игры
  });

  test('Проверка направления хода', () => {
    // Правильный ход
    expect(game['checkMove']({ x: 3, y: 5 }, { x: 3, y: 3 })).toBe(true);
    // Неправильное направление
    expect(game['checkMove']({ x: 3, y: 5 }, { x: 3, y: 2 })).toBe(false);
    // Конечная позиция занята
    expect(game['checkMove']({ x: 2, y: 3 }, { x: 2, y: 5 })).toBe(false);
  });

  test('Проверка направления хода + доска опционально', () => {
    const board = game.getBoard()
    // Правильный ход
    expect(game['checkMoveOnBoard']({ x: 3, y: 5 }, { x: 3, y: 3 }, board)).toBe(true);
    // Неправильное направление
    expect(game['checkMoveOnBoard']({ x: 3, y: 5 }, { x: 3, y: 2 }, board)).toBe(false);
    // Конечная позиция занята
    expect(game['checkMoveOnBoard']({ x: 2, y: 3 }, { x: 2, y: 5 } ,board)).toBe(false);

    board[3][2].resetFieldChip();
    expect(game['checkMoveOnBoard']({ x: 3, y: 5 }, { x: 4, y: 4 } ,board)).toBe(false);

  });

  test('Проверка хода и съедания фишки', () => {
    const startPos = { x: 3, y: 5 };
    const endPos = { x: 3, y: 3 };
    const midPos = { x: 3, y: 4 };

    const startField = game.getBoard()[startPos.x][startPos.y];
    const midField = game.getBoard()[midPos.x][midPos.y];
    const endField = game.getBoard()[endPos.x][endPos.y];
    const chip = startField.getChip()!;

    const result = game['moveChip'](chip, endField);

    expect(startField.hasChip()).toBe(false);
    expect(midField.hasChip()).toBe(false);
    expect(endField.hasChip()).toBe(true);
    expect(endField.getChip()!.getPosition()).toEqual(endPos);
    expect(result.remainingChips).toBe(31);
  });

  test('Проверка состояния победы', () => {
    // Симулируем состояние с одной фишкой
    const board = game.getBoard();
    for (let x = 0; x < 7; x++) {
      for (let y = 0; y < 7; y++) {
        board[x][y].resetFieldChip();
      }
    }
    board[3][3].setChip(new Chip({ x: 3, y: 3 }));

    const result = game['moveChip'](board[3][3].getChip()!, board[3][3]);
    expect(result.isWin).toBe(true);
  });

  test('Проверка перезаписи доски', () => {
    const expectedBoard = game.getBoard()
    for (let x = 0; x < 7; x++) {
      for (let y = 0; y < 7; y++) {
        expectedBoard[x][y].resetFieldChip();
      }
    }

    expectedBoard[3][3].setChip(new Chip({ x: 3, y: 3 }));

    game.setBoard(expectedBoard)
    expect(game.getBoard()[3][3].hasChip() ).toBe(true);
    expect(game.getBoard()[3][4].hasChip() ).toBe(false);

  });

  test('Проверка получения поля под ударом', () => {
    // Правильный ход
    const testField = game['getEatableFieldByCoordsStartFinish']({ x: 3, y: 5 }, { x: 3, y: 3 });
    const testX = testField?.getCoords().x;
    const testY = testField?.getCoords().y;
    expect(testX).toBe(3);
    expect(testY).toBe(4);

    // неправилный ход
    const testField2 = game['getEatableFieldByCoordsStartFinish']({ x: 3, y: 5 }, { x: 4, y: 4 });
    expect(testField2).toBe(null);
  });

  test('Вывод поля если нет опции доски', () => {
    const field = game['getFieldByPoint'](testPoint);

    expect(field).toBeInstanceOf(Field);
    expect(field.getCoords()).toEqual(testPoint);
    expect(field).toBe(game.getBoard()[testPoint.x][testPoint.y]);
  });

  test('Вывод поля если есть опция доски', () => {
    // Создаем тестовую доску
    const testBoard: Field[][] = [];
    for (let x = 0; x < 7; x++) {
      testBoard[x] = [];
      for (let y = 0; y < 7; y++) {
        const isDisabled = game['isDisabledCoords']({ x, y });
        testBoard[x][y] = new Field({ x, y }, isDisabled);
      }
    }
    const testField = testBoard[testPoint.x][testPoint.y];
    const testChip = new Chip(testPoint);
    testField.setChip(testChip);

    const resultField = game['getFieldByPoint'](testPoint, testBoard);

    expect(resultField).toBe(testField);
    expect(resultField.hasChip()).toBe(true);
    expect(resultField.getChip()).toBe(testChip);
  });

  test('Проверка краевых координат', () => {
    const edgePoints: Point[] = [
      { x: 0, y: 0 },
      { x: 6, y: 6 },
      { x: 0, y: 6 },
      { x: 6, y: 0 }
    ];

    edgePoints.forEach(point => {
      const field = game['getFieldByPoint'](point);
      expect(field.getCoords()).toEqual(point);
    });
  });

  test('Проверка пустой доски', () => {
    // Создаем пустую доску
    const emptyBoard: Field[][] = Array(7).fill(null).map((_, x) =>
      Array(7).fill(null).map((_, y) =>
        new Field({ x, y }, false)
      )
    );

    const point: Point = { x: 3, y: 3 };
    const field = game['getFieldByPoint'](point, emptyBoard);

    expect(field).toBe(emptyBoard[point.x][point.y]);
    expect(field.hasChip()).toBe(false);
  });

  test('Проверка определения направления', () => {
    const result = game['eatableChipCoords'](startPoint, 'top');
    const result2 = game['eatableChipCoords'](startPoint, 'bottom');
    const result3 = game['eatableChipCoords'](startPoint, 'right');
    const result4 = game['eatableChipCoords'](startPoint, 'left');

    expect(result).toEqual({ x: 3, y: 2 });
    expect(result2).toEqual({ x: 3, y: 4 });
    expect(result3).toEqual({ x: 4, y: 3 });
    expect(result4).toEqual({ x: 2, y: 3 });
  });


  test('Краевые случаи определение направления', () => {
    const edgeCases = [
      { point: { x: 0, y: 0 }, direction: 'right', expected: { x: 1, y: 0 } },
      { point: { x: 6, y: 6 }, direction: 'left', expected: { x: 5, y: 6 } },
      { point: { x: 0, y: 3 }, direction: 'bottom', expected: { x: 0, y: 4 } },
      { point: { x: 3, y: 0 }, direction: 'top', expected: { x: 3, y: -1 } }
    ];

    edgeCases.forEach(({ point, direction, expected }) => {
      const result = game['eatableChipCoords'](point, direction);
      expect(result).toEqual(expected);
    });

    const result = game['eatableChipCoords'](startPoint, 'diagonal');
    expect(result).toEqual({ x: -1, y: -1 });
  });


  test('Валидация движения вверх', () => {
    // Начальная позиция (фишка есть)
    testBoard[3][3].setChip(new Chip({ x: 3, y: 3 }));
    // Промежуточная позиция (фишка есть)
    testBoard[3][2].setChip(new Chip({ x: 3, y: 2 }));
    // Конечная позиция (пусто)

    const result = game.checkMoveOnBoard(
      { x: 3, y: 3 }, // start
      { x: 3, y: 1 }, // end
      testBoard
    );

    expect(result).toBe(true);
  });

  test('Валидация движения вправо', () => {
    testBoard[2][3].setChip(new Chip({ x: 2, y: 3 }));
    testBoard[3][3].setChip(new Chip({ x: 3, y: 3 }));

    const result = game.checkMoveOnBoard(
      { x: 2, y: 3 },
      { x: 4, y: 3 },
      testBoard
    );

    expect(result).toBe(true);
  });

  test('Не валидное направление', () => {
    testBoard[3][3].setChip(new Chip({ x: 3, y: 3 }));
    testBoard[3][2].setChip(new Chip({ x: 3, y: 2 }));

    const result = game.checkMoveOnBoard(
      { x: 3, y: 3 },
      { x: 4, y: 2 }, // диагональ - невалидно
      testBoard
    );

    expect(result).toBe(false);
  });

  test('Валидация Поле - занято', () => {
    testBoard[3][3].setChip(new Chip({ x: 3, y: 3 }));
    testBoard[3][2].setChip(new Chip({ x: 3, y: 2 }));
    testBoard[3][1].setChip(new Chip({ x: 3, y: 1 }));

    const result = game.checkMoveOnBoard(
      { x: 3, y: 3 },
      { x: 3, y: 1 },
      testBoard
    );

    expect(result).toBe(false);
  });

  test('Валидация - ход без съедания', () => {
    testBoard[3][3].setChip(new Chip({ x: 3, y: 3 }));

    const result = game.checkMoveOnBoard(
      { x: 3, y: 3 },
      { x: 3, y: 1 },
      testBoard
    );

    expect(result).toBe(false);
  });

  test('Валидация - ход за пределы поля', () => {
    testBoard[0][2].setChip(new Chip({ x: 0, y: 2 }));
    testBoard[0][1].setChip(new Chip({ x: 0, y: 1 }));

    const result = game.checkMoveOnBoard(
      { x: 0, y: 2 },
      { x: 0, y: 0 },
      testBoard
    );

    expect(result).toBe(false);
  });
});