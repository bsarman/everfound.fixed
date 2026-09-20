import Link from "next/link";
import ClassicLayout from "@/components/ClassicLayout";
import { getSession } from "@/lib/session";

export default async function PrivacyPage() {
  const session = await getSession();

  return (
    <ClassicLayout isLoggedIn={session.isLoggedIn} firstName={session.firstName}>
      <h2 style={{ color: "#3333CC" }}>Privacy Policy</h2>

      <p>
        <i>This is a modernized recreation of the original EverFound privacy policy spirit.</i>
      </p>

      <h3>What we collect</h3>
      <ul>
        <li>Account information you provide (name, email, password)</li>
        <li>Contact and group data you enter</li>
        <li>Basic usage information needed to operate the service</li>
      </ul>

      <h3>How we use it</h3>
      <ul>
        <li>To provide the address-book, group, and appointment features</li>
        <li>To send you service-related messages (invites, password reminders, etc.)</li>
        <li>We do not sell your personal information to third parties</li>
      </ul>

      <h3>Security</h3>
      <p>
        Passwords are stored using modern one-way hashing (bcrypt). Sessions use encrypted cookies.
        You should still use a strong unique password and keep your login private.
      </p>

      <h3>Your control</h3>
      <p>
        You can edit or delete your contacts, groups, and account information at any time while logged
        in. If you wish to permanently close your account, contact the site administrator.
      </p>

      <p style={{ marginTop: 24, fontSize: 11, color: "#666" }}>
        This policy may be updated as the modernized service evolves. Continued use of the site
        constitutes acceptance of the current policy.
      </p>

      <p>
        <Link href="/">Return to Home</Link>
      </p>
    </ClassicLayout>
  );
}
