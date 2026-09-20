import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import ClassicLayout from "@/components/ClassicLayout";
import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export default async function EditContactPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireAuth();
  if (!session) redirect("/?error=Please+log+in");

  const { id } = await params;
  const contactId = parseInt(id, 10);
  if (isNaN(contactId)) notFound();

  // Ensure this contact belongs to the logged-in member
  const link = await prisma.memberContact.findFirst({
    where: {
      memberId: session.memberId,
      contactId,
      status: "A",
    },
    include: { contact: true },
  });

  if (!link) notFound();
  const c = link.contact;

  return (
    <ClassicLayout activeTab="contacts" isLoggedIn firstName={session.firstName}>
      <p>
        <Link href="/contacts">&lt;&lt; Return to contacts</Link>
      </p>
      <h2 style={{ color: "#3333CC" }}>
        Edit Contact: {c.firstName} {c.lastName}
      </h2>

      <form action={updateContact.bind(null, contactId)}>
        <table cellPadding={6} cellSpacing={0} style={{ maxWidth: 600 }}>
          <tbody>
            <tr>
              <td align="right"><b>First Name:</b></td>
              <td>
                <input type="text" name="firstName" required defaultValue={c.firstName || ""} style={{ width: 220 }} />
              </td>
            </tr>
            <tr>
              <td align="right"><b>Last Name:</b></td>
              <td>
                <input type="text" name="lastName" required defaultValue={c.lastName || ""} style={{ width: 220 }} />
              </td>
            </tr>
            <tr>
              <td align="right"><b>Nickname:</b></td>
              <td>
                <input type="text" name="nickName" defaultValue={c.nickName || ""} style={{ width: 220 }} />
              </td>
            </tr>
            <tr>
              <td align="right"><b>Email:</b></td>
              <td>
                <input type="email" name="email" defaultValue={c.email || ""} style={{ width: 220 }} />
              </td>
            </tr>
            <tr>
              <td align="right"><b>Home Phone:</b></td>
              <td>
                <input type="text" name="phoneHome" defaultValue={c.phoneHome || ""} style={{ width: 220 }} />
              </td>
            </tr>
            <tr>
              <td align="right"><b>Mobile:</b></td>
              <td>
                <input type="text" name="phoneMobile" defaultValue={c.phoneMobile || ""} style={{ width: 220 }} />
              </td>
            </tr>
            <tr>
              <td colSpan={2}><hr /> <b>Personal Address</b></td>
            </tr>
            <tr>
              <td align="right">Street 1:</td>
              <td>
                <input type="text" name="pStreet1" defaultValue={c.pStreet1 || ""} style={{ width: 280 }} />
              </td>
            </tr>
            <tr>
              <td align="right">Street 2:</td>
              <td>
                <input type="text" name="pStreet2" defaultValue={c.pStreet2 || ""} style={{ width: 280 }} />
              </td>
            </tr>
            <tr>
              <td align="right">City:</td>
              <td>
                <input type="text" name="pCity" defaultValue={c.pCity || ""} style={{ width: 180 }} />
              </td>
            </tr>
            <tr>
              <td align="right">State:</td>
              <td>
                <input type="text" name="pState" maxLength={2} defaultValue={c.pState || ""} style={{ width: 40 }} />
                {" "}Zip:{" "}
                <input type="text" name="pZip" defaultValue={c.pZip || ""} style={{ width: 80 }} />
              </td>
            </tr>
            <tr>
              <td colSpan={2}><hr /> <b>Notes</b></td>
            </tr>
            <tr>
              <td align="right" valign="top">Notes:</td>
              <td>
                <textarea name="notes" rows={4} defaultValue={c.notes || ""} style={{ width: 280 }} />
              </td>
            </tr>
            <tr>
              <td></td>
              <td>
                <button type="submit" className="submit">Save Changes</button>
                {"  "}
                <Link href="/contacts">Cancel</Link>
              </td>
            </tr>
          </tbody>
        </table>
      </form>
    </ClassicLayout>
  );
}

async function updateContact(contactId: number, formData: FormData) {
  "use server";
  const session = await requireAuth();
  if (!session?.memberId) redirect("/?error=Please+log+in");

  // Verify ownership
  const link = await prisma.memberContact.findFirst({
    where: { memberId: session.memberId, contactId, status: "A" },
  });
  if (!link) redirect("/contacts?message=Contact+not+found");

  await prisma.contact.update({
    where: { id: contactId },
    data: {
      firstName: String(formData.get("firstName") || "").trim() || null,
      lastName: String(formData.get("lastName") || "").trim() || null,
      nickName: String(formData.get("nickName") || "") || null,
      email: String(formData.get("email") || "") || null,
      phoneHome: String(formData.get("phoneHome") || "") || null,
      phoneMobile: String(formData.get("phoneMobile") || "") || null,
      pStreet1: String(formData.get("pStreet1") || "") || null,
      pStreet2: String(formData.get("pStreet2") || "") || null,
      pCity: String(formData.get("pCity") || "") || null,
      pState: String(formData.get("pState") || "") || null,
      pZip: String(formData.get("pZip") || "") || null,
      notes: String(formData.get("notes") || "") || null,
    },
  });

  redirect("/contacts?message=Contact+updated.");
}
