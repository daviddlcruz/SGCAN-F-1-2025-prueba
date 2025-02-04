import { useState } from "react";
import api from "../services/api";
import { useAuthStore } from "../store/auth";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, Typography, TextField, Button, Box, Link } from "@mui/material";
import { Link as RouterLink } from 'react-router-dom';

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const login = useAuthStore((state) => state.login);
    const navigate = useNavigate();
  
    const handleLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        const { data } = await api.post("/login", { email, password });
        login(data.token);
        navigate("/dashboard");
      } catch (error) {
        console.error("Login error", error);
      }
    };
  
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Card sx={{ maxWidth: 400, p: 3, boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h5" align="center" gutterBottom>
              Login
            </Typography>

            <form onSubmit={handleLogin}>
              <TextField
                fullWidth
                label="Email"
                variant="outlined"
                margin="normal"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <TextField
                fullWidth
                label="Password"
                variant="outlined"
                margin="normal"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <Button 
                type="submit" 
                variant="contained" 
                color="primary" 
                fullWidth 
                sx={{ mt: 2 }}
              >
                Login
              </Button>
            </form>
          </CardContent>
          <Link component={RouterLink} to="/register" color="secondary">Registrar</Link>
        </Card>
      </Box>
  );
};

export default LoginPage;