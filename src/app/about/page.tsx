import Link from "next/link";
import ClassicLayout from "@/components/ClassicLayout";
import { getSession } from "@/lib/session";

export default async function AboutPage() {
  const session = await getSession();

  return (
    <ClassicLayout isLoggedIn={session.isLoggedIn} firstName={session.firstName}>
      <h2 style={{ color: "#3333CC" }}>About EverFound</h2>

      <p>
        EverFound was originally launched in the early 2000s as a free online address book and
        contact-management service. Members could keep track of friends and classmates, organize them
        into groups, send invitations, manage appointments, and even check for vehicle recalls.
      </p>

      <p>
        This modern version is a faithful recreation of the classic multi-page experience, rebuilt with
        current web technology while preserving the original look, navigation, and spirit of the site.
      </p>

      <p>
        <b>Original era:</b> approximately 2000–2003<br />
        <b>Original platform:</b> Adobe ColdFusion (CFML)<br />
        <b>This version:</b> Next.js + PostgreSQL (2026 modernization)
      </p>

      <p>
        <Link href="/">Return to Home</Link>
        {" | "}
        <Link href="/how">How EverFound Works</Link>
        {" | "}
        <Link href="/privacy">Privacy Policy</Link>
      </p>
    </ClassicLayout>
  );
}
