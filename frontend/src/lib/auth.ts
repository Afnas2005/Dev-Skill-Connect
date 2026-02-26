// ✅ Token is stored in HTTP-only cookie by server
// No localStorage - automatic cookie handling via Axios withCredentials: true

import { api } from "./api";

export const logout = async () => {
  try {
    await api.post("/auth/logout");
  } catch (error) {
    console.error("Logout error:", error);
  }
};
