import { redirect } from "next/navigation";
import Link from "next/link";
import ClassicLayout from "@/components/ClassicLayout";
import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export default async function FoldersPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const session = await requireAuth();
  if (!session) redirect("/?error=Please+log+in");

  const params = await searchParams;
  const folders = await prisma.folder.findMany({
    where: { memberId: session.memberId },
    include: { _count: { select: { contacts: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <ClassicLayout activeTab="contacts" isLoggedIn firstName={session.firstName}>
      <p>
        <Link href="/contacts">&lt;&lt; Return to contacts</Link>
      </p>
      <h2 style={{ color: "#3333CC" }}>Manage Folders</h2>

      {params.message && <div className="ef-message">{params.message}</div>}

      <form action={createFolder} style={{ marginBottom: 20 }}>
        <b>New folder name:</b>{" "}
        <input type="text" name="name" required style={{ width: 200 }} />{" "}
        <button type="submit" className="submit">Create Folder</button>
      </form>

      <table width="100%" cellPadding={5} cellSpacing={1} style={{ backgroundColor: "#CCCCCC", maxWidth: 500 }}>
        <thead>
          <tr style={{ backgroundColor: "#3333CC", color: "white" }}>
            <th align="left">Folder Name</th>
            <th align="center">Contacts</th>
            <th align="center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {folders.length === 0 ? (
            <tr style={{ backgroundColor: "white" }}>
              <td colSpan={3} align="center">No folders yet.</td>
            </tr>
          ) : (
            folders.map((f, idx) => (
              <tr key={f.id} style={{ backgroundColor: idx % 2 === 0 ? "#FFFFFF" : "#CCFFCC" }}>
                <td>{f.name}</td>
                <td align="center">{f._count.contacts}</td>
                <td align="center">
                  <Link href={`/contacts?folder_id=${f.id}`}>View</Link>
                  {" | "}
                  <Link href={`/folders/delete?id=${f.id}`}>Delete</Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </ClassicLayout>
  );
}

async function createFolder(formData: FormData) {
  "use server";
  const session = await requireAuth();
  if (!session?.memberId) redirect("/?error=Please+log+in");

  const name = String(formData.get("name") || "").trim();
  if (!name) redirect("/folders?message=Folder+name+required");

  await prisma.folder.create({
    data: { memberId: session.memberId, name },
  });

  redirect(`/folders?message=${encodeURIComponent(`Folder "${name}" created.`)}`);
}
