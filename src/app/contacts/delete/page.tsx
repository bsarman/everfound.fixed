import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export default async function DeleteContactPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; forever?: string }>;
}) {
  const session = await requireAuth();
  if (!session?.memberId) redirect("/?error=Please+log+in");

  const params = await searchParams;
  const contactId = parseInt(params.id || "", 10);
  if (isNaN(contactId)) redirect("/contacts?message=Invalid+contact");

  const link = await prisma.memberContact.findFirst({
    where: { memberId: session.memberId, contactId },
    include: { contact: true },
  });

  if (!link) redirect("/contacts?message=Contact+not+found");

  const name = `${link.contact.firstName || ""} ${link.contact.lastName || ""}`.trim() || "Contact";

  // Soft delete (matches original behavior)
  await prisma.memberContact.update({
    where: { id: link.id },
    data: { status: "D" },
  });

  // Also remove from any folders belonging to this member
  const folders = await prisma.folder.findMany({
    where: { memberId: session.memberId },
    select: { id: true },
  });
  if (folders.length > 0) {
    await prisma.folderContact.deleteMany({
      where: {
        contactId,
        folderId: { in: folders.map((f) => f.id) },
      },
    });
  }

  redirect(`/contacts?message=${encodeURIComponent(`${name} has been deleted.`)}`);
}
