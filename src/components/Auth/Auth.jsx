import React, { useState } from 'react';
import { Container, Button, Box } from '@mui/material';
import Login from './Login';
import SignUp from './Signup';

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);

    return (
        <Container maxWidth="sm">
            <Box mt={5}>
                {isLogin ? <Login /> : <SignUp />}
                <Button
                    onClick={() => setIsLogin(!isLogin)}
                    variant="text"
                    fullWidth
                    sx={{ mt: 2 }}
                >
                    {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Login'}
                </Button>
            </Box>
        </Container>
    );
};

export default Auth;
