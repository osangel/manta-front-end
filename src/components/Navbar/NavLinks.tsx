import React from 'react';
import { NavLink } from 'react-router-dom';
import classNames from 'classnames';
import { useConfig } from 'contexts/configContext';
import { dolphinConfig } from 'config';

const NAVLINKPATH = {
  Transact: '/transact',
  Bridge: '/bridge',
  Stake: '/stake'
};

const NavLinks = () => {
  const { NETWORK_NAME } = useConfig();
  const networkUrlParam = `/${NETWORK_NAME.toLowerCase()}`;

  const isDolphinPage = NETWORK_NAME === dolphinConfig.NETWORK_NAME;
  const isActiveTransactPage = window.location.pathname.includes(
    NAVLINKPATH.Transact
  );
  const isActiveBridgePage = window.location.pathname.includes(
    NAVLINKPATH.Bridge
  );
  const isActiveStakePage = window.location.pathname.includes(
    NAVLINKPATH.Stake
  );
  return (
    <div className="ml-5 flex flex-row justify-between w-113.5 shadow-2xl items-center text-sm font-red-hat-text">
      <NavLink
        to={`${networkUrlParam}${NAVLINKPATH.Transact}`}
        className={classNames(
          'py-3 w-1/3  text-white text-opacity-60 text-center hover:text-white hover:text-opacity-100 hover:font-bold',
          {
            ' text-white text-opacity-100 font-bold': isActiveTransactPage
          }
        )}>
        MantaPay
      </NavLink>
      <NavLink
        to={`${networkUrlParam}${NAVLINKPATH.Bridge}`}
        className={classNames(
          'py-3 w-1/3  text-white text-opacity-60 text-center hover:text-white hover:text-opacity-100 hover:font-bold',
          {
            'text-white text-opacity-100 font-bold': isActiveBridgePage
          }
        )}>
        Bridge
      </NavLink>
      {!isDolphinPage && (
        <NavLink
          to={`${networkUrlParam}${NAVLINKPATH.Stake}`}
          className={classNames(
            'py-3 w-1/4  text-white text-opacity-60 text-center hover:text-white hover:text-opacity-100 hover:font-bold',
            {
              ' text-white text-opacity-100 font-bold': isActiveStakePage
            }
          )}>
          Staking
        </NavLink>
      )}
      <a
        href="https://forum.manta.network/"
        className="py-3 w-1/3  text-white text-opacity-60 text-center hover:text-white hover:text-opacity-100 hover:font-bold"
        target="_blank"
        rel="noreferrer">
        Govern
      </a>
    </div>
  );
};

export default NavLinks;
