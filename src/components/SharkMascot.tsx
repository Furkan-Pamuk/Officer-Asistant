"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

export interface MascotPoint { x: number; y: number }
export interface SharkMascotHandle {
  lookAt: (point: MascotPoint | null) => void;
  select: () => Promise<void>;
}

const SharkMascot = forwardRef<SharkMascotHandle>(function SharkMascot(_, ref) {
  const svgRef = useRef<SVGSVGElement>(null);
  const bodyRef = useRef<SVGGElement>(null);
  const pupilL = useRef<SVGGElement>(null);
  const pupilR = useRef<SVGGElement>(null);
  const lidL = useRef<SVGGElement>(null);
  const lidR = useRef<SVGGElement>(null);
  const finR = useRef<SVGGElement>(null);
  const controls = useRef<SharkMascotHandle>({ lookAt: () => {}, select: async () => {} });

  useImperativeHandle(ref, () => ({
    lookAt: point => controls.current.lookAt(point),
    select: () => controls.current.select(),
  }), []);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const desktop = window.matchMedia("(min-width: 768px)");
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const animations = new Set<Animation>();
    let frame = 0;
    let blinkTimer: ReturnType<typeof setTimeout> | undefined;
    let disposed = false;
    let selected = false;
    let hovered: MascotPoint | null = null;
    let pointer: MascotPoint | null = null;
    let center = { x: 0, y: 0, scale: 1 };
    let current = { x: 0, y: 0 };
    let target = { x: 0, y: 0 };

    function animate(element: SVGElement | null, frames: Keyframe[], duration: number) {
      if (!element || reduced.matches || disposed) return Promise.resolve();
      const animation = element.animate(frames, { duration, easing: "ease-in-out" });
      animations.add(animation);
      return animation.finished.catch(() => {}).then(() => { animations.delete(animation); });
    }
    function paint() {
      const transform = `translate(${current.x}px, ${current.y}px)`;
      if (pupilL.current) pupilL.current.style.transform = transform;
      if (pupilR.current) pupilR.current.style.transform = transform;
    }
    function tick() {
      frame = 0;
      if (disposed || reduced.matches) return;
      current.x += (target.x - current.x) * 0.15;
      current.y += (target.y - current.y) * 0.15;
      paint();
      if (Math.abs(target.x - current.x) + Math.abs(target.y - current.y) > 0.02) {
        frame = requestAnimationFrame(tick);
      }
    }
    function aim(point: MascotPoint | null, snap = false) {
      if (reduced.matches || !desktop.matches || !fine.matches) return;
      const dx = point ? (point.x - center.x) / center.scale : 0;
      const dy = point ? (point.y - center.y) / center.scale : 0;
      const distance = Math.hypot(dx, dy);
      const strength = Math.min(distance / 90, 1) * 6;
      target = distance ? { x: dx / distance * strength, y: dy / distance * strength } : { x: 0, y: 0 };
      if (snap) {
        current = { ...target };
        // Writes are batched into the same animation-frame path as tracking.
      }
      if (!frame) frame = requestAnimationFrame(tick);
    }
    function measure() {
      const rect = svg!.getBoundingClientRect();
      const scale = rect.width / 320 || 1;
      center = { x: rect.left + 160 * scale, y: rect.top + 151 * scale, scale };
      aim(hovered ?? pointer);
    }
    function onMove(event: MouseEvent) {
      pointer = { x: event.clientX, y: event.clientY };
      if (!hovered) aim(pointer);
    }
    function onLeave() { pointer = null; if (!hovered) aim(null); }
    function scheduleBlink() {
      clearTimeout(blinkTimer);
      if (disposed || reduced.matches) return;
      blinkTimer = setTimeout(async () => {
        if (!selected) await Promise.all([
          animate(lidL.current, [{ transform: "scaleY(0)" }, { transform: "scaleY(1)", offset: 0.5 }, { transform: "scaleY(0)" }], 160),
          animate(lidR.current, [{ transform: "scaleY(0)" }, { transform: "scaleY(1)", offset: 0.5 }, { transform: "scaleY(0)" }], 160),
        ]);
        scheduleBlink();
      }, 4000 + Math.random() * 3000);
    }
    function reset() {
      cancelAnimationFrame(frame);
      frame = 0;
      for (const animation of animations) animation.cancel();
      animations.clear();
      current = { x: 0, y: 0 };
      target = { x: 0, y: 0 };
      hovered = null;
      paint();
      scheduleBlink();
      measure();
    }

    controls.current = {
      lookAt(point) {
        hovered = point;
        aim(point ?? pointer, !!point);
        if (point && !selected && desktop.matches && fine.matches) {
          for (const animation of bodyRef.current?.getAnimations() ?? []) animation.cancel();
          void animate(bodyRef.current, [{ transform: "translateY(0)" }, { transform: "translateY(-8px)", offset: 0.45 }, { transform: "translateY(0)" }], 300);
        }
      },
      async select() {
        if (reduced.matches || disposed) return;
        selected = true;
        clearTimeout(blinkTimer);
        for (const lid of [lidL.current, lidR.current]) {
          for (const animation of lid?.getAnimations() ?? []) animation.cancel();
        }
        await Promise.all([
          animate(lidR.current, [{ transform: "scaleY(0)" }, { transform: "scaleY(1)", offset: 0.35 }, { transform: "scaleY(1)", offset: 0.65 }, { transform: "scaleY(0)" }], desktop.matches ? 300 : 160),
          desktop.matches ? animate(finR.current, [
            { transform: "rotate(0deg)" }, { transform: "rotate(-15deg)" },
            { transform: "rotate(15deg)" }, { transform: "rotate(-15deg)" }, { transform: "rotate(0deg)" },
          ], 500) : Promise.resolve(),
        ]);
        selected = false;
        scheduleBlink();
      },
    };

    const observer = new ResizeObserver(measure);
    observer.observe(svg);
    window.addEventListener("mousemove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    window.addEventListener("scroll", measure, { passive: true, capture: true });
    window.addEventListener("resize", measure, { passive: true });
    reduced.addEventListener("change", reset);
    desktop.addEventListener("change", reset);
    fine.addEventListener("change", reset);
    measure();
    scheduleBlink();
    return () => {
      disposed = true;
      clearTimeout(blinkTimer);
      cancelAnimationFrame(frame);
      observer.disconnect();
      for (const animation of animations) animation.cancel();
      window.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("scroll", measure, true);
      window.removeEventListener("resize", measure);
      reduced.removeEventListener("change", reset);
      desktop.removeEventListener("change", reset);
      fine.removeEventListener("change", reset);
      controls.current = { lookAt: () => {}, select: async () => {} };
    };
  }, []);

  return (
    <svg ref={svgRef} className="shark-mascot" viewBox="0 0 320 320" fill="none" aria-hidden="true" focusable="false">
      <ellipse cx="160" cy="290" rx="91" ry="9" fill="var(--mascot-shadow)" />
      <g ref={bodyRef}>
        <path d="M104 230C60 232 34 211 21 180L58 186 45 155C83 161 101 184 111 205Z" fill="var(--mascot-body)" stroke="var(--mascot-outline)" strokeWidth="3" strokeLinejoin="round" />
        <path d="M133 101C126 67 145 48 179 40L182 110Z" fill="var(--mascot-body)" stroke="var(--mascot-outline)" strokeWidth="3" />
        <path d="M102 196C81 192 68 208 60 231 84 232 99 225 112 215" fill="var(--mascot-body)" stroke="var(--mascot-outline)" strokeWidth="3" strokeLinejoin="round" />
        <path d="M94 164C94 117 118 92 163 91 213 89 238 121 239 172 248 221 226 270 172 276 118 281 87 246 94 164Z" fill="var(--mascot-body)" stroke="var(--mascot-outline)" strokeWidth="3" />
        <path d="M110 187C120 174 139 171 164 173 194 172 221 179 228 199 237 234 211 263 173 266 129 269 106 241 110 187Z" fill="var(--mascot-belly)" />
        <g id="finR" ref={finR} className="shark-mascot-fin">
          <path d="M227 180C247 173 267 156 283 136 292 165 278 203 238 215Z" fill="var(--mascot-body)" stroke="var(--mascot-outline)" strokeWidth="3" strokeLinejoin="round" />
          <path d="M244 190 267 169" stroke="var(--mascot-highlight)" strokeWidth="3" strokeLinecap="round" />
        </g>
        <path d="M123 124 144 119M185 119 207 125" stroke="var(--mascot-outline)" strokeWidth="5" strokeLinecap="round" />
        <g id="eyeL">
        <ellipse cx="138" cy="151" rx="18" ry="23" fill="var(--mascot-eye)" />
        <g id="pupilL" ref={pupilL}><ellipse cx="140" cy="153" rx="7" ry="11" fill="var(--mascot-outline)" /><circle cx="142" cy="149" r="2.5" fill="var(--mascot-eye)" /></g>
        <g id="lidL" ref={lidL} className="shark-mascot-lid"><ellipse cx="138" cy="151" rx="19" ry="24" fill="var(--mascot-body)" /><path d="M122 155Q138 163 154 155" stroke="var(--mascot-outline)" strokeWidth="3" strokeLinecap="round" /></g>
        </g>
        <g id="eyeR">
        <ellipse cx="195" cy="151" rx="18" ry="23" fill="var(--mascot-eye)" />
        <g id="pupilR" ref={pupilR}><ellipse cx="193" cy="153" rx="7" ry="11" fill="var(--mascot-outline)" /><circle cx="195" cy="149" r="2.5" fill="var(--mascot-eye)" /></g>
        <g id="lidR" ref={lidR} className="shark-mascot-lid"><ellipse cx="195" cy="151" rx="19" ry="24" fill="var(--mascot-body)" /><path d="M179 155Q195 163 211 155" stroke="var(--mascot-outline)" strokeWidth="3" strokeLinecap="round" /></g>
        </g>
        <path d="M129 192Q167 209 211 188C205 218 149 233 129 192Z" fill="var(--mascot-outline)" stroke="var(--mascot-outline)" strokeWidth="4" strokeLinejoin="round" />
        <path d="M134 196 144 207 151 201 162 213 171 203 182 210 192 198 200 202 207 194Q169 207 134 196Z" fill="var(--mascot-eye)" />
        <path d="M220 162 226 168M218 173 225 178" stroke="var(--mascot-highlight)" strokeWidth="3" strokeLinecap="round" />
        <path d="M114 110 111 75Q164 48 219 75L213 111Z" fill="var(--mascot-cap)" stroke="var(--mascot-outline)" strokeWidth="3" strokeLinejoin="round" />
        <path d="M109 99Q163 84 217 100L213 113Q162 101 115 116Z" fill="var(--mascot-outline)" />
        <path d="M114 99Q164 85 216 99" stroke="var(--mascot-gold)" strokeWidth="4" />
        <path d="M118 114Q166 101 214 113C200 130 146 133 118 114Z" fill="var(--mascot-outline)" stroke="var(--mascot-gold)" strokeWidth="2" />
        <circle cx="164" cy="79" r="11" fill="var(--mascot-outline)" />
        <path d="M158 86Q160 76 172 72L168 86Z" fill="var(--mascot-gold)" />
        <path d="M125 249Q169 270 210 244" stroke="var(--mascot-highlight)" strokeWidth="7" strokeLinecap="round" />
      </g>
    </svg>
  );
});

export default SharkMascot;
