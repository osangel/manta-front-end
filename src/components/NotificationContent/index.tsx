// @ts-nocheck
import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExternalLink } from '@fortawesome/free-solid-svg-icons';

export const TxSuccessNotificationContent = ({ extrinsic, subscanBaseUrl }) => {
  const onClickHandler = (subscanBaseUrl) => () => {
    if (subscanBaseUrl) {
      const subscanLink = `${subscanBaseUrl}/extrinsic/${extrinsic}`;
      window.open(subscanLink, '_blank', 'noreferrer');
    }
  };

  return (
    <div>
      <div
        className={classNames('h-12 flex flex-col justify-center', { 'cursor-pointer': subscanBaseUrl})}
        onClick={onClickHandler(subscanBaseUrl)}>
        <div className="text-lg font-semibold text-thirdry mb-1">
          Transaction succeeded
        </div>
        {subscanBaseUrl && (
          <p className="text-base mt-1">
            View on explorer&nbsp;
            <FontAwesomeIcon icon={faExternalLink} />
          </p>
        )}
      </div>
    </div>
  );
};

TxSuccessNotificationContent.propTypes = {
  extrinsic: PropTypes.string,
  subscanBaseUrl: PropTypes.string
};


export const NotificationContent = ({ msg }) => {
  return (
    <div className="pt-2 pb-4 ">
      <h1 className="text-base pt-1 font-semibold text-thirdry">{msg}</h1>
    </div>
  );
};

NotificationContent.propTypes = {
  msg: PropTypes.string,
};

