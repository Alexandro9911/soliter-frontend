import './gameLayout.sass'
import React, {useCallback, useEffect, useRef, useState} from "react";
import Game from "@/entities/game/Game";
import Field from "@/entities/field/Field";
import FieldComponent from "@/features/Field/FieldComponent";
import {DndProvider} from "react-dnd";
import {HTML5Backend} from "react-dnd-html5-backend";
import {GameSolver} from "@/entities/gameSolver/GameSolver";
import Button from "@/shared/components/Button/Button";
import {GameStateManager} from "@/entities/gameStateManager/GameStateManager";


export default function GameLayout (){
  const gameRef = useRef(new Game());
  const undoManagerRef = useRef(new GameStateManager());
  const [board, setBoard] = useState(() => gameRef.current.getBoard());
  const [updateFlag, setUpdateFlag] = useState(false); // Флаг для форсирования обновления

  useState(() => {
    undoManagerRef.current.saveState(board);
  });

  const makeStep = useCallback((updatedBoard: Field[][]) => {
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
    <div className="main-layout">
      <DndProvider backend={HTML5Backend}>
        <div className="board">{createGameFields()}</div>
      </DndProvider>
      <Button onClick={handleSolveClick}>
        Решить автоматически
      </Button>
      <Button
        onClick={undoHandler}
        disabled={!undoManagerRef.current.canUndo()}
      >
        Отменить ход
      </Button>
    </div>
  );
}