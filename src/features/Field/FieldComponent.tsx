import './field.sass';
import Game from "@/entities/core/Game";
import Field from "@/entities/core/Field";
import {useDrop} from "react-dnd";
import {DRAG_TYPES} from "@/entities/constants";
import Chip from "@/entities/core/Chip";
import {Point} from "@/entities/types/types";
import classNames from "classnames";
import React from "react";
import ChipComponent from "@/features/Chip/ChipComponent";

type Props = {
  game: Game,
  field: Field,
  makeStep: Function;

}

export default function FieldComponent(
  {
    game,
    field,
    makeStep,

  } : Props
){

  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: DRAG_TYPES.CHIP,
    drop: (item, monitor) => {
      makeStep(game.moveChip(item as Chip, field))
    },
    collect: monitor => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop()
    }),
    canDrop: (item) => {
      const currChip = item as Chip
      const pointStart : Point = currChip.getPosition()
      const pointEnd : Point = {
        x: field.getX(),
        y: field.getY(),
      }
      return game.checkMove(pointStart,pointEnd)
    }
  }), [field])

  const composeClassesField = () => {
    return classNames('field',{
      'field_disabled': field.getIsDisabled(),
      'field_over-success' : isOver && canDrop,
      'field_over-wrong' : isOver && !canDrop,
    })
  }

  return (
    drop(
    <div className={composeClassesField()}>
      <div className="field__content">
        { field.hasChip() &&
          <ChipComponent chip={field.getChip()} />
        }
      </div>
      {`${field.getX()}, ${field.getY()}`}
    </div>
    )
  )
}