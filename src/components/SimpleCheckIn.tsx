import { useEffect } from 'react';
import styled from 'styled-components';
import { sdk } from '@farcaster/frame-sdk';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  background: #87CEEB;
  color: #000000;
`;

const Title = styled.h1`
  font-size: 24px;
  margin-bottom: 20px;
  text-align: center;
  color: #000000;
`;

const SimpleCheckIn = () => {
  useEffect(() => {
    const initFrame = async () => {
      try {
        console.log('Starting frame initialization...');
        await sdk.actions.ready();
        console.log('Frame initialized!');
      } catch (error) {
        console.error('Frame initialization failed:', error);
      }
    };

    initFrame();
  }, []);

  return (
    <Container>
      <Title>Daily Check-In</Title>
    </Container>
  );
};

export default SimpleCheckIn; 