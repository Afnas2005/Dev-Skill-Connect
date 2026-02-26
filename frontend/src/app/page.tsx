"use client";

import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (
    <div style={{ padding: 40 }}>
      <h1>DevSkill Connect 🚀</h1>
      <p>Welcome! Choose an option:</p>

      <div style={{ marginTop: 20 }}>
        <button onClick={() => router.push("/login")}>Login</button>
        <button onClick={() => router.push("/register")} style={{ marginLeft: 10 }}>
          Register
        </button>
      </div>
    </div>
  );
}