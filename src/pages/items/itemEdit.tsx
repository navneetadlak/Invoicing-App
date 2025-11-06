import React, { useEffect, useState } from "react";
import { Box, Button, TextField, Typography, CircularProgress } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { ItemAPI } from "../../services/services";

type ItemModel = {
  itemID?: number;
  itemName?: string;
  description?: string | null;
  salesRate?: number | null;
  discountPct?: number | null;
};

export default function ItemEdit() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<ItemModel>({ itemName: "", salesRate: 0, discountPct: 0 });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    ItemAPI.get(Number(id))
      .then((res) => {
        const data = res.data;
        setItem({
          itemID: data.itemID,
          itemName: data.itemName,
          description: data.description,
          salesRate: data.salesRate,
          discountPct: data.discountPct,
        });
      })
      .catch((err) => {
        console.error("Failed to fetch item", err);
        alert("Failed to load item");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        itemID: item.itemID,
        itemName: item.itemName,
        description: item.description,
        salesRate: Number(item.salesRate),
        discountPct: Number(item.discountPct ?? 0),
      };
      if (item.itemID) {
        await ItemAPI.update(payload);
      } else {
        await ItemAPI.create(payload);
      }
      navigate("/items");
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5">{item.itemID ? "Edit Item" : "Add New Item"}</Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <TextField
          label="Name"
          fullWidth
          sx={{ mb: 2 }}
          value={item.itemName ?? ""}
          onChange={(e) => setItem({ ...item, itemName: e.target.value })}
        />
        <TextField
          label="Rate"
          type="number"
          fullWidth
          sx={{ mb: 2 }}
          value={item.salesRate ?? ""}
          onChange={(e) => setItem({ ...item, salesRate: Number(e.target.value) })}
        />
        <TextField
          label="Discount (%)"
          type="number"
          fullWidth
          sx={{ mb: 2 }}
          value={item.discountPct ?? ""}
          onChange={(e) => setItem({ ...item, discountPct: Number(e.target.value) })}
        />

        <Button type="submit" variant="contained" disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </Box>
    </Box>
  );
}