#!/usr/bin/env python3
"""Skill eval runner for the /shortfilm-prompt skill.

How it works:
  1. Feed skills/shortfilm-prompt/SKILL.md as the system prompt (this simulates
     the skill being loaded into Claude Code).
  2. For each case in cases.json, generate a prompt from the case's user input.
  3. An LLM judge scores the output against the 10-item self-check baked into
     SKILL.md and returns JSON.
  4. Fail the run if any case scores below EVAL_THRESHOLD.

This is an approximation of the real Claude Code skill (no harness / AskUser
Question), but it measures the thing that matters: do SKILL.md's instructions
reliably produce compliant prompts?

Env:
  ANTHROPIC_API_KEY  Required. If absent, the runner SKIPS (exit 0) so that
                     fork PRs without the secret don't hard-fail.
  GEN_MODEL          Generator model (default: claude-sonnet-4-6)
  JUDGE_MODEL        Judge model     (default: claude-sonnet-4-6)
  EVAL_THRESHOLD     Min passing score, 0-10 (default: 8)

Local run:
  export ANTHROPIC_API_KEY=sk-...
  python evals/run_evals.py
"""
import json
import os
import re
import sys
import pathlib

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent
SKILL = ROOT / "skills" / "shortfilm-prompt" / "SKILL.md"
CASES = HERE / "cases.json"

# The 10-item self-check, mirrored from SKILL.md's "30-second self-check".
CHECKLIST = [
    "All 5 stages present (core theme / character / atmosphere / camera / storyboard)",
    "A real camera + lens model is named (e.g. IMAX + Panavision C, Sony Venice + Canon K-35)",
    'The full breath-like float sentence is present ("extremely subtle, breath-like camera float")',
    'A sound line is present ("No score. Production audio only." or enumerated production audio)',
    "At least 2 concrete imperfection / battle-damage descriptions",
    "The ending is restrained — no blinding light / explosion / victory-pose FX pile-up",
    "No vague praise filler (perfect / stunning / epic / handsome / 4K used as a quality crutch)",
    "No raw IP names, OR if an IP name is present a warning line about IP filters is added",
    "Duration discipline: single-shot <= 15s, multi-shot <= 8 shots",
    "A closing model-specific compatibility advice line is included",
]


def skip(msg: str) -> None:
    print(f"::notice::{msg}")
    sys.exit(0)


def text_of(message) -> str:
    return "".join(b.text for b in message.content if getattr(b, "type", "") == "text")


def main() -> None:
    if not os.environ.get("ANTHROPIC_API_KEY"):
        skip("ANTHROPIC_API_KEY not set — skipping skill evals (expected on fork PRs).")
    try:
        from anthropic import Anthropic
    except ImportError:
        skip("anthropic SDK not installed — skipping. Run `pip install anthropic`.")

    gen_model = os.environ.get("GEN_MODEL", "claude-sonnet-4-6")
    judge_model = os.environ.get("JUDGE_MODEL", "claude-sonnet-4-6")
    threshold = int(os.environ.get("EVAL_THRESHOLD", "8"))

    system = SKILL.read_text(encoding="utf-8")
    cases = json.loads(CASES.read_text(encoding="utf-8"))
    client = Anthropic()

    checklist_txt = "\n".join(f"{i + 1}. {c}" for i, c in enumerate(CHECKLIST))
    judge_system = (
        "You are a strict QA reviewer for cinematic AI-video prompts. Evaluate the "
        "generated prompt against the 10-item checklist. An item passes ONLY if it is "
        "concretely satisfied — be literal, not generous. Respond with ONLY a JSON "
        "object (no markdown, no prose) of the exact form: "
        '{"passes":[<item numbers that pass>],'
        '"fails":[{"n":<item number>,"why":"<short reason>"}],'
        '"score":<integer count of passing items, 0-10>}'
    )

    print(f"gen={gen_model}  judge={judge_model}  threshold={threshold}  cases={len(cases)}\n")
    results = []
    any_failed = False

    for case in cases:
        gen = client.messages.create(
            model=gen_model,
            max_tokens=2000,
            system=system,
            messages=[{"role": "user", "content": case["input"]}],
        )
        output = text_of(gen)

        judged = client.messages.create(
            model=judge_model,
            max_tokens=1000,
            temperature=0,
            system=judge_system,
            messages=[{
                "role": "user",
                "content": f"CHECKLIST:\n{checklist_txt}\n\nGENERATED PROMPT:\n{output}",
            }],
        )
        raw = text_of(judged).strip()
        raw = re.sub(r"^```(?:json)?\s*|\s*```$", "", raw).strip()
        try:
            verdict = json.loads(raw)
            score = int(verdict.get("score", len(verdict.get("passes", []))))
            fails = verdict.get("fails", [])
        except Exception as e:  # noqa: BLE001 — judge non-compliance is a test signal
            score, fails = -1, [{"n": 0, "why": f"judge returned unparseable JSON: {e}"}]

        ok = score >= threshold
        any_failed = any_failed or not ok
        results.append((case["id"], score, ok))
        print(f"[{'PASS' if ok else 'FAIL'}] {case['id']}: {score}/10")
        if not ok:
            for f in fails:
                print(f"        x item {f.get('n')}: {f.get('why')}")

    print("\n=== Summary ===")
    for cid, score, ok in results:
        print(f"  {'PASS' if ok else 'FAIL'}  {cid}: {score}/10")

    if any_failed:
        print("\nOne or more cases scored below threshold — SKILL.md likely has a gap to close.")
        sys.exit(1)
    print("\nAll cases passed.")


if __name__ == "__main__":
    main()
