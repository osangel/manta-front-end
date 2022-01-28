import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import Select, { components } from 'react-select';
import { useTxStatus } from 'contexts/txStatusContext';
import AssetType from 'types/AssetType';
import { useState } from 'react';

const SendAssetTypeDropdown = ({
  optionsArePrivate = false
}) => {
  const { txStatus } = useTxStatus();
  const [selectedOption, setSelectedOption] = useState(null);
  const options = AssetType.AllCurrencies(optionsArePrivate).map(assetType => {
    return {
      key: assetType.assetId,
      label: assetType.ticker,
      value: assetType
    };
  });


  useEffect(() => {
    if (!selectedOption && options?.length) {
      setSelectedOption(options[0]);
    }
  }, [selectedOption, options]);

  return (
    <Select
      className="w-40"
      isSearchable={false}
      value={selectedOption}
      onChange={value => setSelectedOption(value)}
      options={options}
      placeholder=""
      styles={dropdownStyles}
      components={
        {
          SingleValue: SendAssetTypeSingleValue,
          Option: SendAssetTypeOption,
          IndicatorSeparator: EmptyIndicatorSeparator,
        }
      }
    />
  );
};

SendAssetTypeDropdown.propTypes = {
  selectedOption: PropTypes.instanceOf(AssetType),
  setSelectedOption: PropTypes.func,
  optionsArePrivate: PropTypes.bool
};

const dropdownStyles = {
  dropdownIndicator: () => ({paddingRight: '1rem', color: 'white' }),
  control: (provided, state) => ({
    ...provided,
    borderStyle: 'none',
    borderWidth: '0px',
    borderRadius: '0.5rem 0rem 0rem 0.5rem',
    backgroundColor: '#61abb9',
    paddingBottom: '0.5rem',
    paddingTop: '0.3rem',
    minHeight: '4.2rem',
    boxShadow: '0 0 #0000',
    cursor: 'pointer',
  }),
  option: () => ({
    fontSize: '12pt'
  }),
  valueContainer: () => ({
    minHeight: '2rem',
    minWidth: '75%',
    textAlign: 'center',
    display: 'flex',
    justifyContent: 'center',
  }),
  menu: (provided, state) => ({
    ...provided,
    width: '250%',
  }),
};

const EmptyIndicatorSeparator = () => {
  return <div/>;
};

const SendAssetTypeSingleValue = ({data}) => {
  return (
    <div className="pl-2 border-0">
      <div className="pl-3">
        <img
          className="w-10 h-10 px-2 left-2 absolute manta-bg-secondary rounded-full"
          src={data.value.icon}
          alt="icon"
        />
      </div>
      <div className="text-2xl pl-8 pt-1 text-white">
        {data.value.ticker}
      </div>
    </div>
  );
};

const SendAssetTypeOption = (props) => {
  const { value, innerProps } = props;
  return (
    <div {...innerProps}>
      <div className="flex items-center inline w-full hover:bg-blue-100">
        <div>
          <img
            className="w-10 h-10 py-1 px-2 ml-3  manta-bg-secondary rounded-full"
            src={value.icon}
            alt="icon"
          />
        </div>
        <div className="pl-4 p-2">
          <components.Option {...props} />
          <div className="text-xs block ">{value.name}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendAssetTypeDropdown;
