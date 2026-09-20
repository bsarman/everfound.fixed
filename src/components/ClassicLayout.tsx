import Link from "next/link";
import { ReactNode } from "react";

type Tab = "contacts" | "groups" | "preferences" | "appointments" | "none";

interface ClassicLayoutProps {
  children: ReactNode;
  activeTab?: Tab;
  isLoggedIn?: boolean;
  firstName?: string;
  showLoginBox?: boolean;
}

/**
 * Classic EverFound layout that closely mirrors the original 2000-2003
 * table-based header + image tab navigation.
 *
 * When original graphics become available, replace the text tabs with
 * the GIF buttons (contacts_on.gif, groups_off.gif, etc.).
 */
export default function ClassicLayout({
  children,
  activeTab = "none",
  isLoggedIn = false,
  firstName = "",
  showLoginBox = false,
}: ClassicLayoutProps) {
  return (
    <div className="ef-page">
      {/* Top blue header bar */}
      <table className="ef-header-table" cellPadding={0} cellSpacing={0} width="100%">
        <tbody>
          <tr>
            <td style={{ backgroundColor: "#3333CC", padding: "4px 10px" }}>
              <table width="100%" cellPadding={0} cellSpacing={0}>
                <tbody>
                  <tr>
                    <td>
                      <Link href="/" className="whitebig">
                        EverFound.com
                      </Link>
                    </td>
                    <td align="right">
                      {isLoggedIn ? (
                        <span className="whitesmall">
                          Welcome back {firstName}!{" "}
                          <Link href="/logout" className="whitebold">
                            Logout
                          </Link>
                        </span>
                      ) : (
                        <span className="whitesmall">Keep in touch with friends & classmates</span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Tab navigation (classic style) */}
      {isLoggedIn && (
        <table className="ef-tab-bar" cellPadding={0} cellSpacing={0} width="100%">
          <tbody>
            <tr style={{ backgroundColor: "#3333CC" }}>
              <td width="15" style={{ height: 22 }}>&nbsp;</td>
              <TabCell href="/contacts" label="Contacts" active={activeTab === "contacts"} />
              <TabCell href="/groups" label="Groups" active={activeTab === "groups"} />
              <TabCell href="/account" label="Preferences" active={activeTab === "preferences"} />
              <TabCell href="/appointments" label="Appointments" active={activeTab === "appointments"} />
              <td
                align="center"
                style={{
                  backgroundColor: "#3333CC",
                  color: "white",
                  fontWeight: "bold",
                  fontSize: 11,
                  padding: "0 8px",
                }}
              >
                <Link href="/car" className="whitebold">
                  Check for recalls on your car/truck!
                </Link>
              </td>
              <td align="right" style={{ backgroundColor: "#3333CC", paddingRight: 10 }}>
                <Link href="/logout" className="whitebold">
                  Logout
                </Link>
              </td>
            </tr>
          </tbody>
        </table>
      )}

      {/* Main content area */}
      <div className="ef-content">{children}</div>

      {/* Simple classic footer */}
      <table width="100%" cellPadding={4} cellSpacing={0} style={{ marginTop: 30, borderTop: "1px solid #CCCCCC" }}>
        <tbody>
          <tr>
            <td align="center" style={{ fontSize: 11, color: "#666666" }}>
              <Link href="/about">About</Link>
              {" | "}
              <Link href="/how">How EverFound Works</Link>
              {" | "}
              <Link href="/privacy">Privacy Policy</Link>
              <br />
              &copy; {new Date().getFullYear()} EverFound &mdash; Modernized from the original 2000-2003 site
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function TabCell({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <td
      width={113}
      style={{
        backgroundColor: active ? "#FFFFFF" : "#3333CC",
        borderTop: active ? "2px solid #3333CC" : "none",
        borderLeft: active ? "1px solid #3333CC" : "none",
        borderRight: active ? "1px solid #3333CC" : "none",
        textAlign: "center",
        height: 22,
        verticalAlign: "middle",
      }}
    >
      <Link
        href={href}
        style={{
          color: active ? "#3333CC" : "white",
          fontWeight: "bold",
          fontSize: 12,
          textDecoration: "none",
          display: "block",
          padding: "3px 6px",
        }}
      >
        {label}
      </Link>
    </td>
  );
}
