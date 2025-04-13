import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Box,
  Checkbox,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { auth, database } from '../firebase';
import { ref, set } from 'firebase/database';

const BecomeShadow = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    occupation: '',
    monthlyContribution: '',
    phoneNumber: '',
  });
  const [oath, setOath] = useState(false);
  const [oathDialogOpen, setOathDialogOpen] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oath) {
      setOathDialogOpen(true);
      return;
    }

    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const shadowRef = ref(database, `shadows/${userId}`);
      await set(shadowRef, {
        ...formData,
        userId,
        joinedAt: Date.now(),
        totalDonations: 0,
        donationsCount: 0,
      });

      alert('Congratulations! You are now a Shadow donor.');
      navigate('/profile');
    } catch (error) {
      console.error('Error becoming a shadow:', error);
      alert('Failed to register as a Shadow. Please try again.');
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Paper elevation={6} sx={{ mt: 8, p: 4 }}>
        <Typography component="h1" variant="h5" align="center" gutterBottom>
          Become a Shadow Donor
        </Typography>
        <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 3 }}>
          Join our community of generous donors and help make a difference in people's lives
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Full Name"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Occupation"
            name="occupation"
            value={formData.occupation}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Monthly Contribution Capacity"
            name="monthlyContribution"
            type="number"
            value={formData.monthlyContribution}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Phone Number"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
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
            label="I solemnly swear to fulfill my commitments as a Shadow donor and help those in need with sincerity"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Become a Shadow
          </Button>
        </Box>
      </Paper>

      <Dialog open={oathDialogOpen} onClose={() => setOathDialogOpen(false)}>
        <DialogTitle>Oath Required</DialogTitle>
        <DialogContent>
          <Typography>
            Please accept the oath confirming your commitment to being a responsible
            Shadow donor and helping those in need with sincerity.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOathDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BecomeShadow; 