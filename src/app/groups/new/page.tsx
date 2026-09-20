import { redirect } from "next/navigation";
import Link from "next/link";
import ClassicLayout from "@/components/ClassicLayout";
import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export default async function NewGroupPage() {
  const session = await requireAuth();
  if (!session) redirect("/?error=Please+log+in");

  return (
    <ClassicLayout activeTab="groups" isLoggedIn firstName={session.firstName}>
      <p>
        <Link href="/groups">&lt;&lt; Return to groups</Link>
      </p>
      <h2 style={{ color: "#3333CC" }}>Create New Group</h2>

      <form action={createGroup}>
        <table cellPadding={6} cellSpacing={0}>
          <tbody>
            <tr>
              <td align="right"><b>Group Name:</b></td>
              <td>
                <input type="text" name="groupName" required style={{ width: 260 }} />
              </td>
            </tr>
            <tr>
              <td align="right"><b>Uses Year?</b></td>
              <td>
                <label>
                  <input type="checkbox" name="usesYear" value="1" defaultChecked /> Yes
                  (e.g. graduation year, class of …)
                </label>
              </td>
            </tr>
            <tr>
              <td align="right"><b>Year Header Label:</b></td>
              <td>
                <input type="text" name="yearHeader" defaultValue="Graduated" style={{ width: 160 }} />
              </td>
            </tr>
            <tr>
              <td align="right"><b>Anyone can invite?</b></td>
              <td>
                <label>
                  <input type="checkbox" name="allInvite" value="1" defaultChecked /> Yes
                </label>
              </td>
            </tr>
            <tr>
              <td></td>
              <td>
                <button type="submit" className="submit">Save Group</button>
                {"  "}
                <Link href="/groups">Cancel</Link>
              </td>
            </tr>
          </tbody>
        </table>
      </form>
    </ClassicLayout>
  );
}

async function createGroup(formData: FormData) {
  "use server";
  const session = await requireAuth();
  if (!session?.memberId) redirect("/?error=Please+log+in");

  const groupName = String(formData.get("groupName") || "").trim();
  if (!groupName) redirect("/groups/new?error=Name+required");

  const group = await prisma.group.create({
    data: {
      memberId: session.memberId,
      groupName,
      usesYearInd: formData.get("usesYear") === "1",
      yearHeader: String(formData.get("yearHeader") || "") || null,
      allInviteInd: formData.get("allInvite") === "1",
    },
  });

  redirect(`/groups/${group.id}?message=${encodeURIComponent(`Group "${groupName}" created. You can now invite members.`)}`);
}
