import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, MousePointer2, Upload, Search, Check, Trash2, RotateCw, MapPin, FileText, CheckCircle, Building2, Eye, BarChart3 } from 'lucide-react';

// Mapping Workflow Animation Modal Component
export default function MappingWorkflowModal({ isOpen, onClose }) {
  const [currentStep, setCurrentStep] = useState(0); // Current workflow step (1-8)
  const [animationStep, setAnimationStep] = useState(0); // Internal animation step
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showMouseClick, setShowMouseClick] = useState(false);
  const [showColumns, setShowColumns] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [mappedColumns, setMappedColumns] = useState([]);
  const [showSuggested, setShowSuggested] = useState(false);
  const [showMappingsPanel, setShowMappingsPanel] = useState(false);
  const [showPracticeInput, setShowPracticeInput] = useState(false);
  const [practiceId, setPracticeId] = useState('');
  const [showProgress, setShowProgress] = useState(false);
  const [progressStatus, setProgressStatus] = useState('Transposing');
  const mouseAnimationRef = React.useRef(null);
  const mousePosRef = React.useRef({ x: 0, y: 0 });
  const containerRef = React.useRef(null);
  const uploadButtonRef = React.useRef(null);
  const searchBoxRef = React.useRef(null);
  const firstNameRowRef = React.useRef(null);
  const contextMenuRef = React.useRef(null);
  const addAllButtonRef = React.useRef(null);
  const practiceInputRef = React.useRef(null);
  const convertButtonRef = React.useRef(null);
  const mappingsPanelRef = React.useRef(null);
  const progressBreadcrumbRef = React.useRef(null);
  
  const workflowSteps = [
    { id: 1, title: 'Upload Files', icon: Upload, color: 'blue' },
    { id: 2, title: 'Review Column Headers', icon: FileText, color: 'indigo' },
    { id: 3, title: 'Map Columns to Zocdoc Fields', icon: MapPin, color: 'purple' },
    { id: 4, title: 'Required Mappings', icon: CheckCircle, color: 'green' },
    { id: 5, title: 'Assign Practice ID', icon: Building2, color: 'teal' },
    { id: 6, title: 'Review Mappings', icon: Eye, color: 'amber' },
    { id: 7, title: 'Convert (Extraction)', icon: RotateCw, color: 'red' },
    { id: 8, title: 'Monitor Progress', icon: BarChart3, color: 'emerald' },
  ];

  // Sync ref with state
  React.useEffect(() => {
    mousePosRef.current = mousePosition;
  }, [mousePosition]);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      setAnimationStep(0);
      setShowColumns(false);
      setShowContextMenu(false);
      setSelectedColumn(null);
      setMappedColumns([]);
      setShowSuggested(false);
      setShowMappingsPanel(false);
      setShowPracticeInput(false);
      setPracticeId('');
      setShowProgress(false);
      setProgressStatus('Transposing');
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

    const animationSequence = async () => {
      try {
        // Reset state - show all buttons and panels from start
        setCurrentStep(0);
        setAnimationStep(0);
        setShowColumns(false);
        setShowContextMenu(false);
        setSelectedColumn(null);
        setMappedColumns([]);
        setShowSuggested(false);
        setShowMappingsPanel(false);
        setShowPracticeInput(false);
        setPracticeId('');
        setShowProgress(false);
        setProgressStatus('Transposing');
        
        // Start mouse from top-left
        const startPos = { x: 50, y: 50 };
        setMousePosition(startPos);
        mousePosRef.current = startPos;
        await new Promise(resolve => setTimeout(resolve, 1000));

        // ========== STEP 1: Upload Files ==========
        setCurrentStep(1);
        setAnimationStep(1);
        let uploadButtonPos = { x: 100, y: 40 };
        if (uploadButtonRef.current && containerRef.current) {
          const buttonRect = uploadButtonRef.current.getBoundingClientRect();
          const containerRect = containerRef.current.getBoundingClientRect();
          uploadButtonPos = {
            x: buttonRect.left - containerRect.left + buttonRect.width / 2,
            y: buttonRect.top - containerRect.top + buttonRect.height / 2
          };
        }
        await animateMouseTo(uploadButtonPos, 1000);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setShowMouseClick(true);
        await new Promise(resolve => setTimeout(resolve, 500));
        setShowMouseClick(false);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // ========== STEP 2: Review Column Headers ==========
        setCurrentStep(2);
        setAnimationStep(2);
        setShowColumns(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Move to search box
        let searchBoxPos = { x: 300, y: 40 };
        if (searchBoxRef.current && containerRef.current) {
          const boxRect = searchBoxRef.current.getBoundingClientRect();
          const containerRect = containerRef.current.getBoundingClientRect();
          searchBoxPos = {
            x: boxRect.left - containerRect.left + boxRect.width / 2,
            y: boxRect.top - containerRect.top + boxRect.height / 2
          };
        }
        await animateMouseTo(searchBoxPos, 1000);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setShowMouseClick(true);
        await new Promise(resolve => setTimeout(resolve, 500));
        setShowMouseClick(false);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // ========== STEP 3: Map Columns to Zocdoc Fields ==========
        setCurrentStep(3);
        setAnimationStep(3);
        let firstNameRowPos = { x: 200, y: 120 };
        if (firstNameRowRef.current && containerRef.current) {
          const rowRect = firstNameRowRef.current.getBoundingClientRect();
          const containerRect = containerRef.current.getBoundingClientRect();
          firstNameRowPos = {
            x: rowRect.left - containerRect.left + 50,
            y: rowRect.top - containerRect.top + rowRect.height / 2
          };
        }
        await animateMouseTo(firstNameRowPos, 1000);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setShowMouseClick(true);
        await new Promise(resolve => setTimeout(resolve, 500));
        setShowMouseClick(false);
        setShowContextMenu(true);
        setSelectedColumn('First Name');
        await new Promise(resolve => setTimeout(resolve, 800));
        
        let menuOptionPos = { x: 350, y: 140 };
        if (contextMenuRef.current && containerRef.current) {
          const menuRect = contextMenuRef.current.getBoundingClientRect();
          const containerRect = containerRef.current.getBoundingClientRect();
          menuOptionPos = {
            x: menuRect.left - containerRect.left + menuRect.width / 2,
            y: menuRect.top - containerRect.top + 30
          };
        }
        await animateMouseTo(menuOptionPos, 800);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setShowMouseClick(true);
        await new Promise(resolve => setTimeout(resolve, 500));
        setShowMouseClick(false);
        setShowContextMenu(false);
        setMappedColumns(['First Name']);
        setShowSuggested(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Click Add All in Suggested panel
        let addAllButtonPos = { x: 550, y: 200 };
        if (addAllButtonRef.current && containerRef.current) {
          const buttonRect = addAllButtonRef.current.getBoundingClientRect();
          const containerRect = containerRef.current.getBoundingClientRect();
          addAllButtonPos = {
            x: buttonRect.left - containerRect.left + buttonRect.width / 2,
            y: buttonRect.top - containerRect.top + buttonRect.height / 2
          };
        }
        await animateMouseTo(addAllButtonPos, 1000);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setShowMouseClick(true);
        await new Promise(resolve => setTimeout(resolve, 500));
        setShowMouseClick(false);
        setMappedColumns(['First Name', 'Last Name', 'NPI Number']);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // ========== STEP 4: Required Mappings ==========
        setCurrentStep(4);
        setAnimationStep(4);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // ========== STEP 5: Assign Practice ID ==========
        setCurrentStep(5);
        setAnimationStep(5);
        setShowPracticeInput(true);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        let practiceInputPos = { x: 300, y: 350 };
        if (practiceInputRef.current && containerRef.current) {
          const inputRect = practiceInputRef.current.getBoundingClientRect();
          const containerRect = containerRef.current.getBoundingClientRect();
          practiceInputPos = {
            x: inputRect.left - containerRect.left + inputRect.width / 2,
            y: inputRect.top - containerRect.top + inputRect.height / 2
          };
        }
        await animateMouseTo(practiceInputPos, 1000);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setShowMouseClick(true);
        await new Promise(resolve => setTimeout(resolve, 500));
        setShowMouseClick(false);
        setPracticeId('144033');
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // ========== STEP 6: Review Mappings ==========
        setCurrentStep(6);
        setAnimationStep(6);
        setShowMappingsPanel(true);
        setMappedColumns(['First Name', 'Last Name', 'NPI Number']);
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // ========== STEP 7: Convert (Extraction) ==========
        setCurrentStep(7);
        setAnimationStep(7);
        let convertButtonPos = { x: 500, y: 40 };
        if (convertButtonRef.current && containerRef.current) {
          const buttonRect = convertButtonRef.current.getBoundingClientRect();
          const containerRect = containerRef.current.getBoundingClientRect();
          convertButtonPos = {
            x: buttonRect.left - containerRect.left + buttonRect.width / 2,
            y: buttonRect.top - containerRect.top + buttonRect.height / 2
          };
        }
        await animateMouseTo(convertButtonPos, 1000);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setShowMouseClick(true);
        await new Promise(resolve => setTimeout(resolve, 500));
        setShowMouseClick(false);
        setShowProgress(true);
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // ========== STEP 8: Monitor Progress ==========
        setCurrentStep(8);
        setAnimationStep(8);
        setProgressStatus('Ready');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Reset and restart
        setCurrentStep(0);
        setAnimationStep(0);
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error('Animation error:', error);
      }
    };

    let timeoutId;
    const runAnimation = () => {
      animationSequence().then(() => {
        timeoutId = setTimeout(runAnimation, 1000);
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

  const columns = [
    { id: 1, name: 'First Name', examples: ['John', 'Jane'] },
    { id: 2, name: 'Last Name', examples: ['Doe', 'Smith'] },
    { id: 3, name: 'NPI Number', examples: ['1234567890', '0987654321'] },
    { id: 4, name: 'Email', examples: ['john@example.com'] },
  ];

  const suggestedMappings = [
    { detectedAs: 'Last Name', columnName: 'Last Name' },
    { detectedAs: 'NPI', columnName: 'NPI Number' },
  ];

  const stepDescriptions = {
    1: "Upload your Excel file containing provider or location data to begin the mapping process.",
    2: "Review the detected column headers and example values to understand your data structure.",
    3: "Click on column headers to map them to Zocdoc fields, or use the suggested mappings to speed up the process.",
    4: "Ensure all required mappings are completed - these are essential for successful data transposition.",
    5: "Enter the Practice ID(s) to link your mapped data to the correct practice in the system.",
    6: "Review all your mappings in the Mappings panel to verify everything is correct before converting.",
    7: "Click 'Convert' to begin the data extraction and transposition process according to your mappings.",
    8: "Monitor the progress indicator to track the conversion status and download files when ready."
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
        className="bg-white rounded-lg shadow-2xl p-8 max-w-[85.5vw] w-full mx-4"
        style={{ height: '85.5vh', maxHeight: '1080px', overflowY: 'auto' }}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-semibold text-neutral-800 mb-2">Mapping Workflow Demo</h3>
            {currentStep > 0 && (
              <motion.div
                className="flex items-center gap-2 flex-wrap"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <span className="text-sm text-neutral-600 font-medium">Current Step:</span>
                {workflowSteps.map((step) => {
                  const Icon = step.icon;
                  const isActive = currentStep === step.id;
                  const colorMap = {
                    blue: { bg: 'bg-blue-100', border: 'border-blue-500', text: 'text-blue-600', textDark: 'text-blue-700' },
                    indigo: { bg: 'bg-indigo-100', border: 'border-indigo-500', text: 'text-indigo-600', textDark: 'text-indigo-700' },
                    purple: { bg: 'bg-purple-100', border: 'border-purple-500', text: 'text-purple-600', textDark: 'text-purple-700' },
                    green: { bg: 'bg-green-100', border: 'border-green-500', text: 'text-green-600', textDark: 'text-green-700' },
                    teal: { bg: 'bg-teal-100', border: 'border-teal-500', text: 'text-teal-600', textDark: 'text-teal-700' },
                    amber: { bg: 'bg-amber-100', border: 'border-amber-500', text: 'text-amber-600', textDark: 'text-amber-700' },
                    red: { bg: 'bg-red-100', border: 'border-red-500', text: 'text-red-600', textDark: 'text-red-700' },
                    emerald: { bg: 'bg-emerald-100', border: 'border-emerald-500', text: 'text-emerald-600', textDark: 'text-emerald-700' },
                  };
                  const colors = colorMap[step.color];
                  return (
                    <motion.div
                      key={step.id}
                      className={`flex items-center gap-2 px-3 py-1 rounded-lg border-2 ${
                        isActive
                          ? `${colors.bg} ${colors.border}`
                          : 'bg-neutral-100 border-transparent'
                      }`}
                      animate={{
                        scale: isActive ? 1.05 : 1,
                        opacity: isActive ? 1 : 0.5
                      }}
                    >
                      <Icon className={`h-4 w-4 ${isActive ? colors.text : 'text-neutral-400'}`} />
                      <span className={`text-xs font-medium ${isActive ? colors.textDark : 'text-neutral-500'}`}>
                        {step.id}. {step.title}
                      </span>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-700 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div 
          ref={containerRef}
          className="relative bg-neutral-50 rounded-lg border-2 border-blue-300 shadow-sm p-6 min-h-[630px]"
        >
          {/* Animated Mouse Pointer */}
          {(animationStep >= 1) && (
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

          {/* Top Action Bar - Show all buttons */}
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-neutral-200">
            <div className="flex items-center gap-4">
              <motion.button
                ref={uploadButtonRef}
                className="flex items-center gap-2 px-4 py-2 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition-colors"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Upload className="h-4 w-4" />
                <span>Upload Files</span>
              </motion.button>
              
              <motion.button
                ref={convertButtonRef}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <RotateCw className="h-4 w-4" />
                <span>Convert</span>
              </motion.button>
            </div>

            {/* Search Box - Always visible when columns are shown */}
            <motion.div
              ref={searchBoxRef}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-neutral-300 rounded-lg"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: showColumns ? 1 : 0.3, x: 0 }}
            >
              <Search className="h-4 w-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Filter columns..."
                className="outline-none text-sm"
                readOnly
                disabled={!showColumns}
              />
            </motion.div>
          </div>

          {/* Column Headers Panel */}
          {showColumns && (
            <motion.div
              className="mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h4 className="text-sm font-semibold text-neutral-700 mb-2">Column Headers</h4>
              <div className="bg-white border rounded-lg overflow-hidden" style={{ minHeight: '180px' }}>
                <table className="w-full text-xs">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th className="text-left py-2 px-3 font-semibold text-neutral-600">Column Name</th>
                      <th className="text-left py-2 px-3 font-semibold text-neutral-600">Example Values</th>
                    </tr>
                  </thead>
                  <tbody>
                    {columns.map((column) => (
                      <motion.tr
                        key={column.id}
                        ref={column.name === 'First Name' ? firstNameRowRef : null}
                        className={`border-t border-neutral-100 hover:bg-neutral-50 ${
                          selectedColumn === column.name ? 'bg-blue-50' : ''
                        } ${
                          mappedColumns.includes(column.name) ? 'border-l-4 border-l-green-500' : ''
                        }`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: column.id * 0.1 }}
                      >
                        <td className="py-2 px-3">
                          {column.name}
                          {mappedColumns.includes(column.name) && (
                            <Check className="h-3 w-3 text-green-600 inline-block ml-2" />
                          )}
                        </td>
                        <td className="py-2 px-3 text-neutral-500">
                          {column.examples.join(', ')}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Context Menu */}
              {showContextMenu && selectedColumn && (
                <motion.div
                  ref={contextMenuRef}
                  className="absolute bg-white border border-neutral-300 rounded-lg shadow-lg py-1 z-40"
                  style={{
                    left: '350px',
                    top: '140px',
                    minWidth: '200px'
                  }}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="px-3 py-2 hover:bg-neutral-50 cursor-pointer">
                    Assign as First Name
                  </div>
                  <div className="px-3 py-2 hover:bg-neutral-50 cursor-pointer">
                    Assign as Last Name
                  </div>
                  <div className="px-3 py-2 hover:bg-neutral-50 cursor-pointer">
                    Assign as NPI
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Suggested Mappings Panel */}
          {showSuggested && (
            <motion.div
              className="mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-neutral-700">Suggested Mappings</h4>
                <button 
                  ref={addAllButtonRef}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  Add All
                </button>
              </div>
              <div className="bg-white border rounded-lg overflow-hidden" style={{ minHeight: '100px' }}>
                <table className="w-full text-xs">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th className="text-left py-2 px-3 font-semibold text-neutral-600">Detected As</th>
                      <th className="text-left py-2 px-3 font-semibold text-neutral-600">Column Name</th>
                      <th className="w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {suggestedMappings.map((mapping, idx) => (
                      <tr key={idx} className="border-t border-neutral-100">
                        <td className="py-2 px-3">{mapping.detectedAs}</td>
                        <td className="py-2 px-3">{mapping.columnName}</td>
                        <td className="py-2 px-3">
                          <button className="text-blue-600 hover:text-blue-700">
                            <MapPin className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Mappings Panel */}
          {showMappingsPanel && (
            <motion.div
              ref={mappingsPanelRef}
              className="mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h4 className="text-sm font-semibold text-neutral-700 mb-2">Mappings</h4>
              <div className="bg-white border rounded-lg overflow-hidden" style={{ minHeight: '120px' }}>
                <table className="w-full text-xs">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th className="text-left py-2 px-3 font-semibold text-neutral-600">Mapped Column</th>
                      <th className="text-left py-2 px-3 font-semibold text-neutral-600">Zocdoc Field</th>
                      <th className="w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {mappedColumns.map((col, idx) => (
                      <tr key={idx} className="border-t border-neutral-100">
                        <td className="py-2 px-3">{col}</td>
                        <td className="py-2 px-3">
                          {col === 'First Name' ? 'First Name' : col === 'Last Name' ? 'Last Name' : 'NPI'}
                        </td>
                        <td className="py-2 px-3">
                          <button className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Practice ID Input */}
          {showPracticeInput && (
            <motion.div
              className="mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h4 className="text-sm font-semibold text-neutral-700 mb-2">Location & Practice Assignment</h4>
              <div className="bg-white border rounded-lg p-4">
                <label className="block text-xs text-neutral-600 mb-2">Enter Practice IDs...</label>
                <input
                  ref={practiceInputRef}
                  type="text"
                  value={practiceId}
                  readOnly
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm"
                  placeholder="Enter Practice IDs..."
                />
                {practiceId && (
                  <motion.div
                    className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="text-neutral-600 mb-1">Practice Name</div>
                    <div className="text-neutral-800 font-medium">Intermountain Health UT - Central Women's Health</div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* Progress Monitoring */}
          {showProgress && (
            <motion.div
              ref={progressBreadcrumbRef}
              className="mt-4 pt-4 border-t border-neutral-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h4 className="text-sm font-semibold text-neutral-700 mb-2">Process Flow Status</h4>
              <div className="flex items-center gap-2 mb-2">
                <div className={`px-3 py-1 rounded-lg text-xs font-medium ${
                  progressStatus === 'Transposing' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                }`}>
                  {progressStatus}
                </div>
                <div className="text-xs text-neutral-500">0:52</div>
              </div>
              <div className="text-xs text-neutral-600 bg-neutral-50 p-2 rounded">
                Console: Files created successfully
              </div>
            </motion.div>
          )}
        </div>

        {/* Step-by-Step Write-ups Section */}
        {currentStep > 0 && stepDescriptions[currentStep] && (
          <motion.div
            className="mt-4 pt-4 border-t border-neutral-200"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-sm text-neutral-600 italic">
              {stepDescriptions[currentStep]}
            </p>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}


