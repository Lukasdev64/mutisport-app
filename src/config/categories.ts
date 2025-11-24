export interface AgeCategory {
  id: string;
  name: string;
  minAge?: number;
  maxAge?: number;
  description: string;
}

export const AGE_CATEGORIES: AgeCategory[] = [
  { 
    id: 'u10', 
    name: 'U10 (Green)', 
    minAge: 9, 
    maxAge: 10, 
    description: '9-10 years old' 
  },
  { 
    id: 'u12', 
    name: 'U12', 
    minAge: 11, 
    maxAge: 12, 
    description: '11-12 years old' 
  },
  { 
    id: 'u14', 
    name: 'U14', 
    minAge: 13, 
    maxAge: 14, 
    description: '13-14 years old' 
  },
  { 
    id: 'u16', 
    name: 'U16', 
    minAge: 15, 
    maxAge: 16, 
    description: '15-16 years old' 
  },
  { 
    id: 'u18', 
    name: 'U18', 
    minAge: 17, 
    maxAge: 18, 
    description: '17-18 years old' 
  },
  { 
    id: 'senior', 
    name: 'Senior', 
    minAge: 19, 
    description: '19+ years old' 
  },
  {
    id: 'open',
    name: 'Open',
    description: 'All ages allowed'
  }
];

export function isPlayerEligible(age: number | undefined, categoryId: string): boolean {
  if (!age) return true; // If no age set, assume eligible (or handle as needed)
  
  const category = AGE_CATEGORIES.find(c => c.id === categoryId);
  if (!category) return true;
  
  if (category.id === 'open') return true;
  
  if (category.minAge && age < category.minAge) return false;
  if (category.maxAge && age > category.maxAge) return false;
  
  return true;
}
