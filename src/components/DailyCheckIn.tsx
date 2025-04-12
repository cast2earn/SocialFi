import { useState, useEffect } from 'react';
import { useAccount, useConnect } from 'wagmi';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
`;

const Button = styled.button`
  background-color: #4CAF50;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  margin: 10px 0;

  &:hover {
    background-color: #45a049;
  }

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const Status = styled.div`
  margin: 20px 0;
  padding: 10px;
  border-radius: 5px;
  background-color: #f8f9fa;
`;

const DailyCheckIn = () => {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const { isConnected } = useAccount();
  const { connect, connectors } = useConnect();

  useEffect(() => {
    // Check if user has already checked in today
    const lastCheckIn = localStorage.getItem('lastCheckIn');
    if (lastCheckIn) {
      const lastCheckInDate = new Date(lastCheckIn);
      const today = new Date();
      if (lastCheckInDate.toDateString() === today.toDateString()) {
        setIsCheckedIn(true);
        setCheckInTime(lastCheckIn);
      }
    }
  }, []);

  const handleCheckIn = async () => {
    if (!isConnected) {
      connect({ connector: connectors[0] });
      return;
    }

    try {
      // For now, we'll just simulate a successful check-in
      // In a real implementation, you would use the Farcaster SDK to authenticate
      const now = new Date().toISOString();
      localStorage.setItem('lastCheckIn', now);
      setIsCheckedIn(true);
      setCheckInTime(now);
      
      console.log('Check-in successful');
    } catch (error) {
      console.error('Check-in failed:', error);
    }
  };

  return (
    <Container>
      <h1>Daily Check-In</h1>
      <Status>
        <p>{isConnected ? 'Connected to wallet' : 'Not connected to wallet'}</p>
      </Status>
      <Button 
        onClick={handleCheckIn} 
        disabled={isCheckedIn}
      >
        {isCheckedIn ? 'Already Checked In Today' : 'Check In'}
      </Button>
      {checkInTime && (
        <Status>
          <p>Last check-in: {new Date(checkInTime).toLocaleString()}</p>
        </Status>
      )}
    </Container>
  );
};

export default DailyCheckIn; 