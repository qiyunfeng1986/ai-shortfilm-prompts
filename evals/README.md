# Skill evals · Skill 自动评测

Automated quality gate for the [`shortfilm-prompt`](../skills/shortfilm-prompt/SKILL.md)
skill. It feeds `SKILL.md` as the system prompt, generates a prompt for each case
in [`cases.json`](./cases.json), and has an LLM judge score the output against the
same 10-item self-check baked into the skill. If any case scores below the
threshold, the run fails — so a careless edit to `SKILL.md` can't silently
regress prompt quality.

This complements the manual cross-window harness in
[`../skills/shortfilm-prompt/TESTING.md`](../skills/shortfilm-prompt/TESTING.md):
that one is for a human spot-check, this one runs in CI on every change.

> 这是 `shortfilm-prompt` skill 的自动质量闸：把 `SKILL.md` 当系统提示词跑出
> 提示词，再让 LLM 评审按 10 条自检打分，低于阈值就让 CI 红。改 `SKILL.md`
> 时若把质量改回退了，CI 会拦住。

## Run locally · 本地运行

```bash
export ANTHROPIC_API_KEY=sk-ant-...
python evals/run_evals.py
```

Optional env: `GEN_MODEL`, `JUDGE_MODEL` (default `claude-sonnet-4-6`),
`EVAL_THRESHOLD` (default `8`, range 0–10).

## CI

[`.github/workflows/evals.yml`](../.github/workflows/evals.yml) runs on changes
to `skills/**` or `evals/**`, plus manual dispatch. It needs the
**`ANTHROPIC_API_KEY`** repository secret
(Settings → Secrets and variables → Actions). Without it (e.g. on fork PRs) the
runner skips with a notice instead of failing.

## Add a case · 加用例

Append `{ "id": "...", "input": "<a natural user request>" }` to `cases.json`.
Keep the count small — each case is two model calls.
