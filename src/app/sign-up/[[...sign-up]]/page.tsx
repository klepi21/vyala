import { SignUp } from "@clerk/nextjs";
import { isClerkConfigured } from "@/lib/config";
import { SetupNotice } from "@/components/SetupNotice";

export default function SignUpPage() {
  if (!isClerkConfigured()) return <SetupNotice />;
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <SignUp />
    </main>
  );
}
