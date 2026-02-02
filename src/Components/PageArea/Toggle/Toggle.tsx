import React from 'react';
import './Toggle.css';

interface ToggleProps {
  label?: string;
  isChecked: boolean;
  onChange: () => void;
}

const Toggle: React.FC<ToggleProps> = ({ label, isChecked, onChange }) => {
  return (
    <div className="toggle-container">
      {label && <span className="label-text">{label}</span>}
      <label className="switch">
        <input 
          type="checkbox" 
          checked={isChecked} 
          onChange={onChange} 
        />
        <span className="slider"></span>
      </label>
    </div>
  );
};

export default Toggle;
