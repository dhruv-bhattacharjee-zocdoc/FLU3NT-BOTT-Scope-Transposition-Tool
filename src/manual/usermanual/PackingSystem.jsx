import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, Package, FileText, Play, Download, ChevronDown } from 'lucide-react';

/**
 * Packing System - User Manual Content Component
 */
export default function PackingSystem() {
  const [hoveredStep, setHoveredStep] = useState(null);
  const [expandedSteps, setExpandedSteps] = useState(new Set());
  
  const toggleStep = (stepId) => {
    setExpandedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepId)) {
        newSet.delete(stepId);
      } else {
        newSet.add(stepId);
      }
      return newSet;
    });
  };

  const steps = [
    {
      id: 1,
      title: 'Complete Extraction',
      description: 'Ensure the conversion/extraction process has completed successfully',
      icon: CheckCircle,
      color: 'green',
      details: [
        'The breadcrumb should show "Ready" status (green checkmark)',
        'Console should show "Files created successfully" message',
        'The Packing System button should turn purple when ready'
      ]
    },
    {
      id: 2,
      title: 'Open Packing System',
      description: 'Click the Packing System button (purple button with package icon)',
      icon: Package,
      color: 'purple',
      details: [
        'The button is located in the top right corner',
        'It turns purple when extraction is complete',
        'A dialog box will open with packing options'
      ]
    },
    {
      id: 3,
      title: 'Enter Template File Name',
      description: 'Specify the name for your final output file',
      icon: FileText,
      color: 'blue',
      details: [
        'Enter a file name in the "Template File Name" field',
        'Do not include the .xlsx extension (it will be added automatically)',
        'Default name is "Template copy" if left empty',
        'Press Enter to start packing after entering the name'
      ]
    },
    {
      id: 4,
      title: 'Start Packing',
      description: 'Click the "Pack" button to begin the packing process',
      icon: Play,
      color: 'indigo',
      details: [
        'The button will show "Packing..." while processing',
        'Progress is logged in the Console panel',
        'The process combines all intermediate files into the final template',
        'Timer continues running during packing'
      ]
    },
    {
      id: 5,
      title: 'Download Final File',
      description: 'After packing completes, download your final template',
      icon: Download,
      color: 'emerald',
      details: [
        'The "Pack" button changes to "Download" (green) when complete',
        'Click "Download" to open the file location in Windows Explorer',
        'The file will be saved in the backend Excel Files directory',
        'File name format: [YourFileName].xlsx'
      ]
    }
  ];

  return (
    <div className="prose prose-neutral max-w-none">
      <h3 className="text-2xl font-semibold text-neutral-800 mb-4">
        Packing System
      </h3>
      
      <p className="text-neutral-600 mb-6">
        The Packing System combines all intermediate files created during extraction into a single, 
        final Zocdoc template file. This is the last step in the data transposition workflow.
      </p>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-6 rounded-r">
        <p className="text-sm font-medium text-blue-800 mb-2">What Gets Packed:</p>
        <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
          <li>Mappings.xlsx - Column mapping definitions</li>
          <li>_Mapped.xlsx - Mapped data with transformations</li>
          <li>Locations_input.xlsx - Location data</li>
          <li>NPI-Extracts.xlsx - Extracted NPI data from Snowflake</li>
          <li>Practice_Locations.xlsx - Practice and location reference data</li>
        </ul>
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isHovered = hoveredStep === step.id;
          const isExpanded = expandedSteps.has(step.id);
          const showContent = isHovered || isExpanded;
          
          const colorClasses = {
            blue: 'border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100/50 hover:from-blue-100 hover:to-blue-200/50',
            indigo: 'border-indigo-500 bg-gradient-to-r from-indigo-50 to-indigo-100/50 hover:from-indigo-100 hover:to-indigo-200/50',
            purple: 'border-purple-500 bg-gradient-to-r from-purple-50 to-purple-100/50 hover:from-purple-100 hover:to-purple-200/50',
            green: 'border-green-500 bg-gradient-to-r from-green-50 to-green-100/50 hover:from-green-100 hover:to-green-200/50',
            emerald: 'border-emerald-500 bg-gradient-to-r from-emerald-50 to-emerald-100/50 hover:from-emerald-100 hover:to-emerald-200/50'
          };

          const iconTextColors = {
            blue: 'text-blue-600',
            indigo: 'text-indigo-600',
            purple: 'text-purple-600',
            green: 'text-green-600',
            emerald: 'text-emerald-600'
          };

          const iconBorderColors = {
            blue: 'border-blue-500',
            indigo: 'border-indigo-500',
            purple: 'border-purple-500',
            green: 'border-green-500',
            emerald: 'border-emerald-500'
          };

          const bulletColorClasses = {
            blue: 'text-blue-500',
            indigo: 'text-indigo-500',
            purple: 'text-purple-500',
            green: 'text-green-500',
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
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h4 className="text-lg font-semibold text-neutral-800">
                        {step.title}
                      </h4>
                      <motion.div
                        animate={{ rotate: showContent ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="h-5 w-5 text-neutral-400 flex-shrink-0" />
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
                            <span className={`${bulletColorClasses[step.color]} flex-shrink-0 mt-0.5`}>•</span>
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
        className="bg-amber-50 border-l-4 border-amber-500 p-4 my-6 rounded-r"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{
          duration: 0.4,
          delay: 0.6,
          ease: "easeOut"
        }}
      >
        <p className="text-sm font-medium text-amber-800 mb-2">Additional Options:</p>
        <ul className="text-sm text-amber-700 space-y-1 list-disc list-inside">
          <li><strong>Delete Excel Files:</strong> Removes all intermediate Excel files from the backend directory</li>
          <li><strong>Cancel:</strong> Closes the packing dialog without packing</li>
          <li>The dialog cannot be closed while packing is in progress</li>
        </ul>
      </motion.div>

      <motion.div 
        className="bg-green-50 border-l-4 border-green-500 p-4 my-6 rounded-r"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{
          duration: 0.4,
          delay: 0.7,
          ease: "easeOut"
        }}
      >
        <p className="text-sm font-medium text-green-800 mb-2">After Packing:</p>
        <ul className="text-sm text-green-700 space-y-1 list-disc list-inside">
          <li>Your final template file is ready for use</li>
          <li>The file contains all mapped and transformed data</li>
          <li>You can access it via the Windows Explorer window that opens</li>
          <li>Intermediate files remain in the backend directory for reference</li>
        </ul>
      </motion.div>
    </div>
  );
}

