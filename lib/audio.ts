import { Howl, Howler } from 'howler';

class AudioManager {
  private sounds: Map<string, Howl> = new Map();
  private initialized = false;

  // Initialize audio files
  init() {
    if (this.initialized) return;

    // Temple bells
    this.sounds.set('temple-bell', new Howl({
      src: ['/audio/temple-bell.mp3'],
      volume: 0.7,
      preload: true,
    }));

    // Shankha (conch)
    this.sounds.set('shankha', new Howl({
      src: ['/audio/shankha.mp3'],
      volume: 0.8,
      preload: true,
    }));

    // Nagada (drum)
    this.sounds.set('nagada', new Howl({
      src: ['/audio/nagada.mp3'],
      volume: 0.6,
      preload: true,
    }));

    // Success/completion sound
    this.sounds.set('success', new Howl({
      src: ['/audio/temple-bell.mp3'], // Reuse temple bell for success
      volume: 0.5,
      preload: true,
    }));

    // Deity-specific ambient chants (placeholders)
    const deities = ['ganesha', 'shiva', 'lakshmi', 'hanuman', 'krishna', 'durga', 'ram', 'vishnu'];
    deities.forEach(deity => {
      this.sounds.set(`chant-${deity}`, new Howl({
        src: [`/audio/chants/${deity}.mp3`],
        volume: 0.3,
        loop: true,
        preload: true,
      }));
    });

    this.initialized = true;
  }

  play(soundName: string) {
    const sound = this.sounds.get(soundName);
    if (sound) {
      sound.play();
    } else {
      console.warn(`Sound "${soundName}" not found`);
    }
  }

  stop(soundName: string) {
    const sound = this.sounds.get(soundName);
    if (sound) {
      sound.stop();
    }
  }

  stopAll() {
    Howler.stop();
  }

  setVolume(soundName: string, volume: number) {
    const sound = this.sounds.get(soundName);
    if (sound) {
      sound.volume(volume);
    }
  }

  setGlobalVolume(volume: number) {
    Howler.volume(volume);
  }

  mute() {
    Howler.mute(true);
  }

  unmute() {
    Howler.mute(false);
  }

  // Play deity-specific ambient chant
  playDeityChant(deity: string) {
    this.stopAllChants();
    this.play(`chant-${deity}`);
  }

  stopAllChants() {
    const deities = ['ganesha', 'shiva', 'lakshmi', 'hanuman', 'krishna', 'durga', 'ram', 'vishnu'];
    deities.forEach(deity => {
      this.stop(`chant-${deity}`);
    });
  }

  // Play ritual sounds
  playRitualSound(step: number) {
    switch (step) {
      case 1: // Light diya
        this.play('temple-bell');
        break;
      case 2: // Incense
        // Soft ambient sound
        break;
      case 3: // Milk offering
        // Gentle pour sound (using bell at low volume)
        this.setVolume('temple-bell', 0.3);
        this.play('temple-bell');
        setTimeout(() => this.setVolume('temple-bell', 0.7), 1000);
        break;
      case 4: // Flowers
        // Soft chime
        this.setVolume('temple-bell', 0.4);
        this.play('temple-bell');
        setTimeout(() => this.setVolume('temple-bell', 0.7), 500);
        break;
      case 5: // Aarti
        this.play('temple-bell');
        break;
      case 6: // Shankha
        this.play('shankha');
        break;
      case 7: // Nagada
        this.play('nagada');
        break;
      default:
        break;
    }
  }

  playSuccess() {
    this.play('success');
    // Play temple bell multiple times for celebration
    setTimeout(() => this.play('temple-bell'), 300);
    setTimeout(() => this.play('temple-bell'), 600);
  }
}

// Create singleton instance
export const audioManager = new AudioManager();

// Initialize on first user interaction
export function initAudioOnUserGesture() {
  const initHandler = () => {
    audioManager.init();
    // Remove listeners after first interaction
    document.removeEventListener('touchstart', initHandler);
    document.removeEventListener('click', initHandler);
  };

  document.addEventListener('touchstart', initHandler, { once: true });
  document.addEventListener('click', initHandler, { once: true });
}
