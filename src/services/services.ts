import api from "./api";

// AUTH 
export const AuthAPI = {
  login: (email: string, password: string, rememberMe = false) =>
    api.post("/Auth/Login", { email, password, rememberMe }),

  signup: (formData: FormData) =>
    api.post("/Auth/Signup", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  getCompanyLogo: (companyId: number) =>
    api.get(`/Auth/GetCompanyLogoUrl/${companyId}`),

  getCompanyLogoThumb: (companyId: number) =>
    api.get(`/Auth/GetCompanyLogoThumbnailUrl/${companyId}`),
};


//  ITEM 
export const ItemAPI = {
  list: () => api.get("/Item/GetList"),
  get: (id: number) => api.get(`/Item/${id}`),
  create: (payload: any) => api.post("/Item", payload),
  update: (payload: any) => api.put("/Item", payload),
  delete: (id: number) => api.delete(`/Item/${id}`),

  uploadPicture: (itemId: number, file: File) => {
    const form = new FormData();
    form.append("ItemID", itemId.toString());
    form.append("File", file);
    return api.post("/Item/UpdateItemPicture", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  getPicture: (id: number) => api.get(`/Item/Picture/${id}`),
};

//  INVOICE
function prepareInvoicePayload(payload: any) {
  const invoiceNoRaw = payload.invoiceNo ?? payload.InvoiceNo;
  const invoiceNo = invoiceNoRaw !== undefined && invoiceNoRaw !== "" && invoiceNoRaw !== null
    ? Number(invoiceNoRaw)
    : null;

  const linesRaw = payload.lines ?? payload.Lines ?? [];
  const lines = (Array.isArray(linesRaw) ? linesRaw : []).map((ln: any, idx: number) => ({
    rowNo: ln.rowNo ?? ln.RowNo ?? idx + 1,
    itemID: Number(ln.itemID ?? ln.ItemID ?? 0),
    description: ln.description ?? ln.Description ?? "",
    quantity: Number(ln.quantity ?? ln.Quantity ?? 0),
    rate: Number(ln.rate ?? ln.Rate ?? 0),
    discountPct: Number(ln.discountPct ?? ln.DiscountPct ?? 0),
  }));

  return {
    invoiceID: payload.invoiceID ?? payload.InvoiceID ?? 0,
    invoiceNo,
    invoiceDate: payload.invoiceDate ?? payload.InvoiceDate ?? null,
    customerName: (payload.customerName ?? payload.CustomerName ?? "").toString().trim(),
    address: payload.address ?? payload.Address ?? "",
    city: payload.city ?? payload.City ?? "",
    taxPercentage: Number(payload.taxPercentage ?? payload.TaxPercentage ?? 0),
    notes: payload.notes ?? payload.Notes ?? "",
    lines,
    subTotal: Number(payload.subTotal ?? payload.SubTotal ?? 0),
    taxAmount: Number(payload.taxAmount ?? payload.TaxAmount ?? 0),
    invoiceAmount: Number(payload.invoiceAmount ?? payload.InvoiceAmount ?? 0),
  };
}

export const InvoiceAPI = {
  list: (params?: Record<string, any>) => api.get("/Invoice/GetList", { params }),
  get: (id: number) => api.get(`/Invoice/${id}`),

  create: (payload: any) => {
    const body = prepareInvoicePayload(payload);
    // Explicitly set content-type and log the final body about to be sent
    console.log("InvoiceAPI.create -> final body:", body);
    return api.post("/Invoice", body, {
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  },

  update: (payload: any) => {
    const body = prepareInvoicePayload(payload);
    console.log("InvoiceAPI.update -> final body:", body);
    return api.put("/Invoice", body, {
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  },

  delete: (id: number) => api.delete(`/Invoice/${id}`),

  metrics: (params?: Record<string, any>) => api.get("/Invoice/GetMetrices", { params }),
  topItems: (params?: Record<string, any>) => api.get("/Invoice/TopItems", { params }),
  trend: (params?: Record<string, any>) => api.get("/Invoice/GetTrend12m", { params }),
};