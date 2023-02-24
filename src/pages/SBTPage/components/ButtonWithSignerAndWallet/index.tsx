import {
  ButtonHTMLAttributes,
  useMemo,
  MouseEvent,
  ReactNode,
  useEffect,
  memo,
  useCallback
} from 'react';

import ConnectSignerModal from 'components/Modal/connectSigner';
import ConnectWalletModal from 'components/Modal/connectWalletModal';
import { useExternalAccount } from 'contexts/externalAccountContext';
import { usePrivateWallet } from 'contexts/privateWalletContext';
import { useModal } from 'hooks';

type ButtonWithSignerAndWalletProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children'
> & {
  btnComponent: ReactNode;
  noSignerComponent?: ReactNode;
  noWalletComponent?: ReactNode;
  disabledCls?: string;
};
const ButtonWithSignerAndWallet = (props: ButtonWithSignerAndWalletProps) => {
  const {
    onClick,
    btnComponent,
    noSignerComponent = 'Connect Signer to Continue',
    noWalletComponent = 'Connect Wallet to Continue',
    disabled,
    disabledCls = 'brightness-50 cursor-not-allowed',
    className,
    ...otherProps
  } = props;

  const {
    ModalWrapper: WalletModalWrapper,
    hideModal: hideWalletModal,
    showModal: showWalletModal
  } = useModal();

  const { ModalWrapper: SignerModalWrapper, showModal: showSignerModal } =
    useModal();

  const { externalAccount } = useExternalAccount();
  const { privateAddress } = usePrivateWallet();

  useEffect(() => {
    const closeModelCheck = () => {
      if (externalAccount?.address) {
        hideWalletModal();
      }
    };
    closeModelCheck();
  }, [externalAccount?.address, hideWalletModal]);

  const handleClickBtn = (e: MouseEvent<HTMLButtonElement>) => {
    if (!externalAccount) {
      showWalletModal();
      return;
    }
    if (!privateAddress) {
      showSignerModal();
      return;
    }
    onClick && onClick(e);
  };

  const finalChildren = useMemo(() => {
    if (!externalAccount) {
      return noWalletComponent;
    }
    if (!privateAddress) {
      return noSignerComponent;
    }
    return btnComponent;
  }, [
    btnComponent,
    externalAccount,
    noSignerComponent,
    noWalletComponent,
    privateAddress
  ]);

  const finalDisabled = externalAccount && privateAddress && disabled;
  const finalDisabledCls = finalDisabled ? disabledCls : '';

  return (
    <>
      <button
        onClick={handleClickBtn}
        disabled={finalDisabled}
        {...otherProps}
        className={`${className} ${finalDisabledCls}`}>
        {finalChildren}
      </button>
      <WalletModalWrapper>
        <ConnectWalletModal
          setIsMetamaskSelected={null}
          hideModal={hideWalletModal}
        />
      </WalletModalWrapper>
      <SignerModalWrapper>
        <ConnectSignerModal />
      </SignerModalWrapper>
    </>
  );
};

export default ButtonWithSignerAndWallet;
