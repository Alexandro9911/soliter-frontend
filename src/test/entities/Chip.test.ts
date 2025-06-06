import '@testing-library/jest-dom';
import Chip from "@/entities/chip/Chip";
import {Point} from "@/entities/types/types";

describe('Chip', () => {
  let chip : Chip;
  const initialPosition : Point = { x: 2, y: 3 };

  beforeEach(() => {
    chip = new Chip(initialPosition);
  });

  test('Проверка установки координат', () => {
    expect(chip.getPosition()).toEqual(initialPosition);
  });

  test('Проверка id', () => {
    const chip2 = new Chip(initialPosition);
    expect(chip.getId()).not.toBe(chip2.getId());
  });

  test('Проверка обновления позиции', () => {
    const newPosition = { x: 4, y: 1 };
    chip.setPosition(newPosition);
    expect(chip.getPosition()).toEqual(newPosition);
  });

  test('Проверка внешней замены координаты', () => {
    const position = chip.getPosition();
    position.x = 5;
    expect(chip.getPosition().x).not.toBe(5);
  });
});