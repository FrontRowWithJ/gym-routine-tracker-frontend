import { CreateButtonProps } from "./types";
import "./CreateButton.css";
import { Add } from "@/resources/SVG";
import { Button } from "@/components/Button";

export const CreateButton = (props: CreateButtonProps) => {
  return (
    <Button
      className={`create-button static-noise ${props.className ?? ""}`}
      onClick={props.onClick}
    >
      <Add />
      <span>{props.label}</span>
    </Button>
  );
};
