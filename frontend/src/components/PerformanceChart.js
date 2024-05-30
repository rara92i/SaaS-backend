// PerformanceChart.js
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const PerformanceChart = ({ trades }) => {
  // Préparer les données pour le graphique
  const chartData = trades.map(trade => ({
    name: `Tr ${trade.id}`,
    ProfitOrLoss: parseFloat(trade.profitOrLoss),
    Balance: parseFloat(trade.newBalance),
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="4 4" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="ProfitOrLoss" stroke="#8884d8" activeDot={{ r: 8 }} />
        <Line type="monotone" dataKey="Balance" stroke="#82ca9d" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default PerformanceChart;
