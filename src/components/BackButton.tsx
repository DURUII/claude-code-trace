import { BackIcon } from "./Icons";

export function BackButton({ onClick, label = "Back" }: { onClick: () => void; label?: string }) {
  return (
    <button className="message-detail__back" onClick={onClick}>
      <BackIcon /> {label}
    </button>
  );
}
