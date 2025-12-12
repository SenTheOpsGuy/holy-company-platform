export type GestureType = 
  | 'swipe-up' 
  | 'swipe-down' 
  | 'swipe-left' 
  | 'swipe-right' 
  | 'circular' 
  | 'drag' 
  | 'hold' 
  | 'tap' 
  | 'tilt';

interface TouchPoint {
  x: number;
  y: number;
  timestamp: number;
}

export class GestureDetector {
  private touchStart: TouchPoint | null = null;
  private touchPath: TouchPoint[] = [];
  private minSwipeDistance = 50;
  private maxSwipeTime = 500;
  private holdDuration = 800;
  private holdTimer: NodeJS.Timeout | null = null;

  detectSwipe(touchEnd: TouchPoint): GestureType | null {
    if (!this.touchStart) return null;

    const deltaX = touchEnd.x - this.touchStart.x;
    const deltaY = touchEnd.y - this.touchStart.y;
    const deltaTime = touchEnd.timestamp - this.touchStart.timestamp;

    if (deltaTime > this.maxSwipeTime) return null;

    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    if (distance < this.minSwipeDistance) return null;

    // Determine primary direction
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      return deltaY < 0 ? 'swipe-up' : 'swipe-down';
    } else {
      return deltaX < 0 ? 'swipe-left' : 'swipe-right';
    }
  }

  detectCircular(): boolean {
    if (this.touchPath.length < 10) return false;

    // Calculate if path forms a circle
    const points = this.touchPath.slice(-20); // Last 20 points
    const centerX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
    const centerY = points.reduce((sum, p) => sum + p.y, 0) / points.length;

    // Check if points are roughly equidistant from center
    const distances = points.map(p => 
      Math.sqrt(Math.pow(p.x - centerX, 2) + Math.pow(p.y - centerY, 2))
    );
    const avgDistance = distances.reduce((sum, d) => sum + d, 0) / distances.length;
    const variance = distances.reduce((sum, d) => sum + Math.pow(d - avgDistance, 2), 0) / distances.length;

    // Low variance means circular motion
    return variance < avgDistance * 0.3;
  }

  onTouchStart(e: TouchEvent | React.TouchEvent, onHold?: () => void) {
    const touch = e.touches[0];
    this.touchStart = {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now(),
    };
    this.touchPath = [this.touchStart];

    // Start hold timer
    if (onHold) {
      this.holdTimer = setTimeout(() => {
        onHold();
        this.triggerHapticFeedback();
      }, this.holdDuration);
    }
  }

  onTouchMove(e: TouchEvent | React.TouchEvent) {
    if (!this.touchStart) return;

    const touch = e.touches[0];
    this.touchPath.push({
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now(),
    });

    // Cancel hold if moved too much
    if (this.holdTimer) {
      const distance = Math.sqrt(
        Math.pow(touch.clientX - this.touchStart.x, 2) +
        Math.pow(touch.clientY - this.touchStart.y, 2)
      );
      if (distance > 20) {
        clearTimeout(this.holdTimer);
        this.holdTimer = null;
      }
    }
  }

  onTouchEnd(e: TouchEvent | React.TouchEvent): GestureType | null {
    if (this.holdTimer) {
      clearTimeout(this.holdTimer);
      this.holdTimer = null;
    }

    if (!this.touchStart) return null;

    const touch = e.changedTouches[0];
    const touchEnd = {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now(),
    };

    // Check for tap (short touch with minimal movement)
    const distance = Math.sqrt(
      Math.pow(touchEnd.x - this.touchStart.x, 2) +
      Math.pow(touchEnd.y - this.touchStart.y, 2)
    );
    const duration = touchEnd.timestamp - this.touchStart.timestamp;

    if (distance < 10 && duration < 200) {
      this.reset();
      return 'tap';
    }

    // Check for circular gesture
    if (this.detectCircular()) {
      this.reset();
      return 'circular';
    }

    // Check for swipe
    const swipe = this.detectSwipe(touchEnd);
    this.reset();
    return swipe;
  }

  reset() {
    this.touchStart = null;
    this.touchPath = [];
    if (this.holdTimer) {
      clearTimeout(this.holdTimer);
      this.holdTimer = null;
    }
  }

  triggerHapticFeedback(duration: number = 50) {
    if ('vibrate' in navigator) {
      navigator.vibrate(duration);
    }
  }
}

// Device motion (tilt) detection
export class TiltDetector {
  private permissionGranted = false;

  async requestPermission(): Promise<boolean> {
    if (typeof DeviceMotionEvent === 'undefined') {
      return false;
    }

    // iOS 13+ requires permission
    if (
      typeof (DeviceMotionEvent as any).requestPermission === 'function'
    ) {
      try {
        const permission = await (DeviceMotionEvent as any).requestPermission();
        this.permissionGranted = permission === 'granted';
        return this.permissionGranted;
      } catch (error) {
        console.error('Motion permission error:', error);
        return false;
      }
    }

    // Android or older iOS
    this.permissionGranted = true;
    return true;
  }

  detectTilt(
    onTilt: (angle: { beta: number; gamma: number }) => void
  ): (() => void) | null {
    if (!this.permissionGranted) {
      console.warn('Motion permission not granted');
      return null;
    }

    const handler = (event: DeviceOrientationEvent) => {
      if (event.beta !== null && event.gamma !== null) {
        onTilt({
          beta: event.beta,  // front-to-back tilt (-180 to 180)
          gamma: event.gamma, // left-to-right tilt (-90 to 90)
        });
      }
    };

    window.addEventListener('deviceorientation', handler);

    // Return cleanup function
    return () => {
      window.removeEventListener('deviceorientation', handler);
    };
  }
}

// Drag detection for games
export class DragDetector {
  private element: HTMLElement | null = null;
  private isDragging = false;
  private startPos = { x: 0, y: 0 };
  private currentPos = { x: 0, y: 0 };

  attach(element: HTMLElement) {
    this.element = element;
  }

  onDragStart(e: TouchEvent | MouseEvent) {
    this.isDragging = true;
    const point = 'touches' in e ? e.touches[0] : e;
    this.startPos = { x: point.clientX, y: point.clientY };
    this.currentPos = { ...this.startPos };
  }

  onDragMove(e: TouchEvent | MouseEvent): { x: number; y: number; deltaX: number; deltaY: number } | null {
    if (!this.isDragging) return null;

    const point = 'touches' in e ? e.touches[0] : e;
    const newPos = { x: point.clientX, y: point.clientY };
    const deltaX = newPos.x - this.currentPos.x;
    const deltaY = newPos.y - this.currentPos.y;
    
    this.currentPos = newPos;

    return {
      x: this.currentPos.x,
      y: this.currentPos.y,
      deltaX,
      deltaY,
    };
  }

  onDragEnd(): { x: number; y: number; totalDeltaX: number; totalDeltaY: number } | null {
    if (!this.isDragging) return null;

    const result = {
      x: this.currentPos.x,
      y: this.currentPos.y,
      totalDeltaX: this.currentPos.x - this.startPos.x,
      totalDeltaY: this.currentPos.y - this.startPos.y,
    };

    this.isDragging = false;
    return result;
  }

  reset() {
    this.isDragging = false;
  }

  get dragging() {
    return this.isDragging;
  }
}

// Simple gesture detection function for convenience
export function detectGesture(
  touchPoints: { x: number; y: number; time: number }[]
): GestureType | null {
  if (touchPoints.length < 2) return null;
  
  const detector = new GestureDetector();
  const end = { 
    x: touchPoints[touchPoints.length - 1].x,
    y: touchPoints[touchPoints.length - 1].y,
    timestamp: touchPoints[touchPoints.length - 1].time
  };
  
  return detector.detectSwipe(end);
}
