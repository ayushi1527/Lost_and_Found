// import React from "react";

export default function WeOffer() {
  return (
    <section className="flex items-center justify-center  ">
      
      <div className="w-full max-w-6xl p-10">
        {/* Heading */}
        <div className="flex flex-col items-center mb-10">
          <h4 className="text-themeGreen text-md font-medium ">
            What we offer
          </h4>
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-2 text-center md:text-left">
            Key Features
          </h2>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="bg-themeCream flex flex-col items-center text-center p-4 shadow-md transform transition-transform duration-300 hover:scale-105">
            <img
              src="/featuresAbout/1.jpg"
              alt="Verified Community"
              className="w-52 h-52 mb-4 object-cover"
            />
            <h3 className="font-semibold text-lg">Verified Community</h3>
            <p className="text-sm text-gray-600">
              Exclusive to IGDTUW students for trust & safety.
            </p>
          </div>

          <div className="bg-themeCream flex flex-col items-center text-center p-4 shadow-md transform transition-transform duration-300 hover:scale-105">
            <img
              src="/featuresAbout/2.jpg"
              alt="Quick Posting"
              className="w-52 h-52 mb-4 object-cover"
            />
            <h3 className="font-semibold text-lg">Quick Posting & Search</h3>
            <p className="text-sm text-gray-600">
              Easily list or find lost items within seconds.
            </p>
          </div>

          <div className="bg-themeCream flex flex-col items-center text-center p-4 shadow-md transform transition-transform duration-300 hover:scale-105">
            <img
              src="/featuresAbout/3.jpg"
              alt="Categorized Items"
              className="w-52 h-52 mb-4 object-cover"
            />
            <h3 className="font-semibold text-lg">Categorized Items</h3>
            <p className="text-sm text-gray-600">
              Filter by ID cards, books, electronics & more.
            </p>
          </div>

          <div className="bg-themeCream flex flex-col items-center text-center p-4 shadow-md transform transition-transform duration-300 hover:scale-105">
            <img
              src="/featuresAbout/4.jpg"
              alt="No WhatsApp Forwards"
              className="w-52 h-52 mb-4 object-cover"
            />
            <h3 className="font-semibold text-lg">No WhatsApp Spams</h3>
            <p className="text-sm text-gray-600">
              Reduces reliance on notice boards & chat groups.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
