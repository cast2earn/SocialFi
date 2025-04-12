import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  background: #000000;
  color: #ffffff;
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
  margin: 10px 0;
  width: 100%;
  max-width: 300px;
`;

const SimpleCheckIn = () => {
  return (
    <Container>
      <Title>Daily Check-In</Title>
      <Button>Check In</Button>
    </Container>
  );
};

export default SimpleCheckIn; 