import Icon from 'components/Icon';
import ConnectWalletModal from 'components/Modal/connectWalletModal';
import { useExternalAccount } from 'contexts/externalAccountContext';
import { useModal } from 'hooks';
import { useSBT } from 'pages/SBTPage/SBTContext';
import { useMemo } from 'react';
import themeMap from 'resources/images/sbt/theme';
import ThemeChecked from '../ThemeChecked';
import ThemeCheckModal from '../ThemeCheckModal';

export const MAX_THEME_LEN = 10;

type ThemeItemProps = {
  name: string;
  index: number;
  toggleCheckImg: (name: string) => void;
};
const ThemeItem = ({ name, index, toggleCheckImg }: ThemeItemProps) => {
  const { checkedThemeItems } = useSBT();

  const bgStyle = checkedThemeItems.has(name)
    ? 'bg-light-check border border-check'
    : 'bg-primary';
  const cursorStyle =
    checkedThemeItems.size >= MAX_THEME_LEN && !checkedThemeItems.has(name)
      ? 'cursor-not-allowed'
      : 'cursor-pointer';

  return (
    <div
      onClick={() => toggleCheckImg(name)}
      key={index}
      className={`flex ${bgStyle} ${cursorStyle} rounded-xl w-28 h-28 flex-col items-center justify-center `}>
      <img src={themeMap[name]} className="w-14 h-14 rounded-full mb-2" />
      <p>{name}</p>
    </div>
  );
};

const ThemePanel = () => {
  const { checkedThemeItems, toggleCheckedThemeItem } = useSBT();
  const { externalAccount } = useExternalAccount();
  const { ModalWrapper, showModal, hideModal } = useModal();
  const {
    ModalWrapper: ThemeCheckModalWrapper,
    showModal: showThemeCheckModal,
    hideModal: hideThemeCheckModal
  } = useModal();

  const btnDisabled = useMemo(() => {
    return (
      checkedThemeItems.size <= 0 || checkedThemeItems.size > MAX_THEME_LEN
    );
  }, [checkedThemeItems]);

  const handleGenerate = async () => {
    if (btnDisabled) {
      return;
    }
    if (!externalAccount) {
      showModal();
      return;
    }
    showThemeCheckModal();
  };

  const toggleCheckImg = (name: string) => {
    if (checkedThemeItems.has(name)) {
      checkedThemeItems.delete(name);
    } else {
      if (checkedThemeItems.size >= MAX_THEME_LEN) {
        return;
      }
      checkedThemeItems.set(name, {
        name,
        img: themeMap[name]
      });
    }

    toggleCheckedThemeItem(new Map(checkedThemeItems));
  };

  const buttonTxt = externalAccount ? 'Generate' : 'Connect Wallet to Generate';
  const disabledStyle = btnDisabled ? 'brightness-50 cursor-not-allowed' : '';

  return (
    <div className="flex-1 flex flex-col mx-auto mb-32 bg-secondary rounded-xl p-6 w-75 relative mt-6">
      <div className="flex items-center">
        <Icon name="manta" className="w-8 h-8 mr-3" />
        <h2 className="text-2xl">zkSBT</h2>
      </div>
      <h1 className="text-3xl my-6">Select Themes</h1>
      <p className="text-sm text-opacity-60 text-white">
        You can select up to {MAX_THEME_LEN} types of themes
      </p>
      <div className="flex pb-48 mt-6">
        <ThemeChecked />
        <div className="grid gap-6 grid-cols-5 grid-rows-3 ml-6">
          {Object.keys(themeMap).map((name, index) => {
            return (
              <ThemeItem
                key={index}
                name={name}
                index={index}
                toggleCheckImg={toggleCheckImg}
              />
            );
          })}
        </div>
      </div>
      <button
        onClick={handleGenerate}
        disabled={btnDisabled}
        className={`absolute px-36 py-2 unselectable-text text-center text-white rounded-lg gradient-button filter bottom-16 left-1/2 -translate-x-1/2 transform ${disabledStyle}`}>
        {buttonTxt}
      </button>
      <ModalWrapper>
        <ConnectWalletModal
          setIsMetamaskSelected={null}
          hideModal={hideModal}
        />
      </ModalWrapper>
      <ThemeCheckModalWrapper>
        <ThemeCheckModal hideModal={hideThemeCheckModal} />
      </ThemeCheckModalWrapper>
    </div>
  );
};

export default ThemePanel;
