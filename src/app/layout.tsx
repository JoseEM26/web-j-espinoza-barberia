import type { Metadata } from "next";
import { Playfair_Display, Manrope } from "next/font/google";
import { Toaster } from "sonner";
import { AuthProvider } from "@/contexts/auth-context";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Jota Espinoza",
  description: "Barbería Jota Espinoza — Tarjeta de fidelidad y turnos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${playfair.variable} ${manrope.variable} h-full antialiased`}
      style={{ colorScheme: "light" }}
    >
      <body className="bg-vignette min-h-full flex flex-col overflow-x-hidden font-sans text-foreground">
        <AuthProvider>{children}</AuthProvider>
        <Toaster
          theme="light"
          position="top-center"
          toastOptions={{
            style: {
              background: "var(--surface)",
              color: "var(--foreground)",
              border: "1px solid var(--border)",
            },
          }}
        />
      </body>
    </html>
  );
}
