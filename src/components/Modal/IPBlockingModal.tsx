import React, { useEffect } from 'react';
import { useModal } from 'hooks';
import axios from 'axios';

const blockedCountries = ['US', 'CN', 'IR', 'CU', 'KP', 'SY', 'MM', 'HK', 'MO']; // In fact, 'HK' and 'MO' are not countries.
const blockedRegions = ['Crimea', 'Luhans\'k', 'Donets\'k'];
const IPDATA_APIKEY = 'f47f1429b7dfb0d01a6d049b7cd283087b1b75fc3891f249d9c0919b';

function IPBlockingModal() {
  const { ModalWrapper, showModal} = useModal({ closeDisabled: true });

  useEffect(() => {
    async function getUserGeolocation() {
      const res = await axios.get(`https://api.ipdata.co?api-key=${IPDATA_APIKEY}`);
      if (res.status === 200) {
        const country_code = res?.data?.country_code;
        const region = res?.data?.region;
        if (blockedCountries.includes(country_code) || blockedRegions.includes(region)) {
          showModal();
        }
      }
    }
    getUserGeolocation().catch(console.error);
  }, []);

  return (
    <ModalWrapper>
      <div className="w-140 bg-fourth -mx-6 -my-4 rounded-lg p-6">
        <div className="text-xl leading-6">MANTAPAY IS NOT AVAILABLE IN YOUR LOCATION</div>
        <div className="text-sm text-secondary leading-5 my-4">
          It appears that this connecting is from a prohibited region(United States, China, Iran, Cuba, North Korea, Syria, Myanmar (Burma), the regions of Crimea, Donetsk or Luhansk). If you're using a VPN, try disabling it.
        </div>
        <div className="flex justify-center">
          <button onClick={() => location.reload()} className="w-44 h-9 text-sm gradient-button cursor-pointer rounded-lg">Refresh</button>
        </div>
      </div>
    </ModalWrapper>
  );
}

export default IPBlockingModal;
