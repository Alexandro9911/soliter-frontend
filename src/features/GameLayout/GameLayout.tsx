import './gameLayout.sass'
import React, {useCallback, useRef, useState} from "react";
import Game from "@/entities/game/Game";
import FieldComponent from "@/features/Field/FieldComponent";
import {DndProvider} from "react-dnd";
import {HTML5Backend} from "react-dnd-html5-backend";
import {GameStateManager} from "@/entities/gameStateManager/GameStateManager";
import RightMenu from "@/widgets/menu/rightMenu/RightMenu";
import MenuRow from "@/widgets/menu/menuRow/MenuRow";
import SolveGameButton from "@/features/SolveGameButton/SolveGameButton";
import UndoMoveButton from "@/features/UndoMoveButton/UndoMoveButton";
import {Solution, StepResult} from "@/entities/types/types";
import RestartGameButton from "@/features/RestartGameButton/RestartGameButton";
import BoardImage from '@/images/game-back.png';
import InstructionsButton from "@/features/InstructionsButton/InstructionsButton";
import Chip from "@/entities/chip/Chip";


export default function GameLayout (){
  const gameRef = useRef(new Game());
  const undoManagerRef = useRef(new GameStateManager());
  const [board, setBoard] = useState(() => gameRef.current.getBoard());
  const [updateFlag, setUpdateFlag] = useState(false); // Флаг для форсирования обновления

  useState(() => {
    undoManagerRef.current.saveState(board);
  });

  const makeStep = useCallback((stepRes : StepResult) => {
    console.log(stepRes.isEnd, stepRes.remainingChips, stepRes.isWin)
    const updatedBoard = stepRes.board
    gameRef.current.setBoard(updatedBoard);
    undoManagerRef.current.saveState(updatedBoard);
    setBoard(updatedBoard);
    setUpdateFlag(prev => !prev);
  }, []);

  const undoHandler = useCallback(() => {
    const prevState = undoManagerRef.current.getPrevState();
    if (prevState) {
      gameRef.current.setBoard(prevState);
      setBoard(prevState);
      setUpdateFlag(prev => !prev);
    }
  }, []);

  const restartGameHandler = useCallback(() => {
    const updatedBoard = gameRef.current.restartGame()
    gameRef.current.setBoard(updatedBoard);
    setBoard(updatedBoard);
    setUpdateFlag(prev => !prev);
  }, [])

  const createGameFields = useCallback(() => {
    return (
      <div className="list-cols">
        {board.map((column, index) => (
          <div className="column-field" key={`col-${index}`}>
            {column.map(field => (
              <FieldComponent
                key={`field-${field.getX()}-${field.getY()}`}
                field={field}
                makeStep={makeStep}
                game={gameRef.current}
              />
            ))}
          </div>
        ))}
      </div>
    );
  }, [board, updateFlag]);

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
      setUpdateFlag(prev => !prev);

      if (index < listSteps.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  };

  return (
    <div className="main-layout">
      <div className="main-layout__game">
        <DndProvider backend={HTML5Backend}>
          <div className="game-board">
            <div className="game-board__background">
              <img src={BoardImage}/>
            </div>
            <div className="board">{createGameFields()}</div>
          </div>
        </DndProvider>
      </div>
      <RightMenu>
        <MenuRow>
          <RestartGameButton restartGameHandler={restartGameHandler}/>
        </MenuRow>
        <MenuRow>
          <UndoMoveButton
            undoHandler={undoHandler}
            undoManagerRef={undoManagerRef}
          />
        </MenuRow>
        <MenuRow>
          <SolveGameButton gameRef={gameRef} callBack={solveGameHandler}/>
        </MenuRow>
        <MenuRow>
          <InstructionsButton/>
        </MenuRow>
      </RightMenu>
    </div>
  );
}