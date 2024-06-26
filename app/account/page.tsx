import authOptions from "@/app/api/auth/[...nextauth]/authOptions";
import { getAccount } from "@/backend/user/accountService";
import { buildPageTitle } from "@/shared/utilities";
import { Metadata } from "next";
import { getServerSession } from "next-auth";
import AccountClientPage from "./page.client";

export const metadata: Metadata = {
  title: buildPageTitle("My Account"),
  description: "My SketchTV.lol account",
};

export default async function AccountPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user.id) {
    return <div>Not logged in</div>;
  }

  const account = await getAccount(session.user.id);

  if (!account) {
    return <div>Account not found</div>;
  }

  // Rendering
  return (
    <>
      <AccountClientPage {...account} />
    </>
  );
}
