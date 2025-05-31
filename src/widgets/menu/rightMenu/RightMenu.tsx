import '../menu.sass';
import {ReactNode} from "react";

type Props = {
  children?: ReactNode
}
export default function RightMenu({children} : Props){
  return (
    <div className='right-menu'>
      {children}
    </div>
  )
}