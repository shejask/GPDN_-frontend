import { Urbanist, Poppins } from "next/font/google";
import "./globals.css";


const urbanist = Urbanist({
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700"],
    variable: "--font-urbanist",
});

const poppins = Poppins({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700'],
    variable: '--font-poppins',
});

export default function RootLayout({children}) {

   


    return (
        <html lang="en">
            <head>
                <meta charSet="UTF-8"/>
                <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                <meta name="author" content="Orieal Technologies LLP"/>
                <meta name="language" content="en"/>
                <meta name="robots" content="index, follow"/>
                <link
                    rel="stylesheet"
                    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
                    integrity="sha512-9usAa10IRO0HhonpyAIVpjrylPvoDwiPUiKdWk5t3PyolY1cOd4DSE0Ga+ri4AuTroPR5aQvXU9xC6qOPnzFeg=="
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer"
                />

                {/* SEO Meta Tags */}
                <title>GPDN | Connect. Learn. Lead in Palliative Care</title>
                <meta name="description" content="GPDN – Global Palliative Doctors Network – is a collaborative platform for palliative care doctors worldwide. Share insights, access expert resources, and engage in discussions to enhance compassionate care for individuals with serious illnesses across the globe."/>
                <meta name="keywords" content="GPDN, Global Palliative Doctors Network, palliative care doctors, palliative medicine, serious illness care, hospice care, palliative care forum, palliative doctors directory, global palliative network, palliative units directory, palliative care education, palliative research"/>
                <meta name="subject" content="Global Palliative Doctors Network - Collaborative platform for palliative care professionals to connect, learn, and improve compassionate care worldwide."/>

                {/* Open Graph (Facebook, LinkedIn) */}
                <meta property="og:title" content="GPDN | Connect. Learn. Lead in Palliative Care"/>
                <meta property="og:description" content="GPDN – Global Palliative Doctors Network – is a collaborative platform for palliative care doctors worldwide. Share insights, access expert resources, and engage in discussions to enhance compassionate care for individuals with serious illnesses across the globe."/>
                <meta property="og:image" content="https://gpdnorg.net/og-image.jpg"/>
                <meta property="og:url" content="https://gpdnorg.net"/>
                <meta property="og:type" content="website"/>
            </head>
            <body className={`${urbanist.className} ${poppins.variable}`}>
             
                {children}
               
                </body>
        </html>
    );
}
