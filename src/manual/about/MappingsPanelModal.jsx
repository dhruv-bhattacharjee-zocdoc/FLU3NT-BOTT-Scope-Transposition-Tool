import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, MousePointer2, Trash2, RotateCw } from 'lucide-react';

// Mappings Panel Animation Modal Component
export default function MappingsPanelAnimationModal({ isOpen, onClose, items = [] }) {
  const [step, setStep] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showMouseClick, setShowMouseClick] = useState(false);
  const [removedRows, setRemovedRows] = useState([]);
  const [showNewRows, setShowNewRows] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const mouseAnimationRef = React.useRef(null);
  const mousePosRef = React.useRef({ x: 0, y: 0 });
  const containerRef = React.useRef(null);
  const firstDeleteButtonRef = React.useRef(null);
  const clearAllButtonRef = React.useRef(null);
  const saveMappingsButtonRef = React.useRef(null);

  // Sync ref with state
  React.useEffect(() => {
    mousePosRef.current = mousePosition;
  }, [mousePosition]);

  useEffect(() => {
    if (!isOpen) {
      setStep(0);
      setRemovedRows([]);
      setShowNewRows(false);
      setShowNotification(false);
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
      setRemovedRows([]);
      setShowMouseClick(false);
      const startPos = { x: 50, y: 50 };
      setMousePosition(startPos);
      mousePosRef.current = startPos;
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Step 1: Move mouse to first Delete (Trash) button
      setStep(1);
      // Wait for DOM to be ready and ensure refs are available
      await new Promise(resolve => setTimeout(resolve, 200));
      // Get actual position of first Delete button
      let firstDeleteButtonPos = { x: 280, y: 60 }; // Fallback
      if (firstDeleteButtonRef.current && containerRef.current) {
        const buttonRect = firstDeleteButtonRef.current.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();
        firstDeleteButtonPos = {
          x: buttonRect.left - containerRect.left + buttonRect.width / 2,
          y: buttonRect.top - containerRect.top + buttonRect.height / 2
        };
      }
      // Animate mouse to first button (don't set position immediately - let animation happen)
      await animateMouseTo(firstDeleteButtonPos, 1000);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Step 2: Click first Delete button (keep mouse at same position)
      setStep(2);
      setShowMouseClick(true);
      await new Promise(resolve => setTimeout(resolve, 700));
      setShowMouseClick(false);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Step 3: First row swipes right (removed)
      setStep(3);
      setRemovedRows(['NPI Number']);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Step 4: Move mouse to 'Clear all Mappings' button
      setStep(4);
      // Wait for DOM to be ready and ensure refs are available
      await new Promise(resolve => setTimeout(resolve, 200));
      // Get actual position of Clear all Mappings button
      let clearAllButtonPos = { x: 100, y: 50 }; // Fallback
      if (clearAllButtonRef.current && containerRef.current) {
        const buttonRect = clearAllButtonRef.current.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();
        clearAllButtonPos = {
          x: buttonRect.left - containerRect.left + buttonRect.width / 2,
          y: buttonRect.top - containerRect.top + buttonRect.height / 2
        };
      }
      // Animate mouse from current position to Clear all button (visible movement)
      await animateMouseTo(clearAllButtonPos, 1000);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Step 5: Click 'Clear all Mappings' button (keep mouse at same position)
      setStep(5);
      setShowMouseClick(true);
      await new Promise(resolve => setTimeout(resolve, 700));
      setShowMouseClick(false);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Step 6: Remaining rows swipe right
      setStep(6);
      setRemovedRows(['NPI Number', 'First Name', 'Last Name']);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Step 7: Fade in new 3 random populated rows
      setStep(7);
      setRemovedRows([]);
      setShowNewRows(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Step 8: Move mouse to 'Save Mappings' button
      setStep(8);
      // Wait for DOM to be ready
      await new Promise(resolve => setTimeout(resolve, 200));
      // Get actual position of Save Mappings button
      let saveMappingsButtonPos = { x: 200, y: 50 }; // Fallback
      if (saveMappingsButtonRef.current && containerRef.current) {
        const buttonRect = saveMappingsButtonRef.current.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();
        saveMappingsButtonPos = {
          x: buttonRect.left - containerRect.left + buttonRect.width / 2,
          y: buttonRect.top - containerRect.top + buttonRect.height / 2
        };
      }
      await animateMouseTo(saveMappingsButtonPos, 1000);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Step 9: Click 'Save Mappings' button
      setStep(9);
      setShowMouseClick(true);
      await new Promise(resolve => setTimeout(resolve, 700));
      setShowMouseClick(false);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Step 10: Show notification at bottom
      setStep(10);
      setShowNotification(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Step 11: Hide notification and fade out
      setStep(11);
      setShowNotification(false);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Step 12: Fade out and repeat
      setStep(12);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset and repeat
      setStep(0);
      setRemovedRows([]);
      setShowNewRows(false);
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

  // Define rows - use new random rows if showNewRows is true, otherwise use original
  const originalRows = [
    { id: 'npi', label: 'NPI Number', columnName: 'NPI' },
    { id: 'firstName', label: 'First Name', columnName: 'First Name' },
    { id: 'lastName', label: 'Last Name', columnName: 'Last Name' }
  ];
  
  const newRandomRows = [
    { id: 'gender', label: 'Gender', columnName: 'Gender' },
    { id: 'specialty', label: 'Specialty', columnName: 'Specialty' },
    { id: 'state', label: 'State', columnName: 'State' }
  ];
  
  const currentRows = showNewRows ? newRandomRows : originalRows;
  const mappingRows = currentRows.map(row => ({
    ...row,
    isRemoved: removedRows.includes(row.label)
  }));

  const visibleRows = mappingRows.filter(row => !row.isRemoved);

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
          <h3 className="text-2xl font-semibold text-neutral-800">Mappings Panel</h3>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-700 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div 
          ref={containerRef}
          className={`relative bg-neutral-50 rounded-lg border-2 border-purple-300 shadow-sm p-4 transition-opacity duration-500 ${step === 12 ? 'opacity-30' : 'opacity-100'}`}
        >
          {/* Animated Mouse Pointer */}
          {(step >= 1 && step <= 9) && (
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

          {/* Mappings Panel Header */}
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h5 className="text-sm font-semibold text-neutral-800">Mappings</h5>
              <span className="text-xs text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full">{visibleRows.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                ref={clearAllButtonRef}
                className="text-neutral-500 hover:text-red-600 transition-colors"
                title="Clear all Mappings"
              >
                <RotateCw className="h-3 w-3" />
              </button>
              <button 
                ref={saveMappingsButtonRef}
                className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Save Mappings
              </button>
            </div>
          </div>

          {/* Mappings Table */}
          <div className="border rounded-lg overflow-hidden bg-white" style={{ height: '180px', position: 'relative' }}>
            <div style={{ position: 'absolute', width: '100%', height: '100%', overflow: 'hidden' }}>
              <table className="w-full text-xs" style={{ tableLayout: 'fixed' }}>
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="text-left py-2 px-2 font-semibold text-neutral-600">Detected As</th>
                    <th className="text-left py-2 px-2 font-semibold text-neutral-600">Column Name</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {mappingRows.map((row, index) => (
                    <AnimatePresence key={row.id}>
                      {!row.isRemoved && (
                        <motion.tr
                          className="border-t border-neutral-100 hover:bg-neutral-50 group relative"
                          style={{ position: 'relative' }}
                          initial={showNewRows ? { opacity: 0, x: 0 } : { opacity: 1, x: 0 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ 
                            opacity: 0, 
                            x: 300,
                            transition: { duration: 0.5, ease: "easeInOut" },
                            position: 'absolute',
                            width: '100%'
                          }}
                          transition={showNewRows ? { duration: 0.5, ease: "easeOut" } : {}}
                        >
                          <td className="py-2 px-2">
                            <span className={`text-xs font-medium ${
                              row.id === 'npi' || row.id === 'gender' ? 'text-blue-600' : 
                              row.id === 'firstName' || row.id === 'specialty' ? 'text-green-600' : 
                              'text-purple-600'
                            }`}>
                              {row.label}
                            </span>
                          </td>
                          <td className="py-2 px-2 text-sm">{row.columnName}</td>
                          <td className="py-2 px-2">
                            <button 
                              ref={index === 0 ? firstDeleteButtonRef : null}
                              className={`text-red-600 hover:text-red-800 transition-colors ${
                                (step === 1 || step === 2) && index === 0 ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                              }`}
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </td>
                        </motion.tr>
                      )}
                    </AnimatePresence>
                  ))}
                  {/* Always render 3 rows to maintain fixed height */}
                  {Array.from({ length: 3 }).map((_, i) => {
                    const row = mappingRows[i];
                    if (row && !row.isRemoved) return null;
                    return (
                      <tr key={`empty-${i}`} className="border-t border-neutral-100" style={{ height: '48px' }}>
                        <td className="py-2 px-2"></td>
                        <td className="py-2 px-2"></td>
                        <td className="py-2 px-2"></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Success Notification */}
          <AnimatePresence>
            {showNotification && (
              <motion.div
                className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-neutral-800 text-white px-6 py-3 rounded-lg shadow-lg text-sm z-50"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
              >
                Successfully saved {visibleRows.length} column mapping(s) for future detection
              </motion.div>
            )}
          </AnimatePresence>
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

