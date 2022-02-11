import React, { useEffect, useState } from 'react';
import OutsideClickHandler from 'react-outside-click-handler';
import config from 'config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes, faSave } from '@fortawesome/free-solid-svg-icons';

import { useSubstrate } from 'contexts/substrateContext';
import FormInput from 'components/elements/Form/FormInput';

const NodeSelector = () => {
  const nodes = config.NODES ?? [];
  const { apiState, socket, updateSubstrateContext } = useSubstrate();

  const [showPopup, setShowPopup] = useState(false);
  const [nodeSelected, setNodeSelected] = useState(
    nodes.length > 0 && nodes.find((node) => node.url === socket)
  );
  const [customNode, setCustomNode] = useState({});
  const [nodeError, setNodeError] = useState('');
  const [nodeDisconnected, setNodeDisconnected] = useState(
    apiState === 'DISCONNECTED' || apiState === 'ERROR'
  );

  const handleNodeChange = (node) => {
    updateSubstrateContext({ socket: node.url });
    setNodeSelected(node);
    setCustomNode({});
    setNodeError('');
  };

  const handleCustomNodeChange = () => {
    if (customNode && customNode.url) {
      if (
        customNode.url.slice(0, 5) === 'ws://' ||
        customNode.url.slice(0, 6) === 'wss://'
      ) {
        setNodeError('');
        setNodeSelected(null);
        updateSubstrateContext({ socket: customNode.url });
      } else {
        setNodeError('Invalid node endpoint');
      }
    }
  };

  useEffect(() => {
    let timeout;
    if (apiState === 'DISCONNECTED' || apiState === 'ERROR') {
      timeout = setTimeout(() => {
        setNodeDisconnected(true);
      }, 1000);
    } else {
      timeout && clearTimeout(timeout);
      setNodeDisconnected(false);
    }
  }, [apiState, nodeDisconnected]);

  return (
    <div className="relative -ml-3 border border-primary  dark:border-white py-1 px-2 rounded-lg">
      <div
        className="text-primary flex items-center gap-2 cursor-pointer capitalize"
        onClick={() => setShowPopup(true)}
      >
        {nodeDisconnected ? (
          <FontAwesomeIcon icon={faTimes} color="#FA4D56" />
        ) : apiState === 'READY' ? (
          <FontAwesomeIcon icon={faCheck} color="#24A148" />
        ) : (
          <div className="flex items-center justify-center space-x-2">
            <div
              className="spinner-border animate-spin inline-block w-4 h-4 border-1 rounded-full"
              role="status"
            >
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}
        {nodeSelected ? nodeSelected.name : 'Custom Node'}
      </div>
      {showPopup && (
        <OutsideClickHandler
          onOutsideClick={() => {
            if (nodeError) {
              setNodeError('');
              setCustomNode({});
            }
            setShowPopup(false);
          }}
        >
          <div className="absolute w-80 bg-overlay dark:bg-fourth px-6 py-4 top-full rounded-lg z-50 whitespace-nowrap mt-3">
            <h2 className="relative text-xl text-accent font-semibold mb-3">
              Available Nodes
              <FontAwesomeIcon
                className="absolute right-0 top-0 cursor-pointer fill-primary"
                icon={faTimes}
                onClick={() => setShowPopup(false)}
              />
            </h2>
            {nodes.map((node) => (
              <div className="mb-2 overflow-hidden" key={node.name}>
                <input
                  id={`node-${node.name}`}
                  type="radio"
                  value={node.name}
                  checked={!!(nodeSelected && nodeSelected.name === node.name)}
                  className="hidden"
                  onChange={() => {}}
                />
                <label
                  htmlFor={`node-${node.name}`}
                  className="flex items-center cursor-pointer text-lg text-primary capitalize"
                  onClick={() => handleNodeChange(node)}
                >
                  <span className="w-4 h-4 inline-block mr-2 rounded-full border border-grey flex-no-shrink flex-shrink-0"></span>
                  {node.name}
                </label>
              </div>
            ))}
            <div className="mb-4 relative">
              <FormInput
                value={customNode.url ?? ''}
                onChange={(e) => {
                  setNodeError('');
                  setCustomNode({
                    name: 'custom node',
                    url: e.target.value
                  });
                }}
                type="text"
                className="pr-16"
              >
                <p className={nodeError && 'text-red-500'}>
                  {nodeError ? nodeError : 'custom endpoint'}
                </p>
              </FormInput>
              <span
                className="absolute top-4 right-4  uppercase cursor-pointer text-center rounded-lg"
                onClick={handleCustomNodeChange}
              >
                <FontAwesomeIcon icon={faSave} />
              </span>
            </div>
          </div>
        </OutsideClickHandler>
      )}
    </div>
  );
};

NodeSelector.propTypes = {};

export default NodeSelector;