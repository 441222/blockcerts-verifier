import { useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';

type QRReaderProps = {
    onResult: (result: string) => void;
};

const QRReader: React.FC<QRReaderProps> = ({ onResult }) => {
  const [result, setResult] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const startScanner = () => {
    const codeReader = new BrowserMultiFormatReader();
    codeReader.decodeFromVideoDevice(null, videoRef.current!, (scanResult, err) => {
      if (scanResult) {
        const rawResult = scanResult.getText();
        setResult(rawResult);
        onResult(rawResult); // onResultを呼び出して結果を送信
        codeReader.reset();
      } else if (err) {
        const errMsg = typeof err === 'object' && err.message ? err.message : err;
        if (typeof errMsg === 'string' && !errMsg.startsWith('NotFoundException')) {
          console.error(errMsg);
        }
      }
    });
  };

  const stopScanner = () => {
    const codeReader = new BrowserMultiFormatReader();
    codeReader.reset();
  };

  return (
    <div>
      <video ref={videoRef} style={{ width: '300px', height: '300px' }}></video>
      <button onClick={startScanner}>Start Scan</button>
      <button onClick={stopScanner}>Stop Scan</button>
      <p>Result: {result}</p>
    </div>
  );
};

export default QRReader;
