import Link from "next/link";
import { redirect } from "next/navigation";
import ClassicLayout from "@/components/ClassicLayout";
import { getSession } from "@/lib/session";
import { login } from "@/lib/auth";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const session = await getSession();
  const params = await searchParams;

  // If already logged in, go to contacts (mirrors original behavior)
  if (session.isLoggedIn) {
    redirect("/contacts");
  }

  return (
    <ClassicLayout isLoggedIn={false}>
      <table width="100%" cellPadding={0} cellSpacing={0}>
        <tbody>
          {/* Hero / benefit area */}
          <tr>
            <td align="center" style={{ padding: "20px 0 10px" }}>
              <div
                style={{
                  backgroundColor: "#3333CC",
                  color: "white",
                  padding: "12px 24px",
                  display: "inline-block",
                  fontWeight: "bold",
                  fontSize: 16,
                }}
              >
                Keep in touch with your friends and classmates with your personal address book!
              </div>
            </td>
          </tr>

          <tr>
            <td>
              <table width="100%" cellPadding={10} cellSpacing={0}>
                <tbody>
                  <tr>
                    {/* Left column — Join */}
                    <td width="45%" valign="top">
                      <h3 style={{ color: "#3333CC", marginTop: 0 }}>New to EverFound?</h3>
                      <ul style={{ lineHeight: 1.8 }}>
                        <li>
                          <Link href="/join" style={{ fontWeight: "bold" }}>
                            Join today
                          </Link>{" "}
                          for free!
                        </li>
                        <li>
                          Learn{" "}
                          <Link href="/how" style={{ fontWeight: "bold" }}>
                            How EverFound Works
                          </Link>
                        </li>
                        <li>
                          View our{" "}
                          <Link href="/privacy" style={{ fontWeight: "bold" }}>
                            Privacy Policy
                          </Link>
                        </li>
                      </ul>
                    </td>

                    {/* Right column — Login */}
                    <td width="55%" valign="top">
                      <table
                        width="100%"
                        cellPadding={0}
                        cellSpacing={0}
                        style={{ backgroundColor: "#3333CC", color: "white" }}
                      >
                        <tbody>
                          <tr>
                            <td style={{ padding: 12 }}>
                              <div style={{ fontWeight: "bold", marginBottom: 10, fontSize: 14 }}>
                                Member Login
                              </div>

                              {params.error && (
                                <div className="ef-error" style={{ color: "#FFCCCC", marginBottom: 8 }}>
                                  {params.error}
                                </div>
                              )}
                              {params.message && (
                                <div className="ef-message" style={{ marginBottom: 8 }}>
                                  {params.message}
                                </div>
                              )}

                              <form action={loginAction}>
                                <table cellPadding={4} cellSpacing={0}>
                                  <tbody>
                                    <tr>
                                      <td className="whitesmall">Email:</td>
                                      <td>
                                        <input
                                          type="email"
                                          name="email"
                                          required
                                          style={{ width: 180 }}
                                        />
                                      </td>
                                    </tr>
                                    <tr>
                                      <td className="whitesmall">Password:</td>
                                      <td>
                                        <input
                                          type="password"
                                          name="password"
                                          required
                                          style={{ width: 180 }}
                                        />
                                      </td>
                                    </tr>
                                    <tr>
                                      <td colSpan={2}>
                                        <label className="whitesmall">
                                          <input type="checkbox" name="rememberMe" value="1" /> Remember
                                          Me
                                        </label>
                                        {"  "}
                                        <Link href="/password-reminder" className="whitesmall">
                                          I don&apos;t know my password
                                        </Link>
                                      </td>
                                    </tr>
                                    <tr>
                                      <td colSpan={2} align="right">
                                        <button type="submit" className="submit">
                                          Login
                                        </button>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </form>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    </ClassicLayout>
  );
}

async function loginAction(formData: FormData) {
  "use server";

  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const rememberMe = formData.get("rememberMe") === "1";

  const result = await login(email, password, rememberMe);

  if (!result.success) {
    redirect(`/?error=${encodeURIComponent(result.error || "Login failed")}`);
  }

  redirect("/contacts");
}
