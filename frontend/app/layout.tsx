import type { Metadata } from "next";
import "./globals.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { GoogleOAuthProvider } from "@react-oauth/google";

export const metadata: Metadata = {
  title: "VDeploy",
  description: "Easily deploy your react/next application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <GoogleOAuthProvider clientId={process.env.OAUTH_CLIENT_ID || ""}>
        <body className="bg-gradient-to-t from-[#07000a] h-[100vh]">
          <ToastContainer />
          {children}
        </body>
      </GoogleOAuthProvider>
    </html>
  );
}
