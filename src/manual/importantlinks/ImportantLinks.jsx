import React from 'react';
import { motion } from 'motion/react';
import { ExternalLink } from 'lucide-react';

/**
 * Important Links - Content Component
 */
export default function ImportantLinks() {
  const links = [
    {
      id: 1,
      title: 'Tech Spec',
      description: 'Technical specifications and documentation for the FLU3NT tool',
      url: 'https://docs.google.com/document/d/1iynWBA5XlnA42ifk3-4uM1QeGnqyJqQLdpb5ZCoF2b8/edit?usp=sharing',
      category: 'Documentation'
    },
    {
      id: 2,
      title: 'Bug / Suggestion',
      description: 'Report bugs or submit suggestions for improvements to the FLU3NT tool',
      url: 'https://zocdoc.atlassian.net/jira/software/c/projects/POAA/form/3307',
      category: 'Support'
    },
    {
      id: 3,
      title: 'BOTT Requirement Setup',
      description: 'Bulk Onboarding Transposition Tool (BOTT) requirement setup and configuration',
      url: 'https://docs.google.com/spreadsheets/d/19nb9PEBPaOFaI-vFjbjywifftTqR1d6xPHVzNSyEO0Y/edit?usp=sharing',
      category: 'Configuration'
    }
  ];

  const handleLinkClick = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="prose prose-neutral max-w-none">
      <h3 className="text-2xl font-semibold text-neutral-800 mb-4">
        Important Links
      </h3>
      
      <p className="text-neutral-600 mb-6">
        Quick access to important resources, documentation, and support channels for the FLU3NT tool.
      </p>

      <div className="space-y-4">
        {links.map((link, index) => (
          <motion.div
            key={link.id}
            className="border-l-4 border-blue-500 pl-4 py-4 bg-blue-50 rounded-r hover:bg-blue-100 transition-colors cursor-pointer group"
            onClick={() => handleLinkClick(link.url)}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.4,
              delay: index * 0.1,
              ease: "easeOut"
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="text-lg font-semibold text-neutral-800 group-hover:text-blue-700 transition-colors">
                    {link.title}
                  </h4>
                  <ExternalLink className="h-4 w-4 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-neutral-600 mb-2 text-sm">
                  {link.description}
                </p>
                <span className="inline-block px-2 py-1 text-xs font-medium text-blue-700 bg-blue-200 rounded">
                  {link.category}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div 
        className="bg-amber-50 border-l-4 border-amber-500 p-4 my-6 rounded-r"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{
          duration: 0.4,
          delay: 0.4,
          ease: "easeOut"
        }}
      >
        <p className="text-sm font-medium text-amber-800 mb-2">Note:</p>
        <ul className="text-sm text-amber-700 space-y-1 list-disc list-inside">
          <li>All links open in a new tab</li>
          <li>Make sure you have appropriate access permissions for Google Docs and Jira</li>
          <li>For technical questions, refer to the Tech Spec document</li>
          <li>For issues or feature requests, use the Bug / Suggestion link</li>
        </ul>
      </motion.div>
    </div>
  );
}

