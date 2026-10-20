import { IoCloseSharp } from "react-icons/io5";
import "../css/btnClose.css";

interface BtnCloseProps {
  onClick: () => void;
  cor?: "preto" | "branco";
}

export default function BtnClose({
  onClick,
  cor = "branco",
}: BtnCloseProps) {
    
  return (
    <button
      type="button"
      className={`IconCancelar ${cor}`}
      onClick={onClick}
    >
      <IoCloseSharp size={25} />
    </button>
  );
}
