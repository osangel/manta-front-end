// @ts-nocheck
import React from 'react';
import PageContent from 'components/PageContent';
import Navbar from 'components/Navbar';
import DowntimeModal from 'components/Modal/downtimeModal';
import { SendContextProvider } from './SendContext';
import SendForm from './SendForm';

const SendPage = () => {
  return (
    <SendContextProvider>
      <Navbar />
      <PageContent>
        <SendForm />
      </PageContent>
      <DowntimeModal />
    </SendContextProvider>
  );
};

export default SendPage;
