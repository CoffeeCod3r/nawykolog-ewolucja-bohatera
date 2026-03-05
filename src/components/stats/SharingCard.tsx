import React from "react";
import { YearlyStats } from "@/hooks/useStats";
import { AnimalType, getAnimalImageUrl } from "@/lib/animalConfig";

interface SharingCardProps {
  stats: YearlyStats;
  animalType?: AnimalType;
  animalStage?: 1 | 2 | 3 | 4;
}

const SharingCard: React.FC<SharingCardProps> = ({
  stats,
  animalType = "wolf",
  animalStage = 1,
}) => {
  const imageUrl = getAnimalImageUrl(animalType, animalStage);
  return (
    <div
      className="w-full max-w-md mx-auto p-8 rounded-2xl text-white relative"
      style={{
        background: "linear-gradient(135deg, #0F172A 0%, #22c55e 100%)",
        aspectRatio: "9/16",
      }}
    >
      {/* Background gradient overlay */}
      <div className="absolute inset-0 rounded-2xl opacity-30 pointer-events-none" />

      {/* Content */}
      <div className="relative h-full flex flex-col justify-between">
        {/* Header */}
        <div className="text-center">
          <p className="text-xs opacity-80">Mój rok w</p>
          <h1 className="text-4xl font-black tracking-tighter">Nawykolog</h1>
          <p className="text-xs opacity-80 mt-1">2026</p>
        </div>

        {/* Animal Image */}
        <div className="text-center">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={`${animalType} stage ${animalStage}`}
              style={{
                width: "120px",
                height: "120px",
                margin: "0 auto",
                objectFit: "contain",
              }}
            />
          ) : (
            <div className="text-8xl inline-block">?</div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 bg-black/20 rounded-xl p-4">
          <div className="text-center">
            <p className="text-3xl font-black">
              {stats.yearInNumbers.totalCompletions}
            </p>
            <p className="text-xs opacity-80">Nawyki</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-black">
              {stats.yearInNumbers.longestStreak}
            </p>
            <p className="text-xs opacity-80">Dni streaka</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-black">
              {stats.yearInNumbers.totalCoins.toLocaleString()}
            </p>
            <p className="text-xs opacity-80">Monet</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-black">
              {stats.yearInNumbers.totalDaysActive}
            </p>
            <p className="text-xs opacity-80">Dni aktywacji</p>
          </div>
        </div>

        {/* Favorite Habit */}
        {stats.yearInNumbers.favoriteHabit && (
          <div className="bg-black/20 rounded-xl p-3 text-center">
            <p className="text-xs opacity-80 mb-1">Ulubiony nawyk</p>
            <p className="text-lg font-bold flex items-center justify-center gap-2">
              <span>{stats.yearInNumbers.favoriteHabit.emoji}</span>
              <span>{stats.yearInNumbers.favoriteHabit.name}</span>
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-xs opacity-70">
          <p>Zachowaj motywację 💪</p>
        </div>
      </div>
    </div>
  );
};

// Exported as a hidden component that can be rendered off-screen for screenshot
export const SharingCardPrinter = React.forwardRef<
  HTMLDivElement,
  SharingCardProps
>(({ stats, animalType, animalStage }, ref) => {
  return (
    <div
      ref={ref}
      style={{
        position: "fixed",
        left: "-9999px",
        top: "-9999px",
        width: "540px",
        height: "960px",
      }}
    >
      <SharingCard
        stats={stats}
        animalType={animalType}
        animalStage={animalStage}
      />
    </div>
  );
});

SharingCardPrinter.displayName = "SharingCardPrinter";

export default SharingCard;
