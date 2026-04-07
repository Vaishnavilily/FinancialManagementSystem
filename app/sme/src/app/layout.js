import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import { SettingsProvider } from "@/context/SettingsContext";

export const metadata = {
  title: "Finflow - Financial Management Dashboard",
  description: "A premium financial management dashboard for SMEs.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* SettingsProvider fetches currency/timezone once and shares it everywhere */}
        <SettingsProvider>
          <div className="layout-container">
            <Sidebar />
            <main className="main-content">
              {children}
            </main>
          </div>
        </SettingsProvider>
      </body>
    </html>
  );
}