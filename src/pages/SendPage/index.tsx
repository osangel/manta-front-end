import React from 'react';
import PageContent from 'components/PageContent';
import Navbar from 'components/Navbar';
import IPBlockingModal from 'components/Modal/IPBlockingModal';
import { SendContextProvider } from './SendContext';
import { PrivateTxHistoryContextProvider } from './privateTxHistoryContext';
import SendForm from './SendForm';

const SendPage = () => {
  return (
    <SendContextProvider>
      <PrivateTxHistoryContextProvider>
        <Navbar />
        <PageContent>
          <SendForm />
        </PageContent>
        <IPBlockingModal />
      </PrivateTxHistoryContextProvider>
    </SendContextProvider>
  );
};

export default SendPage;
