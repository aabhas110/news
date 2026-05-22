"use client";

import { SessionProvider } from "next-auth/react";
import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({ dark: false, setDark: (_value: boolean) => {} });

export function Providers({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDark(stored ? stored === "dark" : prefersDark);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    window.localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <SessionProvider>
      <ThemeContext.Provider value={{ dark, setDark }}>{children}</ThemeContext.Provider>
    </SessionProvider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
