export const QUERY_KEYS = {
  profile: {
    current: ["profile", "current"] as const,
  },
  users: {
    all: ["users"] as const,
  },
  auth: {
    me: ["auth", "me"] as const,
  },
  demand: {
    forecasts: ["demand", "forecasts"] as const,
    history: (productId?: string) =>
      (productId ? ["demand", "history", productId] : ["demand", "history"]) as const,
  },
  products: {
    all: ["products"] as const,
    detail: (id: string) => ["products", id] as const,
  },
  suppliers: {
    all: ["suppliers"] as const,
    detail: (id: string) => ["suppliers", id] as const,
  },
  facilities: {
    all: ["facilities"] as const,
    detail: (id: string) => ["facilities", id] as const,
  },
  boms: {
    all: ["boms"] as const,
    detail: (id: string) => ["boms", id] as const,
  },
  inventory: {
    all: ["inventory"] as const,
    alerts: ["inventory", "alerts"] as const,
    detail: (productId: string) => ["inventory", "product", productId] as const,
  },
  exceptions: {
    all: ["exceptions"] as const,
    detail: (id: string) => ["exceptions", id] as const,
    comments: (id: string) => ["exceptions", id, "comments"] as const,
  },
} as const;
