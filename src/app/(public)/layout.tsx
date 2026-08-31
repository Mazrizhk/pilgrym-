import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { auth } from "@/lib/auth";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  return (
    <>
      <Navbar user={session?.user} />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
