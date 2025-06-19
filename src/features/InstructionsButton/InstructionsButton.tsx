import Button from "@/shared/components/Button/Button";
import {ShowModal} from "@/shared/components/Modal/ModalHelper";
import InstructionsModal from "@/features/InstructionsModal/InstructionsModal";

export default function InstructionsButton(){

  const onClickButton = () => {
    ShowModal({
      name: 'instructionsModal',
      component: <InstructionsModal/>
    })
  }

  return (
    <Button onClick={onClickButton}>
      Правила игры
    </Button>
  )
}