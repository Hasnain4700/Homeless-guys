import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
} from '@mui/material';
import { auth, database } from '../firebase';
import { ref, onValue } from 'firebase/database';

interface UserProfile {
  fullName: string;
  occupation: string;
  monthlyContribution: number;
  phoneNumber: string;
  totalDonations: number;
  donationsCount: number;
  joinedAt: number;
}

interface DonationHistory {
  id: string;
  amount: number;
  recipientName: string;
  timestamp: number;
}

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [donations, setDonations] = useState<DonationHistory[]>([]);
  const [achievements, setAchievements] = useState<string[]>([]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      navigate('/login');
      return;
    }

    // Fetch user profile
    const profileRef = ref(database, `shadows/${user.uid}`);
    onValue(profileRef, (snapshot) => {
      if (snapshot.exists()) {
        setProfile(snapshot.val());
        calculateAchievements(snapshot.val());
      }
    });

    // Fetch donation history
    const donationsRef = ref(database, `donations/${user.uid}`);
    onValue(donationsRef, (snapshot) => {
      if (snapshot.exists()) {
        const donationsList = Object.entries(snapshot.val()).map(([id, data]: [string, any]) => ({
          id,
          ...data,
        }));
        setDonations(donationsList);
      }
    });
  }, [navigate]);

  const calculateAchievements = (profile: UserProfile) => {
    const newAchievements = [];
    
    if (profile.donationsCount >= 1) {
      newAchievements.push('First Donation Completed');
    }
    if (profile.donationsCount >= 5) {
      newAchievements.push('Regular Donor');
    }
    if (profile.donationsCount >= 10) {
      newAchievements.push('Dedicated Shadow');
    }
    if (profile.totalDonations >= 1000) {
      newAchievements.push('Generous Contributor');
    }
    if (profile.totalDonations >= 5000) {
      newAchievements.push('Elite Shadow');
    }

    setAchievements(newAchievements);
  };

  if (!profile) {
    return null;
  }

  return (
    <Container>
      <Grid container spacing={3} sx={{ mt: 4 }}>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Profile Information
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Name
              </Typography>
              <Typography variant="body1">{profile.fullName}</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Occupation
              </Typography>
              <Typography variant="body1">{profile.occupation}</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Monthly Contribution
              </Typography>
              <Typography variant="body1">
                ${profile.monthlyContribution}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Member Since
              </Typography>
              <Typography variant="body1">
                {new Date(profile.joinedAt).toLocaleDateString()}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              Achievements
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {achievements.map((achievement) => (
                <Chip
                  key={achievement}
                  label={achievement}
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>
          </Paper>

          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Donation History
            </Typography>
            <Divider sx={{ my: 2 }} />
            <List>
              {donations.map((donation) => (
                <ListItem key={donation.id} divider>
                  <ListItemText
                    primary={`$${donation.amount} to ${donation.recipientName}`}
                    secondary={new Date(donation.timestamp).toLocaleDateString()}
                  />
                </ListItem>
              ))}
              {donations.length === 0 && (
                <ListItem>
                  <ListItemText
                    primary="No donations yet"
                    secondary="Start helping others by making your first donation"
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Profile; 