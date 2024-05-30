import React, { useState, useEffect } from 'react';
import { Container, TextField, Button, Typography, Box, Grid, Checkbox, FormControlLabel, InputAdornment } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { CSVLink } from 'react-csv';
import PerformanceChart from './PerformanceChart';
import PerformanceStats from './PerformanceStats';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../config/firebase';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';


const blueTextFieldStyle = {
  '& .MuiInputBase-input': {
      color: '#2a77d2',
  },
  '& .MuiInputLabel-root': {
      color: '#2a77d2',
  },
  '& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': {
      borderColor: '#2a77d2',
  }
};

const whiteAdornmentStyle = {
  color: '#ffffff'
};


function TradingBoard() {
  const initialBalance = 100;
    const [form, setForm] = useState({
        assetName: '',
        entryPrice: 0,
        exitPrice: 0,
        investedAmount: 100,
        investAll: false,
        orderType: 'Long',
        timeFrame: 'Daily',
        leverage: 1
    });
    const [trades, setTrades] = useState([]);
    const [balance, setBalance] = useState(initialBalance);
    const [user, loading] = useAuthState(auth);
    const [userData, setUserData] = useState(null);

   
  useEffect(() => {
    if (user) {
      const docRef = doc(db, "users", user.uid);
      const unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        } else {
          console.error("No such document!");
        }
      });
      return () => unsubscribe(); // Cleanup on unmount
    }
  }, [user]);
  

    useEffect(() => {
        const savedTrades = localStorage.getItem('trades');
        const savedBalance = localStorage.getItem('balance');
        if (savedTrades) {
            setTrades(JSON.parse(savedTrades));
        }
        if (savedBalance) {
          setBalance(parseFloat(savedBalance));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('trades', JSON.stringify(trades));
        localStorage.setItem('balance', balance.toString());
    }, [trades, balance]);

    const handleChange = (e) => {
        const { name, value, checked } = e.target;
        if (name === 'investAll') {
            setForm({ ...form, [name]: checked });
        } else {
            setForm({ ...form, [name]: value });
        }
    };

    const handleBalanceChange = (e) => {
      setBalance(parseFloat(e.target.value));
  };

    const handleAddTrade = async () => {
      if (trades.length >= 10) {
        alert("You have reached the maximum of 10 trades. Please upgrade your plan to add more trades.");
        return;
      }
        const { entryPrice, exitPrice, investAll, leverage, orderType } = form;
        const investedAmount = investAll ? balance : form.investedAmount;
        const plPercent = ((orderType === 'Long' ? (exitPrice - entryPrice) : (entryPrice - exitPrice)) / entryPrice) * 100;
        const profitOrLoss = (plPercent / 100) * investedAmount * leverage;
        const newBalance = (parseFloat(balance) + profitOrLoss).toFixed(2);

        const newTrade = {
            id: trades.length + 1,
            ...form,
            investedAmount,
            profitOrLoss: profitOrLoss.toFixed(2),
            newBalance,
            plPercent: plPercent.toFixed(2) // Ajout du pourcentage de gain ou de perte
        };

        setTrades([...trades, newTrade]);
        setBalance(parseFloat(newBalance));
        setForm({ ...form, entryPrice: 0, exitPrice: 0, investedAmount: 0, investAll: false });
     
    if (userData) {
      const newJournalLines = userData.journalLines + 1;
      const now = new Date();
      const trialExpiry = new Date(userData.trialExpiry);
      const isTrialExpired = now > trialExpiry;
      const isFreePlanExceeded = userData.plan === 'free' && (newJournalLines > 10);

      if (isTrialExpired || isFreePlanExceeded) {
        alert("Your plan limits have been exceeded. Please upgrade to continue.");
        return;
      }

       await updateDoc(doc(db, "users", user.uid), {
        journalLines: newJournalLines,
      });
    }
  };

    const handleDeleteTrade = (id) => {
      const updatedTrades = trades.filter(trade => trade.id !== id);
      setTrades(updatedTrades);

      if (updatedTrades.length === 0) {
        setBalance(initialBalance);
      } else {
          const latestTrade = updatedTrades[updatedTrades.length - 1];
          setBalance(parseFloat(latestTrade.newBalance));
      }
  };

    const columns = [
        { field: 'id', headerName: 'Trade #', width: 80, headerClassName: 'custom-header' },
        { field: 'assetName', headerName: 'Asset', width: 120, headerClassName: 'custom-header' },
        { field: 'entryPrice', headerName: 'Entry Price', width: 120, headerClassName: 'custom-header' },
        { field: 'exitPrice', headerName: 'Exit Price', width: 120,  headerClassName: 'custom-header' },
        { field: 'investedAmount', headerName: 'Invested Amount', width: 150, headerClassName: 'custom-header' },
        { field: 'orderType', headerName: 'Order Type', width: 120, headerClassName: 'custom-header', },
        { field: 'timeFrame', headerName: 'Time Frame', width: 120, headerClassName: 'custom-header' },
        { field: 'leverage', headerName: 'Leverage', width: 100, headerClassName: 'custom-header' },
        { field: 'profitOrLoss', headerName: 'P&L', width: 120, headerClassName: 'custom-header' },
        { field: 'newBalance', headerName: 'New Balance', width: 150, headerClassName: 'custom-header'},
        { field: 'plPercent', headerName: 'P&L (%)', width: 120, headerClassName: 'custom-header',  
         renderCell: (params) => (
          <div>{params.value}%</div>
        ) },
        { 
          field: 'delete',
          headerName: 'Delete', 
          width: 100,
          headerClassName: 'custom-header',
          renderCell: (params) => (
              <Button 
                  variant="outlined" 
                  color="secondary" 
                  onClick={() => handleDeleteTrade(params.row.id)}
              >
                  Delete
              </Button>
          )
      }
    ];

    if (loading) return <div>Loading...</div>;

    return (
       
            <Container maxWidth="sm" disableGutters>
                <Typography variant="h4" gutterBottom>
                   Trading Journal
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <TextField
                              label="Starting Balance"
                              name="startingBalance"
                              type="number"
                              value={balance}
                              onChange={handleBalanceChange}
                              fullWidth
                              variant="outlined"   
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <span style={whiteAdornmentStyle}>$</span>
                                  </InputAdornment>
                                ),
                              }}
                              sx={blueTextFieldStyle}
                          />

                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            label="Asset Name"
                            placeholder='BTC'
                            name="assetName"
                            type="string"
                            value={form.assetName}
                            onChange={handleChange}
                            fullWidth
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            label="Entry Price"
                            name="entryPrice"
                            type="number"
                            value={form.entryPrice}
                            onChange={handleChange}
                            fullWidth
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            label="Exit Price"
                            name="exitPrice"
                            type="number"
                            value={form.exitPrice}
                            onChange={handleChange}
                            fullWidth
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item xs={6}>
                    <TextField
                            label="Invested Amount"
                            name="investedAmount"
                            type="number"
                            value={form.investAll ? balance.toFixed(2) : form.investedAmount}
                            onChange={handleChange}
                            fullWidth
                            variant="outlined"
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <span style={whiteAdornmentStyle}>$</span>
                                </InputAdornment>
                              ),
                            }}
                            disabled={form.investAll}
                            sx={form.investAll ? blueTextFieldStyle : {}}
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={form.investAll}
                                    onChange={handleChange}
                                    name="investAll"
                                    color="primary"
                                />
                            }
                            label="Invest All"
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            label="Leverage"
                            name="leverage"
                            type="number"
                            value={form.leverage}
                            onChange={handleChange}
                            fullWidth
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            label="Order Type"
                            name="orderType"
                            select
                            value={form.orderType}
                            onChange={handleChange}
                            fullWidth
                            variant="outlined"
                            SelectProps={{
                                native: true,
                            }}
                        >
                            <option value="Long">Long</option>
                            <option value="Short">Short</option>
                        </TextField>
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            label="Time Frame"
                            name="timeFrame"
                            select
                            value={form.timeFrame}
                            onChange={handleChange}
                            fullWidth
                            variant="outlined"
                            SelectProps={{
                                native: true,
                            }}
                        >
                            <option value="Monthly">1H</option>
                            <option value="Monthly">4H</option>
                            <option value="Daily">Daily</option>
                            <option value="Weekly">Weekly</option>
                        </TextField>
                    </Grid>
                </Grid>
                <Box mt={2}>
                    <Button variant="contained" color="primary" fullWidth onClick={handleAddTrade}>
                        Add Trade
                    </Button>
                </Box>
                <Typography variant="h5" mt={4}>
                    Current Balance: ${balance.toFixed(2)}
                </Typography>
                <Box mt={4} style={{ height: 400, width: '100%' }}>
                    <DataGrid rows={trades} columns={columns} pageSize={10} rowsPerPageOptions={[10]} />
                </Box>
                <Box mt={2}>
                    <Button variant="contained" color="secondary">
                        <CSVLink data={trades} filename={"trades_data.csv"} style={{ color: '#fff', textDecoration: 'none' }}>
                            Export to CSV
                        </CSVLink>
                    </Button>
                </Box>
                <Typography variant="h5" mt={4}>
                <PerformanceStats trades={trades} />
                </Typography>
                <Typography variant="h5" mt={4}>
                   Performance
                </Typography>
                <PerformanceChart trades={trades} /> 
            </Container>
       
    );
}


export default TradingBoard;
