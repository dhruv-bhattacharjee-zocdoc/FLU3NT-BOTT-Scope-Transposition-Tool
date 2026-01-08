import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Database, User, Users, Languages, ChevronDown } from 'lucide-react';

/**
 * Fallback Logics - Business Rules Content Component
 */
export default function FallbackLogics() {
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

  const fallbackTypes = [
    {
      id: 1,
      title: 'Specialty Fallback',
      description: 'Populates Specialty 1-5 columns when they are empty',
      source: 'NPI-Extracts.xlsx → Specialty Derived column',
      icon: Database,
      color: 'blue',
      logic: [
        'If Specialty 1 is empty for any row, the system retrieves the NPI Number from that row',
        'Searches for the matching NPI in NPI-Extracts.xlsx (NPI Extracts sheet)',
        'Extracts the Specialty Derived value from the matched row',
        'Splits the value by semicolon (;) to separate multiple specialties',
        'Populates Specialty 1 through Specialty 5 with the split values',
        'If 6 or more specialties are found, the row is highlighted in yellow',
        'Fallback-populated cells are highlighted in blue'
      ]
    },
    {
      id: 2,
      title: 'Professional Suffix Fallback',
      description: 'Populates Professional Suffix 1-3 columns when they are empty',
      source: 'NPI-Extracts.xlsx → Suffix Derived column',
      icon: User,
      color: 'purple',
      logic: [
        'If Professional Suffix 1 is empty for any row, the system retrieves the NPI Number',
        'Searches for the matching NPI in NPI-Extracts.xlsx',
        'Extracts the Suffix Derived value from the matched row',
        'Splits the value by semicolon (;) to separate multiple suffixes',
        'Populates Professional Suffix 1 through Professional Suffix 3',
        'If 4 or more suffixes are found, the row is highlighted in yellow',
        'Fallback-populated cells are highlighted in blue',
        'Column headers are highlighted in green when fallback is applied'
      ]
    },
    {
      id: 3,
      title: 'Gender Fallback',
      description: 'Populates Gender column when it is empty',
      source: 'NPI-Extracts.xlsx → GENDER column',
      icon: Users,
      color: 'pink',
      logic: [
        'If Gender is empty for any row, the system retrieves the NPI Number',
        'Searches for the matching NPI in NPI-Extracts.xlsx',
        'Extracts the GENDER value (format: "F" or "M")',
        'Converts "F" to "Female" and "M" to "Male"',
        'Populates the Gender column in the Provider sheet',
        'Fallback-populated cells are highlighted in blue'
      ]
    },
    {
      id: 4,
      title: 'Additional Languages Fallback',
      description: 'Populates Additional Languages Spoken 1-3 columns when they are empty',
      source: 'NPI-Extracts.xlsx → LANGUAGES column',
      icon: Languages,
      color: 'teal',
      logic: [
        'If Additional Languages Spoken 1 is empty for any row, the system retrieves the NPI Number',
        'Searches for the matching NPI in NPI-Extracts.xlsx',
        'Extracts the LANGUAGES value from the matched row',
        'Splits the value by semicolon (;) to separate multiple languages',
        'Populates Additional Languages Spoken 1 through Additional Languages Spoken 3',
        'Fallback-populated cells are highlighted in blue'
      ]
    }
  ];

  return (
    <div className="prose prose-neutral max-w-none">
      <h3 className="text-2xl font-semibold text-neutral-800 mb-4">
        Fallback Logics
      </h3>
      
      <p className="text-neutral-600 mb-6">
        Fallback logics are automated processes that populate empty fields in the Template copy.xlsx file 
        when the primary data source is unavailable or empty. These logics use data extracted from 
        NPI-Extracts.xlsx to fill in missing information based on NPI Number matching.
      </p>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-6 rounded-r">
        <p className="text-sm font-medium text-blue-800 mb-2">How Fallback Logics Work:</p>
        <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
          <li>System checks if a required field is empty in the Template copy.xlsx</li>
          <li>Retrieves the NPI Number from the same row</li>
          <li>Searches for the matching NPI in NPI-Extracts.xlsx</li>
          <li>Extracts the corresponding data from the NPI Extracts sheet</li>
          <li>Populates the empty field with the extracted data</li>
          <li>Highlights the cell to indicate it was populated via fallback</li>
        </ol>
      </div>

      <div className="space-y-4">
        {fallbackTypes.map((fallback, index) => {
          const Icon = fallback.icon;
          const isHovered = hoveredStep === fallback.id;
          const isExpanded = expandedSteps.has(fallback.id);
          const showContent = isHovered || isExpanded;
          
          const colorClasses = {
            blue: 'border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100/50 hover:from-blue-100 hover:to-blue-200/50',
            purple: 'border-purple-500 bg-gradient-to-r from-purple-50 to-purple-100/50 hover:from-purple-100 hover:to-purple-200/50',
            pink: 'border-pink-500 bg-gradient-to-r from-pink-50 to-pink-100/50 hover:from-pink-100 hover:to-pink-200/50',
            teal: 'border-teal-500 bg-gradient-to-r from-teal-50 to-teal-100/50 hover:from-teal-100 hover:to-teal-200/50'
          };

          const iconTextColors = {
            blue: 'text-blue-600',
            purple: 'text-purple-600',
            pink: 'text-pink-600',
            teal: 'text-teal-600'
          };

          const iconBorderColors = {
            blue: 'border-blue-500',
            purple: 'border-purple-500',
            pink: 'border-pink-500',
            teal: 'border-teal-500'
          };

          const bulletColorClasses = {
            blue: 'text-blue-500',
            purple: 'text-purple-500',
            pink: 'text-pink-500',
            teal: 'text-teal-500'
          };

          return (
            <motion.div
              key={fallback.id}
              className={`border-l-4 ${colorClasses[fallback.color]} rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden relative`}
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
              onMouseEnter={() => setHoveredStep(fallback.id)}
              onMouseLeave={() => setHoveredStep(null)}
              onClick={() => toggleStep(fallback.id)}
            >
              <div className="p-5 cursor-pointer">
                <div className="flex items-start gap-4">
                  {/* Icon Badge */}
                  <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-white border-2 ${iconBorderColors[fallback.color]} flex items-center justify-center shadow-sm`}>
                    <Icon className={`h-6 w-6 ${iconTextColors[fallback.color]}`} />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h4 className="text-lg font-semibold text-neutral-800">
                        {fallback.title}
                      </h4>
                      <motion.div
                        animate={{ rotate: showContent ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="h-5 w-5 text-neutral-400 flex-shrink-0" />
                      </motion.div>
                    </div>
                    <p className="text-neutral-600 text-sm leading-relaxed mb-2">
                      {fallback.description}
                    </p>
                    <p className="text-sm text-neutral-500 mb-2">
                      <strong>Data Source:</strong> {fallback.source}
                    </p>
                  </div>
                </div>
                
                {/* Logic details - show on hover or click */}
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
                        {fallback.logic.map((step, idx) => (
                          <motion.li 
                            key={idx}
                            className="flex items-start gap-2.5"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2, delay: 0.1 + idx * 0.05 }}
                          >
                            <span className={`${bulletColorClasses[fallback.color]} flex-shrink-0 mt-0.5`}>•</span>
                            <span className="flex-1 leading-relaxed">{step}</span>
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
          delay: 0.5,
          ease: "easeOut"
        }}
      >
        <p className="text-sm font-medium text-amber-800 mb-2">Important Notes:</p>
        <ul className="text-sm text-amber-700 space-y-1 list-disc list-inside">
          <li>Fallback logics only run when the primary field is empty (null or blank string)</li>
          <li>NPI Number matching is case-insensitive and handles various formats (string, integer, float)</li>
          <li>Multiple values are split by semicolon (;) delimiter</li>
          <li>Only non-empty values from NPI-Extracts are used (blanks are ignored)</li>
          <li>Fallback logics are applied automatically during the packing process</li>
        </ul>
      </motion.div>

      <motion.div 
        className="bg-purple-50 border-l-4 border-purple-500 p-4 my-6 rounded-r"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{
          duration: 0.4,
          delay: 0.6,
          ease: "easeOut"
        }}
      >
        <p className="text-sm font-medium text-purple-800 mb-2">Execution Order:</p>
        <p className="text-sm text-purple-700 mb-2">
          Fallback logics are applied in the following sequence during packing:
        </p>
        <ol className="text-sm text-purple-700 space-y-1 list-decimal list-inside">
          <li>Specialty Fallback</li>
          <li>Professional Suffix Fallback</li>
          <li>Gender Fallback</li>
          <li>Additional Languages Fallback</li>
        </ol>
      </motion.div>
    </div>
  );
}

