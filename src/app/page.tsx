"use client";
import Navbar from "@/components/navbar";
import Loading from "@/components/ui/loading";
import { useAuth } from "@/context/auth.context";

export default function Home() {
  const { profile, isLoading } = useAuth();

  if (isLoading) return <Loading />

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 h-14 border-b border-neutral-100 bg-white/80 px-4 backdrop-blur-xl">
        <Navbar placeholder="search..." />
      </header>

      <div className="mx-auto max-w-6xl p-6 sm:p-10">

        Soon...
      </div>
    </main>
  );
}
