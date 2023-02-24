import {
  MouseEventHandler,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

const ModalContainer = ({ children }: { children: ReactNode }) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1000
    }}>
    {children}
  </div>
);

const ModalBackDrop = ({ onClick }: { onClick: MouseEventHandler }) => (
  <div
    onClick={onClick}
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      zIndex: -1
    }}
  />
);

interface IUseModal {
  closeDisabled?: boolean;
  closeCallback?: () => void;
  closeOnBackdropClick?: boolean;
}

type UseModalResult = {
  ModalWrapper: ({ children }: { children: ReactNode }) => JSX.Element | null;
  showModal: () => void;
  hideModal: () => void;
  open: boolean;
};

export const useModal: (options?: IUseModal) => UseModalResult = (
  options = {
    closeDisabled: false,
    closeOnBackdropClick: true
  }
) => {
  const { closeDisabled, closeCallback, closeOnBackdropClick } = options;

  const [open, setOpen] = useState(false);

  const showModal = useCallback(() => setOpen(true), []);
  const hideModal = useCallback(() => {
    setOpen(false);
    if (closeCallback) {
      closeCallback();
    }
  }, [closeCallback]);

  useEffect(() => {
    // prevents horizontal scroll when modal is open
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [open]);

  const ModalWrapper = useMemo(
    function ModalWrapper() {
      return function ModalWrapper({ children }: { children: ReactNode }) {
        return open ? (
          <ModalContainer>
            <ModalBackDrop
              onClick={() => {
                if (closeOnBackdropClick) {
                  hideModal();
                }
              }}
            />
            {!closeDisabled ? (
              <div className="relative inline-block p-6 bg-fourth rounded-lg text-black">
                <div
                  className="absolute top-5 right-7 text-black dark:text-white cursor-pointer text-lg"
                  onClick={() => hideModal()}>
                  <FontAwesomeIcon icon={faTimes} />
                </div>
                {children}
              </div>
            ) : (
              <div className="relative inline-block px-6 py-4 rounded-lg bg-secondary text-white">
                {children}
              </div>
            )}
          </ModalContainer>
        ) : null;
      };
    },
    [closeDisabled, closeOnBackdropClick, hideModal, open]
  );

  return { ModalWrapper, showModal, hideModal, open };
};
