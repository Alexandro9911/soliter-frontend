import Chip from "@/entities/chip/Chip";
import Field from "@/entities/field/Field";

export class GameStateManager {
  private history: Field[][][] = [];
  private currentIndex = -1;

  saveState(board: Field[][]) {
    // Удаляем будущие состояния если мы сделали undo
    this.history = this.history.slice(0, this.currentIndex + 1);

    // Сохраняем глубокую копию
    this.history.push(this.deepCopyBoard(board));
    this.currentIndex = this.history.length - 1;
  }

  getPrevState(): Field[][] | null {
    if (this.currentIndex <= 0) return null;
    this.currentIndex--;
    return this.deepCopyBoard(this.history[this.currentIndex]);
  }

  canUndo(): boolean {
    return this.currentIndex > 0;
  }

  private deepCopyBoard(board: Field[][]): Field[][] {
    return board.map(column =>
      column.map(field => {
        const newField = new Field(field.getCoords(), field.getIsDisabled());
        if (field.hasChip()) {
          const chip = field.getChip()!;
          const newChip = new Chip(chip.getPosition());
          if ((chip as any).taken) (newChip as any).taken = true;
          newField.setChip(newChip);
        }
        return newField;
      })
    );
  }
}