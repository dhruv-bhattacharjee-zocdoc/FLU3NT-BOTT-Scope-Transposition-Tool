import React, { useMemo, useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, RefreshCw, Search, Database, X, EyeOff, Trash2, RotateCw, Check, XCircle, Maximize2, Minimize2, Globe, Info, Package } from "lucide-react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { detectAndRankNPIColumns, detectFirstNameColumn, detectLastNameColumn, detectGenderColumn, detectProfessionalSuffixColumn, detectHeadshotColumn, detectAdditionalLanguagesColumn, detectStateColumn, detectPracticeCloudIdColumn, detectPatientsAcceptedColumn } from "./utils/columnDetector";
import { getKnowledgeBaseStats, clearKnowledgeBase, getAllStoredColumns, removeColumn, getMappings, saveMapping, removeMapping, addNPIColumn, addFirstNameToKnowledge, addLastNameToKnowledge, addGenderToKnowledge, addProfessionalSuffixToKnowledge, addHeadshotToKnowledge, addAdditionalLanguagesToKnowledge, addStateToKnowledge, addCityToKnowledge, addZipToKnowledge, addAddressLine1ToKnowledge, addAddressLine2ToKnowledge, addPracticeIdToKnowledge, addPracticeCloudIdToKnowledge, addPracticeNameToKnowledge, addLocationIdToKnowledge, addLocationNameToKnowledge, addLocationTypeRawToKnowledge, addPatientsAcceptedToKnowledge, addSpecialtyToKnowledge, getKnowledgeBase, saveKnowledgeBase } from "./utils/storageManager";
import { ContextMenu } from "@/components/ContextMenu";
import userInfo from "./data/userInfo.json";
import LaunchAnimation from "./components/LaunchAnimation";

/**
 * Bulk Onboarding Transposition Tool (BOTT)
 *
 * Purpose
 * - Upload scope sheets (CSV/TSV/XLSX)
 * - Automatically detect and map columns to ZD Templates
 * - Convert scope sheets to standardized format
 * 
 * Features
 * - Upload one or more files (CSV, TSV, XLSX, XLS)
 * - Automatically detect NPI, Names, Gender, Professional Suffix, Headshot, Languages, etc.
 * - Manual assignment via left-click context menu
 * - Visual feedback with color-coded highlighting
 * - Save mappings to knowledge base for future use
 * - Suggested columns for quick confirmation
 * - For each column, shows 2–3 example values (deduped) on hover
 * - Horizontal carousel with arrow controls + wheel/trackpad scroll
 * - Lightweight, no backend required
 */
export default function ColumnHeadersCarouselApp() {
  const [columnMap, setColumnMap] = useState(new Map());
  const [uploadedFile, setUploadedFile] = useState(null); // Store uploaded file
  const [fileStats, setFileStats] = useState({ total: 0, parsed: 0, errors: 0 });
  const [isParsing, setIsParsing] = useState(false);
  const [filter, setFilter] = useState("");
  const [numberOfProviders, setNumberOfProviders] = useState(null);
  const [isProviderCountAnimating, setIsProviderCountAnimating] = useState(false);
  const [knowledgeBaseStats, setKnowledgeBaseStats] = useState(null);
  const [showKnowledgeBase, setShowKnowledgeBase] = useState(false);
  const [isKnowledgeBaseAnimating, setIsKnowledgeBaseAnimating] = useState(false);
  const [storedColumns, setStoredColumns] = useState({ 
    npiColumns: [], 
    nameColumns: [], 
    firstNameColumns: [], 
    lastNameColumns: [], 
    genderColumns: [], 
    professionalSuffixColumns: [], 
    headshotColumns: [], 
    additionalLanguagesColumns: [],
    stateColumns: [],
    cityColumns: [],
    zipColumns: [],
    addressLine1Columns: [],
    addressLine2Columns: [],
    practiceIdColumns: [],
    practiceCloudIdColumns: [],
    locationIdColumns: [],
    practiceNameColumns: [],
    locationNameColumns: [],
    locationTypeRawColumns: [],
    pfsColumns: [],
    patientsAcceptedColumns: [],
    specialtyColumns: []
  });
  const [mappings, setMappings] = useState([]);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, columnName: null });
  const [animatingItem, setAnimatingItem] = useState(null);
  
  // Convert email to name (abc.xyz@zocdoc.com -> Abc Xyz)
  function emailToName(email) {
    if (!email) return "";
    const localPart = email.split("@")[0]; // Get part before @
    const parts = localPart.split("."); // Split by dots
    const capitalized = parts.map(part => {
      if (part.length === 0) return "";
      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    });
    return capitalized.join(" ");
  }
  
  const [user, setUser] = useState(() => {
    // Load user from userInfo.json if available
    return userInfo.email ? emailToName(userInfo.email) : "";
  });
  const [role, setRole] = useState(() => {
    // Load role from userInfo.json if available
    return userInfo.role || "";
  });
  const [connectionError, setConnectionError] = useState("");
  const [isSSOMismatch, setIsSSOMismatch] = useState(false);
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);
  const [isConnectionSuccessful, setIsConnectionSuccessful] = useState(false);
  const [isConnectionFailed, setIsConnectionFailed] = useState(false);
  const [isVPNChecking, setIsVPNChecking] = useState(false);
  const [isVPNSuccessful, setIsVPNSuccessful] = useState(false);
  const [isVPNFailed, setIsVPNFailed] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastAnimatingOut, setToastAnimatingOut] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState([]);
  const [showConsole, setShowConsole] = useState(true);
  const [conversionComplete, setConversionComplete] = useState(false);
  const [manualPracticeIds, setManualPracticeIds] = useState("");
  const [practiceInfo, setPracticeInfo] = useState(null);
  const [isLoadingPracticeInfo, setIsLoadingPracticeInfo] = useState(false);
  const [mappedColumnPracticeInfo, setMappedColumnPracticeInfo] = useState(null);
  const [isLoadingMappedColumnPracticeInfo, setIsLoadingMappedColumnPracticeInfo] = useState(false);
  const [showPracticeListModal, setShowPracticeListModal] = useState(false);
  const [showUserEditModal, setShowUserEditModal] = useState(false);
  const [showLocationCasesModal, setShowLocationCasesModal] = useState(false);
  const [showExtractionCompleteDialog, setShowExtractionCompleteDialog] = useState(false);
  const [hasShownExtractionDialog, setHasShownExtractionDialog] = useState(false);
  const [isPacking, setIsPacking] = useState(false);
  const [templateFileName, setTemplateFileName] = useState('Template copy');
  const [packingComplete, setPackingComplete] = useState(false);
  const [packedFilePath, setPackedFilePath] = useState(null);
  const [showExtractionErrorDialog, setShowExtractionErrorDialog] = useState(false);
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState("");
  const [isUpdatingUserInfo, setIsUpdatingUserInfo] = useState(false);
  const [isBreadcrumbExpanded, setIsBreadcrumbExpanded] = useState(false);
  const breadcrumbTimeoutRef = useRef(null);
  const [isLocationTableHovered, setIsLocationTableHovered] = useState(false);
  const [isProviderTableHovered, setIsProviderTableHovered] = useState(false);
  const [conversionTimer, setConversionTimer] = useState(0);
  const [showUserManualDialog, setShowUserManualDialog] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const timerIntervalRef = useRef(null);
  const inputRef = useRef(null);
  const consoleEndRef = useRef(null);
  const [showLaunchAnimation, setShowLaunchAnimation] = useState(true);
  const [showZocdocText, setShowZocdocText] = useState(false);
  const [showMainContent, setShowMainContent] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const [showSnowflake, setShowSnowflake] = useState(false);
  const [showVPN, setShowVPN] = useState(false);
  const [showBreadcrumb, setShowBreadcrumb] = useState(false);
  const [showSmartLearning, setShowSmartLearning] = useState(false);
  const [showColumnHeadersTable, setShowColumnHeadersTable] = useState(false);
  const [showMappingsTable, setShowMappingsTable] = useState(false);
  const [showLocationTable, setShowLocationTable] = useState(false);
  const [showConsoleTable, setShowConsoleTable] = useState(false);
  const [showSuggestedTable, setShowSuggestedTable] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserInfoInHeader, setShowUserInfoInHeader] = useState(false);

  // Function to add log messages
  function addLog(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = { message, type, timestamp, id: Date.now() };
    setConsoleLogs(prev => [...prev, logEntry]);
  }

  // Scroll console to bottom when new logs are added
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [consoleLogs]);

  // Detect scroll position to show sticky header
  useEffect(() => {
    if (!showMainContent) return;
    
    const scrollableContainer = document.querySelector('.h-full.w-full.overflow-y-auto');
    let userInfoTimer = null;
    
    const handleScroll = () => {
      if (scrollableContainer) {
        const scrollPosition = scrollableContainer.scrollTop;
        const scrolled = scrollPosition > 1;
        setIsScrolled(scrolled); // Trigger immediately when scrolled
        
        // Clear existing timer
        if (userInfoTimer) {
          clearTimeout(userInfoTimer);
        }
        
        // Show user info after 1.5 seconds when scrolled
        if (scrolled) {
          userInfoTimer = setTimeout(() => {
            setShowUserInfoInHeader(true);
          }, 1500);
        } else {
          setShowUserInfoInHeader(false);
        }
      } else {
        // Fallback to window scroll
        const scrollPosition = window.scrollY || document.documentElement.scrollTop;
        const scrolled = scrollPosition > 1;
        setIsScrolled(scrolled);
        
        // Clear existing timer
        if (userInfoTimer) {
          clearTimeout(userInfoTimer);
        }
        
        if (scrolled) {
          userInfoTimer = setTimeout(() => {
            setShowUserInfoInHeader(true);
          }, 1500);
        } else {
          setShowUserInfoInHeader(false);
        }
      }
    };

    if (scrollableContainer) {
      scrollableContainer.addEventListener('scroll', handleScroll);
      return () => {
        scrollableContainer.removeEventListener('scroll', handleScroll);
        if (userInfoTimer) {
          clearTimeout(userInfoTimer);
        }
      };
    } else {
      window.addEventListener('scroll', handleScroll);
      return () => {
        window.removeEventListener('scroll', handleScroll);
        if (userInfoTimer) {
          clearTimeout(userInfoTimer);
        }
      };
    }
  }, [showMainContent]);

  // Trigger button pop-in animation after main content fades in
  useEffect(() => {
    if (showMainContent) {
      // Delay button animation slightly after main content fade-in
      const timer = setTimeout(() => {
        setShowButtons(true);
      }, 300); // Start button animation 300ms after main content starts fading in
      return () => clearTimeout(timer);
    }
  }, [showMainContent]);

  // Trigger Snowflake, VPN, Breadcrumb, and Smart Learning animations after buttons finish
  useEffect(() => {
    if (showButtons) {
      // Buttons finish at delay 0.4 + duration 0.4 = 0.8s after showButtons becomes true
      // So start Snowflake at 0.5s, VPN at 0.6s, Breadcrumb at 0.7s, Smart Learning at 0.8s
      const snowflakeTimer = setTimeout(() => {
        setShowSnowflake(true);
      }, 500); // 0.5s after buttons start
      
      const vpnTimer = setTimeout(() => {
        setShowVPN(true);
      }, 600); // 0.6s after buttons start
      
      const breadcrumbTimer = setTimeout(() => {
        setShowBreadcrumb(true);
      }, 700); // 0.7s after buttons start
      
      const smartLearningTimer = setTimeout(() => {
        setShowSmartLearning(true);
      }, 800); // 0.8s after buttons start
      
      // Trigger table animations after Smart Learning
      const columnHeadersTimer = setTimeout(() => {
        setShowColumnHeadersTable(true);
      }, 900); // 0.9s after buttons start
      
      const mappingsTimer = setTimeout(() => {
        setShowMappingsTable(true);
      }, 1000); // 1.0s after buttons start
      
      const locationTimer = setTimeout(() => {
        setShowLocationTable(true);
      }, 1100); // 1.1s after buttons start
      
      const consoleTimer = setTimeout(() => {
        setShowConsoleTable(true);
      }, 1200); // 1.2s after buttons start
      
      const suggestedTimer = setTimeout(() => {
        setShowSuggestedTable(true);
      }, 1300); // 1.3s after buttons start
      
      return () => {
        clearTimeout(snowflakeTimer);
        clearTimeout(vpnTimer);
        clearTimeout(breadcrumbTimer);
        clearTimeout(smartLearningTimer);
        clearTimeout(columnHeadersTimer);
        clearTimeout(mappingsTimer);
        clearTimeout(locationTimer);
        clearTimeout(consoleTimer);
        clearTimeout(suggestedTimer);
      };
    }
  }, [showButtons]);

  // Timer for conversion process
  useEffect(() => {
    if (isConverting) {
      // Don't reset timer if it's already running (for packing continuation)
      if (timerIntervalRef.current === null) {
        // Show timer after 3 seconds only if it's not already showing
        if (!showTimer) {
      const showTimerTimeout = setTimeout(() => {
        setShowTimer(true);
      }, 3000);
      
          return () => {
            clearTimeout(showTimerTimeout);
          };
        }
      }
      
      // Start timer interval if not already running
      if (timerIntervalRef.current === null) {
      timerIntervalRef.current = setInterval(() => {
        setConversionTimer(prev => prev + 1);
      }, 1000);
      }
      
      return () => {
        // Don't clear interval here - let it continue for packing
      };
    } else {
      // Only stop timer if not packing
      if (!isPacking && timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      // Don't hide the timer or reset it - keep it visible with final time
    }
  }, [isConverting, isPacking, showTimer]);
  
  // Continue timer during packing
  useEffect(() => {
    if (isPacking) {
      // Ensure timer is visible
      if (!showTimer && conversionTimer > 0) {
        setShowTimer(true);
      }
      
      // Start timer interval if not already running
      if (timerIntervalRef.current === null) {
        timerIntervalRef.current = setInterval(() => {
          setConversionTimer(prev => prev + 1);
        }, 1000);
      }
      
      return () => {
        // Don't clear interval - let it continue
      };
    }
  }, [isPacking, showTimer, conversionTimer]);

  // Show extraction complete dialog when conversion completes and timer stops
  useEffect(() => {
    if (conversionComplete && !isConverting && timerIntervalRef.current === null && !hasShownExtractionDialog) {
      // Small delay to ensure timer has fully stopped
      const dialogTimeout = setTimeout(() => {
        setShowExtractionCompleteDialog(true);
        setHasShownExtractionDialog(true);
      }, 500);
      return () => clearTimeout(dialogTimeout);
    }
  }, [conversionComplete, isConverting, hasShownExtractionDialog]);

  // Check if packed file exists when dialog is open and packingComplete is true
  useEffect(() => {
    if (showExtractionCompleteDialog && packingComplete && packedFilePath) {
      const checkFileExists = async () => {
        try {
          const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
          const response = await fetch(`${API_BASE_URL}/api/check-file-exists`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              file_path: packedFilePath
            }),
          });
          
          const data = await response.json();
          
          if (response.ok && !data.exists) {
            // File doesn't exist, revert to Pack state
            setPackingComplete(false);
            setPackedFilePath(null);
          }
        } catch (error) {
          console.error('Error checking file existence:', error);
          // On error, revert to Pack state to be safe
          setPackingComplete(false);
          setPackedFilePath(null);
        }
      };
      
      checkFileExists();
    }
  }, [showExtractionCompleteDialog, packingComplete, packedFilePath]);

  // Format timer as MM:SS or HH:MM:SS
  function formatTimer(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  // Initialize user from userInfo.json on mount and reset all tables
  useEffect(() => {
    if (userInfo.email && userInfo.role) {
      setUser(emailToName(userInfo.email));
      setRole(userInfo.role);
    }
    // Reset all mappings, locations, and suggested tables on page load
    resetAll();
  }, []);

  // Scroll to top when main content is shown
  useEffect(() => {
    if (showMainContent) {
      const scrollableContainer = document.querySelector('.h-full.w-full.overflow-y-auto');
      if (scrollableContainer) {
        scrollableContainer.scrollTop = 0;
      } else {
        window.scrollTo(0, 0);
      }
    }
  }, [showMainContent]);

  // Cleanup breadcrumb timeout on unmount
  useEffect(() => {
    return () => {
      if (breadcrumbTimeoutRef.current) {
        clearTimeout(breadcrumbTimeoutRef.current);
      }
    };
  }, []);

  // Load knowledge base stats and mappings on mount and when columnMap changes
  useEffect(() => {
    const stats = getKnowledgeBaseStats();
    setKnowledgeBaseStats(stats);
    const columns = getAllStoredColumns();
    setStoredColumns(columns);
    
    // Load existing mappings
    const mappingsData = getMappings();
    setMappings(mappingsData);
    
    // Initial log
    addLog('Application initialized', 'info');
  }, [columnMap]);

  // Ensure mappings are loaded on initial mount
  useEffect(() => {
    const mappingsData = getMappings();
    setMappings(mappingsData);
  }, []);

  const columns = useMemo(() => {
    const all = Array.from(columnMap.entries()).map(([name, examples]) => ({ name, examples }));
    
    // Detect NPI columns
    const withNPI = detectAndRankNPIColumns(all);

    // Detect First Name, Last Name, Gender, Professional Suffix, Headshot, Additional Languages, State, Practice Cloud ID, and Patients Accepted columns
    const detectedFirstName = detectFirstNameColumn(all);
    const detectedLastName = detectLastNameColumn(all);
    const detectedGender = detectGenderColumn(all);
    const detectedProfessionalSuffix = detectProfessionalSuffixColumn(all);
    const detectedHeadshot = detectHeadshotColumn(all);
    const detectedAdditionalLanguages = detectAdditionalLanguagesColumn(all);
    const detectedState = detectStateColumn(all);
    const detectedPracticeCloudId = detectPracticeCloudIdColumn(all);
    const detectedPatientsAccepted = detectPatientsAcceptedColumn(all);
    
    // Mark detected columns
    const withNameDetection = withNPI.map(col => ({
      ...col,
      isFirstNameColumn: col.name === detectedFirstName,
      isLastNameColumn: col.name === detectedLastName,
      isGenderColumn: col.name === detectedGender,
      isProfessionalSuffixColumn: col.name === detectedProfessionalSuffix,
      isHeadshotColumn: col.name === detectedHeadshot,
      isAdditionalLanguagesColumn: col.name === detectedAdditionalLanguages,
      isStateColumn: col.name === detectedState,
      isPracticeCloudIdColumn: col.name === detectedPracticeCloudId,
      isPatientsAcceptedColumn: col.name === detectedPatientsAccepted,
    }));

    // Sort: Assigned columns first (by assignment order), then NPI column, then alphabetically
    const sorted = withNameDetection.sort((a, b) => {
      // Check if columns are assigned to any mapping
      const aIsAssigned = mappings.some(m => m.columnName === a.name);
      const bIsAssigned = mappings.some(m => m.columnName === b.name);
      
      // Assigned columns come first
      if (aIsAssigned && !bIsAssigned) return -1;
      if (!aIsAssigned && bIsAssigned) return 1;
      
      // If both are assigned, sort by assignment order (first assigned appears first)
      if (aIsAssigned && bIsAssigned) {
        const aMappingIndex = mappings.findIndex(m => m.columnName === a.name);
        const bMappingIndex = mappings.findIndex(m => m.columnName === b.name);
        return aMappingIndex - bMappingIndex;
      }
      
      // Among unassigned columns, NPI column comes first
      if (a.isNPIColumn && !b.isNPIColumn) return -1;
      if (!a.isNPIColumn && b.isNPIColumn) return 1;
      
      // Finally, sort alphabetically
      return a.name.localeCompare(b.name);
    });

    if (!filter.trim()) {
      return sorted;
    }
    const f = filter.toLowerCase();
    const filtered = sorted.filter((c) => c.name.toLowerCase().includes(f));
    return filtered;
  }, [columnMap, filter, mappings]);

  // Check if NPI column is detected
  const detectedNPIColumn = useMemo(() => {
    return columns.find(col => col.isNPIColumn);
  }, [columns]);

  // Calculate number of providers from NPI column
  useEffect(() => {
    const calculateProviderCount = async () => {
      // Find the mapped NPI column
      const npiMapping = mappings.find(m => {
        const types = Array.isArray(m.detectedAs) ? m.detectedAs : [m.detectedAs];
        return types.includes('npi');
      });

      if (!npiMapping || !uploadedFile) {
        setNumberOfProviders(null);
        setIsProviderCountAnimating(false);
        return;
      }

      try {
        const npiColumnName = npiMapping.columnName;
        const fileKind = getFileKind(uploadedFile.name);
        let npiValues = [];
        const previousCount = numberOfProviders;

        if (fileKind === 'csv') {
          // Parse CSV to get NPI values
          Papa.parse(uploadedFile, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
              if (results.data && npiColumnName) {
                npiValues = results.data
                  .map(row => row[npiColumnName])
                  .filter(val => val !== undefined && val !== null && String(val).trim() !== '')
                  .map(val => String(val).trim().replace(/\.0$/, ''));
                
                const uniqueNPIs = new Set(npiValues);
                const newCount = uniqueNPIs.size;
                setNumberOfProviders(newCount);
                
                // Trigger animation if count changed or was null
                if (previousCount === null || previousCount !== newCount) {
                  setIsProviderCountAnimating(true);
                  setTimeout(() => {
                    setIsProviderCountAnimating(false);
                  }, 4000);
                }
              } else {
                setNumberOfProviders(null);
                setIsProviderCountAnimating(false);
              }
            },
            error: () => {
              setNumberOfProviders(null);
              setIsProviderCountAnimating(false);
            }
          });
        } else if (fileKind === 'xlsx') {
          // Parse Excel to get NPI values
          const arrayBuffer = await uploadedFile.arrayBuffer();
          const workbook = XLSX.read(arrayBuffer, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const data = XLSX.utils.sheet_to_json(worksheet);

          if (data && npiColumnName) {
            npiValues = data
              .map(row => row[npiColumnName])
              .filter(val => val !== undefined && val !== null && String(val).trim() !== '')
              .map(val => String(val).trim().replace(/\.0$/, ''));
            
            const uniqueNPIs = new Set(npiValues);
            const newCount = uniqueNPIs.size;
            setNumberOfProviders(newCount);
            
            // Trigger animation if count changed or was null
            if (previousCount === null || previousCount !== newCount) {
              setIsProviderCountAnimating(true);
              setTimeout(() => {
                setIsProviderCountAnimating(false);
              }, 4000);
            }
          } else {
            setNumberOfProviders(null);
            setIsProviderCountAnimating(false);
          }
        }
      } catch (error) {
        console.error('Error calculating provider count:', error);
        setNumberOfProviders(null);
        setIsProviderCountAnimating(false);
      }
    };

    calculateProviderCount();
  }, [mappings, uploadedFile]);

  // Track the last manual practice IDs that were fetched
  const lastFetchedManualIdsRef = useRef(null);

  // Fetch practice info from API when manual Practice IDs are entered
  useEffect(() => {
    const fetchPracticeInfo = async () => {
      // Only fetch if manual Practice IDs are entered and no Practice ID/Cloud ID is mapped
      const practiceIdMapped = mappings.some(m => {
        const types = Array.isArray(m.detectedAs) ? m.detectedAs : [m.detectedAs];
        return types.includes('practiceId') || types.includes('practiceCloudId');
      });

      if (practiceIdMapped) {
        // If a mapping exists, clear manual practice info
        if (practiceInfo) {
          setPracticeInfo(null);
        }
        lastFetchedManualIdsRef.current = null;
        return;
      }

      if (!manualPracticeIds || !manualPracticeIds.trim()) {
        setPracticeInfo(null);
        lastFetchedManualIdsRef.current = null;
        return;
      }

      const trimmedIds = manualPracticeIds.trim();
      
      // Only fetch if the manual IDs have changed or we don't have data yet
      if (lastFetchedManualIdsRef.current === trimmedIds && practiceInfo) {
        return; // Already fetched for this value, don't fetch again
      }

      // Debounce API call
      const timeoutId = setTimeout(async () => {
        // Double-check the value hasn't changed during debounce
        if (lastFetchedManualIdsRef.current === trimmedIds && practiceInfo) {
          return;
        }

        setIsLoadingPracticeInfo(true);
        const startTime = Date.now();
        const minLoadingTime = 2000; // Minimum 2 seconds loading time
        
        try {
          const response = await fetch('http://localhost:5000/api/get-practice-info', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              manualPracticeIds: trimmedIds
            })
          });

          let resultData = null;
          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
              resultData = result.data;
            }
          }

          // Ensure minimum loading time of 2 seconds
          const elapsedTime = Date.now() - startTime;
          const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
          
          await new Promise(resolve => setTimeout(resolve, remainingTime));
          
          // Update state after minimum loading time
          if (resultData) {
            setPracticeInfo(resultData);
            lastFetchedManualIdsRef.current = trimmedIds;
          } else {
            setPracticeInfo(null);
            lastFetchedManualIdsRef.current = null;
          }
        } catch (error) {
          console.error('Error fetching practice info:', error);
          // Ensure minimum loading time even on error
          const elapsedTime = Date.now() - startTime;
          const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
          await new Promise(resolve => setTimeout(resolve, remainingTime));
          setPracticeInfo(null);
          lastFetchedManualIdsRef.current = null;
        } finally {
          setIsLoadingPracticeInfo(false);
        }
      }, 1000); // 1 second debounce

      return () => clearTimeout(timeoutId);
    };

    fetchPracticeInfo();
  }, [manualPracticeIds]);

  // Extract unique values from a column in the uploaded file
  async function extractUniqueValuesFromColumn(file, columnName) {
    return new Promise((resolve) => {
      const uniqueValues = new Set();
      
      const fileKind = getFileKind(file.name);
      
      if (fileKind === "csv") {
        // Create a new File/Blob to ensure we can read it
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          worker: false, // Disable worker to ensure file is read correctly
          complete: (res) => {
            const rows = res.data || [];
            for (const row of rows) {
              const value = row[columnName];
              if (value && String(value).trim()) {
                uniqueValues.add(String(value).trim());
              }
            }
            resolve(Array.from(uniqueValues));
          },
          error: (error) => {
            console.error('Error parsing CSV for unique values:', error);
            resolve([]);
          },
        });
      } else if (fileKind === "xlsx") {
        file.arrayBuffer().then(async (buf) => {
          try {
            const wb = XLSX.read(buf);
            const firstSheetName = wb.SheetNames[0];
            if (!firstSheetName) {
              resolve([]);
              return;
            }
            const ws = wb.Sheets[firstSheetName];
            const json = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
            if (!json.length) {
              resolve([]);
              return;
            }
            const headers = json[0].map((v) => String(v || "").trim());
            const columnIndex = headers.indexOf(columnName);
            
            if (columnIndex === -1) {
              console.warn(`Column "${columnName}" not found in file`);
              resolve([]);
              return;
            }
            
            for (let i = 1; i < json.length; i++) {
              const value = json[i][columnIndex];
              if (value && String(value).trim()) {
                uniqueValues.add(String(value).trim());
              }
            }
            resolve(Array.from(uniqueValues));
          } catch (error) {
            console.error('Error parsing Excel for unique values:', error);
            resolve([]);
          }
        }).catch((error) => {
          console.error('Error reading file arrayBuffer:', error);
          resolve([]);
        });
      } else {
        resolve([]);
      }
    });
  }

  // Track the last mapped column that was fetched
  const lastFetchedMappedColumnRef = useRef(null);

  // Get the current Practice ID/Cloud ID mapping column name
  const currentPracticeMappingColumn = useMemo(() => {
    const practiceIdMapping = mappings.find(m => {
      const types = Array.isArray(m.detectedAs) ? m.detectedAs : [m.detectedAs];
      return types.includes('practiceId');
    });
    
    const practiceCloudIdMapping = mappings.find(m => {
      const types = Array.isArray(m.detectedAs) ? m.detectedAs : [m.detectedAs];
      return types.includes('practiceCloudId');
    });

    if (!practiceIdMapping && !practiceCloudIdMapping) {
      return null;
    }

    // Prefer Practice Cloud ID if both exist
    const mappingToUse = practiceCloudIdMapping || practiceIdMapping;
    return mappingToUse.columnName;
  }, [mappings]);

  // Fetch practice info from mapped column when Practice ID or Practice Cloud ID is mapped
  useEffect(() => {
    const fetchMappedColumnPracticeInfo = async () => {
      // Only fetch if a mapping exists and file is uploaded
      if (!currentPracticeMappingColumn || !uploadedFile) {
        // Clear data if mapping was removed
        if (lastFetchedMappedColumnRef.current) {
          setMappedColumnPracticeInfo(null);
          setIsLoadingMappedColumnPracticeInfo(false);
          lastFetchedMappedColumnRef.current = null;
        }
        return;
      }

      const columnName = currentPracticeMappingColumn;

      // Only fetch if the column has changed or we don't have data yet
      if (lastFetchedMappedColumnRef.current === columnName && mappedColumnPracticeInfo) {
        return; // Already fetched for this column, don't fetch again
      }

      setIsLoadingMappedColumnPracticeInfo(true);
      const startTime = Date.now();
      const minLoadingTime = 2000; // Minimum 2 seconds loading time

      try {
        // Extract unique values from the column
        const uniqueValues = await extractUniqueValuesFromColumn(uploadedFile, columnName);
        
        if (uniqueValues.length === 0) {
          setMappedColumnPracticeInfo(null);
          setIsLoadingMappedColumnPracticeInfo(false);
          lastFetchedMappedColumnRef.current = null;
          return;
        }

        // Double-check the column hasn't changed during extraction
        if (lastFetchedMappedColumnRef.current === columnName && mappedColumnPracticeInfo) {
          setIsLoadingMappedColumnPracticeInfo(false);
          return;
        }

        // Call API with unique values
        const response = await fetch('http://localhost:5000/api/get-practice-info', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            manualPracticeIds: uniqueValues.join(', ')
          })
        });

        let resultData = null;
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            resultData = result.data;
          }
        }

        // Ensure minimum loading time of 2 seconds
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
        
        await new Promise(resolve => setTimeout(resolve, remainingTime));
        
        // Final check before updating state - verify the column hasn't changed
        if (currentPracticeMappingColumn === columnName) {
          if (resultData) {
            setMappedColumnPracticeInfo(resultData);
            lastFetchedMappedColumnRef.current = columnName;
          } else {
            setMappedColumnPracticeInfo(null);
            lastFetchedMappedColumnRef.current = null;
          }
        }
      } catch (error) {
        console.error('Error fetching mapped column practice info:', error);
        // Ensure minimum loading time even on error
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
        await new Promise(resolve => setTimeout(resolve, remainingTime));
        setMappedColumnPracticeInfo(null);
        lastFetchedMappedColumnRef.current = null;
      } finally {
        setIsLoadingMappedColumnPracticeInfo(false);
      }
    };

    fetchMappedColumnPracticeInfo();
  }, [currentPracticeMappingColumn, uploadedFile]);
  
  // Handle updating user info
  const handleUpdateUserInfo = async () => {
    if (!editEmail.trim() || !editRole.trim()) return;

    setIsUpdatingUserInfo(true);
    try {
      const response = await fetch('http://localhost:5000/api/update-user-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: editEmail.trim(),
          role: editRole.trim()
        })
      });

      if (response.ok) {
        const result = await response.json();
        // Update local state
        const newUserName = emailToName(editEmail.trim());
        setUser(newUserName);
        setRole(editRole.trim());
        // Update the imported userInfo object (for current session)
        userInfo.email = editEmail.trim();
        userInfo.role = editRole.trim();
        
        // Show success message
        showToastMessage('User info updated successfully');
        setShowUserEditModal(false);
      } else {
        const error = await response.json();
        showToastMessage(`Error updating user info: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating user info:', error);
      showToastMessage('Error updating user info. Please try again.');
    } finally {
      setIsUpdatingUserInfo(false);
    }
  };

  // Check if First Name and Last Name columns are detected
  const detectedFirstNameColumn = useMemo(() => {
    return columns.find(col => col.isFirstNameColumn);
  }, [columns]);
  
  const detectedLastNameColumn = useMemo(() => {
    return columns.find(col => col.isLastNameColumn);
  }, [columns]);
  
  const detectedGenderColumn = useMemo(() => {
    return columns.find(col => col.isGenderColumn);
  }, [columns]);
  
  const detectedProfessionalSuffixColumn = useMemo(() => {
    return columns.find(col => col.isProfessionalSuffixColumn);
  }, [columns]);
  
  const detectedHeadshotColumn = useMemo(() => {
    return columns.find(col => col.isHeadshotColumn);
  }, [columns]);
  
  const detectedAdditionalLanguagesColumn = useMemo(() => {
    return columns.find(col => col.isAdditionalLanguagesColumn);
  }, [columns]);
  
  const detectedStateColumn = useMemo(() => {
    return columns.find(col => col.isStateColumn);
  }, [columns]);

  const detectedPracticeCloudIdColumn = useMemo(() => {
    return columns.find(col => col.isPracticeCloudIdColumn);
  }, [columns]);

  const detectedPatientsAcceptedColumn = useMemo(() => {
    return columns.find(col => col.isPatientsAcceptedColumn);
  }, [columns]);

  // Check if all required mappings are done (First Name, Last Name, Headshot Link, and Practice ID OR Practice Cloud ID)
  const allRequiredMappingsDone = useMemo(() => {
    if (mappings.length === 0 || columnMap.size === 0) return false;
    
    const hasFirstName = mappings.some(m => {
      const types = Array.isArray(m.detectedAs) ? m.detectedAs : [m.detectedAs];
      return types.includes('firstName');
    });
    
    const hasLastName = mappings.some(m => {
      const types = Array.isArray(m.detectedAs) ? m.detectedAs : [m.detectedAs];
      return types.includes('lastName');
    });
    
    const hasHeadshot = mappings.some(m => {
      const types = Array.isArray(m.detectedAs) ? m.detectedAs : [m.detectedAs];
      return types.includes('headshot');
    });
    
    const hasPracticeId = mappings.some(m => {
      const types = Array.isArray(m.detectedAs) ? m.detectedAs : [m.detectedAs];
      return types.includes('practiceId');
    });
    
    const hasPracticeCloudId = mappings.some(m => {
      const types = Array.isArray(m.detectedAs) ? m.detectedAs : [m.detectedAs];
      return types.includes('practiceCloudId');
    });
    
    // Check if manual Practice IDs have been entered and practice names have been successfully extracted
    const hasManualPracticeIdsWithNames = (manualPracticeIds && manualPracticeIds.trim() && 
      practiceInfo && practiceInfo.api_success && practiceInfo.display_text);
    
    // Check if mapped column Practice IDs have been successfully extracted
    const hasMappedColumnPracticeIdsWithNames = (mappedColumnPracticeInfo && 
      mappedColumnPracticeInfo.api_success && mappedColumnPracticeInfo.display_text);
    
    // Practice ID OR Practice Cloud ID must be present (either mapped OR manually entered with successful extraction)
    const hasPracticeIdOrCloudId = hasPracticeId || hasPracticeCloudId || 
      hasManualPracticeIdsWithNames || hasMappedColumnPracticeIdsWithNames;
    
    return hasFirstName && hasLastName && hasHeadshot && hasPracticeIdOrCloudId;
  }, [mappings, columnMap, manualPracticeIds, practiceInfo, mappedColumnPracticeInfo]);

  // Determine which case will be used for location matching
  const locationCase = useMemo(() => {
    if (mappings.length === 0) return null;
    
    // Filter location-related mappings
    const locationMappings = mappings.filter(m => {
      const types = Array.isArray(m.detectedAs) ? m.detectedAs : [m.detectedAs];
      return types.some(type => 
        ['addressLine1', 'addressLine2', 'city', 'state', 'zip', 'practiceId', 'practiceCloudId', 'practiceName', 'locationId', 'locationName', 'locationTypeRaw'].includes(type)
      );
    });
    
    if (locationMappings.length === 0) return null;
    
    // Check if Location Monolith ID (Location ID) is mapped
    const hasLocationId = locationMappings.some(m => {
      const types = Array.isArray(m.detectedAs) ? m.detectedAs : [m.detectedAs];
      return types.includes('locationId');
    });
    
    if (hasLocationId) {
      return 1; // Case 1: Location Monolith ID is already mapped
    }
    
    // Check which address components are mapped
    const hasAddressLine1 = locationMappings.some(m => {
      const types = Array.isArray(m.detectedAs) ? m.detectedAs : [m.detectedAs];
      return types.includes('addressLine1');
    });
    
    const hasAddressLine2 = locationMappings.some(m => {
      const types = Array.isArray(m.detectedAs) ? m.detectedAs : [m.detectedAs];
      return types.includes('addressLine2');
    });
    
    const hasCity = locationMappings.some(m => {
      const types = Array.isArray(m.detectedAs) ? m.detectedAs : [m.detectedAs];
      return types.includes('city');
    });
    
    const hasState = locationMappings.some(m => {
      const types = Array.isArray(m.detectedAs) ? m.detectedAs : [m.detectedAs];
      return types.includes('state');
    });
    
    const hasZip = locationMappings.some(m => {
      const types = Array.isArray(m.detectedAs) ? m.detectedAs : [m.detectedAs];
      return types.includes('zip');
    });
    
    // Case 2: Only State is mapped (no other address components)
    if (hasState && !hasAddressLine1 && !hasAddressLine2 && !hasCity && !hasZip) {
      return 2; // Case 2: Only State is mapped
    }
    
    // Case 4: Only Address Line 1 is mapped (no other address components)
    if (hasAddressLine1 && !hasAddressLine2 && !hasCity && !hasState && !hasZip) {
      return 4; // Case 4: Only Address Line 1 is mapped
    }
    
    // Case 3: All address components mapped separately (or multiple components)
    if (hasAddressLine1 || hasAddressLine2 || hasCity || hasState || hasZip) {
      return 3; // Case 3: All address components mapped separately
    }
    
    return null; // No case determined
  }, [mappings]);

  // Auto-add disabled - now showing suggestions instead
  // The detected columns are still computed but not automatically added to mappings

  function resetAll() {
    setColumnMap(new Map());
    setUploadedFile(null);
    setFileStats({ total: 0, parsed: 0, errors: 0 });
    setFilter("");
    setConversionComplete(false);
    setHasShownExtractionDialog(false);
    setPackingComplete(false);
    setPackedFilePath(null);
    if (inputRef.current) inputRef.current.value = "";
    const stats = getKnowledgeBaseStats();
    setKnowledgeBaseStats(stats);
    // Clear mappings from storage when resetting
    const kb = getKnowledgeBase();
    kb.mappings = [];
    saveKnowledgeBase(kb);
    setMappings([]);
    // Clear practice-related state
    setManualPracticeIds("");
    setPracticeInfo(null);
    setMappedColumnPracticeInfo(null);
    setIsLoadingPracticeInfo(false);
    setIsLoadingMappedColumnPracticeInfo(false);
    // Clear manually removed flags
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('manually_removed_npi_') || key.startsWith('manually_removed_firstName_') || key.startsWith('manually_removed_lastName_')) {
        sessionStorage.removeItem(key);
      }
    });
    // Also refresh stored columns
    const columns = getAllStoredColumns();
    setStoredColumns(columns);
    // Reset timer
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setConversionTimer(0);
    setShowTimer(false);
  }

  function clearKnowledgeBaseData() {
    if (confirm('Are you sure you want to clear all stored column detection data?')) {
      clearKnowledgeBase();
      const stats = getKnowledgeBaseStats();
      setKnowledgeBaseStats(stats);
      const columns = getAllStoredColumns();
      setStoredColumns(columns);
    }
  }

  function handleRemoveColumn(columnName, columnType) {
    removeColumn(columnName, columnType);
    const stats = getKnowledgeBaseStats();
    setKnowledgeBaseStats(stats);
    const columns = getAllStoredColumns();
    setStoredColumns(columns);
  }

  // Helper function to render a column section
  function renderColumnSection(columns, title, colorClass, bgColorClass, textColorClass, borderColorClass, hoverBgColorClass, hoverTextColorClass, kbKey, mappedBgClass, mappedTextClass) {
    if (!columns || columns.length === 0) return null;

    // Extract color name for checkmark (e.g., "blue" from "text-blue-700")
    const colorMatch = textColorClass.match(/text-(\w+)-/);
    const checkmarkColor = colorMatch ? `text-${colorMatch[1]}-600` : 'text-blue-600';

    return (
      <div className="mb-4">
        <div className="text-xs font-semibold text-neutral-500 mb-2 flex items-center gap-1">
          <span className={`inline-block w-3 h-3 rounded-full ${colorClass}`}></span>
          {title}
        </div>
        <div className="flex flex-wrap gap-2">
          {columns.map((col) => {
            const isMapped = mappings.some(m => m.columnName === col.name);
            return (
              <div
                key={col.name}
                className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  isMapped 
                    ? `${mappedBgClass} ${mappedTextClass} border-2 ${borderColorClass} ${hoverBgColorClass}` 
                    : `${bgColorClass} ${textColorClass} ${hoverBgColorClass}`
                }`}
              >
                <span>{col.name}</span>
                {isMapped && (
                  <span className={`${checkmarkColor} font-bold`}>✓</span>
                )}
                <button
                  onClick={() => {
                    const kb = getKnowledgeBase();
                    if (kb[kbKey]) {
                      kb[kbKey] = kb[kbKey].filter(c => c.name !== col.name);
                      saveKnowledgeBase(kb);
                      const updatedColumns = getAllStoredColumns();
                      setStoredColumns(updatedColumns);
                    }
                  }}
                  className={`${textColorClass} ${hoverTextColorClass} opacity-0 group-hover:opacity-100 transition-opacity`}
                  title="Remove"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  function handleColumnClick(e, columnName) {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      columnName: columnName,
    });
  }

  function handleCloseContextMenu() {
    setContextMenu({ visible: false, x: 0, y: 0, columnName: null });
  }

  function handleMappingSelect(detectedAs) {
    if (contextMenu.columnName) {
      // Validation: Only allow 1 column to be assigned as NPI
      if (detectedAs === 'npi') {
        const existingMappings = getMappings();
        const otherNPIMappings = existingMappings.filter(m => {
          const mapping = Array.isArray(m.detectedAs) ? m.detectedAs : [m.detectedAs];
          return mapping.includes('npi') && m.columnName !== contextMenu.columnName;
        });
        
        if (otherNPIMappings.length > 0) {
          alert(`Only 1 column can be assigned to NPI.\n\nAlready assigned to: "${otherNPIMappings[0].columnName}"\n\nPlease remove it first before assigning NPI to another column.`);
          return;
        }
      }
      
      const success = saveMapping(contextMenu.columnName, detectedAs);
      
      if (success) {
        const mappingsData = getMappings();
        setMappings(mappingsData);
        const stats = getKnowledgeBaseStats();
        setKnowledgeBaseStats(stats);
        const columns = getAllStoredColumns();
        setStoredColumns(columns);
      }
      // Don't close menu, keep it open for multi-select
    }
  }

  function handleRemoveMapping(columnName) {
    // Check if we're removing mappings and mark them as manually removed
    const existingMappings = getMappings();
    const mapping = existingMappings.find(m => m.columnName === columnName);
    
    if (mapping) {
      const types = Array.isArray(mapping.detectedAs) ? mapping.detectedAs : [mapping.detectedAs];
      // Mark as manually removed to prevent auto-adding
      if (types.includes('npi')) {
        sessionStorage.setItem(`manually_removed_npi_${columnName}`, 'true');
      }
      if (types.includes('firstName')) {
        sessionStorage.setItem(`manually_removed_firstName_${columnName}`, 'true');
      }
      if (types.includes('lastName')) {
        sessionStorage.setItem(`manually_removed_lastName_${columnName}`, 'true');
      }
      if (types.includes('gender')) {
        sessionStorage.setItem(`manually_removed_gender_${columnName}`, 'true');
      }
      if (types.includes('professionalSuffix')) {
        sessionStorage.setItem(`manually_removed_professionalSuffix_${columnName}`, 'true');
      }
      if (types.includes('headshot')) {
        sessionStorage.setItem(`manually_removed_headshot_${columnName}`, 'true');
      }
      if (types.includes('additionalLanguages')) {
        sessionStorage.setItem(`manually_removed_additionalLanguages_${columnName}`, 'true');
      }
    }
    
    // Animate out before removing
    setAnimatingItem({ columnName, type: 'removing' });
    setTimeout(() => {
      removeMapping(columnName);
      const mappingsData = getMappings();
      setMappings(mappingsData);
      setAnimatingItem(null);
    }, 300);
  }

  function handleSaveMappingsToKnowledge() {
    // Save all current mappings to knowledge base for future auto-detection
    let savedCount = 0;
    const savedColumns = {
      npi: [],
      firstName: [],
      lastName: [],
      gender: [],
      professionalSuffix: [],
      headshot: [],
      additionalLanguages: [],
      state: [],
      city: [],
      zip: [],
      addressLine1: [],
      addressLine2: [],
      practiceId: [],
      practiceCloudId: [],
      practiceName: [],
      locationId: [],
      locationName: [],
      locationTypeRaw: [],
      pfs: [],
      patientsAccepted: [],
      specialty: []
    };
    
    mappings.forEach(mapping => {
      const types = Array.isArray(mapping.detectedAs) ? mapping.detectedAs : [mapping.detectedAs];
      
      types.forEach(type => {
        let saved = false;
        if (type === 'npi') {
          addNPIColumn(mapping.columnName, 100);
          saved = true; // addNPIColumn always saves (adds or updates)
          savedColumns.npi.push(mapping.columnName);
        } else if (type === 'firstName') {
          saved = addFirstNameToKnowledge(mapping.columnName);
          if (saved) savedColumns.firstName.push(mapping.columnName);
        } else if (type === 'lastName') {
          saved = addLastNameToKnowledge(mapping.columnName);
          if (saved) savedColumns.lastName.push(mapping.columnName);
        } else if (type === 'gender') {
          saved = addGenderToKnowledge(mapping.columnName);
          if (saved) savedColumns.gender.push(mapping.columnName);
        } else if (type === 'professionalSuffix') {
          saved = addProfessionalSuffixToKnowledge(mapping.columnName);
          if (saved) savedColumns.professionalSuffix.push(mapping.columnName);
        } else if (type === 'headshot') {
          saved = addHeadshotToKnowledge(mapping.columnName);
          if (saved) savedColumns.headshot.push(mapping.columnName);
        } else if (type === 'additionalLanguages') {
          saved = addAdditionalLanguagesToKnowledge(mapping.columnName);
          if (saved) savedColumns.additionalLanguages.push(mapping.columnName);
        } else if (type === 'state') {
          saved = addStateToKnowledge(mapping.columnName);
          if (saved) savedColumns.state.push(mapping.columnName);
        } else if (type === 'city') {
          saved = addCityToKnowledge(mapping.columnName);
          if (saved) savedColumns.city.push(mapping.columnName);
        } else if (type === 'zip') {
          saved = addZipToKnowledge(mapping.columnName);
          if (saved) savedColumns.zip.push(mapping.columnName);
        } else if (type === 'addressLine1') {
          saved = addAddressLine1ToKnowledge(mapping.columnName);
          if (saved) savedColumns.addressLine1.push(mapping.columnName);
        } else if (type === 'addressLine2') {
          saved = addAddressLine2ToKnowledge(mapping.columnName);
          if (saved) savedColumns.addressLine2.push(mapping.columnName);
        } else if (type === 'practiceId') {
          saved = addPracticeIdToKnowledge(mapping.columnName);
          if (saved) savedColumns.practiceId.push(mapping.columnName);
        } else if (type === 'practiceCloudId') {
          saved = addPracticeCloudIdToKnowledge(mapping.columnName);
          if (saved) savedColumns.practiceCloudId.push(mapping.columnName);
        } else if (type === 'practiceName') {
          saved = addPracticeNameToKnowledge(mapping.columnName);
          if (saved) savedColumns.practiceName.push(mapping.columnName);
        } else if (type === 'locationId') {
          saved = addLocationIdToKnowledge(mapping.columnName);
          if (saved) savedColumns.locationId.push(mapping.columnName);
        } else if (type === 'locationName') {
          saved = addLocationNameToKnowledge(mapping.columnName);
          if (saved) savedColumns.locationName.push(mapping.columnName);
        } else if (type === 'locationTypeRaw') {
          saved = addLocationTypeRawToKnowledge(mapping.columnName);
          if (saved) savedColumns.locationTypeRaw.push(mapping.columnName);
        } else if (type === 'pfs') {
          saved = addPFSToKnowledge(mapping.columnName);
          if (saved) savedColumns.pfs.push(mapping.columnName);
        } else if (type === 'patientsAccepted') {
          saved = addPatientsAcceptedToKnowledge(mapping.columnName);
          if (saved) savedColumns.patientsAccepted.push(mapping.columnName);
        } else if (type === 'specialty') {
          saved = addSpecialtyToKnowledge(mapping.columnName);
          if (saved) savedColumns.specialty.push(mapping.columnName);
        } else {
          console.warn(`Unknown column type detected: ${type} for column: ${mapping.columnName}`);
        }
        
        if (saved) savedCount++;
      });
    });
    
    // Log all saved columns to console for verification
    console.log('✅ Saved column mappings to knowledge base:', {
      totalSaved: savedCount,
      byType: savedColumns,
      fullKnowledgeBase: getKnowledgeBase()
    });
    
    // Refresh knowledge base stats
    const stats = getKnowledgeBaseStats();
    setKnowledgeBaseStats(stats);
    const columns = getAllStoredColumns();
    setStoredColumns(columns);
    
    // Show success message with count
    const totalTypes = Object.values(savedColumns).reduce((sum, arr) => sum + arr.length, 0);
    showToastMessage(`Successfully saved ${totalTypes} column mapping(s) for future detection`);
  }

  // Helpers
  function addExample(col, val) {
    if (val === undefined || val === null) return;
    const str = String(val).trim();
    if (!str) return;
    setColumnMap((prev) => {
      const next = new Map(prev);
      const existing = next.get(col) ?? [];
      if (existing.includes(str)) return next;
      if (existing.length >= 3) return next; // keep only up to 3 examples
      next.set(col, [...existing, str]);
      return next;
    });
  }

  async function parseCSVLike(file) {
    return new Promise((resolve) => {
      Papa.parse(file, {
        header: true,
        preview: 200,
        skipEmptyLines: true,
        worker: true,
        complete: (res) => {
          const fields = res.meta.fields || [];
          fields.forEach((f) => {
            setColumnMap((prev) => (prev.has(f) ? new Map(prev) : new Map(prev).set(f, [])));
          });
          const rows = res.data || [];
          for (const row of rows) {
            for (const key of fields) {
              // Let addExample enforce the 3-example cap; don't rely on potentially stale state here
              addExample(key, row[key]);
            }
          }
          resolve();
        },
        error: () => resolve(),
      });
    });
  }

  async function parseExcel(file) {
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf);
    const firstSheetName = wb.SheetNames[0];
    if (!firstSheetName) return;
    const ws = wb.Sheets[firstSheetName];
    const json = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
    if (!json.length) return;
    const headers = json[0].map((v) => String(v || "").trim());
    headers.forEach((h) => {
      if (!h) return;
      setColumnMap((prev) => (prev.has(h) ? new Map(prev) : new Map(prev).set(h, [])));
    });
    const rows = json.slice(1, 201);
    for (const r of rows) {
      headers.forEach((h, idx) => {
        if (!h) return;
        const v = r[idx];
        // Don't pre-check state; addExample will de-dupe and cap
        addExample(h, v);
      });
    }
  }

  // Email validation for zocdoc.com domain
  function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { valid: false, error: "Please enter a valid email address" };
    }
    if (!email.toLowerCase().endsWith("@zocdoc.com")) {
      return { valid: false, error: "Email must be from zocdoc.com domain" };
    }
    return { valid: true, error: "" };
  }

  // Check VPN connection by testing Practice ID '67786'
  async function checkVPNConnection() {
    setIsVPNChecking(true);
    setIsVPNFailed(false);
    setIsVPNSuccessful(false);
    addLog('VPN connection check', 'info');
    
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    try {
      const response = await fetch(`${API_BASE_URL}/api/check-vpn-connection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          practice_id: '67786'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'VPN connection check failed');
      }

      if (data.success) {
        setIsVPNSuccessful(true);
        setIsVPNFailed(false);
        addLog('VPN connection check', 'success');
      } else {
        setIsVPNSuccessful(false);
        setIsVPNFailed(true);
        addLog('VPN connection check', 'error');
      }
    } catch (error) {
      setIsVPNSuccessful(false);
      setIsVPNFailed(true);
      addLog(`VPN connection check failed: ${error.message}`, 'error');
    } finally {
      setIsVPNChecking(false);
    }
  }

  // Check connection using credentials from userInfo.json
  async function handleCheckConnection() {
    // Get email and role from userInfo.json
    const email = userInfo.email;
    const userRole = userInfo.role;
    
    if (!email || !userRole) {
      addLog('Error: Email and role not found in userInfo.json', 'error');
      showToastMessage("Error: Email and role must be configured in userInfo.json");
      return;
    }
    
    if (isCheckingConnection) {
      return; // Prevent multiple simultaneous checks
    }

    setIsCheckingConnection(true);
    setIsConnectionFailed(false); // Reset failed state when starting new check
    setIsConnectionSuccessful(false); // Reset success state when starting new check
    addLog('Snowflake connection check', 'info');
    
    // Also check VPN connection
    checkVPNConnection();

    // Check user connection via backend
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    try {
      // Add timestamp to force fresh Snowflake authentication (bypass cache)
      const timestamp = Date.now();
      const response = await fetch(`${API_BASE_URL}/api/check-user-connection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_email: email.trim(),
          role: userRole,
          force_refresh: true, // Force fresh authentication
          timestamp: timestamp // Unique timestamp to prevent caching
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Connection check failed');
      }

      if (data.success) {
        setIsConnectionSuccessful(true);
        setIsConnectionFailed(false);
        addLog('Snowflake connection check', 'success');
        
        const newName = emailToName(email);
        setUser(newName);
        setRole(userRole);
        
        showToastMessage("Connection validated successfully!");
      } else {
        setIsConnectionSuccessful(false);
        setIsConnectionFailed(true);
        // Check if it's an SSO mismatch error
        if (data.error_type === 'sso_mismatch') {
          setIsSSOMismatch(true);
          setConnectionError(data.message);
          addLog('SSO Authentication Mismatch: Please log out and log back in with the correct account', 'error');
        } else {
          setIsSSOMismatch(false);
          setConnectionError(data.message);
          addLog('Snowflake connection check', 'error');
        }
      }
    } catch (error) {
      setIsConnectionSuccessful(false);
      setIsConnectionFailed(true);
      setIsSSOMismatch(false);
      console.error('Connection check error:', error);
      let errorMessage = error.message;
      if (error.message === 'Failed to fetch' || error.message.includes('fetch')) {
        errorMessage = 'Failed to connect to backend server. Please ensure the backend is running on http://localhost:5000';
      }
      setConnectionError(errorMessage);
      addLog('Snowflake connection check', 'error');
    } finally {
      setIsCheckingConnection(false);
    }
  }

  function getFileKind(name) {
    const n = name.toLowerCase();
    if (n.endsWith(".csv") || n.endsWith(".tsv") || n.endsWith(".txt")) return "csv";
    if (n.endsWith(".xlsx") || n.endsWith(".xls")) return "xlsx";
    return "unknown";
  }

  async function handleFilesUpload(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setIsParsing(true);
    setColumnMap(new Map());
    setFileStats({ total: files.length, parsed: 0, errors: 0 });
    setConversionComplete(false);
    setHasShownExtractionDialog(false);
    setPackingComplete(false);
    setPackedFilePath(null);
    
    // Reset timer
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setConversionTimer(0);
    setShowTimer(false);
    
    addLog(`Uploading ${files.length} file(s)...`, 'info');
    
    // Store the first uploaded file
    const firstFile = files[0];
    setUploadedFile(firstFile);
    addLog(`File selected: ${firstFile.name}`, 'info');

    for (const file of files) {
      try {
        const kind = getFileKind(file.name);
        addLog(`Parsing ${file.name} (${kind.toUpperCase()})...`, 'info');
        if (kind === "csv") await parseCSVLike(file);
        else if (kind === "xlsx") await parseExcel(file);
        setFileStats((s) => ({ ...s, parsed: s.parsed + 1 }));
        addLog(`Successfully parsed ${file.name}`, 'success');
      } catch (err) {
        console.error("Parse error", err);
        setFileStats((s) => ({ ...s, parsed: s.parsed + 1, errors: s.errors + 1 }));
        addLog(`Error parsing ${file.name}: ${err.message}`, 'error');
      }
    }

    setIsParsing(false);
    addLog('File upload completed', 'info');
  }

  function showToastMessage(message) {
    setToastMessage(message);
    setShowToast(true);
    setToastAnimatingOut(false);
    
    // Start slide-out animation after 4 seconds
    setTimeout(() => {
      setToastAnimatingOut(true);
      
      // Hide after animation completes
      setTimeout(() => {
        setShowToast(false);
        setToastAnimatingOut(false);
      }, 400); // Match animation duration
    }, 4000); // Stay for 4 seconds
  }

  async function handleConvert() {
    if (mappings.length === 0) {
      showToastMessage("Please add at least one mapping before converting.");
      addLog("Convert failed: No mappings found", 'error');
      return;
    }

    if (!uploadedFile) {
      showToastMessage("Please upload a file first.");
      addLog("Convert failed: No file uploaded", 'error');
      return;
    }

    setIsConverting(true);
      addLog('Starting conversion process...', 'info');
      addLog(`Sending ${mappings.length} mapping(s) to backend...`, 'info');
      
      try {
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        addLog(`Connecting to backend: ${API_BASE_URL}`, 'info');
        
        // Create FormData to send both file and mappings
        const formData = new FormData();
        formData.append('file', uploadedFile);
        formData.append('mappings', JSON.stringify(mappings));
        // Send manual Practice IDs if entered
        if (manualPracticeIds && manualPracticeIds.trim()) {
          formData.append('manualPracticeIds', manualPracticeIds.trim());
        }

        addLog('Creating Mappings.xlsx...', 'info');
        addLog('Creating _Mapped.xlsx...', 'info');
        addLog('Creating Locations_input.xlsx...', 'info');
        addLog('Starting NPI extraction from Snowflake...', 'info');

        const response = await fetch(`${API_BASE_URL}/api/convert`, {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to convert mappings');
        }

        // Log NPI extraction progress if available
        if (data.npi_extraction_info) {
          const info = data.npi_extraction_info;
          if (info.total_npis) {
            addLog(`Extracting data for ${info.total_npis} NPIs from Snowflake...`, 'info');
            addLog(`NPI extraction progress: ${info.processed_count || info.total_npis}/${info.total_npis} NPIs processed`, 'info');
            if (info.successful_count !== undefined) {
              addLog(`Successfully extracted data for ${info.successful_count} out of ${info.total_npis} NPIs`, 'success');
            }
          }
        } else {
          addLog('NPI extraction completed', 'info');
        }

        addLog('Files created successfully', 'success');
        addLog(`Mappings file: ${data.mappings_path}`, 'success');
        addLog(`Uploaded file: ${data.file_path}`, 'success');
        if (data.npi_extracts_path) {
          addLog(`NPI-Extracts file: ${data.npi_extracts_path}`, 'success');
        }
        showToastMessage("The files have been saved");
        setConversionComplete(true);
    } catch (error) {
      console.error('Convert error:', error);
      addLog(`Convert error: ${error.message}`, 'error');
      showToastMessage(`Error: ${error.message}`);
      setConversionComplete(false);
    setHasShownExtractionDialog(false);
    setPackingComplete(false);
    setPackedFilePath(null);
    setPackingComplete(false);
    setPackedFilePath(null);
    } finally {
      setIsConverting(false);
      addLog('Conversion process completed', 'info');
    }
  }

  return (
    <>
      {/* Show launch animation on initial load */}
      {showLaunchAnimation && (
        <LaunchAnimation 
          onComplete={() => {
            setShowLaunchAnimation(false);
            // Start fade-in of main content after animation completes
            setTimeout(() => {
              setShowMainContent(true);
            }, 100);
          }}
          onZocdocReady={() => setShowZocdocText(true)}
        />
      )}

      {/* Main app content - fades in after intro animation */}
      <motion.div 
        className="h-screen w-full bg-neutral-50 text-neutral-900 overflow-hidden relative" 
        onClick={handleCloseContextMenu}
        initial={{ opacity: 0 }}
        animate={{ opacity: showMainContent ? 1 : 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {/* Top Gradient Bar */}
        <div 
          className="fixed top-0 left-0 right-0 h-16 z-30 pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, #FBEBB4, rgba(251, 235, 180, 0.3), transparent)'
          }}
        />

        {/* Sticky Header - appears when scrolled */}
        <AnimatePresence>
          {isScrolled && (
            <motion.div
              className="fixed top-0 left-0 right-0 z-[35] backdrop-blur-sm"
              style={{
                background: 'linear-gradient(to bottom, #FBEBB4, rgba(251, 235, 180, 0.3), transparent)'
              }}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mx-auto max-w-[95%] px-4 py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <motion.h1 
                    className="text-xl font-semibold tracking-tight text-neutral-900"
                    layout
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ 
                      duration: 0.5, 
                      ease: [0.4, 0, 0.2, 1],
                      opacity: { duration: 0.3, delay: 0.1 }
                    }}
                  >
                    <motion.span
                      initial={{ 
                        opacity: 0,
                        clipPath: 'inset(0 100% 0 0)'
                      }}
                      animate={{ 
                        opacity: 1,
                        clipPath: 'inset(0 0% 0 0)'
                      }}
                      transition={{ 
                        duration: 0.5, 
                        ease: 'easeInOut',
                        delay: 0.2
                      }}
                    >
                      FLU
                    </motion.span>
                    <motion.span
                      initial={{ 
                        opacity: 0,
                        scale: 0,
                        y: -10
                      }}
                      animate={{ 
                        opacity: 1,
                        scale: 1,
                        y: 0
                      }}
                      transition={{ 
                        duration: 0.4, 
                        ease: [0.34, 1.56, 0.64, 1],
                        delay: 1.0,
                        type: 'spring',
                        stiffness: 300,
                        damping: 12
                      }}
                    >
                      3
                    </motion.span>
                    <motion.span
                      initial={{ 
                        opacity: 0,
                        clipPath: 'inset(0 100% 0 0)'
                      }}
                      animate={{ 
                        opacity: 1,
                        clipPath: 'inset(0 0% 0 0)'
                      }}
                      transition={{ 
                        duration: 0.5, 
                        ease: 'easeInOut',
                        delay: 0.2
                      }}
                    >
                      NT
                    </motion.span>
                  </motion.h1>
                  
                  {/* User Information - Beside FLU3NT in sticky header */}
                  {showUserInfoInHeader && (
                    <motion.div 
                      className="text-sm text-neutral-600 whitespace-nowrap"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                    >
                      <div 
                        className="cursor-pointer hover:text-blue-600 transition-colors"
                        onClick={() => {
                          setEditEmail(userInfo.email || '');
                          setEditRole(userInfo.role || role || '');
                          setShowUserEditModal(true);
                        }}
                        title="Click to edit email and role"
                      >
                        <span className="font-medium">{user || '-'}</span>
                      </div>
                    </motion.div>
                  )}
                </div>
                
                {/* Buttons in sticky header - all in one line */}
                <motion.div 
                  className="flex items-center gap-2 flex-wrap"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, ease: 'easeOut', delay: 0.2 }}
                >
                  {/* Snowflake Status */}
                  <motion.div 
                    className="flex items-center gap-2 text-xs"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                  >
                    {isConnectionSuccessful && (
                      <Check className="h-3 w-3 text-green-600" />
                    )}
                    {isConnectionFailed && (
                      <X className="h-3 w-3 text-red-600" />
                    )}
                    <span className={`${
                      isConnectionSuccessful ? 'text-green-600' : 
                      isConnectionFailed ? 'text-red-600' : 
                      'text-neutral-500'
                    }`}>Snowflake</span>
                  </motion.div>
                  
                  {/* VPN Status */}
                  <motion.div 
                    className="flex items-center gap-2 text-xs"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.35 }}
                  >
                    {isVPNSuccessful && (
                      <Check className="h-3 w-3 text-green-600" />
                    )}
                    {isVPNFailed && (
                      <X className="h-3 w-3 text-red-600" />
                    )}
                    <span className={`${
                      isVPNSuccessful ? 'text-green-600' : 
                      isVPNFailed ? 'text-red-600' : 
                      'text-neutral-500'
                    }`}>VPN</span>
                  </motion.div>
                  
                  {/* Check Connection Button - Icon Only */}
                  <motion.div 
                    className={`w-10 h-10 rounded-2xl shadow transition-colors flex items-center justify-center ${
                      isCheckingConnection 
                        ? 'bg-neutral-800 cursor-not-allowed' 
                        : 'bg-black cursor-pointer hover:bg-neutral-800 text-white'
                    }`}
                    title={isCheckingConnection ? 'Checking...' : (role || "Click to check connection")}
                    onClick={handleCheckConnection}
                    style={isCheckingConnection ? { pointerEvents: 'none' } : {}}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                  >
                    <Globe className={`h-4 w-4 text-white ${isCheckingConnection ? 'animate-pulse' : ''}`} />
                  </motion.div>
                  
                  {/* Reset Button - Icon Only */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.45 }}
                  >
                    <div
                      className="w-10 h-10 rounded-2xl bg-black shadow hover:bg-neutral-800 transition-colors flex items-center justify-center cursor-pointer text-white"
                      onClick={resetAll}
                      title="Reset"
                    >
                      <RefreshCw className="h-4 w-4 text-white" />
                    </div>
                  </motion.div>
                  
                  {/* Upload Files Button - Icon Only */}
                  <motion.label
                    className="inline-flex cursor-pointer items-center justify-center w-10 h-10 rounded-2xl bg-black shadow hover:bg-neutral-800 transition-colors text-white"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.5 }}
                    title="Upload Files"
                  >
                    <Upload className="h-4 w-4 text-white" />
                    <Input
                      ref={inputRef}
                      type="file"
                      className="hidden"
                      multiple
                      onChange={handleFilesUpload}
                    />
                  </motion.label>
                  
                  {/* Convert Button - Icon Only */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.55 }}
                  >
                    <div
                      className={`w-10 h-10 rounded-2xl shadow transition-colors flex items-center justify-center ${
                        !isConverting
                          ? "bg-black cursor-pointer hover:bg-neutral-800 text-white"
                          : "bg-neutral-800 cursor-not-allowed text-white"
                      }`}
                      onClick={isConverting ? undefined : handleConvert}
                      title={isConverting ? 'Converting...' : "Convert mapped columns to Excel"}
                      style={isConverting ? { pointerEvents: 'none' } : {}}
                    >
                      <RotateCw className={`h-4 w-4 text-white ${isConverting ? 'animate-spin' : ''}`} />
                    </div>
                  </motion.div>
                  
                  {/* Packing System Button - Icon Only */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.6 }}
                  >
                    <div
                      className={`w-10 h-10 rounded-2xl shadow transition-colors flex items-center justify-center ${
                        conversionComplete
                          ? "bg-purple-600 cursor-pointer hover:bg-purple-700 text-white"
                          : "bg-black cursor-pointer hover:bg-neutral-800 text-white"
                      }`}
                      onClick={() => {
                        if (conversionComplete) {
                          setShowExtractionCompleteDialog(true);
                        } else {
                          setShowExtractionErrorDialog(true);
                        }
                      }}
                      title="Open Packing System"
                    >
                      <Package className="h-4 w-4" />
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Permanent Zocdoc text centered - stays in top center, scales down and moves up when scrolled */}
        {showZocdocText && (
          <motion.div 
            className="fixed top-6 left-1/2 -translate-x-1/2 z-40 pointer-events-none"
            style={{ top: '24px' }}
            animate={{
              scale: isScrolled ? 0.75 : 1,
              y: isScrolled ? -22 : 0
            }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <h1 className="zocdoc-font text-[36px]">
              Zocdoc
            </h1>
          </motion.div>
        )}
      {/* Toast Notification */}
      {showToast && (
        <div className={`fixed bottom-4 left-4 z-50 toast-notification ${
          toastAnimatingOut ? 'animate-slide-out-left' : 'animate-slide-in-left'
        }`}>
          <div className="bg-neutral-800 text-white px-4 py-2 rounded-lg shadow-lg text-sm">
            {toastMessage}
          </div>
        </div>
      )}
        <div className="h-full w-full overflow-y-auto">
          <div className="mx-auto max-w-[95%] px-4 py-8">
          <header className="mb-6 flex items-start justify-between gap-4">
            <div>
              <motion.h1 
                className="text-2xl font-semibold tracking-tight"
                layout
                animate={{
                  opacity: isScrolled ? 0 : 1,
                  scale: isScrolled ? 0.9 : 1,
                  y: isScrolled ? -20 : 0
                }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
              >
                {isScrolled ? (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0 }}
                  >
                    FLU3NT- Bulk Transposition Tool
                  </motion.span>
                ) : (
                  <button
                    onClick={() => setShowUserManualDialog(true)}
                    className="text-inherit font-inherit tracking-inherit hover:text-blue-600 hover:underline transition-colors cursor-pointer"
                    title="Click to open user manual"
                  >
                    FLU3NT- Scope Sheet Transposition Tool
                  </button>
                )}
              </motion.h1>
              <motion.p 
                className="mt-1 text-sm text-neutral-600"
                animate={{
                  opacity: isScrolled ? 0 : 1,
                  y: isScrolled ? -10 : 0
                }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                Upload one data file (CSV/TSV/XLSX). Scope sheets are converted to ZD Templates using the manual and automated detection of columns.
              </motion.p>
            </div>
            <motion.div 
              className="flex items-center gap-3 flex-wrap"
              animate={{
                opacity: isScrolled ? 0 : 1,
                scale: isScrolled ? 0.95 : 1,
                y: isScrolled ? -10 : 0
              }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <motion.div 
                className="flex items-center gap-2 text-xs"
                initial={{ opacity: 0, scale: 0.8, y: -10 }}
                animate={{ 
                  opacity: showSnowflake ? 1 : 0, 
                  scale: showSnowflake ? 1 : 0.8,
                  y: showSnowflake ? 0 : -10
                }}
                transition={{ 
                  duration: 0.4, 
                  ease: [0.34, 1.56, 0.64, 1], // Pop-in easing
                  delay: 0.1
                }}
              >
                  {isConnectionSuccessful && (
                    <Check className="h-3 w-3 text-green-600" />
                  )}
                  {isConnectionFailed && (
                    <X className="h-3 w-3 text-red-600" />
                  )}
                  <span className={`${
                    isConnectionSuccessful ? 'text-green-600' : 
                    isConnectionFailed ? 'text-red-600' : 
                    'text-neutral-500'
                  }`}>Snowflake</span>
              </motion.div>
              <motion.div 
                className="flex items-center gap-2 text-xs"
                initial={{ opacity: 0, scale: 0.8, y: -10 }}
                animate={{ 
                  opacity: showVPN ? 1 : 0, 
                  scale: showVPN ? 1 : 0.8,
                  y: showVPN ? 0 : -10
                }}
                transition={{ 
                  duration: 0.4, 
                  ease: [0.34, 1.56, 0.64, 1], // Pop-in easing
                  delay: 0.1
                }}
              >
                  {isVPNSuccessful && (
                    <Check className="h-3 w-3 text-green-600" />
                  )}
                  {isVPNFailed && (
                    <X className="h-3 w-3 text-red-600" />
                  )}
                  <span className={`${
                    isVPNSuccessful ? 'text-green-600' : 
                    isVPNFailed ? 'text-red-600' : 
                    'text-neutral-500'
                  }`}>VPN</span>
              </motion.div>
              <motion.div 
                className={`text-sm px-4 py-2 rounded-2xl shadow transition-colors flex items-center gap-2 ${
                    isCheckingConnection 
                      ? 'bg-neutral-200 cursor-not-allowed' 
                      : 'bg-neutral-100 cursor-pointer hover:bg-neutral-200'
                  }`}
                title={isCheckingConnection ? 'Checking...' : (role || "Click to check connection")}
                  onClick={handleCheckConnection}
                  style={isCheckingConnection ? { pointerEvents: 'none' } : {}}
                initial={{ opacity: 0, scale: 0.8, y: -10 }}
                animate={{ 
                  opacity: showButtons ? 1 : 0, 
                  scale: showButtons ? 1 : 0.8,
                  y: showButtons ? 0 : -10
                }}
                transition={{ 
                  duration: 0.4, 
                  ease: [0.34, 1.56, 0.64, 1], // Pop-in easing
                  delay: 0.1 // First button
                }}
              >
                <Globe className={`h-4 w-4 ${isCheckingConnection ? 'animate-pulse' : ''}`} />
                  <span className="font-medium">
                    {isCheckingConnection ? 'Checking...' : 'Check Connection'}
                  </span>
              </motion.div>
              <motion.div
                className="text-sm px-4 py-2 rounded-2xl shadow transition-colors flex items-center gap-2 bg-neutral-100 cursor-pointer hover:bg-neutral-200"
                onClick={resetAll}
                initial={{ opacity: 0, scale: 0.8, y: -10 }}
                animate={{ 
                  opacity: showButtons ? 1 : 0, 
                  scale: showButtons ? 1 : 0.8,
                  y: showButtons ? 0 : -10
                }}
                transition={{ 
                  duration: 0.4, 
                  ease: [0.34, 1.56, 0.64, 1], // Pop-in easing
                  delay: 0.2 // Second button
                }}
              >
                <RefreshCw className="h-4 w-4" />
                <span className="font-medium">Reset</span>
              </motion.div>
              <motion.label
                className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-black px-4 py-2 text-sm font-medium text-white shadow hover:opacity-90 transition-colors"
                initial={{ opacity: 0, scale: 0.8, y: -10 }}
                animate={{ 
                  opacity: showButtons ? 1 : 0, 
                  scale: showButtons ? 1 : 0.8,
                  y: showButtons ? 0 : -10
                }}
                transition={{ 
                  duration: 0.4, 
                  ease: [0.34, 1.56, 0.64, 1], // Pop-in easing
                  delay: 0.3 // Third button
                }}
              >
                  <Upload className="h-4 w-4" />
                  Upload Files
                  <Input
                    ref={inputRef}
                    type="file"
                    className="hidden"
                    multiple
                    onChange={handleFilesUpload}
                  />
              </motion.label>
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: -10 }}
                animate={{ 
                  opacity: showButtons ? 1 : 0, 
                  scale: showButtons ? 1 : 0.8,
                  y: showButtons ? 0 : -10
                }}
                transition={{ 
                  duration: 0.4, 
                  ease: [0.34, 1.56, 0.64, 1], // Pop-in easing
                  delay: 0.4 // Fourth button
                }}
              >
                <Button
                  variant="default"
                  onClick={handleConvert}
                  disabled={isConverting}
                  className={`!rounded-2xl gap-2 px-4 py-2 text-sm font-medium shadow ${
                    !isConverting
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-neutral-300 text-neutral-500 cursor-not-allowed"
                  }`}
                  title="Convert mapped columns to Excel"
                >
                  <RotateCw className={`h-4 w-4 ${isConverting ? 'animate-spin' : ''}`} />
                  {isConverting ? 'Converting...' : 'Convert'}
                </Button>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: -10 }}
                animate={{ 
                  opacity: showButtons ? 1 : 0, 
                  scale: showButtons ? 1 : 0.8,
                  y: showButtons ? 0 : -10
                }}
                transition={{ 
                  duration: 0.4, 
                  ease: [0.34, 1.56, 0.64, 1], // Pop-in easing
                  delay: 0.5 // Fifth button
                }}
              >
                <Button
                  variant="default"
                  onClick={() => {
                    if (conversionComplete) {
                      setShowExtractionCompleteDialog(true);
                    } else {
                      setShowExtractionErrorDialog(true);
                    }
                  }}
                  className={`!rounded-2xl gap-2 px-4 py-2 text-sm font-medium shadow ${
                    conversionComplete
                      ? "bg-purple-600 text-white hover:bg-purple-700"
                      : "bg-black text-white hover:bg-neutral-800"
                  }`}
                  title="Open Packing System"
                >
                  <Package className="h-4 w-4" />
                  Packing System
                </Button>
              </motion.div>
            </motion.div>
          </header>

          {/* Statistics Tiles */}
          <section className="mb-6 flex items-start justify-between gap-6">
            <div className="flex-1"></div>
            
            {/* User and Role Information - Right Aligned */}
            <motion.div 
              className="text-right text-sm text-neutral-600 whitespace-nowrap"
              animate={{
                opacity: isScrolled ? 0 : 1,
                y: isScrolled ? -10 : 0
              }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <div 
                className="cursor-pointer hover:text-blue-600 transition-colors inline-block"
                onClick={() => {
                  setEditEmail(userInfo.email || '');
                  setEditRole(userInfo.role || role || '');
                  setShowUserEditModal(true);
                }}
                title="Click to edit email and role"
              >
                <span className="font-medium">User:</span> {user || '-'}
              </div>
              <div>
                <span className="font-medium">Role:</span> {role || '-'}
              </div>
            </motion.div>
          </section>

          {/* Three Column Layout */}
          <div className="flex gap-6">
            {/* Left Column - Column Headers */}
            <div className="flex-1">
              <motion.section 
                className="relative"
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ 
                  opacity: showColumnHeadersTable ? 1 : 0, 
                  scale: showColumnHeadersTable ? 1 : 0.8,
                  y: showColumnHeadersTable ? 0 : 20
                }}
                transition={{ 
                  duration: 0.4, 
                  ease: [0.34, 1.56, 0.64, 1], // Pop-in easing
                  delay: 0
                }}
              >
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-lg font-medium">Column Headers</h2>
                    <span className="text-sm text-neutral-500">
                      ({columnMap.size} columns)
                    </span>
                    {uploadedFile && (
                      <span className="text-xs text-neutral-400 italic">
                        • {uploadedFile.name}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-neutral-500" />
                    <input
                      className="rounded-xl border px-3 py-2 text-sm focus:outline-none w-64"
                      placeholder="Filter columns…"
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                    />
                  </div>
                  {isParsing && <div className="animate-pulse text-sm text-neutral-500">Parsing…</div>}
                </div>

                <div className="rounded-2xl border border-neutral-300 bg-white shadow-sm overflow-hidden h-[600px] flex flex-col">
                  {columns.length === 0 && (
                    <div className="flex h-full w-full items-center justify-center text-sm text-neutral-500">
                      {isParsing ? "Scanning your files…" : "No columns yet. Upload files to get started."}
                    </div>
                  )}
                  
                  {columns.length > 0 && (
                    <div className="overflow-y-auto h-full">
                      <table className="w-full">
                        <thead className="sticky top-0 bg-neutral-50 z-10">
                          <tr className="border-b border-neutral-200">
                            <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Column Name</th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Examples</th>
                          </tr>
                        </thead>
                        <tbody>
                          {columns.map((col) => {
                            // Check if this column has any mappings
                            const columnMapping = mappings.find(m => m.columnName === col.name);
                            const mappingTypes = columnMapping ? (Array.isArray(columnMapping.detectedAs) ? columnMapping.detectedAs : [columnMapping.detectedAs]) : [];
                            
                            // Only check mappings, not auto-detection
                            const hasNPI = mappingTypes.includes('npi');
                            const hasFirstName = mappingTypes.includes('firstName');
                            const hasLastName = mappingTypes.includes('lastName');
                            const hasGender = mappingTypes.includes('gender');
                            const hasProfessionalSuffix = mappingTypes.includes('professionalSuffix');
                            const hasHeadshot = mappingTypes.includes('headshot');
                            const hasAdditionalLanguages = mappingTypes.includes('additionalLanguages');
                            const hasPatientsAccepted = mappingTypes.includes('patientsAccepted');
                            const hasSpecialty = mappingTypes.includes('specialty');
                            const hasPFS = mappingTypes.includes('pfs');
                            const hasLocationId = mappingTypes.includes('locationId');
                            const hasPracticeId = mappingTypes.includes('practiceId');
                            const hasPracticeCloudId = mappingTypes.includes('practiceCloudId');
                            const hasPracticeName = mappingTypes.includes('practiceName');
                            const hasLocationName = mappingTypes.includes('locationName');
                            const hasLocationTypeRaw = mappingTypes.includes('locationTypeRaw');
                            const hasAddressLine1 = mappingTypes.includes('addressLine1');
                            const hasAddressLine2 = mappingTypes.includes('addressLine2');
                            const hasCity = mappingTypes.includes('city');
                            const hasState = mappingTypes.includes('state');
                            const hasZip = mappingTypes.includes('zip');
                            const hasBoardCertifications = mappingTypes.includes('boardCertifications');
                            const hasSubBoardCertification = mappingTypes.includes('subBoardCertification');
                            const hasProfessionalMembership = mappingTypes.includes('professionalMembership');
                            const hasHospitalAffiliations = mappingTypes.includes('hospitalAffiliations');
                            const hasEducation = mappingTypes.includes('education');
                            
                            // Determine border color based on mapping only (priority order)
                            let borderClass = '';
                            if (hasNPI) {
                              borderClass = '!border-l-4 !border-blue-500 bg-blue-50';
                            } else if (hasFirstName) {
                              borderClass = '!border-l-4 !border-green-500 bg-green-50';
                            } else if (hasLastName) {
                              borderClass = '!border-l-4 !border-purple-500 bg-purple-50';
                            } else if (hasGender) {
                              borderClass = '!border-l-4 !border-pink-500 bg-pink-50';
                            } else if (hasProfessionalSuffix) {
                              borderClass = '!border-l-4 !border-orange-500 bg-orange-50';
                            } else if (hasHeadshot) {
                              borderClass = '!border-l-4 !border-cyan-500 bg-cyan-50';
                            } else if (hasAdditionalLanguages) {
                              borderClass = '!border-l-4 !border-indigo-500 bg-indigo-50';
                            } else if (hasPatientsAccepted) {
                              borderClass = '!border-l-4 !border-teal-500 bg-teal-50';
                            } else if (hasSpecialty) {
                              borderClass = '!border-l-4 !border-amber-500 bg-amber-50';
                            } else if (hasLocationId) {
                              borderClass = '!border-l-4 !border-slate-500 bg-slate-50';
                            } else if (hasPracticeId) {
                              borderClass = '!border-l-4 !border-stone-500 bg-stone-50';
                            } else if (hasPracticeCloudId) {
                              borderClass = '!border-l-4 !border-teal-500 bg-teal-50';
                            } else if (hasPracticeName) {
                              borderClass = '!border-l-4 !border-amber-500 bg-amber-50';
                            } else if (hasLocationName) {
                              borderClass = '!border-l-4 !border-orange-500 bg-orange-50';
                            } else if (hasLocationTypeRaw) {
                              borderClass = '!border-l-4 !border-pink-500 bg-pink-50';
                            } else if (hasAddressLine1) {
                              borderClass = '!border-l-4 !border-emerald-500 bg-emerald-50';
                            } else if (hasAddressLine2) {
                              borderClass = '!border-l-4 !border-lime-500 bg-lime-50';
                            } else if (hasCity) {
                              borderClass = '!border-l-4 !border-sky-500 bg-sky-50';
                            } else if (hasState) {
                              borderClass = '!border-l-4 !border-violet-500 bg-violet-50';
                            } else if (hasZip) {
                              borderClass = '!border-l-4 !border-rose-500 bg-rose-50';
                            } else if (hasBoardCertifications) {
                              borderClass = '!border-l-4 !border-yellow-500 bg-yellow-50';
                            } else if (hasSubBoardCertification) {
                              borderClass = '!border-l-4 !border-yellow-600 bg-yellow-50';
                            } else if (hasProfessionalMembership) {
                              borderClass = '!border-l-4 !border-yellow-700 bg-yellow-50';
                            } else if (hasHospitalAffiliations) {
                              borderClass = '!border-l-4 !border-yellow-800 bg-yellow-50';
                            } else if (hasEducation) {
                              borderClass = '!border-l-4 !border-amber-600 bg-amber-50';
                            } else if (mappingTypes.length > 0) {
                              // If there are any other mappings, use a neutral highlight
                              borderClass = '!border-l-4 !border-neutral-400 bg-neutral-50';
                            }
                            
                            return (
                              <tr
                                key={col.name}
                                onClick={(e) => handleColumnClick(e, col.name)}
                                className={`border-b border-neutral-100 hover:bg-neutral-50 transition-colors group cursor-pointer ${borderClass}`}
                              >
                                <td className="py-4 px-4">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-neutral-800">{col.name}</span>
                                    {hasNPI && (
                                      <span className="flex-shrink-0 rounded-full bg-blue-500 px-2 py-0.5 text-xs font-semibold text-white">
                                        NPI
                                      </span>
                                    )}
                                    {hasFirstName && (
                                      <span className="flex-shrink-0 rounded-full bg-green-500 px-2 py-0.5 text-xs font-semibold text-white">
                                        First
                                      </span>
                                    )}
                                    {hasLastName && (
                                      <span className="flex-shrink-0 rounded-full bg-purple-500 px-2 py-0.5 text-xs font-semibold text-white">
                                        Last
                                      </span>
                                    )}
                                    {hasGender && (
                                      <span className="flex-shrink-0 rounded-full bg-pink-500 px-2 py-0.5 text-xs font-semibold text-white">
                                        Gender
                                      </span>
                                    )}
                                    {hasProfessionalSuffix && (
                                      <span className="flex-shrink-0 rounded-full bg-orange-500 px-2 py-0.5 text-xs font-semibold text-white">
                                        Suffix
                                      </span>
                                    )}
                                    {hasHeadshot && (
                                      <span className="flex-shrink-0 rounded-full bg-cyan-500 px-2 py-0.5 text-xs font-semibold text-white">
                                        Headshot
                                      </span>
                                    )}
                                    {hasAdditionalLanguages && (
                                      <span className="flex-shrink-0 rounded-full bg-indigo-500 px-2 py-0.5 text-xs font-semibold text-white">
                                        Languages
                                      </span>
                                    )}
                                    {hasPatientsAccepted && (
                                      <span className="flex-shrink-0 rounded-full bg-teal-500 px-2 py-0.5 text-xs font-semibold text-white">
                                        Patients
                                      </span>
                                    )}
                                    {hasSpecialty && (
                                      <span className="flex-shrink-0 rounded-full bg-amber-500 px-2 py-0.5 text-xs font-semibold text-white">
                                        Specialty
                                      </span>
                                    )}
                                    {hasPFS && (
                                      <span className="flex-shrink-0 rounded-full bg-fuchsia-500 px-2 py-0.5 text-xs font-semibold text-white">
                                        PFS
                                      </span>
                                    )}
                                    {hasLocationId && (
                                      <span className="flex-shrink-0 rounded-full bg-slate-500 px-2 py-0.5 text-xs font-semibold text-white">
                                        Loc ID
                                      </span>
                                    )}
                                    {hasPracticeId && (
                                      <span className="flex-shrink-0 rounded-full bg-stone-500 px-2 py-0.5 text-xs font-semibold text-white">
                                        Practice ID
                                      </span>
                                    )}
                                    {hasPracticeCloudId && (
                                      <span className="flex-shrink-0 rounded-full bg-teal-500 px-2 py-0.5 text-xs font-semibold text-white">
                                        Practice Cloud ID
                                      </span>
                                    )}
                                    {hasPracticeName && (
                                      <span className="flex-shrink-0 rounded-full bg-amber-500 px-2 py-0.5 text-xs font-semibold text-white">
                                        Practice Name
                                      </span>
                                    )}
                                    {hasLocationName && (
                                      <span className="flex-shrink-0 rounded-full bg-orange-500 px-2 py-0.5 text-xs font-semibold text-white">
                                        Location Name
                                      </span>
                                    )}
                                    {hasLocationTypeRaw && (
                                      <span className="flex-shrink-0 rounded-full bg-pink-500 px-2 py-0.5 text-xs font-semibold text-white">
                                        Location Type_Raw
                                      </span>
                                    )}
                                    {hasAddressLine1 && (
                                      <span className="flex-shrink-0 rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-semibold text-white">
                                        Addr 1
                                      </span>
                                    )}
                                    {hasAddressLine2 && (
                                      <span className="flex-shrink-0 rounded-full bg-lime-500 px-2 py-0.5 text-xs font-semibold text-white">
                                        Addr 2
                                      </span>
                                    )}
                                    {hasCity && (
                                      <span className="flex-shrink-0 rounded-full bg-sky-500 px-2 py-0.5 text-xs font-semibold text-white">
                                        City
                                      </span>
                                    )}
                                    {hasState && (
                                      <span className="flex-shrink-0 rounded-full bg-violet-500 px-2 py-0.5 text-xs font-semibold text-white">
                                        State
                                      </span>
                                    )}
                                    {hasZip && (
                                      <span className="flex-shrink-0 rounded-full bg-rose-500 px-2 py-0.5 text-xs font-semibold text-white">
                                        ZIP
                                      </span>
                                    )}
                                    {hasBoardCertifications && (
                                      <span className="flex-shrink-0 rounded-full bg-yellow-500 px-2 py-0.5 text-xs font-semibold text-white">
                                        Board Cert
                                      </span>
                                    )}
                                    {hasSubBoardCertification && (
                                      <span className="flex-shrink-0 rounded-full bg-yellow-600 px-2 py-0.5 text-xs font-semibold text-white">
                                        Sub-Board
                                      </span>
                                    )}
                                    {hasProfessionalMembership && (
                                      <span className="flex-shrink-0 rounded-full bg-yellow-700 px-2 py-0.5 text-xs font-semibold text-white">
                                        Membership
                                      </span>
                                    )}
                                    {hasHospitalAffiliations && (
                                      <span className="flex-shrink-0 rounded-full bg-yellow-800 px-2 py-0.5 text-xs font-semibold text-white">
                                        Hospital
                                      </span>
                                    )}
                                    {hasEducation && (
                                      <span className="flex-shrink-0 rounded-full bg-amber-600 px-2 py-0.5 text-xs font-semibold text-white">
                                        Education
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="py-4 px-4">
                                  <div className="flex flex-wrap gap-2 max-w-lg">
                                    {col.examples.slice(0, 3).map((ex, i) => (
                                      <span key={i} className="text-xs bg-neutral-100 text-neutral-600 rounded px-2 py-1 truncate max-w-[200px]" title={ex}>
                                        {ex}
                                      </span>
                                    ))}
                                    {col.examples.length > 3 && (
                                      <span className="text-xs text-neutral-400">
                                        +{col.examples.length - 3} more
                                      </span>
                                    )}
                                    {col.examples.length === 0 && (
                                      <span className="text-xs text-neutral-400 italic">(no examples)</span>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </motion.section>

              {/* Console Log Tile and Mappings Table */}
              <div className="mt-6 flex gap-6">
                {/* Console Log Tile */}
                <motion.section 
                  className="flex-1"
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ 
                    opacity: showConsoleTable ? 1 : 0, 
                    scale: showConsoleTable ? 1 : 0.8,
                    y: showConsoleTable ? 0 : 20
                  }}
                  transition={{ 
                    duration: 0.4, 
                    ease: [0.34, 1.56, 0.64, 1], // Pop-in easing
                    delay: 0
                  }}
                >
                  {showConsole && (
                    <div className="rounded-2xl border border-neutral-300 bg-white text-neutral-900 shadow-sm overflow-hidden" style={{ height: '250px' }}>
                      <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-200 bg-neutral-50">
                        <h2 className="text-lg font-medium">Console</h2>
                        <button
                          onClick={() => setConsoleLogs([])}
                          className="text-neutral-500 hover:text-neutral-700 transition-colors p-1 rounded hover:bg-neutral-100"
                          title="Clear console"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="h-[calc(250px-48px)] overflow-y-auto p-3 font-mono text-xs bg-white">
                        {consoleLogs.length === 0 ? (
                          <div className="text-neutral-400 italic">No logs yet...</div>
                        ) : (
                          consoleLogs.map((log) => (
                            <div
                              key={log.id}
                              className={`mb-1 flex items-start gap-2 ${
                                log.type === 'error' ? 'text-red-600' :
                                log.type === 'success' ? 'text-green-600' :
                                'text-neutral-700'
                              }`}
                            >
                              <span className="text-neutral-400 shrink-0">[{log.timestamp}]</span>
                              <span className={`shrink-0 font-semibold ${
                                log.type === 'error' ? 'text-red-600' :
                                log.type === 'success' ? 'text-green-600' :
                                'text-blue-600'
                              }`}>
                                {log.type.toUpperCase()}:
                              </span>
                              <span>{log.message}</span>
                            </div>
                          ))
                        )}
                        <div ref={consoleEndRef} />
                      </div>
                    </div>
                  )}
                </motion.section>

                {/* Suggested Table */}
                <motion.section 
                  className="w-[450px] shrink-0"
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ 
                    opacity: showSuggestedTable ? 1 : 0, 
                    scale: showSuggestedTable ? 1 : 0.8,
                    y: showSuggestedTable ? 0 : 20
                  }}
                  transition={{ 
                    duration: 0.4, 
                    ease: [0.34, 1.56, 0.64, 1], // Pop-in easing
                    delay: 0
                  }}
                >
                  <div className="bg-white rounded-2xl border-2 border-neutral-300 shadow-sm p-6 sticky top-8 flex flex-col" style={{ height: '250px' }}>
                    <div className="flex items-center justify-between mb-4 shrink-0">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-semibold">Suggested</h2>
                      {(detectedNPIColumn || detectedFirstNameColumn || detectedLastNameColumn || detectedGenderColumn || detectedProfessionalSuffixColumn || detectedHeadshotColumn || detectedAdditionalLanguagesColumn || detectedStateColumn || detectedPracticeCloudIdColumn || detectedPatientsAcceptedColumn) && (() => {
                        const npiNotMapped = detectedNPIColumn && !mappings.some(m => m.columnName === detectedNPIColumn.name && (Array.isArray(m.detectedAs) ? m.detectedAs.includes('npi') : m.detectedAs === 'npi'));
                        const firstNameNotMapped = detectedFirstNameColumn && !mappings.some(m => m.columnName === detectedFirstNameColumn.name && (Array.isArray(m.detectedAs) ? m.detectedAs.includes('firstName') : m.detectedAs === 'firstName'));
                        const lastNameNotMapped = detectedLastNameColumn && !mappings.some(m => m.columnName === detectedLastNameColumn.name && (Array.isArray(m.detectedAs) ? m.detectedAs.includes('lastName') : m.detectedAs === 'lastName'));
                        const genderNotMapped = detectedGenderColumn && !mappings.some(m => m.columnName === detectedGenderColumn.name && (Array.isArray(m.detectedAs) ? m.detectedAs.includes('gender') : m.detectedAs === 'gender'));
                        const professionalSuffixNotMapped = detectedProfessionalSuffixColumn && !mappings.some(m => m.columnName === detectedProfessionalSuffixColumn.name && (Array.isArray(m.detectedAs) ? m.detectedAs.includes('professionalSuffix') : m.detectedAs === 'professionalSuffix'));
                        const headshotNotMapped = detectedHeadshotColumn && !mappings.some(m => m.columnName === detectedHeadshotColumn.name && (Array.isArray(m.detectedAs) ? m.detectedAs.includes('headshot') : m.detectedAs === 'headshot'));
                        const additionalLanguagesNotMapped = detectedAdditionalLanguagesColumn && !mappings.some(m => m.columnName === detectedAdditionalLanguagesColumn.name && (Array.isArray(m.detectedAs) ? m.detectedAs.includes('additionalLanguages') : m.detectedAs === 'additionalLanguages'));
                        const stateNotMapped = detectedStateColumn && !mappings.some(m => m.columnName === detectedStateColumn.name && (Array.isArray(m.detectedAs) ? m.detectedAs.includes('state') : m.detectedAs === 'state'));
                        const practiceCloudIdNotMapped = detectedPracticeCloudIdColumn && !mappings.some(m => m.columnName === detectedPracticeCloudIdColumn.name && (Array.isArray(m.detectedAs) ? m.detectedAs.includes('practiceCloudId') : m.detectedAs === 'practiceCloudId'));
                        const patientsAcceptedNotMapped = detectedPatientsAcceptedColumn && !mappings.some(m => m.columnName === detectedPatientsAcceptedColumn.name && (Array.isArray(m.detectedAs) ? m.detectedAs.includes('patientsAccepted') : m.detectedAs === 'patientsAccepted'));
                        return (npiNotMapped || firstNameNotMapped || lastNameNotMapped || genderNotMapped || professionalSuffixNotMapped || headshotNotMapped || additionalLanguagesNotMapped || stateNotMapped || practiceCloudIdNotMapped || patientsAcceptedNotMapped) && (
                          <span className="text-xs text-neutral-500 bg-neutral-100 px-2 py-1 rounded-full">
                            {(npiNotMapped ? 1 : 0) + (firstNameNotMapped ? 1 : 0) + (lastNameNotMapped ? 1 : 0) + (genderNotMapped ? 1 : 0) + (professionalSuffixNotMapped ? 1 : 0) + (headshotNotMapped ? 1 : 0) + (additionalLanguagesNotMapped ? 1 : 0) + (stateNotMapped ? 1 : 0) + (practiceCloudIdNotMapped ? 1 : 0) + (patientsAcceptedNotMapped ? 1 : 0)}
                          </span>
                        );
                      })()}
                    </div>
                    {(detectedNPIColumn || detectedFirstNameColumn || detectedLastNameColumn || detectedGenderColumn || detectedProfessionalSuffixColumn || detectedHeadshotColumn || detectedAdditionalLanguagesColumn || detectedStateColumn || detectedPracticeCloudIdColumn || detectedPatientsAcceptedColumn) && (() => {
                      const npiNotMapped = detectedNPIColumn && !mappings.some(m => m.columnName === detectedNPIColumn.name && (Array.isArray(m.detectedAs) ? m.detectedAs.includes('npi') : m.detectedAs === 'npi'));
                      const firstNameNotMapped = detectedFirstNameColumn && !mappings.some(m => m.columnName === detectedFirstNameColumn.name && (Array.isArray(m.detectedAs) ? m.detectedAs.includes('firstName') : m.detectedAs === 'firstName'));
                      const lastNameNotMapped = detectedLastNameColumn && !mappings.some(m => m.columnName === detectedLastNameColumn.name && (Array.isArray(m.detectedAs) ? m.detectedAs.includes('lastName') : m.detectedAs === 'lastName'));
                      const genderNotMapped = detectedGenderColumn && !mappings.some(m => m.columnName === detectedGenderColumn.name && (Array.isArray(m.detectedAs) ? m.detectedAs.includes('gender') : m.detectedAs === 'gender'));
                      const professionalSuffixNotMapped = detectedProfessionalSuffixColumn && !mappings.some(m => m.columnName === detectedProfessionalSuffixColumn.name && (Array.isArray(m.detectedAs) ? m.detectedAs.includes('professionalSuffix') : m.detectedAs === 'professionalSuffix'));
                      const headshotNotMapped = detectedHeadshotColumn && !mappings.some(m => m.columnName === detectedHeadshotColumn.name && (Array.isArray(m.detectedAs) ? m.detectedAs.includes('headshot') : m.detectedAs === 'headshot'));
                      const additionalLanguagesNotMapped = detectedAdditionalLanguagesColumn && !mappings.some(m => m.columnName === detectedAdditionalLanguagesColumn.name && (Array.isArray(m.detectedAs) ? m.detectedAs.includes('additionalLanguages') : m.detectedAs === 'additionalLanguages'));
                      const stateNotMapped = detectedStateColumn && !mappings.some(m => m.columnName === detectedStateColumn.name && (Array.isArray(m.detectedAs) ? m.detectedAs.includes('state') : m.detectedAs === 'state'));
                      const practiceCloudIdNotMapped = detectedPracticeCloudIdColumn && !mappings.some(m => m.columnName === detectedPracticeCloudIdColumn.name && (Array.isArray(m.detectedAs) ? m.detectedAs.includes('practiceCloudId') : m.detectedAs === 'practiceCloudId'));
                      const patientsAcceptedNotMapped = detectedPatientsAcceptedColumn && !mappings.some(m => m.columnName === detectedPatientsAcceptedColumn.name && (Array.isArray(m.detectedAs) ? m.detectedAs.includes('patientsAccepted') : m.detectedAs === 'patientsAccepted'));
                      const hasAnyNotMapped = npiNotMapped || firstNameNotMapped || lastNameNotMapped || genderNotMapped || professionalSuffixNotMapped || headshotNotMapped || additionalLanguagesNotMapped || stateNotMapped || practiceCloudIdNotMapped || patientsAcceptedNotMapped;
                      return hasAnyNotMapped && (
                        <button
                          onClick={() => {
                            // Add all suggested mappings
                            if (npiNotMapped) {
                              saveMapping(detectedNPIColumn.name, 'npi');
                            }
                            if (firstNameNotMapped) {
                              saveMapping(detectedFirstNameColumn.name, 'firstName');
                            }
                            if (lastNameNotMapped) {
                              saveMapping(detectedLastNameColumn.name, 'lastName');
                            }
                            if (genderNotMapped) {
                              saveMapping(detectedGenderColumn.name, 'gender');
                            }
                            if (professionalSuffixNotMapped) {
                              saveMapping(detectedProfessionalSuffixColumn.name, 'professionalSuffix');
                            }
                            if (headshotNotMapped) {
                              saveMapping(detectedHeadshotColumn.name, 'headshot');
                            }
                            if (additionalLanguagesNotMapped) {
                              saveMapping(detectedAdditionalLanguagesColumn.name, 'additionalLanguages');
                            }
                            if (stateNotMapped) {
                              saveMapping(detectedStateColumn.name, 'state');
                            }
                            if (practiceCloudIdNotMapped) {
                              saveMapping(detectedPracticeCloudIdColumn.name, 'practiceCloudId');
                            }
                            if (patientsAcceptedNotMapped) {
                              saveMapping(detectedPatientsAcceptedColumn.name, 'patientsAccepted');
                            }
                            const mappingsData = getMappings();
                            setMappings(mappingsData);
                          }}
                          className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors font-medium"
                          title="Add all suggested mappings"
                        >
                          Add all
                        </button>
                      );
                    })()}
                    </div>

                    <div className="flex-1 overflow-y-auto no-scrollbar min-h-0">
                    {(detectedNPIColumn && !mappings.some(m => m.columnName === detectedNPIColumn.name && (Array.isArray(m.detectedAs) ? m.detectedAs.includes('npi') : m.detectedAs === 'npi'))) ||
                     (detectedFirstNameColumn && !mappings.some(m => m.columnName === detectedFirstNameColumn.name && (Array.isArray(m.detectedAs) ? m.detectedAs.includes('firstName') : m.detectedAs === 'firstName'))) ||
                     (detectedLastNameColumn && !mappings.some(m => m.columnName === detectedLastNameColumn.name && (Array.isArray(m.detectedAs) ? m.detectedAs.includes('lastName') : m.detectedAs === 'lastName'))) ||
                     (detectedGenderColumn && !mappings.some(m => m.columnName === detectedGenderColumn.name && (Array.isArray(m.detectedAs) ? m.detectedAs.includes('gender') : m.detectedAs === 'gender'))) ||
                     (detectedProfessionalSuffixColumn && !mappings.some(m => m.columnName === detectedProfessionalSuffixColumn.name && (Array.isArray(m.detectedAs) ? m.detectedAs.includes('professionalSuffix') : m.detectedAs === 'professionalSuffix'))) ||
                     (detectedHeadshotColumn && !mappings.some(m => m.columnName === detectedHeadshotColumn.name && (Array.isArray(m.detectedAs) ? m.detectedAs.includes('headshot') : m.detectedAs === 'headshot'))) ||
                     (detectedAdditionalLanguagesColumn && !mappings.some(m => m.columnName === detectedAdditionalLanguagesColumn.name && (Array.isArray(m.detectedAs) ? m.detectedAs.includes('additionalLanguages') : m.detectedAs === 'additionalLanguages'))) ||
                     (detectedStateColumn && !mappings.some(m => m.columnName === detectedStateColumn.name && (Array.isArray(m.detectedAs) ? m.detectedAs.includes('state') : m.detectedAs === 'state'))) ||
                     (detectedPracticeCloudIdColumn && !mappings.some(m => m.columnName === detectedPracticeCloudIdColumn.name && (Array.isArray(m.detectedAs) ? m.detectedAs.includes('practiceCloudId') : m.detectedAs === 'practiceCloudId'))) ||
                     (detectedPatientsAcceptedColumn && !mappings.some(m => m.columnName === detectedPatientsAcceptedColumn.name && (Array.isArray(m.detectedAs) ? m.detectedAs.includes('patientsAccepted') : m.detectedAs === 'patientsAccepted'))) ? (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                        <thead>
                          <tr className="border-b border-neutral-200">
                            <th className="text-left py-3 px-2 text-xs font-semibold text-neutral-600">Detected As</th>
                            <th className="text-left py-3 px-2 text-xs font-semibold text-neutral-600">Column Name</th>
                            <th className="w-10"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {detectedNPIColumn && !mappings.some(m => m.columnName === detectedNPIColumn.name && (Array.isArray(m.detectedAs) ? m.detectedAs.includes('npi') : m.detectedAs === 'npi')) && (
                            <tr className={`border-b border-neutral-100 hover:bg-neutral-50 transition-colors group ${
                              animatingItem && animatingItem.columnName === detectedNPIColumn.name ? 'animate-slide-out' : ''
                            }`}>
                              <td className="py-3 px-2 whitespace-nowrap">
                                <span className="text-xs font-medium text-blue-600">NPI Number</span>
                              </td>
                              <td className="py-3 px-2 text-sm whitespace-nowrap">
                                <div className="truncate max-w-[150px]" title={detectedNPIColumn.name}>
                                  {detectedNPIColumn.name}
                                </div>
                              </td>
                              <td className="py-3 px-2">
                                <button
                                  onClick={() => {
                                    setAnimatingItem({ columnName: detectedNPIColumn.name, type: 'npi' });
                                    setTimeout(() => {
                                      const success = saveMapping(detectedNPIColumn.name, 'npi');
                                      if (success) {
                                        const mappingsData = getMappings();
                                        setMappings(mappingsData);
                                      }
                                      setTimeout(() => setAnimatingItem(null), 400);
                                    }, 200);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 text-green-600 hover:text-green-800 transition-opacity text-xs"
                                  title="Add to Mappings"
                                >
                                  + Add
                                </button>
                              </td>
                            </tr>
                          )}
                          {detectedFirstNameColumn && !mappings.some(m => m.columnName === detectedFirstNameColumn.name && (Array.isArray(m.detectedAs) ? m.detectedAs.includes('firstName') : m.detectedAs === 'firstName')) && (
                            <tr className={`border-b border-neutral-100 hover:bg-neutral-50 transition-colors group ${
                              animatingItem && animatingItem.columnName === detectedFirstNameColumn.name ? 'animate-slide-out' : ''
                            }`}>
                              <td className="py-3 px-2 whitespace-nowrap">
                                <span className="text-xs font-medium text-green-600">First Name</span>
                              </td>
                              <td className="py-3 px-2 text-sm whitespace-nowrap">
                                <div className="truncate max-w-[150px]" title={detectedFirstNameColumn.name}>
                                  {detectedFirstNameColumn.name}
                                </div>
                              </td>
                              <td className="py-3 px-2">
                                <button
                                  onClick={() => {
                                    setAnimatingItem({ columnName: detectedFirstNameColumn.name, type: 'firstName' });
                                    setTimeout(() => {
                                      saveMapping(detectedFirstNameColumn.name, 'firstName');
                                      const mappingsData = getMappings();
                                      setMappings(mappingsData);
                                      setTimeout(() => setAnimatingItem(null), 400);
                                    }, 200);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 text-green-600 hover:text-green-800 transition-opacity text-xs"
                                  title="Add to Mappings"
                                >
                                  + Add
                                </button>
                              </td>
                            </tr>
                          )}
                          {detectedLastNameColumn && !mappings.some(m => m.columnName === detectedLastNameColumn.name && (Array.isArray(m.detectedAs) ? m.detectedAs.includes('lastName') : m.detectedAs === 'lastName')) && (
                            <tr className={`border-b border-neutral-100 hover:bg-neutral-50 transition-colors group ${
                              animatingItem && animatingItem.columnName === detectedLastNameColumn.name ? 'animate-slide-out' : ''
                            }`}>
                              <td className="py-3 px-2 whitespace-nowrap">
                                <span className="text-xs font-medium text-purple-600">Last Name</span>
                              </td>
                              <td className="py-3 px-2 text-sm whitespace-nowrap">
                                <div className="truncate max-w-[150px]" title={detectedLastNameColumn.name}>
                                  {detectedLastNameColumn.name}
                                </div>
                              </td>
                              <td className="py-3 px-2">
                                <button
                                  onClick={() => {
                                    setAnimatingItem({ columnName: detectedLastNameColumn.name, type: 'lastName' });
                                    setTimeout(() => {
                                      saveMapping(detectedLastNameColumn.name, 'lastName');
                                      const mappingsData = getMappings();
                                      setMappings(mappingsData);
                                      setTimeout(() => setAnimatingItem(null), 400);
                                    }, 200);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 text-green-600 hover:text-green-800 transition-opacity text-xs"
                                  title="Add to Mappings"
                                >
                                  + Add
                                </button>
                              </td>
                            </tr>
                          )}
                          {detectedGenderColumn && !mappings.some(m => m.columnName === detectedGenderColumn.name && (Array.isArray(m.detectedAs) ? m.detectedAs.includes('gender') : m.detectedAs === 'gender')) && (
                            <tr className={`border-b border-neutral-100 hover:bg-neutral-50 transition-colors group ${
                              animatingItem && animatingItem.columnName === detectedGenderColumn.name ? 'animate-slide-out' : ''
                            }`}>
                              <td className="py-3 px-2 whitespace-nowrap">
                                <span className="text-xs font-medium text-pink-600">Gender</span>
                              </td>
                              <td className="py-3 px-2 text-sm whitespace-nowrap">
                                <div className="truncate max-w-[150px]" title={detectedGenderColumn.name}>
                                  {detectedGenderColumn.name}
                                </div>
                              </td>
                              <td className="py-3 px-2">
                                <button
                                  onClick={() => {
                                    setAnimatingItem({ columnName: detectedGenderColumn.name, type: 'gender' });
                                    setTimeout(() => {
                                      saveMapping(detectedGenderColumn.name, 'gender');
                                      const mappingsData = getMappings();
                                      setMappings(mappingsData);
                                      setTimeout(() => setAnimatingItem(null), 400);
                                    }, 200);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 text-green-600 hover:text-green-800 transition-opacity text-xs"
                                  title="Add to Mappings"
                                >
                                  + Add
                                </button>
                              </td>
                            </tr>
                          )}
                          {detectedProfessionalSuffixColumn && !mappings.some(m => m.columnName === detectedProfessionalSuffixColumn.name && (Array.isArray(m.detectedAs) ? m.detectedAs.includes('professionalSuffix') : m.detectedAs === 'professionalSuffix')) && (
                            <tr className={`border-b border-neutral-100 hover:bg-neutral-50 transition-colors group ${
                              animatingItem && animatingItem.columnName === detectedProfessionalSuffixColumn.name ? 'animate-slide-out' : ''
                            }`}>
                              <td className="py-3 px-2 whitespace-nowrap">
                                <span className="text-xs font-medium text-orange-600">Professional Suffix 1-3</span>
                              </td>
                              <td className="py-3 px-2 text-sm whitespace-nowrap">
                                <div className="truncate max-w-[150px]" title={detectedProfessionalSuffixColumn.name}>
                                  {detectedProfessionalSuffixColumn.name}
                                </div>
                              </td>
                              <td className="py-3 px-2">
                                <button
                                  onClick={() => {
                                    setAnimatingItem({ columnName: detectedProfessionalSuffixColumn.name, type: 'professionalSuffix' });
                                    setTimeout(() => {
                                      saveMapping(detectedProfessionalSuffixColumn.name, 'professionalSuffix');
                                      const mappingsData = getMappings();
                                      setMappings(mappingsData);
                                      setTimeout(() => setAnimatingItem(null), 400);
                                    }, 200);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 text-green-600 hover:text-green-800 transition-opacity text-xs"
                                  title="Add to Mappings"
                                >
                                  + Add
                                </button>
                              </td>
                            </tr>
                          )}
                          {detectedHeadshotColumn && !mappings.some(m => m.columnName === detectedHeadshotColumn.name && (Array.isArray(m.detectedAs) ? m.detectedAs.includes('headshot') : m.detectedAs === 'headshot')) && (
                            <tr className={`border-b border-neutral-100 hover:bg-neutral-50 transition-colors group ${
                              animatingItem && animatingItem.columnName === detectedHeadshotColumn.name ? 'animate-slide-out' : ''
                            }`}>
                              <td className="py-3 px-2 whitespace-nowrap">
                                <span className="text-xs font-medium text-cyan-600">Headshot Link</span>
                              </td>
                              <td className="py-3 px-2 text-sm whitespace-nowrap">
                                <div className="truncate max-w-[150px]" title={detectedHeadshotColumn.name}>
                                  {detectedHeadshotColumn.name}
                                </div>
                              </td>
                              <td className="py-3 px-2">
                                <button
                                  onClick={() => {
                                    setAnimatingItem({ columnName: detectedHeadshotColumn.name, type: 'headshot' });
                                    setTimeout(() => {
                                      saveMapping(detectedHeadshotColumn.name, 'headshot');
                                      const mappingsData = getMappings();
                                      setMappings(mappingsData);
                                      setTimeout(() => setAnimatingItem(null), 400);
                                    }, 200);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 text-green-600 hover:text-green-800 transition-opacity text-xs"
                                  title="Add to Mappings"
                                >
                                  + Add
                                </button>
                              </td>
                            </tr>
                          )}
                          {detectedAdditionalLanguagesColumn && !mappings.some(m => m.columnName === detectedAdditionalLanguagesColumn.name && (Array.isArray(m.detectedAs) ? m.detectedAs.includes('additionalLanguages') : m.detectedAs === 'additionalLanguages')) && (
                            <tr className={`border-b border-neutral-100 hover:bg-neutral-50 transition-colors group ${
                              animatingItem && animatingItem.columnName === detectedAdditionalLanguagesColumn.name ? 'animate-slide-out' : ''
                            }`}>
                              <td className="py-3 px-2 whitespace-nowrap">
                                <span className="text-xs font-medium text-indigo-600">Additional Languages Spoken 1-3</span>
                              </td>
                              <td className="py-3 px-2 text-sm whitespace-nowrap">
                                <div className="truncate max-w-[150px]" title={detectedAdditionalLanguagesColumn.name}>
                                  {detectedAdditionalLanguagesColumn.name}
                                </div>
                              </td>
                              <td className="py-3 px-2">
                                <button
                                  onClick={() => {
                                    setAnimatingItem({ columnName: detectedAdditionalLanguagesColumn.name, type: 'additionalLanguages' });
                                    setTimeout(() => {
                                      saveMapping(detectedAdditionalLanguagesColumn.name, 'additionalLanguages');
                                      const mappingsData = getMappings();
                                      setMappings(mappingsData);
                                      setTimeout(() => setAnimatingItem(null), 400);
                                    }, 200);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 text-green-600 hover:text-green-800 transition-opacity text-xs"
                                  title="Add to Mappings"
                                >
                                  + Add
                                </button>
                              </td>
                            </tr>
                          )}
                          {detectedStateColumn && !mappings.some(m => m.columnName === detectedStateColumn.name && (Array.isArray(m.detectedAs) ? m.detectedAs.includes('state') : m.detectedAs === 'state')) && (
                            <tr className={`border-b border-neutral-100 hover:bg-neutral-50 transition-colors group ${
                              animatingItem && animatingItem.columnName === detectedStateColumn.name ? 'animate-slide-out' : ''
                            }`}>
                              <td className="py-3 px-2 whitespace-nowrap">
                                <span className="text-xs font-medium text-violet-600">State</span>
                              </td>
                              <td className="py-3 px-2 text-sm whitespace-nowrap">
                                <div className="truncate max-w-[150px]" title={detectedStateColumn.name}>
                                  {detectedStateColumn.name}
                                </div>
                              </td>
                              <td className="py-3 px-2">
                                <button
                                  onClick={() => {
                                    setAnimatingItem({ columnName: detectedStateColumn.name, type: 'state' });
                                    setTimeout(() => {
                                      saveMapping(detectedStateColumn.name, 'state');
                                      const mappingsData = getMappings();
                                      setMappings(mappingsData);
                                      setTimeout(() => setAnimatingItem(null), 400);
                                    }, 200);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 text-green-600 hover:text-green-800 transition-opacity text-xs"
                                  title="Add to Mappings"
                                >
                                  + Add
                                </button>
                              </td>
                            </tr>
                          )}
                          {detectedPracticeCloudIdColumn && !mappings.some(m => m.columnName === detectedPracticeCloudIdColumn.name && (Array.isArray(m.detectedAs) ? m.detectedAs.includes('practiceCloudId') : m.detectedAs === 'practiceCloudId')) && (
                            <tr className={`border-b border-neutral-100 hover:bg-neutral-50 transition-colors group ${
                              animatingItem && animatingItem.columnName === detectedPracticeCloudIdColumn.name ? 'animate-slide-out' : ''
                            }`}>
                              <td className="py-3 px-2 whitespace-nowrap">
                                <span className="text-xs font-medium text-teal-600">Practice Cloud ID</span>
                              </td>
                              <td className="py-3 px-2 text-sm whitespace-nowrap">
                                <div className="truncate max-w-[150px]" title={detectedPracticeCloudIdColumn.name}>
                                  {detectedPracticeCloudIdColumn.name}
                                </div>
                              </td>
                              <td className="py-3 px-2">
                                <button
                                  onClick={() => {
                                    setAnimatingItem({ columnName: detectedPracticeCloudIdColumn.name, type: 'practiceCloudId' });
                                    setTimeout(() => {
                                      saveMapping(detectedPracticeCloudIdColumn.name, 'practiceCloudId');
                                      const mappingsData = getMappings();
                                      setMappings(mappingsData);
                                      setTimeout(() => setAnimatingItem(null), 400);
                                    }, 200);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 text-green-600 hover:text-green-800 transition-opacity text-xs"
                                  title="Add to Mappings"
                                >
                                  + Add
                                </button>
                              </td>
                            </tr>
                          )}
                          {detectedPatientsAcceptedColumn && !mappings.some(m => m.columnName === detectedPatientsAcceptedColumn.name && (Array.isArray(m.detectedAs) ? m.detectedAs.includes('patientsAccepted') : m.detectedAs === 'patientsAccepted')) && (
                            <tr className={`border-b border-neutral-100 hover:bg-neutral-50 transition-colors group ${
                              animatingItem && animatingItem.columnName === detectedPatientsAcceptedColumn.name ? 'animate-slide-out' : ''
                            }`}>
                              <td className="py-3 px-2 whitespace-nowrap">
                                <span className="text-xs font-medium text-teal-600">Patients Accepted</span>
                              </td>
                              <td className="py-3 px-2 text-sm whitespace-nowrap">
                                <div className="truncate max-w-[150px]" title={detectedPatientsAcceptedColumn.name}>
                                  {detectedPatientsAcceptedColumn.name}
                                </div>
                              </td>
                              <td className="py-3 px-2">
                                <button
                                  onClick={() => {
                                    setAnimatingItem({ columnName: detectedPatientsAcceptedColumn.name, type: 'patientsAccepted' });
                                    setTimeout(() => {
                                      saveMapping(detectedPatientsAcceptedColumn.name, 'patientsAccepted');
                                      const mappingsData = getMappings();
                                      setMappings(mappingsData);
                                      setTimeout(() => setAnimatingItem(null), 400);
                                    }, 200);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 text-green-600 hover:text-green-800 transition-opacity text-xs"
                                  title="Add to Mappings"
                                >
                                  + Add
                                </button>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-sm text-neutral-500">No suggestions available</p>
                      <p className="text-xs text-neutral-400 mt-2">All detected columns have been mapped</p>
                    </div>
                  )}
                    </div>
                  </div>
                </motion.section>
              </div>
            </div>

            {/* Middle Column - Mappings Table */}
            <motion.div 
              className="w-[450px] shrink-0"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ 
                opacity: showMappingsTable ? 1 : 0, 
                scale: showMappingsTable ? 1 : 0.8,
                y: showMappingsTable ? 0 : 20
              }}
              transition={{ 
                duration: 0.4, 
                ease: [0.34, 1.56, 0.64, 1], // Pop-in easing
                delay: 0
              }}
            >
              <div className="bg-white rounded-2xl border-2 border-neutral-300 shadow-sm p-6 sticky top-8 flex flex-col" style={{ height: '929px' }}>
                <div className="flex items-center justify-between mb-4 shrink-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold">Mappings</h2>
                    {mappings.length > 0 && (
                      <span className="text-xs text-neutral-500 bg-neutral-100 px-2 py-1 rounded-full">
                        {mappings.length}
                      </span>
                    )}
                  </div>
                  {mappings.length > 0 && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          // Clear all mappings from storage
                          const kb = getKnowledgeBase();
                          kb.mappings = [];
                          saveKnowledgeBase(kb);
                          setMappings([]);
                        }}
                        className="text-neutral-500 hover:text-red-600 transition-colors"
                        title="Clear all mappings"
                      >
                        <RotateCw className="h-4 w-4" />
                      </button>
                      <button
                        onClick={handleSaveMappingsToKnowledge}
                        className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        title="Save mappings for future auto-detection"
                      >
                        Save Mappings
                      </button>
                    </div>
                  )}
                </div>

                <div 
                  className="flex-1 overflow-y-auto no-scrollbar min-h-0 relative"
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const mouseY = e.clientY - rect.top;
                    const containerHeight = rect.height;
                    const bottomFifthStart = containerHeight * 0.8; // 80% from top = bottom 20%
                    
                    if (mouseY >= bottomFifthStart) {
                      setIsProviderTableHovered(true);
                    } else {
                      setIsProviderTableHovered(false);
                    }
                  }}
                  onMouseLeave={() => setIsProviderTableHovered(false)}
                >
                  {mappings.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-sm text-neutral-500">No mappings yet</p>
                      <p className="text-xs text-neutral-400 mt-2">Click a column to map it</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                      <thead>
                        <tr className="border-b border-neutral-200">
                          <th className="text-left py-3 px-2 text-xs font-semibold text-neutral-600">Detected As</th>
                          <th className="text-left py-3 px-2 text-xs font-semibold text-neutral-600">Column Name</th>
                          <th className="w-10"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {mappings.map((mapping, index) => (
                          <tr
                            key={index}
                            className={`border-b border-neutral-100 hover:bg-neutral-50 transition-colors group ${
                              animatingItem && animatingItem.columnName === mapping.columnName && animatingItem.type === 'removing' ? 'animate-fade-out' : ''
                            }`}
                          >
                            <td className="py-3 px-2 whitespace-nowrap">
                              <div className="flex gap-1 flex-wrap">
                                {Array.isArray(mapping.detectedAs) ? mapping.detectedAs.map((type, idx) => (
                                  <span key={idx} className="text-xs font-medium">
                                    {idx > 0 && <span className="text-neutral-400">, </span>}
                                    {type === 'npi' && <span className="text-blue-600">NPI Number</span>}
                                    {type === 'firstName' && <span className="text-green-600">First Name</span>}
                                    {type === 'lastName' && <span className="text-purple-600">Last Name</span>}
                                    {type === 'gender' && <span className="text-pink-600">Gender</span>}
                                    {type === 'professionalSuffix' && <span className="text-orange-600">Professional Suffix 1-3</span>}
                                    {type === 'headshot' && <span className="text-cyan-600">Headshot Link</span>}
                                    {type === 'additionalLanguages' && <span className="text-indigo-600">Additional Languages Spoken 1-3</span>}
                                    {type === 'patientsAccepted' && <span className="text-teal-600">Patients Accepted</span>}
                                    {type === 'specialty' && <span className="text-amber-600">Specialty</span>}
                                    {type === 'locationId' && <span className="text-slate-600">Location Monolith ID</span>}
                                    {type === 'practiceId' && <span className="text-stone-600">Practice ID</span>}
                                    {type === 'practiceCloudId' && <span className="text-teal-600">Practice Cloud ID</span>}
                                    {type === 'practiceName' && <span className="text-amber-600">Practice Name</span>}
                                    {type === 'locationName' && <span className="text-orange-600">Location Name</span>}
                                    {type === 'pfs' && <span className="text-fuchsia-600">PFS</span>}
                                    {type === 'addressLine1' && <span className="text-emerald-600">Address Line 1</span>}
                                    {type === 'addressLine2' && <span className="text-lime-600">Address Line 2</span>}
                                    {type === 'city' && <span className="text-sky-600">City</span>}
                                    {type === 'state' && <span className="text-violet-600">State</span>}
                                    {type === 'zip' && <span className="text-rose-600">ZIP</span>}
                                    {type === 'boardCertifications' && <span className="text-yellow-600">Board Certifications</span>}
                                    {type === 'subBoardCertification' && <span className="text-yellow-700">Sub-Board Certification</span>}
                                    {type === 'professionalMembership' && <span className="text-yellow-800">Professional Membership</span>}
                                    {type === 'hospitalAffiliations' && <span className="text-yellow-900">Hospital Affiliations</span>}
                                    {type === 'education' && <span className="text-amber-700">Education</span>}
                                    {!['npi', 'firstName', 'lastName', 'gender', 'professionalSuffix', 'headshot', 'additionalLanguages', 'patientsAccepted', 'specialty', 'locationId', 'locationName', 'practiceId', 'practiceCloudId', 'practiceName', 'pfs', 'addressLine1', 'addressLine2', 'city', 'state', 'zip', 'boardCertifications', 'subBoardCertification', 'professionalMembership', 'hospitalAffiliations', 'education'].includes(type) && <span className="text-neutral-600">{type}</span>}
                                  </span>
                                )) : (
                                  <span className="text-xs font-medium">
                                    {mapping.detectedAs === 'npi' && <span className="text-blue-600">NPI Number</span>}
                                    {mapping.detectedAs === 'firstName' && <span className="text-green-600">First Name</span>}
                                    {mapping.detectedAs === 'lastName' && <span className="text-purple-600">Last Name</span>}
                                    {mapping.detectedAs === 'gender' && <span className="text-pink-600">Gender</span>}
                                    {mapping.detectedAs === 'professionalSuffix' && <span className="text-orange-600">Professional Suffix 1-3</span>}
                                    {mapping.detectedAs === 'headshot' && <span className="text-cyan-600">Headshot Link</span>}
                                    {mapping.detectedAs === 'additionalLanguages' && <span className="text-indigo-600">Additional Languages Spoken 1-3</span>}
                                    {mapping.detectedAs === 'patientsAccepted' && <span className="text-teal-600">Patients Accepted</span>}
                                    {mapping.detectedAs === 'specialty' && <span className="text-amber-600">Specialty</span>}
                                    {mapping.detectedAs === 'locationId' && <span className="text-slate-600">Location Monolith ID</span>}
                                    {mapping.detectedAs === 'practiceId' && <span className="text-stone-600">Practice ID</span>}
                                    {mapping.detectedAs === 'practiceCloudId' && <span className="text-teal-600">Practice Cloud ID</span>}
                                    {mapping.detectedAs === 'practiceName' && <span className="text-amber-600">Practice Name</span>}
                                    {mapping.detectedAs === 'locationName' && <span className="text-orange-600">Location Name</span>}
                                    {mapping.detectedAs === 'pfs' && <span className="text-fuchsia-600">PFS</span>}
                                    {mapping.detectedAs === 'addressLine1' && <span className="text-emerald-600">Address Line 1</span>}
                                    {mapping.detectedAs === 'addressLine2' && <span className="text-lime-600">Address Line 2</span>}
                                    {mapping.detectedAs === 'city' && <span className="text-sky-600">City</span>}
                                    {mapping.detectedAs === 'state' && <span className="text-violet-600">State</span>}
                                    {mapping.detectedAs === 'zip' && <span className="text-rose-600">ZIP</span>}
                                    {mapping.detectedAs === 'boardCertifications' && <span className="text-yellow-600">Board Certifications</span>}
                                    {mapping.detectedAs === 'subBoardCertification' && <span className="text-yellow-700">Sub-Board Certification</span>}
                                    {mapping.detectedAs === 'professionalMembership' && <span className="text-yellow-800">Professional Membership</span>}
                                    {mapping.detectedAs === 'hospitalAffiliations' && <span className="text-yellow-900">Hospital Affiliations</span>}
                                    {mapping.detectedAs === 'education' && <span className="text-amber-700">Education</span>}
                                    {!['npi', 'firstName', 'lastName', 'gender', 'professionalSuffix', 'headshot', 'additionalLanguages', 'patientsAccepted', 'specialty', 'locationId', 'locationName', 'practiceId', 'practiceCloudId', 'practiceName', 'pfs', 'addressLine1', 'addressLine2', 'city', 'state', 'zip', 'boardCertifications', 'subBoardCertification', 'professionalMembership', 'hospitalAffiliations', 'education'].includes(mapping.detectedAs) && <span className="text-neutral-600">{mapping.detectedAs}</span>}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-2 text-sm whitespace-nowrap">
                              <div className="truncate max-w-[150px]" title={mapping.columnName}>
                                {mapping.columnName}
                              </div>
                            </td>
                            <td className="py-3 px-2">
                              <button
                                onClick={() => handleRemoveMapping(mapping.columnName)}
                                className="opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-800 transition-opacity"
                                title="Remove mapping"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      </table>
                    </div>
                  )}
                </div>
                
                {/* Number of Providers Display - Hidden by default, slides up on hover */}
                <div 
                  className={`border-t border-neutral-200 pt-3 shrink-0 mt-4 overflow-hidden transition-all duration-300 ease-in-out ${
                    isProviderTableHovered 
                      ? 'max-h-20 opacity-100 translate-y-0' 
                      : 'max-h-0 opacity-0 -translate-y-4'
                  }`}
                >
                  <div className="text-xs text-neutral-600">
                    <span className="font-medium">Number of Providers:</span>{' '}
                    <span className="font-semibold text-neutral-800">
                      {numberOfProviders !== null ? numberOfProviders : '-'}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Column - Location Table */}
            <motion.div 
              className="w-[450px] shrink-0"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ 
                opacity: showLocationTable ? 1 : 0, 
                scale: showLocationTable ? 1 : 0.8,
                y: showLocationTable ? 0 : 20
              }}
              transition={{ 
                duration: 0.4, 
                ease: [0.34, 1.56, 0.64, 1], // Pop-in easing
                delay: 0
              }}
            >
              <div 
                className="bg-white rounded-2xl border-2 border-neutral-300 shadow-sm p-6 sticky top-8 flex flex-col" 
                style={{ height: '929px' }}
              >
                <div className="flex items-center justify-between mb-4 shrink-0">
                  <h2 className="text-lg font-semibold">Location</h2>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar min-h-0">
                  {(() => {
                    // Filter mappings for location-related columns
                    let locationMappings = mappings.filter(m => {
                      const types = Array.isArray(m.detectedAs) ? m.detectedAs : [m.detectedAs];
                      return types.some(type => 
                        ['addressLine1', 'addressLine2', 'city', 'state', 'zip', 'practiceId', 'practiceCloudId', 'practiceName', 'locationId', 'locationName', 'locationTypeRaw'].includes(type)
                      );
                    });

                    // Sort mappings so Practice ID and Practice Cloud ID appear first
                    locationMappings.sort((a, b) => {
                      const aTypes = Array.isArray(a.detectedAs) ? a.detectedAs : [a.detectedAs];
                      const bTypes = Array.isArray(b.detectedAs) ? b.detectedAs : [b.detectedAs];
                      
                      const aHasPracticeId = aTypes.includes('practiceId') || aTypes.includes('practiceCloudId');
                      const bHasPracticeId = bTypes.includes('practiceId') || bTypes.includes('practiceCloudId');
                      
                      if (aHasPracticeId && !bHasPracticeId) return -1;
                      if (!aHasPracticeId && bHasPracticeId) return 1;
                      return 0;
                    });

                    // Check if Practice ID or Practice Cloud ID is mapped OR manually entered
                    const practiceIdMapped = mappings.some(m => {
                      const types = Array.isArray(m.detectedAs) ? m.detectedAs : [m.detectedAs];
                      return types.includes('practiceId') || types.includes('practiceCloudId');
                    });
                    const hasManualPracticeIds = manualPracticeIds && manualPracticeIds.trim();
                    const practiceIdProvided = practiceIdMapped || hasManualPracticeIds;

                    if (locationMappings.length === 0) {
                      return (
                        <div className="text-center py-8">
                          <p className="text-sm text-neutral-500">No location mappings yet</p>
                          <p className="text-xs text-neutral-400 mt-2">Click a column to map it</p>
                          {!practiceIdProvided && (
                            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                              <p className="text-xs font-medium text-amber-800 mb-1">Practice ID Required</p>
                              <p className="text-xs text-amber-700">
                                Assign a column as "Practice ID" via click OR enter manually below
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    }

                    return (
                      <div className="overflow-x-auto">
                          {!practiceIdProvided && (
                            <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                              <p className="text-xs font-medium text-amber-800 mb-1">⚠️ Practice ID Not Mapped</p>
                              <p className="text-xs text-amber-700">
                                Assign a column as "Practice ID" via click OR enter manually in the bottom section
                              </p>
                            </div>
                          )}
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-neutral-200">
                              <th className="text-left py-3 px-2 text-xs font-semibold text-neutral-600">Detected As</th>
                              <th className="text-left py-3 px-2 text-xs font-semibold text-neutral-600">Column Name</th>
                              <th className="w-10"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {(() => {
                              // Count Location ID mappings to assign numbers
                              const locationIdMappings = locationMappings.filter(m => {
                                const types = Array.isArray(m.detectedAs) ? m.detectedAs : [m.detectedAs];
                                return types.includes('locationId');
                              });
                              
                              let locationIdCounter = 0;
                              
                              return locationMappings.map((mapping, index) => {
                                const mappingTypes = Array.isArray(mapping.detectedAs) ? mapping.detectedAs : [mapping.detectedAs];
                                const hasLocationId = mappingTypes.includes('locationId');
                                
                                // Increment counter for Location ID
                                if (hasLocationId) {
                                  locationIdCounter++;
                                }
                                
                                return (
                                  <tr
                                    key={index}
                                    className={`border-b border-neutral-100 hover:bg-neutral-50 transition-colors group ${
                                      animatingItem && animatingItem.columnName === mapping.columnName && animatingItem.type === 'removing' ? 'animate-fade-out' : ''
                                    }`}
                                  >
                                    <td className="py-3 px-2 whitespace-nowrap">
                                      <div className="flex gap-1 flex-wrap">
                                        {Array.isArray(mapping.detectedAs) ? mapping.detectedAs.map((type, idx) => {
                                          // Only show location-related types (PFS is NOT location-related)
                                          if (!['addressLine1', 'addressLine2', 'city', 'state', 'zip', 'practiceId', 'practiceCloudId', 'practiceName', 'locationId', 'locationName', 'locationTypeRaw'].includes(type)) {
                                            return null;
                                          }
                                          return (
                                            <span key={idx} className="text-xs font-medium">
                                              {idx > 0 && <span className="text-neutral-400">, </span>}
                                              {type === 'addressLine1' && <span className="text-emerald-600">Address Line 1</span>}
                                              {type === 'addressLine2' && <span className="text-lime-600">Address Line 2</span>}
                                              {type === 'city' && <span className="text-sky-600">City</span>}
                                              {type === 'state' && <span className="text-violet-600">State</span>}
                                              {type === 'zip' && <span className="text-rose-600">ZIP</span>}
                                              {type === 'practiceId' && <span className="text-stone-600">Practice ID</span>}
                                              {type === 'practiceCloudId' && <span className="text-teal-600">Practice Cloud ID</span>}
                                              {type === 'practiceName' && <span className="text-amber-600">Practice Name</span>}
                                              {type === 'locationId' && (
                                                <span className="text-slate-600">Location Monolith ID {locationIdCounter}</span>
                                              )}
                                              {type === 'locationName' && <span className="text-orange-600">Location Name</span>}
                                              {type === 'locationTypeRaw' && <span className="text-pink-600">Location Type_Raw</span>}
                                            </span>
                                          );
                                        }) : (
                                          (() => {
                                            const type = mapping.detectedAs;
                                            // Only show location-related types (PFS is NOT location-related)
                                            if (!['addressLine1', 'addressLine2', 'city', 'state', 'zip', 'practiceId', 'practiceCloudId', 'practiceName', 'locationId', 'locationName', 'locationTypeRaw'].includes(type)) {
                                              return null;
                                            }
                                            const isLocationId = type === 'locationId';
                                            const locationIdNumber = isLocationId ? locationIdCounter : null;
                                            return (
                                              <span className="text-xs font-medium">
                                                {type === 'addressLine1' && <span className="text-emerald-600">Address Line 1</span>}
                                                {type === 'addressLine2' && <span className="text-lime-600">Address Line 2</span>}
                                                {type === 'city' && <span className="text-sky-600">City</span>}
                                                {type === 'state' && <span className="text-violet-600">State</span>}
                                                {type === 'zip' && <span className="text-rose-600">ZIP</span>}
                                                {type === 'practiceId' && <span className="text-stone-600">Practice ID</span>}
                                                {type === 'practiceCloudId' && <span className="text-teal-600">Practice Cloud ID</span>}
                                                {type === 'practiceName' && <span className="text-amber-600">Practice Name</span>}
                                                {type === 'locationId' && (
                                                  <span className="text-slate-600">Location Monolith ID {locationIdNumber}</span>
                                                )}
                                                {type === 'locationName' && <span className="text-orange-600">Location Name</span>}
                                                {type === 'locationTypeRaw' && <span className="text-pink-600">Location Type_Raw</span>}
                                              </span>
                                            );
                                          })()
                                        )}
                                      </div>
                                    </td>
                                    <td className="py-3 px-2 text-sm whitespace-nowrap">
                                      <div className="truncate max-w-[150px]" title={mapping.columnName}>
                                        {mapping.columnName}
                                      </div>
                                    </td>
                                    <td className="py-3 px-2">
                                      <button
                                        onClick={() => handleRemoveMapping(mapping.columnName)}
                                        className="opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-800 transition-opacity"
                                        title="Remove mapping"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </td>
                                  </tr>
                                );
                              });
                            })()}
                          </tbody>
                        </table>
                      </div>
                    );
                  })()}
                </div>
                
                {/* Practice ID Section - Always visible at bottom */}
                <div 
                  className="border-t border-neutral-200 bg-neutral-50 p-4 shrink-0"
                  onMouseEnter={() => setIsLocationTableHovered(true)}
                  onMouseLeave={() => setIsLocationTableHovered(false)}
                >
                  <h3 className="text-xs font-semibold text-neutral-700 mb-3">Practice ID</h3>
                  {(() => {
                    // Find Practice ID or Practice Cloud ID mapping
                    const practiceIdMapping = mappings.find(m => {
                      const types = Array.isArray(m.detectedAs) ? m.detectedAs : [m.detectedAs];
                      return types.includes('practiceId');
                    });
                    
                    const practiceCloudIdMapping = mappings.find(m => {
                      const types = Array.isArray(m.detectedAs) ? m.detectedAs : [m.detectedAs];
                      return types.includes('practiceCloudId');
                    });

                    if (practiceIdMapping || practiceCloudIdMapping) {
                      // Show mapped column(s)
                      return (
                        <div className="space-y-2">
                          {practiceIdMapping && (
                            <div className="bg-white border-2 border-stone-300 rounded-lg p-2">
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="text-xs text-neutral-500 block mb-0.5">Practice ID mapped to:</span>
                                  <span className="text-xs font-medium text-stone-700">{practiceIdMapping.columnName}</span>
                                </div>
                                <button
                                  onClick={() => handleRemoveMapping(practiceIdMapping.columnName)}
                                  className="text-red-600 hover:text-red-800 transition-colors"
                                  title="Remove mapping"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          )}
                          {practiceCloudIdMapping && (
                            <div className="bg-white border-2 border-teal-300 rounded-lg p-2">
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="text-xs text-neutral-500 block mb-0.5">Practice Cloud ID mapped to:</span>
                                  <span className="text-xs font-medium text-teal-700">{practiceCloudIdMapping.columnName}</span>
                                </div>
                                <button
                                  onClick={() => handleRemoveMapping(practiceCloudIdMapping.columnName)}
                                  className="text-red-600 hover:text-red-800 transition-colors"
                                  title="Remove mapping"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    } else {
                      // Show manual entry input
                      return (
                        <div>
                          <input
                            type="text"
                            value={manualPracticeIds}
                            onChange={(e) => setManualPracticeIds(e.target.value)}
                            placeholder="Enter Practice IDs or Practice Cloud IDs (separated by comma, semicolon, or space)"
                            className="w-full px-2 py-1.5 border-2 border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-transparent text-xs"
                          />
                          <p className="text-xs text-neutral-500 mt-1">
                            Enter multiple Practice IDs or Practice Cloud IDs separated by comma (,), semicolon (;), or space
                          </p>
                        </div>
                      );
                    }
                  })()}
                  
                  {/* Practice Name Tile */}
                  <div className="mt-4 rounded-lg border bg-white p-3 shadow-sm">
                    <div className="text-xs font-medium text-neutral-600 mb-2">Practice Name</div>
                    {(() => {
                      // Helper function to extract all practice names
                      const getAllPracticeNames = (practiceInfoData) => {
                        if (!practiceInfoData || !practiceInfoData.practice_names) return [];
                        return Object.values(practiceInfoData.practice_names).filter(name => name);
                      };

                      // Get Practice IDs from mappings and manual entry
                      const practiceIdMapping = mappings.find(m => {
                        const types = Array.isArray(m.detectedAs) ? m.detectedAs : [m.detectedAs];
                        return types.includes('practiceId');
                      });
                      
                      const practiceCloudIdMapping = mappings.find(m => {
                        const types = Array.isArray(m.detectedAs) ? m.detectedAs : [m.detectedAs];
                        return types.includes('practiceCloudId');
                      });
                      
                      const hasManualIds = manualPracticeIds && manualPracticeIds.trim();
                      
                      // Determine which practice info to use
                      let currentPracticeInfo = null;
                      let allPracticeNames = [];
                      let hasMultiplePractices = false;
                      
                      if (practiceIdMapping || practiceCloudIdMapping) {
                        currentPracticeInfo = mappedColumnPracticeInfo;
                      } else if (hasManualIds) {
                        currentPracticeInfo = practiceInfo;
                      }
                      
                      if (currentPracticeInfo && currentPracticeInfo.practice_names) {
                        allPracticeNames = getAllPracticeNames(currentPracticeInfo);
                        hasMultiplePractices = allPracticeNames.length > 2;
                      }
                      
                      if (practiceIdMapping || practiceCloudIdMapping) {
                        // Show loading spinner for mapped column
                        if (isLoadingMappedColumnPracticeInfo) {
                          return (
                            <div className="flex items-center gap-2 text-xs text-neutral-500">
                              <RefreshCw className="h-3 w-3 animate-spin" />
                              <span className="italic">Loading practice info...</span>
                            </div>
                          );
                        }
                        
                        // Show practice names from mapped column
                        if (mappedColumnPracticeInfo && mappedColumnPracticeInfo.api_success && mappedColumnPracticeInfo.display_text) {
                          return (
                            <div 
                              className={`text-xs text-neutral-600 ${hasMultiplePractices ? 'cursor-pointer hover:text-blue-600 transition-colors' : ''}`}
                              onClick={hasMultiplePractices ? () => setShowPracticeListModal(true) : undefined}
                              title={hasMultiplePractices ? 'Click to view all practices' : ''}
                            >
                              {mappedColumnPracticeInfo.display_text}
                            </div>
                          );
                        }
                        
                        // Fallback: show mapped column name if API hasn't loaded yet or failed
                        const mappedColumns = [];
                        if (practiceIdMapping) mappedColumns.push(`Practice ID: ${practiceIdMapping.columnName}`);
                        if (practiceCloudIdMapping) mappedColumns.push(`Practice Cloud ID: ${practiceCloudIdMapping.columnName}`);
                        
                        return (
                          <div className="text-xs text-neutral-600">
                            {mappedColumns.join(', ')}
                          </div>
                        );
                      } else if (hasManualIds) {
                        // Show loading spinner for minimum 2 seconds
                        if (isLoadingPracticeInfo) {
                          return (
                            <div className="flex items-center gap-2 text-xs text-neutral-500">
                              <RefreshCw className="h-3 w-3 animate-spin" />
                              <span className="italic">Loading practice info...</span>
                            </div>
                          );
                        }
                        
                        // Only show result after loading is complete
                        if (practiceInfo && practiceInfo.api_success && practiceInfo.display_text) {
                          // Show API response (practice name)
                          return (
                            <div 
                              className={`text-xs text-neutral-600 ${hasMultiplePractices ? 'cursor-pointer hover:text-blue-600 transition-colors' : ''}`}
                              onClick={hasMultiplePractices ? () => setShowPracticeListModal(true) : undefined}
                              title={hasMultiplePractices ? 'Click to view all practices' : ''}
                            >
                              {practiceInfo.display_text}
                            </div>
                          );
                        }
                        // Don't show fallback text - wait for API result or show nothing
                        return (
                          <div className="text-xs text-neutral-400 italic">Enter Practice IDs above to see practice names</div>
                        );
                      } else {
                        // Default message
                        return (
                          <div className="text-xs text-neutral-400 italic">Enter Practice IDs above to see practice names</div>
                        );
                      }
                    })()}
                  </div>
                  
                  {/* Case Number Display and Info Button */}
                  <div className="border-t border-neutral-200 pt-3 shrink-0 mt-4">
                    <div className="flex items-center justify-between">
                  {/* Case Number Display - Hidden by default, slides up on hover */}
                  <div 
                        className={`text-xs text-neutral-600 overflow-hidden transition-all duration-300 ease-in-out ${
                      isLocationTableHovered 
                        ? 'max-h-20 opacity-100 translate-y-0' 
                        : 'max-h-0 opacity-0 -translate-y-4'
                    }`}
                  >
                      <span className="font-medium">Case:</span>{' '}
                      <span className={`font-semibold transition-all text-neutral-800`}>
                        {locationCase !== null ? locationCase : '-'}
                      </span>
                    </div>
                      {/* Info Button - Always visible */}
                      <motion.button
                        onClick={() => setShowLocationCasesModal(true)}
                        className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors text-neutral-500 hover:text-neutral-700"
                        title="View Location Matching Cases"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Info className="h-4 w-4" />
                      </motion.button>
                  </div>
                </div>
              </div>
            </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Knowledge Base Viewer Panel */}
      {(() => {
        const totalCount = 
          (storedColumns.npiColumns?.length || 0) +
          (storedColumns.firstNameColumns?.length || 0) +
          (storedColumns.lastNameColumns?.length || 0) +
          (storedColumns.genderColumns?.length || 0) +
          (storedColumns.professionalSuffixColumns?.length || 0) +
          (storedColumns.headshotColumns?.length || 0) +
          (storedColumns.additionalLanguagesColumns?.length || 0) +
          (storedColumns.stateColumns?.length || 0) +
          (storedColumns.cityColumns?.length || 0) +
          (storedColumns.zipColumns?.length || 0) +
          (storedColumns.addressLine1Columns?.length || 0) +
          (storedColumns.addressLine2Columns?.length || 0) +
          (storedColumns.practiceIdColumns?.length || 0) +
          (storedColumns.practiceCloudIdColumns?.length || 0) +
          (storedColumns.locationIdColumns?.length || 0) +
          (storedColumns.practiceNameColumns?.length || 0) +
          (storedColumns.locationNameColumns?.length || 0) +
          (storedColumns.locationTypeRawColumns?.length || 0) +
          (storedColumns.pfsColumns?.length || 0) +
          (storedColumns.patientsAcceptedColumns?.length || 0) +
          (storedColumns.specialtyColumns?.length || 0) +
          (storedColumns.nameColumns?.length || 0);
        return totalCount > 0;
      })() && (
            <div className="fixed bottom-4 right-4 z-50">
              {showKnowledgeBase ? (
                <div className={`bg-white rounded-2xl border shadow-2xl w-80 max-h-[500px] overflow-hidden flex flex-col ${
                  isKnowledgeBaseAnimating ? 'smart-learning-collapse' : 'smart-learning-expand'
                }`}>
                  <div className="flex items-center justify-between p-4 border-b bg-neutral-50">
                    <div className="flex items-center gap-2">
                      <Database className="h-5 w-5 text-neutral-600" />
                      <h3 className="font-semibold text-sm">Smart Learning</h3>
                      <span className="text-xs text-neutral-500 bg-white px-2 py-0.5 rounded-full">
                        {(() => {
                          return (storedColumns.npiColumns?.length || 0) +
                            (storedColumns.firstNameColumns?.length || 0) +
                            (storedColumns.lastNameColumns?.length || 0) +
                            (storedColumns.genderColumns?.length || 0) +
                            (storedColumns.professionalSuffixColumns?.length || 0) +
                            (storedColumns.headshotColumns?.length || 0) +
                            (storedColumns.additionalLanguagesColumns?.length || 0) +
                            (storedColumns.stateColumns?.length || 0) +
                            (storedColumns.cityColumns?.length || 0) +
                            (storedColumns.zipColumns?.length || 0) +
                            (storedColumns.addressLine1Columns?.length || 0) +
                            (storedColumns.addressLine2Columns?.length || 0) +
                            (storedColumns.practiceIdColumns?.length || 0) +
                            (storedColumns.practiceCloudIdColumns?.length || 0) +
                            (storedColumns.locationIdColumns?.length || 0) +
                            (storedColumns.practiceNameColumns?.length || 0) +
                            (storedColumns.locationNameColumns?.length || 0) +
                            (storedColumns.locationTypeRawColumns?.length || 0) +
                            (storedColumns.pfsColumns?.length || 0) +
                            (storedColumns.patientsAcceptedColumns?.length || 0) +
                            (storedColumns.specialtyColumns?.length || 0) +
                            (storedColumns.nameColumns?.length || 0);
                        })()}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setIsKnowledgeBaseAnimating(true);
                        setTimeout(() => {
                          setShowKnowledgeBase(false);
                          setIsKnowledgeBaseAnimating(false);
                        }, 300);
                      }}
                      className="text-neutral-400 hover:text-neutral-600 transition-colors"
                    >
                      <EyeOff className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="p-4 overflow-y-auto">
                    {/* NPI Columns */}
                    {renderColumnSection(
                      storedColumns.npiColumns,
                      'NPI COLUMNS',
                      'bg-blue-500',
                      'bg-blue-50',
                      'text-blue-700',
                      'border-blue-500',
                      'hover:bg-blue-300',
                      'hover:text-blue-800',
                      'npiColumns',
                      'bg-blue-200',
                      'text-blue-900'
                    )}

                    {/* First Name Columns */}
                    {renderColumnSection(
                      storedColumns.firstNameColumns,
                      'FIRST NAME COLUMNS',
                      'bg-green-500',
                      'bg-green-50',
                      'text-green-700',
                      'border-green-500',
                      'hover:bg-green-300',
                      'hover:text-green-800',
                      'firstNameColumns',
                      'bg-green-200',
                      'text-green-900'
                    )}

                    {/* Last Name Columns */}
                    {renderColumnSection(
                      storedColumns.lastNameColumns,
                      'LAST NAME COLUMNS',
                      'bg-purple-500',
                      'bg-purple-50',
                      'text-purple-700',
                      'border-purple-500',
                      'hover:bg-purple-300',
                      'hover:text-purple-800',
                      'lastNameColumns',
                      'bg-purple-200',
                      'text-purple-900'
                    )}

                    {/* Gender Columns */}
                    {renderColumnSection(
                      storedColumns.genderColumns,
                      'GENDER COLUMNS',
                      'bg-pink-500',
                      'bg-pink-50',
                      'text-pink-700',
                      'border-pink-500',
                      'hover:bg-pink-300',
                      'hover:text-pink-800',
                      'genderColumns',
                      'bg-pink-200',
                      'text-pink-900'
                    )}

                    {/* Professional Suffix Columns */}
                    {renderColumnSection(
                      storedColumns.professionalSuffixColumns,
                      'PROFESSIONAL SUFFIX COLUMNS',
                      'bg-orange-500',
                      'bg-orange-50',
                      'text-orange-700',
                      'border-orange-500',
                      'hover:bg-orange-300',
                      'hover:text-orange-800',
                      'professionalSuffixColumns',
                      'bg-orange-200',
                      'text-orange-900'
                    )}

                    {/* Headshot Columns */}
                    {renderColumnSection(
                      storedColumns.headshotColumns,
                      'HEADSHOT COLUMNS',
                      'bg-cyan-500',
                      'bg-cyan-50',
                      'text-cyan-700',
                      'border-cyan-500',
                      'hover:bg-cyan-300',
                      'hover:text-cyan-800',
                      'headshotColumns',
                      'bg-cyan-200',
                      'text-cyan-900'
                    )}

                    {/* Additional Languages Columns */}
                    {renderColumnSection(
                      storedColumns.additionalLanguagesColumns,
                      'ADDITIONAL LANGUAGES COLUMNS',
                      'bg-indigo-500',
                      'bg-indigo-50',
                      'text-indigo-700',
                      'border-indigo-500',
                      'hover:bg-indigo-300',
                      'hover:text-indigo-800',
                      'additionalLanguagesColumns',
                      'bg-indigo-200',
                      'text-indigo-900'
                    )}

                    {/* State Columns */}
                    {renderColumnSection(
                      storedColumns.stateColumns,
                      'STATE COLUMNS',
                      'bg-teal-500',
                      'bg-teal-50',
                      'text-teal-700',
                      'border-teal-500',
                      'hover:bg-teal-300',
                      'hover:text-teal-800',
                      'stateColumns',
                      'bg-teal-200',
                      'text-teal-900'
                    )}

                    {/* City Columns */}
                    {renderColumnSection(
                      storedColumns.cityColumns,
                      'CITY COLUMNS',
                      'bg-emerald-500',
                      'bg-emerald-50',
                      'text-emerald-700',
                      'border-emerald-500',
                      'hover:bg-emerald-300',
                      'hover:text-emerald-800',
                      'cityColumns',
                      'bg-emerald-200',
                      'text-emerald-900'
                    )}

                    {/* Zip Columns */}
                    {renderColumnSection(
                      storedColumns.zipColumns,
                      'ZIP COLUMNS',
                      'bg-lime-500',
                      'bg-lime-50',
                      'text-lime-700',
                      'border-lime-500',
                      'hover:bg-lime-300',
                      'hover:text-lime-800',
                      'zipColumns',
                      'bg-lime-200',
                      'text-lime-900'
                    )}

                    {/* Address Line 1 Columns */}
                    {renderColumnSection(
                      storedColumns.addressLine1Columns,
                      'ADDRESS LINE 1 COLUMNS',
                      'bg-amber-500',
                      'bg-amber-50',
                      'text-amber-700',
                      'border-amber-500',
                      'hover:bg-amber-300',
                      'hover:text-amber-800',
                      'addressLine1Columns',
                      'bg-amber-200',
                      'text-amber-900'
                    )}

                    {/* Address Line 2 Columns */}
                    {renderColumnSection(
                      storedColumns.addressLine2Columns,
                      'ADDRESS LINE 2 COLUMNS',
                      'bg-yellow-500',
                      'bg-yellow-50',
                      'text-yellow-700',
                      'border-yellow-500',
                      'hover:bg-yellow-300',
                      'hover:text-yellow-800',
                      'addressLine2Columns',
                      'bg-yellow-200',
                      'text-yellow-900'
                    )}

                    {/* Practice ID Columns */}
                    {renderColumnSection(
                      storedColumns.practiceIdColumns,
                      'PRACTICE ID COLUMNS',
                      'bg-red-500',
                      'bg-red-50',
                      'text-red-700',
                      'border-red-500',
                      'hover:bg-red-300',
                      'hover:text-red-800',
                      'practiceIdColumns',
                      'bg-red-200',
                      'text-red-900'
                    )}

                    {/* Practice Cloud ID Columns */}
                    {renderColumnSection(
                      storedColumns.practiceCloudIdColumns,
                      'PRACTICE CLOUD ID COLUMNS',
                      'bg-rose-500',
                      'bg-rose-50',
                      'text-rose-700',
                      'border-rose-500',
                      'hover:bg-rose-300',
                      'hover:text-rose-800',
                      'practiceCloudIdColumns',
                      'bg-rose-200',
                      'text-rose-900'
                    )}

                    {/* Location ID Columns */}
                    {renderColumnSection(
                      storedColumns.locationIdColumns,
                      'LOCATION ID COLUMNS',
                      'bg-fuchsia-500',
                      'bg-fuchsia-50',
                      'text-fuchsia-700',
                      'border-fuchsia-500',
                      'hover:bg-fuchsia-300',
                      'hover:text-fuchsia-800',
                      'locationIdColumns',
                      'bg-fuchsia-200',
                      'text-fuchsia-900'
                    )}

                    {/* Practice Name Columns */}
                    {renderColumnSection(
                      storedColumns.practiceNameColumns,
                      'PRACTICE NAME COLUMNS',
                      'bg-violet-500',
                      'bg-violet-50',
                      'text-violet-700',
                      'border-violet-500',
                      'hover:bg-violet-300',
                      'hover:text-violet-800',
                      'practiceNameColumns',
                      'bg-violet-200',
                      'text-violet-900'
                    )}

                    {/* Location Name Columns */}
                    {renderColumnSection(
                      storedColumns.locationNameColumns,
                      'LOCATION NAME COLUMNS',
                      'bg-slate-500',
                      'bg-slate-50',
                      'text-slate-700',
                      'border-slate-500',
                      'hover:bg-slate-300',
                      'hover:text-slate-800',
                      'locationNameColumns',
                      'bg-slate-200',
                      'text-slate-900'
                    )}

                    {/* Location Type Raw Columns */}
                    {renderColumnSection(
                      storedColumns.locationTypeRawColumns,
                      'LOCATION TYPE RAW COLUMNS',
                      'bg-stone-500',
                      'bg-stone-50',
                      'text-stone-700',
                      'border-stone-500',
                      'hover:bg-stone-300',
                      'hover:text-stone-800',
                      'locationTypeRawColumns',
                      'bg-stone-200',
                      'text-stone-900'
                    )}

                    {/* PFS Columns */}
                    {renderColumnSection(
                      storedColumns.pfsColumns,
                      'PFS COLUMNS',
                      'bg-neutral-500',
                      'bg-neutral-50',
                      'text-neutral-700',
                      'border-neutral-500',
                      'hover:bg-neutral-300',
                      'hover:text-neutral-800',
                      'pfsColumns',
                      'bg-neutral-200',
                      'text-neutral-900'
                    )}

                    {/* Patients Accepted Columns */}
                    {renderColumnSection(
                      storedColumns.patientsAcceptedColumns,
                      'PATIENTS ACCEPTED COLUMNS',
                      'bg-sky-500',
                      'bg-sky-50',
                      'text-sky-700',
                      'border-sky-500',
                      'hover:bg-sky-300',
                      'hover:text-sky-800',
                      'patientsAcceptedColumns',
                      'bg-sky-200',
                      'text-sky-900'
                    )}

                    {/* Specialty Columns */}
                    {renderColumnSection(
                      storedColumns.specialtyColumns,
                      'SPECIALTY COLUMNS',
                      'bg-blue-600',
                      'bg-blue-50',
                      'text-blue-700',
                      'border-blue-600',
                      'hover:bg-blue-300',
                      'hover:text-blue-800',
                      'specialtyColumns',
                      'bg-blue-200',
                      'text-blue-900'
                    )}

                    {/* Name Columns (generic) */}
                    {renderColumnSection(
                      storedColumns.nameColumns,
                      'NAME COLUMNS',
                      'bg-green-600',
                      'bg-green-50',
                      'text-green-700',
                      'border-green-600',
                      'hover:bg-green-300',
                      'hover:text-green-800',
                      'nameColumns',
                      'bg-green-200',
                      'text-green-900'
                    )}

                  </div>

                  <div className="border-t p-3 bg-neutral-50 flex items-center justify-center">
                    <button
                      onClick={() => clearKnowledgeBaseData()}
                      className="text-xs text-red-600 hover:text-red-800 font-medium"
                    >
                      Clear All
                    </button>
                  </div>
                </div>
              ) : (
                <motion.button
                  onClick={() => {
                    setShowKnowledgeBase(true);
                    setIsKnowledgeBaseAnimating(false);
                  }}
                  className="bg-white border-2 border-neutral-200 rounded-2xl px-4 py-3 shadow-lg hover:shadow-xl transition-shadow flex items-center gap-2 text-sm font-medium text-neutral-700 hover:text-neutral-900"
                  initial={{ opacity: 0, scale: 0.8, y: -10 }}
                  animate={{ 
                    opacity: showSmartLearning ? 1 : 0, 
                    scale: showSmartLearning ? 1 : 0.8,
                    y: showSmartLearning ? 0 : -10
                  }}
                  transition={{ 
                    duration: 0.4, 
                    ease: [0.34, 1.56, 0.64, 1], // Pop-in easing
                    delay: 0.1
                  }}
                >
                    <Database className="h-5 w-5 text-blue-600" />
                    <span>View Smart Learning ({(() => {
                      return (storedColumns.npiColumns?.length || 0) +
                        (storedColumns.firstNameColumns?.length || 0) +
                        (storedColumns.lastNameColumns?.length || 0) +
                        (storedColumns.genderColumns?.length || 0) +
                        (storedColumns.professionalSuffixColumns?.length || 0) +
                        (storedColumns.headshotColumns?.length || 0) +
                        (storedColumns.additionalLanguagesColumns?.length || 0) +
                        (storedColumns.stateColumns?.length || 0) +
                        (storedColumns.cityColumns?.length || 0) +
                        (storedColumns.zipColumns?.length || 0) +
                        (storedColumns.addressLine1Columns?.length || 0) +
                        (storedColumns.addressLine2Columns?.length || 0) +
                        (storedColumns.practiceIdColumns?.length || 0) +
                        (storedColumns.practiceCloudIdColumns?.length || 0) +
                        (storedColumns.locationIdColumns?.length || 0) +
                        (storedColumns.practiceNameColumns?.length || 0) +
                        (storedColumns.locationNameColumns?.length || 0) +
                        (storedColumns.locationTypeRawColumns?.length || 0) +
                        (storedColumns.pfsColumns?.length || 0) +
                        (storedColumns.patientsAcceptedColumns?.length || 0) +
                        (storedColumns.specialtyColumns?.length || 0) +
                        (storedColumns.nameColumns?.length || 0);
                    })()})</span>
                </motion.button>
              )}
            </div>
          )}

      {/* Context Menu */}
      <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            onClose={handleCloseContextMenu}
            onSelect={handleMappingSelect}
            isVisible={contextMenu.visible}
            columnName={contextMenu.columnName}
            currentMappings={mappings}
          />



      {/* Timer (shown above breadcrumb after 3 seconds) */}
      {showTimer && (
            <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40">
              <div className={`rounded-full shadow-lg py-2 px-4 flex items-center gap-2 ${
                isConverting ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'
              }`}>
                {!isConverting && (
                  <Check className="h-4 w-4" />
                )}
                <span className="text-sm font-medium">{formatTimer(conversionTimer)}</span>
              </div>
            </div>
          )}

      {/* Breadcrumb Navigation */}
      <motion.div 
        className="fixed bottom-8 left-1/2 z-40"
        initial={{ opacity: 0, scale: 0.8, y: 20, x: '-50%' }}
        animate={{ 
          opacity: showBreadcrumb ? 1 : 0, 
          scale: showBreadcrumb ? 1 : 0.8,
          y: showBreadcrumb ? 0 : 20,
          x: '-50%'
        }}
        transition={{ 
          duration: 0.4, 
          ease: [0.34, 1.56, 0.64, 1], // Pop-in easing
          delay: 0.1
        }}
      >
            <div 
              className={`breadcrumb-container bg-white rounded-full shadow-lg py-2 px-3 flex items-center justify-center ${isBreadcrumbExpanded ? 'breadcrumb-expanded' : ''}`}
              onMouseEnter={() => {
                // Clear any pending timeout
                if (breadcrumbTimeoutRef.current) {
                  clearTimeout(breadcrumbTimeoutRef.current);
                  breadcrumbTimeoutRef.current = null;
                }
                setIsBreadcrumbExpanded(true);
              }}
              onMouseLeave={() => {
                // Clear any existing timeout
                if (breadcrumbTimeoutRef.current) {
                  clearTimeout(breadcrumbTimeoutRef.current);
                }
                // Set timeout to collapse after 1.5 seconds
                breadcrumbTimeoutRef.current = setTimeout(() => {
                  setIsBreadcrumbExpanded(false);
                  breadcrumbTimeoutRef.current = null;
                }, 1500);
              }}
            >
              <div className="breadcrumb-content flex items-center">
                {/* Current Step Indicator - Always Visible, Hidden on Hover */}
                <div className="breadcrumb-current-indicator flex items-center gap-1.5 shrink-0">
                  {(() => {
                    if (conversionComplete) {
                      return (
                        <>
                          <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center">
                            <Check className="h-3 w-3" />
                          </div>
                          <span className="text-xs font-medium text-green-700 whitespace-nowrap">Ready</span>
                        </>
                      );
                    } else if (isConverting) {
                      return (
                        <>
                          <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center">
                            <RefreshCw className="h-3 w-3 animate-spin" />
                          </div>
                          <span className="text-xs font-medium text-blue-600 whitespace-nowrap">Transposing</span>
                        </>
                      );
                    } else if (uploadedFile) {
                      return (
                        <>
                          <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold">
                            2
                          </div>
                          <span className="text-xs font-medium text-blue-600 whitespace-nowrap">Mappings</span>
                        </>
                      );
                    } else {
                      return (
                        <>
                          <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold">
                            1
                          </div>
                          <span className="text-xs font-medium text-blue-600 whitespace-nowrap">Sheet Upload</span>
                        </>
                      );
                    }
                  })()}
                </div>

                {/* Sheet Upload - Hidden until hover */}
                <div className="breadcrumb-item flex items-center gap-1.5">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                    !uploadedFile ? 'bg-blue-600 text-white' : 'bg-green-100 text-green-700'
                  }`}>
                    {!uploadedFile ? '1' : <Check className="h-3 w-3" />}
                  </div>
                  <span className={`text-xs font-medium transition-colors ${
                    !uploadedFile ? 'text-blue-600' : 'text-green-700'
                  }`}>
                    Sheet Upload
                  </span>
                </div>

                {/* Divider */}
                <div className={`breadcrumb-divider h-0.5 transition-colors ${
                  uploadedFile ? 'bg-green-300' : 'bg-neutral-200'
                }`}></div>

                {/* Mappings */}
                <div className="breadcrumb-item flex items-center gap-1.5">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                    !uploadedFile ? 'bg-neutral-200 text-neutral-500' :
                    (isConverting || conversionComplete) ? 'bg-green-100 text-green-700' :
                    'bg-blue-600 text-white'
                  }`}>
                    {!uploadedFile ? '2' : (isConverting || conversionComplete) ? <Check className="h-3 w-3" /> : '2'}
                  </div>
                  <span className={`text-xs font-medium transition-colors ${
                    !uploadedFile ? 'text-neutral-500' :
                    (isConverting || conversionComplete) ? 'text-green-700' :
                    'text-blue-600'
                  }`}>
                    Mappings
                  </span>
                </div>

                {/* Divider */}
                <div className={`breadcrumb-divider h-0.5 transition-colors ${
                  (isConverting || conversionComplete) ? 'bg-green-300' : 'bg-neutral-200'
                }`}></div>

                {/* Transposing */}
                <div className="breadcrumb-item flex items-center gap-1.5">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                    !isConverting && !conversionComplete ? 'bg-neutral-200 text-neutral-500' :
                    isConverting ? 'bg-blue-600 text-white' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {isConverting ? (
                      <RefreshCw className="h-3 w-3 animate-spin" />
                    ) : conversionComplete ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      '3'
                    )}
                  </div>
                  <span className={`text-xs font-medium transition-colors ${
                    !isConverting && !conversionComplete ? 'text-neutral-500' :
                    isConverting ? 'text-blue-600' :
                    'text-green-700'
                  }`}>
                    Transposing
                  </span>
                </div>

                {/* Divider */}
                <div className={`breadcrumb-divider h-0.5 transition-colors ${
                  conversionComplete ? 'bg-green-300' : 'bg-neutral-200'
                }`}></div>

                {/* Ready */}
                <div className="breadcrumb-item flex items-center gap-1.5">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                    conversionComplete ? 'bg-green-600 text-white' : 'bg-neutral-200 text-neutral-500'
                  }`}>
                    {conversionComplete ? <Check className="h-3 w-3" /> : '4'}
                  </div>
                  <span className={`text-xs font-medium transition-colors ${
                    conversionComplete ? 'text-green-700' : 'text-neutral-500'
                  }`}>
                    Ready
                  </span>
                </div>
              </div>
            </div>
      </motion.div>

      {/* Practice List Modal */}
      {showPracticeListModal && (() => {
            // Get all practice names
            const getAllPracticeNames = (practiceInfoData) => {
              if (!practiceInfoData || !practiceInfoData.practice_names) return [];
              return Object.values(practiceInfoData.practice_names).filter(name => name);
            };

            const practiceIdMapping = mappings.find(m => {
              const types = Array.isArray(m.detectedAs) ? m.detectedAs : [m.detectedAs];
              return types.includes('practiceId');
            });
            
            const practiceCloudIdMapping = mappings.find(m => {
              const types = Array.isArray(m.detectedAs) ? m.detectedAs : [m.detectedAs];
              return types.includes('practiceCloudId');
            });
            
            const hasManualIds = manualPracticeIds && manualPracticeIds.trim();
            
            let currentPracticeInfo = null;
            if (practiceIdMapping || practiceCloudIdMapping) {
              currentPracticeInfo = mappedColumnPracticeInfo;
            } else if (hasManualIds) {
              currentPracticeInfo = practiceInfo;
            }
            
            const allPracticeNames = currentPracticeInfo ? getAllPracticeNames(currentPracticeInfo) : [];

            return (
              <div 
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                onClick={() => setShowPracticeListModal(false)}
              >
                <div 
                  className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Modal Header */}
                  <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-semibold text-neutral-800">
                      All Practices ({allPracticeNames.length})
                    </h2>
                    <button
                      onClick={() => setShowPracticeListModal(false)}
                      className="text-neutral-500 hover:text-neutral-700 transition-colors"
                      title="Close"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Modal Body */}
                  <div className="p-4 overflow-y-auto flex-1">
                    {allPracticeNames.length > 0 ? (
                      <ul className="space-y-2">
                        {allPracticeNames.map((name, index) => (
                          <li 
                            key={index}
                            className="p-2 rounded-md hover:bg-neutral-50 transition-colors text-sm text-neutral-700"
                          >
                            {name}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-center text-neutral-500 py-8">
                        No practice names available
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

      {/* Location Cases Info Modal */}
      <AnimatePresence>
        {showLocationCasesModal && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowLocationCasesModal(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div 
              className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[80vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold text-neutral-800">
                Location Matching Cases
              </h2>
              <button
                onClick={() => setShowLocationCasesModal(false)}
                className="text-neutral-500 hover:text-neutral-700 transition-colors"
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1">
              <div className="space-y-6">
                {/* Case 1 */}
                <div className={`border-l-4 border-blue-500 pl-4 py-3 rounded-r-lg transition-all duration-300 ${
                  locationCase === 1 
                    ? 'bg-blue-50 border-blue-600 shadow-md' 
                    : 'bg-transparent'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg font-semibold text-blue-600">Case 1</span>
                    {locationCase === 1 && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-neutral-700 mb-1">
                    Location Monolith ID is mapped
                  </p>
                  <ul className="text-sm text-neutral-600 space-y-1 ml-4 list-disc">
                    <li>Takes values from Location ID 1, Location ID 2, etc.</li>
                    <li>Searches in Practice_Locations.xlsx by monolith_location_id</li>
                    <li>Extracts location_id, Practice Cloud ID, and Location Type</li>
                    <li>Creates Location Cloud ID n, Practice Cloud ID n, Location Type n columns</li>
                    <li>Renames Location ID n to Location Monolith ID n after mapping</li>
                  </ul>
                </div>

                {/* Case 2 */}
                <div className={`border-l-4 border-green-500 pl-4 py-3 rounded-r-lg transition-all duration-300 ${
                  locationCase === 2 
                    ? 'bg-green-50 border-green-600 shadow-md' 
                    : 'bg-transparent'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg font-semibold text-green-600">Case 2</span>
                    {locationCase === 2 && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-neutral-700 mb-1">
                    Only State is mapped (State-only matching)
                  </p>
                  <ul className="text-sm text-neutral-600 space-y-1 ml-4 list-disc">
                    <li>Takes State values (can be comma-separated)</li>
                    <li>Searches in Practice_Locations.xlsx by state</li>
                    <li>Creates Location Monolith ID n, Location Cloud ID n, Location Type n columns</li>
                  </ul>
                </div>

                {/* Case 3 */}
                <div className={`border-l-4 border-purple-500 pl-4 py-3 rounded-r-lg transition-all duration-300 ${
                  locationCase === 3 
                    ? 'bg-purple-50 border-purple-600 shadow-md' 
                    : 'bg-transparent'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg font-semibold text-purple-600">Case 3</span>
                    {locationCase === 3 && (
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-neutral-700 mb-1">
                    All address components mapped separately
                  </p>
                  <ul className="text-sm text-neutral-600 space-y-1 ml-4 list-disc">
                    <li>Address Line 1, Address Line 2, City, State, ZIP are all mapped separately</li>
                    <li>Uses fuzzy matching on individual address components</li>
                    <li>Creates Location ID n, Location Cloud ID n, Location Type n columns</li>
                  </ul>
                </div>

                {/* Case 4 */}
                <div className={`border-l-4 border-orange-500 pl-4 py-3 rounded-r-lg transition-all duration-300 ${
                  locationCase === 4 
                    ? 'bg-orange-50 border-orange-600 shadow-md' 
                    : 'bg-transparent'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg font-semibold text-orange-600">Case 4</span>
                    {locationCase === 4 && (
                      <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-medium rounded">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-neutral-700 mb-1">
                    Only Address Line 1 is mapped (contains all address info)
                  </p>
                  <ul className="text-sm text-neutral-600 space-y-1 ml-4 list-disc">
                    <li>Only Address Line 1 is mapped (Address Line 2, City, State, ZIP are empty)</li>
                    <li>Concatenates address_1, address_2, city, state, zip from Practice_Locations.xlsx</li>
                    <li>Matches full concatenated address against Address Line 1 using fuzzy matching</li>
                    <li>Creates Location ID n, Location Cloud ID n, Location Type n columns</li>
                  </ul>
                </div>
              </div>

              {locationCase === null && (
                <div className="mt-6 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                  <p className="text-sm text-neutral-600">
                    <strong>No case determined:</strong> No location mappings have been assigned yet. 
                    Assign location-related columns to determine which matching case will be used.
                  </p>
                </div>
              )}
            </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Extraction Error Dialog */}
      <AnimatePresence>
        {showExtractionErrorDialog && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowExtractionErrorDialog(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div 
              className="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4 flex flex-col"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            >
              {/* Dialog Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold text-neutral-800">
                  Error
                </h2>
                <button
                  onClick={() => setShowExtractionErrorDialog(false)}
                  className="text-neutral-500 hover:text-neutral-700 transition-colors"
                  title="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Dialog Body */}
              <div className="p-4">
                <p className="text-neutral-600">
                  No Extraction file found. Convert before accessing the Packaging system.
                </p>
                
                {/* Buttons */}
                <div className="flex justify-between items-center mt-4">
                  <Button
                    variant="outline"
                    onClick={async () => {
                      if (!confirm('Are you sure you want to delete all Excel files in the backend\\Excel Files directory? This action cannot be undone.')) {
                        return;
                      }
                      
                      try {
                        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                        addLog('Deleting Excel files...', 'info');
                        
                        const response = await fetch(`${API_BASE_URL}/api/delete-excel-files`, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                        });
                        
                        const data = await response.json();
                        
                        if (!response.ok) {
                          throw new Error(data.error || 'Failed to delete Excel files');
                        }
                        
                        addLog(`Successfully deleted ${data.deleted_count} Excel file(s)`, 'success');
                        showToastMessage(`Deleted ${data.deleted_count} Excel file(s)`);
                      } catch (error) {
                        console.error('Delete Excel files error:', error);
                        addLog(`Error deleting Excel files: ${error.message}`, 'error');
                        showToastMessage(`Error: ${error.message}`);
                      }
                    }}
                    className="px-4 py-2"
                    title="Delete all Excel files in backend\\Excel Files"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Excel Files
                  </Button>
                  <Button
                    onClick={() => setShowExtractionErrorDialog(false)}
                    className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700"
                  >
                    OK
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Extraction Complete Dialog */}
      <AnimatePresence>
        {showExtractionCompleteDialog && (
            <motion.div 
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
              onClick={() => {
                if (!isPacking) {
                  setShowExtractionCompleteDialog(false);
                  setHasShownExtractionDialog(true);
                }
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
            <motion.div 
              className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 flex flex-col"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            >
              {/* Dialog Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold text-neutral-800">
                  Packing system
                </h2>
                <button
                  onClick={() => {
                    if (!isPacking) {
                      setShowExtractionCompleteDialog(false);
                      setHasShownExtractionDialog(true);
                    }
                  }}
                  disabled={isPacking}
                  className={`text-neutral-500 transition-colors ${
                    isPacking ? 'cursor-not-allowed opacity-50' : 'hover:text-neutral-700'
                  }`}
                  title={isPacking ? "Packing in progress..." : "Close"}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Dialog Body */}
              <div className="p-6">
                <p className="text-neutral-600 mb-4">
                  All intermediate files have been created successfully. You can now proceed to pack the data.
                </p>
                
                {/* File Name Input */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Template File Name
                  </label>
                  <Input
                    type="text"
                    value={templateFileName}
                    onChange={(e) => setTemplateFileName(e.target.value)}
                    placeholder="Enter file name (without extension)"
                    disabled={isPacking}
                    className="w-full"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !isPacking && templateFileName.trim()) {
                        // Trigger pack on Enter key
                        document.querySelector('[data-pack-button]')?.click();
                      }
                    }}
                  />
                  <p className="mt-1 text-xs text-neutral-500">
                    The file will be saved as: <span className="font-mono">{templateFileName.trim() || 'Template copy'}.xlsx</span>
                  </p>
                </div>
                
                {/* Pack Button */}
                <div className="flex justify-between items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={async () => {
                      if (isPacking) return;
                      
                      if (!confirm('Are you sure you want to delete all Excel files in the backend\\Excel Files directory? This action cannot be undone.')) {
                        return;
                      }
                      
                      try {
                        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                        addLog('Deleting Excel files...', 'info');
                        
                        const response = await fetch(`${API_BASE_URL}/api/delete-excel-files`, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                        });
                        
                        const data = await response.json();
                        
                        if (!response.ok) {
                          throw new Error(data.error || 'Failed to delete Excel files');
                        }
                        
                        addLog(`Successfully deleted ${data.deleted_count} Excel file(s)`, 'success');
                        showToastMessage(`Deleted ${data.deleted_count} Excel file(s)`);
                      } catch (error) {
                        console.error('Delete Excel files error:', error);
                        addLog(`Error deleting Excel files: ${error.message}`, 'error');
                        showToastMessage(`Error: ${error.message}`);
                      }
                    }}
                    disabled={isPacking}
                    className="px-4 py-2"
                    title="Delete all Excel files in backend\\Excel Files"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Excel Files
                  </Button>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (!isPacking) {
                          setShowExtractionCompleteDialog(false);
                          setHasShownExtractionDialog(true);
                        }
                      }}
                      disabled={isPacking}
                      className="px-4 py-2"
                    >
                      Cancel
                    </Button>
                    <Button
                      data-pack-button
                      onClick={async () => {
                      if (packingComplete) {
                        // Open file explorer
                        if (!packedFilePath) {
                          showToastMessage("File path not available");
                          setPackingComplete(false);
                          return;
                        }
                        
                        // Check if file exists before opening
                        try {
                          const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                          const checkResponse = await fetch(`${API_BASE_URL}/api/check-file-exists`, {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                              file_path: packedFilePath
                            }),
                          });
                          
                          const checkData = await checkResponse.json();
                          
                          if (!checkResponse.ok || !checkData.exists) {
                            // File doesn't exist, revert to Pack state
                            setPackingComplete(false);
                            setPackedFilePath(null);
                            showToastMessage("File not found. Please pack again.");
                            addLog('File not found, reverting to Pack state', 'error');
                            return;
                          }
                        } catch (error) {
                          console.error('Error checking file existence:', error);
                          setPackingComplete(false);
                          setPackedFilePath(null);
                          showToastMessage("Error checking file. Please pack again.");
                          return;
                        }
                        
                        try {
                          const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                          addLog('Opening file explorer...', 'info');
                          
                          const response = await fetch(`${API_BASE_URL}/api/open-file-explorer`, {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                              file_path: packedFilePath
                            }),
                          });
                          
                          const data = await response.json();
                          
                          if (!response.ok) {
                            throw new Error(data.error || 'Failed to open file explorer');
                          }
                          
                          addLog('File explorer opened successfully', 'success');
                          showToastMessage("File explorer opened");
                        } catch (error) {
                          console.error('Open file explorer error:', error);
                          addLog(`Error opening file explorer: ${error.message}`, 'error');
                          showToastMessage(`Error: ${error.message}`);
                        }
                        return;
                      }
                      if (!templateFileName.trim()) {
                        showToastMessage("Please enter a file name");
                        return;
                      }
                      setIsPacking(true);
                      setIsConverting(true);
                      setPackingComplete(false);
    setPackedFilePath(null);
                      addLog('Starting data packing process...', 'info');
                      
                      try {
                        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                        addLog(`Connecting to backend: ${API_BASE_URL}`, 'info');
                        
                        const response = await fetch(`${API_BASE_URL}/api/pack`, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            file_name: templateFileName.trim() || 'Template copy'
                          }),
                        });
                        
                        const data = await response.json();
                        
                        if (!response.ok) {
                          throw new Error(data.error || 'Failed to pack data');
                        }
                        
                        // Log output from main.py if available
                        if (data.output) {
                          const outputLines = data.output.split('\n').filter(line => line.trim());
                          outputLines.forEach(line => {
                            const lineStr = String(line).trim();
                            if (lineStr) {
                              if (lineStr.includes('✓') || lineStr.includes('Successfully')) {
                                addLog(lineStr, 'success');
                              } else if (lineStr.includes('✗') || lineStr.includes('Failed')) {
                                addLog(lineStr, 'error');
                              } else {
                                addLog(lineStr, 'info');
                              }
                            }
                          });
                        }
                        
                        addLog('Data packing completed successfully', 'success');
                        if (data.template_path) {
                          addLog(`Template file: ${data.template_path}`, 'success');
                        }
                        if (data.file_name) {
                          addLog(`File saved as: ${data.file_name}.xlsx`, 'success');
                        }
                        showToastMessage("Data packing completed successfully");
                        setPackingComplete(true);
                        // Store the file path for download
                        if (data.template_path) {
                          setPackedFilePath(data.template_path);
                        }
                        // Don't close dialog - let user download
                      } catch (error) {
                        console.error('Pack error:', error);
                        addLog(`Pack error: ${error.message}`, 'error');
                        showToastMessage(`Error: ${error.message}`);
                        // Keep dialog open on error so user can retry
                      } finally {
                        setIsPacking(false);
                        setIsConverting(false);
                      }
                    }}
                    disabled={isPacking}
                    className={`px-6 py-2 ${
                      isPacking 
                        ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed' 
                        : packingComplete
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {packingComplete ? (
                      'Download'
                    ) : isPacking ? (
                      'Packing'
                    ) : (
                      'Pack'
                    )}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User Edit Modal */}
      {showUserEditModal && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
              onClick={() => setShowUserEditModal(false)}
            >
              <div 
                className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-4 border-b">
                  <h2 className="text-lg font-semibold text-neutral-800">
                    Edit User Email
                  </h2>
                  <button
                    onClick={() => setShowUserEditModal(false)}
                    className="text-neutral-500 hover:text-neutral-700 transition-colors"
                    title="Close"
                    disabled={isUpdatingUserInfo}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-4">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Email Address
                    </label>
                    <Input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      placeholder="Enter email address (e.g., abc.xyz@zocdoc.com)"
                      className="w-full"
                      disabled={isUpdatingUserInfo}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !isUpdatingUserInfo && editEmail.trim() && editRole.trim()) {
                          handleUpdateUserInfo();
                        }
                      }}
                    />
                    <p className="mt-1 text-xs text-neutral-500">
                      The user name will be automatically generated from the email
                    </p>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Role
                    </label>
                    <select
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-neutral-100 disabled:cursor-not-allowed"
                      disabled={isUpdatingUserInfo}
                    >
                      <option value="">Select a role</option>
                      <option value="PROD_OPS_PUNE_ROLE">PROD_OPS_PUNE_ROLE</option>
                      <option value="PROVIDER_DATA_OPS_PUNE_ROLE">PROVIDER_DATA_OPS_PUNE_ROLE</option>
                    </select>
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowUserEditModal(false)}
                      disabled={isUpdatingUserInfo}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleUpdateUserInfo}
                      disabled={isUpdatingUserInfo || !editEmail.trim() || !editRole.trim()}
                    >
                      {isUpdatingUserInfo ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                          Updating...
                        </>
                      ) : (
                        'Update'
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

      {/* User Manual Dialog */}
      <AnimatePresence>
        {showUserManualDialog && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowUserManualDialog(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div 
              className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            >
              {/* Dialog Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold text-neutral-800">
                  User Manual
                </h2>
                <button
                  onClick={() => setShowUserManualDialog(false)}
                  className="text-neutral-500 hover:text-neutral-700 transition-colors"
                  title="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Dialog Body */}
              <div className="p-6">
                <p className="text-neutral-600 mb-6">
                  Would you like to open the user manual in a new tab?
                </p>
                
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowUserManualDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      window.open('/usermanual', '_blank');
                      setShowUserManualDialog(false);
                    }}
                  >
                    Open User Manual
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </motion.div>
    </>
  );
}
