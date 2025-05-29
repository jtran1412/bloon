// Import sound effects
import sellTowerSound from '../assets/sounds/sell tower.mp3';
import pop1Sound from '../assets/sounds/pop1.mp3';
import pop2Sound from '../assets/sounds/pop2.mp3';
import pop3Sound from '../assets/sounds/pop3.mp3';
import pop4Sound from '../assets/sounds/pop4.mp3';
import placeTowerSound from '../assets/sounds/place tower.mp3';
import newUpgradeSound from '../assets/sounds/new upgrade.mp3';
import newTowerOutroSound from '../assets/sounds/new tower outro.mp3';
import newTowerIntroSound from '../assets/sounds/new tower intro.mp3';
import clickSound from '../assets/sounds/click.mp3';
import buyUpgradeSound from '../assets/sounds/buy upgrade.mp3';

// Import music
import mainTheme from '../assets/music/maintheme.mp3';

type SoundEffects = {
  [key: string]: HTMLAudioElement;
};

class AudioManager {
  private static instance: AudioManager;
  private soundEffects: SoundEffects = {};
  private backgroundMusic: HTMLAudioElement;
  private isMuted: boolean = false;
  private musicVolume: number = 0.3;
  private effectsVolume: number = 0.5;

  private constructor() {
    // Initialize sound effects
    this.soundEffects = {
      sellTower: new Audio(sellTowerSound),
      pop1: new Audio(pop1Sound),
      pop2: new Audio(pop2Sound),
      pop3: new Audio(pop3Sound),
      pop4: new Audio(pop4Sound),
      placeTower: new Audio(placeTowerSound),
      newUpgrade: new Audio(newUpgradeSound),
      newTowerOutro: new Audio(newTowerOutroSound),
      newTowerIntro: new Audio(newTowerIntroSound),
      click: new Audio(clickSound),
      buyUpgrade: new Audio(buyUpgradeSound),
    };

    // Initialize background music
    this.backgroundMusic = new Audio(mainTheme);
    this.backgroundMusic.loop = true;
    this.setMusicVolume(this.musicVolume);

    // Set initial volumes for effects
    Object.values(this.soundEffects).forEach(sound => {
      sound.volume = this.effectsVolume;
    });
  }

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  public playSound(soundName: string): void {
    if (this.isMuted) return;

    const sound = this.soundEffects[soundName];
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch(error => console.error('Error playing sound:', error));
    }
  }

  public playRandomPop(): void {
    if (this.isMuted) return;

    const popSounds = ['pop1', 'pop2', 'pop3', 'pop4'];
    const randomPop = popSounds[Math.floor(Math.random() * popSounds.length)];
    this.playSound(randomPop);
  }

  public startMusic(): void {
    if (!this.isMuted) {
      this.backgroundMusic.play().catch(error => console.error('Error playing music:', error));
    }
  }

  public stopMusic(): void {
    this.backgroundMusic.pause();
    this.backgroundMusic.currentTime = 0;
  }

  public toggleMute(): void {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopMusic();
    } else {
      this.startMusic();
    }
  }

  public setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    this.backgroundMusic.volume = this.musicVolume;
  }

  public setEffectsVolume(volume: number): void {
    this.effectsVolume = Math.max(0, Math.min(1, volume));
    Object.values(this.soundEffects).forEach(sound => {
      sound.volume = this.effectsVolume;
    });
  }
}

export default AudioManager; 