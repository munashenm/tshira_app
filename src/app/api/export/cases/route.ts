import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  const cases = await prisma.case.findMany({
    orderBy: { createdAt: 'desc' },
    include: { coordinator: true, consultant: true }
  });

  const headers = [
    'NYDA Reference', 'Client Name', 'SA ID', 'Output Type', 'Province',
    'Status', 'Coordinator', 'Consultant', 'Invoice Number', 'Amount (ZAR)',
    'Invoice Date', 'SLA Deadline', 'Created'
  ];

  const rows = cases.map(c => [
    c.nydaReference || '',
    c.clientName,
    c.clientIdNumber || '',
    c.outputType,
    c.province,
    c.status,
    c.coordinator?.name || '',
    c.consultant?.name || '',
    c.invoiceNumber || '',
    c.actualCost?.toFixed(2) || '',
    c.invoiceDate ? new Date(c.invoiceDate).toLocaleDateString() : '',
    c.slaDeadline ? new Date(c.slaDeadline).toLocaleDateString() : '',
    new Date(c.createdAt).toLocaleDateString()
  ]);

  const csv = [headers, ...rows]
    .map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="tshira-cases-${new Date().toISOString().split('T')[0]}.csv"`,
    },
  });
}
