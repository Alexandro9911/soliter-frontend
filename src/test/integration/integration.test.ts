import Game from '@/entities/game/Game';
import {GameStateManager} from "@/entities/gameStateManager/GameStateManager";
import {GameSolver} from "@/entities/gameSolver/GameSolver";

describe('Проверка хода назад', () => {
  let game: Game;
  let stateManager: GameStateManager;

  beforeEach(() => {
    game = new Game();
    stateManager = new GameStateManager();
  });

  test('Отмена хода + проверка отмены', () => {
    const initialBoard = game.getBoard();
    stateManager.saveState(initialBoard);

    // Делаем ход
    const chip = initialBoard[2][3].getChip()!;
    const targetField = initialBoard[2][1];
    game['moveChip'](chip, targetField);

    // Сохраняем новое состояние
    stateManager.saveState(game.getBoard());

    // Проверяем историю
    expect(stateManager.canUndo()).toBe(true);
    const prevState = stateManager.getPrevState()!;
    expect(prevState[2][3].hasChip()).toBe(true);
  });

  test('Проверка отмены на начальном ходе', () => {
    expect(stateManager.canUndo()).toBe(false);
    expect(stateManager.getPrevState()).toBeNull();
  });
});

describe('Проверка игры', () => {
  test('Должна остаться 1 фишка', () => {
    const game = new Game();
    const solver = new GameSolver(game);

    const solution = solver.solve();

    expect(solution.solution).not.toBeNull();

    if (solution.solution) {
      for (const move of solution.solution) {
        const startField = game.getBoard()[move.from.x][move.from.y];
        const targetField = game.getBoard()[move.to.x][move.to.y];
        game['moveChip'](startField.getChip()!, targetField);
      }

      expect(game.getRemainingChipsCount(game.getBoard())).toBe(1);
    }
  });
});