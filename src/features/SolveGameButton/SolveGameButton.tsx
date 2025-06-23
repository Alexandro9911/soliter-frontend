import Button from "@/shared/components/Button/Button";
import React from "react";
import {GameSolver} from "@/entities/gameSolver/GameSolver";
import Game from "@/entities/game/Game";
import {Solution} from "@/entities/types/types";
import Chip from "@/entities/chip/Chip";
import {GameStateManager} from "@/entities/gameStateManager/GameStateManager";
import EventBus from "@/shared/EventBus/EventBus";

type Props = {
  gameRef: React.MutableRefObject<Game>,
  undoManagerRef: React.MutableRefObject<GameStateManager>
  setBoard: Function,
  setUpdateFlag: Function,
}
export default function SolveGameButton({gameRef, undoManagerRef, setBoard, setUpdateFlag }: Props){

  const handleSolveClick = () => {
    const gameSolver : GameSolver = new GameSolver(gameRef.current);
    const result = gameSolver.solve() || {moves: [], remaining: 0};
    solveGameHandler(result);
  }

  const solveGameHandler = async (res: Solution) => {
    const listSteps = res.solution ? res.solution : res.partialSolution;

    if (!listSteps) {
      return;
    }

    for (let index = 0; index < listSteps.length; index++) {
      const item = listSteps[index];
      const startCoords = item.from;
      const targetCoords = item.to;
      const board = gameRef.current.getBoard();

      const movedChip = board[startCoords.x][startCoords.y].getChip();
      const targetField = board[targetCoords.x][targetCoords.y];
      const resStep = gameRef.current.moveChip(movedChip as Chip, targetField);

      const updatedBoard = resStep.board;
      gameRef.current.setBoard(updatedBoard);
      undoManagerRef.current.saveState(updatedBoard);
      setBoard(updatedBoard);
      setUpdateFlag((prev : boolean) => !prev);
      EventBus.getInstance().emit('BALL_PASTE');

      if (index < listSteps.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  };


  return (
    <Button onClick={handleSolveClick}>
      Решить автоматически
    </Button>
  )
}