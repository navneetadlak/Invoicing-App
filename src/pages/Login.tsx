import React, { useState } from "react";
import {
    TextField,
    Button,
    Container,
    Typography,
    Box,
    Card,
    CardContent,
    InputAdornment,
    IconButton,
    Link,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useAuth } from "../hooks/useAuth";
import { useNavigate, Link as RouterLink } from "react-router-dom";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const { login, loading } = useAuth();
    const navigate = useNavigate();

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login(email, password);
            navigate("/invoices");
        } catch (err: any) {
            alert(err?.response?.data?.message || err?.message || "Login failed");
        }
    };

    return (
        <Container maxWidth="sm" sx={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center" }}>
            <Card sx={{ width: "100%", maxWidth: 680, boxShadow: 3, borderRadius: 2 }}>
                <CardContent sx={{ p: { xs: 3, md: 6 } }}>
                    {/* Top header */}
                    <Box sx={{ textAlign: "center", mb: 3 }}>
                        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
                            InvoiceApp
                        </Typography>
                        <Typography variant="h6" sx={{ mt: 1, fontWeight: 600 }}>
                            Welcome back
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            Log in to your account
                        </Typography>
                    </Box>

                    {/* Form */}
                    <Box component="form" onSubmit={submit} noValidate>
                        <TextField
                            label="Email"
                            type="email"
                            fullWidth
                            margin="normal"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
                        />

                        <TextField
                            label="Password"
                            fullWidth
                            margin="normal"
                            required
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                            onClick={() => setShowPassword((s) => !s)}
                                            edge="end"
                                            size="large"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            sx={{ mt: 3, py: 1.2 }}
                            disabled={loading}
                        >
                            {loading ? "Signing in..." : "Sign in"}
                        </Button>

                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                                New here?
                            </Typography>
                            <Link component={RouterLink} to="/signup" underline="none">
                                <Button variant="text">Create account</Button>
                            </Link>
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        </Container>
    );
}