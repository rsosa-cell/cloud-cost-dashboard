import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./lib/firebase";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // -----------------------
  // LOAD THEME ON START
  // -----------------------

  // -----------------------
  // APPLY THEME CHANGES (GLOBAL GOOGLE STYLE)
  // -----------------------


  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0b1220] text-gray-600 dark:text-gray-300">
        Loading...
      </div>
    );
  }

  if (!user) return <Auth />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0b1220] text-gray-900 dark:text-gray-100 transition-colors duration-300">

      {/* TOP BAR (Google Cloud style) */}
      <header className="flex justify-between items-center px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111827]">
        
        {/* LEFT: Brand (optional but feels more “real product”) */}
        <div className="font-semibold tracking-tight text-sm">
          Cloud Cost Tracker
        </div>

        {/* RIGHT ACTIONS */}
        <div className="flex items-center gap-3">


          {/* LOGOUT */}
          <button
            onClick={() => signOut(auth)}
            className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1.5 rounded-md transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* MAIN CONTENT WRAPPER (Google console spacing) */}
      <main className="p-6 max-w-7xl mx-auto">
        <Dashboard />
      </main>
    </div>
  );
}

export default App;