import { HomeLinkProps } from "./types";
import "./HomeLink.css";
import { Back } from "@/resources/SVG";
import { Button } from "@/components/Button";

export const HomeLink = ({ page, setPage }: HomeLinkProps) => {
  return (
    <Button
      className="home-button"
      onClick={() => {
        if (page === "Workout") {
          setPage();
        }
      }}
    >
      {page === "Routine" ? "G" : <Back />}
    </Button>
  );
};
