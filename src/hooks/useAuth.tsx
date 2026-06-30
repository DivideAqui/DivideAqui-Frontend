import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type GoogleCredentialResponse = {
  credential?: string;
  access_token?: string;
  accessToken?: string;
  expires_in?: number;
  profileObj?: {
    name?: string;
    email?: string;
    picture?: string;
  };
  user?: {
    name?: string;
    email?: string;
    picture?: string;
  };
  [key: string]: unknown;
};

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  picture?: string;
  token: string;
  expiresAt: number;
};

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loginWithGoogle: (credentialResponse: GoogleCredentialResponse) => Promise<void>;
  logout: () => void;
};

const COOKIE_NAME = "divideaqui_user";
const GOOGLE_CLIENT_ID = typeof import.meta !== "undefined" ? (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined) : undefined;

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const cookies = document.cookie.split("; ");
  for (const cookie of cookies) {
    const [key, value] = cookie.split("=");
    if (key === name) {
      return decodeURIComponent(value || "");
    }
  }
  return null;
}

function setCookie(name: string, value: string, expiresAt: number) {
  if (typeof document === "undefined") return;
  const expires = new Date(expiresAt).toUTCString();
  const secure = window.location.protocol === "https:" ? " Secure;" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Expires=${expires}; SameSite=Strict;${secure}`;
}

function removeCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict;`;
}

function parseJwtToken(token: string): AuthUser | null {
  const parts = token.split(".");
  if (parts.length < 2) return null;

  try {
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    const expiresAt = typeof payload.exp === "number" ? payload.exp * 1000 : Date.now() + 3600 * 1000;

    return {
      id: String(payload.sub || ""),
      email: String(payload.email || ""),
      name: String(payload.name || "Usuário"),
      picture: typeof payload.picture === "string"
        ? payload.picture
        : typeof payload.image_url === "string"
          ? payload.image_url
          : undefined,
      token,
      expiresAt,
    };
  } catch {
    return null;
  }
}

function loadUserFromCookie(): AuthUser | null {
  const cookieValue = getCookie(COOKIE_NAME);
  if (!cookieValue) return null;

  try {
    const user = JSON.parse(cookieValue) as AuthUser;
    if (!user.expiresAt || user.expiresAt < Date.now()) {
      removeCookie(COOKIE_NAME);
      return null;
    }
    return user;
  } catch {
    removeCookie(COOKIE_NAME);
    return null;
  }
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof window === "undefined") return null;
    return loadUserFromCookie();
  });

  useEffect(() => {
    if (user) {
      // Persist only non-sensitive public profile fields to the cookie.
      // Avoid storing access/id tokens in client-readable storage. For production
      // prefer server-set HttpOnly cookies.
      const cookieUser = { ...user, token: undefined } as unknown as Record<string, unknown>;
      setCookie(COOKIE_NAME, JSON.stringify(cookieUser), user.expiresAt);
    } else {
      removeCookie(COOKIE_NAME);
    }
  }, [user]);

  const loginWithGoogle = async (credentialResponse: GoogleCredentialResponse) => {
    const profileObj = credentialResponse?.profileObj ?? credentialResponse?.user;
    const profilePicture = profileObj?.picture;

    const idToken = credentialResponse?.credential as string | undefined;
    if (idToken) {
      try {
        const tokenInfoRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
        if (tokenInfoRes.ok) {
          const info = await tokenInfoRes.json();
          if (GOOGLE_CLIENT_ID && info.aud && info.aud !== GOOGLE_CLIENT_ID) {
            console.warn("ID token audience mismatch", info.aud);
          } else {
            const expiresAt = (typeof info.exp === "string" || typeof info.exp === "number") ? Number(info.exp) * 1000 : Date.now() + 3600 * 1000;
            const safePicture = typeof info.picture === "string" && (info.picture.startsWith("http://") || info.picture.startsWith("https://")) ? info.picture : profilePicture;
            setUser({
              id: String(info.sub || ""),
              email: String(info.email || ""),
              name: String(info.name || profileObj?.name || "Usuário"),
              picture: safePicture,
              token: "",
              expiresAt,
            });
            return;
          }
        }
      } catch (e) {
        console.error("Failed to validate ID token:", e);
      }

      // fallback to parsing the JWT locally if tokeninfo failed
      const parsedUser = parseJwtToken(idToken);
      if (parsedUser) {
        setUser({
          ...parsedUser,
          picture: parsedUser.picture || profilePicture,
          token: "",
        });
        return;
      }
    }

    const accessToken = credentialResponse?.access_token ?? credentialResponse?.accessToken;
    if (accessToken) {
      try {
        const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!res.ok) return;
        const info = await res.json();
        const expiresIn = credentialResponse?.expires_in;
        const expiresAt = typeof expiresIn === "number" ? Date.now() + expiresIn * 1000 : Date.now() + 3600 * 1000;
        const safePicture = typeof info.picture === "string" && (info.picture.startsWith("http://") || info.picture.startsWith("https://")) ? info.picture : profilePicture;
        const userFromInfo: AuthUser = {
          id: String(info.sub || info.id || ""),
          email: String(info.email || profileObj?.email || ""),
          name: String(info.name || profileObj?.name || info.email || "Usuário"),
          picture: safePicture,
          token: "",
          expiresAt,
        };
        setUser(userFromInfo);
        return;
      } catch (e) {
        console.error("Failed to fetch Google userinfo:", e);
      }
    }

    if (profileObj) {
      const expiresAt = Date.now() + 3600 * 1000;
      const safePicture = typeof profilePicture === "string" && (profilePicture.startsWith("http://") || profilePicture.startsWith("https://")) ? profilePicture : undefined;
      setUser({
        id: "google-profile",
        email: profileObj.email || "",
        name: profileObj.name || "Usuário",
        picture: safePicture,
        token: "",
        expiresAt,
      });
    }
  };

  const logout = () => {
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, isAuthenticated: !!user, loginWithGoogle, logout }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
