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
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        {/* Corrected integrity hash for Font Awesome 6.5.2: 'xintegrity' changed to 'integrity' */}
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" integrity="sha512-SnH5WK+bZxgPHs44uWIX+LLJAJ9/2PkPKZ5QiAj6TaYFAaC7iSfLzVrmim8fceVCPQkXlTSg8K2fQ+i0eGtmZw==" crossOrigin="anonymous" referrerPolicy="no-referrer" />
        <link
            rel="icon"
            href="/icon?<generated>"
            type="image/<generated>"
            sizes="<generated>"
          />
      </head>
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
