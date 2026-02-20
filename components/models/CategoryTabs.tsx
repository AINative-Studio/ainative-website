/**
 * CategoryTabs Component
 *
 * Horizontal tab navigation for filtering AI models by category.
 * Supports keyboard navigation and ARIA attributes for accessibility.
 *
 * Refs #238
 */

'use client';

import React from 'react';

export interface CategoryTabsProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const CATEGORIES = ['All', 'Image', 'Video', 'Audio', 'Coding', 'Embedding'];

const CategoryTabs: React.FC<CategoryTabsProps> = ({
  activeCategory,
  onCategoryChange,
}) => {
  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    category: string
  ) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onCategoryChange(category);
    }
  };

  const handleClick = (category: string) => {
    onCategoryChange(category);
  };

  return (
    <div className="border-b border-gray-200 overflow-x-auto">
      <nav
        className="flex space-x-8 min-w-max"
        role="tablist"
        aria-label="Model categories"
      >
        {CATEGORIES.map((category) => {
          const isActive = activeCategory === category;
          return (
            <button
              key={category}
              role="tab"
              aria-selected={isActive}
              tabIndex={0}
              className={`
                whitespace-nowrap py-4 px-4 font-medium text-sm transition-all duration-200
                ${
                  isActive
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-gray-500 hover:text-primary/80 hover:border-gray-300'
                }
              `}
              onClick={() => handleClick(category)}
              onKeyDown={(e) => handleKeyDown(e, category)}
            >
              {category}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default CategoryTabs;
