import { Component } from 'react';
import classNames from 'classnames';
import {HideModal} from "@/shared/components/Modal/ModalHelper";

type Props = {
  classNames?: string | string[];
};

class Modal extends Component<React.PropsWithChildren<Props>> {

  private composeClasses() {
    return classNames('modal__card',
      Array.isArray(this.props.classNames)
        ? [ ...this.props.classNames ]
        : this.props.classNames
    );
  }

  render() {
    return (
      <div className={this.composeClasses()}>
        <div className='modal__card__card-wrapper'>
          <button className='modal__card__icon-close' onClick={HideModal}>
            X
          </button>
          <>{this.props.children}</>
        </div>
      </div>
    );
  }

  static defaultProps = {
    classNames: []
  };
}

export default Modal;
