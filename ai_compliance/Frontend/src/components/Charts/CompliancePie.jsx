import { useState } from "react";
import { PieChart, Pie, Cell, Sector } from "recharts";

const COLORS = ["#009990", "#ED3F27", "#FEB21A", "#6b7280"];
const RADIAN = Math.PI / 180;

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const renderActiveShape = (props) => {
  const {
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    index,
    percent,
    payload,
  } = props;
  const isSpecial = index === 1;
  const sliceFill = isSpecial ? "#FF0000" : fill;

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={sliceFill}
      />
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill="#fff">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    </g>
  );
};

export default function CompliancePie({ pieValue }) {
  const [activeIndex, setActiveIndex] = useState(null);
  const data = [
    { name: "Compliant", value: pieValue?.compliant || 0 },
    { name: "Insufficient Evidence", value: pieValue?.evidence || 0 },
    { name: "No Evidence Found", value: pieValue?.Noevidence || 0 },
    { name: "Not Relevant to XML", value: pieValue?.noRelevant || 0 },
  ];

  return (
    <div className="flex justify-center items-center gap-4">
      <PieChart width={330} height={400}>
        <Pie
          data={data}
          cx={165}
          cy={200}
          labelLine={false}
          label={renderCustomizedLabel}
          activeIndex={activeIndex}
          activeShape={renderActiveShape}
          outerRadius={120}
          innerRadius={50}
          dataKey="value"
          onMouseEnter={(_, index) => setActiveIndex(index)}
          onMouseLeave={() => setActiveIndex(null)}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
      </PieChart>

      <div className="flex flex-col gap-3">
        {data.map((entry, index) => (
          <div key={index} className="flex items-center">
            <div
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <h4 className="text-white text-sm">{entry.name}</h4>
          </div>
        ))}
      </div>
    </div>
  );
}
