import './globals.css';
import Sidebar from '@/components/Sidebar';

export const metadata = {
  title: 'Finflow Individual — Personal Finance Manager',
  description: 'Manage your personal finances with Finflow Individual — budgets, goals, transactions, tax planning and more.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <Sidebar />
          <div className="main-content">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
