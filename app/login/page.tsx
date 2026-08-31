"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const body = await response.json();
      setError(body.error ?? "Something went wrong");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="max-w-sm mx-auto mt-16 px-4">
      <div className="border border-gray-200 rounded-lg p-6">
        <h1 className="text-xl font-bold text-gray-900 mb-4">Log In</h1>
        <form onSubmit={handleLogin} className="flex flex-col gap-3">
          <label className="sr-only" htmlFor="login-email">Email</label>
          <Input
            id="login-email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <label className="sr-only" htmlFor="login-password">Password</label>
          <Input
            id="login-password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" size="lg">Log In</Button>
        </form>
        {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
        <p className="text-sm text-gray-600 mt-4">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-gray-900 underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
