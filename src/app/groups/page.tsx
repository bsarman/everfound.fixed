import { redirect } from "next/navigation";
import Link from "next/link";
import ClassicLayout from "@/components/ClassicLayout";
import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export default async function GroupsPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const session = await requireAuth();
  if (!session) redirect("/?error=Please+log+in");

  const params = await searchParams;

  const groups = await prisma.group.findMany({
    where: { memberId: session.memberId },
    include: { _count: { select: { members: true } } },
    orderBy: { groupName: "asc" },
  });

  return (
    <ClassicLayout activeTab="groups" isLoggedIn firstName={session.firstName}>
      <h2 style={{ color: "#3333CC", marginTop: 0 }}>My Groups</h2>

      {params.message && <div className="ef-message">{params.message}</div>}

      <p>
        <Link href="/groups/new" className="submit" style={{ textDecoration: "none", padding: "4px 10px" }}>
          + Create New Group
        </Link>
      </p>

      <table width="100%" cellPadding={5} cellSpacing={1} style={{ backgroundColor: "#CCCCCC" }}>
        <thead>
          <tr style={{ backgroundColor: "#3333CC", color: "white" }}>
            <th align="left">Group Name</th>
            <th align="center">Members / Invites</th>
            <th align="center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {groups.length === 0 ? (
            <tr style={{ backgroundColor: "white" }}>
              <td colSpan={3} align="center" style={{ padding: 20 }}>
                You have no groups yet.{" "}
                <Link href="/groups/new">Create your first group</Link>
              </td>
            </tr>
          ) : (
            groups.map((g, idx) => (
              <tr key={g.id} style={{ backgroundColor: idx % 2 === 0 ? "#FFFFFF" : "#CCFFCC" }}>
                <td>
                  <b>{g.groupName}</b>
                  {g.usesYearInd && g.yearHeader && (
                    <span style={{ color: "#666", fontSize: 11 }}> ({g.yearHeader})</span>
                  )}
                </td>
                <td align="center">{g._count.members}</td>
                <td align="center">
                  <Link href={`/groups/${g.id}`}>Edit / Invite</Link>
                  {" | "}
                  <Link href={`/groups/delete?id=${g.id}`}>Delete</Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </ClassicLayout>
  );
}
