import { redirect } from "next/navigation";
import Link from "next/link";
import ClassicLayout from "@/components/ClassicLayout";
import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ folder_id?: string; message?: string }>;
}) {
  const session = await requireAuth();
  if (!session) redirect("/?error=Please+log+in");

  const params = await searchParams;
  const message = params.message;
  const folderId = params.folder_id ? parseInt(params.folder_id, 10) : null;

  const folders = await prisma.folder.findMany({
    where: { memberId: session.memberId },
    orderBy: { name: "asc" },
  });

  let memberContacts: { id: number; contact: {
    id: number;
    firstName: string | null;
    lastName: string | null;
    nickName: string | null;
    email: string | null;
    pCity: string | null;
  } }[];

  if (folderId && !isNaN(folderId)) {
    const folderContacts = await prisma.folderContact.findMany({
      where: {
        folderId,
        folder: { memberId: session.memberId },
      },
      include: { contact: true },
      take: session.rowsPerPage || 25,
    });
    memberContacts = folderContacts.map((fc) => ({
      id: fc.id,
      contact: fc.contact,
    }));
  } else {
    const rows = await prisma.memberContact.findMany({
      where: {
        memberId: session.memberId,
        status: "A",
      },
      include: { contact: true },
      take: session.rowsPerPage || 25,
      orderBy: { contact: { lastName: "asc" } },
    });
    memberContacts = rows;
  }

  const currentFolderName =
    folderId && folders.find((f) => f.id === folderId)?.name;

  return (
    <ClassicLayout activeTab="contacts" isLoggedIn firstName={session.firstName}>
      <h2 style={{ color: "#3333CC", marginTop: 0 }}>
        My Contacts
        {currentFolderName ? ` — ${currentFolderName}` : ""}
      </h2>

      {message && <div className="ef-message">{message}</div>}

      <table width="100%" cellPadding={4} cellSpacing={0} style={{ marginBottom: 16 }}>
        <tbody>
          <tr>
            <td>
              <Link
                href="/contacts/new"
                className="submit"
                style={{ textDecoration: "none", padding: "4px 10px" }}
              >
                + Add Contact
              </Link>
              {"  "}
              <Link href="/folders">Manage Folders</Link>
            </td>
            <td align="right" style={{ fontSize: 12 }}>
              Folders:{" "}
              <Link href="/contacts" style={{ fontWeight: !folderId ? "bold" : "normal" }}>
                All
              </Link>
              {folders.map((f) => (
                <span key={f.id}>
                  {" | "}
                  <Link
                    href={`/contacts?folder_id=${f.id}`}
                    style={{ fontWeight: folderId === f.id ? "bold" : "normal" }}
                  >
                    {f.name}
                  </Link>
                </span>
              ))}
            </td>
          </tr>
        </tbody>
      </table>

      <table width="100%" cellPadding={4} cellSpacing={1} style={{ backgroundColor: "#CCCCCC" }}>
        <thead>
          <tr style={{ backgroundColor: "#3333CC", color: "white" }}>
            <th align="left">Name</th>
            <th align="left">Email</th>
            <th align="left">City</th>
            <th align="center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {memberContacts.length === 0 ? (
            <tr style={{ backgroundColor: "white" }}>
              <td colSpan={4} align="center" style={{ padding: 20 }}>
                No contacts yet. <Link href="/contacts/new">Add your first contact</Link>
              </td>
            </tr>
          ) : (
            memberContacts.map((mc, idx) => (
              <tr
                key={mc.id}
                style={{ backgroundColor: idx % 2 === 0 ? "#FFFFFF" : "#CCFFCC" }}
              >
                <td>
                  {mc.contact.firstName} {mc.contact.lastName}
                  {mc.contact.nickName && (
                    <span style={{ color: "#666" }}> ({mc.contact.nickName})</span>
                  )}
                </td>
                <td>{mc.contact.email || "—"}</td>
                <td>{mc.contact.pCity || "—"}</td>
                <td align="center">
                  <Link href={`/contacts/${mc.contact.id}`}>Edit</Link>
                  {" | "}
                  <Link href={`/contacts/delete?id=${mc.contact.id}`}>Delete</Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </ClassicLayout>
  );
}
