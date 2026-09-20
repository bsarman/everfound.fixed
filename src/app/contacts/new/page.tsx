import { redirect } from "next/navigation";
import Link from "next/link";
import ClassicLayout from "@/components/ClassicLayout";
import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export default async function NewContactPage() {
  const session = await requireAuth();
  if (!session) redirect("/?error=Please+log+in");

  return (
    <ClassicLayout activeTab="contacts" isLoggedIn firstName={session.firstName}>
      <p>
        <Link href="/contacts">&lt;&lt; Return to contacts</Link>
      </p>
      <h2 style={{ color: "#3333CC" }}>Add New Contact</h2>

      <form action={createContact}>
        <table cellPadding={6} cellSpacing={0} style={{ maxWidth: 600 }}>
          <tbody>
            <tr>
              <td align="right"><b>First Name:</b></td>
              <td><input type="text" name="firstName" required style={{ width: 220 }} /></td>
            </tr>
            <tr>
              <td align="right"><b>Last Name:</b></td>
              <td><input type="text" name="lastName" required style={{ width: 220 }} /></td>
            </tr>
            <tr>
              <td align="right"><b>Nickname:</b></td>
              <td><input type="text" name="nickName" style={{ width: 220 }} /></td>
            </tr>
            <tr>
              <td align="right"><b>Email:</b></td>
              <td><input type="email" name="email" style={{ width: 220 }} /></td>
            </tr>
            <tr>
              <td align="right"><b>Home Phone:</b></td>
              <td><input type="text" name="phoneHome" style={{ width: 220 }} /></td>
            </tr>
            <tr>
              <td align="right"><b>Mobile:</b></td>
              <td><input type="text" name="phoneMobile" style={{ width: 220 }} /></td>
            </tr>
            <tr>
              <td colSpan={2}><hr /> <b>Personal Address</b></td>
            </tr>
            <tr>
              <td align="right">Street 1:</td>
              <td><input type="text" name="pStreet1" style={{ width: 280 }} /></td>
            </tr>
            <tr>
              <td align="right">Street 2:</td>
              <td><input type="text" name="pStreet2" style={{ width: 280 }} /></td>
            </tr>
            <tr>
              <td align="right">City:</td>
              <td><input type="text" name="pCity" style={{ width: 180 }} /></td>
            </tr>
            <tr>
              <td align="right">State:</td>
              <td><input type="text" name="pState" maxLength={2} style={{ width: 40 }} /> &nbsp; Zip: <input type="text" name="pZip" style={{ width: 80 }} /></td>
            </tr>
            <tr>
              <td colSpan={2}><hr /> <b>Notes</b></td>
            </tr>
            <tr>
              <td align="right" valign="top">Notes:</td>
              <td><textarea name="notes" rows={4} style={{ width: 280 }} /></td>
            </tr>
            <tr>
              <td></td>
              <td>
                <button type="submit" className="submit">Save Contact</button>
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

async function createContact(formData: FormData) {
  "use server";
  const session = await requireAuth();
  if (!session?.memberId) redirect("/?error=Please+log+in");

  const firstName = String(formData.get("firstName") || "").trim();
  const lastName = String(formData.get("lastName") || "").trim();
  if (!firstName || !lastName) {
    redirect("/contacts/new?error=First+and+Last+name+required");
  }

  const contact = await prisma.contact.create({
    data: {
      contactType: "M",
      firstName,
      lastName,
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

  await prisma.memberContact.create({
    data: {
      memberId: session.memberId,
      contactId: contact.id,
      status: "A",
    },
  });

  redirect(`/contacts?message=${encodeURIComponent(`${firstName} ${lastName} has been added.`)}`);
}
