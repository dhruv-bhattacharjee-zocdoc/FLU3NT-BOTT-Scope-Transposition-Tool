import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, MousePointer2, Check } from 'lucide-react';

// Breadcrumb and Toast Animation Modal Component
export default function BreadcrumbToastAnimationModal({ isOpen, onClose, items = [] }) {
  const [step, setStep] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [breadcrumbExpanded, setBreadcrumbExpanded] = useState(false);
  const [timerValue, setTimerValue] = useState(51); // Start from 0:51
  const [showNotification, setShowNotification] = useState(false);
  const mouseAnimationRef = React.useRef(null);
  const mousePosRef = React.useRef({ x: 0, y: 0 });
  const containerRef = React.useRef(null);
  const breadcrumbRef = React.useRef(null);
  const toastRef = React.useRef(null);
  const timerRef = React.useRef(null);
  const notificationRef = React.useRef(null);

  // Sync ref with state
  React.useEffect(() => {
    mousePosRef.current = mousePosition;
  }, [mousePosition]);

  useEffect(() => {
    if (!isOpen) {
      setStep(0);
      setBreadcrumbExpanded(false);
      setTimerValue(51);
      setShowNotification(false);
      setMousePosition({ x: 0, y: 0 });
      mousePosRef.current = { x: 0, y: 0 };
      return;
    }

    const animateMouseTo = async (targetPos, duration) => {
      return new Promise((resolve) => {
        const startPos = { ...mousePosRef.current };
        const startTime = Date.now();
        
        const animate = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic
          
          const currentX = startPos.x + (targetPos.x - startPos.x) * easeProgress;
          const currentY = startPos.y + (targetPos.y - startPos.y) * easeProgress;
          
          const newPos = { x: currentX, y: currentY };
          setMousePosition(newPos);
          mousePosRef.current = newPos;
          
          if (progress < 1) {
            mouseAnimationRef.current = requestAnimationFrame(animate);
          } else {
            resolve();
          }
        };
        
        mouseAnimationRef.current = requestAnimationFrame(animate);
      });
    };

    const formatTimer = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const animationSequence = async () => {
      try {
        // Reset state
        setStep(0);
        setBreadcrumbExpanded(false);
        setTimerValue(51);
        setShowNotification(false);
        const startPos = { x: 50, y: 50 };
        setMousePosition(startPos);
        mousePosRef.current = startPos;
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Step 1: Move mouse to 'Ready' breadcrumb
        setStep(1);
        await new Promise(resolve => setTimeout(resolve, 200));
        let breadcrumbPos = { x: 200, y: 150 }; // Fallback
        if (breadcrumbRef.current && containerRef.current) {
          const breadcrumbRect = breadcrumbRef.current.getBoundingClientRect();
          const containerRect = containerRef.current.getBoundingClientRect();
          breadcrumbPos = {
            x: breadcrumbRect.left - containerRect.left + breadcrumbRect.width / 2,
            y: breadcrumbRect.top - containerRect.top + breadcrumbRect.height / 2
          };
        }
        await animateMouseTo(breadcrumbPos, 1000);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Step 2: Hover over breadcrumb - breadcrumbs expand
        setStep(2);
        setBreadcrumbExpanded(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Step 3: Move mouse to timer (2-3 pixels to the right)
        setStep(3);
        await new Promise(resolve => setTimeout(resolve, 200));
        let timerPos = { x: 250, y: 200 }; // Fallback
        if (timerRef.current && containerRef.current) {
          const timerRect = timerRef.current.getBoundingClientRect();
          const containerRect = containerRef.current.getBoundingClientRect();
          timerPos = {
            x: timerRect.left - containerRect.left + timerRect.width / 2 + 2.5, // 2-3 pixels to the right
            y: timerRect.top - containerRect.top + timerRect.height / 2
          };
        }
        await animateMouseTo(timerPos, 1000);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Step 4: Timer starts from 0:51 and counts to 0:54
        setStep(4);
        for (let i = 51; i <= 54; i++) {
          setTimerValue(i);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Step 5: Move mouse to notification area (same position as toast)
        setStep(5);
        await new Promise(resolve => setTimeout(resolve, 200));
        let notificationPos = { x: 200, y: 300 }; // Fallback - same as toast position
        if (toastRef.current && containerRef.current) {
          const toastRect = toastRef.current.getBoundingClientRect();
          const containerRect = containerRef.current.getBoundingClientRect();
          notificationPos = {
            x: toastRect.left - containerRect.left + toastRect.width / 2,
            y: toastRect.top - containerRect.top + toastRect.height / 2
          };
        }
        await animateMouseTo(notificationPos, 1000);
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Step 6: Notification slides in from left (in same position as toast)
        setStep(6);
        setShowNotification(true);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Stay for 2 seconds
        
        // Step 7: Notification fades off
        setStep(7);
        setShowNotification(false);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Reset and repeat
        setStep(0);
        setBreadcrumbExpanded(false);
        setTimerValue(51);
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error("Animation sequence error:", error);
      }
    };

    let timeoutId;
    const runAnimation = () => {
      animationSequence().then(() => {
        timeoutId = setTimeout(runAnimation, 0);
      }).catch((error) => {
        console.error('Animation error:', error);
        timeoutId = setTimeout(runAnimation, 2000);
      });
    };

    runAnimation();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (mouseAnimationRef.current) cancelAnimationFrame(mouseAnimationRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-lg shadow-2xl p-8 max-w-4xl w-full mx-4"
        style={{ height: '700px', overflowY: 'auto' }}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-semibold text-neutral-800">Process Flow Status Breadcrumb & Toasts</h3>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-700 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div 
          ref={containerRef}
          className="relative bg-neutral-50 rounded-lg border-2 border-cyan-300 shadow-sm p-6 min-h-[400px]"
        >
          {/* Animated Mouse Pointer */}
          {(step >= 1 && step <= 6) && (
            <motion.div
              className="absolute z-50 pointer-events-none"
              style={{
                left: `${mousePosition.x}px`,
                top: `${mousePosition.y}px`,
                transform: 'translate(-50%, -50%)'
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <MousePointer2 className="h-5 w-5 text-blue-600 drop-shadow-lg" />
            </motion.div>
          )}

          <div className="flex flex-col items-center gap-6">
            {/* Breadcrumb */}
            <motion.div
              ref={breadcrumbRef}
              className="bg-white rounded-full shadow-lg py-2 px-4 flex items-center gap-2"
              initial={{ width: 'auto', opacity: 1 }}
              animate={{
                width: breadcrumbExpanded ? 'auto' : 'auto',
                opacity: 1
              }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              {breadcrumbExpanded ? (
                <>
                  <div className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-semibold">
                    <Check className="h-3 w-3" />
                  </div>
                  <span className="text-xs font-medium text-green-700">Sheet Upload</span>
                  <div className="h-0.5 w-8 bg-green-300"></div>
                  <div className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-semibold">
                    <Check className="h-3 w-3" />
                  </div>
                  <span className="text-xs font-medium text-green-700">Mappings</span>
                  <div className="h-0.5 w-8 bg-green-300"></div>
                  <div className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-semibold">
                    <Check className="h-3 w-3" />
                  </div>
                  <span className="text-xs font-medium text-green-700">Transposing</span>
                  <div className="h-0.5 w-8 bg-green-300"></div>
                  <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-semibold">
                    <Check className="h-3 w-3" />
                  </div>
                  <span className="text-xs font-medium text-green-700">Ready</span>
                </>
              ) : (
                <>
                  <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-semibold">
                    <Check className="h-3 w-3" />
                  </div>
                  <span className="text-xs font-medium text-green-700">Ready</span>
                </>
              )}
            </motion.div>
            
            {/* Timer */}
            <div 
              ref={timerRef}
              className="bg-green-600 text-white rounded-full shadow-lg py-2 px-4 flex items-center gap-2"
            >
              <Check className="h-4 w-4" />
              <span className="text-sm font-medium">{formatTimer(timerValue)}</span>
            </div>
            
            {/* Toast / Notification - same position */}
            <div 
              ref={toastRef}
              className="relative"
              style={{ minHeight: '40px' }}
            >
              {!showNotification ? (
                <div className="bg-neutral-800 text-white px-4 py-2 rounded-lg shadow-lg text-sm">
                  Files created successfully
                </div>
              ) : (
                <AnimatePresence>
                  <motion.div
                    ref={notificationRef}
                    className="bg-neutral-800 text-white px-4 py-2 rounded-lg shadow-lg text-sm"
                    initial={{ opacity: 0, x: -200 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  >
                    Files created successfully
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          </div>
        </div>

        {/* Pointers/Annotations - Section Items */}
        <div className="mt-6">
          <h4 className="text-lg font-semibold text-neutral-800 mb-3">Key Points:</h4>
          <ul className="text-neutral-600 space-y-2 list-disc list-inside">
            {items.map((item, itemIndex) => (
              <li key={itemIndex}>{item}</li>
            ))}
          </ul>
        </div>
      </motion.div>
    </motion.div>
  );
}

