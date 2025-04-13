import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container } from '@mui/material';

// Pages
import Login from './pages/Login';
import Home from './pages/Home';
import DonationRequest from './pages/DonationRequest';
import BecomeShadow from './pages/BecomeShadow';
import AdminPanel from './pages/AdminPanel';
import Profile from './pages/Profile';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Container maxWidth="lg">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/donation-request" element={<DonationRequest />} />
            <Route path="/become-shadow" element={<BecomeShadow />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </Container>
      </Router>
    </ThemeProvider>
  );
}

export default App; 