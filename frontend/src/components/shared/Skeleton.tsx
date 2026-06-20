import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string;
  height?: string;
  borderRadius?: string;
}

export function Skeleton({
  width,
  height,
  borderRadius,
  className = '',
  style,
  ...props
}: SkeletonProps) {
  const baseClass = 'skeleton animate-shimmer';
  const combinedClasses = `${baseClass} ${className}`.trim();

  const inlineStyle: React.CSSProperties = {
    width: width || undefined,
    height: height || undefined,
    borderRadius: borderRadius || undefined,
    ...style
  };

  return (
    <div
      className={combinedClasses}
      style={inlineStyle}
      {...props}
    />
  );
}

export default Skeleton;
