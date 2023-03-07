import Icon from 'components/Icon';
import { useMetamask } from 'contexts/metamaskContext';

const MetamaskButton = () => {
  const { configureMoonRiver } = useMetamask();

  const isMetamaskInstalled =
    (window as any).ethereum?.isMetaMask &&
    !(window as any).ethereum?.isBraveWallet &&
    !(window as any).ethereum.isTalisman;

  const connectMetamask = () => {
    if (!isMetamaskInstalled) {
      return;
    }
    configureMoonRiver();
  };

  return (
    <button
      className="flex items-center border rounded-lg py-1.5 px-11 ml-4 mt-4"
      onClick={connectMetamask}>
      <Icon name="metamask" className="mr-3.5 w-6 h-6" />
      {!isMetamaskInstalled ? (
        <a
          href="https://metamask.io/"
          target="_blank"
          rel="noreferrer"
          className="hover:text-white">
          Install
        </a>
      ) : (
        'Connect MetaMask'
      )}
    </button>
  );
};

export default MetamaskButton;
