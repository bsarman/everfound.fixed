import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import ClassicLayout from "@/components/ClassicLayout";
import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export default async function GroupDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ message?: string }>;
}) {
  const session = await requireAuth();
  if (!session) redirect("/?error=Please+log+in");

  const { id } = await params;
  const groupId = parseInt(id, 10);
  if (isNaN(groupId)) notFound();

  const group = await prisma.group.findFirst({
    where: { id: groupId, memberId: session.memberId },
    include: {
      members: { orderBy: { lastName: "asc" } },
    },
  });
  if (!group) notFound();

  const paramsMsg = await searchParams;

  // Contacts the member already has (for quick invite)
  const myContacts = await prisma.memberContact.findMany({
    where: { memberId: session.memberId, status: "A" },
    include: { contact: true },
    orderBy: { contact: { lastName: "asc" } },
    take: 100,
  });

  return (
    <ClassicLayout activeTab="groups" isLoggedIn firstName={session.firstName}>
      <p>
        <Link href="/groups">&lt;&lt; Return to groups</Link>
      </p>
      <h2 style={{ color: "#3333CC" }}>{group.groupName}</h2>

      {paramsMsg.message && <div className="ef-message">{paramsMsg.message}</div>}

      {/* Edit properties */}
      <form action={updateGroup.bind(null, groupId)} style={{ marginBottom: 24 }}>
        <table cellPadding={5} cellSpacing={0} style={{ backgroundColor: "#F5F5F5", padding: 8 }}>
          <tbody>
            <tr>
              <td align="right"><b>Group Name:</b></td>
              <td>
                <input type="text" name="groupName" defaultValue={group.groupName} required style={{ width: 240 }} />
              </td>
            </tr>
            <tr>
              <td align="right"><b>Uses Year?</b></td>
              <td>
                <label>
                  <input type="checkbox" name="usesYear" value="1" defaultChecked={group.usesYearInd} /> Yes
                </label>
              </td>
            </tr>
            <tr>
              <td align="right"><b>Year Header:</b></td>
              <td>
                <input type="text" name="yearHeader" defaultValue={group.yearHeader || ""} style={{ width: 140 }} />
              </td>
            </tr>
            <tr>
              <td></td>
              <td>
                <button type="submit" className="submit">Save Properties</button>
              </td>
            </tr>
          </tbody>
        </table>
      </form>

      {/* Invite form */}
      <h3 style={{ color: "#3333CC" }}>Invite People</h3>
      <form action={inviteToGroup.bind(null, groupId)} style={{ marginBottom: 20 }}>
        <table cellPadding={5} cellSpacing={0}>
          <tbody>
            <tr>
              <td align="right">From my contacts:</td>
              <td>
                <select name="contactId" style={{ width: 260 }}>
                  <option value="">— Select a contact —</option>
                  {myContacts.map((mc) => (
                    <option key={mc.contactId} value={mc.contactId}>
                      {mc.contact.lastName}, {mc.contact.firstName}
                      {mc.contact.email ? ` <${mc.contact.email}>` : ""}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
            <tr>
              <td colSpan={2} align="center" style={{ fontSize: 11, color: "#666" }}>
                — or enter manually —
              </td>
            </tr>
            <tr>
              <td align="right">First Name:</td>
              <td><input type="text" name="firstName" style={{ width: 160 }} /></td>
            </tr>
            <tr>
              <td align="right">Last Name:</td>
              <td><input type="text" name="lastName" style={{ width: 160 }} /></td>
            </tr>
            <tr>
              <td align="right">Email:</td>
              <td><input type="email" name="email" style={{ width: 220 }} /></td>
            </tr>
            {group.usesYearInd && (
              <tr>
                <td align="right">{group.yearHeader || "Year"}:</td>
                <td><input type="text" name="yearValue" style={{ width: 80 }} /></td>
              </tr>
            )}
            <tr>
              <td></td>
              <td>
                <button type="submit" className="submit">Send Invite</button>
              </td>
            </tr>
          </tbody>
        </table>
      </form>

      {/* Current members / invites */}
      <h3 style={{ color: "#3333CC" }}>Members & Invites ({group.members.length})</h3>
      <table width="100%" cellPadding={4} cellSpacing={1} style={{ backgroundColor: "#CCCCCC" }}>
        <thead>
          <tr style={{ backgroundColor: "#3333CC", color: "white" }}>
            <th align="left">Name</th>
            <th align="left">Email</th>
            {group.usesYearInd && <th align="center">{group.yearHeader || "Year"}</th>}
            <th align="center">Status</th>
          </tr>
        </thead>
        <tbody>
          {group.members.length === 0 ? (
            <tr style={{ backgroundColor: "white" }}>
              <td colSpan={group.usesYearInd ? 4 : 3} align="center">
                No one invited yet.
              </td>
            </tr>
          ) : (
            group.members.map((m, idx) => (
              <tr key={m.id} style={{ backgroundColor: idx % 2 === 0 ? "#FFFFFF" : "#CCFFCC" }}>
                <td>
                  {m.firstName} {m.lastName}
                </td>
                <td>{m.email || "—"}</td>
                {group.usesYearInd && <td align="center">{m.yearValue || "—"}</td>}
                <td align="center" style={{ textTransform: "capitalize" }}>
                  {m.status}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </ClassicLayout>
  );
}

async function updateGroup(groupId: number, formData: FormData) {
  "use server";
  const session = await requireAuth();
  if (!session?.memberId) redirect("/?error=Please+log+in");

  const group = await prisma.group.findFirst({
    where: { id: groupId, memberId: session.memberId },
  });
  if (!group) redirect("/groups");

  await prisma.group.update({
    where: { id: groupId },
    data: {
      groupName: String(formData.get("groupName") || "").trim(),
      usesYearInd: formData.get("usesYear") === "1",
      yearHeader: String(formData.get("yearHeader") || "") || null,
    },
  });

  redirect(`/groups/${groupId}?message=Group+properties+saved.`);
}

async function inviteToGroup(groupId: number, formData: FormData) {
  "use server";
  const session = await requireAuth();
  if (!session?.memberId) redirect("/?error=Please+log+in");

  const group = await prisma.group.findFirst({
    where: { id: groupId, memberId: session.memberId },
  });
  if (!group) redirect("/groups");

  const contactIdRaw = formData.get("contactId");
  const contactId = contactIdRaw ? parseInt(String(contactIdRaw), 10) : null;

  let firstName = String(formData.get("firstName") || "").trim();
  let lastName = String(formData.get("lastName") || "").trim();
  let email = String(formData.get("email") || "").trim() || null;
  const yearValue = String(formData.get("yearValue") || "").trim() || null;

  if (contactId && !isNaN(contactId)) {
    const mc = await prisma.memberContact.findFirst({
      where: { memberId: session.memberId, contactId, status: "A" },
      include: { contact: true },
    });
    if (mc) {
      firstName = mc.contact.firstName || firstName;
      lastName = mc.contact.lastName || lastName;
      email = mc.contact.email || email;
    }
  }

  if (!firstName && !lastName && !email) {
    redirect(`/groups/${groupId}?message=Please+provide+a+name+or+email`);
  }

  await prisma.groupMember.create({
    data: {
      groupId,
      contactId: contactId && !isNaN(contactId) ? contactId : null,
      firstName: firstName || null,
      lastName: lastName || null,
      email,
      yearValue,
      status: "invited",
    },
  });

  // In a real system we would send an email here (Resend / Postmark)
  redirect(
    `/groups/${groupId}?message=${encodeURIComponent(
      `Invitation recorded for ${firstName} ${lastName || email || "guest"}. (Email sending can be wired up later.)`
    )}`
  );
}
