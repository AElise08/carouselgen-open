import React, { useEffect, useState } from "react";
import { Key } from "lucide-react";

export function ApiKeyGuard({ children }: { children: React.ReactNode }) {
  const [hasKey, setHasKey] = useState<boolean | null>(null);

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
        const has = await window.aistudio.hasSelectedApiKey();
        setHasKey(has);
      } else {
        // Fallback for local dev if window.aistudio is not available
        setHasKey(true);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
      await window.aistudio.openSelectKey();
      // Assume it succeeded
      setHasKey(true);
    }
  };

  if (hasKey === null) {
    return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400">Loading...</div>;
  }

  if (!hasKey) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-zinc-200 p-6">
        <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto">
            <Key className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">API Key Required</h1>
          <p className="text-zinc-400 text-sm">
            To generate high-quality images, you need to provide your API key.
          </p>
          <button
            onClick={handleSelectKey}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-semibold py-3 px-4 rounded-xl transition-colors"
          >
            Connect API Key
          </button>
          <p className="text-xs text-zinc-500">
            You must select a valid API key.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
