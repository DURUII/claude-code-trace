import { Box, Text } from "ink";
import { colors } from "../lib/theme.js";

/** Static green dot — no animation, no timer, no re-renders. */
export function OngoingDot() {
  return (
    <Text color={colors.ongoing} bold>
      ●
    </Text>
  );
}

/**
 * Activity beads — 5 static dots with color gradient matching Go TUI.
 * Go TUI animates these, but we keep them static to avoid re-render shaking.
 * Gradient: accent (head) → info → textSecondary → textMuted (tail)
 * Glyph: U+EABC (nf-cod-circle, filled circle)
 */
const BEAD = "\uEABC";
const BEAD_COLORS = [colors.accent, colors.info, colors.textSecondary, colors.textDim, colors.textMuted];

export function BrailleSpinner() {
  return (
    <Box>
      {BEAD_COLORS.map((clr, i) => (
        <Text key={i} color={clr}>
          {BEAD}
        </Text>
      ))}
    </Box>
  );
}
