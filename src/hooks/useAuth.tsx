
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
  dbId?: string;
  cadastroCompleto?: boolean;
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
  loginWithToken: (token: string) => Promise<void>;
  updateUserPicture: (picture: string) => void;
  logout: () => void;
};

const COOKIE_NAME = "divideaqui_user";

const GOOGLE_CLIENT_ID = typeof import.meta !== "undefined"
  ? (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined)
  : undefined;

const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:3344";

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
    const payload = JSON.parse(
      atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"))
    );

    const expiresAt =
      typeof payload.exp === "number"
        ? payload.exp * 1000
        : Date.now() + 3600 * 1000;

    return {
      id: String(payload.id ?? payload.sub ?? ""),
      email: String(payload.email || ""),
      name: String(payload.name || "Usuário"),
      picture:
        typeof payload.picture === "string"
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

    // Restaurar o token do localStorage se não estiver no cookie.
    const storedToken = localStorage.getItem("token");

    if (storedToken && !user.token) {
      user.token = storedToken;
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

  const updateUserPicture = (picture: string) => {
    setUser((currentUser) => {
      if (!currentUser) return currentUser;

      return {
        ...currentUser,
        picture,
      };
    });
  };

  useEffect(() => {
    if (user) {
      // Persist only non-sensitive public profile fields to the cookie.
      // Avoid storing access/id tokens in client-readable storage. For production
      // prefer server-set HttpOnly cookies.
      const cookieUser = {
        ...user,
        token: undefined,
        // Evita armazenar fotos Base64 no cookie, pois podem ultrapassar seu limite.
        picture: user.picture?.startsWith("data:") ? undefined : user.picture,
      } as unknown as Record<string, unknown>;

      setCookie(COOKIE_NAME, JSON.stringify(cookieUser), user.expiresAt);

      // Also persist token to localStorage for components that need it (like DivideAI).
      if (user.token) {
        localStorage.setItem("token", user.token);
      }
    } else {
      removeCookie(COOKIE_NAME);
      localStorage.removeItem("token");
    }
  }, [user]);

  // Busca a foto salva no banco para manter a imagem atualizada entre as páginas e sessões.
  useEffect(() => {
    if (!user?.id || user.id === "google-profile") return;

    let cancelado = false;

    const buscarFoto = async () => {
      try {
        const userId = user.dbId ?? user.id;
        const token = user.token || localStorage.getItem("token");

        const response = await fetch(`${API_URL}/usuario/${userId}`, {
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : {},
        });

        if (!response.ok) return;

        const dados = await response.json();

        if (!cancelado && dados.usu_foto) {
          setUser((usuarioAtual) => {
            if (!usuarioAtual) return usuarioAtual;

            const idAtual = usuarioAtual.dbId ?? usuarioAtual.id;

            if (String(idAtual) !== String(userId)) {
              return usuarioAtual;
            }

            if (usuarioAtual.picture === dados.usu_foto) {
              return usuarioAtual;
            }

            return {
              ...usuarioAtual,
              picture: dados.usu_foto,
            };
          });
        }
      } catch (erro) {
        console.error("Erro ao buscar foto do usuário:", erro);
      }
    };

    buscarFoto();

    return () => {
      cancelado = true;
    };
  }, [user?.id, user?.dbId]);

  const loginWithGoogle = async (credentialResponse: GoogleCredentialResponse) => {
    const profileObj = credentialResponse?.profileObj ?? credentialResponse?.user;
    const profilePicture = profileObj?.picture;
    const idToken = credentialResponse?.credential as string | undefined;

    if (idToken) {
      try {
        const res = await fetch(`${API_URL}/auth/google`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken }),
        });

        if (!res.ok) throw new Error("Falha ao autenticar no servidor");

        const db = await res.json();

        if (!db.token) throw new Error("Servidor não retornou token");

        setUser({
          id: String(db.id),
          dbId: String(db.id),
          cadastroCompleto: db.cadastroCompleto,
          email: db.email,
          name: db.nome,
          picture: db.foto || profilePicture,
          token: db.token,
          expiresAt: Date.now() + 7 * 24 * 3600 * 1000,
        });

        return;
      } catch (e) {
        console.error("Erro ao salvar usuário no banco:", e);
      }

      try {
        const tokenInfoRes = await fetch(
          `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`
        );

        if (tokenInfoRes.ok) {
          const info = await tokenInfoRes.json();

          if (GOOGLE_CLIENT_ID && info.aud && info.aud !== GOOGLE_CLIENT_ID) {
            console.warn("ID token audience mismatch", info.aud);
          } else {
            const safePicture =
              typeof info.picture === "string" &&
              (info.picture.startsWith("http://") || info.picture.startsWith("https://"))
                ? info.picture
                : profilePicture;

            setUser({
              id: String(info.sub || ""),
              email: String(info.email || ""),
              name: String(info.name || profileObj?.name || "Usuário"),
              picture: safePicture,
              token: "",
              expiresAt: Date.now() + 3600 * 1000,
            });

            return;
          }
        }
      } catch (e) {
        console.error("Failed to validate ID token:", e);
      }

      return;
    }

    const accessToken = credentialResponse?.access_token ?? credentialResponse?.accessToken;

    if (accessToken) {
      const res = await fetch(`${API_URL}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken }),
      });

      if (!res.ok) throw new Error("Falha ao autenticar no servidor");

      const db = await res.json();

      if (!db.token) throw new Error("Servidor não retornou token");

      const expiresIn = credentialResponse?.expires_in;

      setUser({
        id: String(db.id),
        dbId: String(db.id),
        cadastroCompleto: db.cadastroCompleto,
        email: db.email,
        name: db.nome,
        picture: db.foto || profilePicture,
        token: db.token,
        expiresAt:
          typeof expiresIn === "number"
            ? Date.now() + expiresIn * 1000
            : Date.now() + 7 * 24 * 3600 * 1000,
      });

      return;
    }

    if (profileObj) {
      const safePicture =
        typeof profilePicture === "string" &&
        (profilePicture.startsWith("http://") || profilePicture.startsWith("https://"))
          ? profilePicture
          : undefined;

      setUser({
        id: "google-profile",
        email: profileObj.email || "",
        name: profileObj.name || "Usuário",
        picture: safePicture,
        token: "",
        expiresAt: Date.now() + 3600 * 1000,
      });
    }
  };

  const loginWithToken = async (token: string) => {
    const parsedUser = parseJwtToken(token);

    if (!parsedUser) {
      throw new Error("Token inválido.");
    }

    setUser(parsedUser);
  };

  const logout = () => {
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      loginWithGoogle,
      loginWithToken,
      updateUserPicture,
      logout,
    }),
    [user]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
