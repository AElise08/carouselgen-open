/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, lazy, Suspense, useEffect } from "react";
import { Layers } from "lucide-react";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";

// Lazy load the Dashboard completely so heavy APIs (@google/genai, html-to-image) don't block the initial load
const Dashboard = lazy(() => import("./components/Dashboard"));

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => setCurrentPath(window.location.pathname);
    window.addEventListener("popstate", handleLocationChange);
    return () => window.removeEventListener("popstate", handleLocationChange);
  }, []);

  if (currentPath === "/privacy") return <PrivacyPolicy />;
  if (currentPath === "/terms") return <TermsOfService />;

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-zinc-500 gap-4">
          <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.3)] animate-pulse mb-2">
            <Layers className="w-6 h-6 text-zinc-950" />
          </div>
          <p className="font-mono text-sm tracking-widest uppercase">Iniciando plataforma...</p>
        </div>
      }
    >
      <Dashboard />
    </Suspense>
  );
}
