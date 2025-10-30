import React from 'react';

const createMockIcon = (displayName) => {
  const MockIcon = (props) => React.createElement('svg', props, displayName);
  MockIcon.displayName = displayName;
  return MockIcon;
};

export const Play = createMockIcon('Play');
export const Pause = createMockIcon('Pause');
export const Volume2 = createMockIcon('Volume2');
export const VolumeX = createMockIcon('VolumeX');
export const Maximize = createMockIcon('Maximize');
export const Minimize = createMockIcon('Minimize');
export const FastForward = createMockIcon('FastForward');
export const Rewind = createMockIcon('Rewind');
export const Loader2 = createMockIcon('Loader2');
export const PictureInPicture2 = createMockIcon('PictureInPicture2');
export const Settings = createMockIcon('Settings');

export default createMockIcon('DefaultIcon');
