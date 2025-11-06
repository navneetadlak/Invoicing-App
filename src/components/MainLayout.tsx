import React from "react";
import { AppBar, Box, Toolbar, Typography, Button } from "@mui/material";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { logout, auth } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppBar position="static">
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography variant="h6" component={RouterLink} to="/" sx={{ color: "inherit", textDecoration: "none" }}>
              InvoiceApp
            </Typography>
            <Button component={RouterLink} to="/invoices" color="inherit">Invoices</Button>
            <Button component={RouterLink} to="/items" color="inherit">Items</Button>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography variant="body2" sx={{ color: "inherit" }}>
              {auth?.company?.companyName ?? auth?.user?.firstName ?? ""}
            </Typography>
            <Button color="inherit" onClick={handleLogout}>Logout</Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ flexGrow: 1 }}>
        {children}
      </Box>

      <Box component="footer" sx={{ p: 2, textAlign: "center" }}>
        <Typography variant="caption">© {new Date().getFullYear()} InvoiceApp</Typography>
      </Box>
    </Box>
  );
}