import { Theme } from "@/misc";

interface LogoProps {
  theme: Theme;
  className: string;
}

export const Logo = ({ theme, className }: LogoProps) => {
  const [background, fill] =
    theme === "dark" ? ["black", "white"] : ["white", "black"];
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 500 500"
      style={{ background }}
      className={className}
    >
      <path
        fill={fill}
        d="M0 150l100 -100l400 0l-100 100l-100 0l0 250l-100 100l0-350 "
      />
    </svg>
  );
};
