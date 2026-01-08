import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, RotateCw, RefreshCw, Globe, Package, Database, MousePointer2, EyeOff } from 'lucide-react';

// Action Buttons Animation Modal Component
export default function ActionButtonsAnimationModal({ isOpen, onClose, items = [] }) {
  const [hoveredButton, setHoveredButton] = useState(null);
  const [clickedButton, setClickedButton] = useState(null);
  const [showSmartLearningModal, setShowSmartLearningModal] = useState(false);

  if (!isOpen) return null;

  const handleButtonClick = (buttonName) => {
    setClickedButton(buttonName);
    setTimeout(() => setClickedButton(null), 1000);
    
    if (buttonName === 'smartLearning') {
      setShowSmartLearningModal(true);
    }
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
          <h3 className="text-2xl font-semibold text-neutral-800">Action Buttons (Top Right)</h3>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-700 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="bg-neutral-50 rounded-lg border-2 border-red-300 shadow-sm p-6">
          <div className="flex flex-wrap gap-[1.76rem] justify-center">
            {/* 1. Upload Button - Arrow goes up */}
            <motion.div
              className="relative"
              onMouseEnter={() => setHoveredButton('upload')}
              onMouseLeave={() => setHoveredButton(null)}
              onClick={() => handleButtonClick('upload')}
            >
              <motion.button
                className="w-12 h-12 rounded-2xl bg-black text-white shadow hover:bg-neutral-800 transition-colors flex items-center justify-center cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Upload Files"
              >
                <motion.div
                  animate={
                    hoveredButton === 'upload' || clickedButton === 'upload'
                      ? { y: -4 }
                      : { y: 0 }
                  }
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <Upload className="h-5 w-5" />
                </motion.div>
              </motion.button>
              <p className="text-xs text-neutral-600 mt-2 text-center w-12 leading-tight">Upload</p>
            </motion.div>

            {/* 2. Convert Button - Spin, accelerate, slow down, wait 2s, repeat */}
            <motion.div
              className="relative flex flex-col items-center"
              onMouseEnter={() => setHoveredButton('convert')}
              onMouseLeave={() => setHoveredButton(null)}
              onClick={() => handleButtonClick('convert')}
            >
              <motion.button
                className="w-12 h-12 rounded-2xl bg-blue-600 text-white shadow hover:bg-blue-700 transition-colors flex items-center justify-center cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Convert"
              >
                <motion.div
                  animate={
                    hoveredButton === 'convert' || clickedButton === 'convert'
                      ? {
                          rotate: [0, 360],
                        }
                      : { rotate: 0 }
                  }
                  transition={
                    hoveredButton === 'convert' || clickedButton === 'convert'
                      ? {
                          rotate: {
                            repeat: Infinity,
                            duration: 1.5,
                            ease: [0.25, 0.1, 0.25, 1], // Accelerate then slow down
                            repeatDelay: 2, // Wait 2 seconds between repeats
                          }
                        }
                      : { duration: 0.3 }
                  }
                >
                  <RotateCw className="h-5 w-5" />
                </motion.div>
              </motion.button>
              <p className="text-xs text-neutral-600 mt-2 text-center w-12 leading-tight">Convert</p>
            </motion.div>

            {/* 3. Reset Button - Spin clockwise 2 times */}
            <motion.div
              className="relative flex flex-col items-center"
              onMouseEnter={() => setHoveredButton('reset')}
              onMouseLeave={() => setHoveredButton(null)}
              onClick={() => handleButtonClick('reset')}
            >
              <motion.button
                className="w-12 h-12 rounded-2xl bg-neutral-100 text-neutral-700 shadow hover:bg-neutral-200 transition-colors flex items-center justify-center cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Reset"
              >
                <motion.div
                  animate={
                    hoveredButton === 'reset' || clickedButton === 'reset'
                      ? { rotate: 720 } // 2 full rotations (720 degrees)
                      : { rotate: 0 }
                  }
                  transition={{
                    duration: 0.6,
                    ease: "easeInOut",
                    repeat: hoveredButton === 'reset' || clickedButton === 'reset' ? 1 : 0,
                  }}
                >
                  <RefreshCw className="h-5 w-5" />
                </motion.div>
              </motion.button>
              <p className="text-xs text-neutral-600 mt-2 text-center w-12 leading-tight">Reset</p>
            </motion.div>

            {/* 4. Check Connection Button - Globe icon glows and dims 4 times */}
            <motion.div
              className="relative flex flex-col items-center"
              onMouseEnter={() => setHoveredButton('checkConnection')}
              onMouseLeave={() => setHoveredButton(null)}
              onClick={() => handleButtonClick('checkConnection')}
            >
              <motion.button
                className="w-12 h-12 rounded-2xl bg-neutral-100 text-neutral-700 shadow transition-colors flex items-center justify-center cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Check Connection"
              >
                <motion.div
                  animate={
                    hoveredButton === 'checkConnection' || clickedButton === 'checkConnection'
                      ? {
                          filter: [
                            'drop-shadow(0 0 0px rgba(59, 130, 246, 0))',
                            'drop-shadow(0 0 8px rgba(59, 130, 246, 0.9))',
                            'drop-shadow(0 0 0px rgba(59, 130, 246, 0))',
                            'drop-shadow(0 0 8px rgba(59, 130, 246, 0.9))',
                            'drop-shadow(0 0 0px rgba(59, 130, 246, 0))',
                            'drop-shadow(0 0 8px rgba(59, 130, 246, 0.9))',
                            'drop-shadow(0 0 0px rgba(59, 130, 246, 0))',
                            'drop-shadow(0 0 8px rgba(59, 130, 246, 0.9))',
                            'drop-shadow(0 0 0px rgba(59, 130, 246, 0))',
                          ],
                        }
                      : { filter: 'drop-shadow(0 0 0px rgba(59, 130, 246, 0))' }
                  }
                  transition={
                    hoveredButton === 'checkConnection' || clickedButton === 'checkConnection'
                      ? {
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }
                      : { duration: 0.3 }
                  }
                >
                  <Globe className="h-5 w-5" />
                </motion.div>
              </motion.button>
              <p className="text-xs text-neutral-600 mt-2 text-center w-16 leading-tight">Check Connection</p>
            </motion.div>

            {/* 5. Package System Button - Shake and come to rest, repeating */}
            <motion.div
              className="relative flex flex-col items-center"
              onMouseEnter={() => setHoveredButton('packageSystem')}
              onMouseLeave={() => setHoveredButton(null)}
              onClick={() => handleButtonClick('packageSystem')}
            >
              <motion.button
                className="w-12 h-12 rounded-2xl bg-purple-600 text-white shadow hover:bg-purple-700 transition-colors flex items-center justify-center cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Packing System"
              >
                <motion.div
                  animate={
                    hoveredButton === 'packageSystem' || clickedButton === 'packageSystem'
                      ? {
                          x: [0, -3, 3, -3, 3, -2, 2, -1, 1, 0],
                          y: [0, -2, 2, -2, 2, -1, 1, -1, 1, 0],
                        }
                      : { x: 0, y: 0 }
                  }
                  transition={
                    hoveredButton === 'packageSystem' || clickedButton === 'packageSystem'
                      ? {
                          duration: 0.8,
                          repeat: Infinity,
                          ease: "easeOut",
                        }
                      : { duration: 0.3 }
                  }
                >
                  <Package className="h-5 w-5" />
                </motion.div>
              </motion.button>
              <p className="text-xs text-neutral-600 mt-2 text-center w-12 leading-tight break-words">Package<br />System</p>
            </motion.div>

            {/* 6. Smart Learning Button - Pulse animation */}
            <motion.div
              className="relative flex flex-col items-center"
              onMouseEnter={() => setHoveredButton('smartLearning')}
              onMouseLeave={() => setHoveredButton(null)}
              onClick={() => handleButtonClick('smartLearning')}
            >
              <motion.button
                className="w-12 h-12 rounded-2xl bg-white border-2 border-neutral-200 text-neutral-700 shadow hover:shadow-xl transition-shadow flex items-center justify-center cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Smart Learning"
                animate={
                  hoveredButton === 'smartLearning' || clickedButton === 'smartLearning'
                    ? {
                        boxShadow: [
                          '0 0 0px rgba(59, 130, 246, 0)',
                          '0 0 15px rgba(59, 130, 246, 0.6)',
                          '0 0 0px rgba(59, 130, 246, 0)',
                        ],
                      }
                    : {}
                }
                transition={
                  hoveredButton === 'smartLearning' || clickedButton === 'smartLearning'
                    ? {
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }
                    : { duration: 0.3 }
                }
              >
                <motion.div
                  animate={
                    hoveredButton === 'smartLearning' || clickedButton === 'smartLearning'
                      ? {
                          scale: [1, 1.1, 1],
                        }
                      : { scale: 1 }
                  }
                  transition={
                    hoveredButton === 'smartLearning' || clickedButton === 'smartLearning'
                      ? {
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }
                      : { duration: 0.3 }
                  }
                >
                  <Database className="h-5 w-5 text-blue-600" />
                </motion.div>
              </motion.button>
              <p className="text-xs text-neutral-600 mt-2 text-center w-16 leading-tight">Smart<br />Learning</p>
            </motion.div>
          </div>
        </div>

        {/* Button Descriptions */}
        <div className="mt-6">
          <h4 className="text-lg font-semibold text-neutral-800 mb-3">Button Descriptions:</h4>
          <ul className="text-neutral-600 space-y-2">
            {items.map((item, itemIndex) => (
              <li key={itemIndex} className="flex items-start gap-2">
                <span className="font-medium text-neutral-800">{item.label}:</span>
                <span>{item.desc}</span>
              </li>
            ))}
          </ul>
        </div>
      </motion.div>

      {/* Smart Learning Modal */}
      <AnimatePresence>
        {showSmartLearningModal && (
          <SmartLearningModal 
            isOpen={showSmartLearningModal}
            onClose={() => setShowSmartLearningModal(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Smart Learning Modal Component
function SmartLearningModal({ isOpen, onClose }) {
  const [step, setStep] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollPosition, setScrollPosition] = useState(0);
  const [removedChips, setRemovedChips] = useState([]);
  const [isFading, setIsFading] = useState(false);
  const mouseAnimationRef = React.useRef(null);
  const mousePosRef = React.useRef({ x: 0, y: 0 });
  const containerRef = React.useRef(null);
  const scrollContainerRef = React.useRef(null);
  const chipRefs = React.useRef({});

  // Sample data for Smart Learning
  const smartLearningData = {
    npiColumns: [
      { id: 'npi1', label: 'NPI', selected: false },
      { id: 'npi2', label: 'NPI Number', selected: false },
      { id: 'npi3', label: 'npi_number', selected: true },
      { id: 'npi4', label: 'NPI #', selected: false },
    ],
    firstNameColumns: [
      { id: 'fn1', label: 'First Name', selected: false },
      { id: 'fn2', label: 'Name', selected: false },
      { id: 'fn3', label: 'Provider Name', selected: false },
      { id: 'fn4', label: 'Provider First Name', selected: false },
    ],
    lastNameColumns: [
      { id: 'ln1', label: 'Last Name', selected: false },
      { id: 'ln2', label: 'Name', selected: false },
      { id: 'ln3', label: 'Provider Name', selected: false },
      { id: 'ln4', label: 'Provider Last Name', selected: false },
    ],
  };

  // Sync ref with state
  React.useEffect(() => {
    mousePosRef.current = mousePosition;
  }, [mousePosition]);

  useEffect(() => {
    if (!isOpen) {
      setStep(0);
      setScrollPosition(0);
      setRemovedChips([]);
      setIsFading(false);
      setMousePosition({ x: 0, y: 0 });
      mousePosRef.current = { x: 0, y: 0 };
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }
      return;
    }

    const animateMouseTo = async (targetPos, duration) => {
      return new Promise((resolve) => {
        const startPos = { ...mousePosRef.current };
        const startTime = Date.now();
        
        const animate = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const easeProgress = 1 - Math.pow(1 - progress, 3);
          
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

    const animateScroll = async (targetScroll, duration) => {
      return new Promise((resolve) => {
        const startScroll = scrollContainerRef.current?.scrollTop || 0;
        const startTime = Date.now();
        
        const animate = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const easeProgress = 1 - Math.pow(1 - progress, 3);
          
          const currentScroll = startScroll + (targetScroll - startScroll) * easeProgress;
          setScrollPosition(currentScroll);
          
          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = currentScroll;
          }
          
          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            resolve();
          }
        };
        
        requestAnimationFrame(animate);
      });
    };

    const animationSequence = async () => {
      try {
        // Reset state
        setStep(0);
        setScrollPosition(0);
        setRemovedChips([]);
        setIsFading(false);
        const startPos = { x: 200, y: 100 };
        setMousePosition(startPos);
        mousePosRef.current = startPos;
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = 0;
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Step 1: Scroll down the list
        setStep(1);
        await new Promise(resolve => setTimeout(resolve, 200));
        const maxScroll = scrollContainerRef.current ? scrollContainerRef.current.scrollHeight - scrollContainerRef.current.clientHeight : 200;
        await animateScroll(maxScroll, 2000);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Step 2: Move mouse to chips and click X buttons
        setStep(2);
        const chipsToRemove = ['npi1', 'fn2', 'ln3']; // Chips to remove
        
        for (const chipId of chipsToRemove) {
          await new Promise(resolve => setTimeout(resolve, 200));
          if (chipRefs.current[chipId] && containerRef.current) {
            const chipRect = chipRefs.current[chipId].getBoundingClientRect();
            const containerRect = containerRef.current.getBoundingClientRect();
            const chipPos = {
              x: chipRect.right - containerRect.left - 10, // X button position
              y: chipRect.top - containerRect.top + chipRect.height / 2
            };
            
            await animateMouseTo(chipPos, 800);
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // Click X button - remove chip
            setRemovedChips(prev => [...prev, chipId]);
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Step 3: Fade out
        setStep(3);
        setIsFading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Close modal
        onClose();
      } catch (error) {
        console.error("Animation sequence error:", error);
      }
    };

    animationSequence();

    return () => {
      if (mouseAnimationRef.current) cancelAnimationFrame(mouseAnimationRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const allChips = [
    ...smartLearningData.npiColumns.map(c => ({ ...c, category: 'npi', color: 'blue' })),
    ...smartLearningData.firstNameColumns.map(c => ({ ...c, category: 'firstName', color: 'green' })),
    ...smartLearningData.lastNameColumns.map(c => ({ ...c, category: 'lastName', color: 'purple' })),
  ].filter(c => !removedChips.includes(c.id));

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: isFading ? 0 : 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        ref={containerRef}
        className="bg-white rounded-2xl border shadow-2xl w-80 max-h-[500px] overflow-hidden flex flex-col"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: isFading ? 0.9 : 1, opacity: isFading ? 0 : 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-neutral-50">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-neutral-600" />
            <h3 className="font-semibold text-sm">Smart Learning</h3>
            <span className="text-xs text-neutral-500 bg-white px-2 py-0.5 rounded-full">
              {allChips.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <EyeOff className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div 
          ref={scrollContainerRef}
          className={`flex-1 overflow-y-auto p-4 space-y-4 relative ${step > 0 && step < 3 ? 'pointer-events-none' : ''}`}
          style={{ maxHeight: '400px' }}
        >
          {/* Animated Mouse Pointer */}
          {(step >= 2 && step <= 3) && (
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

           {/* NPI Columns */}
           <div>
             <div className="flex items-center gap-2 mb-2">
               <div className="w-2 h-2 rounded-full bg-blue-600"></div>
               <h4 className="text-xs font-semibold text-neutral-700 uppercase">NPI Columns</h4>
             </div>
             <div className="flex flex-wrap gap-2">
               <AnimatePresence>
                 {smartLearningData.npiColumns
                   .filter(c => !removedChips.includes(c.id))
                   .map((chip) => (
                     <motion.div
                       key={chip.id}
                       ref={(el) => { if (el) chipRefs.current[chip.id] = el; }}
                       className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 ${
                         chip.selected 
                           ? 'bg-blue-600 text-white' 
                           : 'bg-blue-100 text-blue-700'
                       }`}
                       initial={{ opacity: 1, scale: 1 }}
                       exit={{ opacity: 0, scale: 0.8 }}
                       transition={{ duration: 0.3 }}
                     >
                       <span>{chip.label}{chip.selected && ' ✓'}</span>
                       <button className="hover:bg-blue-700/20 rounded px-1">
                         <X className="h-3 w-3" />
                       </button>
                     </motion.div>
                   ))}
               </AnimatePresence>
             </div>
           </div>

           {/* First Name Columns */}
           <div>
             <div className="flex items-center gap-2 mb-2">
               <div className="w-2 h-2 rounded-full bg-green-600"></div>
               <h4 className="text-xs font-semibold text-neutral-700 uppercase">First Name Columns</h4>
             </div>
             <div className="flex flex-wrap gap-2">
               <AnimatePresence>
                 {smartLearningData.firstNameColumns
                   .filter(c => !removedChips.includes(c.id))
                   .map((chip) => (
                     <motion.div
                       key={chip.id}
                       ref={(el) => { if (el) chipRefs.current[chip.id] = el; }}
                       className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 ${
                         chip.selected 
                           ? 'bg-green-600 text-white' 
                           : 'bg-green-100 text-green-700'
                       }`}
                       initial={{ opacity: 1, scale: 1 }}
                       exit={{ opacity: 0, scale: 0.8 }}
                       transition={{ duration: 0.3 }}
                     >
                       <span>{chip.label}</span>
                       <button className="hover:bg-green-700/20 rounded px-1">
                         <X className="h-3 w-3" />
                       </button>
                     </motion.div>
                   ))}
               </AnimatePresence>
             </div>
           </div>

           {/* Last Name Columns */}
           <div>
             <div className="flex items-center gap-2 mb-2">
               <div className="w-2 h-2 rounded-full bg-purple-600"></div>
               <h4 className="text-xs font-semibold text-neutral-700 uppercase">Last Name Columns</h4>
             </div>
             <div className="flex flex-wrap gap-2">
               <AnimatePresence>
                 {smartLearningData.lastNameColumns
                   .filter(c => !removedChips.includes(c.id))
                   .map((chip) => (
                     <motion.div
                       key={chip.id}
                       ref={(el) => { if (el) chipRefs.current[chip.id] = el; }}
                       className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 ${
                         chip.selected 
                           ? 'bg-purple-600 text-white' 
                           : 'bg-purple-100 text-purple-700'
                       }`}
                       initial={{ opacity: 1, scale: 1 }}
                       exit={{ opacity: 0, scale: 0.8 }}
                       transition={{ duration: 0.3 }}
                     >
                       <span>{chip.label}</span>
                       <button className="hover:bg-purple-700/20 rounded px-1">
                         <X className="h-3 w-3" />
                       </button>
                     </motion.div>
                   ))}
               </AnimatePresence>
             </div>
           </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-neutral-50">
          <button className="text-red-600 text-xs font-medium hover:text-red-700 transition-colors">
            Clear All
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

