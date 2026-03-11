import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Meta Ads Intelligence | AI-Powered Competitor Analysis",
    description: "Monitor, analyze and gain competitive intelligence from Meta ads. Track competitor campaigns, creative strategies, and ad performance.",
    keywords: "meta ads, competitor intelligence, facebook ads, instagram ads, ad analysis",
    openGraph: {
        title: "Meta Ads Intelligence",
        description: "AI-Powered Meta Ads Competitor Intelligence System",
        type: "website",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
            </head>
            <body className="antialiased">{children}</body>
        </html>
    );
}
