
import Navbar from "@/components/organisms/Navbar";
import { ThemeProvider } from "@/providers/theme-provider";
import Footer from "@/components/organisms/Footer";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <Navbar />
        <div className="pt-16">
        {children}
        </div>
        <Footer />
      </ThemeProvider>
    </div>
  );
}
