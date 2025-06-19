import { EventEmitter } from 'events';
import {CallBackType, ModalType} from "@/shared/components/Modal/types/ModalType";

const MODAL_MANAGER_EVENT = 'Modal::Manager::Change';

class ModalManager extends EventEmitter {
  private static instance: ModalManager;
  private modal: ModalType | null = null;

  private constructor() {
    super();
  }

  public static getInstance(): ModalManager {
    if (!ModalManager.instance) {
      ModalManager.instance = new ModalManager();
    }

    return ModalManager.instance;
  }

  public show(modal: ModalType) {
    this.modal = modal;
    this.emitChange();
  }

  public hide() {
    this.modal = null;
    this.emitChange();
  }

  private emitChange() {
    this.emit(MODAL_MANAGER_EVENT, this.modal);
  }

  public addChangeListener(callback: CallBackType) {
    this.addListener(MODAL_MANAGER_EVENT, callback);
  }

  public removeChangeListener(callback: CallBackType) {
    this.removeListener(MODAL_MANAGER_EVENT, callback);
  }
}

export default ModalManager;
