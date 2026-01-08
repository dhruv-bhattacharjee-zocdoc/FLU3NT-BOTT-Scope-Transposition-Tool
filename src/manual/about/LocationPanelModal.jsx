import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, MousePointer2, Info } from 'lucide-react';

// Location and Practice Assignment Panel Animation Modal Component
export default function LocationPanelAnimationModal({ isOpen, onClose, items = [] }) {
  const [step, setStep] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showMouseClick, setShowMouseClick] = useState(false);
  const [practiceIdText, setPracticeIdText] = useState('');
  const [isLoadingPracticeName, setIsLoadingPracticeName] = useState(false);
  const [practiceName, setPracticeName] = useState('');
  const mouseAnimationRef = React.useRef(null);
  const mousePosRef = React.useRef({ x: 0, y: 0 });
  const containerRef = React.useRef(null);
  const practiceIdInputRef = React.useRef(null);

  // Sync ref with state
  React.useEffect(() => {
    mousePosRef.current = mousePosition;
  }, [mousePosition]);

  useEffect(() => {
    if (!isOpen) {
      setStep(0);
      setPracticeIdText('');
      setIsLoadingPracticeName(false);
      setPracticeName('');
      setShowMouseClick(false);
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

    const animationSequence = async () => {
      // Reset state
      setStep(0);
      setPracticeIdText('');
      setIsLoadingPracticeName(false);
      setPracticeName('');
      setShowMouseClick(false);
      const startPos = { x: 50, y: 50 };
      setMousePosition(startPos);
      mousePosRef.current = startPos;
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Step 1: Move mouse to 'Enter Practice IDs...' input field
      setStep(1);
      // Wait for DOM to be ready
      await new Promise(resolve => setTimeout(resolve, 200));
      // Get actual position of Practice ID input
      let practiceIdInputPos = { x: 150, y: 180 }; // Fallback
      if (practiceIdInputRef.current && containerRef.current) {
        const inputRect = practiceIdInputRef.current.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();
        practiceIdInputPos = {
          x: inputRect.left - containerRect.left + inputRect.width / 2,
          y: inputRect.top - containerRect.top + inputRect.height / 2
        };
      }
      await animateMouseTo(practiceIdInputPos, 1000);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Step 2: Click input field
      setStep(2);
      setShowMouseClick(true);
      await new Promise(resolve => setTimeout(resolve, 700));
      setShowMouseClick(false);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Step 3: Type '144033'
      setStep(3);
      const text = '144033';
      for (let i = 0; i <= text.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setPracticeIdText(text.substring(0, i));
      }
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Step 4: Show "Loading Practice Name.." in italics
      setStep(4);
      setIsLoadingPracticeName(true);
      setPracticeName('');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Step 5: Show Practice Name
      setStep(5);
      setIsLoadingPracticeName(false);
      setPracticeName('Intermountain Health UT - Central Women\'s Health');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Step 6: Fade out
      setStep(6);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset and repeat
      setStep(0);
      setPracticeIdText('');
      setIsLoadingPracticeName(false);
      setPracticeName('');
      await new Promise(resolve => setTimeout(resolve, 1000));
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
          <h3 className="text-2xl font-semibold text-neutral-800">Location & Practice Assignment Panel</h3>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-700 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div 
          ref={containerRef}
          className={`relative bg-neutral-50 rounded-lg border-2 border-amber-300 shadow-sm p-4 transition-opacity duration-500 ${step === 6 ? 'opacity-30' : 'opacity-100'}`}
        >
          {/* Animated Mouse Pointer */}
          {(step >= 1 && step <= 3) && (
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
              {showMouseClick && (
                <motion.div
                  className="absolute inset-0"
                  initial={{ scale: 1 }}
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="absolute inset-0 bg-blue-400 rounded-full blur-md opacity-50" />
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Location Panel Header */}
          <div className="mb-3">
            <h5 className="text-sm font-semibold text-neutral-800 mb-3">Location</h5>
            
            {/* Location Mappings Table */}
            <div className="border rounded-lg overflow-hidden mb-4">
              <table className="w-full text-xs">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="text-left py-2 px-2 font-semibold text-neutral-600">Detected As</th>
                    <th className="text-left py-2 px-2 font-semibold text-neutral-600">Column Name</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-neutral-100">
                    <td className="py-2 px-2">
                      <span className="text-xs font-medium text-stone-600">Practice ID</span>
                    </td>
                    <td className="py-2 px-2 text-sm">Practice_ID</td>
                  </tr>
                  <tr className="border-t border-neutral-100">
                    <td className="py-2 px-2">
                      <span className="text-xs font-medium text-violet-600">State</span>
                    </td>
                    <td className="py-2 px-2 text-sm">State</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Practice ID Input */}
            <div className="bg-neutral-50 p-3 rounded-lg border border-amber-200">
              <h6 className="text-xs font-semibold text-neutral-700 mb-2">Practice ID</h6>
              <input
                ref={practiceIdInputRef}
                type="text"
                className="w-full px-2 py-1.5 border-2 border-neutral-300 rounded-lg text-xs"
                placeholder="Enter Practice IDs..."
                value={practiceIdText}
                readOnly
              />
              <p className="text-xs text-neutral-500 mt-1">Enter multiple Practice IDs separated by comma</p>
            </div>

            {/* Practice Name Box */}
            {(isLoadingPracticeName || practiceName) && (
              <motion.div
                className="mt-3 bg-white p-3 rounded-lg border border-amber-200"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h6 className="text-xs font-semibold text-neutral-700 mb-2">Practice Name</h6>
                {isLoadingPracticeName ? (
                  <p className="text-xs text-neutral-500 italic">Loading Practice Name..</p>
                ) : (
                  <p className="text-xs text-neutral-700">{practiceName}</p>
                )}
              </motion.div>
            )}
          </div>

          {/* Location Mapping Info */}
          <div className="mt-3 pt-3 border-t border-neutral-200 flex items-center justify-between">
            <div className="text-xs text-neutral-600">
              <span className="font-medium">Case:</span> 3
            </div>
            <button className="p-1 rounded-lg hover:bg-neutral-100">
              <Info className="h-3 w-3 text-neutral-500" />
            </button>
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

