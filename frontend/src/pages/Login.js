import React, { useState } from 'react';
import { Container, TextField, Button, Box } from '@mui/material';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useNavigate } from 'react-router-dom';
import LoginImage from '../assets/images/signin.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/simulator');
    } catch (error) {
      console.error("Error logging in:", error);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box 
        mt={2}
        style={{ 
          backgroundImage: `url(${LoginImage})`, 
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
      <form onSubmit={handleLogin}>
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
          Login
        </Button>
      </form>
    </Container>
  );
};

export default Login;
