import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export default async function DeleteGroupPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const session = await requireAuth();
  if (!session?.memberId) redirect("/?error=Please+log+in");

  const params = await searchParams;
  const groupId = parseInt(params.id || "", 10);
  if (isNaN(groupId)) redirect("/groups");

  const group = await prisma.group.findFirst({
    where: { id: groupId, memberId: session.memberId },
  });
  if (!group) redirect("/groups?message=Group+not+found");

  await prisma.group.delete({ where: { id: groupId } });

  redirect(`/groups?message=${encodeURIComponent(`Group "${group.groupName}" has been deleted.`)}`);
}
