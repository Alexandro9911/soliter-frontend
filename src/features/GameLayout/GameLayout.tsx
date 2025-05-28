import './gameLayout.sass'
import React, {useEffect, useState} from "react";
import Game from "@/entities/game/Game";
import Field from "@/entities/field/Field";
import FieldComponent from "@/features/Field/FieldComponent";
import {DndProvider} from "react-dnd";
import {HTML5Backend} from "react-dnd-html5-backend";
import {GameSolver} from "@/entities/gameSolver/GameSolver";
import Button from "@/shared/components/Button/Button";


export default function GameLayout (){

  const [game, updateGame] = useState(new Game());
  const [step, setStep] = useState(0);
  const [board, setBoard] = useState(game.getBoard());

  useEffect(() => {
    setBoard(game.getBoard());
  }, [step]);

  const makeStep = (updatedBoard: any[]) => {
    setStep((prevState) => prevState + 1);
    setBoard(updatedBoard)
  }

  const createGameFields = () => {
    const listCols : any = [];
    board.forEach((column: Field[], index) => {
      listCols.push(createColumnElement(index,column))
    })
    return (
      <div className="list-cols">{listCols}</div>
    )
  }

  const createColumnElement = (index: number,column : Field[]) => {
    const res : any = [];

    column.forEach((field: Field) => {
      const keyField = `field_${field.getX()}:${field.getY()}`
      res.push(<FieldComponent key={keyField} field={field} makeStep={makeStep} game={game}/>)
    })

    return (
      <div className="column-field" key={index}>
        {res}
      </div>
    )
  }

  const handleSolveClick = () => {
    const gameSolver : GameSolver = new GameSolver(game);
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
      {(board )&&
        <DndProvider backend={HTML5Backend}>
          <div className="board">
            {createGameFields()}
          </div>
        </DndProvider>
      }
      <Button
        onClick={handleSolveClick}
      >
        Решить автоматически
      </Button>
    </div>
  )
}