import {ModalType} from "@/shared/components/Modal/types/ModalType";
import ModalManager from "@/shared/components/Modal/ModalManager";


export function ShowModal(modal: ModalType) {
  ModalManager.getInstance().show(modal);
}

export function HideModal() {
  ModalManager.getInstance().hide();
}
