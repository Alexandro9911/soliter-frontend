import Field from "@/entities/core/Field";

export type EmptyCoords = {
  [item: number]: number[]
}

export type Point = {
  x: number,
  y: number,
}

export type Solution = {
  solution: {
    from: Point,
    to: Point
  }[] | null,
  partialSolution?: {
    from: Point,
    to: Point
  }[] | null,
  stuckPosition?: Field[][]
}