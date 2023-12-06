import dynamic from 'next/dynamic';
import QRReader from '../components/QRReader';
import React, { useCallback } from 'react';
import NeumoCard from '../components/NeumoCard'; 
import ThreeBackground from '../components/ThreeBackground';

const DynamicBlockcertsVerifier = dynamic(
  () => import('../components/BlockcertsVerifier'),
  {
    ssr: false,
  }
);

const IndexPage: React.FC = () => {
  const [certificateURL, setCertificateURL] = React.useState<string>('');

  const handleQRResult = useCallback((result: string) => {
    console.log("QR Result:", result);
    setCertificateURL(result);
  }, []);

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'auto' }}>
      <div><ThreeBackground background={true} /></div>
      <div className="min-h-screen flex items-center justify-center p-4"> 
        <NeumoCard>
          <h2 className="text-xl font-bold mb-6">Blockcerts Verifier</h2> 
          <DynamicBlockcertsVerifier />
        </NeumoCard>
      </div>
    </div>
  );
  
};




export default IndexPage;
