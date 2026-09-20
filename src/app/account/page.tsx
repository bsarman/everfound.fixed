import { redirect } from "next/navigation";
import Link from "next/link";
import ClassicLayout from "@/components/ClassicLayout";
import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth";

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const session = await requireAuth();
  if (!session) redirect("/?error=Please+log+in");

  const params = await searchParams;

  const member = await prisma.member.findUnique({
    where: { id: session.memberId },
  });
  if (!member) redirect("/?error=Account+not+found");

  return (
    <ClassicLayout activeTab="preferences" isLoggedIn firstName={session.firstName}>
      <h2 style={{ color: "#3333CC" }}>Account Preferences</h2>

      {params.message && <div className="ef-message">{params.message}</div>}
      {params.error && <div className="ef-error">{params.error}</div>}

      <form action={updateAccount}>
        <table cellPadding={6} cellSpacing={0}>
          <tbody>
            <tr>
              <td align="right"><b>Login Email:</b></td>
              <td>
                <input
                  type="email"
                  name="loginEmail"
                  defaultValue={member.loginEmail}
                  required
                  style={{ width: 260 }}
                />
              </td>
            </tr>
            <tr>
              <td colSpan={2}><hr /> <b>Change Password</b> (leave blank to keep current)</td>
            </tr>
            <tr>
              <td align="right">Current Password:</td>
              <td>
                <input type="password" name="oldPassword" style={{ width: 180 }} />
              </td>
            </tr>
            <tr>
              <td align="right">New Password:</td>
              <td>
                <input type="password" name="newPassword" minLength={4} style={{ width: 180 }} />
              </td>
            </tr>
            <tr>
              <td align="right">Confirm New Password:</td>
              <td>
                <input type="password" name="newPassword2" minLength={4} style={{ width: 180 }} />
              </td>
            </tr>
            <tr>
              <td align="right"><b>Rows per page:</b></td>
              <td>
                <select name="rowsPerPage" defaultValue={member.defaultRowsPerPage}>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
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

async function updateAccount(formData: FormData) {
  "use server";
  const session = await requireAuth();
  if (!session?.memberId) redirect("/?error=Please+log+in");

  const member = await prisma.member.findUnique({ where: { id: session.memberId } });
  if (!member) redirect("/account?error=Account+not+found");

  const loginEmail = String(formData.get("loginEmail") || "").trim().toLowerCase();
  const oldPassword = String(formData.get("oldPassword") || "");
  const newPassword = String(formData.get("newPassword") || "");
  const newPassword2 = String(formData.get("newPassword2") || "");
  const rowsPerPage = parseInt(String(formData.get("rowsPerPage") || "25"), 10);

  if (newPassword || newPassword2) {
    if (!oldPassword) {
      redirect("/account?error=Current+password+required+to+change+password");
    }
    const valid = await verifyPassword(oldPassword, member.passwordHash);
    if (!valid) {
      redirect("/account?error=Current+password+is+incorrect");
    }
    if (newPassword.length < 4 || newPassword !== newPassword2) {
      redirect("/account?error=New+password+must+be+at+least+4+characters+and+match");
    }
    const passwordHash = await hashPassword(newPassword);
    await prisma.member.update({
      where: { id: member.id },
      data: { loginEmail, passwordHash, defaultRowsPerPage: rowsPerPage },
    });
  } else {
    await prisma.member.update({
      where: { id: member.id },
      data: { loginEmail, defaultRowsPerPage: rowsPerPage },
    });
  }

  // Refresh session rows preference
  session.rowsPerPage = rowsPerPage;
  await session.save();

  redirect("/account?message=Account+updated+successfully.");
}
