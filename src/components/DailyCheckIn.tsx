import { useState, useEffect } from 'react';
import { useAccount, useConnect } from 'wagmi';
import { sdk } from '@farcaster/frame-sdk';
import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

const Container = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
  background-color: #1a1b1f;
  color: white;
  min-height: 100vh;
  animation: ${fadeIn} 0.5s ease-out;
  line-height: 1.6;
`;

const Button = styled.button`
  background-color: #4CAF50;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  margin: 20px 0;
  transition: all 0.3s ease;
  font-family: 'Press Start 2P', cursive;
  animation: ${pulse} 2s infinite;
  text-transform: uppercase;
  box-shadow: 0 4px 0 #45a049;

  &:hover {
    background-color: #45a049;
    transform: translateY(-2px);
    box-shadow: 0 6px 0 #388E3C;
  }

  &:active {
    transform: translateY(2px);
    box-shadow: 0 2px 0 #388E3C;
  }

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
    transform: none;
    animation: none;
    box-shadow: none;
  }
`;

const Status = styled.div`
  margin: 20px 0;
  padding: 15px;
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 10px;
  animation: ${fadeIn} 0.5s ease-out;
  backdrop-filter: blur(5px);
  border: 2px solid rgba(255, 255, 255, 0.1);
  line-height: 1.8;
`;

const Title = styled.h1`
  font-size: 24px;
  margin-bottom: 30px;
  color: white;
  text-shadow: 0 0 10px rgba(76, 175, 80, 0.5);
  animation: ${fadeIn} 0.5s ease-out;
  letter-spacing: 2px;
  line-height: 1.4;
  
  @media (max-width: 768px) {
    font-size: 20px;
  }
`;

const UserProfile = styled.div`
  margin: 20px 0;
  padding: 15px;
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: ${fadeIn} 0.5s ease-out;
  border: 2px solid rgba(76, 175, 80, 0.3);
  backdrop-filter: blur(5px);
`;

const UserAvatar = styled.img`
  width: 64px;
  height: 64px;
  border-radius: 4px;
  margin-bottom: 10px;
  object-fit: cover;
  border: 2px solid #4CAF50;
  image-rendering: pixelated;
`;

const UserInfo = styled.div`
  margin-top: 10px;
  font-size: 10px;
  color: white;
  text-align: center;
  font-family: 'Press Start 2P', cursive;
  
  div {
    margin: 8px 0;
    padding: 4px 8px;
    background-color: rgba(76, 175, 80, 0.1);
    border-radius: 4px;
    display: inline-block;
  }
`;

const DailyCheckIn = () => {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const { isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const [userFid, setUserFid] = useState<string | null>(null);
  const [userData, setUserData] = useState<{
    username?: string;
    displayName?: string;
    avatar?: string;
  }>({});

  useEffect(() => {
    const initializeFrame = async () => {
      try {
        // Initialize Frame
        await sdk.actions.ready();
        
        // Get user data from frame context
        const provider = sdk.wallet.ethProvider;
        if (provider) {
          const accounts = await provider.request({ method: 'eth_accounts' });
          if (accounts && accounts[0]) {
            // Get frame data from URL parameters
            const urlParams = new URLSearchParams(window.location.search);
            const fid = urlParams.get('fid');
            const username = urlParams.get('username');
            const displayName = urlParams.get('displayName');
            const pfp = urlParams.get('pfp');
            
            if (fid) {
              setUserFid(fid);
              setUserData({
                username: username || undefined,
                displayName: displayName || undefined,
                avatar: pfp || undefined
              });
              console.log('Frame data:', { fid, username, displayName, pfp });
            }
          }
        }
      } catch (error) {
        console.error('Error initializing frame:', error);
      }
    };

    initializeFrame();

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
      const now = new Date().toISOString();
      localStorage.setItem('lastCheckIn', now);
      setIsCheckedIn(true);
      setCheckInTime(now);
      
      // Log the check-in with user data
      console.log('Check-in successful', {
        fid: userFid,
        username: userData.username,
        timestamp: now
      });
    } catch (error) {
      console.error('Check-in failed:', error);
    }
  };

  return (
    <Container>
      <Title>Daily Check-In</Title>
      {userFid && userData && (
        <UserProfile>
          {userData.avatar && (
            <UserAvatar src={userData.avatar} alt="User avatar" />
          )}
          <UserInfo>
            <div>FID: {userFid}</div>
            {userData.username && (
              <div>@{userData.username}</div>
            )}
            {userData.displayName && (
              <div>{userData.displayName}</div>
            )}
          </UserInfo>
        </UserProfile>
      )}
      <Status>
        <p>
          {userFid 
            ? 'Connected with Farcaster'
            : isConnected 
              ? 'Connected to wallet' 
              : 'Not connected to wallet'
          }
        </p>
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