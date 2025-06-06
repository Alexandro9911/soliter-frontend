import Game from '@/entities/game/Game';
import { Solution } from '@/entities/types/types';
import {GameSolver} from "@/entities/gameSolver/GameSolver";
import Chip from "@/entities/chip/Chip";

describe('GameSolver', () => {
  let game: Game;
  let solver: GameSolver;

  beforeEach(() => {
    game = new Game();
    solver = new GameSolver(game);
  });

  test('Нахождение решения на простой доске', () => {
    // Создаем упрощенную доску с 3 фишками
    const board = game.getBoard();
    for (let x = 0; x < 7; x++) {
      for (let y = 0; y < 7; y++) {
        board[x][y].resetFieldChip();
      }
    }

    // Расставляем 3 фишки в линию
    board[2][3].setChip(new Chip({ x: 2, y: 3 }));
    board[3][3].setChip(new Chip({ x: 3, y: 3 }));
    board[4][3].setChip(new Chip({ x: 4, y: 3 }));

    const solution = solver.solve() as Solution;
    setTimeout(() => {
      expect(solution.solution).not.toBeNull();
      expect(solution.solution!.length).toBe(2); // Должно быть 2 хода
    }, 10000)
  });

  test('Нахождение самого оптимального решения', () => {
    const board = game.getBoard();
    for (let x = 0; x < 7; x++) {
      for (let y = 0; y < 7; y++) {
        board[x][y].resetFieldChip();
      }
    }

    // делаем тупик
    board[1][3].setChip(new Chip({ x: 1, y: 3 }));
    board[3][1].setChip(new Chip({ x: 3, y: 1 }));
    board[3][5].setChip(new Chip({ x: 3, y: 5 }));
    board[5][3].setChip(new Chip({ x: 5, y: 3 }));

    const solution = solver.solve() as Solution;
    expect(solution.solution).toBeNull();
    expect(solution.partialSolution).not.toBeNull();
    expect(solution.stuckPosition).not.toBeNull();
  });
});