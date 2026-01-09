import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, 
  FileText, 
  MapPin, 
  CheckCircle, 
  Building2, 
  Eye, 
  RotateCw, 
  BarChart3,
  ChevronDown,
  Play
} from 'lucide-react';
import MappingWorkflowModal from './MappingWorkflowModal';

/**
 * Mappings and Extraction - User Manual Content Component
 */
export default function MappingsAndExtraction() {
  const [hoveredStep, setHoveredStep] = useState(null);
  const [expandedSteps, setExpandedSteps] = useState(new Set());
  const [showDemo, setShowDemo] = useState(false);
  const [delayedContent, setDelayedContent] = useState(new Set());
  const timeoutRefs = useRef({});
  
  const toggleStep = (stepId) => {
    setExpandedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepId)) {
        newSet.delete(stepId);
        // Clear timeout and remove from delayed content if collapsing
        if (timeoutRefs.current[stepId]) {
          clearTimeout(timeoutRefs.current[stepId]);
          delete timeoutRefs.current[stepId];
        }
        setDelayedContent(prev => {
          const newDelayed = new Set(prev);
          newDelayed.delete(stepId);
          return newDelayed;
        });
      } else {
        newSet.add(stepId);
        // Set timeout for delayed content
        timeoutRefs.current[stepId] = setTimeout(() => {
          setDelayedContent(prev => new Set(prev).add(stepId));
        }, 1000);
      }
      return newSet;
    });
  };

  const workflowSteps = [
    {
      id: 1,
      title: 'Upload Files',
      description: 'Upload your scope sheet file (CSV, TSV, or XLSX format)',
      icon: Upload,
      color: 'blue',
      details: [
        'Click the "Upload Files" button (black button with upload icon)',
        'Select one or more files from your computer',
        'The system will automatically parse and detect column headers',
        'Column headers will appear in the left panel with example values'
      ]
    },
    {
      id: 2,
      title: 'Review Column Headers',
      description: 'Examine the detected columns in the Column Headers panel',
      icon: FileText,
      color: 'indigo',
      details: [
        'All columns from your file are displayed in a scrollable table',
        'Each column shows 2-3 example values (deduplicated)',
        'Use the search bar to filter columns if needed',
        'Columns are sorted: mapped columns first, then NPI, then alphabetically'
      ]
    },
    {
      id: 3,
      title: 'Map Columns to Zocdoc Fields',
      description: 'Assign columns to required Zocdoc template fields',
      icon: MapPin,
      color: 'purple',
      details: [
        'Right-click on a column header to open the context menu',
        'Select the appropriate field type (NPI, First Name, Last Name, etc.)',
        'Review suggested mappings in the "Suggested" panel',
        'Click "+ Add" on suggested mappings to quickly accept them',
        'Or use "Add all" button to accept all suggestions at once'
      ]
    },
    {
      id: 4,
      title: 'Required Mappings',
      description: 'Ensure all required fields are mapped before conversion',
      icon: CheckCircle,
      color: 'green',
      details: [
        'First Name - Required',
        'Last Name - Required',
        'Headshot Link - Required',
        'Practice ID OR Practice Cloud ID - Required (can be mapped or entered manually)'
      ]
    },
    {
      id: 5,
      title: 'Assign Practice ID',
      description: 'Map Practice ID column or enter manually',
      icon: Building2,
      color: 'teal',
      details: [
        'Option 1: Map a column as "Practice ID" or "Practice Cloud ID"',
        'Option 2: Enter Practice IDs manually in the Location panel',
        'Practice names will be automatically fetched and displayed',
        'Multiple Practice IDs can be entered (comma, semicolon, or space separated)'
      ]
    },
    {
      id: 6,
      title: 'Review Mappings',
      description: 'Check your mappings in the Mappings panel',
      icon: Eye,
      color: 'amber',
      details: [
        'All mapped columns are listed in the middle panel',
        'Mapped columns are highlighted with color-coded borders',
        'Hover over the Mappings panel to see the number of providers',
        'Remove mappings by clicking the trash icon on hover'
      ]
    },
    {
      id: 7,
      title: 'Convert (Extraction)',
      description: 'Start the conversion and extraction process',
      icon: RotateCw,
      color: 'red',
      details: [
        'Click the "Convert" button (blue button with circular arrow icon)',
        'The system will:',
        'Create Mappings.xlsx file',
        'Create _Mapped.xlsx file',
        'Create Locations_input.xlsx file',
        'Extract NPI data from Snowflake',
        'Process and transform the data',
        'Monitor progress in the Console panel at the bottom',
        'A timer will appear showing the elapsed time'
      ]
    },
    {
      id: 8,
      title: 'Monitor Progress',
      description: 'Track the conversion process',
      icon: BarChart3,
      color: 'emerald',
      details: [
        'Watch the breadcrumb at the bottom for step-by-step progress',
        'Console logs show detailed information about each step',
        'The timer displays how long the process has been running',
        'Status changes from "Transposing" (blue) to "Ready" (green) when complete'
      ]
    }
  ];

  // Handle hover delay
  useEffect(() => {
    workflowSteps.forEach(step => {
      const isHovered = hoveredStep === step.id;
      const isExpanded = expandedSteps.has(step.id);
      const shouldShow = isHovered || isExpanded;
      
      if (shouldShow) {
        // Clear any existing timeout
        if (timeoutRefs.current[step.id]) {
          clearTimeout(timeoutRefs.current[step.id]);
        }
        // Set timeout for delayed content
        timeoutRefs.current[step.id] = setTimeout(() => {
          setDelayedContent(prev => new Set(prev).add(step.id));
        }, 1000);
      } else {
        // Clear timeout and remove from delayed content
        if (timeoutRefs.current[step.id]) {
          clearTimeout(timeoutRefs.current[step.id]);
          delete timeoutRefs.current[step.id];
        }
        setDelayedContent(prev => {
          const newDelayed = new Set(prev);
          newDelayed.delete(step.id);
          return newDelayed;
        });
      }
    });
  }, [hoveredStep, expandedSteps]);

  return (
    <div className="prose prose-neutral max-w-none">
      <h3 className="text-2xl font-semibold text-neutral-800 mb-4">
        Mappings and Extraction
      </h3>
      
      <p className="text-neutral-600 mb-6">
        This section covers the complete workflow for mapping columns and extracting data. 
        Follow these steps in order to successfully convert your scope sheet into a Zocdoc template.
      </p>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-6 rounded-r">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-800 mb-2">Workflow Overview:</p>
            <p className="text-sm text-blue-700">
              Upload File → Map Columns → Assign Practice ID → Convert → Extract Data → Ready for Packing
            </p>
          </div>
          <motion.button
            onClick={() => setShowDemo(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Play className="h-4 w-4" />
            <span>View Demo</span>
          </motion.button>
        </div>
      </div>

      <div className="space-y-4">
        {workflowSteps.map((step, index) => {
          const Icon = step.icon;
          const isHovered = hoveredStep === step.id;
          const isExpanded = expandedSteps.has(step.id);
          const shouldShowContent = isHovered || isExpanded;
          const showContent = delayedContent.has(step.id);
          
          const colorClasses = {
            blue: 'border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100/50 hover:from-blue-100 hover:to-blue-200/50',
            indigo: 'border-indigo-500 bg-gradient-to-r from-indigo-50 to-indigo-100/50 hover:from-indigo-100 hover:to-indigo-200/50',
            purple: 'border-purple-500 bg-gradient-to-r from-purple-50 to-purple-100/50 hover:from-purple-100 hover:to-purple-200/50',
            green: 'border-green-500 bg-gradient-to-r from-green-50 to-green-100/50 hover:from-green-100 hover:to-green-200/50',
            teal: 'border-teal-500 bg-gradient-to-r from-teal-50 to-teal-100/50 hover:from-teal-100 hover:to-teal-200/50',
            amber: 'border-amber-500 bg-gradient-to-r from-amber-50 to-amber-100/50 hover:from-amber-100 hover:to-amber-200/50',
            red: 'border-red-500 bg-gradient-to-r from-red-50 to-red-100/50 hover:from-red-100 hover:to-red-200/50',
            emerald: 'border-emerald-500 bg-gradient-to-r from-emerald-50 to-emerald-100/50 hover:from-emerald-100 hover:to-emerald-200/50'
          };

          const iconTextColors = {
            blue: 'text-blue-600',
            indigo: 'text-indigo-600',
            purple: 'text-purple-600',
            green: 'text-green-600',
            teal: 'text-teal-600',
            amber: 'text-amber-600',
            red: 'text-red-600',
            emerald: 'text-emerald-600'
          };

          const iconBorderColors = {
            blue: 'border-blue-500',
            indigo: 'border-indigo-500',
            purple: 'border-purple-500',
            green: 'border-green-500',
            teal: 'border-teal-500',
            amber: 'border-amber-500',
            red: 'border-red-500',
            emerald: 'border-emerald-500'
          };

          const bulletColorClasses = {
            blue: 'text-blue-500',
            indigo: 'text-indigo-500',
            purple: 'text-purple-500',
            green: 'text-green-500',
            teal: 'text-teal-500',
            amber: 'text-amber-500',
            red: 'text-red-500',
            emerald: 'text-emerald-500'
          };

          return (
            <motion.div
              key={step.id}
              className={`border-l-4 ${colorClasses[step.color]} rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden relative`}
              initial={{ opacity: 0, x: -30, scale: 0.98 }}
              animate={{ 
                opacity: 1, 
                x: 0, 
                scale: isHovered ? 1.02 : 1,
                boxShadow: isHovered ? '0 10px 25px -5px rgba(0, 0, 0, 0.1)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
              }}
              transition={{
                duration: 0.4,
                delay: index * 0.1,
                ease: "easeOut"
              }}
              onMouseEnter={() => setHoveredStep(step.id)}
              onMouseLeave={() => setHoveredStep(null)}
              onClick={() => toggleStep(step.id)}
            >
              <div className="p-5 cursor-pointer">
                <div className="flex items-start gap-4">
                  {/* Step Icon Badge */}
                  <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-white border-2 ${iconBorderColors[step.color]} flex items-center justify-center shadow-sm`}>
                    <Icon className={`h-6 w-6 ${iconTextColors[step.color]}`} />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0 pr-8">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h4 className="text-lg font-semibold text-neutral-800">
                        {step.title}
                      </h4>
                      <motion.div
                        animate={{ rotate: shouldShowContent ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex-shrink-0"
                      >
                        <ChevronDown className="h-5 w-5 text-neutral-400" />
                      </motion.div>
                    </div>
                    <p className="text-neutral-600 text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
                
                {/* Subtopic details - show on hover or click */}
                <AnimatePresence>
                  {showContent && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="mt-4 pt-4 border-t border-white/50"
                    >
                      <ul className="text-neutral-600 space-y-2 text-sm">
                        {step.details.map((detail, idx) => (
                          <motion.li 
                            key={idx}
                            className="flex items-start gap-2.5"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2, delay: 0.1 + idx * 0.05 }}
                          >
                            <span className={`${bulletColorClasses[step.color]} flex-shrink-0 mt-0.S`}>•</span>
                            <span className="flex-1 leading-relaxed">{detail}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div 
        className="bg-purple-50 border-l-4 border-purple-500 p-4 my-6 rounded-r"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{
          duration: 0.4,
          delay: 0.9,
          ease: "easeOut"
        }}
      >
        <p className="text-sm font-medium text-purple-800 mb-2">Tips for Successful Mapping:</p>
        <ul className="text-sm text-purple-700 space-y-1 list-disc list-inside">
          <li>Use the Suggested panel to quickly accept auto-detected mappings</li>
          <li>Save your mappings to the knowledge base for future use</li>
          <li>Review example values in column headers to verify correct mapping</li>
          <li>Check the Console for any warnings or errors during mapping</li>
        </ul>
      </motion.div>

      <motion.div 
        className="bg-red-50 border-l-4 border-red-500 p-4 my-6 rounded-r"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{
          duration: 0.4,
          delay: 1.0,
          ease: "easeOut"
        }}
      >
        <p className="text-sm font-medium text-red-800 mb-2">⚠️ Common Issues:</p>
        <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
          <li>If conversion fails, check that all required mappings are complete</li>
          <li>Ensure Practice ID is assigned (either mapped or manually entered)</li>
          <li>Verify Snowflake connection is successful before converting</li>
          <li>Check console logs for specific error messages</li>
        </ul>
      </motion.div>

      {/* Mapping Workflow Demo Modal */}
      <MappingWorkflowModal 
        isOpen={showDemo} 
        onClose={() => setShowDemo(false)} 
      />
    </div>
  );
}

