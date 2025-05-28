import React, {ReactNode} from "react";
import '@/shared/components/Button/button.sass';

type Props = {
  children?: ReactNode;
  onClick: Function;
  disabled?: boolean;
  classes?: string;
  value?: string;
  id?: string;
  usePreventDefault?: boolean;
  useStopPropagation?: boolean;
}

export default function Button(props: Props){

  const clickHandle = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (props.usePreventDefault) {
      e.preventDefault();
    }
    if (props.useStopPropagation) {
      e.stopPropagation();
    }

    if(props.onClick){
      return props.onClick(e);
    } else {
      return false;
    }
  }

  const composeClasses = () => {
    return `ui-button ${props.classes ?? ''}`
  }

  return (
    <button
      onClick={clickHandle}
      className={composeClasses()}
      value={props.value ?? ''}
      id={props.id ?? ''}
      disabled={props.disabled}
    >
      {props.children}
    </button>
  )

}