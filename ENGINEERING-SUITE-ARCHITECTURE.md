# PaiD Engineering Suite — Architecture Blueprint

Status: design specification; implementation and fabrication-readiness are not yet verified.

## Product goal

Build one free-first, mobile-friendly engineering workspace for structural steel and industrial piping. It should connect 2D drawings, 3D models, nesting, weld maps, sectional views, bills of materials, and CAD exports. Keep the current static website working while adding modules incrementally.

## Core workflows

1. Create a project and choose discipline: structural steel or piping.
2. Enter/import geometry and engineering inputs; show units and assumptions explicitly.
3. Generate a parametric model and editable 2D views.
4. Produce elevations, plans, sections, detail views, dimensions, annotations, and title blocks.
5. For steel plate parts, generate nesting layouts, cutting lists, part labels, utilization and scrap estimates.
6. For welded assemblies and piping, assign unique weld IDs, show weld locations, and produce a weld register with only supplied/approved WPS and inspection references.
7. Generate BOMs, part lists, spool/assembly lists, and downloadable project files.
8. Validate outputs, display warnings, and require qualified review before fabrication use.

## Proposed module boundaries

- project-core: project metadata, units, revisions, component IDs, input validation.
- geometry-2d: lines, arcs, polylines, circles, layers, dimensions, text, hatching, view transforms.
- geometry-3d: parametric components and assembly transforms; start with constrained steel profiles/plates and pipe centerlines/fittings.
- drawing-views: orthographic projections, sections from model geometry, detail views, line styles, annotations and scale.
- steel-tools: plate/beam/member definitions, connections as explicit inputs, cut lists and assembly drawings.
- piping-tools: pipe segments, fittings, flanges, valves, supports and spool breakdown.
- nesting-engine: rotate/place valid 2D parts on stock sheets subject to grain, kerf, edge margin, spacing and machine constraints; report estimates and assumptions.
- weld-register: weld IDs and geometry references, joint/type/size fields, WPS reference, inspection/NDT fields, status and traceability.
- cad-io: DXF first; DWG only through a documented licensed/compatible SDK or an explicit external workflow. Never claim DWG support just because DXF works.
- pdf-import: extract vector geometry where possible, distinguish vector from raster PDFs, flag scale uncertainty, and require scale calibration for scanned pages.
- validation: file syntax, entity counts, unit/scale checks, geometry checks, weld-ID uniqueness, nesting collisions, and test fixtures.
- ui: guided forms, preview, warnings, export and download.
- offline: progressively cache the static shell and local tools; do not promise all third-party services work offline.

## Data model

Every project should store:
- project ID, name, discipline, units, revision, author/date and review status;
- components with stable IDs, material/specification fields, dimensions and geometry;
- drawing sheets with scale, view type, layers, dimensions and annotations;
- weld records keyed to joint/component IDs, with weld process/type/size only when specified;
- stock sheets, nested parts, rotations, kerf/spacing and optimization assumptions;
- BOM/cut-list rows linked to component IDs;
- export manifest containing format, engine version, warnings and validation results.

Prefer a versioned JSON project document as the editable internal representation. Derive drawings and exports from this source so model, sections, weld map and BOM do not drift independently.

## CAD/export strategy

1. Make DXF export reliable and test it with known geometry first.
2. Support LINE, ARC, CIRCLE, LWPOLYLINE, TEXT/MTEXT, DIMENSION and layer conventions as implemented and tested.
3. Validate output by parsing the resulting DXF and checking expected entities, coordinates, units and bounding boxes.
4. Add import/export round-trip tests and sample files with expected entity counts.
5. Treat PDF-to-CAD as best-effort: vector PDF extraction can preserve geometry, while raster scans require vectorization and scale calibration. Do not promise automatic perfect conversion.
6. Add DWG only after confirming a lawful, supported library or conversion route and testing compatibility.

## Nesting requirements

- Accept plate size, material, thickness, edge margin, kerf, part quantity, allowed rotations and optional grain direction.
- Reject or flag parts that do not fit; prevent overlap and maintain configured clearance.
- Report total stock area, used part area, estimated scrap and utilization percentage.
- Preserve labels and part IDs; allow manual adjustment after automatic nesting.
- Do not present an optimization as production-ready until collision, boundary, rotation and kerf tests pass.

## Weld-map requirements

- Assign stable, unique weld IDs and locate them on model/drawing geometry.
- Show weld symbols and details only when the applicable standard and required inputs are selected.
- Produce a weld register and traceability links to components/spools.
- Allow WPS, welder, NDT and inspection values to be entered or linked; never invent approvals or requirements.
- Keep revision history and flag unresolved/unchecked weld data.

## Sectional-view requirements

- Let users define a cutting plane and view direction.
- Intersect the 3D model with the plane, generate section edges, and hatch cut material according to material/style rules.
- Label sections (A–A, B–B), link callouts to the parent view, and include scale and dimensions.
- Verify sections against simple boxes, plates, hollow sections, pipes and assemblies before complex geometry.

## Safety, quality and engineering review

- Clearly mark generated outputs as draft until reviewed.
- Display input assumptions, units, missing data and validation warnings.
- Do not infer structural adequacy, weld acceptance, pressure rating or code compliance from geometry alone.
- A qualified engineer/fabrication authority must approve drawings and weld requirements before fabrication.
- Keep sample/test data separate from customer projects; avoid uploading confidential drawings to third-party services without explicit consent.

## Delivery plan and acceptance gates

### Phase 0 — stabilize the existing converter
- Fix the current PDF-to-DXF browser smoke test.
- Confirm that a test PDF exports expected LINE geometry and TEXT entities.
- Parse the exported DXF and verify coordinates and a non-zero bounding box.
- Keep this work on feature/pdf-dxf-engine; no merge or deployment until explicitly approved.

### Phase 1 — geometry and DXF foundation
- Add reusable geometry model, units, layers and deterministic DXF export.
- Acceptance: fixture drawings round-trip with expected entities and coordinates.

### Phase 2 — drawing sheets and sections
- Add plan/elevation projections, section planes, detail views, dimensions and hatching.
- Acceptance: known test solids/plates/pipes generate expected views and section intersections.

### Phase 3 — steel and piping components
- Add initial parameterized steel plates/profiles and piping segments/fittings.
- Acceptance: sample assemblies match input dimensions and generate consistent BOMs.

### Phase 4 — nesting and weld maps
- Add constrained nesting, collision checks, stable weld IDs, weld registers and traceability.
- Acceptance: automated tests prove no part overlap/out-of-stock placement and no duplicate weld IDs.

### Phase 5 — integrated project export
- Connect model, drawings, nesting, weld map, BOM and revision metadata.
- Acceptance: a sample project produces consistent deliverables and passes the complete test suite.

### Phase 6 — usability and offline support
- Improve mobile workflow, help, downloadable project packages, caching and accessibility.
- Acceptance: documented supported browsers, offline boundaries and clean-start tests.

## Current verified status

The most recent CI run built the converter source and website bundle, but its browser smoke test failed: the output included TEXT but did not include the expected LINE geometry. Therefore the PDF-to-DXF engine is not yet verified as fixed. Do not advertise the full suite as implemented or fabrication-ready. The blueprint is a plan, not proof of completed features.


## Universal AI modeller (planned module)

The modeller is a general-purpose creation workspace, not a reboiler-only feature. It belongs in a dedicated **AI Modelling** tray and should support a growing catalogue of object families rather than imply that every possible object is already supported.

### Input routes

- Natural-language descriptions with explicit units and user-supplied dimensions.
- Photographs of objects and hand sketches, with a calibration/reference dimension required before claiming real-world scale.
- Engineering drawings and vector PDF imports, with raster/scanned pages treated as uncertain until calibrated.
- Supported CAD/project files, preserving source units, layers and provenance where parsers permit.

### Interpretation and clarification loop

1. Classify the requested object and intended output (visual concept, editable model, drawing, or manufacturing documentation).
2. Extract only dimensions that are explicit or reliably measurable from a calibrated source.
3. Build a parameter checklist for required dimensions, units, tolerances, material and connection details.
4. Ask focused questions for missing or conflicting values. Never silently fill in dimensions that affect fit, strength, pressure containment or fabrication.
5. Show the user the interpreted inputs and assumptions for confirmation before generating the model.

Image recognition may propose candidate geometry, but each inferred measurement must carry a confidence/uncertainty label. A photograph without a known scale can support a visual approximation, not a dimensionally accurate engineering model.

### Internal model and geometry pipeline

- Store each project as versioned JSON: stable object IDs, parameters, units, constraints, feature history, source references, revisions and validation results.
- Keep a parametric feature graph as the editable source of truth; generate meshes, drawings and exports from it rather than treating a rendered mesh as the master model.
- Separate input interpretation, constraint solving, geometry-kernel adapter, tessellation/rendering, drawing projection and export adapters.
- Start with a browser-compatible 3D preview layer and a deliberately limited set of deterministic parametric primitives/features. Evaluate an open-source CAD kernel compiled to WebAssembly before selecting it; document browser, Android memory and licensing constraints and prove the chosen build with tests before promising kernel capabilities.
- Use local deterministic geometry for supported operations. AI interpretation is a separate optional layer and must not be required to edit or regenerate an already-defined parametric model.

### Outputs and format boundaries

- Generate editable parametric project files and 2D orthographic views first.
- Add DXF export only for entity types that have automated geometry and coordinate tests.
- Add STL for validated mesh workflows; add STEP only after a supported CAD kernel and round-trip tests are in place.
- DWG requires a lawful compatible SDK or a clearly documented conversion route. Do not label DXF as DWG or imply interchangeability.
- Provide a preview and export manifest listing units, scale, supported features, warnings and engine version.

### Offline and optional AI

- Cache the application shell, documentation, local geometry engine and supported templates for offline use.
- Keep modelling and export of already-supported parametric features local wherever feasible.
- Treat photo interpretation, complex drawing understanding and conversational AI as optional capabilities. They may require a compatible on-device model or an explicitly selected online service; never claim they work offline until tested on target Android devices.
- Show a clear capability indicator: **Offline local**, **On-device AI** or **Online AI required**. Do not send private drawings to a remote service without explicit user consent.

### Coverage and safety

Use extensible object-family templates (mechanical parts, piping, structural components, architecture/interiors, furniture, electrical enclosures and general objects) but show a family as supported only after its parameter schema, geometry operations, drawing outputs and tests exist. Do not imply universal coverage from a free-form text box.

All generated geometry is a draft. The modeller must not infer structural adequacy, pressure ratings, electrical safety, code compliance, tolerances or fabrication approval from appearance alone. Safety-critical models require complete source data and review by a qualified professional. Keep visual concepts visibly distinct from dimensioned engineering deliverables.

### Acceptance gates

1. Text input creates a supported primitive/part with explicit dimensions and editable parameters.
2. Missing mandatory dimensions trigger questions and block dimensioned export until answered.
3. A calibrated sketch/photo can be converted to a test model with a stated uncertainty bound; uncalibrated images remain visual-only.
4. Editing a parameter updates the model, drawings and BOM consistently.
5. DXF/mesh exports pass entity, bounding-box, unit and round-trip tests for each supported feature.
6. Offline tests prove which operations work with network disabled on documented target devices.
7. Safety-critical outputs carry warnings and cannot be labelled approved or fabrication-ready by the software.

This module is a design specification only. No universal AI model generation, photo-to-CAD or offline AI capability is currently claimed as implemented.

## Tray-based product navigation

All tools belong to a named tray. The current published tray groups are Engineering, Documents & PDF, CAD & design, and Productivity. Planned trays include AI Modelling and Software Library. Add a planned tray only when it contains a working module or clearly labelled non-interactive roadmap content; never create fake active tools or dead buttons.
