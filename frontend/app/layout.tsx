import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "./globals.css";

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Spotify Analysis",
  description: "Spotify analysys app to defines the trends of spotify podcast",
};

//* Component or Page
import NavBar from "@/components/NavBar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className={`${openSans.variable}`}>
        <NavBar />
        <div className="px-14">
          {children}
        </div>
      </body>
    </html>
  );
}
