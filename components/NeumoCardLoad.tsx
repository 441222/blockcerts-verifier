import React from 'react';

type NeumoCardProps = {
  children: React.ReactNode;
  className?: string;
  small?: boolean; 
};

const NeumoCardLoad: React.FC<NeumoCardProps> = ({ children, small }) => {
  const cardClassName = `bg-stglass-bg rounded-xl shadow-glass backdrop-blur border border-neumo-border ${small ? 'p-16 m-12' : 'p-24 m-18'}`; // p-とm-の値を増やして隙間を増やす

  return (
    <div className={cardClassName}>
      {children}
    </div>
  );
}

export default NeumoCardLoad;
