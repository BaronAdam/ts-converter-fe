import { FC } from "react";

const ResultDisplay: FC<ResultDisplayProps> = ({ hours, minutes }) => {
  return (
    <div className="m-2 flex justify-between text-2xl text-gray-900">
      <span>Real time left:</span>
      <span>
        {hours}:{minutes < 10 ? `0${minutes}` : minutes}h
      </span>
    </div>
  );
};

export default ResultDisplay;
