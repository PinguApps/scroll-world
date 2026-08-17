# scroll-world

https://github.com/user-attachments/assets/b08e641e-985b-4bd4-83ff-6750272d0c37

An agent skill for building a production-minded immersive scroll-scrubbed **homepage** in a Blazor Web App.

As a visitor scrolls, a pre-rendered camera moves through a connected generated world. The experience can use an isometric diorama, grounded architectural walkthrough, locked isometric glide, or another approved art direction. The skill handles business/brand discovery, approval-gated image and video generation, responsive encoding, the proven scroll engine, homepage SSR/SEO/AEO, Blazor InteractiveAuto lifecycle, tests, and performance QA.

## Install

### Claude Code — plugin

```text
/plugin marketplace add PinguApps/scroll-world
/plugin install scroll-world@scroll-world
```

Then invoke `/scroll-world`.

### Codex and other agents — skills CLI

```bash
npx skills add PinguApps/scroll-world
npx skills add PinguApps/scroll-world -a codex
```

In Codex, invoke `$scroll-world`.

### Manual

```bash
git clone https://github.com/PinguApps/scroll-world
cp -R scroll-world/skills/scroll-world ~/.codex/skills/
```

## Target

The skill is intentionally Blazor-first. It expects a server-hosted Blazor Web App that can use InteractiveAuto. If the project does not yet have a WebAssembly client/Auto support, the agent explains the structural change and asks before converting it.

It produces:

- A cinematic scroll-scrubbed homepage.
- Semantic SSR homepage content and responsive posters/LQIPs derived from each approved
  section video's exact opening frame.
- Homepage canonical/social metadata, truthful homepage JSON-LD, approved links, accessibility, and reduced-motion support.
- Optional minimal “Coming soon” placeholder routes where homepage navigation needs a missing destination.
- A lifecycle-safe scroll engine limited to home; native scroll everywhere else.
- A fresh homepage that does not start/download Blazor, while interactive pages use Auto and retain the runtime when navigating back home.
- Behavioural regression tests plus browser, network, seam, and Lighthouse checks.

It does not flesh out service, contact, about, legal, blog, or other supporting pages, and
does not take ownership of site-wide SEO/AEO, robots, sitemap, or supporting-page schema.

## Requirements

- A Blazor Web App targeting a currently supported .NET version.
- Current authenticated [`wan` CLI](https://www.npmjs.com/package/@wan-ai/cli) with an
  eligible Wan membership and sufficient credits.
- `ffmpeg` and `ffprobe`.
- PowerShell 7 on Windows, or Bash 3.2+ with `jq` on Unix-like systems.
- Python 3 + Pillow when background knockout or local LQIP tooling requires it.
- Direct ChatGPT/Codex image generation for stills. Wan image commands are intentionally
  excluded from this skill.

The skill audits these requirements but does not install tools, authenticate, switch workspaces, or spend credits without approval.

## Media choices

Every run explicitly chooses:

- The current top Wan video model (Wan 3.0 today) for the complete chain.
- 720p for tests/previz and 1080p for production renders, always with generated audio off.
- Desktop only or a separate native 9:16 mobile chain. Native mobile roughly doubles video
  generation and can require separate portrait stills; a crop is never silently labelled
  mobile-optimised.
- Fly-through dives/connectors, a continuous forward walkthrough, or a locked isometric glide.
- Direct ChatGPT/Codex image generation for all stills in the chain, never Wan.

The seam rule is strict: neighbouring clips share actual rendered boundary frames. Scroll scrubs the resulting video; it does not render 3D in the browser.

Every stochastic image and video receives its own review—scene concepts, portrait variants,
social/brand images, dives, legs, and connectors. The skill shows the candidate with its
prompt/settings/task details and waits for a thumbs-up or thumbs-down with feedback.
Rejected revisions are preserved and logged. Only approved stills may condition video, and
only an explicitly approved clip can unlock dependent generation. Up to three independent
Wan videos may run concurrently when the live quota and approved spend allow it.

## Proven interaction defaults

- No scroll snapping or forced section stops.
- Accumulated wheel targets so fast wheel input always travels farther.
- Frame-time-aware smooth response; native touch, keyboard, scrollbar, and middle-button autoscroll.
- Copy changes quickly at exact section boundaries and stays fully settled within a section.
- Tunable meaningful route-dot landing frames and 1.8-second cinematic navigation.
- Demand-driven seeking, coalesced decoder work, nearby-only media, abort/revoke disposal, and no permanent animation loop.
- Atomic scroll-to-top during enhanced navigation, without the outgoing page visibly racing upward.

## Skill contents

```text
skills/scroll-world/
├── SKILL.md
├── agents/openai.yaml
├── assets/
│   ├── blazor/
│   │   ├── app-bootstrap.js
│   │   ├── scroll-world-index.js.template
│   │   ├── scroll-world.css.template
│   │   ├── App.razor.integration.template
│   │   ├── BlazorWarmup.razor
│   │   ├── Placeholder.razor.template
│   │   └── Home.razor.template
│   └── tests/scroll-world-engine.test.mjs.template
└── references/
    ├── prompts.md
    ├── pipeline.md
    ├── scrub-engine.js
    ├── blazor-integration.md
    ├── homepage-foundation.md
    ├── qa.md
    ├── media-gotchas.md
    ├── review-workflow.md
    └── knockout.py
```

Generated media is project-specific and is not stored in this repository.

The skill re-checks the installed WAN CLI before each build, uses Wan 3.0 first/last-frame
conditioning, passes local frames directly for CLI-managed upload, respects the account's
live video concurrency, and records task IDs and credit changes. Images remain outside Wan.

## License

MIT — see [LICENSE](LICENSE).
