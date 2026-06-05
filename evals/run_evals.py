#!/usr/bin/env python3
"""Skill eval runner for the /shortfilm-prompt skill.

For each case in cases.json it:
  1. Generates a prompt from the case brief.
  2. Has a judge score the output against the 10-item self-check from SKILL.md.
  3. Fails the run if any case scores below EVAL_THRESHOLD.

Two backends, auto-selected (override with EVAL_BACKEND=cli|api):
  * cli  — DEFAULT when the `claude` CLI is on PATH. Invokes the REAL skill
           headless: `claude -p --plugin-dir <repo> "/ai-shortfilm-prompts:shortfilm-prompt …"`.
           No API key needed — uses the CLI's own auth. Most authentic (tests
           the actual installed skill end-to-end). Each call runs in an isolated
           temp cwd so the repo's CLAUDE.md never contaminates the run.
  * api  — uses the `anthropic` Python SDK with SKILL.md as the system prompt;
           needs ANTHROPIC_API_KEY. Fallback (e.g. CI) when the CLI is absent.
If neither is available the runner SKIPS (exit 0) so fork PRs don't hard-fail.

Env:
  EVAL_BACKEND     cli | api | auto   (default auto)
  GEN_MODEL        generator model    (default claude-sonnet-4-6)
  JUDGE_MODEL      judge model        (default claude-sonnet-4-6)
  EVAL_THRESHOLD   min passing score, 0-10 (default 8)
  EVAL_CALL_TIMEOUT per-call seconds  (default 300)

Local run (no key needed; the CLI backend is slow — minutes for the full set):
  python evals/run_evals.py
"""
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import pathlib

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent
SKILL = ROOT / "skills" / "shortfilm-prompt" / "SKILL.md"
CASES = HERE / "cases.json"
SKILL_CMD = "/ai-shortfilm-prompts:shortfilm-prompt"
CALL_TIMEOUT = int(os.environ.get("EVAL_CALL_TIMEOUT", "300"))

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
JUDGE_INSTR = (
    "You are a strict QA reviewer for cinematic AI-video prompts. Evaluate the "
    "generated prompt against the 10-item checklist below. An item passes ONLY if "
    "it is concretely satisfied — be literal, not generous. Respond with ONLY a "
    "JSON object (no markdown, no prose before or after) of the exact form: "
    '{"passes":[<item numbers that pass>],'
    '"fails":[{"n":<item number>,"why":"<short reason>"}],'
    '"score":<integer count of passing items, 0-10>}'
)
GEN_SUFFIX = " (Generate the complete prompt now. Do not ask clarifying questions.)"


def skip(msg: str):
    print(f"::notice::{msg}")
    sys.exit(0)


def parse_verdict(raw: str):
    raw = re.sub(r"^```(?:json)?\s*|\s*```$", "", raw.strip()).strip()
    m = re.search(r"\{.*\}", raw, re.DOTALL)
    verdict = json.loads(m.group(0) if m else raw)
    return int(verdict.get("score", len(verdict.get("passes", [])))), verdict.get("fails", [])


def build_backend(backend, gen_model, judge_model, checklist_txt):
    if backend == "cli":
        work = tempfile.mkdtemp(prefix="shortfilm-eval-")

        def run(cmd):
            r = subprocess.run(cmd, capture_output=True, text=True, timeout=CALL_TIMEOUT, cwd=work)
            if r.returncode != 0:
                raise RuntimeError(f"claude exited {r.returncode}: {r.stderr.strip()[:300]}")
            return r.stdout.strip()

        def generate(brief):
            return run(["claude", "-p", "--model", gen_model, "--plugin-dir", str(ROOT),
                        f"{SKILL_CMD} {brief}{GEN_SUFFIX}"])

        def judge(output):
            return run(["claude", "-p", "--model", judge_model,
                        f"{JUDGE_INSTR}\n\nCHECKLIST:\n{checklist_txt}\n\nGENERATED PROMPT:\n{output}"])
        return generate, judge

    from anthropic import Anthropic  # noqa: E402
    client = Anthropic()
    skill_text = SKILL.read_text(encoding="utf-8")

    def _text(m):
        return "".join(b.text for b in m.content if getattr(b, "type", "") == "text").strip()

    def generate(brief):
        return _text(client.messages.create(model=gen_model, max_tokens=2000, system=skill_text,
                     messages=[{"role": "user", "content": brief + GEN_SUFFIX}]))

    def judge(output):
        return _text(client.messages.create(model=judge_model, max_tokens=1000, temperature=0,
                     system=JUDGE_INSTR,
                     messages=[{"role": "user", "content": f"CHECKLIST:\n{checklist_txt}\n\nGENERATED PROMPT:\n{output}"}]))
    return generate, judge


def choose_backend():
    want = os.environ.get("EVAL_BACKEND", "auto").lower()
    have_cli = shutil.which("claude") is not None
    have_key = bool(os.environ.get("ANTHROPIC_API_KEY"))
    if want == "cli":
        return "cli" if have_cli else skip("EVAL_BACKEND=cli but `claude` not on PATH.")
    if want == "api":
        return "api" if have_key else skip("EVAL_BACKEND=api but ANTHROPIC_API_KEY not set.")
    if have_cli:
        return "cli"
    if have_key:
        return "api"
    skip("No backend: `claude` CLI not found and ANTHROPIC_API_KEY not set — skipping evals.")


def main():
    backend = choose_backend()
    gen_model = os.environ.get("GEN_MODEL", "claude-sonnet-4-6")
    judge_model = os.environ.get("JUDGE_MODEL", "claude-sonnet-4-6")
    threshold = int(os.environ.get("EVAL_THRESHOLD", "8"))
    checklist_txt = "\n".join(f"{i + 1}. {c}" for i, c in enumerate(CHECKLIST))
    generate, judge = build_backend(backend, gen_model, judge_model, checklist_txt)
    cases = json.loads(CASES.read_text(encoding="utf-8"))

    print(f"backend={backend}  gen={gen_model}  judge={judge_model}  threshold={threshold}  cases={len(cases)}\n")
    results, any_failed = [], False
    for case in cases:
        try:
            output = generate(case["input"])
            score, fails = parse_verdict(judge(output))
        except Exception as e:  # noqa: BLE001 — a failed call/parse is itself a failing case
            score, fails = -1, [{"n": 0, "why": f"{type(e).__name__}: {str(e)[:200]}"}]
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
