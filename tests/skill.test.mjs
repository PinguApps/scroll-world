import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const skillRoot = new URL("../skills/scroll-world/", import.meta.url);
const read = path => readFile(new URL(path, skillRoot), "utf8");

const engineSource = await read("references/scrub-engine.js");
const engineModule = await import(`data:text/javascript;base64,${Buffer.from(engineSource).toString("base64")}`);
const bootstrapSource = await read("assets/blazor/app-bootstrap.js");
const configTemplate = await read("assets/blazor/scroll-world-index.js.template");
const homeTemplate = await read("assets/blazor/Home.razor.template");
const skillSource = await read("SKILL.md");

test("skill frontmatter is portable and Blazor-specific", () => {
  const frontmatter = skillSource.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? "";
  assert.match(frontmatter, /^name: scroll-world$/m);
  assert.match(frontmatter, /^description:/m);
  assert.doesNotMatch(frontmatter, /^allowed-tools:/m);
  assert.match(frontmatter, /Blazor Web App/);
  assert.ok(skillSource.split(/\r?\n/).length < 500);
});

test("plugin metadata identifies the Blazor-first PinguApps fork", async () => {
  const plugin = JSON.parse(await readFile(new URL("../.claude-plugin/plugin.json", import.meta.url), "utf8"));
  const marketplace = JSON.parse(await readFile(new URL("../.claude-plugin/marketplace.json", import.meta.url), "utf8"));
  assert.equal(plugin.version, "2.0.0");
  assert.equal(plugin.author.name, "PinguApps");
  assert.equal(plugin.homepage, "https://github.com/PinguApps/scroll-world");
  assert.match(plugin.description, /Blazor Web App/);
  assert.match(marketplace.plugins[0].description, /InteractiveAuto/);
});

test("all routed resources and templates exist", async () => {
  for (const path of [
    "references/prompts.md",
    "references/pipeline.md",
    "references/video-providers.md",
    "references/scrub-engine.js",
    "references/blazor-integration.md",
    "references/homepage-foundation.md",
    "references/qa.md",
    "references/media-gotchas.md",
    "references/review-workflow.md",
    "references/knockout.py",
    "assets/blazor/app-bootstrap.js",
    "assets/blazor/scroll-world-index.js.template",
    "assets/blazor/scroll-world.css.template",
    "assets/blazor/App.razor.integration.template",
    "assets/blazor/Placeholder.razor.template",
    "assets/blazor/BlazorWarmup.razor",
    "assets/blazor/Home.razor.template",
    "assets/tests/scroll-world-engine.test.mjs.template",
    "agents/openai.yaml"
  ]) {
    await access(new URL(path, skillRoot));
  }
});

test("wheel input accumulates and scales across browser delta modes", () => {
  const { accumulatedWheelTarget, scaledWheelDelta } = engineModule;
  assert.equal(scaledWheelDelta(100, 0, 720, 1), 100);
  assert.equal(scaledWheelDelta(1, 1, 720, 5), 80);
  assert.equal(scaledWheelDelta(1, 2, 720, 5), 3600);
  let target = null;
  for (let i = 0; i < 8; i++) target = accumulatedWheelTarget(target, 0, 100, 5000);
  assert.equal(target, 800);
});

test("smooth response is distance-sensitive, prompt, and cannot stall on a rounded pixel", () => {
  const { smoothWheelPosition } = engineModule;
  const one = smoothWheelPosition(0, 100, 16, 18);
  const eight = smoothWheelPosition(0, 800, 16, 18);
  assert.ok(one > 0 && one < 100);
  assert.ok(eight > one * 7.9);
  assert.ok(smoothWheelPosition(0, 600, 16, 18) > 350);

  let position = 0;
  for (let frame = 0; frame < 120 && position !== 600; frame++) {
    position = Math.round(smoothWheelPosition(position, 600, 16, 35));
  }
  assert.equal(position, 600);
});

test("section copy and navigation calculations preserve the tuned behaviour", () => {
  const { navigationScrollPosition, sectionNavigationTarget, sectionIndexForPosition } = engineModule;
  assert.equal(navigationScrollPosition(0, 1000, 900, 1800), 500);
  assert.equal(sectionNavigationTarget(100, 500), 300);
  assert.equal(sectionNavigationTarget(100, 500, 0.88), 452);
  assert.equal(sectionIndexForPosition([0, 1742, 3413], 1741), 0);
  assert.equal(sectionIndexForPosition([0, 1742, 3413], 1742), 1);
});

test("engine keeps native middle-button ownership and releases all work", () => {
  assert.match(engineSource, /event\.button !== 0 && event\.button !== 1/);
  assert.match(engineSource, /function onPointerDown[\s\S]*?cancelNavigation\(\)[\s\S]*?cancelWheelScroll\(\)/);
  assert.match(engineSource, /addEventListener\('keydown', onKeyDown/);
  assert.match(engineSource, /removeEventListener\('keydown', onKeyDown\)/);
  assert.match(engineSource, /removeEventListener\('wheel', onWheel\)/);
  assert.match(engineSource, /cancelAnimationFrame\(scrubFrame\)/);
  assert.match(engineSource, /new AbortController\(\)/);
  assert.match(engineSource, /revokeObjectURL/);
});

test("engine adopts SSR media, defers posters, and scrubs only on demand", () => {
  assert.match(engineSource, /data-scroll-world-first-picture/);
  assert.match(engineSource, /data-scroll-world-first-frame/);
  assert.match(engineSource, /dataset\.poster/);
  assert.match(engineSource, /function scheduleScrub\(\)/);
  assert.match(engineSource, /if \(s\.video\.seeking\) continue/);
  assert.doesNotMatch(engineSource, /function raf\(\)[\s\S]*?requestAnimationFrame\(raf\)[\s\S]*?\n\s*}/);
});

test("bootstrap never starts Blazor on a fresh cinematic homepage", () => {
  assert.match(bootstrapSource, /data-scroll-world-first-still/);
  assert.match(bootstrapSource, /if \(firstFrame\) return/);
  assert.doesNotMatch(bootstrapSource, /interactionQuietPeriod|minimumDelay|markInteraction/);
});

test("root integration removes framework preloading", async () => {
  const appTemplate = await read("assets/blazor/App.razor.integration.template");
  assert.match(appTemplate, /REMOVE: <ResourcePreloader/);
  assert.match(appTemplate, /BlazorWarmup/);
  assert.match(appTemplate, /type="module"/);
});

test("bootstrap starts Auto elsewhere and performs atomic enhanced navigation", () => {
  assert.match(bootstrapSource, /script\.src = "_framework\/blazor\.web\.js"/);
  assert.match(bootstrapSource, /await globalThis\.Blazor\.start\(\)/);
  assert.match(bootstrapSource, /enhancednavigationstart/);
  assert.match(bootstrapSource, /function onEnhancedNavigationStart\(\)[\s\S]*?unmountScrollWorlds\(\)/);
  assert.match(bootstrapSource, /function onEnhancedNavigationEnd\(\)[\s\S]*?behavior: "instant"[\s\S]*?syncScrollWorlds\(\)/);
  assert.doesNotMatch(bootstrapSource, /behavior: "auto"/);
});

test("project templates retain performance and crawlability defaults", () => {
  assert.match(configTemplate, /wheelMultiplier: 1/);
  assert.match(configTemplate, /wheelResponse: 18/);
  assert.match(configTemplate, /navigationDuration: 1800/);
  assert.match(configTemplate, /mountedWorlds/);
  assert.match(configTemplate, /isConnected/);
  assert.match(homeTemplate, /data-scroll-world-first-picture/);
  assert.match(homeTemplate, /FIRST_STILL_MOBILE_SOURCE_ELEMENT/);
  assert.match(homeTemplate, /FIRST_STILL_DESKTOP_SRCSET/);
  assert.match(homeTemplate, /FIRST_STILL_WIDTH/);
  assert.match(homeTemplate, /FIRST_STILL_HEIGHT/);
  assert.match(homeTemplate, /fetchpriority="high"/);
  assert.match(homeTemplate, /<h1>/);
  assert.match(homeTemplate, /SECTION_1_CTA_HREF/);
  assert.match(homeTemplate, /PRIMARY_CTA_HREF/);
  assert.doesNotMatch(homeTemplate, /\/services\//);
  assert.doesNotMatch(homeTemplate, /href="\/contact"/);
});

test("route controls have names, current state, and visible keyboard focus", () => {
  assert.match(engineSource, /aria-label', 'Explore homepage sections/);
  assert.match(engineSource, /aria-current', 'step/);
  assert.match(engineSource, /aria-pressed/);
  assert.match(engineSource, /:focus-visible/);
});

test("supporting routes are optional minimal placeholders, not full pages", async () => {
  const placeholderTemplate = await read("assets/blazor/Placeholder.razor.template");
  const homepageFoundation = await read("references/homepage-foundation.md");
  assert.match(skillSource, /Build and integrate one exceptional homepage/);
  assert.match(skillSource, /Do not design or write substantive service, about, contact/);
  assert.match(skillSource, /Do not take ownership of site-wide SEO\/AEO/);
  assert.doesNotMatch(skillSource, /Full-information pages/);
  assert.doesNotMatch(skillSource, /Design the whole site/);
  assert.match(placeholderTemplate, /Coming soon|PLACEHOLDER_MESSAGE/);
  assert.match(placeholderTemplate, /Back to the homepage/);
  assert.match(placeholderTemplate, /noindex,follow/);
  assert.doesNotMatch(placeholderTemplate, /@rendermode|EditForm|DataAnnotationsValidator/);
  assert.match(homepageFoundation, /Do not write substantive service, about, contact/);
  assert.match(homepageFoundation, /Do not take ownership of robots\.txt or/);
});

test("image and video generation are approval-gated and quota-safe", async () => {
  const pipeline = await read("references/pipeline.md");
  const providers = await read("references/video-providers.md");
  const review = await read("references/review-workflow.md");
  assert.match(skillSource, /Generate one image candidate at a time/);
  assert.match(skillSource, /at most three independent video/);
  assert.match(skillSource, /thumbs-up\/approval or thumbs-down/);
  assert.match(skillSource, /Only an approved still may condition a video/);
  assert.match(skillSource, /Approval never transfers to a stochastic re-render/);
  assert.match(pipeline, /Do not pass paths\s+between shells/);
  assert.match(providers, /wan frame2video/);
  assert.match(providers, /--first-frame/);
  assert.match(providers, /--last-frame/);
  assert.match(providers, /--audio-output=false/);
  assert.match(providers, /<720P\|1080P>/);
  assert.match(pipeline, /Production sources\s+must be 1080p/);
  assert.match(pipeline, /contact sheet/);
  assert.match(pipeline, /Concept images are conditioning inputs, not public posters/);
  assert.match(pipeline, /-sseof -1 -i \$candidateVideo -vf reverse -frames:v 1/);
  assert.match(pipeline, /exact frame\s+0 of its approved section video/);
  assert.match(pipeline, /Never have more than three skill-created video tasks/);
  assert.match(pipeline, /01_desktop-still-farm_r01\.png/);
  assert.match(pipeline, /01-02_desktop-connector-farm-to-shop_r01\.mp4/);
  assert.match(pipeline, /_vNN_rNN/);
  assert.match(review, /Silence, elapsed time, or a technically valid render is never approval/);
  assert.match(review, /approval-ledger\.md/);
  assert.match(review, /Generate and approve every still individually/);
  assert.match(review, /contact sheet containing only those approved files/);
  assert.match(review, /Every stochastic image and video candidate/);
  assert.match(review, /brand,\s*scene, social and portrait image generation/);
  assert.match(review, /every downstream leg is invalid/);
  assert.match(review, /Desktop approval never carries over to\s+portrait/);
  assert.match(review, /used in any future prompt or dependent generation/);
  assert.match(review, /require one\s+explicit winning branch/);
});

test("homepage scope includes accessibility and a bounded compliance contract", async () => {
  const foundation = await read("references/homepage-foundation.md");
  const qa = await read("references/qa.md");
  assert.match(foundation, /WCAG 2\.2 AA/);
  assert.match(foundation, /visible focus, and programmatic active/);
  assert.match(foundation, /Do not add analytics, tracking pixels, marketing cookies/);
  assert.match(foundation, /Do not draft legal pages or claim\s+legal compliance/);
  assert.match(qa, /Chrome, Edge, Firefox, and Safari/);
  assert.match(qa, /desktop and mobile profiles/);
});

test("quality choices cover live production resolution paths", () => {
  assert.match(skillSource, /Current top model, `720P`, generated audio off/);
  assert.match(skillSource, /Same model, `1080P`, generated audio off/);
  assert.match(skillSource, /fal-ai\/kling-video\/v3\/pro\/image-to-video/);
  assert.match(skillSource, /no resolution field exists/);
  assert.match(skillSource, /Always disable audio/);
  assert.match(skillSource, /Never call a video provider's image/);
  assert.match(skillSource, /direct ChatGPT\/Codex image-generation tool/);
});

test("Wan and fal Kling provider contracts survive the Blazor-first merge", async () => {
  const pipeline = await read("references/pipeline.md");
  const prompts = await read("references/prompts.md");
  const providers = await read("references/video-providers.md");

  assert.match(skillSource, /Camera style, always ask/);
  assert.match(prompts, /locked-iso/);
  assert.match(skillSource, /review\/run-manifest\.json/);
  assert.match(providers, /modelVersion: "3_0"/);
  assert.match(providers, /tailImage/);
  assert.match(pipeline, /taskQuota\.video/);
  assert.match(providers, /wan credits --output json/);
  assert.match(providers, /may legitimately take several hours/);
  assert.match(providers, /normally take a few\s+minutes/);
  assert.match(providers, /Use `prompt`; never send `multi_prompt`/);
  assert.match(providers, /"generate_audio": false/);
  assert.match(providers, /"end_image_url"/);
  assert.match(providers, /static, motionless action/);
  assert.match(providers, /glides decisively at a brisk/);
  assert.match(providers, /submit_job/);
  assert.match(providers, /check_job/);
  assert.match(providers, /get_job_result/);
  assert.match(providers, /get_model_schema/);
  assert.match(providers, /get_pricing/);
  assert.match(providers, /upload_file\.file_path` cannot read the local machine/);
  assert.match(providers, /Authorization: Key \$FAL_KEY/);
  assert.doesNotMatch(providers, /published audio-off rate is/);
  assert.match(providers, /After the first representative video/);
  assert.match(skillSource, /Judge composition and props, not\s+raw PSNR/);
});

test("world topology, motion, conditioning, and workspace contracts are explicit", async () => {
  const pipeline = await read("references/pipeline.md");
  const prompts = await read("references/prompts.md");
  const review = await read("references/review-workflow.md");

  assert.match(prompts, /WORLD_TOPOLOGY/);
  assert.match(prompts, /connected\/full-bleed/);
  assert.match(prompts, /Do not default a named real location to a detached island/);
  assert.match(prompts, /roads, water, or terrain/);
  assert.doesNotMatch(prompts, /Continue the same slow, steady/);
  assert.doesNotMatch(prompts, /Smooth, graceful, slow motion/);
  assert.match(pipeline, /Conditioning-frame hazard gate/);
  assert.match(pipeline, /Prompts rarely remove defects already present in conditioning pixels/);
  assert.match(pipeline, /project-local `.scroll-world\/` working root/);
  assert.match(pipeline, /ignored by version control/);
  assert.match(pipeline, /configured final delivery\/output location/);
  assert.doesNotMatch(pipeline, /Create project-local `review\/` and scratch\/output directories/);
  assert.match(review, /contact sheets do not prove temporal\s+quality/);
  assert.match(review, /appears or disappears unexpectedly/);
});

test("risk estimates and provider-result recovery cover expensive failure modes", async () => {
  const prompts = await read("references/prompts.md");
  const providers = await read("references/video-providers.md");

  assert.match(prompts, /50–100%\+/);
  assert.match(prompts, /strict no-text\/glyph constraints/);
  assert.match(providers, /result URLs and\s+queue records are not durable storage/);
  assert.match(providers, /billing\/account lock/);
  assert.match(providers, /definitive\s+`404`\/`NOT_FOUND`/);
});

test("the still-prompt library keeps every alternate direction in one flat format", async () => {
  const prompts = await read("references/prompts.md");
  const alternateStyles = [
    "Flat papercraft",
    "Glossy toy",
    "Claymation",
    "Neon night",
    "Photoreal architectural",
    "Architectural maquette",
    "British model village",
    "Hand-painted resin miniature",
    "Low-poly game world",
    "Frosted acrylic and glass",
    "Gouache storybook",
    "Watercolour and ink",
    "Layered paper collage",
    "Felt and wool stop-motion",
    "Wooden toy town",
    "Blueprint and technical drawing",
    "Retro-futurist",
    "Solarpunk",
    "Cinematic photoreal",
    "Graphic cel-shaded 3D",
    "Monochrome with brand accents",
    "Copperplate engraving",
    "Bold linocut",
    "Risograph poster world",
    "Comic halftone metropolis",
    "16-bit pixel-art world",
    "Paper-quilled city",
    "Inflatable soft architecture",
    "Found-object assemblage",
    "Stained-glass world",
    "Mosaic tesserae world",
    "Carved stone bas-relief",
    "Geode crystal world",
    "Confectionery model world",
    "Clockwork automaton city",
    "Circuit-board metropolis",
    "Pinball playfield world",
    "Rube Goldberg world",
    "Impossible-geometry world",
    "Expressionist stage-set city",
    "Psychedelic biomorphic dreamscape",
    "Brutalist monumental world"
  ];

  assert.match(prompts, /## Style preamble \(default: clay diorama\)/);
  assert.match(prompts, /Alternate directions \(swap the first two sentences, keep the palette\/no-text tail\):/);
  assert.match(prompts, /Isometric low-poly 3D diorama/);

  for (const style of alternateStyles) {
    assert.ok(prompts.includes(`- **${style}:** "`), `missing flat alternate style: ${style}`);
  }

  assert.doesNotMatch(prompts, /^### .*styles$/m);
  assert.doesNotMatch(prompts, /\[STYLE BLOCK\]/);
  assert.match(prompts, /no text, no letters, no numbers, no logos, no watermarks/);
  assert.match(prompts, /Photoreal branches use connected\/full-bleed topology/);
  assert.match(prompts, /derive one concise `\[STYLE VIDEO TAIL\]`/);
  assert.doesNotMatch(prompts, /miniature clay world/);
  assert.doesNotMatch(prompts, /\[STYLE tail/);
  assert.doesNotMatch(prompts, /neon signage/);
});

test("lived-in worlds use purposeful people and continuous human action", async () => {
  const skillSource = await read("SKILL.md");
  const prompts = await read("references/prompts.md");

  assert.match(skillSource, /Default to a lived-in world/);
  assert.match(skillSource, /Every visible person continues a coherent ordinary action/);
  assert.match(prompts, /typically 2–6/);
  assert.match(prompts, /caught mid-action/);
  assert.match(prompts, /\[LIVED-IN MOTION CLAUSE\]/);
  assert.match(prompts, /Every visible person continues a coherent ordinary action/);
  assert.match(prompts, /never freezes into a statue/);
});
