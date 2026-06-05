# Skill evals · Skill 自动评测

Automated quality check for the [`shortfilm-prompt`](../skills/shortfilm-prompt/SKILL.md)
skill. For each case in [`cases.json`](./cases.json) it generates a prompt, then has
an LLM judge score the output against the same 10-item self-check baked into the
skill. If any case scores below the threshold the run fails — so a careless edit to
`SKILL.md` can't silently regress prompt quality.

Complements the manual cross-window harness in
[`../skills/shortfilm-prompt/TESTING.md`](../skills/shortfilm-prompt/TESTING.md):
that one is a human spot-check, this one is scriptable.

> 这是 `shortfilm-prompt` 的自动质量检查：对每个用例生成提示词，再让 LLM 评审按
> 10 条自检打分，低于阈值就失败。改 `SKILL.md` 时若把质量改回退了会被拦住。

## Two backends · 两种后端

| Backend | How | Key? |
|---|---|---|
| **`cli`** (default) | Shells out to your local **`claude` CLI** and invokes the **real** skill headless: `claude -p --plugin-dir <repo> "/ai-shortfilm-prompts:shortfilm-prompt …"`. Tests the actual installed skill end-to-end. | **No** — uses the CLI's own auth |
| `api` | `anthropic` Python SDK with `SKILL.md` as the system prompt (approximation). | Needs `ANTHROPIC_API_KEY` |

Selection is automatic: `claude` on PATH → `cli`; else `ANTHROPIC_API_KEY` set → `api`;
else **skip** (exit 0, so fork PRs don't hard-fail). Force with `EVAL_BACKEND=cli|api`.

> 默认用本地 `claude` CLI 跑**真 skill**，不需要 API key。CI 里没有 CLI 登录态时，
> 设了 `ANTHROPIC_API_KEY` secret 就走 API，否则自动跳过。

## Run locally · 本地运行

```bash
python evals/run_evals.py        # uses your local claude CLI — no key needed
```

The CLI backend invokes the real agent per case, so the full set takes **several
minutes**. Env knobs: `EVAL_BACKEND` (`cli`/`api`/`auto`), `GEN_MODEL`,
`JUDGE_MODEL` (default `claude-sonnet-4-6`), `EVAL_THRESHOLD` (default `8`),
`EVAL_CALL_TIMEOUT` (default `300`s).

## CI

[`.github/workflows/evals.yml`](../.github/workflows/evals.yml) runs on changes to
`skills/**` or `evals/**`, plus manual dispatch. GitHub runners have no `claude`
login, so CI uses the `api` backend **only if** the `ANTHROPIC_API_KEY` repo secret
is set (Settings → Secrets and variables → Actions); without it the run skips with a
notice instead of failing. Day-to-day, run the `cli` backend locally before pushing.

## Add a case · 加用例

Append `{ "id": "...", "input": "<a natural user request>" }` to `cases.json`.
Keep the count small — each case is two model calls.
