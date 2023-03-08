import React from 'react';

interface IErrorProps {
  errorMessage: string;
}

const ErrorText: React.FC<IErrorProps> = ({ errorMessage }) => {
  return (
    <p
      className={'text-xss h-4 mt-2'}
      style={{ color: '#DD524C' }}>
      {errorMessage}
    </p>
  );
};

export default ErrorText;
