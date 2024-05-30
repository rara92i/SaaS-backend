import React, { useState } from 'react';
import { Container, Typography, TextField, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {  createUserWithEmailAndPassword } from 'firebase/auth';
import {  doc, setDoc } from 'firebase/firestore';
import thumbsUpImage from '../assets/images/success.png'; 
import { auth, db } from '../config/firebase'; 

const SuccessPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSignUp = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        plan: 'premium',
        email: user.email,
      });

      alert('Subscription confirmed and user authenticated!');
      navigate('/simulator');
    } catch (error) {
      console.error('Error during post-payment authentication', error);
      alert(error.message);
    }
  };

  return (
    <Container maxWidth="sm" style={{ textAlign: 'center', padding: '20px' }}>
      <Box style={{ paddingBottom: '20px' }}>
        <img src={thumbsUpImage} alt="Thumbs Up" style={{ width: '100px', height: '100px' }} />
        <Typography variant="h4" gutterBottom>
          Payment Successful!
        </Typography>
      </Box>
      <Typography variant="h6" gutterBottom>
        Please sign up to confirm your subscription:
      </Typography>
      <form>
        <TextField
          label="Email"
          variant="outlined"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label="Password"
          variant="outlined"
          type="password"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSignUp}
          style={{ marginTop: '20px' }}
        >
          Sign Up
        </Button>
      </form>
    </Container>
  );
};

export default SuccessPage;
