# Media failure guide

- **Visible seam pop:** endpoint came from a concept still rather than the neighbouring rendered clip. Re-extract and regenerate. A crossfade cannot hide a large content mismatch.
- **Seam reads like rewind:** camera velocity reversed across the boundary. Use architecture A for grounded walkthroughs; every leg must finish and begin with the same gentle forward drift. Architecture B’s pull-out is suitable only when an aerial miniature hop is intentional.
- **Frozen at frame zero:** hosting has no useful byte-range seekability. Keep the engine’s Blob fetch path.
- **Huge clips:** all-intra encoding was used. Desktop GOP 8 is the baseline; native mobile GOP 4. Tighten only after measured decoder issues.
- **Soft output:** source was downscaled/upscaled or over-compressed. Wan production must be
  generated at `1080P`. fal/Kling Pro exposes no resolution parameter, so verify the returned
  source is 1080p. Encode at native resolution, about CRF 20, with restrained sharpening.
  Never upscale a draft into a production master.
- **White box around an island:** match the page background exactly. Use `knockout.py`
  only when the approved concept must be composited onto a portrait canvas; video and
  frame-0 posters remain full-frame.
- **Concurrency rejection (`4007`, `50000`, `100101`):** re-check in-flight tasks and
  `taskQuota.video`; wait for an existing task rather than resubmitting or blaming credits.
- **fal/Kling queue rejection or delay:** inspect the stored fal request ID and queue status.
  Its default concurrency is one. Wait for the existing request rather than duplicating it.
- **fal MCP authentication failure:** ensure the MCP process receives `FAL_KEY`, but never
  print the key. Do not switch provider/model or install an SDK without approval.
- **Ambiguous service response (`9001` or non-JSON):** inspect
  `wan task list --media-type video --output json` before retrying so a successful task is
  not duplicated.
- **Insufficient usable credits (`50001`) or holding-path rejection (`50004`):** inspect
  `wan credits --output json`, auth status, and in-flight tasks. Do not call the live
  concurrency quota a credit balance or promise a daily reset.
- **Repeated content-safety rejection (`9007`, `9008`, `9012`, `10017`):** preserve the
  failed candidate, ask the user to revise the affected input/prompt, and never silently
  switch to an older model or leave a missing clip.
- **Input rejection (`9005`, `9006`, `9010`, `9013`):** correct the path, media, resolution,
  or parameters. On `LOCAL_FILE_VALIDATION_FAILED`, follow the CLI's structured
  `details.suggestedFix`; do not modify a source in place.
- **Model accepts only a reference image:** reference conditioning is not frame locking. It cannot guarantee a seam and is not eligible for the chain.
- **Wrong adjacent frame or missing file on macOS:** interactive zsh arrays are 1-indexed. Run array-driven pipeline blocks as `#!/bin/bash` scripts; keep them Bash 3.2-safe and avoid associative arrays.
- **Blank video on iOS:** retain muted/playsinline, still-until-first-painted-frame, and first-gesture play/pause priming.
- **Phone freezes on fast flick:** confirm the native mobile file is actually selected, then measure. GOP 4/720-wide portrait plus seek coalescing is the baseline; GOP 2 is an evidence-based fallback.
- **Mobile URL-bar jump:** do not relayout for touch height-only resize; relayout on width/orientation change.
- **Portrait crop loses subject:** the user received desktop fallback or an explicitly approved crop, not a native portrait chain. Native 9:16 scenes need their own matching posters and every connector regenerated from portrait boundary frames.
- **Mixed look at one seam:** the image source/style or video provider/model changed
  mid-chain. Use one direct still path and the provider/model locked in the run manifest.
- **Unexpected charge for silent footage:** confirm Wan records `audio: false` or fal/Kling
  sends `generate_audio: false`. A provider may retain an effectively silent AAC container
  track; measure it, reject audible generated sound, and remove all audio with `-an`.
- **Kling camera barely moves:** remove slow/slow-motion language, append the required brisk
  decisive-glide clause, and keep `static`, stalled/slow camera, and frozen action in the
  negative prompt. Revise only after thumbs-down feedback.
- **Kling introduces cutaways:** `multi_prompt` or shot-planning fields were sent, or the
  prompt invited multiple shots. Use only `prompt`; omit `multi_prompt`, `shot_type`, and
  `elements`, and keep cuts/cutaways/multi-shot in the negative prompt.
- **Kling payload rejects resolution:** the Pro image-to-video endpoint has no resolution
  field. Remove it, keep the Pro endpoint, and verify the returned dimensions instead.
- **Rejected clip appears in the build:** an encode glob selected every revision. Encode
  from the approval ledger's exact filenames only; keep rejected candidates for audit.
- **Rejected concept conditions a video:** a generation glob selected revisions instead of
  the approval ledger. Generate images one at a time and build contact sheets/inputs only
  from exact approved filenames.
- **Poster flashes or has the wrong aspect:** a 3:2 concept image was published as a
  poster. Rebuild the poster from exact frame 0 of the approved section video and use its
  real intrinsic dimensions. Native mobile needs its own portrait frame-0 source in the
  SSR `<picture>`.
