import Chip from "@/entities/core/Chip";
import {Point} from "@/entities/types/types";
import {UniqueStringGenerator} from "@/utils/UniqueString/UniqueStringGenerator";

export default class Field {

  private readonly posX: number;
  private readonly posY: number;
  private readonly isDisabled: boolean;
  private readonly id: string;


  private chip : null | Chip = null;
  constructor(coords: Point, isDisabled: boolean) {

    const generator = new UniqueStringGenerator();

    this.posX = coords.x;
    this.posY = coords.y;
    this.id = generator.generate(10);

    this.isDisabled = isDisabled;
  };

  public getX() : number {
    return this.posX;
  }
  public getY() : number {
    return this.posY;
  }

  public getCoords() : Point {
    return {
      x: this.getX(),
      y: this.getY(),
    }
  }

  public setChip(chip : Chip){
    this.chip = chip
  }

  public hasChip(){
    return this.chip != null;
  }

  public getChip(){
    return this.chip;
  }

  public getIsDisabled(){
    return this.isDisabled;
  }

  public resetFieldChip(){
    this.chip = null
  }


}