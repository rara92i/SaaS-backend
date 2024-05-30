import React, { useState, useEffect } from 'react';
import { Container, TextField, Button, Typography, Box, Grid } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { CSVLink } from 'react-csv'; // Importer le module pour l'exportation CSV
// eslint-disable-next-line no-unused-vars
import { Chart as ChartJS, defaults } from 'chart.js/auto';
import { Line, Bar } from 'react-chartjs-2';
import TradingBoard from '../components/TradingBoard';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../config/firebase';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';



function TradingSimulator() {
    const [form, setForm] = useState({
        startingBalance: 100,
        winRate: 50,
        takeProfit: 2,
        stopLoss: 1,
        trades: 100,
        leverage: 1
    });
    const [result, setResult] = useState(null);
    const [tradesData, setTradesData] = useState([]);
    const [user, loading] = useAuthState(auth);
    const [userData, setUserData] = useState(null);

    useEffect(() => {
      if (user) {
          const fetchData = async () => {
              const docRef = doc(db, "users", user.uid);
              const unsub = onSnapshot(docRef, (doc) => {
                  if (doc.exists()) {
                      setUserData(doc.data());
                  } else {
                      console.error("No such document!");
                  }
              });
              return unsub;
          };
          fetchData();
      }
  }, [user]);

  const updateUserData = async (newSimulations) => {
      const docRef = doc(db, "users", user.uid);
      await updateDoc(docRef, { simulations: newSimulations });
  };
    

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: name === 'leverage' && value > 50 ? 50 : value });
    };

    const handleIncrement = () => {
        setForm({ ...form, trades: parseInt(form.trades) + 1 });
    };

    const simulateTrades =  async() => {
      const { startingBalance, winRate, takeProfit, stopLoss, trades, leverage } = form;
      const validLeverage = Math.min(leverage, 50);
      let balance = parseFloat(startingBalance);
      let tradesData = [];

      // Calculer le nombre exact de gagnants et de perdants
      const numWins = Math.round(trades * (winRate / 100));
      const numLosses = trades - numWins;
      let outcomes = Array(numWins).fill(true).concat(Array(numLosses).fill(false));

      // Mélanger les résultats pour rendre les trades aléatoires
      for (let i = outcomes.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [outcomes[i], outcomes[j]] = [outcomes[j], outcomes[i]];
      }

      for (let i = 0; i < trades; i++) {
          const outcome = outcomes[i];
          let plPercent, plUsd;
          if (outcome) {
              plPercent = takeProfit * validLeverage;
              plUsd = balance * (plPercent / 100);
              balance += plUsd;
          } else {
              plPercent = -stopLoss * validLeverage;
              plUsd = balance * (plPercent / 100);
              balance += plUsd;
          }
          tradesData.push({
              id: i + 1,
              tradeNumber: i + 1,
              outcome: outcome ? 'Win' : 'Loss',
              plPercent: plPercent.toFixed(2),
              plUsd: plUsd.toFixed(2),
              newBalance: balance.toFixed(2)
          });
      }

      setResult(balance);
      setTradesData(tradesData);
  

   // Update user data
   if (userData) {
    const newSimulations = userData.simulations + 1;
    const now = new Date();
    const trialExpiry = new Date(userData.trialExpiry);
    const isTrialExpired = now > trialExpiry;
    const isFreePlanExceeded = userData.plan === 'free' && (newSimulations > 5);
    
    if (isTrialExpired || isFreePlanExceeded) {
      alert("Your plan limits have been exceeded. Please upgrade to continue.");
      return;
    }

    await updateUserData(newSimulations);
  };
  }


  const handleSubmit = async (e) => {
      e.preventDefault();
      await simulateTrades();
  };

  if (loading) return <div>Loading...</div>;

    const columns = [
        { field: 'tradeNumber', headerName: 'Trade #', width: 100, headerClassName: 'custom-header' },
        { field: 'outcome', headerName: 'Outcome', width: 100, headerClassName: 'custom-header' },
        { field: 'plPercent', headerName: 'PL %', width: 100, headerClassName: 'custom-header' },
        { field: 'plUsd', headerName: 'PL USD', width: 100, headerClassName: 'custom-header' },
        { field: 'newBalance', headerName: 'New Balance', width: 150, headerClassName: 'custom-header'}
    ];

    defaults.plugins.title.display = true;
    defaults.plugins.title.align = 'start';
    defaults.plugins.title.font.size = 20;
    defaults.plugins.title.color = 'white';

    const BarChart = () => {
      const winCount = tradesData.filter(trade => trade.outcome === 'Win').length;
      const lossCount = tradesData.filter(trade => trade.outcome === 'Loss').length;
  
      const data = {
          labels: ['Wins', 'Losses'],
          datasets: [
              {
                  label: 'Number of Trades',
                  data: [winCount, lossCount],
                  backgroundColor: ['#4caf50', '#f44336'],
              },
          ],
      };
  
      return <Bar data={data} />;
  };

    return (
       
            <Container maxWidth="sm">
                <Typography variant="h3" gutterBottom>
                   Trading Simulator
                </Typography>
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                label="Starting Balance"
                                name="startingBalance"
                                type="number"
                                value={form.startingBalance}
                                onChange={handleChange}
                                fullWidth
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Win Rate (%)"
                                name="winRate"
                                type="number"
                                value={form.winRate}
                                onChange={handleChange}
                                fullWidth
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Take Profit (%)"
                                name="takeProfit"
                                type="number"
                                value={form.takeProfit}
                                onChange={handleChange}
                                fullWidth
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Stop Loss (%)"
                                name="stopLoss"
                                type="number"
                                value={form.stopLoss}
                                onChange={handleChange}
                                fullWidth
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={8}>
                            <TextField
                                label="Number of Trades"
                                name="trades"
                                type="number"
                                value={form.trades}
                                onChange={handleChange}
                                fullWidth
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={4} display="flex" alignItems="center">
                            <Button onClick={handleIncrement} variant="contained" color="primary" fullWidth>
                                Increment
                            </Button>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Leverage (max 50)"
                                name="leverage"
                                type="number"
                                value={form.leverage}
                                onChange={handleChange}
                                fullWidth
                                variant="outlined"
                            />
                        </Grid>
                    </Grid>
                    <Box mt={2}>
                        <Button type="submit" variant="contained" color="primary" fullWidth>
                            Simulate
                        </Button>
                    </Box>
                </form>
                {result !== null && (
                    <Typography variant="h5" mt={4}>
                        Final Balance: ${Number(result).toFixed(2)}
                    </Typography>
                )}
                {tradesData.length > 0 && (
                    <>
                        <Box mt={4} pt={2} style={{ height: 400, width: '100%' }}>
                         <Line 
                            data={{
                             labels: tradesData.map(trade => trade.tradeNumber), // Trade #
                            datasets: [
                            {
                             label: 'Balance',
                             data: tradesData.map(trade => trade.newBalance), // New Balance
                            },],
                            }}
                            options={{
                              elements:{
                                line:{
                                  tension: 0.5 , 
                                }
                              },
                            plugins: {
                              title: {
                                text : "Account Balance"
                              }
                            }  
                            }}
                            />
                        </Box>
                        <Box mt={-5}  style={{ height: 400, width: '100%' }}>
                            <DataGrid rows={tradesData} columns={columns} pageSize={10} rowsPerPageOptions={[10]} getRowId={(row) => row.id} />
                        </Box>
                        {tradesData.length > 0 && (
    <Box mt={4}>
        <BarChart />
    </Box>
)}
                        <Box mt={2}>
                            <Button variant="contained" color="secondary">
                                <CSVLink data={tradesData} filename={"trades_data.csv"} style={{ color: '#fff', textDecoration: 'none' }}>
                                    Export to CSV
                                </CSVLink>
                            </Button>
                        </Box>
                    </>
                )}
                   {/* Intégration du composant TradingBoard */}
                  <Box mt={4} maxWidth={'100%'}>
                   <TradingBoard/>
                   </Box>
            </Container>
        
    );
}

export default TradingSimulator;
