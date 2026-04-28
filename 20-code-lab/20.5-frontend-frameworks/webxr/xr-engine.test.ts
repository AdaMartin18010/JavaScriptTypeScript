import { describe, it, expect } from 'vitest';
import {
  Matrix4,
  XRSpace,
  XRView,
  XRFrame,
  SceneObject,
  HandTracking,
  XRAnchorManager,
  XRHitTest
} from './xr-engine.js';

describe('Matrix4', () => {
  it('should create identity matrix', () => {
    const m = Matrix4.identity();
    const data = m.getData();
    expect(data[0]).toBe(1);
    expect(data[5]).toBe(1);
    expect(data[10]).toBe(1);
    expect(data[15]).toBe(1);
  });

  it('should transform a point', () => {
    const m = Matrix4.fromTranslation(1, 2, 3);
    const result = m.transformPoint({ x: 0, y: 0, z: 0 });
    expect(result.x).toBeCloseTo(1);
    expect(result.y).toBeCloseTo(2);
    expect(result.z).toBeCloseTo(3);
  });

  it('should multiply matrices', () => {
    const a = Matrix4.fromTranslation(1, 0, 0);
    const b = Matrix4.fromTranslation(0, 1, 0);
    const result = a.multiply(b);
    const point = result.transformPoint({ x: 0, y: 0, z: 0 });
    expect(point.x).toBeCloseTo(1);
    expect(point.y).toBeCloseTo(1);
  });
});

describe('XRSpace', () => {
  it('should set position', () => {
    const space = new XRSpace();
    space.setPosition(1, 2, 3);
    const pos = space.getPosition();
    expect(pos).toEqual({ x: 1, y: 2, z: 3 });
  });
});

describe('XRView', () => {
  it('should set projection matrix', () => {
    const view = new XRView('left', { x: 0, y: 0, width: 100, height: 100 });
    view.setProjection(Math.PI / 2, 1, 0.1, 100);
    const matrix = view.getProjectionMatrix();
    expect(matrix).toBeDefined();
  });
});

describe('XRFrame', () => {
  it('should track timestamp', () => {
    const frame = new XRFrame();
    expect(frame.timestamp).toBeGreaterThan(0);
  });

  it('should manage views', () => {
    const frame = new XRFrame();
    const view = new XRView('left', { x: 0, y: 0, width: 100, height: 100 });
    frame.addView(view);
    expect(frame.views.length).toBe(1);
  });

  it('should return viewer pose', () => {
    const frame = new XRFrame();
    const pose = frame.getViewerPose();
    expect(pose).not.toBeNull();
    expect(pose?.position.y).toBe(1.6);
  });
});

describe('SceneObject', () => {
  it('should build hierarchy', () => {
    const root = new SceneObject('root');
    const child = new SceneObject('child');
    root.addChild(child);
    child.setPosition(1, 0, 0);
    const pos = child.getWorldTransform().transformPoint({ x: 0, y: 0, z: 0 });
    expect(pos.x).toBeCloseTo(1);
  });
});

describe('HandTracking', () => {
  it('should detect pinch gesture', () => {
    const hand = new HandTracking();
    hand.updateJoint('wrist', { x: 0, y: 0, z: 0 }, 0.025);
    hand.updateJoint('index-finger-tip', { x: 0.05, y: 0.1, z: 0 }, 0.01);
    hand.updateJoint('thumb-tip', { x: 0.03, y: 0.08, z: 0 }, 0.01);
    expect(hand.isPinched()).toBe(false);

    // Move fingers close together
    hand.updateJoint('index-finger-tip', { x: 0.031, y: 0.081, z: 0 }, 0.01);
    expect(hand.isPinched()).toBe(true);
  });
});

describe('XRAnchorManager', () => {
  it('should create and retrieve anchors', () => {
    const manager = new XRAnchorManager();
    const id = manager.createAnchor({ x: 1, y: 2, z: 3 });
    const anchor = manager.getAnchor(id);
    expect(anchor).toBeDefined();
    expect(anchor?.getPosition()).toEqual({ x: 1, y: 2, z: 3 });
  });

  it('should delete anchors', () => {
    const manager = new XRAnchorManager();
    const id = manager.createAnchor({ x: 0, y: 0, z: 0 });
    expect(manager.deleteAnchor(id)).toBe(true);
    expect(manager.getAnchor(id)).toBeUndefined();
  });
});

describe('XRHitTest', () => {
  it('should hit plane with downward ray', () => {
    const hitTest = new XRHitTest();
    const hit = hitTest.testRayPlane(
      { x: 0, y: 1, z: 0 },
      { x: 0, y: -1, z: 0 },
      { x: 0, y: 0, z: 0 },
      { x: 0, y: 1, z: 0 }
    );
    expect(hit).not.toBeNull();
    expect(hit?.y).toBeCloseTo(0);
  });

  it('should return null for parallel ray', () => {
    const hitTest = new XRHitTest();
    const hit = hitTest.testRayPlane(
      { x: 0, y: 1, z: 0 },
      { x: 1, y: 0, z: 0 },
      { x: 0, y: 0, z: 0 },
      { x: 0, y: 1, z: 0 }
    );
    expect(hit).toBeNull();
  });
});
