export const PlayButton = ({
  onClick,
}: {
  onClick?: React.MouseEventHandler<SVGSVGElement>;
}) => (
  <svg onClick={onClick} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <path
      fill="rgba(0, 0, 0, 0.6)"
      d="M0 16C0 7.163 7.163 0 16 0s16 7.163 16 16-7.163 16-16 16S0 24.837 0 16Z"
    />
    <path
      fill="white"
      d="M13 10.92v10.16a1 1 0 0 0 1.573.819l7.257-5.08a1 1 0 0 0 0-1.638l-7.256-5.08a1 1 0 0 0-1.574.82Z"
    />
  </svg>
);
