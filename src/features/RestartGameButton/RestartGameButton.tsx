import React, {useCallback} from "react";
import Button from "@/shared/components/Button/Button";
import Game from "@/entities/game/Game";

type Props = {
  gameRef: React.MutableRefObject<Game>,
  setBoard: Function,
  setUpdateFlag: Function
}
export default function RestartGameButton({gameRef, setBoard,setUpdateFlag} : Props){

  const restartGameHandler = useCallback(() => {
    const updatedBoard = gameRef.current.restartGame()
    gameRef.current.setBoard(updatedBoard);
    setBoard(updatedBoard);
    setUpdateFlag((prev : boolean) => !prev);
  }, [])

  return (
    <Button onClick={restartGameHandler}>
      Начать сначала
    </Button>
  )
}