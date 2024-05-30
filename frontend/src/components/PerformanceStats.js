import React from 'react';
import { Box, Typography } from '@mui/material';

const PerformanceStats = ({ trades }) => {
  const totalTrades = trades.length;
  const winningTrades = trades.filter(trade => parseFloat(trade.profitOrLoss) > 0).length;
  const totalProfit = trades.reduce((acc, trade) => acc + parseFloat(trade.profitOrLoss), 0);
  const averageProfit = (totalProfit / totalTrades).toFixed(2);
  const winRate = ((winningTrades / totalTrades) * 100).toFixed(2);

  return (
    <Box mt={4}>
      <Typography variant="h5">Statistics</Typography>
      <Typography>Total Trades: {totalTrades}</Typography>
      <Typography>Winning Trades: {winningTrades}</Typography>
      <Typography>Total Profit: ${totalProfit.toFixed(2)}</Typography>
      <Typography>Average Profit per Trade: ${averageProfit}</Typography>
      <Typography>Win Rate: {winRate}%</Typography>
    </Box>
  );
};

export default PerformanceStats;
