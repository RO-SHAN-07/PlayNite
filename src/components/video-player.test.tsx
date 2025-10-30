import { render, screen, fireEvent } from '@testing-library/react';
import { VideoPlayer } from './video-player';

describe('VideoPlayer', () => {
  it('toggles play and pause when the play button is clicked', async () => {
    const { container } = render(<VideoPlayer src="test.mp4" />);
    const video = container.querySelector('video');
    if (!video) throw new Error('Video element not found');

    // JSDOM doesn't implement play/pause, so we need to mock them and the `paused` property.
    Object.defineProperty(video, 'paused', { value: true, writable: true });

    const playButton = screen.getByRole('button', { name: /play/i });

    const playMock = jest.spyOn(video, 'play').mockImplementation(() => {
      Object.defineProperty(video, 'paused', { value: false, writable: true });
      fireEvent(video, new Event('play'));
      return Promise.resolve();
    });
    const pauseMock = jest.spyOn(video, 'pause').mockImplementation(() => {
      Object.defineProperty(video, 'paused', { value: true, writable: true });
      fireEvent(video, new Event('pause'));
    });

    // Initially paused
    expect(playMock).not.toHaveBeenCalled();
    expect(pauseMock).not.toHaveBeenCalled();

    // Play the video
    fireEvent.click(playButton);
    expect(playMock).toHaveBeenCalledTimes(1);

    // After clicking play, the button should be a pause button.
    const pauseButton = await screen.findByRole('button', { name: /pause/i });
    fireEvent.click(pauseButton);
    expect(pauseMock).toHaveBeenCalledTimes(1);

    playMock.mockRestore();
    pauseMock.mockRestore();
  });
});
