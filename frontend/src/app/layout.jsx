import "./globals.css";

export const metadata = {
  title: "AgentTrust",
  description: "Trust infrastructure for AI-powered commerce"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}