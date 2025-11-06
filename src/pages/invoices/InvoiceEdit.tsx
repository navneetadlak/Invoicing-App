import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  IconButton,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Stack,
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import { InvoiceAPI } from "../../services/services";
import { ItemAPI } from "../../services/services";

type Line = {
  rowNo: number;
  itemID: number | null;
  description?: string;
  quantity: number;
  rate: number;
  discountPct: number;
};

type InvoiceResponse = {
  primaryKeyID?: number;
  invoiceID?: number;
  invoiceNo?: number | string;
  invoiceDate?: string | null;
  customerName?: string | null;
  address?: string | null;
  city?: string | null;
  taxPercentage?: number | null;
  notes?: string | null;
  lines?: Line[] | null;
  subTotal?: number | null;
  taxAmount?: number | null;
  invoiceAmount?: number | null;
  createdByUserName?: string | null;
  createdOn?: string | null;
  updatedByUserName?: string | null;
  updatedOn?: string | null;
};

const isoToInputDate = (iso?: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const inputDateToIso = (val: string) => {
  if (!val) return null;
  // keep as 'YYYY-MM-DD' — your backend accepted that earlier (Postman used / returned T00:00:00)
  return val;
};

export default function InvoiceEditor() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState<InvoiceResponse>({
    invoiceID: undefined,
    invoiceNo: undefined,
    invoiceDate: undefined,
    customerName: "",
    address: "",
    city: "",
    taxPercentage: 0,
    notes: "",
    lines: [],
    subTotal: 0,
    taxAmount: 0,
    invoiceAmount: 0,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [itemNames, setItemNames] = useState<Record<number, string>>({});

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    InvoiceAPI.get(Number(id))
      .then((res) => {
        const data: InvoiceResponse = res.data;
        // Map API shape into local state, convert date for <input type="date">
        setInvoice({
          ...data,
          invoiceDate: isoToInputDate(data.invoiceDate ?? undefined),
          lines: (data.lines ?? []).map((ln, idx) => ({
            rowNo: ln.rowNo ?? idx + 1,
            itemID: ln.itemID ?? null,
            description: ln.description ?? "",
            quantity: Number(ln.quantity ?? 0),
            rate: Number(ln.rate ?? 0),
            discountPct: Number(ln.discountPct ?? 0),
          })),
        });

        // optional: fetch item names for lines
        (data.lines ?? []).forEach((ln: any) => {
          if (ln?.itemID) {
            ItemAPI.get(ln.itemID)
              .then((r) => {
                setItemNames((prev) => ({ ...prev, [ln.itemID]: r.data.itemName ?? "" }));
              })
              .catch(() => { });
          }
        });
      })
      .catch((err) => {
        console.error(err);
        alert("Failed to load invoice");
      })
      .finally(() => setLoading(false));
  }, [id]);

  // derived totals computed from lines and taxPercentage
  const computed = useMemo(() => {
    const lines: Line[] = invoice.lines ?? [];
    const subTotal = lines.reduce((acc, ln) => {
      const lineTotal = ln.quantity * ln.rate * (1 - (ln.discountPct ?? 0) / 100);
      return acc + Number(lineTotal);
    }, 0);
    const taxAmount = Number(((invoice.taxPercentage ?? 0) / 100) * subTotal);
    const invoiceAmount = Number(subTotal + taxAmount);
    return { subTotal: Number(subTotal.toFixed(2)), taxAmount: Number(taxAmount.toFixed(2)), invoiceAmount: Number(invoiceAmount.toFixed(2)) };
  }, [invoice.lines, invoice.taxPercentage]);

  // keep displayed totals in state but prefer computed when saving
  useEffect(() => {
    setInvoice((prev) => ({ ...prev, subTotal: computed.subTotal, taxAmount: computed.taxAmount, invoiceAmount: computed.invoiceAmount }));
  }, [computed.subTotal, computed.taxAmount, computed.invoiceAmount]);

  const addLine = () => {
    const next: Line = {
      rowNo: (invoice.lines?.length ?? 0) + 1,
      itemID: null,
      description: "",
      quantity: 1,
      rate: 0,
      discountPct: 0,
    };
    setInvoice((p) => ({ ...p, lines: [...(p.lines ?? []), next] }));
  };

  const updateLine = (index: number, patch: Partial<Line>) => {
    const lines = [...(invoice.lines ?? [])];
    lines[index] = { ...lines[index], ...patch };
    setInvoice((p) => ({ ...p, lines }));
  };

  const removeLine = (index: number) => {
    const lines = [...(invoice.lines ?? [])];
    lines.splice(index, 1);
    // reindex rowNo
    const fixed = lines.map((l, i) => ({ ...l, rowNo: i + 1 }));
    setInvoice((p) => ({ ...p, lines: fixed }));
  };

  const handleSave = async (e?: React.FormEvent) => {
    const customerNameValue = (invoice.customerName ?? "").toString().trim();
    if (!customerNameValue) {
      alert("Please enter Customer name before saving.");
      return;
    }

    if (e) e.preventDefault();
    setSaving(true);
    try {
      const payload: any = {
        invoiceID: invoice.invoiceID ?? 0,
        invoiceNo: invoice.invoiceNo !== undefined && invoice.invoiceNo !== "" ? Number(invoice.invoiceNo) : 0,
        invoiceDate: inputDateToIso(invoice.invoiceDate ?? ""),
        customerName: customerNameValue,
        address: invoice.address ?? "",
        city: invoice.city ?? "",
        taxPercentage: Number(invoice.taxPercentage ?? 0),
        notes: invoice.notes ?? "",
        lines: (invoice.lines ?? []).map((ln) => ({
          rowNo: ln.rowNo,
          itemID: ln.itemID ?? 0,
          description: ln.description ?? "",
          quantity: Number(ln.quantity ?? 0),
          rate: Number(ln.rate ?? 0),
          discountPct: Number(ln.discountPct ?? 0),
        })),
        subTotal: computed.subTotal,
        taxAmount: computed.taxAmount,
        invoiceAmount: computed.invoiceAmount,
      };

      console.log("InvoiceEditor -> final payload:", payload);

      if (invoice.invoiceID) {
        await InvoiceAPI.update(payload);
      } else {
        await InvoiceAPI.create(payload);
      }
      navigate("/invoices");
    } catch (err: any) {
      console.error("save failed", err);
      alert(err?.response?.data || err?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Box p={3}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {invoice.invoiceID ? `Edit Invoice (${invoice.invoiceNo ?? invoice.invoiceID})` : "New Invoice"}
      </Typography>

      <Box component="form" onSubmit={handleSave} noValidate>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={2}>
          <TextField
            label="Invoice No"
            value={invoice.invoiceNo ?? ""}
            onChange={(e) => setInvoice((p) => ({ ...p, invoiceNo: e.target.value }))}
            sx={{ minWidth: 200 }}
          />
          <TextField
            label="Date"
            type="date"
            value={invoice.invoiceDate ?? ""}
            onChange={(e) => setInvoice((p) => ({ ...p, invoiceDate: e.target.value }))}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Customer"
            value={invoice.customerName ?? ""}
            onChange={(e) => setInvoice((p) => ({ ...p, customerName: e.target.value }))}
            sx={{ flex: 1 }}
          />
        </Stack>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={2}>
          <TextField
            label="Address"
            value={invoice.address ?? ""}
            onChange={(e) => setInvoice((p) => ({ ...p, address: e.target.value }))}
            sx={{ flex: 1 }}
          />
          <TextField
            label="City"
            value={invoice.city ?? ""}
            onChange={(e) => setInvoice((p) => ({ ...p, city: e.target.value }))}
            sx={{ width: 200 }}
          />
          <TextField
            label="Tax %"
            type="number"
            value={invoice.taxPercentage ?? 0}
            onChange={(e) => setInvoice((p) => ({ ...p, taxPercentage: Number(e.target.value) }))}
            sx={{ width: 140 }}
          />
        </Stack>

        <Paper variant="outlined" sx={{ mb: 2 }}>
          <Box p={1}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="subtitle1">Line Items</Typography>
              <Button startIcon={<AddIcon />} onClick={addLine}>Add line</Button>
            </Stack>

            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Item ID</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="right">Qty</TableCell>
                  <TableCell align="right">Rate</TableCell>
                  <TableCell align="right">Discount %</TableCell>
                  <TableCell align="right">Line Total</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(invoice.lines ?? []).map((ln, idx) => {
                  const lineTotal = Number((ln.quantity * ln.rate * (1 - (ln.discountPct ?? 0) / 100)).toFixed(2));
                  return (
                    <TableRow key={idx}>
                      <TableCell>{ln.rowNo}</TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          value={ln.itemID ?? ""}
                          onChange={(e) => updateLine(idx, { itemID: e.target.value ? Number(e.target.value) : null })}
                          sx={{ width: 110 }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          value={ln.description ?? ""}
                          onChange={(e) => updateLine(idx, { description: e.target.value })}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <TextField
                          size="small"
                          type="number"
                          value={ln.quantity}
                          onChange={(e) => updateLine(idx, { quantity: Number(e.target.value) || 0 })}
                          inputProps={{ step: "0.01" }}
                          sx={{ width: 100 }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <TextField
                          size="small"
                          type="number"
                          value={ln.rate}
                          onChange={(e) => updateLine(idx, { rate: Number(e.target.value) || 0 })}
                          sx={{ width: 120 }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <TextField
                          size="small"
                          type="number"
                          value={ln.discountPct}
                          onChange={(e) => updateLine(idx, { discountPct: Number(e.target.value) || 0 })}
                          sx={{ width: 120 }}
                        />
                      </TableCell>
                      <TableCell align="right">{lineTotal.toFixed(2)}</TableCell>
                      <TableCell align="center">
                        <IconButton size="small" onClick={() => removeLine(idx)}><DeleteIcon /></IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {(!invoice.lines || invoice.lines.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={8}>
                      <Typography variant="body2" color="text.secondary">No line items. Click "Add line" to create one.</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>
        </Paper>

        <Stack direction="row" justifyContent="flex-end" spacing={4} mb={2}>
          <Box sx={{ textAlign: "right" }}>
            <Typography>Subtotal: {computed.subTotal.toFixed(2)}</Typography>
            <Typography>Tax: {computed.taxAmount.toFixed(2)}</Typography>
            <Typography variant="h6">Total: {computed.invoiceAmount.toFixed(2)}</Typography>
          </Box>
        </Stack>

        <TextField
          label="Notes"
          fullWidth
          multiline
          minRows={2}
          value={invoice.notes ?? ""}
          onChange={(e) => setInvoice((p) => ({ ...p, notes: e.target.value }))}
          sx={{ mb: 2 }}
        />

        <Stack direction="row" spacing={2}>
          <Button variant="contained" type="submit" disabled={saving} onClick={handleSave}>
            {saving ? "Saving..." : "Save Invoice"}
          </Button>
          <Button variant="outlined" onClick={() => navigate("/invoices")}>Cancel</Button>
        </Stack>
      </Box>

      {/* Metadata */}
      <Box mt={3}>
        <Typography variant="caption">Created by: {invoice.createdByUserName ?? "-"} on {invoice.createdOn ?? "-"}</Typography><br />
        <Typography variant="caption">Last updated by: {invoice.updatedByUserName ?? "-"} on {invoice.updatedOn ?? "-"}</Typography>
      </Box>
    </Box>
  );
}