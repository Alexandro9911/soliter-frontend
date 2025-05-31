import Button from "@/shared/components/Button/Button";
import React from "react";
import {GameSolver} from "@/entities/gameSolver/GameSolver";
import Game from "@/entities/game/Game";
type Props = {
  gameRef: React.MutableRefObject<Game>
}
export default function SolveGameButton({gameRef}: Props){

  const handleSolveClick = () => {
    const gameSolver : GameSolver = new GameSolver(gameRef.current);
    const result = gameSolver.solve() || {moves: [], remaining: 0};
    if (result.solution) {
      console.log("Полное решение найдено!");
      result.solution.forEach((move, i) => {
        console.log(`${i+1}. (${move.from.x},${move.from.y}) -> (${move.to.x},${move.to.y})`);
      });
    } else if (result.partialSolution) {
      console.log(`Лучшее частичное решение`);
      result.partialSolution.forEach((move, i) => {
        console.log(`${i+1}. (${move.from.x},${move.from.y}) -> (${move.to.x},${move.to.y})`);
      });
    } else {
      console.log("Решение не найдено");
    }
  }

  return (
    <Button onClick={handleSolveClick}>
      Решить автоматически
    </Button>
  )
}