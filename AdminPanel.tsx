import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Box,
} from '@mui/material';
import { auth, database } from '../firebase';
import { ref, onValue, update } from 'firebase/database';

interface DonationRequest {
  id: string;
  name: string;
  reason: string;
  accountNumber: string;
  address: string;
  amount: number;
  status: string;
  timestamp: number;
  userId: string;
}

const AdminPanel = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<DonationRequest[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigate('/login');
        return;
      }

      const adminRef = ref(database, `admins/${user.uid}`);
      onValue(adminRef, (snapshot) => {
        if (!snapshot.exists()) {
          navigate('/');
        } else {
          setIsAdmin(true);
        }
      });
    };

    checkAdmin();
  }, [navigate]);

  useEffect(() => {
    if (!isAdmin) return;

    const requestsRef = ref(database, 'donations');
    const unsubscribe = onValue(requestsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const requestsList = Object.entries(data)
          .map(([id, details]: [string, any]) => ({
            id,
            ...details,
          }))
          .filter((req) => req.status === 'pending')
          .sort((a, b) => b.timestamp - a.timestamp);
        setRequests(requestsList);
      }
    });

    return () => unsubscribe();
  }, [isAdmin]);

  const handleRequestAction = async (requestId: string, action: 'approve' | 'reject') => {
    try {
      const requestRef = ref(database, `donations/${requestId}`);
      await update(requestRef, {
        status: action === 'approve' ? 'approved' : 'rejected',
        reviewedAt: Date.now(),
        reviewedBy: auth.currentUser?.uid,
      });
    } catch (error) {
      console.error('Error updating request:', error);
      alert('Failed to update request status.');
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 4 }}>
        Admin Panel - Donation Requests
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Account Number</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>{request.name}</TableCell>
                <TableCell>{request.reason}</TableCell>
                <TableCell>${request.amount}</TableCell>
                <TableCell>{request.accountNumber}</TableCell>
                <TableCell>{request.address}</TableCell>
                <TableCell>
                  {new Date(request.timestamp).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      onClick={() => handleRequestAction(request.id, 'approve')}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      size="small"
                      onClick={() => handleRequestAction(request.id, 'reject')}
                    >
                      Reject
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default AdminPanel; 