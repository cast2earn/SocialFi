import { useState, useEffect } from 'react';
import { useAccount, useConnect } from 'wagmi';
import { sdk } from '@farcaster/frame-sdk';
import styled, { keyframes } from 'styled-components';
import { supabase } from '../config/supabase';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  background: #000000;
  color: #ffffff;
  animation: ${fadeIn} 0.5s ease-in;
`;

const Title = styled.h1`
  font-size: 24px;
  margin-bottom: 20px;
  text-align: center;
`;

const Button = styled.button`
  background: #3498db;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 10px 0;
  width: 100%;
  max-width: 300px;

  &:hover {
    background: #2980b9;
  }

  &:disabled {
    background: #95a5a6;
    cursor: not-allowed;
  }
`;

const Status = styled.div`
  margin: 10px 0;
  text-align: center;
  font-size: 14px;
  color: #95a5a6;
`;

const UserProfile = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 20px 0;
  padding: 10px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  width: 100%;
  max-width: 300px;
`;

const UserAvatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 14px;
`;

const PointsDisplay = styled.div<{ $isIncreasing: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 20px 0;
  position: relative;

  .points-label {
    font-size: 14px;
    color: #95a5a6;
  }

  .points-value {
    font-size: 32px;
    font-weight: bold;
    color: ${props => props.$isIncreasing ? '#2ecc71' : '#ffffff'};
    transition: color 0.3s ease;
  }

  .points-increase {
    position: absolute;
    top: -20px;
    right: 0;
    color: #2ecc71;
    font-weight: bold;
    animation: ${fadeIn} 0.3s ease-in;
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
  const [points, setPoints] = useState<number>(0);
  const [isPointsIncreasing, setIsPointsIncreasing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fungsi untuk mengambil data point dari database
  const fetchUserPoints = async (fid: string) => {
    try {
      const { data, error } = await supabase
        .from('user_points')
        .select('points, last_check_in')
        .eq('fid', fid)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setPoints(data.points);
        if (data.last_check_in) {
          const lastCheckInDate = new Date(data.last_check_in);
          const today = new Date();
          if (lastCheckInDate.toDateString() === today.toDateString()) {
            setIsCheckedIn(true);
            setCheckInTime(data.last_check_in);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching user points:', error);
      setError('Failed to fetch user points');
    }
  };

  // Fungsi untuk menyimpan atau mengupdate profil pengguna
  const saveUserProfile = async (fid: string, profile: { username: string, display_name?: string, avatar_url?: string }) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          fid,
          username: profile.username,
          display_name: profile.display_name,
          avatar_url: profile.avatar_url,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving user profile:', error);
      setError('Failed to save user profile');
    }
  };

  // Fungsi untuk mengupdate point pengguna
  const updateUserPoints = async (fid: string, newPoints: number, checkInTime: string) => {
    try {
      const { error } = await supabase
        .from('user_points')
        .upsert({
          fid,
          points: newPoints,
          last_check_in: checkInTime,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating user points:', error);
      setError('Failed to update points');
    }
  };

  useEffect(() => {
    const initializeFrame = async () => {
      console.log('Starting frame initialization...');
      try {
        setIsLoading(true);
        setError(null);
        
        // Initialize Farcaster Frame SDK
        console.log('Calling sdk.actions.ready()...');
        await sdk.actions.ready();
        console.log('Frame SDK initialized successfully');
        
        // Get URL parameters first
        const urlParams = new URLSearchParams(window.location.search);
        const fid = urlParams.get('fid');
        const username = urlParams.get('username');
        const displayName = urlParams.get('displayName');
        const pfp = urlParams.get('pfp');
        
        console.log('URL Parameters:', { fid, username, displayName, pfp });
        
        if (fid) {
          console.log('Setting user data with FID:', fid);
          setUserFid(fid);
          setUserData({
            username: username || undefined,
            displayName: displayName || undefined,
            avatar: pfp || undefined
          });

          // Fetch user points from database
          console.log('Fetching user points...');
          await fetchUserPoints(fid);

          // Save/update user profile
          if (username) {
            console.log('Saving user profile...');
            await saveUserProfile(fid, {
              username,
              display_name: displayName || undefined,
              avatar_url: pfp || undefined
            });
          }
        } else {
          console.log('No FID found in URL parameters');
          setError('No FID found in URL parameters');
        }
      } catch (error) {
        console.error('Error initializing frame:', error);
        setError('Failed to initialize frame');
      } finally {
        setIsLoading(false);
        console.log('Frame initialization completed');
      }
    };

    initializeFrame();
  }, []);

  const handleCheckIn = async () => {
    if (!isConnected) {
      connect({ connector: connectors[0] });
      return;
    }

    if (!userFid) {
      console.error('No user FID found');
      setError('No user FID found');
      return;
    }

    try {
      setError(null);
      const now = new Date().toISOString();
      setIsCheckedIn(true);
      setCheckInTime(now);
      
      // Add points with animation
      setIsPointsIncreasing(true);
      const newPoints = points + 10;
      setPoints(newPoints);
      
      // Update points in database
      await updateUserPoints(userFid, newPoints, now);
      
      // Reset animation after 500ms
      setTimeout(() => {
        setIsPointsIncreasing(false);
      }, 500);
      
    } catch (error) {
      console.error('Check-in failed:', error);
      setError('Check-in failed');
    }
  };

  if (isLoading) {
    console.log('Rendering loading state...');
    return (
      <Container>
        <Title>Loading...</Title>
      </Container>
    );
  }

  if (error) {
    console.log('Rendering error state:', error);
    return (
      <Container>
        <Title>Error</Title>
        <Status>
          <p>{error}</p>
        </Status>
        <Button onClick={() => window.location.reload()}>
          Retry
        </Button>
      </Container>
    );
  }

  console.log('Rendering main component with data:', {
    userFid,
    userData,
    points,
    isCheckedIn,
    checkInTime
  });

  return (
    <Container>
      <Title>Daily Check-In</Title>
      
      <PointsDisplay $isIncreasing={isPointsIncreasing}>
        <div className="points-label">TOTAL POINTS</div>
        <div className="points-value">{points}</div>
        {isPointsIncreasing && (
          <div className="points-increase">+10</div>
        )}
      </PointsDisplay>

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
        {isCheckedIn ? 'Already Checked In Today' : 'Check In (+10 points)'}
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