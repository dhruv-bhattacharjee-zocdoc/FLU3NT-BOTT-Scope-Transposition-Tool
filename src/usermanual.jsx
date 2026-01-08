import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Info, FileText, Package, Link as LinkIcon, ChevronRight, Users } from 'lucide-react';
import WhatIsFLU3NT from './manual/about/WhatIsFLU3NT';
import PageLayout from './manual/about/PageLayout';
import WhatCanYouDo from './manual/about/WhatCanYouDo';
import CheckConnection from './manual/usermanual/CheckConnection';
import MappingsAndExtraction from './manual/usermanual/MappingsAndExtraction';
import PackingSystem from './manual/usermanual/PackingSystem';
import FallbackLogics from './manual/businessrules/FallbackLogics';
import Highlighting from './manual/businessrules/Highlighting';
import PackageSystemContent from './manual/packagesystem/PackageSystem';
import ImportantLinksContent from './manual/importantlinks/ImportantLinks';
import MeetTheTeam from './manual/meettheteam/MeetTheTeam';

/**
 * Animated character that morphs from 3 to E and back
 * Switches between 3 and E every 5 seconds
 */
function AnimatedThree() {
  const [isE, setIsE] = useState(false);

  useEffect(() => {
    // Toggle between 3 and E every 5 seconds
    const interval = setInterval(() => {
      setIsE(prev => !prev);
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <span className="inline-block relative w-[0.6em] text-center">
      <AnimatePresence mode="wait">
        {isE ? (
          <motion.span
            key="e"
            initial={{ 
              opacity: 0, 
              rotateY: -90,
              scale: 0.8
            }}
            animate={{ 
              opacity: 1, 
              rotateY: 0,
              scale: 1
            }}
            exit={{ 
              opacity: 0, 
              rotateY: 90,
              scale: 0.8
            }}
            transition={{ 
              duration: 0.5,
              ease: "easeInOut"
            }}
            className="inline-block"
          >
            E
          </motion.span>
        ) : (
          <motion.span
            key="3"
            initial={{ 
              opacity: 0, 
              rotateY: -90,
              scale: 0.8
            }}
            animate={{ 
              opacity: 1, 
              rotateY: 0,
              scale: 1
            }}
            exit={{ 
              opacity: 0, 
              rotateY: 90,
              scale: 0.8
            }}
            transition={{ 
              duration: 0.5,
              ease: "easeInOut"
            }}
            className="inline-block"
          >
            3
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

/**
 * User Manual Page
 * 
 * This page contains the user manual documentation for the
 * FLU3NT - Scope Sheet Transposition Tool.
 */
export default function UserManual() {
  const [activeSection, setActiveSection] = useState('About the page');
  const [expandedMenus, setExpandedMenus] = useState({ about: true });
  const [activeSubSection, setActiveSubSection] = useState('what-is-flu3nt');

  // Keep parent menu expanded if a subsection is active
  useEffect(() => {
    if (activeSubSection) {
      if (activeSection === 'About the page') {
        setExpandedMenus(prev => ({ ...prev, about: true }));
      } else if (activeSection === 'User Manual') {
        setExpandedMenus(prev => ({ ...prev, manual: true }));
      } else if (activeSection === 'Business rules') {
        setExpandedMenus(prev => ({ ...prev, business: true }));
      }
    }
  }, [activeSubSection, activeSection]);

  const menuItems = [
    { 
      id: 'about', 
      label: 'About the page', 
      icon: Info,
      hasSubmenu: true,
      subItems: [
        { id: 'what-is-flu3nt', label: 'What is FLU3NT?', component: WhatIsFLU3NT },
        { id: 'page-layout', label: 'Page layout & key elements', component: PageLayout },
        { id: 'what-can-you-do', label: 'What can you do here', component: WhatCanYouDo },
      ]
    },
    { 
      id: 'manual', 
      label: 'User Manual', 
      icon: BookOpen,
      hasSubmenu: true,
      subItems: [
        { id: 'check-connection', label: 'Check Connection', component: CheckConnection },
        { id: 'mappings-extraction', label: 'Mappings and Extraction', component: MappingsAndExtraction },
        { id: 'packing-system', label: 'Packing system', component: PackingSystem },
      ]
    },
    { 
      id: 'business', 
      label: 'Business rules', 
      icon: FileText,
      hasSubmenu: true,
      subItems: [
        { id: 'fallback-logics', label: 'Fallback Logics', component: FallbackLogics },
        { id: 'highlighting', label: 'Highlighting', component: Highlighting },
        { id: 'coming-soon', label: 'Coming Soon', component: null },
      ]
    },
    { id: 'package', label: 'Package System', icon: Package, component: PackageSystemContent },
    { id: 'links', label: 'Important Links', icon: LinkIcon, component: ImportantLinksContent },
    { id: 'meet-team', label: 'Meet the Team', icon: Users, component: MeetTheTeam },
  ];

  const toggleSubmenu = (itemId) => {
    setExpandedMenus(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const handleMenuClick = (item) => {
    if (item.hasSubmenu) {
      toggleSubmenu(item.id);
    } else {
      setActiveSection(item.label);
      setActiveSubSection(null);
    }
  };

  const handleSubMenuClick = (item, subItem) => {
    setActiveSection(item.label);
    setActiveSubSection(subItem.id);
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header with Zocdoc on left and FLU3NT ~By PDO centered */}
      <header className="border-b border-neutral-200 sticky top-0 z-30" style={{ backgroundColor: '#ffee5b' }}>
        <div className="max-w-full px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Zocdoc Text - Left side */}
            <h1 className="zocdoc-font text-[36px]">
              Zocdoc
            </h1>
            
            {/* FLU3NT ~By PDO Text - Centered */}
            <h1 className="zocdoc-font text-[36px] flex items-baseline gap-1 absolute left-1/2 -translate-x-1/2">
              <span>FLU</span>
              <AnimatedThree />
              <span>NT</span>
              <span className="text-[18px] font-normal text-neutral-600 ml-1">
                ~By PDO
              </span>
            </h1>
            
            {/* Spacer for balance */}
            <div className="w-[100px]"></div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Menu - Always Visible */}
         <aside className="w-64 border-r border-neutral-200 h-[calc(100vh-80px)] sticky top-[80px] flex flex-col" style={{ backgroundColor: '#FFFFE8' }}>
          <div className="p-4 border-b border-neutral-200">
            <h2 className="text-lg font-semibold" style={{ color: '#1e3a8a' }}>Menu</h2>
          </div>

          <nav className="p-2 flex-1 overflow-y-auto">
            {menuItems.filter(item => item.id !== 'meet-team').map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.label;
              const isExpanded = expandedMenus[item.id];
              const hasActiveSubItem = item.hasSubmenu && item.subItems?.some(sub => sub.id === activeSubSection);
              
              return (
                <div key={item.id}>
                  <button
                    onClick={() => handleMenuClick(item)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive || hasActiveSubItem
                        ? 'bg-blue-50 font-medium'
                        : 'hover:bg-neutral-100'
                    }`}
                    style={{ 
                      color: isActive || hasActiveSubItem ? '#1e40af' : '#1e3a8a' // Navy blue for menu items
                    }}
                  >
                    <Icon className={`h-5 w-5 ${isActive || hasActiveSubItem ? 'text-blue-600' : 'text-neutral-500'}`} />
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.hasSubmenu ? (
                      <motion.div
                        animate={{ rotate: isExpanded ? 90 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronRight className={`h-4 w-4 ${isActive || hasActiveSubItem ? 'text-blue-600' : 'text-neutral-500'}`} />
                      </motion.div>
                    ) : (
                      isActive && <ChevronRight className="h-4 w-4 text-blue-600" />
                    )}
                  </button>
                  
                  {/* Submenu Items */}
                  {item.hasSubmenu && (
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="pl-4 ml-8 border-l-2 border-neutral-200 space-y-1 py-2">
                            {item.subItems.map((subItem) => {
                              const isSubActive = activeSubSection === subItem.id;
                              return (
                                <button
                                  key={subItem.id}
                                  onClick={() => handleSubMenuClick(item, subItem)}
                                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                                    isSubActive
                                      ? 'bg-blue-100 font-medium'
                                      : 'hover:bg-neutral-50'
                                  }`}
                                  style={{ 
                                    color: isSubActive ? '#1e40af' : '#1e3a8a' // Navy blue for submenu items
                                  }}
                                >
                                  <span className="flex-1 text-left">{subItem.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Meet the Team - Fixed at Bottom */}
          <div className="p-2 mt-auto">
            {(() => {
              const meetTeamItem = menuItems.find(item => item.id === 'meet-team');
              if (!meetTeamItem) return null;
              
              const Icon = meetTeamItem.icon;
              const isActive = activeSection === meetTeamItem.label;
              
              return (
                <button
                  onClick={() => handleMenuClick(meetTeamItem)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-blue-50 font-medium'
                      : 'hover:bg-neutral-100'
                  }`}
                  style={{ 
                    color: isActive ? '#1e40af' : '#1e3a8a' // Navy blue for menu items
                  }}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-neutral-500'}`} />
                  <span className="flex-1 text-left">{meetTeamItem.label}</span>
                  {isActive && <ChevronRight className="h-4 w-4 text-blue-600" />}
                </button>
              );
            })()}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-4xl" style={{ marginLeft: 'calc(50vw - 256px - 28rem)', marginRight: 'auto' }}>
            {/* Section Header - Only animate when main menu changes */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                className="mb-8"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <h2 className="text-3xl font-bold text-neutral-800 mb-2">
                  {activeSection}
                </h2>
                <motion.div 
                  className="h-1 w-20 bg-blue-600 rounded"
                  initial={{ width: 0 }}
                  animate={{ width: 80 }}
                  transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
                />
              </motion.div>
            </AnimatePresence>

            {/* Content Area */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`content-${activeSection}-${activeSubSection || 'main'}`}
                className="bg-white rounded-lg shadow-lg p-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
              {activeSection === 'About the page' && activeSubSection && (() => {
                const aboutItem = menuItems.find(item => item.id === 'about');
                const subItem = aboutItem?.subItems?.find(sub => sub.id === activeSubSection);
                const Component = subItem?.component;
                
                if (Component) {
                  return (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                    >
                      <Component />
                    </motion.div>
                  );
                }
                return null;
              })()}

              {activeSection === 'About the page' && !activeSubSection && (
                <div className="prose prose-neutral max-w-none">
                  <h3 className="text-2xl font-semibold text-neutral-800 mb-4">
                    About the page
                  </h3>
                  <p className="text-neutral-600 mb-4">
                    Please select a submenu item from the sidebar to view content.
                  </p>
                </div>
              )}

              {activeSection === 'User Manual' && activeSubSection && (() => {
                const manualItem = menuItems.find(item => item.id === 'manual');
                const subItem = manualItem?.subItems?.find(sub => sub.id === activeSubSection);
                const Component = subItem?.component;
                
                if (Component) {
                  return (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                    >
                      <Component />
                    </motion.div>
                  );
                }
                return null;
              })()}

              {activeSection === 'User Manual' && !activeSubSection && (
                <div className="prose prose-neutral max-w-none">
                  <h3 className="text-2xl font-semibold text-neutral-800 mb-4">
                    User Manual
                  </h3>
                  <p className="text-neutral-600 mb-4">
                    Welcome to the FLU3NT User Manual. This section contains detailed 
                    documentation about how to use the Scope Sheet Transposition Tool.
                  </p>
                  <p className="text-neutral-600">
                    Please select a submenu item from the sidebar to view content.
                  </p>
                </div>
              )}

              {activeSection === 'Business rules' && activeSubSection && (() => {
                const businessItem = menuItems.find(item => item.id === 'business');
                const subItem = businessItem?.subItems?.find(sub => sub.id === activeSubSection);
                const Component = subItem?.component;
                
                if (Component) {
                  return (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                    >
                      <Component />
                    </motion.div>
                  );
                }
                
                // Handle "Coming Soon" or other items without components
                if (subItem && !Component) {
                  return (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                      className="prose prose-neutral max-w-none"
                    >
                      <div className="text-center py-16">
                        <h3 className="text-3xl font-semibold text-neutral-800 mb-4">
                          {subItem.label}
                        </h3>
                        <p className="text-xl text-neutral-600">
                          This content is coming soon. Please check back later.
                        </p>
                      </div>
                    </motion.div>
                  );
                }
                
                return null;
              })()}

              {activeSection === 'Business rules' && !activeSubSection && (
                <div className="prose prose-neutral max-w-none">
                  <h3 className="text-2xl font-semibold text-neutral-800 mb-4">
                    Business Rules
                  </h3>
                  <p className="text-neutral-600 mb-4">
                    This section contains the business rules and guidelines for using 
                    the FLU3NT tool.
                  </p>
                  <p className="text-neutral-600">
                    Please select a submenu item from the sidebar to view content.
                  </p>
                </div>
              )}

              {activeSection === 'Package System' && (() => {
                const packageItem = menuItems.find(item => item.id === 'package');
                const Component = packageItem?.component;
                
                if (Component) {
                  return (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                    >
                      <Component />
                    </motion.div>
                  );
                }
                return null;
              })()}

              {activeSection === 'Important Links' && (() => {
                const linksItem = menuItems.find(item => item.id === 'links');
                const Component = linksItem?.component;
                
                if (Component) {
                  return (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                    >
                      <Component />
                    </motion.div>
                  );
                }
                return null;
              })()}

              {activeSection === 'Meet the Team' && (() => {
                const teamItem = menuItems.find(item => item.id === 'meet-team');
                const Component = teamItem?.component;
                
                if (Component) {
                  return (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                    >
                      <Component />
                    </motion.div>
                  );
                }
                return null;
              })()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}

