import React from "react";

// display the three eagle evolution stages as decorative avatars
import eagle1 from "@/assets/orzel_ewolucja_1.jpg";
import eagle2 from "@/assets/orzel_ewolucja_2.jpg";
import eagle3 from "@/assets/orzel_ewolucja_3.jpg";

const profiles = [eagle1, eagle2, eagle3];

const EagleAvatars: React.FC = () => (
  <div className="flex gap-6 justify-center items-center py-8">
    {profiles.map((src, i) => (
      <div key={i} className="text-center">
        <img
          src={src}
          alt={`Orzeł etap ${i + 1}`}
          className="w-24 h-24 rounded-full object-cover"
        />
      </div>
    ))}
  </div>
);

export default EagleAvatars;
