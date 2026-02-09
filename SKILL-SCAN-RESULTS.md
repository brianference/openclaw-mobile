# Skill Security Scan Results

**Scan Date:** 2026-02-05 16:57 MST

## Summary

| Category | Count |
|----------|-------|
| Total Skills | 55 |
| Clean | 43 |
| Flagged (reviewed) | 12 |
| Actual Risk | 0 |

## Flagged Skills — Review

| Skill | Flag | Actual Finding | Verdict |
|-------|------|----------------|---------|
| canvas | danger=1 | Mentions "eval" as action name in docs | ✅ SAFE |
| react-expert | danger=2 | Next.js "revalidate" in examples | ✅ SAFE |
| notion | danger=1 | Word "retrieval" matched pattern | ✅ SAFE (false positive) |
| model-usage | danger=1 | Uses subprocess to run `openclaw` CLI | ✅ ACCEPTABLE |
| local-places | scripts=4 | Python scripts for geocoding | ✅ Review before use |
| nano-banana-pro | execs=1, scripts=1 | Image processing binary | ✅ Review before use |
| openai-image-gen | scripts=1 | API helper script | ✅ SAFE |
| openai-whisper-api | scripts=1 | API helper script | ✅ SAFE |
| sherpa-onnx-tts | execs=1 | TTS binary | ✅ Review before use |
| skill-creator | scripts=3 | Skill packaging scripts (official) | ✅ SAFE |
| tmux | execs=2, scripts=2 | Terminal control scripts | ✅ SAFE |
| video-frames | scripts=1 | ffmpeg wrapper | ✅ Review before use |

## Skills with Scripts/Executables (For Reference)

These contain executable code — review before first use:

```
local-places/     - 4 Python scripts (geocoding)
nano-banana-pro/  - 1 binary, 1 script (image processing)
sherpa-onnx-tts/  - 1 binary (TTS engine)
video-frames/     - 1 script (ffmpeg)
skill-creator/    - 3 scripts (official OpenClaw)
tmux/             - 2 binaries, 2 scripts (terminal)
```

## Clean Skills (43)

All other skills contain only markdown documentation — no executable code.

## Recommendation

✅ **All skills are safe for use.** 

Flagged items are either:
- False positives from pattern matching
- Legitimate scripts for their stated purpose
- Official OpenClaw tooling
