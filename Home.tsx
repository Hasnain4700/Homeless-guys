import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Box,
  AppBar,
  Toolbar,
} from '@mui/material';
import { auth, database } from '../firebase';
import { ref, onValue } from 'firebase/database';
import { signOut } from 'firebase/auth';

interface DonationRequest {
  id: string;
  name: string;
  reason: string;
  accountNumber: string;
  address: string;
  amount: number;
  status: string;
  timestamp: number;
}

const Home = () => {
  const navigate = useNavigate();
  const [donations, setDonations] = useState<DonationRequest[]>([]);
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate('/login');
      }
      setUser(user);
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const donationsRef = ref(database, 'donations');
    const unsubscribe = onValue(donationsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const donationsList = Object.entries(data).map(([id, details]: [string, any]) => ({
          id,
          ...details,
        }));
        setDonations(donationsList.filter(d => d.status === 'approved'));
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Shadow Creed
          </Typography>
          <Button color="inherit" onClick={() => navigate('/profile')}>
            Profile
          </Button>
          <Button color="inherit" onClick={() => navigate('/donation-request')}>
            Create Request
          </Button>
          <Button color="inherit" onClick={() => navigate('/become-shadow')}>
            Become a Shadow
          </Button>
          {user && (
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Active Donation Requests
        </Typography>
        <Grid container spacing={3}>
          {donations.map((donation) => (
            <Grid item xs={12} sm={6} md={4} key={donation.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {donation.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Reason: {donation.reason}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Amount Needed: ${donation.amount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Location: {donation.address}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" color="primary">
                    Donate Now
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </>
  );
};

export default Home; 