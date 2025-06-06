import {Point} from "@/entities/types/types";
import {UniqueStringGenerator} from "@/utils/UniqueString/UniqueStringGenerator";

export default class Chip {

  private chipX: number;
  private chipY: number;

  private id: string;

  constructor (point: Point) {
    const generator = new UniqueStringGenerator()

    this.chipX = point.x;
    this.chipY = point.y;
    this.id = generator.generate(10);
  }

  public getId(){
    return this.id;
  }

  public setPosition(position: Point){
    this.chipY = position.y;
    this.chipX = position.x;
  }

  public getPosition() : Point {
    return {
      x: this.chipX,
      y: this.chipY
    }
  }
}