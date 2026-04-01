import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Header from "@/components/header";

export const metadata = {
  title: "Spott - Discover Amazing Places",
  description:
    "Find and explore the best spots around you. Your guide to hidden gems and popular destinations.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={
          "bg-linear-to-br from-gray-950 via-zinc-900 to-stone-900 text-white"
        }
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Header */}
          <Header/>

          <main className="relative min-h-screen container mx-auto pt-40 md:pt-32">
            {/* glow */}
            <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10">{children}</div>
          </main>

          {/* Footer */}
          <footer className="text-center text-sm text-zinc-500 py-6 border-t border-zinc-800">
            © {new Date().getFullYear()} Spott — Every great story starts with a
            place.
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
