import './gameLayout.sass'
import React, {useCallback, useEffect, useRef, useState} from "react";
import Game from "@/entities/game/Game";
import Field from "@/entities/field/Field";
import FieldComponent from "@/features/Field/FieldComponent";
import {DndProvider} from "react-dnd";
import {HTML5Backend} from "react-dnd-html5-backend";
import {GameStateManager} from "@/entities/gameStateManager/GameStateManager";
import RightMenu from "@/widgets/menu/rightMenu/RightMenu";
import MenuRow from "@/widgets/menu/menuRow/MenuRow";
import SolveGameButton from "@/features/SolveGameButton/SolveGameButton";
import UndoMoveButton from "@/features/UndoMoveButton/UndoMoveButton";
import {StepResult} from "@/entities/types/types";
import RestartGameButton from "@/features/RestartGameButton/RestartGameButton";
import BoardImage from '@/images/game-back.png';


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
          <SolveGameButton gameRef={gameRef}/>
          <UndoMoveButton
            undoHandler={undoHandler}
            undoManagerRef={undoManagerRef}
          />
        </MenuRow>
        <MenuRow>
          <RestartGameButton restartGameHandler={restartGameHandler}/>
        </MenuRow>
      </RightMenu>
    </div>
  );
}