import React from "react";
import VerticalChart from "./VerticalChart";
import CardHeader from "./CardHeader";

function BarChart({ expenses }) {
  return (
    <div className="bg-white shadow-lg rounded-2xl p-6 w-full ring-1 ring-gray-100">
      <CardHeader eyebrow="Overview" title="Last 7 Days" />
      <VerticalChart expenses={expenses} />
    </div>
  );
}

export default BarChart;
