import React, { useState, useEffect } from 'react';
import { Container, TextField, Button, Box } from '@mui/material';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { useNavigate, useLocation } from 'react-router-dom';
import SignUpImage from '../assets/images/Signup.png';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const [plan, setPlan] = useState('trial');

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const selectedPlan = queryParams.get('plan');
    if (selectedPlan) {
      setPlan(selectedPlan);
    }
  }, [location]);

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      let planData = {
        email: user.email,
        plan: plan,
        simulations: 0,
        journalLines: 0,
      };

      if (plan === 'trial') {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);
        planData.trialExpiry = expiryDate.toISOString();
      }

      await setDoc(doc(db, "users", user.uid), planData);
      navigate('/simulator');
    } catch (error) {
      console.error("Error signing up:", error);
    }
  };

  return (
    <Container maxWidth="sm">
    <Box 
      mt={2}
      style={{ 
        backgroundImage: `url(${SignUpImage})`, 
        backgroundSize: 'cover', 
        backgroundPosition: 'center', 
        padding: '60px 20px', 
        borderRadius: '8px', 
        height: '250px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '20px'
      }}
    />
      <form onSubmit={handleSignUp}>
        <TextField
          label="Email"
          type="email"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          variant="outlined"
          style={{ marginBottom: '20px' }}
        />
        <TextField
          label="Password"
          type="password"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          variant="outlined"
          style={{ marginBottom: '20px' }}
        />
        <Button type="submit" variant="contained" color="primary" fullWidth>
          Sign Up
        </Button>
      </form>
    </Container>
  );
};

export default SignUp;
