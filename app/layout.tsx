import React from "react";
import "./globals.css"; // <- penting: panggil global css (tailwind)

export const metadata = {
  title: "Mintrias",
    description: "Mintrias App",
    };

    export default function RootLayout({ children }: { children: React.ReactNode }) {
      return (
          <html lang="en" translate="no">
                <head>
                        <meta name="google" content="notranslate" />
                              </head>
                                    <body className="bg-background text-foreground">
                                            {children}
                                                  </body>
                                                      </html>
                                                        );
                                                        }