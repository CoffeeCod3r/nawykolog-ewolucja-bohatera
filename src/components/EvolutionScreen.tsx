import React, { useEffect } from "react";
import { motion } from "framer-motion";
import AnimalAvatar from "./AnimalAvatar";
import { AnimalType } from "@/lib/animalConfig";

interface EvolutionScreenProps {
  animalType: AnimalType;
  newStage: 1 | 2 | 3 | 4;
  onComplete?: () => void;
}

const EvolutionScreen: React.FC<EvolutionScreenProps> = ({
  animalType,
  newStage,
  onComplete,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete?.();
    }, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
    >
      {/* Particle effects */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0.5] }}
        transition={{ duration: 2.5 }}
        className="absolute inset-0 pointer-events-none"
      >
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background:
                newStage === 4
                  ? `hsl(${45}, ${100}%, ${50 + Math.random() * 30}%)`
                  : newStage === 3
                    ? `hsl(${270}, ${100}%, ${50 + Math.random() * 30}%)`
                    : newStage === 2
                      ? `hsl(${210}, ${100}%, ${50 + Math.random() * 30}%)`
                      : `hsl(${0}, ${0}%, ${50 + Math.random() * 30}%)`,
            }}
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
              y: [Math.random() * 200 - 100, Math.random() * 400 - 200],
              x: [Math.random() * 200 - 100, Math.random() * 400 - 200],
            }}
            transition={{
              duration: 2.5,
              delay: Math.random() * 0.5,
              ease: "easeOut",
            }}
          />
        ))}
      </motion.div>

      {/* Center content */}
      <motion.div
        className="relative z-10 text-center space-y-6"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        {/* Animal avatar with glow */}
        <motion.div
          animate={{
            scale: [0.8, 1.1, 1],
            opacity: [0.5, 1, 1],
          }}
          transition={{
            duration: 2.5,
            ease: "easeOut",
          }}
          className="flex justify-center"
        >
          <AnimalAvatar
            animalType={animalType}
            stage={newStage}
            size="hero"
            showGlow={true}
            animate="none"
          />
        </motion.div>

        {/* Text content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="space-y-2"
        >
          <h2 className="text-4xl font-bold text-white drop-shadow-lg">
            Ewolucja!
          </h2>
          <p className="text-xl text-gray-200 drop-shadow-md">
            Twoje zwierzę osiągnęło etap {newStage}/4
          </p>
        </motion.div>

        {/* Stage progression */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
          className="flex justify-center gap-2 pt-4"
        >
          {[1, 2, 3, 4].map((stage) => (
            <motion.div
              key={stage}
              className={`w-4 h-4 rounded-full ${
                stage <= newStage
                  ? "bg-gradient-to-r from-amber-400 to-amber-600"
                  : "bg-gray-600"
              }`}
              animate={
                stage === newStage
                  ? { scale: [1, 1.5, 1], boxShadow: ["0 0 0px", "0 0 20px"] }
                  : {}
              }
              transition={{ duration: 0.6, repeat: stage === newStage ? 2 : 0 }}
            />
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default EvolutionScreen;
