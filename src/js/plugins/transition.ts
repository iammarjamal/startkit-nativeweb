import { createAnimation, Animation, AnimationBuilder } from '@ionic/vue';
import { Capacitor } from '@capacitor/core';

// ... (TRANSITION_CONFIG remains the same, no changes needed there) ...
const TRANSITION_CONFIG = {
  isLowPowerMode: false,
  isReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  DURATION: {
    IOS: 500,
    IOS_SWIPE: 250,
    ANDROID_FADE: 300,
    ANDROID_OPEN: 550,
    ANDROID_ZOOM: 280,
    ANDROID_FWD: 350,
    LOW_POWER: 120,
    MAC_FADE: 200,
  },
  CURVE: {
    IOS_FAST: 'cubic-bezier(0.32, 0.72, 0, 1)',
    IOS_LINEAR: 'cubic-bezier(0.0, 0.0, 0.2, 1.0)',
    IOS_GESTURE: 'cubic-bezier(0.1, 0.1, 0.1, 1.0)',
    ANDROID_EASE: 'cubic-bezier(0.4, 0.0, 0.2, 1.0)',
    ANDROID_EMPHASIZED: 'cubic-bezier(0.2, 0.0, 0.0, 1.0)',
    ANDROID_DECELERATE: 'cubic-bezier(0.0, 0.0, 0.2, 1.0)',
    ANDROID_ZOOM: 'cubic-bezier(0.35, 0.91, 0.33, 0.97)',
    LOW_POWER: 'ease-in-out',
  },
  GEOMETRY: {
    IOS_PARALLAX: 33,
    FADE_UP_OFFSET: 20,
    OPEN_UP_OFFSET: 4,
    ZOOM_SCALE_ENTER: 0.88,
    ZOOM_SCALE_EXIT: 1.05,
    FADE_FWD_OFFSET: 20,
  }
};

// ... (Listeners and State Management remain the same) ...
window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
  TRANSITION_CONFIG.isReducedMotion = e.matches;
});

export function setLowPowerMode(enabled: boolean): void {
  TRANSITION_CONFIG.isLowPowerMode = enabled;
}

export function getLowPowerMode(): boolean {
  return TRANSITION_CONFIG.isLowPowerMode;
}

// ============================================================================
// HELPER UTILITIES - OPTIMIZED FOR "SNAPSHOT" EFFECT
// ============================================================================

const getPageElement = (el: HTMLElement): HTMLElement => {
  return el?.querySelector(':scope > .ion-page') as HTMLElement || el;
};

// ============================================================================
// INTERACTION LOCK
// ============================================================================
const setInteractionLock = (isLocked: boolean) => {
  if (isLocked) {
    document.body.style.pointerEvents = 'none';
  } else {
    setTimeout(() => { document.body.style.pointerEvents = ''; }, 50);
  }
};

const createRootAnimation = (duration: number, easing: string): Animation => {
  const root = createAnimation().duration(duration).easing(easing);
  
  // Freeze interactions during transition to prevent multi-touch glitches
  root.beforeAddWrite(() => setInteractionLock(true));
  root.onFinish(() => setInteractionLock(false));
  
  return root;
};

const shouldReduceMotion = (): boolean => {
  return TRANSITION_CONFIG.isReducedMotion || TRANSITION_CONFIG.isLowPowerMode;
};

let _androidVersion: number | null = null;
const getAndroidVersion = (): number => {
  if (_androidVersion !== null) return _androidVersion;
  const match = navigator.userAgent.match(/Android (\d+)/);
  _androidVersion = match ? parseInt(match[1]) : 0;
  return _androidVersion;
};

/**
 * ⚡️ PERFORMANCE BOOSTER
 * This forces the browser to treat the element as a static image (Texture) during animation.
 * 'contain: strict' removes the element from the layout flow completely internally.
 */
const getSnapshotStyles = () => ({
  'will-change': 'transform, opacity',
  'contain': 'strict', // The Magic: Isolates layout, style, and paint.
  'backface-visibility': 'hidden', // Forces GPU usage
  'transform-style': 'preserve-3d'
});

const clearSnapshotStyles = () => (['will-change', 'contain', 'backface-visibility', 'transform-style']);

// ============================================================================
// TRANSITION IMPLEMENTATIONS
// ============================================================================

/** 1. Low Power */
function createLowPowerTransition(opts: any): Animation {
  const root = createRootAnimation(TRANSITION_CONFIG.DURATION.LOW_POWER, TRANSITION_CONFIG.CURVE.LOW_POWER);
  const enterEl = getPageElement(opts.enteringEl);
  const leaveEl = getPageElement(opts.leavingEl);
  
  if (enterEl) root.addAnimation(createAnimation().addElement(enterEl).beforeRemoveClass('ion-page-invisible').fromTo('opacity', '0.5', '1'));
  if (leaveEl) root.addAnimation(createAnimation().addElement(leaveEl).fromTo('opacity', '1', '0'));
  return root;
}

/** 2. iOS Cupertino - Optimized with Snapshotting */
function createIOSTransition(opts: any, isRTL: boolean): Animation {
  const { enteringEl, leavingEl, direction, progressAnimation } = opts;
  const isBack = direction === 'back';
  const isGesture = !!progressAnimation;
  const easing = isGesture ? TRANSITION_CONFIG.CURVE.IOS_GESTURE : TRANSITION_CONFIG.CURVE.IOS_FAST;
  const root = createRootAnimation(TRANSITION_CONFIG.DURATION.IOS, easing);
  
  const enterEl = getPageElement(enteringEl);
  const leaveEl = getPageElement(leavingEl);
  const offScreen = isRTL ? -100 : 100;
  const parallax = isRTL ? TRANSITION_CONFIG.GEOMETRY.IOS_PARALLAX : -TRANSITION_CONFIG.GEOMETRY.IOS_PARALLAX;

  // Shared Shadow Styles (Only apply shadow to the top layer)
  const shadowStyles = { 'box-shadow': isRTL ? '-5px 0 25px rgba(0,0,0,0.15)' : '-5px 0 25px rgba(0,0,0,0.15)' };

  if (enterEl) {
    const enterAnim = createAnimation().addElement(enterEl).beforeRemoveClass('ion-page-invisible');
    
    // APPLY SNAPSHOT OPTIMIZATION
    enterAnim.beforeStyles(getSnapshotStyles()).afterClearStyles(clearSnapshotStyles());

    if (isBack) {
      // Back: Enter is BEHIND (Parallax) -> No Shadow needed usually, but logic kept simple
      enterAnim
        .beforeStyles({ 'z-index': '1' })
        .afterStyles({ 'z-index': '100' })
        .fromTo('transform', `translate3d(${parallax}%, 0, 0)`, 'translate3d(0, 0, 0)');
    } else {
      // Forward: Enter is ON TOP -> Needs Shadow
      enterAnim
        .beforeStyles({ 'z-index': '50', ...shadowStyles })
        .afterClearStyles(['box-shadow'])
        .fromTo('transform', `translate3d(${offScreen}%, 0, 0)`, 'translate3d(0, 0, 0)');
    }
    root.addAnimation(enterAnim);
  }

  if (leaveEl) {
    const leaveAnim = createAnimation().addElement(leaveEl);
    
    // APPLY SNAPSHOT OPTIMIZATION
    leaveAnim.beforeStyles(getSnapshotStyles()).afterClearStyles(clearSnapshotStyles());

    if (isBack) {
      // Back: Leave is ON TOP -> Needs Shadow
      leaveAnim
        .beforeStyles({ 'z-index': '50', ...shadowStyles })
        .afterClearStyles(['box-shadow'])
        .fromTo('transform', 'translate3d(0, 0, 0)', `translate3d(${offScreen}%, 0, 0)`);
    } else {
      // Forward: Leave is BEHIND (Parallax)
      leaveAnim
        .beforeStyles({ 'z-index': '1' })
        .fromTo('transform', 'translate3d(0, 0, 0)', `translate3d(${parallax}%, 0, 0)`);
    }
    root.addAnimation(leaveAnim);
  }

  return root;
}

/** 3. Android Fade Up */
function createAndroidFadeUpTransition(opts: any): Animation {
  const root = createRootAnimation(TRANSITION_CONFIG.DURATION.ANDROID_FADE, TRANSITION_CONFIG.CURVE.ANDROID_EASE);
  const enterEl = getPageElement(opts.enteringEl);
  const leaveEl = getPageElement(opts.leavingEl);
  const offset = TRANSITION_CONFIG.GEOMETRY.FADE_UP_OFFSET;

  if (enterEl) {
    const anim = createAnimation().addElement(enterEl).beforeRemoveClass('ion-page-invisible')
      .beforeStyles(getSnapshotStyles()).afterClearStyles(clearSnapshotStyles()); // Optimization
      
    if (opts.direction === 'back') anim.fromTo('opacity', '0', '1');
    else anim.fromTo('transform', `translate3d(0, ${offset}%, 0)`, 'translate3d(0, 0, 0)').fromTo('opacity', '0', '1');
    root.addAnimation(anim);
  }
  if (leaveEl) {
    const anim = createAnimation().addElement(leaveEl)
      .beforeStyles(getSnapshotStyles()).afterClearStyles(clearSnapshotStyles()); // Optimization

    if (opts.direction === 'back') anim.fromTo('transform', 'translate3d(0, 0, 0)', `translate3d(0, ${offset}%, 0)`).fromTo('opacity', '1', '0');
    else anim.fromTo('opacity', '1', '0');
    root.addAnimation(anim);
  }
  return root;
}

/** 4. Android Open Up */
function createAndroidOpenUpTransition(opts: any): Animation {
  const root = createRootAnimation(TRANSITION_CONFIG.DURATION.ANDROID_OPEN, TRANSITION_CONFIG.CURVE.ANDROID_DECELERATE);
  const enterEl = getPageElement(opts.enteringEl);
  const leaveEl = getPageElement(opts.leavingEl);
  const offset = TRANSITION_CONFIG.GEOMETRY.OPEN_UP_OFFSET;
  const isBack = opts.direction === 'back';

  if (enterEl) {
    root.addAnimation(createAnimation().addElement(enterEl).beforeRemoveClass('ion-page-invisible')
      .beforeStyles(getSnapshotStyles()).afterClearStyles(clearSnapshotStyles())
      .fromTo('transform', `translate3d(0, ${isBack ? -offset : offset}%, 0)`, 'translate3d(0, 0, 0)')
      .fromTo('opacity', isBack ? '0.6' : '0', '1'));
  }
  if (leaveEl) {
    root.addAnimation(createAnimation().addElement(leaveEl)
      .beforeStyles(getSnapshotStyles()).afterClearStyles(clearSnapshotStyles())
      .fromTo('transform', 'translate3d(0, 0, 0)', `translate3d(0, ${isBack ? offset : -offset}%, 0)`)
      .fromTo('opacity', '1', isBack ? '0' : '0.6'));
  }
  return root;
}

/** 5. Android Zoom */
function createAndroidZoomTransition(opts: any): Animation {
  const root = createRootAnimation(TRANSITION_CONFIG.DURATION.ANDROID_ZOOM, TRANSITION_CONFIG.CURVE.ANDROID_ZOOM);
  const enterEl = getPageElement(opts.enteringEl);
  const leaveEl = getPageElement(opts.leavingEl);
  const { ZOOM_SCALE_ENTER, ZOOM_SCALE_EXIT } = TRANSITION_CONFIG.GEOMETRY;
  const isBack = opts.direction === 'back';

  if (enterEl) {
    const s = isBack ? ZOOM_SCALE_EXIT : ZOOM_SCALE_ENTER;
    root.addAnimation(createAnimation().addElement(enterEl).beforeRemoveClass('ion-page-invisible')
      .beforeStyles(getSnapshotStyles()).afterClearStyles(clearSnapshotStyles())
      .fromTo('transform', `scale3d(${s}, ${s}, 1)`, 'scale3d(1, 1, 1)').fromTo('opacity', '0', '1'));
  }
  if (leaveEl) {
    const s = isBack ? ZOOM_SCALE_ENTER : ZOOM_SCALE_EXIT;
    root.addAnimation(createAnimation().addElement(leaveEl)
      .beforeStyles(getSnapshotStyles()).afterClearStyles(clearSnapshotStyles())
      .fromTo('transform', 'scale3d(1, 1, 1)', `scale3d(${s}, ${s}, 1)`).fromTo('opacity', '1', '0'));
  }
  return root;
}

/** 6. Android Fade Forwards */
function createAndroidFadeForwardsTransition(opts: any, isRTL: boolean): Animation {
  const root = createRootAnimation(TRANSITION_CONFIG.DURATION.ANDROID_FWD, TRANSITION_CONFIG.CURVE.ANDROID_EMPHASIZED);
  const enterEl = getPageElement(opts.enteringEl);
  const leaveEl = getPageElement(opts.leavingEl);
  const offset = TRANSITION_CONFIG.GEOMETRY.FADE_FWD_OFFSET;
  const isBack = opts.direction === 'back';

  if (enterEl) {
    const start = isBack ? (isRTL ? offset : -offset) : (isRTL ? -offset : offset);
    root.addAnimation(createAnimation().addElement(enterEl).beforeRemoveClass('ion-page-invisible')
      .beforeStyles(getSnapshotStyles()).afterClearStyles(clearSnapshotStyles())
      .fromTo('transform', `translate3d(${start}%, 0, 0)`, 'translate3d(0, 0, 0)').fromTo('opacity', '0', '1'));
  }
  if (leaveEl) {
    const end = isBack ? (isRTL ? -offset : offset) : (isRTL ? offset : -offset);
    root.addAnimation(createAnimation().addElement(leaveEl)
      .beforeStyles(getSnapshotStyles()).afterClearStyles(clearSnapshotStyles())
      .fromTo('transform', 'translate3d(0, 0, 0)', `translate3d(${end}%, 0, 0)`).fromTo('opacity', '1', '0'));
  }
  return root;
}

/** 7. Desktop Fallback */
function createMacFadeTransition(opts: any): Animation {
  const root = createRootAnimation(TRANSITION_CONFIG.DURATION.MAC_FADE, 'ease-out');
  const enterEl = getPageElement(opts.enteringEl);
  const leaveEl = getPageElement(opts.leavingEl);
  
  // No strict containment needed for simple opacity fade, but 'will-change' helps
  if (enterEl) root.addAnimation(createAnimation().addElement(enterEl).beforeRemoveClass('ion-page-invisible').beforeStyles({ 'will-change': 'opacity' }).fromTo('opacity', '0', '1'));
  if (leaveEl) root.addAnimation(createAnimation().addElement(leaveEl).beforeStyles({ 'will-change': 'opacity' }).fromTo('opacity', '1', '0'));
  return root;
}

/** * 8. View Transition API Wrapper 
 * This natively handles "Snapshotting" via the browser engine.
 */
function createViewTransitionWrapper(opts: any): Animation {
  const root = createRootAnimation(400, 'ease-in-out');
  const { enteringEl, leavingEl } = opts;

  root.beforeAddWrite(() => {
    // If browser supports it, it AUTOMATICALLY snapshots the old and new states.
    if ('startViewTransition' in document) {
      // @ts-ignore
      const t = document.startViewTransition(() => {
        if (enteringEl) enteringEl.classList.remove('ion-page-invisible');
        if (leavingEl) leavingEl.style.display = 'none';
      });
    } else {
      if (enteringEl) enteringEl.classList.remove('ion-page-invisible');
      if (leavingEl) leavingEl.style.display = 'none';
    }
  });
  return root;
}

// ============================================================================
// MAIN FACTORY
// ============================================================================

export const flutterNativeAnimation: AnimationBuilder = (baseEl: any, opts: any): Animation => {
  const transitionOpts = {
    enteringEl: opts.enteringEl,
    leavingEl: opts.leavingEl,
    direction: opts.direction,
    progressAnimation: opts.progressAnimation
  };

  // 1. Accessibility & Low Power Check
  if (shouldReduceMotion()) {
    return createLowPowerTransition(transitionOpts);
  }

  const isGesture = transitionOpts.progressAnimation === true;
  const isRTL = document.documentElement.dir === 'rtl';
  
  // 🔥 THE FIX: Strict Native Check 🔥
  // Capacitor.isNativePlatform() returns true ONLY for compiled iOS/Android apps.
  // It returns false for Mobile Web / PWA.
  const isNative = Capacitor.isNativePlatform();
  const platform = Capacitor.getPlatform(); // 'ios', 'android', 'web'

  // ==========================================================
  // A. WEB STRATEGY (Browser / PWA)
  // Goal: Feel like a normal website. No heavy physics.
  // ==========================================================
  if (!isNative) {
    // 1. If browser supports View Transitions (Chrome/Edge/Arc), use them.
    // They are native to the browser engine and extremely performant.
    if (!isGesture && 'startViewTransition' in document) {
      return createViewTransitionWrapper(transitionOpts);
    }
    
    // 2. Fallback for Web (Safari / Firefox / Old Chrome)
    // Just use a simple, fast Fade. 
    // DO NOT use iOS Slide or Android Zoom here, it feels "fake" on web.
    return createMacFadeTransition(transitionOpts);
  }

  // ==========================================================
  // B. NATIVE APP STRATEGY (iOS / Android IPA/APK)
  // Goal: Feel exactly like the OS.
  // ==========================================================

  // 1. iOS Logic (or any Gesture Swipes on Native)
  if (platform === 'ios' || isGesture) {
    return createIOSTransition(transitionOpts, isRTL);
  }
  
  // 2. Android Logic
  if (platform === 'android') {
    const version = getAndroidVersion();
    // Android 14+ Predictive Back Style
    if (version >= 14) return createAndroidFadeForwardsTransition(transitionOpts, isRTL);
    // Modern Android Zoom
    if (version >= 10) return createAndroidZoomTransition(transitionOpts);
    // Old Android
    if (version === 9) return createAndroidOpenUpTransition(transitionOpts);
    return createAndroidFadeUpTransition(transitionOpts);
  }

  // Default Fallback (Should rarely be reached in Native)
  return createMacFadeTransition(transitionOpts);
};

export default flutterNativeAnimation;