import React from 'react';
import './GradientText.css';

interface IGradientTextProps {
  className?: string;
  text: string;
}

const GradientText: React.FC<IGradientTextProps> = ({
  className = '',
  text
}) => {
  return (
    <div className={`gradient-text cursor-pointer text-bg-thirdry ${className}`}>{text}</div>
  );
};

export default GradientText;
