import React from 'react';
import { motion } from 'motion/react';

/**
 * What can you do here - Content Component
 */
export default function WhatCanYouDo() {
  return (
    <div className="prose prose-neutral max-w-none">
      <h3 className="text-2xl font-semibold text-neutral-800 mb-4">
        What Can You Do on This Page?
      </h3>
      
      <p className="text-neutral-600 mb-4">
        On this page, you can:
      </p>

      <ul className="text-neutral-600 space-y-2 list-disc list-inside mb-6">
        <li>Upload a scope sheet file (CSV / TSV / XLSX)</li>
        <li>Review detected column headers and sample values</li>
        <li>Map columns to Zocdoc-required fields</li>
        <li>Assign Practice IDs and location data</li>
        <li>Validate required inputs before conversion</li>
        <li>Convert the file into a Zocdoc-compatible template</li>
      </ul>

      <motion.div 
        className="bg-amber-50 border-l-4 border-amber-500 p-4 my-6 rounded-r"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{
          duration: 0.4,
          delay: 0.2,
          ease: "easeOut"
        }}
      >
        <p className="text-sm font-medium text-amber-800 mb-2">Before you start:</p>
        <ul className="text-sm text-amber-700 space-y-1 list-disc list-inside">
          <li>Ensure your file contains provider and location data. More on this in User Manual Section and Business Rules.</li>
          <li>Practice ID is mandatory for conversion</li>
          <li>Review auto-mapped fields carefully</li>
        </ul>
      </motion.div>

      <motion.div 
        className="bg-blue-50 border border-blue-200 rounded-lg p-4 my-6"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{
          duration: 0.4,
          delay: 0.4,
          ease: "easeOut"
        }}
      >
        <p className="text-sm font-medium text-blue-800 mb-1">Who Should Use This Page?</p>
        <p className="text-sm text-blue-700">
          This page is intended for Operations and Data teams responsible for onboarding or updating provider and practice information.
        </p>
      </motion.div>
    </div>
  );
}

