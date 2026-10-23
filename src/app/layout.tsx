import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AictSahayakBot from "@/components/AictSahayakBot";

export const metadata: Metadata = {
  title: "APAAR Verify - AICTE Student Data Management Platform | SIH26263",
  description:
    "Official AICTE Student Data Management and Verification Platform using APAAR ID as unique academic identifier. Automated intake validation, cross-institution duplicate detection, and DigiLocker integration under Smart India Hackathon PS 26263.",
  keywords: [
    "AICTE",
    "APAAR",
    "One Nation One Student ID",
    "Student Data Management",
    "SIH26263",
    "DigiLocker",
    "Academic Bank of Credits",
    "Intake Verification",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-[#F8FAFC] antialiased">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <AictSahayakBot />
      </body>
    </html>
  );
}
