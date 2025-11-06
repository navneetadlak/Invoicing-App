import React, { useState } from "react";
import { TextField, Button, Container, Typography, Box } from "@mui/material";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
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
        <Container maxWidth="xs" sx={{ mt: 8 }}>
            <Typography variant="h5" align="center">Sign in</Typography>
            <Box component="form" onSubmit={submit} sx={{ mt: 2 }}>
                <TextField label="Email" fullWidth margin="normal" value={email} onChange={e => setEmail(e.target.value)} />
                <TextField label="Password" type="password" fullWidth margin="normal" value={password} onChange={e => setPassword(e.target.value)} />
                <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }} disabled={loading}>
                    {loading ? "Signing in..." : "Sign in"}
                </Button>
            </Box>
        </Container>
    );
}
