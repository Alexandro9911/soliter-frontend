import { Component } from 'react';
import '@/shared/components/Modal/styles/modal.sass';
import {ModalType} from "@/shared/components/Modal/types/ModalType";
import ModalManager from "@/shared/components/Modal/ModalManager";
import {HideModal} from "@/shared/components/Modal/ModalHelper";

type Props = {};

type State = {
  modal: ModalType | null;
};

class ModalContainer extends Component<Props, State> {
  constructor(props: Props | Readonly<Props>) {
    super(props);

    this.state = {
      modal: null,
    };
  }

  componentDidMount() {
    ModalManager.getInstance().addChangeListener(
      this.onModalUpdateHandler.bind(this)
    );

    document.addEventListener('keyup', this.onKeyUp.bind(this));
  }

  componentWillUnmount() {
    ModalManager.getInstance().removeChangeListener(
      this.onModalUpdateHandler.bind(this)
    );

    document.removeEventListener('keyup', this.onKeyUp.bind(this));
  }

  private onModalUpdateHandler(modal: ModalType | null) {
    this.setState({
      modal,
    });
  }

  private onKeyUp(e: KeyboardEvent) {
    if (e.code !== 'Escape' || this.state.modal === null) {
      return;
    }

    this.onModalUpdateHandler(null);
  }

  private onClickClose() {
    HideModal();
  }

  render() {
    const { modal } = this.state;

    if (modal === null) {
      return;
    }

    return (
      <div className='modal'>
        <div className='modal__wrapper'>
          <div
            onClick={this.onClickClose.bind(this)}
            className='outer-modal'
          ></div>
          {modal.component}
        </div>
      </div>
    );
  }
}

export default ModalContainer;
