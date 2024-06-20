import React from "react";
import VerticalChart from "./VerticalChart";
function BarChart(props) {
  return (
    <>
      <div className="bg-white shadow-md rounded-lg p-5">
        <div className="font-bold">Last Week</div>
        <div>
          <VerticalChart
            expensess={props.expensess}
            user={props.user}
          />
        </div>
      </div>
    </>
  );
}

export default BarChart;
