import React from 'react';
import { Utensils, Truck, Beer } from 'lucide-react';

const TabSwitcher = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'delivery', label: 'Delivery', icon: <Truck size={24} />, subtitle: 'Order Online' },
    { id: 'dine_out', label: 'Dining Out', icon: <Utensils size={24} />, subtitle: 'Eat in Town' },
    { id: 'nightlife', label: 'Nightlife', icon: <Beer size={24} />, subtitle: 'Bars & Pubs' }
  ];

  return (
    <div className="container" style={{ display: 'flex', gap: '3rem', padding: '1rem 0', borderBottom: '1px solid var(--border-color)', marginTop: '2rem' }}>
      {tabs.map(tab => (
        <div 
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className="flex items-center gap-4"
          style={{ 
            cursor: 'pointer', 
            borderBottom: activeTab === tab.id ? '2px solid var(--zomato-red)' : '2px solid transparent',
            paddingBottom: '0.8rem',
            opacity: activeTab === tab.id ? 1 : 0.5,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            minWidth: '200px'
          }}
        >
          <div style={{ 
            background: activeTab === tab.id ? '#FFF1F2' : '#f8f8f8', 
            borderRadius: '50%', 
            width: '60px', 
            height: '60px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: activeTab === tab.id ? 'var(--zomato-red)' : '#666',
            boxShadow: activeTab === tab.id ? '0 4px 12px rgba(239, 79, 95, 0.15)' : 'none'
          }}>
            {tab.icon}
          </div>
          <div className="flex flex-col">
            <span style={{ 
                fontSize: '1.25rem', 
                fontWeight: '600', 
                color: activeTab === tab.id ? 'var(--zomato-red)' : 'var(--text-gray)' 
            }}>
                {tab.label}
            </span>
            <span style={{ fontSize: '0.85rem', color: '#666' }}>{tab.subtitle}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TabSwitcher;
