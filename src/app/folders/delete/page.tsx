import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export default async function DeleteFolderPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const session = await requireAuth();
  if (!session?.memberId) redirect("/?error=Please+log+in");

  const params = await searchParams;
  const folderId = parseInt(params.id || "", 10);
  if (isNaN(folderId)) redirect("/folders");

  const folder = await prisma.folder.findFirst({
    where: { id: folderId, memberId: session.memberId },
  });
  if (!folder) redirect("/folders?message=Folder+not+found");

  await prisma.folder.delete({ where: { id: folderId } });

  redirect(`/folders?message=${encodeURIComponent(`Folder "${folder.name}" deleted.`)}`);
}
