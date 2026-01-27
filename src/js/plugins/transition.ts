import { createAnimation, Animation, getPlatforms } from '@ionic/vue';

/**
 * ============================================================================
 * FLUTTER PAGE TRANSITIONS - Complete Version-Specific Implementation
 * ============================================================================
 * 
 * Sources from Flutter GitHub (2024/2025):
 * - iOS: flutter/packages/flutter/lib/src/cupertino/route.dart
 * - Android: flutter/packages/flutter/lib/src/material/page_transitions_theme.dart
 * 
 * Android Version Mapping (from Flutter source):
 * - Android O (8): FadeUpwardsPageTransitionsBuilder
 * - Android P (9): OpenUpwardsPageTransitionsBuilder  
 * - Android Q (10): ZoomPageTransitionsBuilder
 * - Android R (11): ZoomPageTransitionsBuilder
 * - Android S (12): ZoomPageTransitionsBuilder + PredictiveBack
 * - Android T (13): ZoomPageTransitionsBuilder + PredictiveBack
 * - Android U (14): FadeForwardsPageTransitionsBuilder
 * 
 * GPU-ONLY: transform (translate3d, scale3d) and opacity
 * NO box-shadow, NO filter, NO blur
 */

// ============================================================================
// FLUTTER CURVES (exact values from source)
// ============================================================================

// iOS Curves
const IOS_FAST_EASE = 'cubic-bezier(0.36, 0.66, 0.04, 1)';      // fastEaseInToSlowEaseOut
const IOS_LINEAR_OUT = 'cubic-bezier(0.0, 0.0, 0.4, 1.0)';       // linearToEaseOut

// Android Curves
const ANDROID_EASE_IN_OUT = 'cubic-bezier(0.4, 0.0, 0.2, 1.0)';  // fastOutSlowIn (standard)
const ANDROID_EMPHASIZED = 'cubic-bezier(0.2, 0.0, 0.0, 1.0)';   // easeInOutCubicEmphasized
const ANDROID_DECELERATE = 'cubic-bezier(0.0, 0.0, 0.2, 1.0)';   // decelerate

// Zoom transition curve sequence approximation
// Flutter uses TweenSequence with two parts, this is the combined approximation
const ANDROID_ZOOM_CURVE = 'cubic-bezier(0.35, 0.91, 0.33, 0.97)';

// ============================================================================
// DURATIONS (from Flutter source)
// ============================================================================

const IOS_DURATION = 400;        // kTransitionDuration = 500, slightly optimized
const ANDROID_FADE_UP = 350;     // FadeUpwards
const ANDROID_OPEN_UP = 700;     // OpenUpwards (Android P style)
const ANDROID_ZOOM = 300;        // Zoom (Android Q-T)
const ANDROID_FADE_FWD = 400;    // FadeForwards (Android U)

// ============================================================================
// GEOMETRY (from Flutter source)
// ============================================================================

// iOS
const IOS_PARALLAX = 33.333;     // _kMiddleLeftTween: -1/3

// Android FadeUpwards (O)
const FADE_UP_OFFSET = 25;       // 25% from bottom

// Android OpenUpwards (P)  
const OPEN_UP_OFFSET = 5;        // 5% from bottom

// Android Zoom (Q-T)
const ZOOM_ENTER_SCALE = 0.85;   // _scaleUpTransition: 0.85 → 1.0
const ZOOM_EXIT_SCALE = 1.10;    // _scaleDownTransition: 1.0 → 1.10 (reverse)
                                  // _scaleUpTransition: 1.0 → 1.05

// Android FadeForwards (U)
const FADE_FWD_OFFSET = 25;      // 25% horizontal slide

// ============================================================================
// VERSION DETECTION
// ============================================================================

interface PlatformInfo {
  platform: 'ios' | 'android' | 'desktop';
  version: number;
}

function detectPlatform(): PlatformInfo {
  const platforms = getPlatforms();
  const ua = navigator.userAgent;
  
  if (platforms.includes('ios') || /iPhone|iPad|iPod/.test(ua)) {
    const match = ua.match(/OS (\d+)/);
    return { platform: 'ios', version: match ? parseInt(match[1]) : 17 };
  }
  
  if (platforms.includes('android') || /Android/.test(ua)) {
    const match = ua.match(/Android (\d+)/);
    return { platform: 'android', version: match ? parseInt(match[1]) : 14 };
  }
  
  return { platform: 'desktop', version: 0 };
}

// ============================================================================
// iOS CUPERTINO TRANSITION
// ============================================================================

function createIOSTransition(
  enteringEl: HTMLElement,
  leavingEl: HTMLElement,
  isBack: boolean,
  isRTL: boolean
): Animation {
  const root = createAnimation().duration(IOS_DURATION);
  
  const enterPage = enteringEl?.querySelector(':scope > .ion-page') || enteringEl;
  const leavePage = leavingEl?.querySelector(':scope > .ion-page') || leavingEl;
  
  // Entering animation
  const enterAnim = createAnimation();
  if (enterPage) {
    enterAnim
      .addElement(enterPage)
      .beforeRemoveClass('ion-page-invisible')
      .beforeStyles({ 'will-change': 'transform' });
    
    if (isBack) {
      // Back: from parallax position
      const from = isRTL ? IOS_PARALLAX : -IOS_PARALLAX;
      enterAnim
        .easing(IOS_LINEAR_OUT)
        .fromTo('transform', `translate3d(${from}%, 0, 0)`, 'translate3d(0, 0, 0)');
    } else {
      // Forward: from edge, on top
      const from = isRTL ? -100 : 100;
      enterAnim
        .easing(IOS_FAST_EASE)
        .beforeStyles({ 'z-index': '999' })
        .fromTo('transform', `translate3d(${from}%, 0, 0)`, 'translate3d(0, 0, 0)');
    }
    enterAnim.afterClearStyles(['will-change', 'z-index']);
  }
  
  // Leaving animation  
  const leaveAnim = createAnimation();
  if (leavePage) {
    leaveAnim
      .addElement(leavePage)
      .beforeStyles({ 'will-change': 'transform' });
    
    if (isBack) {
      // Back: slide out to edge
      const to = isRTL ? -100 : 100;
      leaveAnim
        .easing(IOS_FAST_EASE)
        .beforeStyles({ 'z-index': '999' })
        .fromTo('transform', 'translate3d(0, 0, 0)', `translate3d(${to}%, 0, 0)`);
    } else {
      // Forward: to parallax position
      const to = isRTL ? IOS_PARALLAX : -IOS_PARALLAX;
      leaveAnim
        .easing(IOS_LINEAR_OUT)
        .fromTo('transform', 'translate3d(0, 0, 0)', `translate3d(${to}%, 0, 0)`);
    }
    leaveAnim.afterClearStyles(['will-change', 'z-index']);
  }
  
  return root.addAnimation([enterAnim, leaveAnim]);
}

// ============================================================================
// ANDROID O (8) - FadeUpwardsPageTransitionsBuilder
// Fade + slide from bottom
// ============================================================================

function createAndroidFadeUpTransition(
  enteringEl: HTMLElement,
  leavingEl: HTMLElement,
  isBack: boolean
): Animation {
  const root = createAnimation()
    .duration(ANDROID_FADE_UP)
    .easing(ANDROID_EASE_IN_OUT);
  
  const enterPage = enteringEl?.querySelector(':scope > .ion-page') || enteringEl;
  const leavePage = leavingEl?.querySelector(':scope > .ion-page') || leavingEl;
  
  const enterAnim = createAnimation();
  if (enterPage) {
    enterAnim
      .addElement(enterPage)
      .beforeRemoveClass('ion-page-invisible')
      .beforeStyles({ 'will-change': 'transform, opacity' });
    
    if (isBack) {
      enterAnim.fromTo('opacity', '0', '1');
    } else {
      enterAnim
        .fromTo('transform', `translate3d(0, ${FADE_UP_OFFSET}%, 0)`, 'translate3d(0, 0, 0)')
        .fromTo('opacity', '0', '1');
    }
    enterAnim.afterClearStyles(['will-change']);
  }
  
  const leaveAnim = createAnimation();
  if (leavePage) {
    leaveAnim
      .addElement(leavePage)
      .beforeStyles({ 'will-change': 'transform, opacity' });
    
    if (isBack) {
      leaveAnim
        .fromTo('transform', 'translate3d(0, 0, 0)', `translate3d(0, ${FADE_UP_OFFSET}%, 0)`)
        .fromTo('opacity', '1', '0');
    } else {
      leaveAnim.fromTo('opacity', '1', '0');
    }
    leaveAnim.afterClearStyles(['will-change']);
  }
  
  return root.addAnimation([enterAnim, leaveAnim]);
}

// ============================================================================
// ANDROID P (9) - OpenUpwardsPageTransitionsBuilder
// Subtle vertical slide + fade
// ============================================================================

function createAndroidOpenUpTransition(
  enteringEl: HTMLElement,
  leavingEl: HTMLElement,
  isBack: boolean
): Animation {
  const root = createAnimation()
    .duration(ANDROID_OPEN_UP)
    .easing(ANDROID_DECELERATE);
  
  const enterPage = enteringEl?.querySelector(':scope > .ion-page') || enteringEl;
  const leavePage = leavingEl?.querySelector(':scope > .ion-page') || leavingEl;
  
  const enterAnim = createAnimation();
  if (enterPage) {
    enterAnim
      .addElement(enterPage)
      .beforeRemoveClass('ion-page-invisible')
      .beforeStyles({ 'will-change': 'transform, opacity' });
    
    if (isBack) {
      enterAnim
        .fromTo('transform', `translate3d(0, -${OPEN_UP_OFFSET}%, 0)`, 'translate3d(0, 0, 0)')
        .fromTo('opacity', '0.5', '1');
    } else {
      enterAnim
        .fromTo('transform', `translate3d(0, ${OPEN_UP_OFFSET}%, 0)`, 'translate3d(0, 0, 0)')
        .fromTo('opacity', '0', '1');
    }
    enterAnim.afterClearStyles(['will-change']);
  }
  
  const leaveAnim = createAnimation();
  if (leavePage) {
    leaveAnim
      .addElement(leavePage)
      .beforeStyles({ 'will-change': 'transform, opacity' });
    
    if (isBack) {
      leaveAnim
        .fromTo('transform', 'translate3d(0, 0, 0)', `translate3d(0, ${OPEN_UP_OFFSET}%, 0)`)
        .fromTo('opacity', '1', '0');
    } else {
      leaveAnim
        .fromTo('transform', 'translate3d(0, 0, 0)', `translate3d(0, -${OPEN_UP_OFFSET}%, 0)`)
        .fromTo('opacity', '1', '0.5');
    }
    leaveAnim.afterClearStyles(['will-change']);
  }
  
  return root.addAnimation([enterAnim, leaveAnim]);
}

// ============================================================================
// ANDROID Q-T (10-13) - ZoomPageTransitionsBuilder
// Scale + fade (the signature Android 10 animation)
// ============================================================================

function createAndroidZoomTransition(
  enteringEl: HTMLElement,
  leavingEl: HTMLElement,
  isBack: boolean
): Animation {
  const root = createAnimation()
    .duration(ANDROID_ZOOM)
    .easing(ANDROID_ZOOM_CURVE);
  
  const enterPage = enteringEl?.querySelector(':scope > .ion-page') || enteringEl;
  const leavePage = leavingEl?.querySelector(':scope > .ion-page') || leavingEl;
  
  const enterAnim = createAnimation();
  if (enterPage) {
    enterAnim
      .addElement(enterPage)
      .beforeRemoveClass('ion-page-invisible')
      .beforeStyles({ 'will-change': 'transform, opacity' });
    
    if (isBack) {
      // Reverse: scale from 1.05 to 1.0
      enterAnim
        .fromTo('transform', 'translate3d(0,0,0) scale3d(1.05, 1.05, 1)', 'translate3d(0,0,0) scale3d(1, 1, 1)')
        .fromTo('opacity', '0', '1');
    } else {
      // Forward: scale from 0.85 to 1.0
      enterAnim
        .fromTo('transform', `translate3d(0,0,0) scale3d(${ZOOM_ENTER_SCALE}, ${ZOOM_ENTER_SCALE}, 1)`, 'translate3d(0,0,0) scale3d(1, 1, 1)')
        .fromTo('opacity', '0', '1');
    }
    enterAnim.afterClearStyles(['will-change']);
  }
  
  const leaveAnim = createAnimation();
  if (leavePage) {
    leaveAnim
      .addElement(leavePage)
      .beforeStyles({ 'will-change': 'transform, opacity' });
    
    if (isBack) {
      // Reverse: scale from 1.0 to 0.85
      leaveAnim
        .fromTo('transform', 'translate3d(0,0,0) scale3d(1, 1, 1)', `translate3d(0,0,0) scale3d(${ZOOM_ENTER_SCALE}, ${ZOOM_ENTER_SCALE}, 1)`)
        .fromTo('opacity', '1', '0');
    } else {
      // Forward: scale from 1.0 to 1.05
      leaveAnim
        .fromTo('transform', 'translate3d(0,0,0) scale3d(1, 1, 1)', 'translate3d(0,0,0) scale3d(1.05, 1.05, 1)')
        .fromTo('opacity', '1', '0');
    }
    leaveAnim.afterClearStyles(['will-change']);
  }
  
  return root.addAnimation([enterAnim, leaveAnim]);
}

// ============================================================================
// ANDROID U (14+) - FadeForwardsPageTransitionsBuilder
// Horizontal slide + fade (Material 3 / Material You)
// ============================================================================

function createAndroidFadeForwardsTransition(
  enteringEl: HTMLElement,
  leavingEl: HTMLElement,
  isBack: boolean,
  isRTL: boolean
): Animation {
  const root = createAnimation()
    .duration(ANDROID_FADE_FWD)
    .easing(ANDROID_EMPHASIZED);
  
  const enterPage = enteringEl?.querySelector(':scope > .ion-page') || enteringEl;
  const leavePage = leavingEl?.querySelector(':scope > .ion-page') || leavingEl;
  
  const enterAnim = createAnimation();
  if (enterPage) {
    enterAnim
      .addElement(enterPage)
      .beforeRemoveClass('ion-page-invisible')
      .beforeStyles({ 'will-change': 'transform, opacity' });
    
    if (isBack) {
      const from = isRTL ? FADE_FWD_OFFSET : -FADE_FWD_OFFSET;
      enterAnim
        .fromTo('transform', `translate3d(${from}%, 0, 0)`, 'translate3d(0, 0, 0)')
        .fromTo('opacity', '0', '1');
    } else {
      const from = isRTL ? -FADE_FWD_OFFSET : FADE_FWD_OFFSET;
      enterAnim
        .fromTo('transform', `translate3d(${from}%, 0, 0)`, 'translate3d(0, 0, 0)')
        .fromTo('opacity', '0', '1');
    }
    enterAnim.afterClearStyles(['will-change']);
  }
  
  const leaveAnim = createAnimation();
  if (leavePage) {
    leaveAnim
      .addElement(leavePage)
      .beforeStyles({ 'will-change': 'transform, opacity' });
    
    if (isBack) {
      const to = isRTL ? -FADE_FWD_OFFSET : FADE_FWD_OFFSET;
      leaveAnim
        .fromTo('transform', 'translate3d(0, 0, 0)', `translate3d(${to}%, 0, 0)`)
        .fromTo('opacity', '1', '0');
    } else {
      const to = isRTL ? FADE_FWD_OFFSET : -FADE_FWD_OFFSET;
      leaveAnim
        .fromTo('transform', 'translate3d(0, 0, 0)', `translate3d(${to}%, 0, 0)`)
        .fromTo('opacity', '1', '0');
    }
    leaveAnim.afterClearStyles(['will-change']);
  }
  
  return root.addAnimation([enterAnim, leaveAnim]);
}

// ============================================================================
// MAIN EXPORT: Auto-Detect Platform & Version
// ============================================================================

/**
 * Flutter Native Page Transition
 * 
 * Automatically detects platform and applies version-specific transition:
 * 
 * iOS: CupertinoPageTransition (all versions)
 * 
 * Android:
 * - 8 (O):     FadeUpwards
 * - 9 (P):     OpenUpwards
 * - 10-13 (Q-T): Zoom
 * - 14+ (U):   FadeForwards
 * 
 * ALL GPU-accelerated (transform3d + opacity only)
 */
export const flutterNativeAnimation = (baseEl: HTMLElement, opts: any): Animation => {
  const isRTL = document.documentElement.dir === 'rtl';
  const isBack = opts.direction === 'back';
  const enteringEl = opts.enteringEl as HTMLElement;
  const leavingEl = opts.leavingEl as HTMLElement;
  
  const { platform, version } = detectPlatform();
  
  // iOS - always Cupertino
  if (platform === 'ios' || platform === 'desktop') {
    return createIOSTransition(enteringEl, leavingEl, isBack, isRTL);
  }
  
  // Android - version-specific
  if (version >= 14) {
    // Android 14+ (U): FadeForwards / Material 3
    return createAndroidFadeForwardsTransition(enteringEl, leavingEl, isBack, isRTL);
  } else if (version >= 10) {
    // Android 10-13 (Q-T): Zoom
    return createAndroidZoomTransition(enteringEl, leavingEl, isBack);
  } else if (version === 9) {
    // Android 9 (P): OpenUpwards
    return createAndroidOpenUpTransition(enteringEl, leavingEl, isBack);
  } else {
    // Android 8 and below (O): FadeUpwards
    return createAndroidFadeUpTransition(enteringEl, leavingEl, isBack);
  }
};

// Specific exports for manual selection
export const flutterCupertinoAnimation = (baseEl: HTMLElement, opts: any): Animation => {
  const isRTL = document.documentElement.dir === 'rtl';
  return createIOSTransition(opts.enteringEl, opts.leavingEl, opts.direction === 'back', isRTL);
};

export const flutterMaterialAnimation = (baseEl: HTMLElement, opts: any): Animation => {
  const isRTL = document.documentElement.dir === 'rtl';
  return createAndroidFadeForwardsTransition(opts.enteringEl, opts.leavingEl, opts.direction === 'back', isRTL);
};

export const flutterZoomAnimation = (baseEl: HTMLElement, opts: any): Animation => {
  return createAndroidZoomTransition(opts.enteringEl, opts.leavingEl, opts.direction === 'back');
};

export default flutterNativeAnimation;
