import { redirect } from "next/navigation";

/** The app is the admin dashboard */
export default function Home() {
  redirect("/dashboard");
}
