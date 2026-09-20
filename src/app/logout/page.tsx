import { redirect } from "next/navigation";
import { logout } from "@/lib/auth";

export default async function LogoutPage() {
  await logout();
  redirect("/?message=You+have+been+logged+out.+Come+back+soon!");
}
