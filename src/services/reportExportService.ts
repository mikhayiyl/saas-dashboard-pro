type ReportDateRange = "7" | "30" | "90" | "all";
type ExcelModule = typeof import("xlsx");
type PdfModule = typeof import("jspdf");

let excelModule: ExcelModule | undefined;
let pdfModule: PdfModule | undefined;
let excelModulePromise: Promise<ExcelModule> | undefined;
let pdfModulePromise: Promise<PdfModule> | undefined;

function loadExcelModule() {
  excelModulePromise ??= import("xlsx")
    .then((module) => {
      excelModule = module;
      return module;
    })
    .catch((error: unknown) => {
      excelModulePromise = undefined;
      throw error;
    });

  return excelModulePromise;
}

function loadPdfModule() {
  pdfModulePromise ??= import("jspdf")
    .then((module) => {
      pdfModule = module;
      return module;
    })
    .catch((error: unknown) => {
      pdfModulePromise = undefined;
      throw error;
    });

  return pdfModulePromise;
}

export async function preloadReportExportLibraries() {
  await Promise.all([loadExcelModule(), loadPdfModule()]);
}

type ReportExportData = {
  dateRange: ReportDateRange;

  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  totalItemsSold: number;

  orderStatusCounts: {
    pending: number;
    processing: number;
    completed: number;
    cancelled: number;
  };

  topProducts: {
    product: {
      id: string;
      name: string;
    };
    quantity: number;
    revenue: number;
  }[];

  topCustomers: {
    customer: {
      id: string;
      name: string;
    };
    orders: number;
    revenue: number;
  }[];

  lowStockProducts: {
    id: string;
    name: string;
    stock: number;
  }[];
};

function getDateRangeLabel(dateRange: ReportDateRange) {
  switch (dateRange) {
    case "7":
      return "Last 7 days";

    case "30":
      return "Last 30 days";

    case "90":
      return "Last 90 days";

    case "all":
      return "All time";
  }
}

function formatCurrency(value: number) {
  return `$${value.toLocaleString(undefined, {
    maximumFractionDigits: 2,
  })}`;
}

function getFileDate() {
  return new Date().toISOString().slice(0, 10);
}

export function exportReportToExcel(data: ReportExportData) {
  if (!excelModule) {
    throw new Error("Excel export is not ready yet.");
  }

  const XLSX = excelModule;
  const workbook = XLSX.utils.book_new();

  const periodLabel = getDateRangeLabel(data.dateRange);

  // Summary
  const summaryData = [
    ["Business Report"],
    ["Period", periodLabel],
    ["Generated", new Date().toLocaleString()],
    [],
    ["Metric", "Value"],
    ["Revenue", data.totalRevenue],
    ["Orders", data.totalOrders],
    ["Average Order Value", data.averageOrderValue],
    ["Items Sold", data.totalItemsSold],
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);

  summarySheet["!cols"] = [{ wch: 24 }, { wch: 20 }];

  XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

  // Order Status
  const orderStatusData = [
    ["Order Status", "Count"],
    ["Pending", data.orderStatusCounts.pending],
    ["Processing", data.orderStatusCounts.processing],
    ["Completed", data.orderStatusCounts.completed],
    ["Cancelled", data.orderStatusCounts.cancelled],
  ];

  const orderStatusSheet = XLSX.utils.aoa_to_sheet(orderStatusData);

  orderStatusSheet["!cols"] = [{ wch: 18 }, { wch: 12 }];

  XLSX.utils.book_append_sheet(workbook, orderStatusSheet, "Order Status");

  // Top Products
  const topProductsData = [
    ["Product", "Units Sold", "Revenue"],
    ...data.topProducts.map((item) => [
      item.product.name,
      item.quantity,
      item.revenue,
    ]),
  ];

  const topProductsSheet = XLSX.utils.aoa_to_sheet(topProductsData);

  topProductsSheet["!cols"] = [{ wch: 28 }, { wch: 15 }, { wch: 18 }];

  XLSX.utils.book_append_sheet(workbook, topProductsSheet, "Top Products");

  // Top Customers
  const topCustomersData = [
    ["Customer", "Orders", "Revenue"],
    ...data.topCustomers.map((item) => [
      item.customer.name,
      item.orders,
      item.revenue,
    ]),
  ];

  const topCustomersSheet = XLSX.utils.aoa_to_sheet(topCustomersData);

  topCustomersSheet["!cols"] = [{ wch: 28 }, { wch: 15 }, { wch: 18 }];

  XLSX.utils.book_append_sheet(workbook, topCustomersSheet, "Top Customers");

  // Inventory
  const inventoryData = [
    ["Product", "Stock Remaining"],
    ...data.lowStockProducts.map((product) => [product.name, product.stock]),
  ];

  const inventorySheet = XLSX.utils.aoa_to_sheet(inventoryData);

  inventorySheet["!cols"] = [{ wch: 28 }, { wch: 18 }];

  XLSX.utils.book_append_sheet(workbook, inventorySheet, "Inventory Alerts");

  XLSX.writeFileXLSX(workbook, `business-report-${getFileDate()}.xlsx`);
}

export function exportReportToPDF(data: ReportExportData) {
  if (!pdfModule) {
    throw new Error("PDF export is not ready yet.");
  }

  const { jsPDF } = pdfModule;
  const doc = new jsPDF();

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const margin = 16;

  let y = 20;

  const periodLabel = getDateRangeLabel(data.dateRange);

  const addPageIfNeeded = (requiredHeight = 10) => {
    if (y + requiredHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  };

  const addSectionTitle = (title: string) => {
    addPageIfNeeded(15);

    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text(title, margin, y);

    y += 8;
  };

  const addRow = (
    label: string,
    value: string,
    valueX = pageWidth - margin,
  ) => {
    addPageIfNeeded(8);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(label, margin, y);

    doc.setFont("helvetica", "bold");
    doc.text(value, valueX, y, {
      align: "right",
    });

    y += 7;
  };

  // Header
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Business Performance Report", margin, y);

  y += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);

  doc.text(`Period: ${periodLabel}`, margin, y);

  y += 5;

  doc.text(`Generated: ${new Date().toLocaleString()}`, margin, y);

  doc.setTextColor(0);

  y += 12;

  // Summary
  addSectionTitle("Summary");

  addRow("Revenue", formatCurrency(data.totalRevenue));
  addRow("Orders", data.totalOrders.toLocaleString());
  addRow("Average Order Value", formatCurrency(data.averageOrderValue));
  addRow("Items Sold", data.totalItemsSold.toLocaleString());

  y += 5;

  // Order status
  addSectionTitle("Order Status");

  addRow("Pending", data.orderStatusCounts.pending.toLocaleString());

  addRow("Processing", data.orderStatusCounts.processing.toLocaleString());

  addRow("Completed", data.orderStatusCounts.completed.toLocaleString());

  addRow("Cancelled", data.orderStatusCounts.cancelled.toLocaleString());

  y += 5;

  // Top products
  addSectionTitle("Top Products");

  if (data.topProducts.length === 0) {
    addRow("No completed sales", "-");
  } else {
    data.topProducts.forEach((item) => {
      addPageIfNeeded(8);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");

      doc.text(`${item.product.name} (${item.quantity} units)`, margin, y);

      doc.setFont("helvetica", "bold");

      doc.text(formatCurrency(item.revenue), pageWidth - margin, y, {
        align: "right",
      });

      y += 7;
    });
  }

  y += 5;

  // Top customers
  addSectionTitle("Top Customers");

  if (data.topCustomers.length === 0) {
    addRow("No completed sales", "-");
  } else {
    data.topCustomers.forEach((item) => {
      addPageIfNeeded(8);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");

      doc.text(`${item.customer.name} (${item.orders} orders)`, margin, y);

      doc.setFont("helvetica", "bold");

      doc.text(formatCurrency(item.revenue), pageWidth - margin, y, {
        align: "right",
      });

      y += 7;
    });
  }

  y += 5;

  // Inventory
  addSectionTitle("Inventory Alerts");

  if (data.lowStockProducts.length === 0) {
    addRow("Low-stock products", "None");
  } else {
    data.lowStockProducts.forEach((product) => {
      addPageIfNeeded(8);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");

      doc.text(product.name, margin, y);

      doc.setFont("helvetica", "bold");

      doc.text(`${product.stock} left`, pageWidth - margin, y, {
        align: "right",
      });

      y += 7;
    });
  }

  // Footer
  const totalPages = doc.getNumberOfPages();

  for (let page = 1; page <= totalPages; page++) {
    doc.setPage(page);

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120);

    doc.text(`Business Report • ${periodLabel}`, margin, pageHeight - 10);

    doc.text(
      `Page ${page} of ${totalPages}`,
      pageWidth - margin,
      pageHeight - 10,
      {
        align: "right",
      },
    );
  }

  doc.setTextColor(0);

  doc.save(`business-report-${getFileDate()}.pdf`);
}
