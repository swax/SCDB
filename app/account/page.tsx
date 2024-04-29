import authOptions from "@/app/api/auth/[...nextauth]/authOptions";
import { getAccount } from "@/backend/accountService";
import { getServerSession } from "next-auth";
import AccountClientPage from "./page.client";


export default async function AccountPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user.id) {
    return <div>Not logged in</div>;
  }

  const account = await getAccount(session.user.id);

  if (!account) {
    return <div>Account not found</div>;
  }

  return <AccountClientPage {...account} />;
}
