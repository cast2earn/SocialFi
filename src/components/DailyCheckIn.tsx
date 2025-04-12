import { useState, useEffect } from 'react';
import { sdk } from '@farcaster/frame-sdk';
import styled from 'styled-components';
import { useAccount, useConnect } from 'wagmi';

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

const ConnectButton = styled(CheckInButton)`
  background-color: #2196F3;
  margin-bottom: 20px;

  &:hover {
    background-color: #1976D2;
  }
`;

const PointsDisplay = styled.div`
  margin-top: 20px;
  font-size: 18px;
  color: #333;
`;

const UserProfile = styled.div`
  margin-bottom: 30px;
  text-align: center;
  font-size: 14px;
  color: #333;
`;

const UserAvatar = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin-bottom: 10px;
`;

const DailyCheckIn = () => {
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [points, setPoints] = useState(0);
  const { isConnected, address } = useAccount();
  const { connect, connectors } = useConnect();
  const [userData, setUserData] = useState<{
    fid?: string;
    username?: string;
    displayName?: string;
    avatar?: string;
  }>({});

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

  useEffect(() => {
    if (isConnected && address) {
      // Get user data from Warpcast
      const getUserData = async () => {
        try {
          // Use the wallet's ethProvider to get user data
          const provider = sdk.wallet.ethProvider;
          if (provider) {
            // Get the connected account
            const accounts = await provider.request({ method: 'eth_accounts' });
            if (accounts && accounts[0]) {
              // For now, we'll use mock data since the actual user data might not be available
              // In a real implementation, you would use the Farcaster API to get user data
              setUserData({
                fid: '12345', // This should come from the Farcaster API
                username: 'user123',
                displayName: 'User Name',
                avatar: 'https://placekitten.com/200/200'
              });
            }
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      };
      getUserData();
    }
  }, [isConnected, address]);

  const handleConnect = () => {
    if (connectors[0]) {
      connect({ connector: connectors[0] });
    }
  };

  const handleCheckIn = () => {
    if (!isConnected) {
      alert('Please connect your wallet first!');
      return;
    }

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
      
      {!isConnected ? (
        <ConnectButton onClick={handleConnect}>
          Connect Wallet
        </ConnectButton>
      ) : (
        <UserProfile>
          {userData.avatar && (
            <UserAvatar src={userData.avatar} alt="User avatar" />
          )}
          <div>FID: {userData.fid}</div>
          <div>Username: {userData.username}</div>
          {userData.displayName && (
            <div>Display Name: {userData.displayName}</div>
          )}
          <div>Address: {address}</div>
        </UserProfile>
      )}

      <CheckInButton 
        onClick={handleCheckIn} 
        disabled={hasCheckedIn || !isConnected}
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