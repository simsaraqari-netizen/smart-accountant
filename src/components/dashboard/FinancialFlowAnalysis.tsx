import React from 'react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, Cell } from 'recharts';

interface FinancialFlowAnalysisProps {
  totals: { income: number; expense: number };
  custodyTotal: number;
}

export const FinancialFlowAnalysis: React.FC<FinancialFlowAnalysisProps> = ({ totals, custodyTotal }) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full min-h-[300px]">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-black text-emerald-600 text-center w-full">
          تحليل التدفق المالي
        </h3>
      </div>
      <div className="flex-1 w-full min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={[
              {
                name: "ايرادات",
                value: totals.income,
                label: `${totals.income.toLocaleString("en-US")} د.ك`,
              },
              {
                name: "مصاريف",
                value: totals.expense,
                label: `${totals.expense.toLocaleString("en-US")} د.ك`,
              },
              {
                name: "عهدة",
                value: custodyTotal,
                label: `${custodyTotal.toLocaleString("en-US")} د.ك`,
              },
            ]}
            margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#F1F5F9"
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={(props: any) => {
                const { x, y, payload } = props;
                const item = [
                  {
                    name: "ايرادات",
                    label: `${totals.income.toLocaleString("en-US")} د.ك`,
                  },
                  {
                    name: "مصاريف",
                    label: `${totals.expense.toLocaleString("en-US")} د.ك`,
                  },
                  {
                    name: "عهدة",
                    label: `${custodyTotal.toLocaleString("en-US")} د.ك`,
                  },
                ].find((d) => d.name === payload.value);

                return (
                  <g transform={`translate(${x},${y})`}>
                    <text
                      x={0}
                      y={10}
                      dy={0}
                      textAnchor="middle"
                      fill="#64748B"
                      fontSize={12}
                      fontWeight="bold"
                    >
                      {payload.value}
                    </text>
                    <text
                      x={0}
                      y={26}
                      dy={0}
                      textAnchor="middle"
                      fill="#94A3B8"
                      fontSize={10}
                    >
                      {item?.label}
                    </text>
                  </g>
                );
              }}
            />
            <YAxis hide domain={[0, "auto"]} />
            <Tooltip
              cursor={{ fill: "#F8FAFC" }}
              contentStyle={{
                borderRadius: "12px",
                border: "none",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                fontSize: "12px",
                fontWeight: "bold"
              }}
            />
            <Bar
              dataKey="value"
              radius={[6, 6, 0, 0]}
              barSize={60}
            >
              <Cell fill="#10B981" />
              <Cell fill="#F43F5E" />
              <Cell fill="#F59E0B" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
