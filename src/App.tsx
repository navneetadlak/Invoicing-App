import { Route, Routes, Navigate, Outlet } from "react-router-dom";
import "./App.css";

import Login from "./pages/Login";
import Signup from "./pages/Signup";

import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./components/MainLayout";

import ItemList from "./pages/items/ItemList";
import ItemEdit from "./pages/items/itemEdit";
import InvoiceList from "./pages/invoices/InvoiceList";
import InvoiceEdit from "./pages/invoices/InvoiceEdit";
import InvoicePrint from "./pages/invoices/InvoicePrint";

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route
        element={
          <ProtectedRoute>
            <MainLayout>
              <Outlet />
            </MainLayout>
          </ProtectedRoute>
        }
      >
        {/* protected routes */}
        <Route path="/items" element={<ItemList />} />
        <Route path="/items/new" element={<ItemEdit />} />
        <Route path="/items/edit/:id" element={<ItemEdit />} />

        <Route path="/invoices" element={<InvoiceList />} />
        <Route path="/invoices/new" element={<InvoiceEdit />} />
        <Route path="/invoices/:id" element={<InvoiceEdit />} />
        <Route path="/invoices/:id/print" element={<InvoicePrint />} />
      </Route>

      <Route path="*" element={<h3>404 - Page not found</h3>} />
    </Routes>
  );
}
