"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";

interface ChartData {
  label?: string;
  name?: string;
  value: number;
  [key: string]: any;
}

interface RegleChartProps {
  type?: "bar" | "line" | "pie";
  data: ChartData[];
  title?: string;
  color?: string;
}

export const RegleChart: React.FC<RegleChartProps> = ({
  type = "bar",
  data,
  title,
  color = "#00ffc8", // Default neon cyan
}) => {
  const COLORS = ["#ff64c8", "#00ffc8", "#fbbf24", "#34d399", "#60a5fa", "#8b5cf6", "#f43f5e"];
  
  // Normalize data for PieChart which expects 'name'
  const normalizedData = data.map(item => ({
    ...item,
    name: item.name || item.label || "UNNAMED_DATA"
  }));

  const renderChart = () => {
    switch (type) {
      case "pie":
        return (
          <PieChart>
            <Pie
              data={normalizedData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
              stroke="black"
              strokeWidth={4}
            >
              {normalizedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "white", 
                border: "4px solid black", 
                borderRadius: "0px",
                fontWeight: "900",
                textTransform: "uppercase"
              }} 
            />
            <Legend 
              verticalAlign="bottom" 
              height={36} 
              formatter={(value) => <span className="font-black text-[10px] uppercase tracking-tighter text-black">{value}</span>}
            />
          </PieChart>
        );
      case "line":
        return (
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="0" stroke="black" strokeWidth={1} />
            <XAxis 
              dataKey="name" 
              stroke="black" 
              fontSize={12} 
              fontWeight="900" 
              tickLine={false}
              axisLine={{ strokeWidth: 4 }}
            />
            <YAxis 
              stroke="black" 
              fontSize={12} 
              fontWeight="900" 
              tickLine={false}
              axisLine={{ strokeWidth: 4 }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "white", 
                border: "4px solid black", 
                borderRadius: "0px",
                fontWeight: "900",
                textTransform: "uppercase"
              }} 
            />
            <Line 
              type="stepAfter" 
              dataKey="value" 
              stroke="black" 
              strokeWidth={5} 
              dot={{ r: 8, fill: color, stroke: "black", strokeWidth: 4 }}
              activeDot={{ r: 10, fill: "white", stroke: "black", strokeWidth: 4 }}
            />
          </LineChart>
        );
      default:
        return (
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="0" stroke="black" strokeWidth={1} vertical={false} />
            <XAxis 
              dataKey="name" 
              stroke="black" 
              fontSize={12} 
              fontWeight="900" 
              tickLine={false}
              axisLine={{ strokeWidth: 4 }}
            />
            <YAxis 
              stroke="black" 
              fontSize={12} 
              fontWeight="900" 
              tickLine={false}
              axisLine={{ strokeWidth: 4 }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "white", 
                border: "4px solid black", 
                borderRadius: "0px",
                fontWeight: "900",
                textTransform: "uppercase"
              }} 
            />
            <Bar dataKey="value" stroke="black" strokeWidth={3}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        );
    }
  };

  return (
    <div className="w-full bg-white border-4 border-black p-6 my-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
      {title && (
        <h3 className="font-black text-xl uppercase mb-6 border-b-4 border-black pb-2 inline-block">
          {title}
        </h3>
      )}
      <div className="h-[300px] w-full font-mono">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
      <div className="mt-4 flex items-center gap-4">
        <div className="h-4 w-4 bg-black animate-pulse" />
        <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">
          DATA_STREAM::VISUALIZATION_READY
        </span>
      </div>
    </div>
  );
};
