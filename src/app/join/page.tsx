import { redirect } from "next/navigation";
import Link from "next/link";
import ClassicLayout from "@/components/ClassicLayout";
import { getSession } from "@/lib/session";
import { hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function JoinPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getSession();
  if (session.isLoggedIn) redirect("/contacts");

  const params = await searchParams;

  return (
    <ClassicLayout isLoggedIn={false}>
      <h2 style={{ color: "#3333CC" }}>Join EverFound — Free!</h2>

      <p>
        We&apos;re glad you&apos;ve decided to become a member. You can use EverFound to keep track of
        your friends, groups, and colleagues, and (optionally) be notified of vehicle recalls.
      </p>
      <p>
        <b>It&apos;s an easy process:</b> Fill in the information below. A correct email address is very
        important.
      </p>

      {params.error && <div className="ef-error">{params.error}</div>}

      <form action={register}>
        <table cellPadding={6} cellSpacing={0} style={{ maxWidth: 520 }}>
          <tbody>
            <tr>
              <td align="right"><b>First Name:</b></td>
              <td>
                <input type="text" name="firstName" required maxLength={40} style={{ width: 220 }} />
              </td>
            </tr>
            <tr>
              <td align="right"><b>Last Name:</b></td>
              <td>
                <input type="text" name="lastName" required maxLength={40} style={{ width: 220 }} />
              </td>
            </tr>
            <tr>
              <td align="right"><b>Email (login):</b></td>
              <td>
                <input type="email" name="email" required style={{ width: 260 }} />
              </td>
            </tr>
            <tr>
              <td align="right"><b>Password:</b></td>
              <td>
                <input type="password" name="password" required minLength={4} style={{ width: 180 }} />
                <span style={{ fontSize: 11, color: "#666" }}> (min 4 characters)</span>
              </td>
            </tr>
            <tr>
              <td align="right"><b>Confirm Password:</b></td>
              <td>
                <input type="password" name="password2" required minLength={4} style={{ width: 180 }} />
              </td>
            </tr>
            <tr>
              <td></td>
              <td>
                <button type="submit" className="submit">Create My Account</button>
                {"  "}
                <Link href="/">Cancel</Link>
              </td>
            </tr>
          </tbody>
        </table>
      </form>

      <p style={{ marginTop: 24, fontSize: 11, color: "#666" }}>
        By joining you agree to our <Link href="/privacy">Privacy Policy</Link>.
      </p>
    </ClassicLayout>
  );
}

async function register(formData: FormData) {
  "use server";

  const firstName = String(formData.get("firstName") || "").trim();
  const lastName = String(formData.get("lastName") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const password2 = String(formData.get("password2") || "");

  if (!firstName || !lastName || !email) {
    redirect("/join?error=All+fields+are+required");
  }
  if (password.length < 4) {
    redirect("/join?error=Password+must+be+at+least+4+characters");
  }
  if (password !== password2) {
    redirect("/join?error=Passwords+do+not+match");
  }

  const existing = await prisma.member.findUnique({ where: { loginEmail: email } });
  if (existing) {
    redirect("/join?error=That+email+is+already+registered.+Please+log+in+instead.");
  }

  const passwordHash = await hashPassword(password);

  // Create contact first, then member linked to same id pattern is awkward with autoincrement.
  // Simpler approach: create member, then create contact and (optionally) link via a future field.
  // For now we create both and the member's own contact is stored separately; session uses contact names.

  const member = await prisma.member.create({
    data: {
      loginEmail: email,
      passwordHash,
      liveMember: true,
      defaultRowsPerPage: 25,
    },
  });

  // Create the member's own contact record
  const contact = await prisma.contact.create({
    data: {
      contactType: "M",
      firstName,
      lastName,
      email,
    },
  });

  // Link them so the member "owns" their own contact
  await prisma.memberContact.create({
    data: {
      memberId: member.id,
      contactId: contact.id,
      status: "A",
    },
  });

  // Create a default "Main" folder
  await prisma.folder.create({
    data: {
      memberId: member.id,
      name: "Main",
    },
  });

  // Auto-login
  const { login } = await import("@/lib/auth");
  await login(email, password, false);

  redirect("/contacts?message=Welcome+to+EverFound!+Your+account+has+been+created.");
}
