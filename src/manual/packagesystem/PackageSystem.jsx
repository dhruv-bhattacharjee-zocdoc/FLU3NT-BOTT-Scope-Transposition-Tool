import React from 'react';
import { motion } from 'motion/react';

/**
 * Package System - Business Rules Content Component
 */
export default function PackageSystem() {
  const intermediateFiles = [
    {
      name: 'Mappings.xlsx',
      description: 'Contains the column mapping definitions that map source columns to Zocdoc template fields',
      createdBy: 'Created during the Convert/Extraction process',
      usedIn: 'Used by main.py to understand which columns map to which template fields'
    },
    {
      name: '_Mapped.xlsx',
      description: 'Contains the mapped data with all transformations applied from the source file',
      createdBy: 'Created during the Convert/Extraction process',
      usedIn: 'Used by main.py to extract provider and location data'
    },
    {
      name: 'Locations_input.xlsx',
      description: 'Contains location data extracted and processed from the source file',
      createdBy: 'Created during the Convert/Extraction process',
      usedIn: 'Used by main.py to populate location information in the template'
    },
    {
      name: 'NPI-Extracts.xlsx',
      description: 'Contains NPI data extracted from Snowflake, including Specialty Derived, Suffix Derived, GENDER, and LANGUAGES',
      createdBy: 'Created during the Convert/Extraction process via Snowflake queries',
      usedIn: 'Used by main.py for data extraction and by fallback logics to populate empty fields'
    },
    {
      name: 'Practice_Locations.xlsx',
      description: 'Contains practice and location reference data used for location matching',
      createdBy: 'Reference file (may be updated during processing)',
      usedIn: 'Used by main.py for location matching and validation'
    },
    {
      name: 'Template copy.xlsx',
      description: 'The final output file that combines all data from intermediate files',
      createdBy: 'Created and populated by main.py during packing',
      usedIn: 'Final template file ready for use'
    }
  ];

  const packingProcessSteps = [
    {
      id: 1,
      title: 'Copy Source Template',
      description: 'Copies the source template file to create Template copy.xlsx',
      details: [
        'Source: New Business Scope Sheet - Practice Locations and Providers.xlsx',
        'Destination: backend/Excel Files/Template copy.xlsx',
        'This creates a fresh template for each packing operation'
      ]
    },
    {
      id: 2,
      title: 'Extract Column Data',
      description: 'Extracts data from intermediate files and populates the template',
      details: [
        'NPI Number - from _Mapped.xlsx',
        'First Name & Last Name - from _Mapped.xlsx',
        'Gender - from _Mapped.xlsx',
        'Professional Suffix - from _Mapped.xlsx',
        'Specialty - from _Mapped.xlsx',
        'Additional Languages - from _Mapped.xlsx',
        'Headshot Link - from _Mapped.xlsx',
        'Professional Statement (PFS) - from _Mapped.xlsx',
        'Location ID - from Locations_input.xlsx',
        'Location Details - from Locations_input.xlsx',
        'Practice Cloud ID - from Locations_input.xlsx'
      ]
    },
    {
      id: 3,
      title: 'Apply Fallback Logics',
      description: 'Populates empty fields using fallback data from NPI-Extracts.xlsx',
      details: [
        'Specialty Fallback - fills empty Specialty 1-5 columns',
        'Professional Suffix Fallback - fills empty Suffix 1-3 columns',
        'Gender Fallback - fills empty Gender column',
        'Additional Languages Fallback - fills empty Languages 1-3 columns',
        'Applies color highlighting (blue for fallback cells, yellow for exceeded limits)'
      ]
    },
    {
      id: 4,
      title: 'Merge Duplicate Providers',
      description: 'Merges duplicate provider rows based on NPI Number',
      details: [
        'Identifies providers with the same NPI Number',
        'Consolidates their data into a single row',
        'Prevents duplicate entries in the final template'
      ]
    },
    {
      id: 5,
      title: 'Check Differences',
      description: 'Validates data consistency between Template copy.xlsx and NPI-Extracts.xlsx',
      details: [
        'Compares NPI data across files',
        'Identifies any discrepancies',
        'Ensures data integrity'
      ]
    },
    {
      id: 6,
      title: 'Format Template',
      description: 'Applies formatting and structure to the template',
      details: [
        'Auto-fits column widths for all sheets',
        'Freezes header rows (row 1) for Provider, Location, and ValidationAndReference sheets',
        'Improves readability and usability'
      ]
    },
    {
      id: 7,
      title: 'Apply Formulas',
      description: 'Adds Excel formulas to calculated fields',
      details: [
        'Formulas for data validation',
        'Formulas for calculated columns',
        'Ensures data consistency'
      ]
    },
    {
      id: 8,
      title: 'Apply Dropdowns',
      description: 'Adds dropdown lists to appropriate columns',
      details: [
        'Dropdown options for standardized fields',
        'Improves data entry accuracy',
        'Applied after formulas to maintain structure'
      ]
    },
    {
      id: 9,
      title: 'Apply Patients Accepted',
      description: 'Applies Patients Accepted dropdowns and logic',
      details: [
        'Adds dropdown options for Patients Accepted field',
        'Applies business logic for patient acceptance data'
      ]
    },
    {
      id: 10,
      title: 'Rename Output File',
      description: 'Renames Template copy.xlsx to your specified file name',
      details: [
        'Uses the name entered in the "Template File Name" field',
        'Adds .xlsx extension automatically',
        'If file with same name exists, adds a number suffix (e.g., "filename (1).xlsx")',
        'Saves in backend/Excel Files directory'
      ]
    }
  ];

  return (
    <div className="prose prose-neutral max-w-none">
      <h3 className="text-2xl font-semibold text-neutral-800 mb-4">
        Package System
      </h3>
      
      <p className="text-neutral-600 mb-6">
        The Package System executes the main.py script to combine all intermediate Excel files 
        created during extraction into a single, final Zocdoc template file. This process 
        extracts data, applies fallback logics, merges duplicates, and formats the final output.
      </p>

      <motion.div 
        className="bg-blue-50 border-l-4 border-blue-500 p-4 my-6 rounded-r"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{
          duration: 0.4,
          delay: 0.1,
          ease: "easeOut"
        }}
      >
        <p className="text-sm font-medium text-blue-800 mb-2">How It Works:</p>
        <p className="text-sm text-blue-700 mb-2">
          When you click the "Pack" button, the system executes main.py from the Transposition Logics folder. 
          This script processes all intermediate files and creates your final template.
        </p>
        <p className="text-sm text-blue-700">
          The process is fully automated and logs progress to the Console panel. You can monitor 
          each step as it completes.
        </p>
      </motion.div>

      <h4 className="text-xl font-semibold text-neutral-800 mb-4 mt-8">
        Intermediate Excel Files
      </h4>
      
      <p className="text-neutral-600 mb-4">
        The following intermediate Excel files are created during the Convert/Extraction process 
        and are used by main.py to build the final template:
      </p>

      <div className="space-y-4 mb-8">
        {intermediateFiles.map((file, index) => (
          <motion.div
            key={file.name}
            className="border-l-4 border-green-500 pl-4 py-3 bg-green-50 rounded-r"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.4,
              delay: index * 0.1,
              ease: "easeOut"
            }}
          >
            <h5 className="text-lg font-semibold text-neutral-800 mb-1">
              {file.name}
            </h5>
            <p className="text-neutral-600 mb-2 text-sm">
              {file.description}
            </p>
            <p className="text-xs text-neutral-500 mb-1">
              <strong>Created By:</strong> {file.createdBy}
            </p>
            <p className="text-xs text-neutral-500">
              <strong>Used In:</strong> {file.usedIn}
            </p>
          </motion.div>
        ))}
      </div>

      <h4 className="text-xl font-semibold text-neutral-800 mb-4 mt-8">
        Packing Process (main.py)
      </h4>
      
      <p className="text-neutral-600 mb-4">
        The main.py script executes the following steps in sequence to create your final template:
      </p>

      <div className="space-y-4 mb-8">
        {packingProcessSteps.map((step, index) => (
          <motion.div
            key={step.id}
            className="border-l-4 border-purple-500 pl-4 py-3 bg-purple-50 rounded-r"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.4,
              delay: index * 0.08,
              ease: "easeOut"
            }}
          >
            <h5 className="text-lg font-semibold text-neutral-800 mb-2">
              Step {step.id}: {step.title}
            </h5>
            <p className="text-neutral-600 mb-2 text-sm">
              {step.description}
            </p>
            <ul className="text-neutral-600 space-y-1 list-disc list-inside text-sm">
              {step.details.map((detail, idx) => (
                <li key={idx}>{detail}</li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      <h4 className="text-xl font-semibold text-neutral-800 mb-4 mt-8">
        Output File Renaming
      </h4>
      
      <motion.div 
        className="bg-amber-50 border-l-4 border-amber-500 p-4 my-6 rounded-r"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{
          duration: 0.4,
          delay: 0.9,
          ease: "easeOut"
        }}
      >
        <p className="text-sm font-medium text-amber-800 mb-2">How to Rename Your Output File:</p>
        <ol className="text-sm text-amber-700 space-y-1 list-decimal list-inside">
          <li>Enter your desired file name in the "Template File Name" field</li>
          <li>Do not include the .xlsx extension (it will be added automatically)</li>
          <li>Press Enter or click "Pack" to start the packing process</li>
          <li>After packing completes, the file will be renamed to your specified name</li>
          <li>If a file with the same name already exists, a number suffix will be added (e.g., "filename (1).xlsx")</li>
        </ol>
        <p className="text-sm text-amber-700 mt-2">
          <strong>Default Name:</strong> If you leave the field empty, the file will be named "Template copy.xlsx"
        </p>
        <p className="text-sm text-amber-700 mt-2">
          <strong>Location:</strong> All output files are saved in the backend/Excel Files directory
        </p>
      </motion.div>

      <h4 className="text-xl font-semibold text-neutral-800 mb-4 mt-8">
        Delete Excel Files Button
      </h4>
      
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
        <p className="text-sm font-medium text-red-800 mb-2">⚠️ Delete Excel Files:</p>
        <p className="text-sm text-red-700 mb-2">
          The "Delete Excel Files" button removes <strong>all</strong> Excel files from the 
          backend/Excel Files directory, including:
        </p>
        <ul className="text-sm text-red-700 space-y-1 list-disc list-inside mb-2">
          <li>All intermediate files (Mappings.xlsx, _Mapped.xlsx, Locations_input.xlsx, NPI-Extracts.xlsx, etc.)</li>
          <li>All template files (Template copy.xlsx and any renamed output files)</li>
          <li>Any other Excel files in that directory</li>
        </ul>
        <p className="text-sm font-medium text-red-800 mb-1 mt-3">When to Use:</p>
        <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
          <li>When you want to start fresh with a new extraction</li>
          <li>When you need to clean up old intermediate files</li>
          <li>Before starting a new project to avoid confusion</li>
        </ul>
        <p className="text-sm font-medium text-red-800 mb-1 mt-3">⚠️ Warning:</p>
        <p className="text-sm text-red-700">
          This action <strong>cannot be undone</strong>. Make sure you have saved or downloaded 
          any important files before clicking this button. A confirmation dialog will appear 
          before deletion to prevent accidental data loss.
        </p>
      </motion.div>

      <motion.div 
        className="bg-green-50 border-l-4 border-green-500 p-4 my-6 rounded-r"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{
          duration: 0.4,
          delay: 1.1,
          ease: "easeOut"
        }}
      >
        <p className="text-sm font-medium text-green-800 mb-2">Best Practices:</p>
        <ul className="text-sm text-green-700 space-y-1 list-disc list-inside">
          <li>Always download your final template file before deleting Excel files</li>
          <li>Review the Console logs to ensure packing completed successfully</li>
          <li>Verify the output file name is correct before packing</li>
          <li>Keep intermediate files if you need to troubleshoot issues</li>
          <li>Delete Excel files when starting a completely new extraction</li>
        </ul>
      </motion.div>
    </div>
  );
}

