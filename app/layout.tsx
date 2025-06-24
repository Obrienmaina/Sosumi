import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/footer"; // Import Footer component

const montserrat = Montserrat({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: "Sosumi Blog App",
  description: "Created by Brian and Petra",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${montserrat.className} bg-gray-100`}>
        <Header />
        <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
