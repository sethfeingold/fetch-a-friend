import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Alert,
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  Button
} from '@mui/material';

const LoginPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      const response = await axios.post(
        'https://frontend-take-home-service.fetch.com/auth/login',
        { name, email },
        { withCredentials: true }
      );

      // upon successful login, route user to the dog search page!
      navigate('/search');
    } catch (error) {
      console.error('Error during login:', error);
      setErrorMessage('Login failed. Please check your credentials and try again.');
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h3" component="h1" textAlign={'center'} sx={{ my: 4 }}>
        Welcome to Fetch-a-Friend, log in to find the dog of your dreams!
      </Typography>
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ padding: 4, marginTop: 8 }} >
          <Typography variant="h4" component="h2" gutterBottom>
            Login
          </Typography>
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 3 }}
            >
              Sign In
            </Button>
          </Box>
        </Paper>
      </Container>
    </Container>
  );
};

export default LoginPage;
