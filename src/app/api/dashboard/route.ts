import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { Role, Province } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role') as Role;
    const userId = searchParams.get('userId');
    const province = searchParams.get('province') as Province;

    const baseWhere: any = {};
    if ((role === 'PROVINCIAL_COORDINATOR' || role === 'DATA_COLLECTION_OFFICER') && province) {
      baseWhere.province = province;
    }

    // 1. Basic Stats
    const stats = await prisma.case.groupBy({
      by: ['status'],
      where: baseWhere,
      _count: { id: true }
    });

    const statusCounts = stats.reduce((acc, curr) => {
      acc[curr.status] = curr._count.id;
      return acc;
    }, {} as Record<string, number>);

    // 2. SLA Approaching
    const twoDays = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    const approachingSlaCount = await prisma.case.count({
      where: {
        ...baseWhere,
        slaDeadline: { lte: twoDays, gt: new Date() },
        status: { notIn: ['CLOSED', 'PAID'] }
      }
    });

    // 3. Overdue
    const overdueCount = await prisma.case.count({
      where: {
        ...baseWhere,
        slaDeadline: { lt: new Date() },
        status: { notIn: ['CLOSED', 'PAID'] }
      }
    });

    // 4. Provincial Distribution
    const provinceStats = await prisma.case.groupBy({
      by: ['province'],
      where: baseWhere,
      _count: { id: true }
    });

    // 5. Global Activity
    const recentActivity = await prisma.caseHistory.findMany({
      where: { case: baseWhere },
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        case: { select: { clientName: true, id: true } },
        user: { select: { name: true } }
      }
    });

    // 6. Role-Specific Priority Tasks
    let myTasksWhere: any = { ...baseWhere, status: { notIn: ['CLOSED', 'PAID'] } };
    
    if (role === 'PROVINCIAL_COORDINATOR' && province) {
      myTasksWhere.coordinatorId = null; // High priority: Unassigned in my province
    } else if (role === 'DATA_COLLECTION_OFFICER' && userId) {
      myTasksWhere.dcoId = userId;
    } else if (role === 'BUSINESS_CONSULTANT' && userId) {
      myTasksWhere.consultantId = userId;
    } else if (role === 'REVIEWER' && userId) {
      myTasksWhere.reviewerId = userId;
    } else if (role === 'FINANCE') {
      myTasksWhere.status = 'READY_FOR_INVOICING';
    }

    const myTasks = await prisma.case.findMany({
      where: myTasksWhere,
      take: 5,
      orderBy: { createdAt: 'desc' }
    });

    // 7. Advanced Metrics
    const pendingReviews = await prisma.case.count({
      where: { ...baseWhere, status: { in: ['PROVINCIAL_QUALITY_CHECK', 'SUBMITTED_FOR_REVIEW'] } }
    });

    const pendingDataCollection = await prisma.case.count({
      where: { ...baseWhere, status: { in: ['ASSIGNED_FOR_DATA_COLLECTION', 'DATA_COLLECTION_IN_PROGRESS'] } }
    });

    const readyForInvoicing = await prisma.case.count({
      where: { ...baseWhere, status: 'READY_FOR_INVOICING' }
    });

    return NextResponse.json({
      totalCases: await prisma.case.count({ where: baseWhere }),
      overdueCount,
      approachingSlaCount,
      statusCounts,
      provinceStats,
      recentActivity,
      myTasks,
      metrics: {
        pendingReviews,
        pendingDataCollection,
        readyForInvoicing
      }
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
