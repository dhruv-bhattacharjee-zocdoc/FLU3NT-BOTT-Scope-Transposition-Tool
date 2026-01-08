import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function LaunchAnimation({ onComplete, onZocdocReady }) {
  const [showAnimation, setShowAnimation] = useState(true);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [showBackground, setShowBackground] = useState(true);
  const [showByPDO, setShowByPDO] = useState(false);

  useEffect(() => {
    // Show "Fluent ~By PDO" after Zocdoc fades in (with a slight delay)
    const byPDOTimer = setTimeout(() => {
      setShowByPDO(true);
    }, 800); // Show after Zocdoc fade-in completes (0.6s + 0.2s delay)

    // Animation timing: 800ms (show) + 200ms (delay) + 500ms (duration) = 1500ms (fully visible)
    // Hide "Fluent ~By PDO" after 1.5 seconds of being fully visible
    const hideByPDOTimer = setTimeout(() => {
      setShowByPDO(false);
    }, 3000); // 1500ms (fully visible) + 1500ms (stay duration) = 3000ms

    // Start the animation sequence after "Fluent ~By PDO" has been visible for 1.5 seconds
    const timer = setTimeout(() => {
      setAnimationComplete(true);
      // Notify parent that Zocdoc is ready to be displayed (when it reaches top right)
      if (onZocdocReady) {
        setTimeout(() => {
          onZocdocReady();
        }, 800); // Wait for movement animation to complete
      }
      // Fade out background after movement animation completes
      setTimeout(() => {
        setShowBackground(false);
        if (onComplete) onComplete();
      }, 800); // Wait for movement animation to complete
    }, 3000); // Wait until "Fluent ~By PDO" has been fully visible for 1.5 seconds before moving

    return () => {
      clearTimeout(timer);
      clearTimeout(byPDOTimer);
      clearTimeout(hideByPDOTimer);
    };
  }, [onComplete, onZocdocReady]);

  return (
    <>
      {/* Background overlay that fades out */}
      <AnimatePresence>
        {showBackground && (
          <motion.div 
            className="fixed inset-0 bg-neutral-50 z-50"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>

      {/* Zocdoc text animation - stays visible until parent takes over */}
      <AnimatePresence>
        {!animationComplete ? (
          // Centered "Zocdoc" during launch
          <motion.div
            key="centered"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="fixed inset-0 flex items-center justify-center z-50"
          >
            <div className="relative inline-block">
              <motion.h1 
                style={{ fontSize: '140px' }} 
                className="zocdoc-font"
                animate={{ fontSize: '140px' }}
              >
                Zocdoc
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ 
                  opacity: showByPDO ? 1 : 0,
                  y: showByPDO ? 0 : -10
                }}
                transition={{ 
                  duration: 0.5, 
                  ease: 'easeOut',
                  delay: 0.2
                }}
                className="absolute bottom-0 right-0 text-lg font-medium whitespace-nowrap"
                style={{ color: '#000769', transform: 'translateY(100%)' }}
              >
                Fluent ~By PDO
              </motion.p>
            </div>
          </motion.div>
        ) : (
          // Animated to top center - stays visible until parent renders
          <motion.div
            key="top-center"
            initial={{ 
              position: 'fixed',
              top: '50%',
              left: '50%',
              x: '-50%',
              y: '-50%',
              zIndex: 50
            }}
            animate={{ 
              top: '24px',
              left: '50%',
              right: 'auto',
              x: '-50%',
              y: '0%',
              zIndex: 40
            }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            className="fixed"
            style={{ pointerEvents: 'none' }}
          >
            <motion.h1 
              initial={{ fontSize: '140px' }}
              animate={{ fontSize: '36px' }}
              transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
              className="zocdoc-font"
            >
              Zocdoc
            </motion.h1>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

