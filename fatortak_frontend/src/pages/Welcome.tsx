
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Welcome Component - Final Refinement
 * 1. Page 1 (Dark): "Welcome to Fatortak" + Booming Celebration
 * 2. Page 2 (Dark): Secondary Onboarding Message
 * 3. Page 3 (White): Final Ready State + Dashboard Button
 */
const Welcome = () => {
  const { t, isRTL } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0); // 0: Dark, 1: Dark, 2: White

  const triggerBoom = () => {
    const duration = 2 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 50 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);

    // Initial big boom
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 }
    });

    return () => clearInterval(interval);
  };

  useEffect(() => {
    if (step === 0) {
      // Boom on first page
      triggerBoom();
    }

    if (step < 2) {
      const timer = setTimeout(() => {
        setStep(prev => prev + 1);
      }, 3000); // 3 seconds per step
      return () => clearTimeout(timer);
    }
  }, [step]);

  const handleStart = () => {
    navigate("/dashboard");
  };

  const isWhiteBg = step === 2;

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-6  duration-1000 ${isWhiteBg ? "bg-white" : "bg-slate-950"}`}>
      <motion.div
        key={step}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-4xl text-center z-10"
      >
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none mb-4">
                {t("welcomeToFatortak")}
              </h1>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight px-12 leading-tight">
                {t("onboardingMsg1")}
              </h1>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-12"
            >
              <h1 className="text-5xl md:text-7xl font-black text-slate-950 tracking-tighter mb-4">
                {t("readyToStart")}
              </h1>
              
              <button
                onClick={handleStart}
                className={`inline-flex items-center justify-center px-12 py-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-black text-2xl transition-all shadow-xl hover:scale-105 active:scale-95 focus-visible:outline-none ${isRTL ? "font-secondary" : ""}`}
              >
                {t("goToDashboard")}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Footer Branding - Adaptive */}
      <div className={`absolute bottom-8 text-[11px] font-black tracking-[0.4em] uppercase transition-colors duration-1000 ${isWhiteBg ? "text-slate-200" : "text-white/10"}`}>
        Fatortak Enterprise &bull; {t("businessManagement")}
      </div>
    </div>
  );
};

export default Welcome;
