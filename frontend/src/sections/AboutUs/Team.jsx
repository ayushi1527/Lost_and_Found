import React from "react";

function Team() {
  return (
    <div className="py-2 flex items-center mb-8 justify-center">
      <div className="flex w-[900px] rounded-3xl overflow-hidden">
        <div className="flex-1 p-10">
          <div className="flex flex-col items-center mb-10">
            <h4 className="text-themeGreen text-md font-medium mb-1">
              The people behind it all
            </h4>
            <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 text-center md:text-left">
              Meet Our team
            </h2>
          </div>

          {/* First two team members */}
          <div className="flex items-center justify-center gap-10 mb-10">
            <div className="bg-white flex flex-col items-center text-center p-4 shadow-md ">
              <img
                src="/members/harshita.jpg"
                alt="Harshita Bansal"
                className="w-52 h-52 mb-4 object-cover"
              />
              <h3 className="font-semibold text-lg">Harshita Bansal</h3>
              <p className="text-sm text-themeGreen">Frontend Developer</p>
            </div>
            <div className="bg-white flex flex-col items-center text-center p-4 shadow-md">
              <img
                src="/members/ayushi.jpg"
                alt="Ayushi Thakur"
                className="w-52 h-52 mb-4 object-cover"
              />
              <h3 className="font-semibold text-lg">Ayushi Thakur</h3>
              <p className="text-sm text-themeGreen">Frontend Developer</p>
            </div>
          </div>

          {/* Last three team members */}
          <div className="flex items-center justify-center gap-10">
            <div className="bg-white flex flex-col items-center text-center p-4 shadow-md">
              <img
                src="/members/Diya_2.jpg"
                alt="Diya Kotru"
                className="w-52 h-52 mb-4 object-cover"
              />
              <h3 className="font-semibold text-lg">Diya Kotru</h3>
              <p className="text-sm text-themeGreen">Backend Developer</p>
            </div>
            <div className="bg-white flex flex-col items-center text-center p-4 shadow-md">
              <img
                src="/members/devika.jpg"
                alt="Devika Dudhaniya"
                className="w-52 h-52 mb-4 object-cover"
              />
              <h3 className="font-semibold text-lg">Devika Dudhaniya</h3>
              <p className="text-sm text-themeGreen">Backend Developer</p>
            </div>
            <div className="bg-white flex flex-col items-center text-center p-4 shadow-md">
              <img
                src="/members/akshita.jpg"
                alt="Akshita Tanwar"
                className="w-52 h-52 mb-4 object-cover"
              />
              <h3 className="font-semibold text-lg">Akshita Tanwar</h3>
              <p className="text-themeGreen text-sm">Backend Developer</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Team;
