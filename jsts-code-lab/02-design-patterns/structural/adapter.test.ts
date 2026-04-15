import { describe, it, expect } from 'vitest';
import { UniversalPlayer, PrinterAdapter, ClassAdapter, MediaAdapter, AudioPlayer, AdvancedMediaPlayer } from './adapter';

describe('adapter pattern', () => {
  it('UniversalPlayer should delegate to MediaAdapter', () => {
    const player = new UniversalPlayer();
    expect(() => player.play('mp3', 'song.mp3')).not.toThrow();
    expect(() => player.play('mp4', 'video.mp4')).not.toThrow();
    expect(() => player.play('vlc', 'movie.vlc')).not.toThrow();
    expect(() => player.play('avi', 'movie.avi')).toThrow('Unsupported format: avi');
  });

  it('PrinterAdapter should adapt old printer interface', () => {
    const oldPrinter = { oldPrint: (text: string) => text };
    const adapter = new PrinterAdapter(oldPrinter);
    expect(adapter.print('Hello')).toBeUndefined();
    // 验证副作用：oldPrint 被调用
    let called = false;
    const oldPrinter2 = { oldPrint: (text: string) => { called = true; return text; } };
    const adapter2 = new PrinterAdapter(oldPrinter2);
    adapter2.print('Hello');
    expect(called).toBe(true);
  });

  it('ClassAdapter should translate request to specific request', () => {
    const adapter = new ClassAdapter();
    expect(adapter.request()).toBe('Specific request');
  });

  it('MediaAdapter should support multiple players', () => {
    const adapter = new MediaAdapter();
    expect(() => adapter.play('mp3', 'a.mp3')).not.toThrow();
    expect(() => adapter.play('mp4', 'a.mp4')).not.toThrow();
    expect(() => adapter.play('vlc', 'a.vlc')).not.toThrow();
  });
});
