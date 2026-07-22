import "./globals.css";
import type { Metadata } from "next";
import { Header } from "./ui/Header";
import { Footer } from "./ui/Footer";
export const metadata:Metadata={title:"Raman Store — Fashion & Jewellery for Every Celebration",description:"Shop thoughtfully selected women’s wear, kids’ wear and artificial jewellery with delivery across India."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><Header/><main>{children}</main><Footer/></body></html>}
