import React from 'react';

type NeumoCardProps = {
  children: React.ReactNode;
  className?: string;
  small?: boolean; 
};

const NeumoCard: React.FC<NeumoCardProps> = ({ children, small }) => {
  const cardClassName = `bg-glass-bg rounded-xl shadow-glass backdrop-blur border border-neumo-border ${small ? 'p-5 m-4' : 'p-8 m-6'}`; // p-とm-の値を増やして隙間を増やす

  return (
    <div className={cardClassName}>
      {children}
    </div>
  );
}

export default NeumoCard;
