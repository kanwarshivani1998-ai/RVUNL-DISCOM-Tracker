// src/components/TypingKeyboardSVG.tsx
// Minimalist 2D SVG QWERTY keyboard with a resting-hand overlay that highlights
// the finger required for the next character, and reacts to correct/incorrect
// physical key presses with tap / shake animations.

import { memo } from "react";
import {
  ALL_KEYS,
  HOME_KEY_FOR_FINGER,
  KEYBOARD_HEIGHT,
  KEYBOARD_WIDTH,
  KEY_ROWS,
  getKeyById,
  type FingerId,
} from "@/lib/typingKeyboardData";

interface TypingKeyboardSVGProps {
  /** Finger(s) that should be shown as "next up" (green). */
  activeFingers: FingerId[];
  /** Key id that corresponds to the next expected character. */
  activeKeyId: string | null;
  /** Fingers currently doing a correct-press tap animation. */
  tapFingers: FingerId[];
  tapKeyId: string | null;
  /** Fingers currently flashing red after a wrong key press. */
  errorFingers: FingerId[];
  errorKeyId: string | null;
  /** Bumped on every keystroke so CSS animations reliably restart. */
  animTick: number;
}

const NEUTRAL = "var(--color-muted-foreground)";
const ACTIVE = "var(--color-success, #22c55e)";
const ERROR = "var(--color-destructive)";
const OUTLINE = "var(--color-primary)";

const FINGERTIP_RADIUS = 15;
const PALM_HEIGHT = 34;

function fingerFill(finger: FingerId, props: TypingKeyboardSVGProps): string {
  if (props.errorFingers.includes(finger)) return ERROR;
  if (props.tapFingers.includes(finger)) return ACTIVE;
  if (props.activeFingers.includes(finger)) return ACTIVE;
  return NEUTRAL;
}

function fingerAnimClass(finger: FingerId, props: TypingKeyboardSVGProps): string {
  if (props.errorFingers.includes(finger)) return "kb-shake";
  if (props.tapFingers.includes(finger)) return "kb-tap";
  return "";
}

function keyAnimClass(keyId: string, props: TypingKeyboardSVGProps): string {
  if (props.errorKeyId === keyId) return "kb-shake";
  if (props.tapKeyId === keyId) return "kb-key-tap";
  return "";
}

const FINGER_IDS: FingerId[] = [
  "L-pinky",
  "L-ring",
  "L-middle",
  "L-index",
  "R-index",
  "R-middle",
  "R-ring",
  "R-pinky",
];

function TypingKeyboardSVGImpl(props: TypingKeyboardSVGProps) {
  const homeRow = KEY_ROWS[2];
  const homeRowY = homeRow[0]?.y ?? 0;
  const homeRowH = homeRow[0]?.h ?? 0;
  const spaceKey = getKeyById("Space");

  const extraTop = FINGERTIP_RADIUS * 2 + 10;
  const viewH = KEYBOARD_HEIGHT + extraTop;

  return (
    <svg
      viewBox={`0 -${extraTop} ${KEYBOARD_WIDTH} ${viewH}`}
      className="h-full w-full select-none"
      role="img"
      aria-label="Virtual guidance keyboard"
    >
      {/* ---- Keys ---- */}
      <g>
        {ALL_KEYS.map((key) => {
          const isActive = props.activeKeyId === key.id && !key.special;
          const anim = keyAnimClass(key.id, props);
          const fill = props.errorKeyId === key.id ? "var(--color-destructive)" : "var(--color-card)";
          const stroke = isActive ? OUTLINE : "var(--color-border)";
          return (
            <g key={`${key.id}-${anim}-${props.animTick}`} className={anim}>
              <rect
                x={key.x}
                y={key.y}
                width={key.w}
                height={key.h}
                rx={7}
                fill={props.errorKeyId === key.id ? fill : "var(--color-card)"}
                fillOpacity={props.errorKeyId === key.id ? 0.25 : 1}
                stroke={stroke}
                strokeWidth={isActive ? 2 : 1}
              />
              <text
                x={key.x + key.w / 2}
                y={key.y + key.h / 2 + 4}
                textAnchor="middle"
                fontSize={key.special ? 9 : 12}
                fontWeight={isActive ? 700 : 500}
                fill={isActive ? "var(--color-primary)" : "var(--color-foreground)"}
              >
                {key.label}
              </text>
            </g>
          );
        })}
      </g>

      {/* ---- Resting hands overlay ---- */}
      <g opacity={0.92}>
        {/* Palms: left hand spans pinky..index columns, right hand mirrors it */}
        {(["L", "R"] as const).map((side) => {
          const pinkyKey = getKeyById(HOME_KEY_FOR_FINGER[side === "L" ? "L-pinky" : "R-pinky"]);
          const indexKey = getKeyById(HOME_KEY_FOR_FINGER[side === "L" ? "L-index" : "R-index"]);
          if (!pinkyKey || !indexKey || !spaceKey) return null;
          const left = side === "L" ? pinkyKey.x - 6 : indexKey.x - 6;
          const right = side === "L" ? indexKey.x + indexKey.w + 6 : pinkyKey.x + pinkyKey.w + 6;
          return (
            <rect
              key={`palm-${side}`}
              x={left}
              y={homeRowY + homeRowH - 6}
              width={right - left}
              height={PALM_HEIGHT}
              rx={16}
              fill="var(--color-muted-foreground)"
              fillOpacity={0.22}
            />
          );
        })}

        {/* Fingertips */}
        {FINGER_IDS.map((finger) => {
          const key = getKeyById(HOME_KEY_FOR_FINGER[finger]);
          if (!key) return null;
          const cx = key.x + key.w / 2;
          const cy = key.y + key.h / 2;
          return (
            <g key={`tip-${finger}-${props.animTick}`} className={fingerAnimClass(finger, props)}>
              <circle
                cx={cx}
                cy={cy}
                r={FINGERTIP_RADIUS}
                fill={fingerFill(finger, props)}
                fillOpacity={0.85}
                stroke="var(--color-background)"
                strokeWidth={1.5}
              />
            </g>
          );
        })}

        {/* Thumbs, resting near the space bar */}
        {spaceKey &&
          (["L-thumb", "R-thumb"] as const).map((thumb, i) => {
            const cx = spaceKey.x + spaceKey.w / 2 + (i === 0 ? -26 : 26);
            const cy = spaceKey.y - 4;
            return (
              <g key={`tip-${thumb}-${props.animTick}`} className={fingerAnimClass(thumb, props)}>
                <ellipse
                  cx={cx}
                  cy={cy}
                  rx={20}
                  ry={12}
                  fill={fingerFill(thumb, props)}
                  fillOpacity={0.85}
                  stroke="var(--color-background)"
                  strokeWidth={1.5}
                />
              </g>
            );
          })}
      </g>
    </svg>
  );
}

export const TypingKeyboardSVG = memo(TypingKeyboardSVGImpl);
