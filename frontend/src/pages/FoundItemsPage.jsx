import React from "react";
import ItemsList from "../components/ItemsList";

export default function FoundItemsPage() {
  return (
    <div>
      <header className="bg-white shadow py-6">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-2xl font-semibold">Found Items</h1>
        </div>
      </header>
      <main className="py-6">
        <ItemsList fixedType="found" />
      </main>
    </div>
  );
}
