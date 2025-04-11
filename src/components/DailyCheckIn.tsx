import { useState, useEffect } from 'react';
import { sdk } from '@farcaster/frame-sdk';
import styled from 'styled-components';

const Container = styled.div`
  background-color: #e6f3ff;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  font-family: 'Press Start 2P', cursive;
`;

const Title = styled.h1`
  color: #333;
  font-size: 24px;
  text-align: center;
  margin-bottom: 30px;
`;

const CheckInButton = styled.button`
  background-color: #4CAF50;
  color: white;
  padding: 15px 30px;
  border: none;
  border-radius: 8px;
  font-family: 'Press Start 2P', cursive;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: #45a049;
    transform: scale(1.05);
  }

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
    transform: none;
  }
`;

const PointsDisplay = styled.div`
  margin-top: 20px;
  font-size: 18px;
  color: #333;
`;

const DailyCheckIn = () => {
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [points, setPoints] = useState(0);

  useEffect(() => {
    // Load saved data from localStorage
    const savedPoints = localStorage.getItem('points');
    const savedLastCheckIn = localStorage.getItem('lastCheckIn');
    
    if (savedPoints) setPoints(parseInt(savedPoints));

    // Check if user has already checked in today
    const today = new Date().toDateString();
    if (savedLastCheckIn === today) {
      setHasCheckedIn(true);
    }

    // Call ready when component is mounted
    sdk.actions.ready();
  }, []);

  const handleCheckIn = () => {
    const today = new Date().toDateString();
    
    // Add 100 points
    const newPoints = points + 100;
    setPoints(newPoints);
    setHasCheckedIn(true);

    // Save to localStorage
    localStorage.setItem('points', newPoints.toString());
    localStorage.setItem('lastCheckIn', today);
  };

  return (
    <Container>
      <Title>Daily Check-In</Title>
      <CheckInButton 
        onClick={handleCheckIn} 
        disabled={hasCheckedIn}
      >
        {hasCheckedIn ? 'Already Checked In Today' : 'Check In Now'}
      </CheckInButton>
      <PointsDisplay>
        Your Points: {points}
      </PointsDisplay>
    </Container>
  );
};

export default DailyCheckIn; 