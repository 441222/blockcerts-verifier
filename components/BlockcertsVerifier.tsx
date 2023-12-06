import React, { useEffect, useRef, useState } from 'react';
import { Certificate } from '@blockcerts/cert-verifier-js';
import { BrowserMultiFormatReader } from '@zxing/library';
import NeumoCard from './NeumoCard';
import NeumoCardLoad from './NeumoCardLoad';
import NeumoCardMd from './NeumoCardMd';
import NeumoButton from './NeumoButton';
import NeumoInput from './NeumoInput';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera } from '@fortawesome/free-solid-svg-icons';


const BlockcertsVerifier: React.FC<{ initialURL?: string }> = ({ initialURL }) => {
  const [certificateData, setCertificateData] = useState<any>(null);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [certificateInfo, setCertificateInfo] = useState<any>(null);
  const [verificationLog, setVerificationLog] = useState<any[]>([]);
  const [showLog, setShowLog] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [certificateURL, setCertificateURL] = useState<string>('');
  const [isVideoStarted, setIsVideoStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);  // 追加: ローディング状態の管理
  const [showPopup, setShowPopup] = useState(false);  // 追加: ポップアップ表示の管理


  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const text = await file.text();
      setCertificateData(JSON.parse(text));
    }
  };

  const translateLog = (log: any) => {
    const stepTranslations: { [key: string]: string } = {
      getTransactionId: 'トランザクションIDの取得',
      computeLocalHash: 'ローカルハッシュの計算',
      fetchRemoteHash: 'リモートハッシュの取得',
      compareHashes: 'ハッシュの比較',
      checkMerkleRoot: 'Merkle Rootの確認',
      checkReceipt: 'レシートの確認',
      parseIssuerKeys: '発行者のキーの解析',
      checkAuthenticity: '真正性の確認',
      checkRevokedStatus: '取り消しステータスの確認',
      checkExpiresDate: '有効期限の確認',
      controlVerificationMethod: '検証方法の制御',
      deriveIssuingAddressFromPublicKey: '公開キーからの発行アドレスの導出',
      compareIssuingAddress: 'アドレスの比較'
    };

    const statusTranslations: { [key: string]: string } = {
      starting: '開始',
      success: '成功',
      failure: '失敗'
    };

    return `${stepTranslations[log.code] || log.code} - ${statusTranslations[log.status] || log.status}`;
  };
  useEffect(() => {
    const verifyCertificate = async () => {
      if (certificateData) {
        setIsLoading(true);
        const certificate = new Certificate(certificateData);
        await certificate.init();
  
        const logs: any[] = [];
        const result = await certificate.verify(({ code, label, status, errorMessage }) => {
          logs.push({ code, label, status, errorMessage });
        });
        
        setVerificationResult(result);
        setVerificationLog(logs);
        setIsLoading(false); // ここに移動
        setShowPopup(true); // ここに移動
        if (result.status === 'success') {
          setCertificateInfo({
            name: certificateData.name || "",  // 修正
            description: "",  // 元データには該当フィールドがないため空文字列
            issuedOn: certificateData.issuanceDate || "",
            issuer: certificateData.issuer || "",
            subjectName: certificateData.credentialSubject ? certificateData.credentialSubject.subjectName : "",
            collectionLocation: certificateData.credentialSubject ? certificateData.credentialSubject.collectionLocation : "",
            collectionDate: certificateData.credentialSubject ? certificateData.credentialSubject.collectionDate : "",
            species: certificateData.credentialSubject ? certificateData.credentialSubject.species : "",
            message: certificateData.credentialSubject ? certificateData.credentialSubject.message : "",
          });
          
        }
      }
    };

    verifyCertificate();
  }, [certificateData]);

  useEffect(() => {
    if (certificateURL) {
      console.log("検証開始");
      fetchCertificateFromURL(); 
    }
  }, [certificateURL]);


  const handleURLChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCertificateURL(event.target.value);
  };

  const fetchCertificateFromURL = async () => {
    console.log("Fetching certificate from URL:", certificateURL);
    try {
        const response = await fetch(certificateURL);
        if (!response.ok) {
            console.error(`Failed to fetch certificate. Status: ${response.status}`);
            return;
        }
        const data = await response.json();
        console.log("Fetched certificate data:", data);
        setCertificateData(data);
    } catch (error) {
        console.error("Failed to fetch certificate from URL:", error);
    }
  };

  // ポップアップを閉じるための関数
const closePopup = () => {
  setShowPopup(false);
};
  


const startScanner = () => {
  const codeReader = new BrowserMultiFormatReader();
  codeReader.decodeFromVideoDevice(null, videoRef.current!, (result, err) => {
    if (result) {
      setCertificateURL(result.getText());
      codeReader.reset();  // QRコードが読み取られたときにカメラをリセット
      setIsVideoStarted(false);  // ビデオを非表示にし、ボタンを再度表示
      fetchCertificateFromURL();
    } else if (err) {
      console.error(err);
    }
  });
  setIsVideoStarted(true);
};


  return (
    <div className="space-y-4"> {/* 追加: 要素間に垂直方向のスペースを追加 */}

    <div className="flex flex-col items-center py-4">
      <video 
          ref={videoRef} 
          width={300} 
          height={300} 
          className={`bg-glass-bg backdrop-blur shadow-glass rounded-xl border-neumo-border border mb-2 ${isVideoStarted ? '' : 'hidden'}`} 
      ></video>
      <button onClick={startScanner}
          className={`bg-glass-bg backdrop-blur shadow-glass rounded-xl border-neumo-border border mb-2 flex items-center justify-center ${isVideoStarted ? 'hidden' : ''}`}
          style={{ width: 300, height: 300 }}
      >

          <div onClick={startScanner} className="flex flex-col items-center justify-center">
            <svg width="0" height="0" style={{ position: "absolute" }}>
                <filter id="inset-shadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feComponentTransfer in="SourceAlpha">
                        <feFuncA type="table" tableValues="1 0" />
                    </feComponentTransfer>
                    <feGaussianBlur stdDeviation="4" /> {/* ブラーの大きさを変更 */}
                    <feOffset dx="0" dy="2" result="offsetblur" /> {/* dx, dyの値を変更 */}
                    <feFlood floodColor="rgba(31, 38, 135, 0.25)" result="color" /> {/* floodColorを変更 */}
                    <feComposite in2="offsetblur" operator="in" />
                    <feComposite in2="SourceAlpha" operator="in" />
                    <feMerge>
                        <feMergeNode in="SourceGraphic" />
                        <feMergeNode />
                    </feMerge>
                </filter>
            </svg>

            <FontAwesomeIcon
                icon={faCamera}
                size="6x"
                style={{
                    filter: "url(#inset-shadow)",
                    color: "rgba(200, 200, 200, 0.3)", // 半透明な色を使用
                    backgroundColor: "transparent",
                }}
            /><br />
            <div>QRコードをスキャン</div>
          </div>
          
      </button>
      {/* <NeumoButton onClick={startScanner}>Start QR Scanner</NeumoButton> */}
    </div>

      <div></div>
      <div className="text-sm">
        <label>URL: </label>
        <NeumoInput type="text" value={certificateURL} onChange={handleURLChange} className="mx-2" /> {/* 追加: テキストボックスの両側にマージンを追加 */}
        <NeumoButton onClick={fetchCertificateFromURL}>検証</NeumoButton>
      </div>
      <div>
      <div className="text-sm"><label>または、証明書のファイルをアップロード: </label></div>
        <input type="file" onChange={handleFileChange} className="text-xs"/>
      </div>
      <div></div>

      {/* 追加: ロード中の画面 */}
      {isLoading && (
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-opacity-0 bg-gray-900">
          <NeumoCardLoad>
            <div className="text-white text-xl">検証中...</div>
          </NeumoCardLoad>
        </div>
      )}

      {/* 追加: 検証結果のポップアップ */}
      {showPopup && (
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-opacity-0">
          <NeumoCardMd>

            {verificationResult.status === 'success' && certificateInfo ? (
              certificateInfo.name === "cell certificate" ? (
                <>
                <div className='text-xl mb-4 text-green-500'>証明書は有効です</div>
                <div className='mb-2'>証明書の名前: <span className='ml-2'>{certificateInfo.name}</span></div>
                <div className='mb-2'>発行日: <span className='ml-2'>{certificateInfo.issuedOn}</span></div>
                <div className='mb-2'>発行者: <span className='ml-2'>{certificateInfo.issuer}</span></div>
                <div className='mb-2'>対象の名前: <span className='ml-2'>{certificateInfo.subjectName}</span></div>
                <div className='mb-2'>収集場所: <span className='ml-2'>{certificateInfo.collectionLocation}</span></div>
                <div className='mb-2'>収集日: <span className='ml-2'>{certificateInfo.collectionDate}</span></div>
                <div className='mb-2'>種: <span className='ml-2'>{certificateInfo.species}</span></div>
                <div className='mb-2'>メッセージ: <span className='ml-2'>{certificateInfo.message}</span></div>
                <div className='mb-4'></div>
                <div>
                  <NeumoButton className="text-sm ml-5 mb-2" onClick={() => setShowLog(!showLog)}>検証の履歴を{showLog ? '隠す' : '表示'}</NeumoButton>
                  {showLog && (
                    <div className='mt-2'>
                      <h4 className='mb-2'>検証の履歴：</h4>
                      <ul className='text-sm'>
                        {verificationLog.map((log, index) => (
                          <li key={index} className='mb-1'>{translateLog(log)}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </>
              ) : (
                <div className='text-xl mb-4 text-red-500'>異なる証明書です</div>
              )
            ) : (
              <div className='text-red-500'>証明書は無効です</div>
            )}

            <NeumoButton className="text-sm ml-5" onClick={closePopup}>閉じる</NeumoButton>
          </NeumoCardMd>
        </div>
      )}

    
    </div>
  );
};

export default BlockcertsVerifier;
