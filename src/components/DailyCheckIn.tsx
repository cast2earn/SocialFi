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

const FidDisplay = styled.div`
  font-size: 12px;
  color: #4CAF50;
  margin: 15px 0;
  text-shadow: 0 0 5px rgba(76, 175, 80, 0.3);
  animation: ${fadeIn} 0.5s ease-out;
  padding: 8px;
  background-color: rgba(76, 175, 80, 0.1);
  border-radius: 4px;
  display: inline-block;
`;

const UserProfile = styled.div`
  margin: 20px 0;
  padding: 15px;
  border-radius: 8px;
  background-color: #f0f8ff;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const UserAvatar = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin-bottom: 10px;
  object-fit: cover;
`;

const UserInfo = styled.div`
  margin-top: 10px;
  font-size: 14px;
`;

const DailyCheckIn = () => {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const { isConnected, address } = useAccount();
  const { connect, connectors } = useConnect();
  const [userData, setUserData] = useState<{
    fid?: string;
    username?: string;
    displayName?: string;
    avatar?: string;
  }>({});
  const [userFid, setUserFid] = useState<string | null>(null);

  useEffect(() => {
    const initializeFrame = async () => {
      try {
        // Initialize Frame
        await sdk.actions.ready();
        
        // Get FID from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const fid = urlParams.get('fid');
        if (fid) {
          setUserFid(fid);
          console.log('User FID:', fid);
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

  useEffect(() => {
    if (isConnected && address) {
      // Get user data from Farcaster API
      const getUserData = async () => {
        try {
          // Get the connected account
          const provider = sdk.wallet.ethProvider;
          if (provider) {
            const accounts = await provider.request({ method: 'eth_accounts' });
            if (accounts && accounts[0]) {
              // Get user data from Farcaster API
              const response = await fetch(`https://api.farcaster.xyz/v2/user-by-address/${accounts[0]}`);
              if (response.ok) {
                const data = await response.json();
                if (data.result && data.result.user) {
                  const user = data.result.user;
                  setUserData({
                    fid: user.fid.toString(),
                    username: user.username,
                    displayName: user.display_name,
                    avatar: user.pfp_url
                  });
                }
              } else {
                console.error('Failed to fetch user data:', await response.text());
              }
            }
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      };
      getUserData();
    }
  }, [isConnected, address]);

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
      
      console.log('Check-in successful');
    } catch (error) {
      console.error('Check-in failed:', error);
    }
  };

  return (
    <Container>
      <Title>Daily Check-In</Title>
      <Status>
        <p>{isConnected ? 'Connected to wallet' : 'Not connected to wallet'}</p>
        {userFid && (
          <FidDisplay>FID: {userFid}</FidDisplay>
        )}
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
      {isConnected && userData.fid ? (
        <UserProfile>
          {userData.avatar && (
            <UserAvatar src={userData.avatar} alt="User avatar" />
          )}
          <UserInfo>
            <div>FID: {userData.fid}</div>
            <div>Username: {userData.username}</div>
            {userData.displayName && (
              <div>Display Name: {userData.displayName}</div>
            )}
            <div>Address: {address}</div>
          </UserInfo>
        </UserProfile>
      ) : null}
    </Container>
  );
};

export default DailyCheckIn; 