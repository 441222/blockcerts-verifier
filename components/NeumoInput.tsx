import React from 'react';

type NeumoInputProps = {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  type?: string; // <-- Add this line
};

const NeumoInput: React.FC<NeumoInputProps> = ({ value, onChange, placeholder, className, type }) => {
  const inputClassName = `
    ${className}
    bg-glass-bg 
    rounded-xl 
    shadow-inset-glass
    backdrop-blur 
    border 
    border-neumo-border 
    p-1.5
    m-2
    outline-none 
    focus:ring-2 
    focus:ring-neumo-focus 
    transition duration-300
  `;

  return (
    <input 
      type={type || "text"}
      value={value} 
      onChange={onChange} 
      placeholder={placeholder}
      className={inputClassName}
    />
  );
}

export default NeumoInput;
