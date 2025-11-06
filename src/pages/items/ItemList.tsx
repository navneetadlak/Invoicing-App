import { useEffect, useMemo, useState } from "react";
import { Box, Button, Typography, CircularProgress } from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { ItemAPI } from "../../services/services";
import { useNavigate } from "react-router-dom";

type RawItem = {
  itemID: number;
  itemName?: string | null;
  salesRate?: number | null;
  discountPct?: number | null;
};

type ItemRow = {
  id: number; 
  itemID: number;
  itemName: string;
  salesRate: number;
  discountPct: number;
};

export default function ItemList() {
  const [itemsRaw, setItemsRaw] = useState<RawItem[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await ItemAPI.list();
      const arr: RawItem[] = Array.isArray(res.data) ? res.data : [];
      setItemsRaw(arr);
    } catch (err) {
      console.error("Failed to fetch items", err);
      alert("Failed to fetch items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Pre-map rows so DataGrid reads concrete fields (avoids valueGetter issues)
  const rows: ItemRow[] = useMemo(
    () =>
      itemsRaw.map((it) => ({
        id: it.itemID,
        itemID: it.itemID,
        itemName: it.itemName ?? "",
        salesRate: Number(it.salesRate ?? 0),
        discountPct: Number(it.discountPct ?? 0),
      })),
    [itemsRaw]
  );

  const columns: GridColDef<ItemRow>[] = [
    { field: "itemName", headerName: "Name", flex: 1 },
    { field: "salesRate", headerName: "Rate", flex: 0.5, type: "number" },
    { field: "discountPct", headerName: "Discount", flex: 0.4, type: "number" },
    {
      field: "actions",
      headerName: "Actions",
      width: 160,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <>
          <Button size="small" onClick={() => navigate(`/items/edit/${params.row.itemID}`)}>Edit</Button>
          <Button size="small" onClick={() => navigate(`/items/view/${params.row.itemID}`)}>View</Button>
        </>
      ),
    },
  ];

  if (loading) return <Box sx={{ p: 3 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Item Master
      </Typography>
      <Button variant="contained" onClick={() => navigate("/items/new")} sx={{ mb: 2 }}>
        Add New Item
      </Button>

      <Box sx={{ height: 520 }}>
        <DataGrid rows={rows} columns={columns} pageSizeOptions={[10, 25, 50]} />
      </Box>
    </Box>
  );
}