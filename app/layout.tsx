import React from "react";

export const metadata = {
  title: "Mintrias",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" translate="no">
      <head>
        {/* cegah Google/Chrome auto-translate */}
        <meta name="google" content="notranslate" />
      </head>
      <body>{children}</body>
    </html>
  );
}
