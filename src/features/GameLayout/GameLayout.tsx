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
import { StepResult } from "@/entities/types/types";
import RestartGameButton from "@/features/RestartGameButton/RestartGameButton";
import BoardImage from '@/assets/images/game-back.png';
import InstructionsButton from "@/features/InstructionsButton/InstructionsButton";
import SoundPlayer from "@/shared/components/SoundPlayer/SoundPlayer";


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
          <RestartGameButton
            gameRef={gameRef}
            setBoard={setBoard}
            setUpdateFlag={setUpdateFlag}
          />
        </MenuRow>
        <MenuRow>
          <UndoMoveButton
            undoManagerRef={undoManagerRef}
            setUpdateFlag={setUpdateFlag}
            gameRef={gameRef}
            setBoard={setBoard}
          />
        </MenuRow>
        <MenuRow>
          <SolveGameButton
            gameRef={gameRef}
            setBoard={setBoard}
            undoManagerRef={undoManagerRef}
            setUpdateFlag={setUpdateFlag}
          />
        </MenuRow>
        <MenuRow>
          <InstructionsButton/>
        </MenuRow>
      </RightMenu>
      <SoundPlayer/>
    </div>
  );
}