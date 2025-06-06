import React from "react";
import Button from "@/shared/components/Button/Button";

type Props = {
  restartGameHandler: Function
}
export default function RestartGameButton({restartGameHandler} : Props){
  return (
    <Button onClick={restartGameHandler}>
      Начать сначала
    </Button>
  )
}