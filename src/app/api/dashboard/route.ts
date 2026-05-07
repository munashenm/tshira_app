import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { Role, Province } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role') as Role;
    const userId = searchParams.get('userId');
    const province = searchParams.get('province') as Province;

    // 1. Basic Stats
    const stats = await prisma.case.groupBy({
      by: ['status'],
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
        slaDeadline: { lte: twoDays, gt: new Date() },
        status: { notIn: ['CLOSED', 'PAID'] }
      }
    });

    // 3. Overdue
    const overdueCount = await prisma.case.count({
      where: {
        slaDeadline: { lt: new Date() },
        status: { notIn: ['CLOSED', 'PAID'] }
      }
    });

    // 4. Provincial Distribution
    const provinceStats = await prisma.case.groupBy({
      by: ['province'],
      _count: { id: true }
    });

    // 5. Global Activity
    const recentActivity = await prisma.caseHistory.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        case: { select: { clientName: true, id: true } },
        user: { select: { name: true } }
      }
    });

    // 6. Role-Specific Priority Tasks
    let myTasksWhere: any = { status: { notIn: ['CLOSED', 'PAID'] } };
    
    if (role === 'PROVINCIAL_COORDINATOR' && province) {
      myTasksWhere.province = province;
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

    return NextResponse.json({
      totalCases: await prisma.case.count(),
      overdueCount,
      approachingSlaCount,
      statusCounts,
      provinceStats,
      recentActivity,
      myTasks
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
