import React from 'react';
import { motion } from 'motion/react';

/**
 * What is FLU3NT? - Content Component
 */
export default function WhatIsFLU3NT() {
  return (
    <div className="prose prose-neutral max-w-none">
      <h3 className="text-2xl font-semibold text-neutral-800 mb-4">
        What is FLU3NT?
      </h3>
      
      <p className="text-neutral-600 mb-4">
        FLU3NT (Scope Sheet Transposition Tool) is an internal tool designed to convert provider scope sheets (CSV, TSV, XLSX) into standardized Zocdoc templates.
      </p>

      <p className="text-neutral-600 mb-4">
        It helps PDO teams upload, review, and map provider and location data accurately before converting it into system-ready formats.
      </p>

      <motion.div 
        className="bg-blue-50 border-l-4 border-blue-500 p-4 my-6 rounded-r"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{
          duration: 0.4,
          delay: 0.2,
          ease: "easeOut"
        }}
      >
        <p className="text-sm font-medium text-blue-800 mb-2">Why this works:</p>
        <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
          <li>Reduces the time it takes to convert scope sheets into Zocdoc templates</li>
          <li>Understands business languages and logics and maps the data accurately,and hence including automation</li>
          <li>Mantain accuracy and consistency in the data while defining scalability</li>
        </ul>
      </motion.div>
    </div>
  );
}

