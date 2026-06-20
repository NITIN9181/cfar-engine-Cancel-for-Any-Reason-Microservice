import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
  interactive?: boolean;
}

export function Card({
  children,
  elevated = false,
  interactive = false,
  className = '',
  ...props
}: CardProps) {
  const baseClass = 'card';
  const elevatedClass = elevated ? 'card-elevated' : '';
  const interactiveClass = interactive ? 'card-interactive' : '';

  const combinedClasses = [
    baseClass,
    elevatedClass,
    interactiveClass,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={combinedClasses} {...props}>
      {children}
    </div>
  );
}

export default Card;
