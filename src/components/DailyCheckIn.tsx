import { useState, useEffect } from 'react';
import { useAccount, useConnect } from 'wagmi';
import { sdk } from '@farcaster/frame-sdk';
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

  useEffect(() => {
    // Call ready when component is mounted
    sdk.actions.ready();

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
      ) : (
        <Status>
          <p>{isConnected ? 'Connected to wallet' : 'Not connected to wallet'}</p>
        </Status>
      )}
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