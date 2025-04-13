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
import { ref, push } from 'firebase/database';

const DonationRequest = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    reason: '',
    accountNumber: '',
    address: '',
    amount: '',
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
      const donationsRef = ref(database, 'donations');
      await push(donationsRef, {
        ...formData,
        userId: auth.currentUser?.uid,
        status: 'pending',
        timestamp: Date.now(),
      });
      alert('Your donation request has been submitted for review.');
      navigate('/');
    } catch (error) {
      console.error('Error submitting request:', error);
      alert('Failed to submit request. Please try again.');
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Paper elevation={6} sx={{ mt: 8, p: 4 }}>
        <Typography component="h1" variant="h5" align="center" gutterBottom>
          Create Donation Request
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Reason for Request"
            name="reason"
            multiline
            rows={4}
            value={formData.reason}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Account Number"
            name="accountNumber"
            value={formData.accountNumber}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Address"
            name="address"
            value={formData.address}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Amount Needed"
            name="amount"
            type="number"
            value={formData.amount}
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
            label="I solemnly swear that all the information provided is true and the requested amount is genuinely needed"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Submit Request
          </Button>
        </Box>
      </Paper>

      <Dialog open={oathDialogOpen} onClose={() => setOathDialogOpen(false)}>
        <DialogTitle>Oath Required</DialogTitle>
        <DialogContent>
          <Typography>
            Please accept the oath confirming that all provided information is true
            and the requested amount is genuinely needed.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOathDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DonationRequest; 