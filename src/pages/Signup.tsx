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
  Divider,
  Paper,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Visibility, VisibilityOff, UploadFile } from "@mui/icons-material";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();
  const { signup, loading } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

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
    <Container
      maxWidth="lg"
      sx={{
        py: 4,
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <Card
        elevation={isMobile ? 0 : 8}
        sx={{
          width: "100%",
          maxWidth: 1200,
          borderRadius: isMobile ? 0 : 2,
          border: isMobile ? "none" : "1px solid",
          borderColor: "divider",
          overflow: "hidden"
        }}
      >
        <CardContent sx={{ p: 0 }}>
          {/* Header Section */}
          <Box
            sx={{
              bgcolor: "primary.main",
              color: "primary.contrastText",
              py: 4,
              px: 3,
              textAlign: "center"
            }}
          >
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Create Your Account
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Set up your company and start invoicing in minutes
            </Typography>
          </Box>

          <Box component="form" onSubmit={submit} sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
            <Grid container spacing={4}>
              {/* Personal Details - Left Side */}
              <Grid item xs={12} md={6}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    height: "100%",
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    bgcolor: "background.default"
                  }}
                >
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{
                      color: "primary.main",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: 1
                    }}
                  >
                    <Box
                      component="span"
                      sx={{
                        width: 4,
                        height: 20,
                        bgcolor: "primary.main",
                        borderRadius: 1
                      }}
                    />
                    Personal Details
                  </Typography>

                  <Box sx={{ mt: 2 }}>
                    <TextField
                      label="First Name*"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      fullWidth
                      margin="normal"
                      size="small"
                    />
                    <TextField
                      label="Last Name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      fullWidth
                      margin="normal"
                      size="small"
                    />
                    <TextField
                      label="Email*"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      fullWidth
                      margin="normal"
                      size="small"
                    />
                    <TextField
                      label="Password*"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      fullWidth
                      margin="normal"
                      size="small"
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
                    <Box sx={{ mt: 1, mb: 2 }}>
                      <Typography
                        variant="caption"
                        color={password.length >= 8 ? "success.main" : "error.main"}
                        fontWeight="medium"
                      >
                        Password strength: {password.length >= 8 ? "Good" : "Weak"}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>

              {/* Company Details - Right Side */}
              <Grid item xs={12} md={6}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    height: "100%",
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    bgcolor: "background.default"
                  }}
                >
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{
                      color: "primary.main",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: 1
                    }}
                  >
                    <Box
                      component="span"
                      sx={{
                        width: 4,
                        height: 20,
                        bgcolor: "primary.main",
                        borderRadius: 1
                      }}
                    />
                    Company Details
                  </Typography>

                  <Box sx={{ mt: 2 }}>
                    <TextField
                      label="Company Name*"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      fullWidth
                      margin="normal"
                      size="small"
                    />

                    {/* Logo Upload Section */}
                    <Box sx={{ my: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Company Logo
                      </Typography>
                      <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
                        <Box>
                          <input
                            id="logo-file"
                            type="file"
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={handleLogoChange}
                          />
                          <label htmlFor="logo-file">
                            <Button
                              variant="outlined"
                              component="span"
                              startIcon={<UploadFile />}
                              size="small"
                            >
                              Upload Logo
                            </Button>
                          </label>
                        </Box>

                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Avatar
                            src={logoPreview ?? undefined}
                            sx={{
                              width: 48,
                              height: 48,
                              bgcolor: logoPreview ? "transparent" : "grey.100",
                              border: "1px dashed",
                              borderColor: "divider"
                            }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {logoFile ? logoFile.name : "No file chosen"}
                          </Typography>
                        </Box>
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
                      size="small"
                    />

                    <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
                      <TextField
                        label="City"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        fullWidth
                        margin="normal"
                        size="small"
                      />
                      <TextField
                        label="Zip Code"
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                        sx={{ minWidth: { xs: "100%", sm: 140 } }}
                        margin="normal"
                        size="small"
                      />
                    </Box>

                    <TextField
                      label="Industry"
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      fullWidth
                      margin="normal"
                      size="small"
                    />

                    <TextField
                      label="Currency Symbol*"
                      value={currencySymbol}
                      onChange={(e) => setCurrencySymbol(e.target.value)}
                      fullWidth
                      margin="normal"
                      placeholder="$, ₹, €, AED"
                      size="small"
                      helperText="Enter your preferred currency symbol"
                    />
                  </Box>
                </Paper>
              </Grid>

              {/* Submit Section */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Box sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  justifyContent: "space-between",
                  alignItems: { xs: "stretch", sm: "center" },
                  gap: 2,
                  pt: 2
                }}>
                  <Button
                    variant="text"
                    onClick={() => navigate("/login")}
                    sx={{ alignSelf: { xs: "center", sm: "flex-start" } }}
                  >
                    Already have an account? Login
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    size="large"
                    sx={{
                      minWidth: 120,
                      alignSelf: { xs: "center", sm: "flex-end" }
                    }}
                  >
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