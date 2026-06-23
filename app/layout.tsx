import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Archivo } from "next/font/google";
import "./globals.css";
import { AppChrome } from "@/components/app-chrome";
import { ServiceWorkerRegister } from "@/components/sw-register";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Grit",
  description: "Your Fitbit Air biometrics, in depth.",
};

export const viewport: Viewport = {
  themeColor: "#0b0b0c",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${archivo.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <AppChrome>{children}</AppChrome>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
