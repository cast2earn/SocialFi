import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { sdk } from '@farcaster/frame-sdk';
import { useAccount, useConnect } from 'wagmi';
import { supabase } from '../config/supabase';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  background: #87CEEB;
  color: #000000;
  font-family: 'Press Start 2P', monospace;
  image-rendering: pixelated;
`;

const Title = styled.h1`
  font-size: 24px;
  margin-bottom: 20px;
  text-align: center;
  text-shadow: 2px 2px 0px #ffffff;
  letter-spacing: 2px;
`;

const Button = styled.button`
  background: #4169E1;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  margin: 10px 0;
  width: 100%;
  max-width: 300px;
  font-family: 'Press Start 2P', monospace;
  image-rendering: pixelated;
  border: 4px solid #ffffff;
  box-shadow: 4px 4px 0px #000000;
  transition: all 0.1s ease;

  &:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #000000;
  }

  &:active {
    transform: translate(2px, 2px);
    box-shadow: 2px 2px 0px #000000;
  }

  &:disabled {
    background: #cccccc;
    cursor: not-allowed;
    transform: none;
    box-shadow: 4px 4px 0px #000000;
  }
`;

const UserProfile = styled.div`
  background: rgba(255, 255, 255, 0.9);
  padding: 20px;
  border-radius: 4px;
  margin: 20px 0;
  width: 100%;
  max-width: 300px;
  border: 4px solid #000000;
  box-shadow: 4px 4px 0px #000000;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Avatar = styled.img`
  width: 64px;
  height: 64px;
  border-radius: 4px;
  border: 2px solid #000000;
  image-rendering: pixelated;
`;

const UserInfo = styled.div`
  font-size: 12px;
  line-height: 1.5;
  word-break: break-word;
`;

const PointsDisplay = styled.div`
  font-size: 24px;
  margin: 20px 0;
  background: #FFD700;
  padding: 15px;
  border-radius: 4px;
  border: 4px solid #000000;
  box-shadow: 4px 4px 0px #000000;
  text-align: center;
  width: 100%;
  max-width: 300px;

  .points-label {
    font-size: 12px;
    margin-bottom: 5px;
  }
`;

const SimpleCheckIn = () => {
  const [userFid, setUserFid] = useState<string | null>(null);
  const [userData, setUserData] = useState<{
    username?: string;
    displayName?: string;
    avatar?: string;
  }>({});
  const [points, setPoints] = useState(0);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const { isConnected } = useAccount();
  const { connect, connectors } = useConnect();

  useEffect(() => {
    const initFrame = async () => {
      try {
        console.log('Initializing frame...');
        await sdk.actions.ready();
        console.log('Frame initialized successfully');

        // Get URL parameters
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

          // Fetch user points
          const { data: pointsData } = await supabase
            .from('user_points')
            .select('points')
            .eq('fid', fid)
            .single();

          if (pointsData) {
            setPoints(pointsData.points);
          }
        }
      } catch (error) {
        console.error('Failed to initialize frame:', error);
      }
    };

    initFrame();
  }, []);

  const handleConnect = () => {
    if (!isConnected && connectors[0]) {
      connect({ connector: connectors[0] });
    }
  };

  const handleCheckIn = async () => {
    if (!userFid || !isConnected || isCheckedIn) return;

    try {
      // Add 10 points
      const newPoints = points + 10;
      setPoints(newPoints);
      setIsCheckedIn(true);

      // Update points in database
      const { error } = await supabase
        .from('user_points')
        .upsert({
          fid: userFid,
          points: newPoints,
          last_check_in: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Failed to check in:', error);
      // Revert points if update fails
      setPoints(points);
      setIsCheckedIn(false);
    }
  };

  return (
    <Container>
      <Title>Daily Check-In</Title>

      <PointsDisplay>
        <div className="points-label">TOTAL POINTS</div>
        <div>{points}</div>
      </PointsDisplay>

      {userFid && (
        <UserProfile>
          {userData.avatar && (
            <Avatar src={userData.avatar} alt="Profile" />
          )}
          <UserInfo>
            <div>FID: {userFid}</div>
            {userData.username && <div>@{userData.username}</div>}
            {userData.displayName && <div>{userData.displayName}</div>}
          </UserInfo>
        </UserProfile>
      )}

      <Button onClick={handleConnect}>
        {isConnected ? 'Wallet Connected' : 'Connect Wallet'}
      </Button>

      <Button 
        onClick={handleCheckIn} 
        disabled={!isConnected || !userFid || isCheckedIn}
      >
        {isCheckedIn ? 'Already Checked In' : 'Check In (+10 points)'}
      </Button>
    </Container>
  );
};

export default SimpleCheckIn; 