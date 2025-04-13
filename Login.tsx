import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Checkbox,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [oath, setOath] = useState(false);
  const [oathDialogOpen, setOathDialogOpen] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oath) {
      setOathDialogOpen(true);
      return;
    }

    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate('/');
    } catch (error) {
      console.error('Authentication error:', error);
      alert('Authentication failed. Please try again.');
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={6} sx={{ mt: 8, p: 4 }}>
        <Typography component="h1" variant="h5" align="center">
          {isRegistering ? 'Register' : 'Login'} to Shadow Creed
        </Typography>
        <Box component="form" onSubmit={handleAuth} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Email Address"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <FormControlLabel
            control={
              <Checkbox
                value="oath"
                color="primary"
                checked={oath}
                onChange={(e) => setOath(e.target.checked)}
              />
            }
            label="I solemnly swear that I will be honest and truthful in all my dealings on this platform"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            {isRegistering ? 'Register' : 'Sign In'}
          </Button>
          <Button
            fullWidth
            variant="text"
            onClick={() => setIsRegistering(!isRegistering)}
          >
            {isRegistering
              ? 'Already have an account? Sign in'
              : "Don't have an account? Register"}
          </Button>
        </Box>
      </Paper>

      <Dialog open={oathDialogOpen} onClose={() => setOathDialogOpen(false)}>
        <DialogTitle>Oath Required</DialogTitle>
        <DialogContent>
          <Typography>
            Please accept the oath to proceed. We require all users to commit to
            honesty and truthfulness in their dealings on this platform.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOathDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Login; 