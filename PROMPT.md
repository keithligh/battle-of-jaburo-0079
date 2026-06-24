# The Prompt

The brief handed to an AI coding agent ([Claude Code](https://claude.com/claude-code)) to build this documentary by
forking the [cinematic-3d-battle-engine](https://github.com/keithligh/cinematic-3d-battle-engine). It is the
*starting point*, not a one-shot recipe: a finished documentary takes many passes beyond it. For a fictional subject,
"research and cite sources" means **faithfully representing the established canon and citing the canonical works**, never
inventing lore.

```
Fork the cinematic-3d-battle-engine to build a self-playing, TV-documentary-style 3D production of the Battle of Jaburo
of Mobile Suit Gundam. Read the engine's PLAYBOOK.md and AGENTS.md first. Edit only the battle layer (data.js, flags.js, the
index.html title and social meta, and the map bounding box); never touch the engine modules.

Research first and cite real sources, with no fabrication: the date window, the opposing sides with their forces and
commanders, the geography (named places with lng/lat), and the sequence of events. The Battle of Jaburo is fictional;
treat the Gundam canon as the source of truth, cite the canonical works, and disclose what is non-canonical (the
real-world geographic stand-in, supplementary force numbers) honestly.

Set the map bounding box (meta.geo) over the action, then fetch the terrain and imagery tiles
(node tools/fetch_tiles.mjs). Author data.js: the forces, each unit's dated movement track, the front lines, the
storyboard of camera shots, the bilingual narration, and each side's period-correct emblem (the in-universe faction
flag for the year, never a prohibited symbol). Validate with node tools/validate.mjs after every pass. Keep the
present-day-imagery disclaimer.

Both Traditional Chinese and English support.
```

For reference, the [Battle of Hong Kong](https://github.com/keithligh/battle-of-hong-kong-1941) documentary was built
from a single from-scratch brief, shipped there as
[PROMPT.md](https://github.com/keithligh/battle-of-hong-kong-1941/blob/main/PROMPT.md), before this engine existed. The
full sourcing for this Jaburo production is in
[Research_Brief_BattleOfJaburo.md](Research_Brief_BattleOfJaburo.md).
