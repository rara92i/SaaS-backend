import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Button, Box } from '@mui/material';
import cancelImage from '../assets/images/cancel.png';

const Cancel = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <Container maxWidth="sm" style={{ textAlign: 'center', padding: '20px' }}>
      <Box
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
        }}
      >
        <img src={cancelImage} alt="Payment Canceled" style={{ width: '150px', marginBottom: '20px' }} />
        <Typography variant="h4" color="red" gutterBottom>
          Something Went Wrong
        </Typography>
        <Typography variant="body1" color="textPrimary"  gutterBottom>
          Your payment was canceled or an error occurred. Please try again.
        </Typography>
        <Button variant="contained" color="primary" onClick={handleGoHome}>
          Go to Home Page
        </Button>
      </Box>
    </Container>
  );
};

export default Cancel;
