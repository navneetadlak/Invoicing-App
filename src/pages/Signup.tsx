import React, { useState } from "react";
import { Container, TextField, Button, Typography, Box } from "@mui/material";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [companyName, setCompanyName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signup, loading } = useAuth();
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signup({ companyName, firstName, email, password });
      navigate("/invoices");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Signup failed");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Typography variant="h5">Register Company & First User</Typography>
      <Box component="form" onSubmit={submit} sx={{ mt: 2 }}>
        <TextField label="Company name" fullWidth margin="normal" value={companyName} onChange={e => setCompanyName(e.target.value)} />
        <TextField label="First name" fullWidth margin="normal" value={firstName} onChange={e => setFirstName(e.target.value)} />
        <TextField label="Email" fullWidth margin="normal" value={email} onChange={e => setEmail(e.target.value)} />
        <TextField label="Password" type="password" fullWidth margin="normal" value={password} onChange={e => setPassword(e.target.value)} />
        <Button type="submit" variant="contained" disabled={loading} sx={{ mt: 2 }}>{loading ? "Registering..." : "Register"}</Button>
      </Box>
    </Container>
  );
}
