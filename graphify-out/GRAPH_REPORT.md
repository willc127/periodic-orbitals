# Graph Report - Periodic-orbitals  (2026-10-21)

## Corpus Check
- 105 files · ~432,271 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 30 file(s) not represented in the graph (top: .scss 21, (none) 4, .ico 2)

## Summary
- 566 nodes · 888 edges · 41 communities (28 shown, 13 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 16 edges (avg confidence: 0.89)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Orbital Surface Rendering
- Angular Build Configuration
- Element Data Backend
- Emission Spectra Models
- Frontend Package Configuration
- Graphics Axis Selection
- Electron Distribution
- Element Description Panel
- Electron Configuration Diagram
- Isotope Visualization
- Angular Dependencies
- Periodic Table State
- Element Properties Panel
- Angular Developer Tooling
- Component Tests
- Periodic Table Selectors
- Atom Animation
- Orbital Rendering API
- Angular Root Component
- Application Views and Animations
- Main View Toggle
- Graphics Dashboard
- Periodic Table Module
- Orbital Visualization
- Project Technology Stack
- Angular HTML Shell
- Frontend Type Definitions
- Project Requirements
- Scientific Python Dependencies
- Application View Shell
- Property Scatter Charts
- Orbital Figure Utilities
- Astropy Integration
- Element Data Service
- Spectral Line Service
- Orbital Artwork
- Angular Branding
- FastAPI Branding
- Mendeleev Branding
- Python Branding

## God Nodes (most connected - your core abstractions)
1. `@angular/core` - 41 edges
2. `OrbitalSurfaceViewerComponent` - 30 edges
3. `ElectronDistribution` - 17 edges
4. `@angular/common` - 15 edges
5. `EmissionSpectrumComponent` - 15 edges
6. `@angular/material` - 14 edges
7. `PeriodicTable` - 13 edges
8. `IElement` - 12 edges
9. `AxisSelectorComponent` - 12 edges
10. `_fetch_and_save()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `Angular and FastAPI coding guidance` --conceptually_related_to--> `FastAPI REST API`  [INFERRED]
  .github/copilot-instructions.md → Backend/README.md
- `Angular and FastAPI coding guidance` --conceptually_related_to--> `Periodic Orbitals Angular frontend`  [INFERRED]
  .github/copilot-instructions.md → Frontend/periodic-orbitals-angular/README.md
- `Frontend-to-backend orbital rendering flow` --references--> `Orbital rendering endpoints`  [EXTRACTED]
  Frontend/periodic-orbitals-angular/README.md → Backend/README.md
- `Element detail modal` --references--> `Element description and provenance panel`  [EXTRACTED]
  Frontend/periodic-orbitals-angular/src/app/pages/periodic-table/modal-periodic-table/modal-periodic-table.html → Frontend/periodic-orbitals-angular/src/app/pages/periodic-table/modal-periodic-table/description/description.html
- `Element detail modal` --references--> `Electron configuration diagram`  [EXTRACTED]
  Frontend/periodic-orbitals-angular/src/app/pages/periodic-table/modal-periodic-table/modal-periodic-table.html → Frontend/periodic-orbitals-angular/src/app/pages/periodic-table/modal-periodic-table/diagrama-configuracao-eletronica/diagrama-configuracao-eletronica.component.html

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Element detail modal sections** — frontend_periodic_orbitals_angular_src_app_pages_periodic_table_modal_periodic_table_modal_periodic_table_element_detail_modal, frontend_periodic_orbitals_angular_src_app_pages_periodic_table_modal_periodic_table_description_description_element_description_panel, frontend_periodic_orbitals_angular_src_app_pages_periodic_table_modal_periodic_table_properties_elements_properties_elements_element_properties_panel, frontend_periodic_orbitals_angular_src_app_pages_periodic_table_modal_periodic_table_isotopos_isotopos_component_isotope_panel, frontend_periodic_orbitals_angular_src_app_pages_periodic_table_modal_periodic_table_diagrama_configuracao_eletronica_diagrama_configuracao_eletronica_component_electron_configuration_diagram, frontend_periodic_orbitals_angular_src_app_pages_periodic_table_modal_periodic_table_emission_spectrum_emission_spectrum_component_atomic_emission_spectrum, frontend_periodic_orbitals_angular_src_app_pages_periodic_table_modal_periodic_table_orbital_surface_viewer_orbital_surface_viewer_quantum_orbital_viewer [EXTRACTED 1.00]
- **Header Composition and View Interaction** — frontend_periodic_orbitals_angular_src_app_shared_header_header_header_component, frontend_periodic_orbitals_angular_src_app_shared_header_atom_animation_atom_animation_electron_orbit_animation, frontend_periodic_orbitals_angular_src_app_shared_header_button_toggle_principal_button_toggle_principal_primary_view_selector [EXTRACTED 1.00]
- **Orbital Calculation and Rendering Workflow** — trees_backend_orbital_generation_backend, trees_backend_hydrogen_orbital_model, trees_backend_orbital_rendering [INFERRED 0.95]

## Communities (41 total, 13 thin omitted)

### Community 0 - "Orbital Surface Rendering"
Cohesion: 0.07
Nodes (29): amostrarCampo(), amostrarNuvem(), COR_TITULO, corGradiente(), criarModeloOrbital(), ESCALA_CENA, fatorial(), FuncaoAngular (+21 more)

### Community 1 - "Angular Build Configuration"
Cohesion: 0.05
Nodes (43): build, extract-i18n, serve, test, builder, configurations, defaultConfiguration, options (+35 more)

### Community 2 - "Element Data Backend"
Cohesion: 0.08
Nodes (15): _add_protons_neutrons(), _cache_is_valid(), clean_for_json(), clear_cache(), favicon(), _fetch_and_save(), format_electronic_config(), _to_superscript() (+7 more)

### Community 3 - "Emission Spectra Models"
Cohesion: 0.09
Nodes (12): ISpectrum, IWaveIntensity, EmissionSpectrumComponent, DadosElementosService, SpectrumCanvasComponent, pct(), rgbToHsl(), WL_MAX (+4 more)

### Community 4 - "Frontend Package Configuration"
Cohesion: 0.06
Nodes (35): name, prettier, overrides, private, scripts, build, compodoc, ng (+27 more)

### Community 5 - "Graphics Axis Selection"
Cohesion: 0.09
Nodes (12): ElementProperty, PlotRequest, AxisSelectorComponent, ElementRaw, ScatterChartComponent, ELEMENT_PROPERTIES, ElementProperty, SERIES_CONFIG (+4 more)

### Community 6 - "Electron Distribution"
Cohesion: 0.10
Nodes (7): IScopeConfig, ElectronDistribution, Distributor, CATEGORY_COLORS, PropertiesElements, StatGroup, StatItem

### Community 7 - "Element Description Panel"
Cohesion: 0.11
Nodes (11): Description, ModalPeriodicTable, grupos, orbitais, OrbitalDef, OrbitalGroup, ORBITALS, grupos (+3 more)

### Community 8 - "Electron Configuration Diagram"
Cohesion: 0.15
Nodes (19): DiagramaConfiguracaoEletronicaComponent, Bloco, CaixaOrbital, calcularEletronsPorSubcamada(), capacidade(), chave(), CONJUNTO_EXIBIDO, construirLinhasPeriodo() (+11 more)

### Community 9 - "Isotope Visualization"
Cohesion: 0.19
Nodes (10): IsotoposComponent, calcularAbundanciaMaxima(), calcularAlturaBarra(), COR_RADIOATIVO_PADRAO, corIsotopo(), formatarAbundancia(), ordenarPorMassa(), DadosIsotoposElemento (+2 more)

### Community 10 - "Angular Dependencies"
Cohesion: 0.11
Nodes (18): dependencies, @angular/cdk, @angular/common, @angular/compiler, @angular/core, @angular/forms, @angular/material, @angular/platform-browser (+10 more)

### Community 11 - "Periodic Table State"
Cohesion: 0.20
Nodes (3): IElement, PeriodicTable, DadosElementosService

### Community 12 - "Element Properties Panel"
Cohesion: 0.13
Nodes (15): Element description and provenance panel, Electron configuration diagram, Madelung diagonal filling rule, Atomic emission spectrum, Stable and radioactive isotope panel, Element detail modal, Orbital cross-section density map, Interactive 3D quantum orbital viewer (+7 more)

### Community 13 - "Angular Developer Tooling"
Cohesion: 0.14
Nodes (14): devDependencies, @angular/build, @angular/cli, @angular/compiler-cli, @compodoc/compodoc, jasmine-core, karma, karma-chrome-launcher (+6 more)

### Community 15 - "Periodic Table Selectors"
Cohesion: 0.21
Nodes (3): SelectorsComponent, TemperatureSelector, TemperatureStateService

### Community 17 - "Orbital Rendering API"
Cohesion: 0.20
Nodes (10): Atomic orbital rendering backend, FastAPI REST API, Orbital rendering endpoints, Quantum-number validation, FastAPI dependency, SQLAlchemy dependency, Periodic Orbitals Angular frontend, Frontend-to-backend orbital rendering flow (+2 more)

### Community 19 - "Application Views and Animations"
Cohesion: 0.20
Nodes (10): CodePen Animation Inspiration, Electron Orbit Animation, Orbit Color Mapping, Graphics View, Molecules View, Standard Periodic Table View, Primary View Selector, Selected View State (+2 more)

### Community 20 - "Main View Toggle"
Cohesion: 0.20
Nodes (3): ButtonTogglePrincipal, @ng-icons/core, @ng-icons/game-icons

### Community 21 - "Graphics Dashboard"
Cohesion: 0.22
Nodes (9): Angular Frontend Application, Chart Axis Selector, Electron Distribution View, Emission Spectrum View, Graphics Dashboard, Periodic Table Interface, Quantum Orbital Viewer, Scatter Chart (+1 more)

### Community 22 - "Periodic Table Module"
Cohesion: 0.36
Nodes (3): AppModule, EstadoFisico, @angular/common

### Community 23 - "Orbital Visualization"
Cohesion: 0.25
Nodes (8): Grouped Orbital Figures, Hydrogen Orbital Model, Orbital Generation Backend, Orbital 3D and Cross-Section Images, Orbital Rendering, Orbital Schemas, Orbital Unit and Endpoint Tests, Render Radius Calculation

### Community 24 - "Project Technology Stack"
Cohesion: 0.29
Nodes (7): Angular, Astropy Project, FastAPI, Mendeleev, Periodic Orbitals Project, Python, William Cesar

### Community 25 - "Angular HTML Shell"
Cohesion: 0.50
Nodes (4): Angular Root Host, Angular HTML Document Shell, Material Icons, Roboto Web Font

### Community 26 - "Frontend Type Definitions"
Cohesion: 0.50
Nodes (3): HTMLElementTagNameMap, IntrinsicElements, JSX

### Community 27 - "Project Requirements"
Cohesion: 0.50
Nodes (4): Angular 17+, FastAPI 0.104+, Periodic Orbitals Project, Python 3.10+

### Community 28 - "Scientific Python Dependencies"
Cohesion: 0.67
Nodes (3): Hydrogen-atom wavefunctions, Scientific Python rendering stack, NumPy, SciPy, and Matplotlib dependencies

### Community 29 - "Application View Shell"
Cohesion: 0.67
Nodes (3): Application view shell, Graphics view, Periodic table view

### Community 30 - "Property Scatter Charts"
Cohesion: 0.67
Nodes (3): Drag-and-drop axis property selector, Multi-series scatter chart, Property graphics page

## Knowledge Gaps
- **80 isolated node(s):** `@angular/compiler`, `@mdi/font`, `tslib`, `zone.js`, `@angular/build` (+75 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 264 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `@angular/core` connect `Component Tests` to `Orbital Surface Rendering`, `Emission Spectra Models`, `Frontend Package Configuration`, `Graphics Axis Selection`, `Electron Distribution`, `Element Description Panel`, `Electron Configuration Diagram`, `Isotope Visualization`, `Periodic Table State`, `Periodic Table Selectors`, `Atom Animation`, `Angular Root Component`, `Main View Toggle`, `Periodic Table Module`?**
  _High betweenness centrality (0.200) - this node is a cross-community bridge._
- **What connects `@angular/compiler`, `@mdi/font`, `tslib` to the rest of the system?**
  _80 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Orbital Surface Rendering` be split into smaller, more focused modules?**
  _Cohesion score 0.06779661016949153 - nodes in this community are weakly interconnected._
- **Why does `OrbitalSurfaceViewerComponent` connect `Orbital Surface Rendering` to `Element Description Panel`?**
  _High betweenness centrality (0.058) - this node is a cross-community bridge._
- **Should `Angular Build Configuration` be split into smaller, more focused modules?**
  _Cohesion score 0.05179704016913319 - nodes in this community are weakly interconnected._
- **Why does `@angular/common` connect `Periodic Table Module` to `Emission Spectra Models`, `Frontend Package Configuration`, `Graphics Axis Selection`, `Electron Distribution`, `Element Description Panel`, `Electron Configuration Diagram`, `Isotope Visualization`, `Atom Animation`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **Should `Element Data Backend` be split into smaller, more focused modules?**
  _Cohesion score 0.07682926829268293 - nodes in this community are weakly interconnected._