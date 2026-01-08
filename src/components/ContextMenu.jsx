import React, { useState, useLayoutEffect, useRef } from "react";
import { X, ChevronRight, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export function ContextMenu({ x, y, onClose, onSelect, isVisible, columnName, currentMappings }) {
  const [expandedGroups, setExpandedGroups] = useState(new Set());
  const [adjustedPosition, setAdjustedPosition] = useState({ x, y });
  const menuRef = useRef(null);

  // Calculate optimal position to keep menu within viewport
  useLayoutEffect(() => {
    if (!isVisible) {
      setAdjustedPosition({ x, y });
      return;
    }

    // Estimate menu size (approximately 440px wide, up to 600px tall)
    const estimatedMenuWidth = 440;
    const estimatedMenuHeight = 500;
    const padding = 10;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    let adjustedX = x;
    let adjustedY = y;
    
    // Check if menu would overflow bottom
    if (y + estimatedMenuHeight > viewportHeight - padding) {
      // Position above the click point
      adjustedY = y - estimatedMenuHeight;
      // If still overflowing top, position at top with padding
      if (adjustedY < padding) {
        adjustedY = padding;
      }
    }
    
    // Check if menu would overflow right
    if (x + estimatedMenuWidth > viewportWidth - padding) {
      // Position to the left of the click point
      adjustedX = x - estimatedMenuWidth;
      // If still overflowing left, position at left with padding
      if (adjustedX < padding) {
        adjustedX = padding;
      }
    }
    
    // Ensure menu doesn't overflow left
    if (adjustedX < padding) {
      adjustedX = padding;
    }
    
    // Ensure menu doesn't overflow top
    if (adjustedY < padding) {
      adjustedY = padding;
    }
    
    setAdjustedPosition({ x: adjustedX, y: adjustedY });

    // Fine-tune position after menu is rendered
    requestAnimationFrame(() => {
      if (!menuRef.current) return;

      const menu = menuRef.current;
      const menuRect = menu.getBoundingClientRect();
      
      let fineTunedX = adjustedX;
      let fineTunedY = adjustedY;
      
      // Fine-tune bottom overflow
      if (menuRect.bottom > viewportHeight - padding) {
        fineTunedY = viewportHeight - menuRect.height - padding;
        if (fineTunedY < padding) fineTunedY = padding;
      }
      
      // Fine-tune right overflow
      if (menuRect.right > viewportWidth - padding) {
        fineTunedX = viewportWidth - menuRect.width - padding;
        if (fineTunedX < padding) fineTunedX = padding;
      }
      
      // Fine-tune left overflow
      if (menuRect.left < padding) {
        fineTunedX = padding;
      }
      
      // Fine-tune top overflow
      if (menuRect.top < padding) {
        fineTunedY = padding;
      }
      
      if (fineTunedX !== adjustedX || fineTunedY !== adjustedY) {
        setAdjustedPosition({ x: fineTunedX, y: fineTunedY });
      }
    });
  }, [isVisible, x, y]);

  // Location-related types (shown in Location Mapping table)
  const locationRelatedTypes = new Set([
    'addressLine1',
    'addressLine2',
    'city',
    'state',
    'zip',
    'practiceId',
    'practiceCloudId',
    'practiceName',
    'locationId',
    'locationName',
    'locationTypeRaw'
  ]);

  // Quality-related types
  const qualityRelatedTypes = new Set([
    'boardCertifications',
    'subBoardCertification',
    'professionalMembership',
    'hospitalAffiliations',
    'education'
  ]);

  const menuItems = [
    { label: "Assign as NPI Number", value: "npi" },
    { label: "Assign as First Name", value: "firstName" },
    { label: "Assign as Last Name", value: "lastName" },
    { label: "Assign as Gender", value: "gender" },
    { label: "Assign as Professional Suffix 1-3", value: "professionalSuffix" },
    { label: "Assign as Headshot Link", value: "headshot" },
    { label: "Assign as Additional Languages Spoken 1-3", value: "additionalLanguages" },
    { label: "Assign as Patients Accepted", value: "patientsAccepted" },
    { label: "Assign as Specialty", value: "specialty" },
    { label: "Assign as PFS", value: "pfs" },
    { 
      label: "Additional Quality columns", 
      value: "qualityGroup",
      isGroup: true,
      children: [
        { label: "Board Certifications", value: "boardCertifications" },
        { label: "Sub-Board Certification", value: "subBoardCertification" },
        { label: "Professional Membership", value: "professionalMembership" },
        { label: "Hospital Affiliations", value: "hospitalAffiliations" },
        { label: "Education", value: "education" }
      ]
    },
    { label: "Assign as Location Monolith ID", value: "locationId" },
    { label: "Assign as Practice ID", value: "practiceId" },
    { label: "Assign as Practice Cloud ID", value: "practiceCloudId" },
    { label: "Assign as Practice Name", value: "practiceName" },
    { label: "Assign as Location Name", value: "locationName" },
    { label: "Assign as Location Type_Raw", value: "locationTypeRaw" },
    { label: "Assign as Address Line 1", value: "addressLine1" },
    { label: "Assign as Address Line 2", value: "addressLine2" },
    { label: "Assign as City", value: "city" },
    { label: "Assign as State", value: "state" },
    { label: "Assign as ZIP", value: "zip" },
  ];

  // Flatten menu items for mapping detection (exclude groups)
  const flatMenuItems = menuItems.flatMap(item => 
    item.isGroup ? item.children : [item]
  );

  // Get all mapped types from all mappings (not just current column)
  // This shows all items that are mapped in the Mappings table
  const allMappedTypes = new Set();
  if (currentMappings && Array.isArray(currentMappings)) {
    currentMappings.forEach(mapping => {
      const types = Array.isArray(mapping.detectedAs) 
        ? mapping.detectedAs 
        : (mapping.detectedAs ? [mapping.detectedAs] : []);
      types.forEach(type => allMappedTypes.add(type));
    });
  }

  // Get current mappings for this column (to show which ones are active for this column)
  const columnMapping = currentMappings?.find(m => m.columnName === columnName);
  const currentColumnTypes = Array.isArray(columnMapping?.detectedAs) 
    ? columnMapping.detectedAs 
    : (columnMapping?.detectedAs ? [columnMapping.detectedAs] : []);

  // Separate menu items into unmapped and mapped (excluding groups)
  // Unmapped: items that are not mapped to any column
  // Mapped: items that are mapped to at least one column (shown in Mappings table)
  const unmappedItems = menuItems.filter(item => !item.isGroup && !allMappedTypes.has(item.value));
  const mappedItems = menuItems.filter(item => !item.isGroup && allMappedTypes.has(item.value));
  
  // Separate groups
  const groupItems = menuItems.filter(item => item.isGroup);

  // Separate into location-related, quality-related, and other
  const unmappedNonLocation = unmappedItems.filter(item => !locationRelatedTypes.has(item.value) && !qualityRelatedTypes.has(item.value));
  const unmappedLocation = unmappedItems.filter(item => locationRelatedTypes.has(item.value));
  const unmappedQuality = unmappedItems.filter(item => qualityRelatedTypes.has(item.value));
  const mappedNonLocation = mappedItems.filter(item => !locationRelatedTypes.has(item.value) && !qualityRelatedTypes.has(item.value));
  const mappedLocation = mappedItems.filter(item => locationRelatedTypes.has(item.value));
  const mappedQuality = mappedItems.filter(item => qualityRelatedTypes.has(item.value));
  
  // Check if quality group should show as mapped (if any child is mapped)
  const isQualityGroupMapped = mappedQuality.length > 0;

  const toggleGroup = (groupValue) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupValue)) {
      newExpanded.delete(groupValue);
    } else {
      newExpanded.add(groupValue);
    }
    setExpandedGroups(newExpanded);
  };

  const renderMenuItem = (item, isMapped = false, index = 0) => {
    const isMappedToCurrentColumn = currentColumnTypes.includes(item.value);
    return (
      <motion.button
        key={item.value}
        onClick={() => {
          onSelect(item.value);
          // Don't close menu on toggle
        }}
        className={`w-full px-3 py-2 text-left text-sm hover:bg-neutral-50 flex items-center justify-between transition-colors ${
          isMapped 
            ? (isMappedToCurrentColumn 
                ? 'bg-blue-50 text-blue-700' 
                : 'bg-neutral-50 text-neutral-700')
            : ''
        }`}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ 
          duration: 0.2,
          delay: index * 0.02,
          ease: [0.4, 0, 0.2, 1]
        }}
      >
        <span className="truncate">{item.label}</span>
        {isMapped && <span className="text-xs font-semibold ml-2 flex-shrink-0">✓</span>}
      </motion.button>
    );
  };

  const renderGroupItem = (groupItem, index = 0) => {
    const isExpanded = expandedGroups.has(groupItem.value);
    const hasMappedChildren = groupItem.children.some(child => 
      allMappedTypes.has(child.value)
    );
    const hasCurrentColumnMapped = groupItem.children.some(child =>
      currentColumnTypes.includes(child.value)
    );

    return (
      <motion.div 
        key={groupItem.value}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ 
          duration: 0.2,
          delay: index * 0.02,
          ease: [0.4, 0, 0.2, 1]
        }}
      >
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            toggleGroup(groupItem.value);
          }}
          className={`w-full px-3 py-2 text-left text-sm hover:bg-neutral-50 flex items-center justify-between transition-colors ${
            hasMappedChildren 
              ? (hasCurrentColumnMapped 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'bg-neutral-50 text-neutral-700')
              : ''
          }`}
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.15 }}
        >
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-neutral-500" />
              ) : (
                <ChevronRight className="h-4 w-4 text-neutral-500" />
              )}
            </motion.div>
            <span className="truncate">{groupItem.label}</span>
          </div>
          {hasMappedChildren && <span className="text-xs font-semibold ml-2 flex-shrink-0">✓</span>}
        </motion.button>
        <AnimatePresence>
          {isExpanded && (
            <motion.div 
              className="pl-6"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            >
              {groupItem.children.map((child, childIndex) => {
                const isChildMapped = allMappedTypes.has(child.value);
                const isChildMappedToCurrent = currentColumnTypes.includes(child.value);
                return (
                  <motion.button
                    key={child.value}
                    onClick={() => {
                      onSelect(child.value);
                    }}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-neutral-50 flex items-center justify-between transition-colors ${
                      isChildMapped 
                        ? (isChildMappedToCurrent 
                            ? 'bg-blue-50 text-blue-700' 
                            : 'bg-neutral-50 text-neutral-700')
                        : ''
                    }`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ 
                      duration: 0.15,
                      delay: childIndex * 0.03,
                      ease: [0.4, 0, 0.2, 1]
                    }}
                  >
                    <span className="truncate">{child.label}</span>
                    {isChildMapped && <span className="text-xs font-semibold ml-2 flex-shrink-0">✓</span>}
                  </motion.button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          <motion.div
            className="fixed inset-0 z-[65]"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
          <motion.div
            ref={menuRef}
            className="fixed z-[70] bg-white rounded-lg shadow-2xl border border-neutral-200 py-2"
            style={{ left: adjustedPosition.x, top: adjustedPosition.y }}
            initial={{ opacity: 0, scale: 0.95, y: adjustedPosition.y >= y ? -10 : 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: adjustedPosition.y >= y ? -10 : 10 }}
            transition={{ 
              duration: 0.2,
              ease: [0.4, 0, 0.2, 1]
            }}
          >
        <div className="flex gap-0">
          {/* Left Column - Non-Location Related */}
          <div className="min-w-[220px] max-w-[220px] border-r border-neutral-200">
            {/* Unmapped non-location items */}
            {unmappedNonLocation.length > 0 && (
              <>
                {unmappedNonLocation.map((item, index) => renderMenuItem(item, false, index))}
                {(mappedNonLocation.length > 0 || groupItems.length > 0 || unmappedLocation.length > 0 || mappedLocation.length > 0) && (
                  <div className="border-t border-neutral-200 my-1"></div>
                )}
              </>
            )}
            
            {/* Group items (Additional Quality columns) */}
            {groupItems.length > 0 && (
              <>
                {groupItems.map((item, index) => renderGroupItem(item, unmappedNonLocation.length + index))}
                {(mappedNonLocation.length > 0 || unmappedLocation.length > 0 || mappedLocation.length > 0) && (
                  <div className="border-t border-neutral-200 my-1"></div>
                )}
              </>
            )}
            
            {/* Mapped non-location items */}
            {mappedNonLocation.map((item, index) => renderMenuItem(item, true, unmappedNonLocation.length + groupItems.length + index))}
            
            {/* Mapped quality items (shown when group is expanded) */}
            {expandedGroups.has('qualityGroup') && mappedQuality.length > 0 && (
              <>
                <div className="border-t border-neutral-200 my-1"></div>
                {mappedQuality.map((item, index) => renderMenuItem(item, true, unmappedNonLocation.length + groupItems.length + mappedNonLocation.length + index))}
              </>
            )}
          </div>

          {/* Right Column - Location Related */}
          <div className="min-w-[220px] max-w-[220px]">
            {/* Unmapped location items */}
            {unmappedLocation.length > 0 && (
              <>
                {unmappedLocation.map((item, index) => renderMenuItem(item, false, index))}
                {mappedLocation.length > 0 && (
                  <div className="border-t border-neutral-200 my-1"></div>
                )}
              </>
            )}
            
            {/* Mapped location items */}
            {mappedLocation.map((item, index) => renderMenuItem(item, true, unmappedLocation.length + index))}
          </div>
        </div>
        
        <div className="border-t border-neutral-200 mt-1 pt-1">
          <motion.button
            onClick={onClose}
            className="w-full px-4 py-2 text-left text-sm hover:bg-neutral-50 transition-colors"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, delay: 0.1 }}
          >
            Done
          </motion.button>
        </div>
      </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

