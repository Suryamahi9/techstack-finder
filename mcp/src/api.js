export class TsfApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "TsfApiError";
    this.status = status;
  }
}

export function getBaseUrl() {
  const base = process.env.TSF_API_URL || "https://techstack-finder.vercel.app";
  return base.replace(/\/+$/, "");
}

function authHeaders() {
  const key = process.env.TSF_API_KEY;
  return key ? { "x-api-key": key } : {};
}

export async function tsfFetch(path, options = {}) {
  const url = getBaseUrl() + path;
  const res = await fetch(url, {
    ...options,
    headers: {
      accept: "application/json",
      ...authHeaders(),
      ...(options.headers || {}),
    },
  });

  let data = null;
  try {
    data = await res.json();
  } catch {}

  if (!res.ok || (data && data.success === false)) {
    const msg = (data && data.error) || `HTTP ${res.status} from ${url}`;
    throw new TsfApiError(msg, res.status);
  }
  return data;
}
