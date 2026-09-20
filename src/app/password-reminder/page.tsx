import Link from "next/link";
import ClassicLayout from "@/components/ClassicLayout";

export default function PasswordReminderPage() {
  return (
    <ClassicLayout isLoggedIn={false}>
      <h2 style={{ color: "#3333CC" }}>Password Reminder</h2>
      <p>
        Password reset via email is not yet wired up in this foundation build.
      </p>
      <p>
        When email (Resend / Postmark) is connected, this page will send a secure reset link.
        For now, if you are testing locally you can reset a password directly in the database
        or via Prisma Studio.
      </p>
      <p>
        <Link href="/">Return to Login</Link>
      </p>
    </ClassicLayout>
  );
}
