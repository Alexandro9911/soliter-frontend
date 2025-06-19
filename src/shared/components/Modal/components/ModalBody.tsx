import { Component, ReactElement, ReactPortal } from 'react';

type ReactText = string | number;
type ReactChild = ReactElement | ReactText;

interface ReactNodeArray extends Array<ReactNode> {}
type ReactFragment = {} | ReactNodeArray;
type ReactNode = ReactChild | ReactFragment | ReactPortal | boolean | null | undefined;

type Props = {
  children: ReactNode;
}

class ModalBody extends Component<Props> {
  render() {
    return (
      <div className='modal__card__body'>
        <>{this.props.children}</>
      </div>
    );
  }
}

export default ModalBody;
