import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Database, CheckCircle, ChevronDown, Edit } from 'lucide-react';

/**
 * Highlighting - Business Rules Content Component
 */
export default function Highlighting() {
  const [hoveredStep, setHoveredStep] = useState(null);
  const [expandedSteps, setExpandedSteps] = useState(new Set());
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

  const highlightTypes = [
    {
      id: 1,
      color: 'Yellow',
      hexCode: '#FFFF00',
      purpose: 'Warning/Exceeded Limit',
      description: 'Indicates that the number of values exceeds the available columns',
      icon: AlertTriangle,
      colorTheme: 'yellow',
      examples: [
        'Specialty: 6 or more specialties found (only 5 columns available)',
        'Professional Suffix: 4 or more suffixes found (only 3 columns available)'
      ],
      location: 'Entire row of Specialty or Professional Suffix columns'
    },
    {
      id: 2,
      color: 'Blue',
      hexCode: '#C1EAFF',
      purpose: 'Fallback Data',
      description: 'Indicates that the cell was populated using fallback logic from NPI-Extracts.xlsx',
      icon: Database,
      colorTheme: 'blue',
      examples: [
        'Specialty populated from Specialty Derived',
        'Professional Suffix populated from Suffix Derived',
        'Gender populated from GENDER',
        'Additional Languages populated from LANGUAGES'
      ],
      location: 'Individual cells that were populated via fallback logic'
    },
    {
      id: 3,
      color: 'Green',
      hexCode: '#00FF00',
      purpose: 'Columns Worked Upon',
      description: 'Indicates that a column was mapped or populated by the system',
      icon: CheckCircle,
      colorTheme: 'green',
      examples: [
        'Professional Suffix column headers when fallback populates any cells in that column'
      ],
      location: 'Column headers in the Provider sheet'
    },
    {
      id: 4,
      color: 'Grey',
      hexCode: '#D3D3D3',
      purpose: 'To Revise',
      description: 'Indicates that this cell requires manual review and revision',
      icon: Edit,
      colorTheme: 'gray',
      examples: [
        'Professional Suffix 3 column cells that need to be reviewed and updated'
      ],
      location: 'Professional Suffix 3 column of the Provider sheet in Template copy.xlsx'
    }
  ];

  // Handle hover delay
  useEffect(() => {
    highlightTypes.forEach(step => {
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
        Highlighting
      </h3>
      
      <p className="text-neutral-600 mb-6">
        The FLU3NT system uses color highlighting to provide visual feedback about data status, 
        fallback logic application, and potential issues. Understanding these color codes helps 
        you quickly identify data quality and processing status.
      </p>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-6 rounded-r">
        <p className="text-sm font-medium text-blue-800 mb-2">Highlighting in Template File:</p>
        <p className="text-sm text-blue-700">
          The following color codes are used in the final Template copy.xlsx file to indicate 
          different data states and processing results.
        </p>
      </div>

      <div className="space-y-4">
        {highlightTypes.map((highlight, index) => {
          const Icon = highlight.icon;
          const isHovered = hoveredStep === highlight.id;
          const isExpanded = expandedSteps.has(highlight.id);
          const shouldShowContent = isHovered || isExpanded;
          const showContent = delayedContent.has(step.id);
          
          const colorClasses = {
            yellow: 'border-yellow-500 bg-gradient-to-r from-yellow-50 to-yellow-100/50 hover:from-yellow-100 hover:to-yellow-200/50',
            blue: 'border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100/50 hover:from-blue-100 hover:to-blue-200/50',
            green: 'border-green-500 bg-gradient-to-r from-green-50 to-green-100/50 hover:from-green-100 hover:to-green-200/50',
            gray: 'border-gray-500 bg-gradient-to-r from-gray-50 to-gray-100/50 hover:from-gray-100 hover:to-gray-200/50'
          };

          const iconTextColors = {
            yellow: 'text-yellow-600',
            blue: 'text-blue-600',
            green: 'text-green-600',
            gray: 'text-gray-600'
          };

          const iconBorderColors = {
            yellow: 'border-yellow-500',
            blue: 'border-blue-500',
            green: 'border-green-500',
            gray: 'border-gray-500'
          };

          const bulletColorClasses = {
            yellow: 'text-yellow-500',
            blue: 'text-blue-500',
            green: 'text-green-500',
            gray: 'text-gray-500'
          };

          return (
            <motion.div
              key={highlight.id}
              className={`border-l-4 ${colorClasses[highlight.colorTheme]} rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden relative`}
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
              onMouseEnter={() => setHoveredStep(highlight.id)}
              onMouseLeave={() => setHoveredStep(null)}
              onClick={() => toggleStep(highlight.id)}
            >
              <div className="p-5 cursor-pointer">
                <div className="flex items-start gap-4">
                  {/* Color Swatch and Icon Badge */}
                  <div className="flex-shrink-0 flex flex-col items-center gap-2">
                    <div 
                      className="w-12 h-12 rounded-lg border-2 border-neutral-300 shadow-sm"
                      style={{ backgroundColor: highlight.hexCode }}
                      title={highlight.hexCode}
                    />
                    <div className={`w-12 h-12 rounded-xl bg-white border-2 ${iconBorderColors[highlight.colorTheme]} flex items-center justify-center shadow-sm`}>
                      <Icon className={`h-6 w-6 ${iconTextColors[highlight.colorTheme]}`} />
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div>
                        <h4 className="text-lg font-semibold text-neutral-800">
                          {highlight.color} Highlight
                        </h4>
                      </div>
                      <motion.div
                        animate={{ rotate: shouldShowContent ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="h-5 w-5 text-neutral-400 flex-shrink-0" />
                      </motion.div>
                    </div>
                    <p className="text-neutral-600 text-sm leading-relaxed mb-2">
                      <strong>Purpose:</strong> {highlight.purpose}
                    </p>
                    <p className="text-neutral-600 text-sm leading-relaxed mb-2">
                      {highlight.description}
                    </p>
                  </div>
                </div>
                
                {/* Examples - show on hover or click */}
                <AnimatePresence>
                  {showContent && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="mt-4 pt-4 border-t border-white/50"
                    >
                      <p className="text-sm font-medium text-neutral-700 mb-2">Examples:</p>
                      <ul className="text-neutral-600 space-y-2 text-sm">
                        {highlight.examples.map((example, idx) => (
                          <motion.li 
                            key={idx}
                            className="flex items-start gap-2.5"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2, delay: 0.1 + idx * 0.05 }}
                          >
                            <span className={`${bulletColorClasses[highlight.colorTheme]} flex-shrink-0 mt-0.5`}>•</span>
                            <span className="flex-1 leading-relaxed">{example}</span>
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
        className="bg-red-50 border-l-4 border-red-500 p-4 my-6 rounded-r"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{
          duration: 0.4,
          delay: 0.6,
          ease: "easeOut"
        }}
      >
        <p className="text-sm font-medium text-red-800 mb-2">⚠️ Important:</p>
        <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
          <li>Yellow highlights require manual review - some data may be truncated</li>
          <li>Yellow highlights require manual review - some data may be truncated</li>
          <li>Blue highlights indicate fallback data - verify against source if needed</li>
          <li>Highlighting is applied during the packing process automatically</li>
          <li>You can remove highlighting manually in Excel if needed</li>
        </ul>
      </motion.div>
    </div>
  );
}

