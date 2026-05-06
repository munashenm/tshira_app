"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Role, Province } from '@prisma/client';

export interface Persona {
  name: string;
  role: Role;
  province?: Province | null;
}

interface SimulationContextType {
  currentPersona: Persona | null;
  setPersona: (persona: Persona) => void;
  canPerformAction: (action: string, caseData?: any) => boolean;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export function SimulationProvider({ children }: { children: React.ReactNode }) {
  const [currentPersona, setCurrentPersona] = useState<Persona | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('demo_persona');
    if (saved) {
      setCurrentPersona(JSON.parse(saved));
    } else {
      const defaultPersona = {
        name: "Super Admin",
        role: Role.ADMIN_OFFICER,
        province: null
      };
      setCurrentPersona(defaultPersona);
      localStorage.setItem('demo_persona', JSON.stringify(defaultPersona));
    }
  }, []);

  const setPersona = (persona: Persona) => {
    setCurrentPersona(persona);
    localStorage.setItem('demo_persona', JSON.stringify(persona));
  };

  const canPerformAction = (action: string, caseData?: any) => {
    if (!currentPersona) return false;
    
    const role = currentPersona.role;
    const province = currentPersona.province;

    // Admin can do everything
    if (role === Role.ADMIN_OFFICER) return true;

    switch (action) {
      case 'ASSIGN_TO_PROVINCE':
        return role === Role.ADMIN_OFFICER;
      
      case 'ASSIGN_FOR_DATA_COLLECTION':
        return role === Role.PROVINCIAL_COORDINATOR && caseData?.province === province;
      
      case 'SUBMIT_DATA':
        return role === Role.DATA_COLLECTION_OFFICER && caseData?.province === province;
      
      case 'PROVINCIAL_QUALITY_CHECK':
        return role === Role.PROVINCIAL_COORDINATOR && caseData?.province === province;
      
      case 'ASSIGN_TO_CONSULTANT':
        return role === Role.ADMIN_OFFICER;
      
      case 'DEVELOP_DOCUMENT':
        return role === Role.BUSINESS_CONSULTANT;
      
      case 'REVIEW_DOCUMENT':
        return role === Role.REVIEWER;
      
      case 'FINANCE_ACTIONS':
        return role === Role.FINANCE;

      case 'CREATE_CASE':
        return role === Role.ADMIN_OFFICER;
        
      case 'CREATE_REQUISITION':
        return role === Role.PROVINCIAL_COORDINATOR;
        
      case 'APPROVE_REQUISITION':
        return role === Role.ADMIN_OFFICER;

      default:
        return false;
    }
  };

  return (
    <SimulationContext.Provider value={{ currentPersona, setPersona, canPerformAction }}>
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulation() {
  const context = useContext(SimulationContext);
  if (context === undefined) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
}
