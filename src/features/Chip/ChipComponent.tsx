import './chip.sass';
import {useDrag} from "react-dnd";
import {DRAG_TYPES} from "@/entities/constants";
import Chip from "@/entities/chip/Chip";

type Props = {
  chip: Chip | null
}
export default function ChipComponent (props: Props){
  const [{ isDragging }, drag] = useDrag(() => ({
    type: DRAG_TYPES.CHIP,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging()
    }),
    item: props.chip,
  }))

  if(!props.chip) {
    return null;
  }

  return (
    drag(
      <div
        className='chip-item'
      >
      </div>
    )
  )
}