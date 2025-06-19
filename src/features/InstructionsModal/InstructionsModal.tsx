import Modal from "@/shared/components/Modal/components/Modal";
import ModalHeader from "@/shared/components/Modal/components/ModalHeader";
import ModalBody from "@/shared/components/Modal/components/ModalBody";

export default function InstructionsModal(){
  return (
    <Modal>
      <ModalHeader>
        Правила игры
      </ModalHeader>
      <ModalBody>
        тут правила
      </ModalBody>
    </Modal>
  )
}