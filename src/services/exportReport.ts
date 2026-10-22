import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import type { Response } from "express";
import { CONDITION_LABELS, USAGE_LABELS } from "./labels.js";

export interface ReportRow {
  inventoryNumber: string;
  name: string;
  type: { name: string };
  room: { name: string; department: { name: string } | null } | null;
  responsible: { fullName: string } | null;
  condition: string;
  usageStatus: string;
}

const HEADERS = ["Inventar raqam", "Nomi", "Turi", "Xona", "Bo'lim", "Mas'ul", "Holati", "Foydalanish"];
const cells = (r: ReportRow) => [
  r.inventoryNumber,
  r.name,
  r.type.name,
  r.room?.name ?? "-",
  r.room?.department?.name ?? "-",
  r.responsible?.fullName ?? "-",
  CONDITION_LABELS[r.condition] ?? r.condition,
  USAGE_LABELS[r.usageStatus] ?? r.usageStatus,
];

export async function sendXlsx(res: Response, rows: ReportRow[]) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Inventarizatsiya");
  ws.addRow(HEADERS).font = { bold: true };
  rows.forEach((r) => ws.addRow(cells(r)));
  ws.columns.forEach((c) => (c.width = 22));
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", 'attachment; filename="inventarizatsiya.xlsx"');
  await wb.xlsx.write(res);
  res.end();
}

export function sendPdf(res: Response, rows: ReportRow[]) {
  const doc = new PDFDocument({ size: "A4", layout: "landscape", margin: 30 });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", 'attachment; filename="inventarizatsiya.pdf"');
  doc.pipe(res);

  const widths = [90, 150, 70, 70, 90, 110, 80, 80];
  const draw = (vals: string[], y: number, bold = false) => {
    let x = 30;
    doc.font(bold ? "Helvetica-Bold" : "Helvetica").fontSize(8);
    vals.forEach((v, i) => {
      doc.text(v, x, y, { width: widths[i] - 4, height: 12, ellipsis: true, lineBreak: false });
      x += widths[i];
    });
  };

  doc.font("Helvetica-Bold").fontSize(14).text("InvenTrack - Inventarizatsiya hisoboti", 30, 30);
  doc.font("Helvetica").fontSize(9).text(`Sana: ${new Date().toISOString().slice(0, 10)}   Jami: ${rows.length}`, 30, 50);
  let y = 75;
  draw(HEADERS, y, true);
  y += 16;
  for (const r of rows) {
    if (y > 540) {
      doc.addPage();
      y = 30;
      draw(HEADERS, y, true);
      y += 16;
    }
    draw(cells(r), y);
    y += 15;
  }
  doc.end();
}
