
import * as React from 'react';
import { OnboardingState } from '../types';

export const addCategory = (
  setState: React.Dispatch<React.SetStateAction<OnboardingState>>
) => {
  setState(prev => ({
    ...prev,
    categories: [...prev.categories, `Category ${prev.categories.length + 1}`]
  }));
};

export const updateCategory = (
  categories: string[],
  setState: React.Dispatch<React.SetStateAction<OnboardingState>>,
  index: number, 
  value: string
) => {
  const newCategories = [...categories];
  newCategories[index] = value;
  setState(prev => ({ ...prev, categories: newCategories }));
};

export const removeCategory = (
  categories: string[],
  setState: React.Dispatch<React.SetStateAction<OnboardingState>>,
  index: number
) => {
  if (categories.length > 1) {
    setState(prev => ({
      ...prev,
      categories: prev.categories.filter((_, i) => i !== index)
    }));
  }
};
