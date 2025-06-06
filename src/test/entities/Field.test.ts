import Field from '@/entities/field/Field';
import Chip from '@/entities/chip/Chip';
import { Point } from '@/entities/types/types';

describe('Field', () => {
  let field: Field;
  const coords: Point = { x: 2, y: 3 };
  const isDisabled = false;

  beforeEach(() => {
    field = new Field(coords, isDisabled);
  });

  test('Проверка установки координат поля', () => {
    expect(field.getCoords()).toEqual(coords);
    expect(field.getIsDisabled()).toBe(isDisabled);
  });

  test('Проверка ID', () => {
    const field2 = new Field(coords, isDisabled);
    expect((field as any).id).not.toBe((field2 as any).id);
  });

  test('методы определения фишки в поле ', () => {
    const chip = new Chip(coords);

    expect(field.hasChip()).toBe(false);
    field.setChip(chip);
    expect(field.hasChip()).toBe(true);
    expect(field.getChip()).toBe(chip);

    field.resetFieldChip();
    expect(field.hasChip()).toBe(false);
  });
});