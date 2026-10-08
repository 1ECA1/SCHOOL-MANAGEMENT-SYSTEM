import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAuth } from "./AuthContext";

const ThemeContext = createContext(null);

const SETTINGS_PREFIX = "edumanage-settings";

const DEFAULT_SETTINGS = {
  theme: "light",
  compactMode: false,
  notifications: true,
  notificationSound: true,
  language: "English",
};

function getStorageKey(user) {
  if (!user?.id) {
    return null;
  }

  return `${SETTINGS_PREFIX}-${user.id}`;
}

function getStoredSettings(user) {
  const storageKey = getStorageKey(user);

  if (!storageKey) {
    return DEFAULT_SETTINGS;
  }

  try {
    const stored = localStorage.getItem(storageKey);

    if (!stored) {
      return DEFAULT_SETTINGS;
    }

    const parsed = JSON.parse(stored);

    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
    };
  } catch (error) {
    console.error("Failed to load personal settings:", error);

    return DEFAULT_SETTINGS;
  }
}

function getSystemTheme() {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeProvider({ children }) {
  const { user } = useAuth();

  const [settings, setSettings] = useState(() =>
    getStoredSettings(user),
  );

  /*
   * Load the settings belonging to the currently
   * authenticated user whenever the user changes.
   */
  useEffect(() => {
    setSettings(getStoredSettings(user));
  }, [user?.id]);

  /*
   * Save settings under the currently logged-in user's
   * own storage key.
   */
  useEffect(() => {
    const storageKey = getStorageKey(user);

    if (!storageKey) {
      return;
    }

    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify(settings),
      );
    } catch (error) {
      console.error("Failed to save personal settings:", error);
    }
  }, [settings, user?.id]);

  /*
   * Apply the selected theme globally for the current
   * logged-in user only.
   */
  useEffect(() => {
    const root = document.documentElement;

    let mediaQuery = null;

    const applyTheme = () => {
      let effectiveTheme = settings.theme;

      if (settings.theme === "system") {
        effectiveTheme = getSystemTheme();
      }

      if (effectiveTheme === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    };

    applyTheme();

    /*
     * If System mode is selected, automatically react
     * when the operating system switches between light
     * and dark mode.
     */
    if (
      settings.theme === "system" &&
      typeof window !== "undefined"
    ) {
      mediaQuery = window.matchMedia(
        "(prefers-color-scheme: dark)",
      );

      mediaQuery.addEventListener("change", applyTheme);
    }

    return () => {
      if (mediaQuery) {
        mediaQuery.removeEventListener("change", applyTheme);
      }
    };
  }, [settings.theme]);

  const setTheme = (theme) => {
    if (!["light", "dark", "system"].includes(theme)) {
      return;
    }

    setSettings((current) => ({
      ...current,
      theme,
    }));
  };

  const setLightMode = () => {
    setTheme("light");
  };

  const setDarkMode = () => {
    setTheme("dark");
  };

  const setSystemMode = () => {
    setTheme("system");
  };

  const toggleTheme = () => {
    setSettings((current) => ({
      ...current,
      theme:
        current.theme === "dark"
          ? "light"
          : "dark",
    }));
  };

  const setCompactMode = (enabled) => {
    setSettings((current) => ({
      ...current,
      compactMode: Boolean(enabled),
    }));
  };

  const setNotifications = (enabled) => {
    setSettings((current) => ({
      ...current,
      notifications: Boolean(enabled),
    }));
  };

  const setNotificationSound = (enabled) => {
    setSettings((current) => ({
      ...current,
      notificationSound: Boolean(enabled),
    }));
  };

  const setLanguage = (language) => {
    setSettings((current) => ({
      ...current,
      language,
    }));
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  const value = useMemo(
    () => ({
      theme: settings.theme,

      compactMode: settings.compactMode,

      notifications: settings.notifications,

      notificationSound: settings.notificationSound,

      language: settings.language,

      settings,

      setTheme,

      toggleTheme,

      setLightMode,

      setDarkMode,

      setSystemMode,

      setCompactMode,

      setNotifications,

      setNotificationSound,

      setLanguage,

      resetSettings,
    }),
    [settings],
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useTheme must be used inside a ThemeProvider",
    );
  }

  return context;
}