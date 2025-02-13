import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import ChatWindow from "@/components/ChatWindow";

export default function ChatPage() {
  return (
    <>
      <SignedIn>
        <div className="min-h-screen bg-gray-100">
          <div className="">
            <ChatWindow />
          </div>
        </div>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
