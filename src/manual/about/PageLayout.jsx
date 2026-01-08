import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, RotateCw, RefreshCw, Globe, Package, Search, Check, Trash2, Info, MapPin, Database, X, MousePointer2, Plus } from 'lucide-react';
import SuggestedMappingsAnimationModal from './SuggestedMappingsModal';
import MappingsPanelAnimationModal from './MappingsPanelModal';
import LocationPanelAnimationModal from './LocationPanelModal';
import ActionButtonsAnimationModal from './ActionButtonsModal';
import BreadcrumbToastAnimationModal from './BreadcrumbToastModal';

/**
 * Page layout & key elements - Content Component
 */
export default function PageLayout() {
  const [selectedTile, setSelectedTile] = useState(null);
  const [animationStep, setAnimationStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const sections = [
    {
      id: 1,
      title: 'Column Headers Panel',
      color: 'border-blue-500',
      items: [
        'Displays all columns detected from the uploaded file along with example values.',
        'Used to review and select columns for mapping.'
      ],
      hasVisual: true,
      visualType: 'columnHeaders'
    },
    {
      id: 2,
      title: 'Suggested Mappings',
      color: 'border-green-500',
      items: [
        'Shows automatically detected mappings based on column names and sample data. Uses Logics to detect',
        'You can accept these suggestions or override them manually.'
      ],
      hasVisual: true,
      visualType: 'suggestedMappings'
    },
    {
      id: 3,
      title: 'Mappings Panel',
      color: 'border-purple-500',
      items: [
        'Lists the fields that have been mapped so far.',
        'Required mappings must be completed before conversion.',
        'Save Mappings button to save the mappings to the database',
        'Shows the Number of Providers in the Scope sheet. at the bottom of the panel.'
      ],
      hasVisual: true,
      visualType: 'mappingsPanel'
    },
    {
      id: 4,
      title: 'Location & Practice Assignment Panel',
      color: 'border-amber-500',
      items: [
        'Used to assign Practice ID columns or manually enter them.',
        'Location related columns are populated Headers',
        'Shows Location mapping detected at the bottom of the panel.',
        'Practice ID is required to proceed. ⚠'
      ],
      hasVisual: true,
      visualType: 'locationPanel'
    },
    {
      id: 5,
      title: 'Action Buttons (Top Right)',
      color: 'border-red-500',
      isList: true,
      items: [
        { label: 'Upload Files', desc: 'Upload a new scope sheet' },
        { label: 'Convert', desc: 'Generate the final output once validation passes' },
        { label: 'Reset', desc: 'Clear the current session' },
        { label: 'Check Connection', desc: 'Verify Snowflake / system connectivity' },
        { label: 'Packing System', desc: 'Feature to access the Data and Output files' },
        { label: 'Smart Learning', desc: 'View and manage stored column mappings for future detection' }
      ]
    },
    {
      id: 6,
      title: 'Process flow status breadcrumb and toasts',
      color: 'border-cyan-500',
      items: [
        'Shows the current status of the process flow in the breadcrumb and toasts.',
        'Timer to show the time taken to complete the process.',
        'Turns blue to green when the process is complete.',
        'Notification in black box gives a message when a process is complete.'
      ],
      hasVisual: true,
      visualType: 'breadcrumbToast'
    }
  ];

  return (
    <div className="prose prose-neutral max-w-none">
      <h3 className="text-2xl font-semibold text-neutral-800 mb-4">
        Page Layout & Key Elements
      </h3>
      
      <p className="text-neutral-600 mb-6">
        This section describes the key sections on the page, organized from left to right, top to bottom.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((section, index) => (
          <motion.div
            key={section.id}
            className={`bg-white rounded-lg border-2 ${section.color} shadow-lg p-6 flex flex-col cursor-pointer hover:shadow-xl transition-shadow`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.4,
              delay: index * 0.1,
              ease: "easeOut"
            }}
            onClick={() => setSelectedTile(section.id)}
          >
            <h4 className="text-lg font-semibold text-neutral-800 mb-4">
              {section.title}
            </h4>
            {section.isList ? (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-3">
                  {section.items.map((item, itemIndex) => {
                    let Icon;
                    let buttonClass = '';
                    
                    // Assign icons and styles based on button type
                    if (item.label === 'Upload Files') {
                      Icon = Upload;
                      buttonClass = 'bg-black text-white hover:bg-neutral-800';
                    } else if (item.label === 'Convert') {
                      Icon = RotateCw;
                      buttonClass = 'bg-blue-600 text-white hover:bg-blue-700';
                    } else if (item.label === 'Reset') {
                      Icon = RefreshCw;
                      buttonClass = 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200';
                    } else if (item.label === 'Check Connection') {
                      Icon = Globe;
                      buttonClass = 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200';
                    } else if (item.label === 'Packing System') {
                      Icon = Package;
                      buttonClass = 'bg-purple-600 text-white hover:bg-purple-700';
                    }
                    
                    return (
                      <div key={itemIndex} className="flex flex-col items-center gap-2">
                        <button
                          className={`flex items-center gap-2 px-4 py-2 rounded-2xl shadow transition-colors text-sm font-medium ${buttonClass}`}
                          disabled
                          title={item.desc}
                        >
                          {Icon && <Icon className="h-4 w-4" />}
                          <span>{item.label}</span>
                        </button>
                        <p className="text-xs text-neutral-500 text-center max-w-[120px]">
                          {item.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
             ) : section.hasVisual ? (
               <div className="mt-4">
                 {section.visualType === 'columnHeaders' && (
                   <div className="bg-neutral-50 rounded-lg border border-neutral-300 shadow-sm p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h5 className="text-sm font-semibold text-neutral-800">Column Headers</h5>
                      <div className="flex items-center gap-2">
                        <Search className="h-3 w-3 text-neutral-500" />
                        <input
                          className="rounded-lg border px-2 py-1 text-xs w-32"
                          placeholder="Filter columns…"
                          disabled
                        />
                      </div>
                    </div>
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full text-xs">
                        <thead className="bg-neutral-50">
                          <tr>
                            <th className="text-left py-2 px-3 font-semibold text-neutral-700">Column Name</th>
                            <th className="text-left py-2 px-3 font-semibold text-neutral-700">Examples</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-t border-neutral-200 hover:bg-neutral-50">
                            <td className="py-2 px-3">
                              <span className="font-medium">NPI Number</span>
                              <span className="ml-2 px-1.5 py-0.5 bg-blue-500 text-white text-xs rounded-full">NPI</span>
                            </td>
                            <td className="py-2 px-3">
                              <div className="flex gap-1">
                                <span className="bg-neutral-100 px-2 py-0.5 rounded text-xs">1234567890</span>
                                <span className="bg-neutral-100 px-2 py-0.5 rounded text-xs">9876543210</span>
                              </div>
                            </td>
                          </tr>
                          <tr className="border-t border-neutral-200 hover:bg-neutral-50">
                            <td className="py-2 px-3">
                              <span className="font-medium">First Name</span>
                            </td>
                            <td className="py-2 px-3">
                              <div className="flex gap-1">
                                <span className="bg-neutral-100 px-2 py-0.5 rounded text-xs">John</span>
                                <span className="bg-neutral-100 px-2 py-0.5 rounded text-xs">Jane</span>
                              </div>
                            </td>
                          </tr>
                          <tr className="border-t border-neutral-200 hover:bg-neutral-50">
                            <td className="py-2 px-3">
                              <span className="font-medium">Last Name</span>
                            </td>
                            <td className="py-2 px-3">
                              <div className="flex gap-1">
                                <span className="bg-neutral-100 px-2 py-0.5 rounded text-xs">Doe</span>
                                <span className="bg-neutral-100 px-2 py-0.5 rounded text-xs">Smith</span>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                
                 {section.visualType === 'suggestedMappings' && (
                   <div className="bg-neutral-50 rounded-lg border-2 border-green-300 shadow-sm p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <h5 className="text-sm font-semibold text-neutral-800">Suggested</h5>
                      <span className="text-xs text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full">2</span>
                    </div>
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full text-xs">
                        <thead className="bg-neutral-50">
                          <tr>
                            <th className="text-left py-2 px-2 font-semibold text-neutral-600">Detected As</th>
                            <th className="text-left py-2 px-2 font-semibold text-neutral-600">Column Name</th>
                            <th className="w-10"></th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-t border-neutral-100 hover:bg-neutral-50 group">
                            <td className="py-2 px-2">
                              <span className="text-xs font-medium text-blue-600">NPI Number</span>
                            </td>
                            <td className="py-2 px-2 text-sm">NPI</td>
                            <td className="py-2 px-2">
                              <button className="opacity-0 group-hover:opacity-100 text-green-600 hover:text-green-800 text-xs">
                                + Add
                              </button>
                            </td>
                          </tr>
                          <tr className="border-t border-neutral-100 hover:bg-neutral-50 group">
                            <td className="py-2 px-2">
                              <span className="text-xs font-medium text-green-600">First Name</span>
                            </td>
                            <td className="py-2 px-2 text-sm">First Name</td>
                            <td className="py-2 px-2">
                              <button className="opacity-0 group-hover:opacity-100 text-green-600 hover:text-green-800 text-xs">
                                + Add
                              </button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <button className="mt-3 text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors font-medium">
                      Add all
                    </button>
                  </div>
                )}
                
                 {section.visualType === 'mappingsPanel' && (
                   <div className="bg-neutral-50 rounded-lg border-2 border-purple-300 shadow-sm p-4">
                     <div className="mb-3 flex items-center justify-between">
                       <div className="flex items-center gap-2">
                         <h5 className="text-sm font-semibold text-neutral-800">Mappings</h5>
                         <span className="text-xs text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full">3</span>
                       </div>
                       <div className="flex items-center gap-2">
                         <button className="text-neutral-500 hover:text-red-600 transition-colors">
                           <RotateCw className="h-3 w-3" />
                         </button>
                         <button className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                           Save Mappings
                         </button>
                       </div>
                     </div>
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full text-xs">
                        <thead className="bg-neutral-50">
                          <tr>
                            <th className="text-left py-2 px-2 font-semibold text-neutral-600">Detected As</th>
                            <th className="text-left py-2 px-2 font-semibold text-neutral-600">Column Name</th>
                            <th className="w-10"></th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-t border-neutral-100 hover:bg-neutral-50 group">
                            <td className="py-2 px-2">
                              <span className="text-xs font-medium text-blue-600">NPI Number</span>
                            </td>
                            <td className="py-2 px-2 text-sm">NPI</td>
                            <td className="py-2 px-2">
                              <button className="opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-800">
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </td>
                          </tr>
                          <tr className="border-t border-neutral-100 hover:bg-neutral-50 group">
                            <td className="py-2 px-2">
                              <span className="text-xs font-medium text-green-600">First Name</span>
                            </td>
                            <td className="py-2 px-2 text-sm">First Name</td>
                            <td className="py-2 px-2">
                              <button className="opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-800">
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </td>
                          </tr>
                          <tr className="border-t border-neutral-100 hover:bg-neutral-50 group">
                            <td className="py-2 px-2">
                              <span className="text-xs font-medium text-purple-600">Last Name</span>
                            </td>
                            <td className="py-2 px-2 text-sm">Last Name</td>
                            <td className="py-2 px-2">
                              <button className="opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-800">
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-3 pt-3 border-t border-neutral-200 text-xs text-neutral-600">
                      <span className="font-medium">Number of Providers:</span> 150
                    </div>
                  </div>
                )}
                
                 {section.visualType === 'locationPanel' && (
                   <div className="bg-neutral-50 rounded-lg border-2 border-amber-300 shadow-sm p-4">
                    <div className="mb-3">
                      <h5 className="text-sm font-semibold text-neutral-800 mb-3">Location</h5>
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
                      <div className="bg-neutral-50 p-3 rounded-lg border border-amber-200">
                        <h6 className="text-xs font-semibold text-neutral-700 mb-2">Practice ID</h6>
                        <input
                          type="text"
                          className="w-full px-2 py-1.5 border-2 border-neutral-300 rounded-lg text-xs"
                          placeholder="Enter Practice IDs..."
                          disabled
                        />
                        <p className="text-xs text-neutral-500 mt-1">Enter multiple Practice IDs separated by comma</p>
                      </div>
                      <div className="mt-3 pt-3 border-t border-neutral-200 flex items-center justify-between">
                        <div className="text-xs text-neutral-600">
                          <span className="font-medium">Case:</span> 3
                        </div>
                        <button className="p-1 rounded-lg hover:bg-neutral-100">
                          <Info className="h-3 w-3 text-neutral-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                {section.visualType === 'breadcrumbToast' && (
                  <div className="space-y-4 flex flex-col items-center">
                    {/* Breadcrumb */}
                    <div className="bg-white rounded-full shadow-lg py-2 px-4 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-semibold">
                        <Check className="h-3 w-3" />
                      </div>
                      <span className="text-xs font-medium text-green-700">Ready</span>
                    </div>
                    
                    {/* Timer */}
                    <div className="bg-green-600 text-white rounded-full shadow-lg py-2 px-4 flex items-center gap-2">
                      <Check className="h-4 w-4" />
                      <span className="text-sm font-medium">02:45</span>
                    </div>
                    
                    {/* Toast */}
                    <div className="bg-neutral-800 text-white px-4 py-2 rounded-lg shadow-lg text-sm">
                      Files created successfully
                    </div>
                  </div>
                )}
                
              </div>
            ) : (
              null
            )}
          </motion.div>
        ))}
      </div>

      {/* Animation Modal */}
      <AnimatePresence>
        {selectedTile === 1 && (
          <ColumnHeadersAnimationModal 
            isOpen={selectedTile === 1}
            onClose={() => setSelectedTile(null)}
            items={sections.find(s => s.id === 1)?.items || []}
          />
        )}
        {selectedTile === 2 && (
          <SuggestedMappingsAnimationModal 
            isOpen={selectedTile === 2}
            onClose={() => setSelectedTile(null)}
            items={sections.find(s => s.id === 2)?.items || []}
          />
        )}
        {selectedTile === 3 && (
          <MappingsPanelAnimationModal 
            isOpen={selectedTile === 3}
            onClose={() => setSelectedTile(null)}
            items={sections.find(s => s.id === 3)?.items || []}
          />
        )}
        {selectedTile === 4 && (
          <LocationPanelAnimationModal 
            isOpen={selectedTile === 4}
            onClose={() => setSelectedTile(null)}
            items={sections.find(s => s.id === 4)?.items || []}
          />
        )}
        {selectedTile === 5 && (
          <ActionButtonsAnimationModal 
            isOpen={selectedTile === 5}
            onClose={() => setSelectedTile(null)}
            items={sections.find(s => s.id === 5)?.items || []}
          />
        )}
        {selectedTile === 6 && (
          <BreadcrumbToastAnimationModal 
            isOpen={selectedTile === 6}
            onClose={() => setSelectedTile(null)}
            items={sections.find(s => s.id === 6)?.items || []}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Column Headers Animation Modal Component
function ColumnHeadersAnimationModal({ isOpen, onClose, items = [] }) {
  const [step, setStep] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [showCheckmark, setShowCheckmark] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showMouseClick, setShowMouseClick] = useState(false);
  const mouseAnimationRef = React.useRef(null);
  const mousePosRef = React.useRef({ x: 0, y: 0 });
  const containerRef = React.useRef(null);
  
  // Sync ref with state
  React.useEffect(() => {
    mousePosRef.current = mousePosition;
  }, [mousePosition]);

  useEffect(() => {
    if (!isOpen) {
      setStep(0);
      setSearchText('');
      setShowContextMenu(false);
      setSelectedRow(null);
      setShowCheckmark(false);
      setIsFading(false);
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
      setSearchText('');
      setShowContextMenu(false);
      setSelectedRow(null);
      setShowCheckmark(false);
      setIsFading(false);
      setShowMouseClick(false);
      // Start mouse from a visible position (top-left of container)
      const startPos = { x: 50, y: 50 };
      setMousePosition(startPos);
      mousePosRef.current = startPos;
      
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1500 - 500
      
      // Step 1: Move mouse to 'Filter Columns' text box
      setStep(1);
      // Position relative to container: search input is on the right side, approximately 85% of container width, ~25px from top
      const searchBoxPos = { x: 680, y: 25 };
      await animateMouseTo(searchBoxPos, 1000); // 1500 - 500
      
      // Click on search box
      setShowMouseClick(true);
      await new Promise(resolve => setTimeout(resolve, 700)); // 1200 - 500
      setShowMouseClick(false);
      await new Promise(resolve => setTimeout(resolve, 800)); // 1300 - 500
      
      // Step 2: Show "First Name" search result (instant, no typing)
      setSearchText("First Name");
      setSelectedRow('First Name');
      setStep(2);
      await new Promise(resolve => setTimeout(resolve, 800)); // 1300 - 500
      
      // Step 3: Move mouse to First Name row
      setStep(3);
      // Position relative to container: First Name row is approximately at x: center of first column (~150px), y: ~100px from top
      const rowPos = { x: 150, y: 100 };
      await animateMouseTo(rowPos, 1500); // 2000 - 500
      
      // Step 4: Click on row and show context menu
      setStep(4);
      setShowMouseClick(true);
      await new Promise(resolve => setTimeout(resolve, 700)); // 1200 - 500
      setShowMouseClick(false);
      setShowContextMenu(true);
      setStep(5);
      await new Promise(resolve => setTimeout(resolve, 800)); // 1300 - 500
      
      // Step 5: Move mouse to context menu option
      // Position relative to container: context menu is positioned at left: 200px, top: 120px, first option is at ~y: 140px
      const menuPos = { x: 310, y: 140 }; // Center of menu option (200 + 110 for menu width/2)
      await animateMouseTo(menuPos, 900); // 1400 - 500
      await new Promise(resolve => setTimeout(resolve, 700)); // 1200 - 500
      
      // Step 6: Click on "Assign as First Name"
      setStep(6);
      setShowMouseClick(true);
      await new Promise(resolve => setTimeout(resolve, 700)); // 1200 - 500
      setShowMouseClick(false);
      await new Promise(resolve => setTimeout(resolve, 800)); // 1300 - 500
      
      // Step 7: Show checkmark symbol to confirm
      setShowCheckmark(true);
      setStep(7);
      await new Promise(resolve => setTimeout(resolve, 1500)); // 2000 - 500
      
      // Step 8: Fade out
      setIsFading(true);
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1500 - 500
      
      // Step 9: Fade in
      setIsFading(false);
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1500 - 500
    };

    let timeoutId;
    const runAnimation = () => {
      animationSequence().then(() => {
        // Restart immediately after fade in
        timeoutId = setTimeout(runAnimation, 0);
      }).catch((error) => {
        console.error('Animation error:', error);
        // Reset and try again after a delay
        timeoutId = setTimeout(runAnimation, 2000);
      });
    };

    runAnimation(); // Start immediately

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
        className="bg-white rounded-lg shadow-2xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-semibold text-neutral-800">Column Headers Panel</h3>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-700 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div 
          ref={containerRef}
          className={`relative bg-neutral-50 rounded-lg border-2 border-blue-300 shadow-sm p-4 transition-opacity duration-500 ${isFading ? 'opacity-30' : 'opacity-100'}`}
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
              {showMouseClick && (
                <motion.div
                  className="absolute inset-0"
                  initial={{ scale: 1 }}
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 0.26 }} // 0.2 * 1.3
                >
                  <div className="absolute inset-0 bg-blue-400 rounded-full blur-md opacity-50" />
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Search Box */}
          <div className="mb-3 flex items-center justify-between">
            <h5 className="text-sm font-semibold text-neutral-800">Column Headers</h5>
            <div className="flex items-center gap-2 relative">
              <Search className="h-3 w-3 text-neutral-500" />
              <input
                className="rounded-lg border px-2 py-1 text-xs w-32"
                placeholder="Filter columns…"
                value={searchText}
                readOnly
              />
            </div>
          </div>

          {/* Table */}
          <div className="border rounded-lg overflow-hidden bg-white" style={{ minHeight: '180px' }}>
            <table className="w-full text-xs">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="text-left py-2 px-3 font-semibold text-neutral-700">Column Name</th>
                  <th className="text-left py-2 px-3 font-semibold text-neutral-700">Examples</th>
                </tr>
              </thead>
              <tbody>
                {/* Show only First Name row when searchText is not empty */}
                {searchText.length > 0 ? (
                  <>
                    <tr className={`border-t border-neutral-200 relative ${selectedRow === 'First Name' ? 'bg-blue-100' : 'hover:bg-neutral-50'}`}>
                      <td className="py-2 px-3">
                        <span className="font-medium">First Name</span>
                        {showCheckmark && (
                          <motion.span
                            className="ml-2 inline-flex items-center"
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                          >
                            <Check className="h-4 w-4 text-green-600" />
                          </motion.span>
                        )}
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex gap-1">
                          <span className="bg-neutral-100 px-2 py-0.5 rounded text-xs">John</span>
                          <span className="bg-neutral-100 px-2 py-0.5 rounded text-xs">Jane</span>
                        </div>
                      </td>
                    </tr>
                    {/* Empty rows to maintain fixed height */}
                    <tr className="border-t border-neutral-200" style={{ height: '48px' }}>
                      <td className="py-2 px-3"></td>
                      <td className="py-2 px-3"></td>
                    </tr>
                    <tr className="border-t border-neutral-200" style={{ height: '48px' }}>
                      <td className="py-2 px-3"></td>
                      <td className="py-2 px-3"></td>
                    </tr>
                  </>
                ) : (
                  <>
                    <tr className={`border-t border-neutral-200 ${selectedRow === 'NPI Number' ? 'bg-blue-100' : 'hover:bg-neutral-50'}`}>
                      <td className="py-2 px-3">
                        <span className="font-medium">NPI Number</span>
                        <span className="ml-2 px-1.5 py-0.5 bg-blue-500 text-white text-xs rounded-full">NPI</span>
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex gap-1">
                          <span className="bg-neutral-100 px-2 py-0.5 rounded text-xs">1234567890</span>
                          <span className="bg-neutral-100 px-2 py-0.5 rounded text-xs">9876543210</span>
                        </div>
                      </td>
                    </tr>
                    <tr className={`border-t border-neutral-200 relative ${selectedRow === 'First Name' ? 'bg-blue-100' : 'hover:bg-neutral-50'}`}>
                      <td className="py-2 px-3">
                        <span className="font-medium">First Name</span>
                        {showCheckmark && (
                          <motion.span
                            className="ml-2 inline-flex items-center"
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                          >
                            <Check className="h-4 w-4 text-green-600" />
                          </motion.span>
                        )}
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex gap-1">
                          <span className="bg-neutral-100 px-2 py-0.5 rounded text-xs">John</span>
                          <span className="bg-neutral-100 px-2 py-0.5 rounded text-xs">Jane</span>
                        </div>
                      </td>
                    </tr>
                    <tr className="border-t border-neutral-200 hover:bg-neutral-50">
                      <td className="py-2 px-3">
                        <span className="font-medium">Last Name</span>
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex gap-1">
                          <span className="bg-neutral-100 px-2 py-0.5 rounded text-xs">Doe</span>
                          <span className="bg-neutral-100 px-2 py-0.5 rounded text-xs">Smith</span>
                        </div>
                      </td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>

          {/* Context Menu */}
          <AnimatePresence>
            {showContextMenu && (
              <motion.div
                className="absolute bg-white border border-neutral-300 rounded-lg shadow-xl py-2 z-10"
                style={{
                  left: '200px',
                  top: '120px',
                  minWidth: '220px'
                }}
                initial={{ opacity: 0, scale: 0.9, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -10 }}
              >
                <div className={`px-2 py-1.5 cursor-pointer flex items-center justify-between ${step >= 6 ? 'bg-blue-50' : 'hover:bg-blue-50'}`}>
                  <span className="text-xs text-neutral-700">Assign as First Name</span>
                  {step >= 6 && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <Check className="h-3 w-3 text-green-600" />
                    </motion.span>
                  )}
                </div>
                <div className="border-t border-neutral-200 my-1"></div>
                <div className="px-2 py-1.5 hover:bg-neutral-50 cursor-pointer">
                  <span className="text-xs text-neutral-700">Assign as Last Name</span>
                </div>
                <div className="px-2 py-1.5 hover:bg-neutral-50 cursor-pointer">
                  <span className="text-xs text-neutral-700">Assign as Gender</span>
                </div>
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
