import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { getSession, sessionOptions } from "./session";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function login(email: string, password: string, rememberMe = false) {
  const member = await prisma.member.findUnique({
    where: { loginEmail: email.toLowerCase().trim() },
  });

  if (!member || !member.liveMember) {
    return { success: false, error: "Invalid email or password." };
  }

  const valid = await verifyPassword(password, member.passwordHash);
  if (!valid) {
    return { success: false, error: "Invalid email or password." };
  }

  // Update login stats
  await prisma.member.update({
    where: { id: member.id },
    data: {
      lastLoginAt: new Date(),
      numLogins: { increment: 1 },
    },
  });

  // Try to get display name from the member's own contact (first active contact)
  const ownContact = await prisma.memberContact.findFirst({
    where: { memberId: member.id, status: "A" },
    include: { contact: true },
    orderBy: { id: "asc" },
  });

  const firstName = ownContact?.contact?.firstName || "";
  const lastName = ownContact?.contact?.lastName || "";

  const session = await getSession();
  session.memberId = member.id;
  session.firstName = firstName;
  session.memberName = `${firstName} ${lastName}`.trim();
  session.rowsPerPage = member.defaultRowsPerPage;
  session.isLoggedIn = true;

  // "Remember Me" → longer cookie lifetime
  if (rememberMe) {
    // iron-session: set maxAge on the options used for this save
    (session as unknown as { cookieOptions?: { maxAge?: number } }).cookieOptions = {
      ...sessionOptions.cookieOptions,
      maxAge: 60 * 60 * 24 * 365, // 1 year
    };
  }

  await session.save();

  return { success: true, memberId: member.id };
}

export async function logout() {
  const session = await getSession();
  session.destroy();
}
