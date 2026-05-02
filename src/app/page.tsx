"use client";
import Navbar from "@/components/navbar";
import Loading from "@/components/ui/loading";
import { useAuth } from "@/hooks/use-auth";
import { useItem } from "@/hooks/use-item";
import Image from "next/image";

export default function Home() {
  const { profile, isLoading } = useAuth();
  const { items, isLoading: itemsLoading, error, meals, snacks, drinks } = useItem();

  if (isLoading || !profile || itemsLoading) return <Loading />

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 h-14 border-b border-neutral-100 bg-white/80 px-4 backdrop-blur-xl">
        <Navbar placeholder="search..." />
      </header>

      <div className="mx-auto max-w-6xl p-6 sm:p-10">
        {meals.map((meal) => (
          <div key={meal.id}>
            {meal.name}-{meal.price}
          </div>
        ))}

        {drinks.map((drink) => (
          <div key={drink.id}>
            {drink.name}-{drink.price}
            <img src={drink.image} alt={drink.name} />
          </div>
        ))}



        {snacks.map((snack) => (
          <div key={snack.id}>
            {snack.name}-{snack.price}
          </div>
        ))}
      </div>
    </main>
  );
}
