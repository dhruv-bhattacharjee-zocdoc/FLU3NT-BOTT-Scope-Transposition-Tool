import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, MousePointer2, Plus } from 'lucide-react';

// Suggested Mappings Animation Modal Component
export default function SuggestedMappingsAnimationModal({ isOpen, onClose, items = [] }) {
  const [step, setStep] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showMouseClick, setShowMouseClick] = useState(false);
  const [removedColumns, setRemovedColumns] = useState([]);
  const mouseAnimationRef = React.useRef(null);
  const mousePosRef = React.useRef({ x: 0, y: 0 });
  const containerRef = React.useRef(null);
  const firstAddButtonRef = React.useRef(null);
  const addAllButtonRef = React.useRef(null);

  // Sync ref with state
  React.useEffect(() => {
    mousePosRef.current = mousePosition;
  }, [mousePosition]);

  useEffect(() => {
    if (!isOpen) {
      setStep(0);
      setRemovedColumns([]);
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
      setRemovedColumns([]);
      setShowMouseClick(false);
      const startPos = { x: 50, y: 50 };
      setMousePosition(startPos);
      mousePosRef.current = startPos;
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Step 1: Move mouse to first '+ Add' button
      setStep(1);
      // Wait for DOM to be ready and ensure refs are available
      await new Promise(resolve => setTimeout(resolve, 200));
      // Get actual position of first + Add button
      let firstAddButtonPos = { x: 280, y: 60 }; // Fallback
      if (firstAddButtonRef.current && containerRef.current) {
        const buttonRect = firstAddButtonRef.current.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();
        firstAddButtonPos = {
          x: buttonRect.left - containerRect.left + buttonRect.width / 2,
          y: buttonRect.top - containerRect.top + buttonRect.height / 2
        };
      }
      // Animate mouse to first button (don't set position immediately - let animation happen)
      await animateMouseTo(firstAddButtonPos, 1000);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Step 2: Click first '+ Add' button (keep mouse at same position)
      setStep(2);
      setShowMouseClick(true);
      await new Promise(resolve => setTimeout(resolve, 700));
      setShowMouseClick(false);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Step 3: First column swipes left (removed)
      setStep(3);
      setRemovedColumns(['NPI Number']);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Step 4: Move mouse to 'Add All' button
      setStep(4);
      // Wait for DOM to be ready and ensure refs are available
      await new Promise(resolve => setTimeout(resolve, 200));
      // Get actual position of Add All button
      let addAllButtonPos = { x: 100, y: 220 }; // Fallback
      if (addAllButtonRef.current && containerRef.current) {
        const buttonRect = addAllButtonRef.current.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();
        addAllButtonPos = {
          x: buttonRect.left - containerRect.left + buttonRect.width / 2,
          y: buttonRect.top - containerRect.top + buttonRect.height / 2
        };
      }
      // Animate mouse from current position to Add All button (visible movement)
      await animateMouseTo(addAllButtonPos, 1000);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Step 5: Click 'Add All' button (keep mouse at same position)
      setStep(5);
      setShowMouseClick(true);
      await new Promise(resolve => setTimeout(resolve, 700));
      setShowMouseClick(false);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Step 6: Remaining two columns swipe left
      setStep(6);
      setRemovedColumns(['NPI Number', 'First Name', 'Last Name']);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Step 7: Fade out
      setStep(7);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Step 8: Fade in and repeat
      setStep(0);
      setRemovedColumns([]);
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

  const suggestedColumns = [
    { id: 'npi', label: 'NPI Number', columnName: 'NPI', isRemoved: removedColumns.includes('NPI Number') },
    { id: 'firstName', label: 'First Name', columnName: 'First Name', isRemoved: removedColumns.includes('First Name') },
    { id: 'lastName', label: 'Last Name', columnName: 'Last Name', isRemoved: removedColumns.includes('Last Name') }
  ];

  const visibleColumns = suggestedColumns.filter(col => !col.isRemoved);

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
          <h3 className="text-2xl font-semibold text-neutral-800">Suggested Mappings</h3>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-700 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div 
          ref={containerRef}
          className={`relative bg-neutral-50 rounded-lg border-2 border-green-300 shadow-sm p-4 transition-opacity duration-500 ${step === 7 ? 'opacity-30' : 'opacity-100'}`}
        >
          {/* Animated Mouse Pointer */}
          {(step >= 1 && step <= 5) && (
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

          {/* Suggested Mappings Panel */}
          <div className="mb-3 flex items-center gap-2">
            <h5 className="text-sm font-semibold text-neutral-800">Suggested</h5>
            <span className="text-xs text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full">{visibleColumns.length}</span>
          </div>

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
                  {suggestedColumns.map((column, index) => (
                    <AnimatePresence key={column.id}>
                      {!column.isRemoved && (
                        <motion.tr
                          className="border-t border-neutral-100 hover:bg-neutral-50 group relative"
                          style={{ position: 'relative' }}
                          initial={{ opacity: 1, x: 0 }}
                          exit={{ 
                            opacity: 0, 
                            x: -300,
                            transition: { duration: 0.5, ease: "easeInOut" },
                            position: 'absolute',
                            width: '100%'
                          }}
                        >
                          <td className="py-2 px-2">
                            <span className={`text-xs font-medium ${
                              column.id === 'npi' ? 'text-blue-600' : 
                              column.id === 'firstName' ? 'text-green-600' : 
                              'text-purple-600'
                            }`}>
                              {column.label}
                            </span>
                          </td>
                          <td className="py-2 px-2 text-sm">{column.columnName}</td>
                          <td className="py-2 px-2">
                            <button 
                              ref={index === 0 ? firstAddButtonRef : null}
                              className={`text-green-600 hover:text-green-800 text-xs flex items-center gap-1 ${
                                (step === 1 || step === 2) && index === 0 ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                              }`}>
                              <Plus className="h-3 w-3" />
                              Add
                            </button>
                          </td>
                        </motion.tr>
                      )}
                    </AnimatePresence>
                  ))}
                  {/* Always render 3 rows to maintain fixed height */}
                  {Array.from({ length: 3 }).map((_, i) => {
                    const column = suggestedColumns[i];
                    if (column && !column.isRemoved) return null;
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

          {/* Add All Button */}
          {visibleColumns.length > 0 && (
            <motion.button
              ref={addAllButtonRef}
              className="mt-3 text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors font-medium"
              initial={{ opacity: 1 }}
              animate={{ opacity: visibleColumns.length > 0 ? 1 : 0 }}
            >
              Add all
            </motion.button>
          )}
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

