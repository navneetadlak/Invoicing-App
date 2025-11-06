import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  Avatar,
} from "@mui/material";
import { Visibility, VisibilityOff, UploadFile } from "@mui/icons-material";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();
  const { signup, loading } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [industry, setIndustry] = useState("");
  const [currencySymbol, setCurrencySymbol] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // file chosen
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    if (f) {
      setLogoFile(f);
      const url = URL.createObjectURL(f);
      setLogoPreview(url);
    } else {
      setLogoFile(null);
      setLogoPreview(null);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName || !email || !password || !companyName || !currencySymbol) {
      alert("Please fill required fields: First name, Email, Password, Company name, Currency symbol.");
      return;
    }

    const payload: Record<string, any> = {
      FirstName: firstName,
      LastName: lastName,
      Email: email,
      Password: password,
      CompanyName: companyName,
      Address: address,
      City: city,
      ZipCode: zipCode,
      Industry: industry,
      CurrencySymbol: currencySymbol,
    };

    if (logoFile) payload.logo = logoFile;

    try {
      await signup(payload);
      navigate("/invoices");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        (err?.response?.data ? JSON.stringify(err.response.data) : err.message) ||
        "Signup failed";
      alert(msg);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 6 }}>
      <Card elevation={2}>
        <CardContent>
          <Typography variant="h4" align="center" gutterBottom>
            Create Your Account
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
            Set up your company and start invoicing in minutes.
          </Typography>

          <Box component="form" onSubmit={submit}>
            <Grid container spacing={3}>
              {/* Left column: User Info */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  User Information
                </Typography>

                <TextField
                  label="First Name*"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Email*"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Password*"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  fullWidth
                  margin="normal"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword((s) => !s)}
                          edge="end"
                          size="small"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <Typography variant="caption" color="text.secondary">
                  Password strength: {password.length >= 8 ? "Good" : "Weak"}
                </Typography>
              </Grid>

              {/* Right column: Company Info */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Company Information
                </Typography>

                <TextField
                  label="Company Name*"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  fullWidth
                  margin="normal"
                />

                <Box sx={{ display: "flex", gap: 2, alignItems: "center", my: 1 }}>
                  <Box>
                    <input
                      id="logo-file"
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleLogoChange}
                    />
                    <label htmlFor="logo-file">
                      <Button variant="outlined" component="span" startIcon={<UploadFile />}>
                        Upload Logo
                      </Button>
                    </label>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Avatar
                      src={logoPreview ?? undefined}
                      sx={{ width: 56, height: 56, bgcolor: logoPreview ? "transparent" : "grey.200" }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {logoFile ? logoFile.name : "No file chosen"}
                    </Typography>
                  </Box>
                </Box>

                <TextField
                  label="Address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  fullWidth
                  margin="normal"
                  multiline
                  minRows={2}
                />
                <Box sx={{ display: "flex", gap: 2 }}>
                  <TextField
                    label="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    fullWidth
                    margin="normal"
                  />
                  <TextField
                    label="Zip Code"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    sx={{ width: 140 }}
                    margin="normal"
                  />
                </Box>

                <TextField
                  label="Industry"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  fullWidth
                  margin="normal"
                />

                <TextField
                  label="Currency Symbol*"
                  value={currencySymbol}
                  onChange={(e) => setCurrencySymbol(e.target.value)}
                  fullWidth
                  margin="normal"
                  placeholder="$, ₹, €, AED"
                />
              </Grid>

              {/* Submit row */}
              <Grid item xs={12}>
                <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 2 }}>
                  <Button variant="text" onClick={() => navigate("/login")}>
                    Already have an account? Login
                  </Button>
                  <Button type="submit" variant="contained" disabled={loading}>
                    {loading ? "Registering..." : "Sign Up"}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
