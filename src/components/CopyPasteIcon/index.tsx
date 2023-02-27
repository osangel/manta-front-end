import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import Icon from 'components/Icon';

type ICopyPastIconProps = {
  btnClassName?: string;
  iconClassName?: string;
  textToCopy: string;
};

const CopyPasteIcon: React.FC<ICopyPastIconProps> = ({
  btnClassName,
  iconClassName,
  textToCopy
}) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (e: React.MouseEvent<HTMLDivElement>) => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    e.stopPropagation();
  };

  useEffect(() => {
    const timer = setTimeout(() => copied && setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  return (
    <div className={classNames('cursor-pointer hover:text-link', btnClassName)} onClick={(e) => copyToClipboard(e)}>
      {
        copied ? (
          <FontAwesomeIcon className={classNames(iconClassName)} icon={faCheck} />
        ) : (
          <Icon
            className={classNames(iconClassName)}
            name="copySquare"
          />
        )
      }
    </div>
  );
};

export default CopyPasteIcon;
