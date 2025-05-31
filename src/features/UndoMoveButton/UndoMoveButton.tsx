import Button from "@/shared/components/Button/Button";
import React from "react";
import {GameStateManager} from "@/entities/gameStateManager/GameStateManager";
type Props = {
  undoManagerRef: React.MutableRefObject<GameStateManager>,
  undoHandler: Function;
}
export default function UndoMoveButton({undoHandler,undoManagerRef}: Props ){

  return (
    <Button
      onClick={undoHandler}
      disabled={!undoManagerRef.current.canUndo()}
    >
      Отменить ход
    </Button>
  )
}