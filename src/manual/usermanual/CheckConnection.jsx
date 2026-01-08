import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, User, CheckCircle, AlertTriangle, ChevronDown, ChevronRight } from 'lucide-react';

/**
 * Check Connection - User Manual Content Component
 */
export default function CheckConnection() {
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
      title: 'Verify User Credentials',
      description: 'Enter the email and role in the popup that appears when you click user on top right corner button.',
      icon: User,
      color: 'blue',
      details: [
        'Email format: abc.xyz@zocdoc.com',
        'Role: PROD_OPS_PUNE_ROLE or PROVIDER_DATA_OPS_PUNE_ROLE'
      ]
    },
    {
      id: 2,
      title: 'Click Check Connection Button',
      description: 'Click the "Check Connection" button (globe icon) in the top right corner of the page.',
      icon: Globe,
      color: 'indigo',
      details: [
        'The button will show a pulsing animation while checking',
        'Both Snowflake and VPN connections are tested simultaneously'
      ],
      showButton: true
    },
    {
      id: 3,
      title: 'Review Connection Status',
      description: 'Check the status indicators next to "Snowflake" and "VPN" in the header.',
      icon: CheckCircle,
      color: 'green',
      details: [
        'Green checkmark (✓) = Connection successful',
        'Red X = Connection failed',
        'Gray text = Not checked yet'
      ]
    },
    {
      id: 4,
      title: 'Troubleshooting',
      description: 'If connection fails, check the following:',
      icon: AlertTriangle,
      color: 'orange',
      details: [
        'Verify VPN is connected',
        'Ensure you have the correct Snowflake role assigned',
        'Check if SSO authentication window opened',
        'Click Check Connection button again'
      ]
    }
  ];

  return (
    <div className="prose prose-neutral max-w-none">
      <h3 className="text-2xl font-semibold text-neutral-800 mb-4">
        Check Connection
      </h3>
      
      <p className="text-neutral-600 mb-6">
        Before starting your work, it's essential to verify that your connection to Snowflake and VPN is working properly. 
        This ensures that data extraction and processing will function correctly.
      </p>

      <div className="space-y-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isHovered = hoveredStep === step.id;
          const isExpanded = expandedSteps.has(step.id);
          const showContent = isHovered || isExpanded;
          
          const colorClasses = {
            blue: 'border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100/50 hover:from-blue-100 hover:to-blue-200/50',
            indigo: 'border-indigo-500 bg-gradient-to-r from-indigo-50 to-indigo-100/50 hover:from-indigo-100 hover:to-indigo-200/50',
            green: 'border-green-500 bg-gradient-to-r from-green-50 to-green-100/50 hover:from-green-100 hover:to-green-200/50',
            orange: 'border-orange-500 bg-gradient-to-r from-orange-50 to-orange-100/50 hover:from-orange-100 hover:to-orange-200/50'
          };

          const iconTextColors = {
            blue: 'text-blue-600',
            indigo: 'text-indigo-600',
            green: 'text-green-600',
            orange: 'text-orange-600'
          };

          const iconBorderColors = {
            blue: 'border-blue-500',
            indigo: 'border-indigo-500',
            green: 'border-green-500',
            orange: 'border-orange-500'
          };

          const bulletColorClasses = {
            blue: 'text-blue-500',
            indigo: 'text-indigo-500',
            green: 'text-green-500',
            orange: 'text-orange-500'
          };

          return (
            <motion.div
              key={step.id}
              className={`border-l-4 ${colorClasses[step.color]} rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden`}
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
                  {/* Step Number Badge */}
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
                
                {/* Subtopic details and button - show on hover or click */}
                <AnimatePresence>
                  {showContent && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="mt-4 pt-4 border-t border-white/50"
                    >
                      {/* Check Connection Button Visual - only for step 2 */}
                      {step.showButton && (
                        <motion.div
                          className="mb-4 flex items-center justify-start"
                          initial={{ opacity: 0, scale: 0.9, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, y: -10 }}
                          transition={{ duration: 0.2, delay: 0.1 }}
                        >
                          <div className="w-12 h-12 rounded-2xl bg-white text-neutral-700 shadow-md hover:shadow-lg transition-all flex items-center justify-center cursor-pointer border-2 border-neutral-200 hover:border-indigo-400">
                            <Globe className="h-5 w-5" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-neutral-700">Check Connection</p>
                            <p className="text-xs text-neutral-500">Click to verify connections</p>
                          </div>
                        </motion.div>
                      )}
                      
                      {/* Subtopic details */}
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
          delay: 0.5,
          ease: "easeOut"
        }}
      >
        <p className="text-sm font-medium text-amber-800 mb-2">Important Notes:</p>
        <ul className="text-sm text-amber-700 space-y-1 list-disc list-inside">
          <li>A browser window may open for authentication</li>
          <li>Connection status persists until you refresh the page</li>
          <li>You can edit your email and role by clicking on your user name in the header</li>
        </ul>
      </motion.div>
    </div>
  );
}

