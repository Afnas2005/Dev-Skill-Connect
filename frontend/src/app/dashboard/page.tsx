"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { logout } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/me");
        setUser(res.data.user);
      } catch (err: any) {
        console.error("Failed to fetch user:", err);
        setError("Session expired. Redirecting to login...");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    try {
      await logout();
      alert("Logged out successfully!");
      router.push("/login");
    } catch (err) {
      console.error("Logout error:", err);
      alert("Logout failed");
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <p style={{ color: "red" }}>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px", maxWidth: "600px", margin: "0 auto" }}>
      <h1>Dashboard</h1>
      {user ? (
        <div>
          <div
            style={{
              padding: "20px",
              backgroundColor: "#f5f5f5",
              borderRadius: "4px",
              marginBottom: "20px",
            }}
          >
            <p>
              <strong>Logged in as:</strong> {user.email}
            </p>
            <p style={{ fontSize: "12px", color: "#666" }}>
              Your session is stored in an HTTP-only cookie.
            </p>
          </div>
          <button
            onClick={handleLogout}
            style={{
              padding: "10px 20px",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      ) : (
        <p>User not found. Please login again.</p>
      )}
    </div>
  );
}
