import React from 'react';

type NeumoCardProps = {
  children: React.ReactNode;
  className?: string;
  small?: boolean; 
};

const NeumoCardMd: React.FC<NeumoCardProps> = ({ children }) => {
  const cardClassName = `bg-miglass-bg dark:bg-dark-miglass-bg rounded-xl shadow-glass backdrop-blur border border-neumo-border overflow-y-auto max-h-[80vh] p-8 m-6`; 

  return (
    <div className={cardClassName}>
      {children}
    </div>
  );
}

export default NeumoCardMd;
