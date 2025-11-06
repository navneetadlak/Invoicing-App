import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Stack,
} from "@mui/material";
import {
  DataGrid,
  type GridColDef,
  type GridRenderCellParams,
  type GridPaginationModel,
} from "@mui/x-data-grid";
import { InvoiceAPI } from "../../services/services";
import { useNavigate } from "react-router-dom";

type RawInvoice = {
  invoiceID: number;
  invoiceNo?: string | number | null;
  invoiceDate?: string | null;
  customerName?: string | null;
  invoiceAmount?: number | null;
  subTotal?: number | null;
  taxAmount?: number | null;
  status?: string | null;
  // any other raw props from API...
};

type InvoiceRow = {
  id: number; // DataGrid expects a unique 'id' by default unless getRowId is provided
  invoiceID: number;
  invoiceNo: string | number;
  invoiceDate: string;
  customerName: string;
  invoiceAmount: number;
  status?: string | null;
  _raw?: RawInvoice;
};

export default function InvoiceList() {
  const [rawInvoices, setRawInvoices] = useState<RawInvoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    InvoiceAPI.list()
      .then((res) => {
        // Defensive: ensure array
        const arr: RawInvoice[] = Array.isArray(res.data) ? res.data : [];
        setRawInvoices(arr);
      })
      .catch((err) => {
        console.error("Failed to load invoices", err);
        alert("Failed to fetch invoices");
      })
      .finally(() => setLoading(false));
  }, []);

  // Pre-map raw invoices into DataGrid-friendly rows (no valueGetter needed)
  const rows: InvoiceRow[] = useMemo(
    () =>
      rawInvoices.map((inv) => {
        const invoiceNo = inv.invoiceNo ?? inv.invoiceID;
        const invoiceDate = inv.invoiceDate ? inv.invoiceDate.split("T")[0] : "";
        const invoiceAmount = inv.invoiceAmount ?? inv.subTotal ?? 0;
        return {
          id: inv.invoiceID, // DataGrid default id field
          invoiceID: inv.invoiceID,
          invoiceNo,
          invoiceDate,
          customerName: inv.customerName ?? "",
          invoiceAmount,
          status: inv.status ?? null,
          _raw: inv,
        };
      }),
    [rawInvoices]
  );

  const total = rows.length;
  const paid = rows.filter((r) => r.status === "Paid").length;
  const unpaid = total - paid;

  const columns: GridColDef<InvoiceRow>[] = [
    { field: "invoiceNo", headerName: "Invoice #", width: 160 },
    { field: "invoiceDate", headerName: "Date", width: 140 },
    { field: "customerName", headerName: "Customer", flex: 1 },
    { field: "invoiceAmount", headerName: "Total", width: 140, type: "number" },
    {
      field: "actions",
      headerName: "Actions",
      width: 220,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams<InvoiceRow>) => {
        const row = params.row;
        return (
          <>
            <Button onClick={() => navigate(`/invoices/${row.invoiceID}`)}>
              View / Edit
            </Button>
            <Button size="small" onClick={() => navigate(`/invoices/${row.invoiceID}/print`)}>Print</Button>
          </>
        );
      },
    },
  ];

  if (loading) return <Box sx={{ p: 3 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Invoices
      </Typography>

      <Stack direction="row" spacing={2} mb={2}>
        <Card sx={{ minWidth: 160 }}>
          <CardContent>
            <Typography variant="subtitle2">Total</Typography>
            <Typography variant="h6">{total}</Typography>
          </CardContent>
        </Card>
        <Card sx={{ minWidth: 160 }}>
          <CardContent>
            <Typography variant="subtitle2">Paid</Typography>
            <Typography variant="h6">{paid}</Typography>
          </CardContent>
        </Card>
        <Card sx={{ minWidth: 160 }}>
          <CardContent>
            <Typography variant="subtitle2">Unpaid</Typography>
            <Typography variant="h6">{unpaid}</Typography>
          </CardContent>
        </Card>
      </Stack>

      <Button
        variant="contained"
        sx={{ mb: 2 }}
        onClick={() => navigate("/invoices/new")}
      >
        New Invoice
      </Button>

      <Box sx={{ height: 560 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          // controlled pagination (client-side). For server-side change mode and call API with page/pageSize.
          paginationModel={paginationModel}
          onPaginationModelChange={(model) => setPaginationModel(model)}
          pageSizeOptions={[10, 25, 50]}
        // keep selection / other features as needed
        />
      </Box>
    </Box>
  );
}