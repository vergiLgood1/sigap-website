import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "@/app/_styles/globals.css";
import ReactQueryProvider from "@/app/_lib/react-query-provider";
import { Toaster } from "@/app/_components/ui/sonner";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Sigap | Jember ",
  description: "Sigap is a platform for managing your crime data.",
};

const geistSans = Geist({
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ReactQueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <main className="min-h-screen flex flex-col items-center">
              <div className="flex-1 w-full gap-20 items-center">
                {/* <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
                <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
                  <div className="flex gap-5 items-center font-semibold">
                    <Link href={"/"}>
                      <SigapLogo />
                    </Link>
                    <div className="flex items-center gap-2">
                      <DeployButton />
                    </div>
                  </div>
                  <div className="flex gap-5 items-center">
                    {!hasEnvVars ? <EnvVarWarning /> : <HeaderAuth />}
                    <ThemeSwitcher />
                  </div>
                </div>
              </nav> */}
                <div className="flex flex-col max-w-full p-0">
                  {children}
                  <Toaster theme="system" position="top-right" richColors />
                </div>

                {/* <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16 mt-auto">
                <p> 
                  Powered by{" "
                  <a
                    href=""
                    target="_blank"
                    className="font-bold hover:underline"
                    rel="noreferrer"
                  >
                    Politeknik Negeri Jember
                  </a>
                </p>
              </footer> */}
              </div>
            </main>
          </ThemeProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
