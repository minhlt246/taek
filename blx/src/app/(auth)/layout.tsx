import Footer from "@/components/ui/crm/footer";
import Header from "@/components/ui/crm/header";
import { AuthProvider } from "@/components/auth/AuthProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <div className="main-layout">
        <Header />
        <main className="main-content">{children}</main>
        <Footer />
      </div>
    </AuthProvider>
  );
}
