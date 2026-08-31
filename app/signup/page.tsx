"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSignup(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    if (!response.ok) {
      const body = await response.json();
      setError(body.error ?? "Something went wrong");
      return;
    }

    router.push("/login");
  }

  return (
    <div className="max-w-sm mx-auto mt-16 px-4">
      <div className="border border-gray-200 rounded-lg p-6">
        <h1 className="text-xl font-bold text-gray-900 mb-4">Sign Up</h1>
        <form onSubmit={handleSignup} className="flex flex-col gap-3">
          <label className="sr-only" htmlFor="signup-name">Name</label>
          <Input
            id="signup-name"
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <label className="sr-only" htmlFor="signup-email">Email</label>
          <Input
            id="signup-email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <label className="sr-only" htmlFor="signup-password">Password</label>
          <Input
            id="signup-password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" size="lg">Sign Up</Button>
        </form>
        {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
        <p className="text-sm text-gray-600 mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-gray-900 underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
