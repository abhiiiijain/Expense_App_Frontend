import React from "react";
import DoughnutChart from "./DoughnutChart";

function PieChart(props) {
  // console.log(props.expensess);
  return (
    <div className="bg-white shadow-md rounded-lg p-5 w-full">
      <div className="font-bold">This Month</div>
      <div>
        <DoughnutChart
          expensess={props.expensess}
          userDetails={props.userDetails}
        />
      </div>
    </div>
  );
}

export default PieChart;
