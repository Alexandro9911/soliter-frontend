import {ReactNode} from "react";
import '@/widgets/menu/menu.sass';
type Props = {
  children?: ReactNode
}
export default function MenuRow({children}: Props) {
  return (
    <div className="menu-row">
      {children}
    </div>
  )
}