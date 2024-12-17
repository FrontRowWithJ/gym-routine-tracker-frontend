import { CreateButtonProps } from "./types";
import "./CreateButton.css";
import { Add } from "@/resources/SVG";
import { Rippleable } from "@/components/Rippleable";

export const CreateButton = (props: CreateButtonProps) => {
  return (
    <Rippleable>
      <div className="create-button" onClick={props.onClick}>
        <Add />
        <span>{props.label}</span>
      </div>
    </Rippleable>
  );
};
