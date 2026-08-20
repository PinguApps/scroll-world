# Video provider adapters

Keep orchestration, approval, naming, and Blazor delivery provider-neutral. Lock exactly one
adapter in `.scroll-world/review/run-manifest.json` before the first video and use it for the complete run.

## Contents

1. Provider lock and common contract
2. Wan 3.0 through the `wan` CLI
3. fal.ai Kling Video v3 Pro through MCP
4. Waiting and recovery
5. One-time remaining-work estimate

## 1. Provider lock and common contract

Store at least:

```json
{
  "videoProvider": "wan",
  "videoModel": "wan3.0",
  "lockedAt": "<ISO-8601>",
  "generateAudio": false
}
```

or:

```json
{
  "videoProvider": "fal.ai",
  "videoModel": "fal-ai/kling-video/v3/pro/image-to-video",
  "lockedAt": "<ISO-8601>",
  "generateAudio": false
}
```

Do not switch provider, model endpoint, or tier between draft, production, portrait, rerolls,
or fan-out branches. A requested switch starts a separately costed run/branch and invalidates
motion comparisons and any downstream dependency whose pixels change.

For both adapters:

- Use one approved first frame for every leg/dive.
- Add an approved end frame only when the clip must land on an exact boundary.
- Disable generated audio in the request and remove all audio during delivery encoding.
- Persist the provider request/task ID and submission payload immediately.
- Download into the exact ordered, revisioned candidate path; never overwrite.
- Verify dimensions, duration, streams, frame zero, and final frame before review.
- Treat successful generation as an unapproved candidate until the user gives a thumbs-up.

## 2. Wan 3.0 through the `wan` CLI

Before the first Wan command in a session, follow the installed `wan-cli` skill and run:

```powershell
wan --version
wan update --check --output json
wan auth status --output json
wan credits --output json
wan task list --page-size 10 --media-type video --output json
```

Ask before updating. Lock the current top model; at authoring time it is Wan 3.0. Use the
live `taskQuota.video` as available concurrency and cap this skill at three in-flight jobs.

Single boundary:

```powershell
wan frame2video `
  --first-frame <approved-frame-path> `
  --prompt <prompt-text> `
  --resolution <720P|1080P> `
  --duration <seconds> `
  --audio-output=false `
  --output json
```

Two boundaries:

```powershell
wan frame2video `
  --first-frame <approved-start-path> `
  --last-frame <approved-end-path> `
  --prompt <prompt-text> `
  --resolution <720P|1080P> `
  --duration <seconds> `
  --audio-output=false `
  --output json
```

Use `720P` only for previz and `1080P` for a production source. Do not pass a legacy model,
uploaded audio, fixed ratio, generation mode, or thinking-mode flag. Run `--dry-run` when
changing command shape and verify `modelVersion: "3_0"`, `audio: false`, resolution,
`baseImage`, and optional `tailImage`.

Wan jobs may legitimately take several hours. Persist the task ID and candidate metadata,
then use short, non-blocking `wan result get <taskId> --output json` checks. Do not mark a
queued/running task failed because hours have elapsed, do not busy-poll, and do not resubmit
an ambiguous task. Keep the user informed at meaningful intervals and resume later from the
stored task ID. On success, save with:

```powershell
wan result get <taskId> --save --save-dir <candidate-dir> --output json
```

The default saved result is watermark-free. Use `--with-watermark` only when requested.

## 3. fal.ai Kling Video v3 Pro through MCP

Prefer the configured fal MCP server. Confirm that its authenticated tools are available;
never print or embed `FAL_KEY`. Use only this endpoint:

```text
fal-ai/kling-video/v3/pro/image-to-video
```

Call `get_model_schema` with the exact endpoint before the first submission because model
schemas can change; do not call `recommend_model` because the user has explicitly selected
Kling v3 Pro. Call `get_pricing` internally and retain its live result for the one-time
post-sample estimate, but do not narrate pricing before or during each generation.

Upload approved local frames and record each local SHA-256-to-URL mapping. The hosted HTTP
MCP's `upload_file.file_path` cannot read the local machine. Use `upload_file` only for a
public URL or a small local file below 1 MB supplied as base64 `data` plus `file_name`. For a
larger local frame, use the fal storage API flow documented by that MCP tool—initiate the
upload with `Authorization: Key $FAL_KEY`, PUT the bytes to the returned signed URL, and use
the returned `file_url`—or use an already-installed server-side `fal.storage.upload`. Never
print the key, pass base64 through model-visible text, or invent a public URL.

If the configured MCP is unavailable, report the exact authentication/tool error. Use an
already-installed `@fal-ai/client` server-side fallback only after the user approves it. Its
`fal.storage.upload` method may upload the approved local frames; never expose credentials in
browser code or logs. Do not install a package or change authentication silently.

Submit this shape with MCP `submit_job`; do not use `run_model` for video:

```json
{
  "start_image_url": "<approved uploaded start frame>",
  "prompt": "<single continuous-shot prompt plus Kling pace clause>",
  "duration": "8",
  "generate_audio": false,
  "end_image_url": "<optional approved uploaded end frame>",
  "negative_prompt": "static, motionless action, frozen people, frozen pose, stalled camera, imperceptibly slow camera movement, sluggish camera movement, scene cut, cutaway, jump cut, multi-shot, abrupt transition, flicker, jitter, camera shake, blur, distortion, low quality, text, subtitles, captions, logos, watermark, duplicated subjects, malformed hands, extra limbs",
  "cfg_scale": 0.5
}
```

Rules:

- Use `prompt`; never send `multi_prompt`. Multi-prompt creates multi-shot cutaways.
- Omit `shot_type` because it belongs to multi-prompt behaviour.
- Omit `elements`; this skill does not support Kling elements yet.
- Set `generate_audio` to `false` explicitly because its default is true.
- Supply `duration` as one string value from `"3"` through `"15"`.
- Omit `end_image_url` when there is no exact end boundary.
- Keep `cfg_scale` at `0.5` unless user feedback specifically warrants changing adherence.
- Keep `static` in the negative prompt so people, vehicles, props, and other movable subjects
  visibly move. Keep cut/cutaway/multi-shot terms there as an additional single-take guard.
- Aspect ratio is inferred from the start image. Ensure an optional end image has the same
  aspect and compatible dimensions.
- The endpoint exposes no resolution input. Do not fabricate one or switch to Kling Standard
  for a 720p draft. Verify every returned source. Accept a production master only when its
  measured dimensions meet the 1080p requirement; never upscale a lower result.

Append this clause to every Kling motion prompt, adapting only the direction/focal target:

```text
The camera glides decisively at a brisk, clearly perceptible pace from the first second,
covering substantial visible distance throughout the shot. Maintain smooth cinematic
acceleration and continuous motion; never hover, stall, crawl, or move imperceptibly.
```

Remove contradictory phrases such as “very slow camera,” “barely moving,” or “slow motion”
from the base prompt. Subject motion can remain graceful; the camera travel must read faster
than Kling's usual default.

Store `request_id`, `status_url`, `response_url`, and `cancel_url` immediately. Poll with
`check_job`, preferring the canonical `status_url`. After it reports `COMPLETED`, call
`get_job_result`, preferring the canonical `response_url`, immediately; result URLs and
queue records are not durable storage. Never call `submit_job` again for the same request.
Download `video.url` to the candidate-specific local path immediately and validate it with
`ffprobe` before doing unrelated work. fal's published endpoint default is one concurrent request per user; use one
unless the live MCP/account explicitly reports a higher limit, and never exceed this skill's
cap of three. Call `cancel_job` only when the user explicitly asks to cancel that request.

## 4. Waiting and recovery

For fal/Kling, remain in the workflow and wait for the queued request to complete. Poll queue
status about every 15–30 seconds when the MCP does not provide a blocking wait, while keeping
the user updated within normal interactive intervals. Completion should normally take a few
minutes. If it remains queued/running beyond 15 minutes, inspect its existing status/logs and
report the delay; do not abandon or duplicate it. Fetch the result only after completion.

For Wan, expect hours and use the persisted-task workflow above. A new session must read
`.scroll-world/review/run-manifest.json` and `.scroll-world/review/approval-ledger.md`, then resume exact task IDs rather
than rediscovering candidates with globs.

For either provider, preserve failed submissions and payloads. Correct authentication,
content-safety, input, or rate-limit problems without changing provider/model. Before retrying
an ambiguous submission, prove that no request/task ID was created.

If a billing/account lock blocks result retrieval, persist the exact error, status, request
ID, and status/result URLs. Do not resubmit while the existing result is ambiguous. After
the account is unlocked, try the stored result URL once. If it returns a definitive
`404`/`NOT_FOUND`, record that the provider purged or lost the result; only then create a new
revision under the existing authorization and allowance, or ask if it exceeds them.

## 5. One-time remaining-work estimate

Do not discuss price at each submission or review. After the first representative video
finishes:

- Wan: compare the before/after credit balance once when available and estimate remaining
  clips from that measured deduction.
- fal/Kling: use the live `get_pricing` result retained for the exact endpoint, or returned
  billing data when more specific, then multiply it by locked durations and remaining
  candidate allowance. Label it an estimate; never hard-code the public example-page rate.

Present that single remaining-work estimate and ask whether to continue. Revisit price only
when the user materially changes clip count, durations, provider/model, native-mobile scope,
or revision allowance.
