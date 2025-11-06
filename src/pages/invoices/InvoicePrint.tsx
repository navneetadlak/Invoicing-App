import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Box, Typography, CircularProgress, Button } from "@mui/material";
import { InvoiceAPI } from "../../services/services";

export default function InvoicePrint() {
    const params = useParams<{ id?: string }>();
    const invoiceId = params.id ? Number(params.id) : undefined;

    const printRef = useRef<HTMLDivElement | null>(null);
    const [invoice, setInvoice] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!invoiceId && invoiceId !== 0) return;
        setLoading(true);
        InvoiceAPI.get(Number(invoiceId))
            .then((res) => setInvoice(res.data))
            .catch((err) => {
                console.error("Failed to load invoice for print", err);
                alert("Failed to load invoice for print");
            })
            .finally(() => setLoading(false));
    }, [invoiceId]);

    const printViaIframe = () => {
        if (!printRef.current) return;
        const markup = printRef.current.innerHTML;
        const styles = `
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial; padding: 20px; color:#111; }
      table { width:100%; border-collapse:collapse; margin-top:12px; }
      th,td { padding:8px; border-bottom:1px solid #ddd; }
      th { text-align:left; }
      .right { text-align:right; }
      .total { font-weight:700; font-size:1.1rem; }
    </style>
  `;

        const iframe = document.createElement("iframe");
        iframe.style.position = "fixed";
        iframe.style.right = "0";
        iframe.style.bottom = "0";
        iframe.style.width = "0";
        iframe.style.height = "0";
        iframe.style.border = "0";
        iframe.setAttribute("aria-hidden", "true");
        document.body.appendChild(iframe);

        const doc = iframe.contentWindow?.document;
        if (!doc) {
            alert("Printing not supported in this browser.");
            document.body.removeChild(iframe);
            return;
        }

        doc.open();
        doc.write(`<!doctype html><html><head><meta charset="utf-8"><title>Invoice</title>${styles}</head><body>${markup}</body></html>`);
        doc.close();

        // Wait for load then print
        const onLoad = () => {
            try {
                iframe.contentWindow?.focus();
                iframe.contentWindow?.print();
            } catch (e) {
                console.warn("iframe.print() failed:", e);
                alert("Automatic print failed. Use 'Open in new tab' to print manually.");
            } finally {
                setTimeout(() => {
                    // cleanup
                    try { document.body.removeChild(iframe); } catch { }
                }, 500);
            }
        };

        if (doc.readyState === "complete") {
            setTimeout(onLoad, 100);
        } else {
            doc.addEventListener("readystatechange", () => {
                if (doc.readyState === "complete") setTimeout(onLoad, 100);
            });
        }
    };


    if (loading || !invoice) {
        return (
            <Box sx={{ p: 3, display: "flex", justifyContent: "center" }}>
                <CircularProgress />
            </Box>
        );
    }

    const invoiceDate = invoice.invoiceDate ? (invoice.invoiceDate.split?.("T")?.[0] ?? invoice.invoiceDate) : "";

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ mb: 2, display: "flex", gap: 2 }}>
                <Button variant="contained" onClick={printViaIframe}>Print / Save as PDF</Button>
                <Button
                    variant="outlined"
                    onClick={() => {
                        // open printable HTML in new tab for manual save/print
                        const markup = printRef.current?.innerHTML ?? "";
                        const styles = `<style>body{font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial;padding:20px;color:#111;} table{width:100%;border-collapse:collapse;margin-top:12px;} th,td{padding:8px;border-bottom:1px solid #ddd;} th{text-align:left;} .right{text-align:right;} .total{font-weight:700;font-size:1.1rem;}</style>`;
                        const blob = new Blob([`<!doctype html><html><head><meta charset="utf-8"><title>Invoice</title>${styles}</head><body>${markup}</body></html>`], { type: "text/html" });
                        const url = URL.createObjectURL(blob);
                        window.open(url, "_blank");
                        setTimeout(() => URL.revokeObjectURL(url), 10000);
                    }}
                >
                    Open in new tab
                </Button>
            </Box>

            {/* printable content */}
            <div ref={printRef as any} style={{ background: "#fff", padding: 16 }}>
                <Typography variant="h4" gutterBottom>
                    Invoice #{invoice.invoiceNo ?? invoice.invoiceID}
                </Typography>
                <Typography>Customer: {invoice.customerName}</Typography>
                <Typography>Address: {invoice.address}</Typography>
                <Typography>City: {invoice.city}</Typography>
                <Typography>Date: {invoiceDate}</Typography>

                <Box mt={2}>
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Description</th>
                                <th className="right">Qty</th>
                                <th className="right">Rate</th>
                                <th className="right">Disc %</th>
                                <th className="right">Line Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(invoice.lines ?? []).map((ln: any, idx: number) => {
                                const qty = Number(ln.quantity ?? 0);
                                const rate = Number(ln.rate ?? 0);
                                const disc = Number(ln.discountPct ?? 0);
                                const lineTotal = (qty * rate * (1 - disc / 100));
                                return (
                                    <tr key={idx}>
                                        <td>{ln.rowNo ?? idx + 1}</td>
                                        <td>{ln.description ?? `Item ID ${ln.itemID}`}</td>
                                        <td className="right">{qty}</td>
                                        <td className="right">{rate.toFixed(2)}</td>
                                        <td className="right">{disc.toFixed(2)}</td>
                                        <td className="right">{lineTotal.toFixed(2)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    <Box sx={{ mt: 2, textAlign: "right" }}>
                        <Typography>Subtotal: {Number(invoice.subTotal ?? 0).toFixed(2)}</Typography>
                        <Typography>Tax ({invoice.taxPercentage}%): {Number(invoice.taxAmount ?? 0).toFixed(2)}</Typography>
                        <Typography className="total">Total: {Number(invoice.invoiceAmount ?? 0).toFixed(2)}</Typography>
                    </Box>
                </Box>

                <Box mt={3}>
                    <Typography variant="caption">Created by: {invoice.createdByUserName ?? "-"} on {invoice.createdOn ?? "-"}</Typography><br />
                    <Typography variant="caption">Updated by: {invoice.updatedByUserName ?? "-"} on {invoice.updatedOn ?? "-"}</Typography>
                </Box>
            </div>
        </Box>
    );
}