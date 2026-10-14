const TOKEN_KEY = "inventrack_token";

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export class ApiError extends Error {
  constructor(public status: number, message: string, public errors: { field: string; message: string }[] = []) {
    super(message);
  }
  /** Maydon nomi bo'yicha xabar */
  fieldError(name: string) {
    return this.errors.find((e) => e.field === name)?.message;
  }
}

type Query = Record<string, string | number | boolean | undefined | null>;

function qs(query?: Query) {
  const p = new URLSearchParams();
  Object.entries(query ?? {}).forEach(([k, v]) => v !== undefined && v !== null && v !== "" && p.set(k, String(v)));
  const s = p.toString();
  return s ? `?${s}` : "";
}

async function request(path: string, opts: { method?: string; body?: unknown; query?: Query } = {}) {
  const token = tokenStore.get();
  let res: Response;
  try {
    res = await fetch(`/api${path}${qs(opts.query)}`, {
      method: opts.method ?? "GET",
      headers: {
        ...(opts.body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    });
  } catch {
    throw new ApiError(0, "Serverga ulanib bo'lmadi. Internetni tekshiring");
  }
  if (res.status === 401 && token && !path.startsWith("/auth/login")) {
    tokenStore.clear();
    window.location.href = "/login";
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new ApiError(res.status, data.message ?? "Xatolik yuz berdi", data.errors);
  }
  return res;
}

export async function api<T = any>(path: string, opts?: { method?: string; body?: unknown; query?: Query }): Promise<T> {
  const res = await request(path, opts);
  return res.json();
}

export async function fetchBlob(path: string, query?: Query) {
  return (await request(path, { query })).blob();
}

export async function download(path: string, filename: string, query?: Query) {
  const url = URL.createObjectURL(await fetchBlob(path, query));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
