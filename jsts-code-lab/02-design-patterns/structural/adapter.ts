/**
 * @file 适配器模式 (Adapter Pattern)
 * @category Design Patterns → Structural
 * @difficulty easy
 * @tags adapter, structural, compatibility
 * 
 * @description
 * 将一个类的接口转换成客户希望的另外一个接口
 */

// ============================================================================
// 1. 目标接口
// ============================================================================

interface MediaPlayer {
  play(audioType: string, fileName: string): void;
}

// ============================================================================
// 2. 被适配者 (不兼容的接口)
// ============================================================================

class AdvancedMediaPlayer {
  playMp4(fileName: string): void {
    console.log(`Playing mp4: ${fileName}`);
  }

  playVlc(fileName: string): void {
    console.log(`Playing vlc: ${fileName}`);
  }
}

class AudioPlayer {
  playMp3(fileName: string): void {
    console.log(`Playing mp3: ${fileName}`);
  }
}

// ============================================================================
// 3. 适配器
// ============================================================================

class MediaAdapter implements MediaPlayer {
  private advancedPlayer = new AdvancedMediaPlayer();
  private audioPlayer = new AudioPlayer();

  play(audioType: string, fileName: string): void {
    switch (audioType.toLowerCase()) {
      case 'mp3':
        this.audioPlayer.playMp3(fileName);
        break;
      case 'mp4':
        this.advancedPlayer.playMp4(fileName);
        break;
      case 'vlc':
        this.advancedPlayer.playVlc(fileName);
        break;
      default:
        throw new Error(`Unsupported format: ${audioType}`);
    }
  }
}

// ============================================================================
// 4. 客户端
// ============================================================================

class UniversalPlayer implements MediaPlayer {
  private adapter = new MediaAdapter();

  play(audioType: string, fileName: string): void {
    this.adapter.play(audioType, fileName);
  }
}

// ============================================================================
// 5. 对象适配器 (更灵活)
// ============================================================================

interface OldPrinter {
  oldPrint(text: string): void;
}

interface ModernPrinter {
  print(content: string): void;
}

class PrinterAdapter implements ModernPrinter {
  constructor(private oldPrinter: OldPrinter) {}

  print(content: string): void {
    this.oldPrinter.oldPrint(content);
  }
}

// ============================================================================
// 6. 类适配器 (多重继承模拟)
// ============================================================================

interface Target {
  request(): string;
}

class Adaptee {
  specificRequest(): string {
    return 'Specific request';
  }
}

class ClassAdapter extends Adaptee implements Target {
  request(): string {
    return this.specificRequest();
  }
}

// ============================================================================
// 导出
// ============================================================================

export {
  MediaAdapter,
  UniversalPlayer,
  PrinterAdapter,
  ClassAdapter,
  AdvancedMediaPlayer,
  AudioPlayer
};

export type { MediaPlayer, OldPrinter, ModernPrinter, Target };
