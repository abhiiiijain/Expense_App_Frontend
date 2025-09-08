import React from "react";
import VerticalChart from "./VerticalChart";
function BarChart(props) {
  return (
    <>
      <div className="bg-white shadow-lg rounded-2xl p-6 w-full ring-1 ring-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-gray-400">Overview</div>
            <div className="font-extrabold text-gray-900">Last Week</div>
          </div>
        </div>
        <div>
          <VerticalChart expensess={props.expensess} user={props.user} />
        </div>
      </div>
    </>
  );
}

export default BarChart;
