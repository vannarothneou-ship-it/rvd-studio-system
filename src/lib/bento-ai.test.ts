import { describe, expect, it } from "vitest";
import { autoArrange, recordChoice } from "./bento-ai";

const mk = (id: string, span = 6) => ({ id, title: id, span });

describe("autoArrange", () => {
  it("never leaves a gap: every row sums to 12", () => {
    for (let n = 1; n <= 9; n++) {
      const items = Array.from({ length: n }, (_, i) =>
        mk(`w${i}`, [4, 6, 8, 12][i % 4]),
      );
      const { spans } = autoArrange(items);
      let used = 0;
      for (const s of spans) {
        used += s.span;
        if (used === 12) used = 0;
        expect(used).toBeLessThan(12);
      }
      expect(used).toBe(0);
    }
  });

  it("gives calendars the full row and stats a third", () => {
    const { spans } = autoArrange([
      mk("stat-a"),
      mk("stat-b"),
      mk("stat-c"),
      mk("calendar"),
    ]);
    expect(spans.map((s) => s.span)).toEqual([4, 4, 4, 12]);
  });

  it("learns from manual choices", () => {
    let learned = {};
    learned = recordChoice(learned, "notes", 12);
    learned = recordChoice(learned, "notes", 12);
    const { spans } = autoArrange([mk("notes", 4)], learned);
    expect(spans[0]!.span).toBe(12);
  });
});
