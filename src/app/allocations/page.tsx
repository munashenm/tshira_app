import { prisma } from "@/lib/db";
import { Role } from "@prisma/client";
import { Users, Briefcase, MapPin, Search, AlertCircle, Clock } from "lucide-react";
import Link from "next/link";
import BulkAssignmentModal from "@/components/BulkAssignmentModal";
import AllocationClient from "./AllocationClient";

export const dynamic = 'force-dynamic';

export default async function WorkAllocationPage() {
  const cases = await prisma.case.findMany({
    include: {
      coordinator: true,
      dco: true,
      consultant: true,
      reviewer: true,
    },
    orderBy: { createdAt: 'desc' }
  });

  const users = await prisma.user.findMany({
    orderBy: { name: 'asc' }
  });

  return <AllocationClient initialCases={cases} users={users} />;
}
