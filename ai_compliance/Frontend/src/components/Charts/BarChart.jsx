import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function BarChart1({ value }) {
  const [barData, setBarData] = useState([]);

  useEffect(() => {
    if (value) {
      const tempData = Object.values(value)
        .sort((a, b) => Number(a.sectionNumber) - Number(b.sectionNumber))
        .map((item) => ({
          name: `Section ${item.sectionNumber}`,
          compliant: item.compliant,
          failed: item.failed,
        }));
      setBarData(tempData);
    }
  }, [value]);

  return (
    <ResponsiveContainer width={700} height={300}>
      <BarChart
        width={500}
        height={300}
        data={barData}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="compliant" stackId="a" fill="#82ca9d" />
        <Bar dataKey="failed" stackId="a" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
}
