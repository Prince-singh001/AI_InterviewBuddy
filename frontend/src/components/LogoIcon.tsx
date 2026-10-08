import React from 'react';

interface LogoIconProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  size?: number;
  className?: string;
}

/**
 * InterviewerBuddy AI — Official Brand Identity Icon
 * Renders the official uploaded logo.svg exactly as provided.
 */
export const LogoIcon: React.FC<LogoIconProps> = ({
  size = 38,
  className = '',
  style,
  ...props
}) => {
  return (
    <img
      src="/assets/logo.svg"
      alt="InterviewerBuddy AI Brand Logo"
      width={size}
      height={size}
      className={className}
      style={{
        display: 'block',
        width: size,
        height: size,
        objectFit: 'contain',
        ...style,
      }}
      {...props}
    />
  );
};

export default LogoIcon;
