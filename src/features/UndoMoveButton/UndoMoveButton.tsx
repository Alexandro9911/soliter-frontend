import Button from "@/shared/components/Button/Button";
import React, {useCallback} from "react";
import {GameStateManager} from "@/entities/gameStateManager/GameStateManager";
import Game from "@/entities/game/Game";
type Props = {
  undoManagerRef: React.MutableRefObject<GameStateManager>,
  gameRef: React.MutableRefObject<Game>,
  setBoard: Function,
  setUpdateFlag: Function
}
export default function UndoMoveButton({undoManagerRef, gameRef, setBoard, setUpdateFlag}: Props ){

  const undoHandler = useCallback(() => {
    const prevState = undoManagerRef.current.getPrevState();
    if (prevState) {
      gameRef.current.setBoard(prevState);
      setBoard(prevState);
      setUpdateFlag((prev : boolean) => !prev);
    }
  }, []);

  return (
    <Button
      onClick={undoHandler}
      disabled={!undoManagerRef.current.canUndo()}
    >
      Отменить ход
    </Button>
  )
}