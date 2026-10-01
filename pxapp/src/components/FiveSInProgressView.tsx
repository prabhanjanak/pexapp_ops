import React from 'react';
import { User } from '../types';
import { FiveSApp } from './fives/FiveSApp';

interface FiveSInProgressViewProps {
  currentUser: User;
  onBack: () => void;
}

export const FiveSInProgressView: React.FC<FiveSInProgressViewProps> = ({
  currentUser,
  onBack
}) => {
  return <FiveSApp currentUser={currentUser} onBackToPortal={onBack} />;
};
