import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ANIMAL_TYPES,
  AnimalType,
  AnimalSize,
  AnimationType,
  SIZE_PIXELS,
  STAGE_COLORS,
  GLOW_BOX_SHADOWS,
  getAnimalImageUrl,
  getAnimalInitial,
} from "@/lib/animalConfig";

interface EquippedItem {
  id: string;
  name: string;
  image_url: string;
  effect_type?: "visual" | "aura" | "glow_color";
}

interface AnimalAvatarProps {
  animalType: AnimalType;
  stage?: 1 | 2 | 3 | 4;
  size?: AnimalSize;
  items?: EquippedItem[];
  showGlow?: boolean;
  animate?: AnimationType;
  onEvolutionComplete?: () => void;
  className?: string;
}

const AnimalAvatar: React.FC<AnimalAvatarProps> = ({
  animalType,
  stage = 1,
  size = "md",
  items = [],
  showGlow = false,
  animate = "none",
  onEvolutionComplete,
  className = "",
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [showEvolutionOverlay, setShowEvolutionOverlay] = useState(false);

  const sizePixels = SIZE_PIXELS[size];
  const stageColors = STAGE_COLORS[stage];
  const glowShadow = GLOW_BOX_SHADOWS[stage];
  const imageUrl = getAnimalImageUrl(animalType, stage);
  const visibleItems = items
    .filter((item) => item.effect_type === "visual")
    .slice(0, 3);

  // Handle evolution animation
  useEffect(() => {
    if (animate === "evolve") {
      setShowEvolutionOverlay(true);
      const timer = setTimeout(() => {
        setShowEvolutionOverlay(false);
        onEvolutionComplete?.();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [animate, onEvolutionComplete]);

  // Fallback circle with initial
  const fallbackColor = {
    1: "bg-gray-500",
    2: "bg-blue-500",
    3: "bg-purple-500",
    4: "bg-amber-500",
  };

  const idleVariants = {
    float: {
      y: [-6, 6],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const evolutionVariants = {
    animate: {
      scale: [0, 1.2, 1],
      transition: {
        duration: 2.5,
        ease: "easeOut" as const,
      },
    },
  };

  const victoryVariants = {
    bounce: {
      scale: [1, 1.05, 1],
      y: [0, -10, 0],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const getAnimationVariants = () => {
    if (animate === "idle") return idleVariants.float;
    if (animate === "evolve") return evolutionVariants.animate;
    if (animate === "victory") return victoryVariants.bounce;
    return {};
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Evolution Overlay */}
      {showEvolutionOverlay && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
        >
          <motion.div
            variants={evolutionVariants}
            animate="animate"
            className="relative"
          >
            {/* White glow effect */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: [0, 1, 0.5], scale: [0.5, 1.5, 1] }}
              transition={{ duration: 2.5 }}
              className="absolute inset-0 rounded-full blur-3xl"
              style={{
                background: `radial-gradient(circle, ${
                  stageColors.glow === "gold"
                    ? "rgba(251, 191, 36, 0.6)"
                    : stageColors.glow === "purple"
                      ? "rgba(168, 85, 247, 0.6)"
                      : stageColors.glow === "blue"
                        ? "rgba(96, 165, 250, 0.6)"
                        : "rgba(156, 163, 175, 0.6)"
                }, transparent)`,
              }}
            />

            {/* Animal image in center */}
            <div style={{ width: sizePixels, height: sizePixels }}>
              {!imageFailed && imageUrl ? (
                <img
                  src={imageUrl}
                  alt={`${animalType} stage ${stage}`}
                  style={{ width: "100%", height: "100%" }}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageFailed(true)}
                  className="object-cover"
                />
              ) : (
                <div
                  className={`w-full h-full rounded-full flex items-center justify-center text-white font-bold ${
                    fallbackColor[stage]
                  }`}
                  style={{ fontSize: `${sizePixels * 0.4}px` }}
                >
                  {getAnimalInitial(animalType)}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Main Avatar Container */}
      <motion.div
        variants={getAnimationVariants()}
        animate={animate !== "none" && animate !== "evolve" ? "float" : ""}
        style={{
          position: "relative",
          width: sizePixels,
          height: sizePixels,
          boxShadow: showGlow ? glowShadow : "none",
          borderRadius: "50%",
          overflow: "visible",
        }}
        className="transition-all duration-300"
      >
        {/* Glow ring (if showGlow) */}
        {showGlow && (
          <motion.div
            animate={{
              boxShadow: [
                glowShadow,
                `0 0 30px ${
                  stageColors.glow === "gold"
                    ? "rgba(251, 191, 36, 0.7)"
                    : stageColors.glow === "purple"
                      ? "rgba(168, 85, 247, 0.7)"
                      : stageColors.glow === "blue"
                        ? "rgba(96, 165, 250, 0.7)"
                        : "rgba(156, 163, 175, 0.7)"
                }`,
                glowShadow,
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 rounded-full"
          />
        )}

        {/* Animal Image */}
        <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br">
          {!imageFailed && imageUrl ? (
            <img
              src={imageUrl}
              alt={`${animalType} stage ${stage}`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageFailed(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className={`w-full h-full rounded-full flex items-center justify-center text-white font-bold ${
                fallbackColor[stage]
              } bg-gradient-to-br ${stageColors.primary}`}
            >
              <span style={{ fontSize: `${sizePixels * 0.4}px` }}>
                {animalType.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Equipped Items Overlay */}
        {visibleItems.length > 0 && (
          <div className="absolute inset-0">
            {visibleItems.map((item, index) => (
              <motion.img
                key={item.id}
                src={item.image_url}
                alt={item.name}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                className="absolute object-contain pointer-events-none"
                style={{
                  width: `${sizePixels * 0.6}px`,
                  height: `${sizePixels * 0.6}px`,
                  right: `${-sizePixels * 0.15}px`,
                  top: `${index * sizePixels * 0.3 - 10}px`,
                  filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
                }}
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* Victory Badge */}
      {animate === "victory" && (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          className="absolute -top-3 -right-3 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full p-2 shadow-lg"
        >
          <span className="text-lg">👑</span>
        </motion.div>
      )}
    </div>
  );
};

export default AnimalAvatar;
