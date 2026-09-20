import Link from "next/link";
import ClassicLayout from "@/components/ClassicLayout";
import { getSession } from "@/lib/session";

export default async function HowPage() {
  const session = await getSession();

  return (
    <ClassicLayout isLoggedIn={session.isLoggedIn} firstName={session.firstName}>
      <h2 style={{ color: "#3333CC" }}>How EverFound Works</h2>

      <ol style={{ lineHeight: 1.9, maxWidth: 640 }}>
        <li>
          <b>Join for free</b> — Create an account with your name, email, and a password.
        </li>
        <li>
          <b>Add contacts</b> — Enter friends, classmates, and colleagues into your personal address
          book. Organize them into folders.
        </li>
        <li>
          <b>Create groups</b> — Build groups (class of 1998, family, work team, etc.) and invite people
          to them.
        </li>
        <li>
          <b>Stay in touch</b> — Keep addresses and phone numbers up to date, print labels, and manage
          invitations.
        </li>
        <li>
          <b>Appointments</b> — Schedule and respond to appointments with your contacts.
        </li>
        <li>
          <b>Optional car recalls</b> — Track your vehicles and check for manufacturer recalls.
        </li>
      </ol>

      <p style={{ marginTop: 24 }}>
        Everything is designed to feel like the original classic multi-page EverFound experience —
        simple, straightforward, and focused on keeping you connected.
      </p>

      <p>
        {!session.isLoggedIn ? (
          <>
            <Link href="/join" style={{ fontWeight: "bold" }}>
              Join today — it&apos;s free!
            </Link>
            {" | "}
            <Link href="/">Log in</Link>
          </>
        ) : (
          <Link href="/contacts">Go to My Contacts</Link>
        )}
      </p>
    </ClassicLayout>
  );
}
