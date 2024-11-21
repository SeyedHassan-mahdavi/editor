'use client'
import { DndProvider } from 'react-dnd';
import '../styles/globals.css';
import Footer from './components/Footer';
import Header from './components/Header';
import iranSans from './helper/LocalFonts';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { FormProvider } from "./context/FormContext";
import Head from 'next/head';




export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Amiri&family=Cairo&family=Vazirmatn&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body className={iranSans.className}>
        <DndProvider backend={HTML5Backend}>
          {/* <Header /> */}
          <main className="min-h-screen">
            <FormProvider>

              {children}
            </FormProvider>
          </main>
          {/* <Footer /> */}
        </DndProvider>

      </body>
    </html>
  );
}
