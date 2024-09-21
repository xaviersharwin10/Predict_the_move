// src/components/ui/NavTabs.tsx
import React from 'react';

type NavTabsProps = {
  tabs: string[];
  activeTab: string;
  onTabClick: (tab: string) => void;
};

const NavTabs: React.FC<NavTabsProps> = ({ tabs, activeTab, onTabClick }) => {
  return (
    <div className="flex border-b border-gray-600 helllo">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabClick(tab)}
          className={`py-2 px-4 text-base font-semibold focus:outline-none ${
            activeTab === tab
              ? 'border-b-2 border-gray-600 text-black-600 dark:border-gray-200 dark:text-gray-50'
              : 'border-b-2 border-transparent text-gray-600 hover:text-black-400'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

export default NavTabs;
