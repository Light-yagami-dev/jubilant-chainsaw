import { db } from "../index";
import { syllabusChunksTable } from "../schema/syllabus";

const biotechSyllabusData = [
  // BIOCHEMISTRY (Core Paper)
  {
    topic: "Carbohydrates",
    heading: "Classification and Structure",
    content: `Carbohydrates are classified into three main types based on their structure and complexity:

**Monosaccharides (Simple Sugars)**:
- Glucose (C6H12O6): Most important energy source for cells
- Fructose: Found in fruits, sweetest natural sugar
- Galactose: Component of lactose

**Disaccharides**:
- Sucrose: Glucose + Fructose (table sugar)
- Lactose: Glucose + Galactose (milk sugar)
- Maltose: Glucose + Glucose (from starch breakdown)

**Polysaccharides**:
- Starch: Plant storage carbohydrate, helical structure
- Glycogen: Animal storage carbohydrate, highly branched
- Cellulose: Structural component of plant cell walls, linear chains

**Key Concepts**:
- Glycosidic bond: Linkage between monosaccharides
- Fischer projection: Shows 3D structure of glucose
- Haworth projection: Ring form representation
- Reducing vs non-reducing sugars

**Exam Tips**: Memorize glucose structures in both Fischer and Haworth forms. Understand glycosidic bond formation and hydrolysis.`,
    examType: "BSC_BIOTECH_PART1",
  },
  {
    topic: "Proteins",
    heading: "Structure and Classification",
    content: `Proteins are complex macromolecules essential for life, composed of amino acids linked by peptide bonds.

**Amino Acids (Building Blocks)**:
- 20 standard amino acids
- All have: Carboxyl group (-COOH), Amino group (-NH2), R-group (side chain)
- Classification: Essential vs Non-essential, Polar vs Non-polar, Acidic vs Basic

**Protein Structure Levels**:
- Primary (1°): Amino acid sequence
- Secondary (2°): Alpha helix, Beta sheets (H-bonding)
- Tertiary (3°): 3D folding, disulfide bonds, hydrophobic interactions
- Quaternary (4°): Multiple polypeptide chains

**Classification by Function**:
- Structural: Collagen, keratin
- Enzymatic: Catalyze reactions
- Transport: Hemoglobin, myoglobin
- Hormonal: Insulin, growth hormone
- Contractile: Actin, myosin

**Key Concepts**:
- Peptide bond: Covalent bond between amino acids
- Denaturation: Loss of 3D structure
- Isoelectric point: pH where protein has no net charge

**Exam Tips**: Draw peptide bond formation. Compare fibrous vs globular proteins with examples.`,
    examType: "BSC_BIOTECH_PART1",
  },
  {
    topic: "Enzymes",
    heading: "Mechanism and Kinetics",
    content: `Enzymes are biological catalysts that speed up chemical reactions without being consumed.

**Mechanism of Action**:
- Lock and key model: Substrate fits exactly into active site
- Induced fit model: Active site changes shape to fit substrate
- Active site: Specific region where catalysis occurs
- Cofactors: Non-protein helpers (metal ions, organic molecules)

**Michaelis-Menten Equation**:
- V = Vmax [S] / (Km + [S])
- Km: Substrate concentration for half-maximum velocity
- Vmax: Maximum reaction rate
- Low Km: High affinity enzyme

**Factors Affecting Enzyme Activity**:
- Temperature: Optimum around 37°C, denaturation above
- pH: Optimum varies (pepsin: acidic, trypsin: alkaline)
- Substrate concentration: Follows saturation kinetics
- Enzyme concentration: Directly proportional to rate
- Inhibitors: Competitive, Non-competitive, Uncompetitive

**Coenzymes**: Organic cofactors like NAD+, FAD, CoA

**Exam Tips**: Graph Michaelis-Menten curve. Explain competitive vs non-competitive inhibition with examples.`,
    examType: "BSC_BIOTECH_PART1",
  },
  {
    topic: "Lipids",
    heading: "Classification and Functions",
    content: `Lipids are diverse group of hydrophobic molecules with various biological roles.

**Classification**:
- Simple lipids: Fats and oils (triglycerides)
- Compound lipids: Phospholipids, glycolipids
- Derived lipids: Steroids, cholesterol, fatty acids

**Fatty Acids**:
- Saturated: No double bonds (palmitic, stearic)
- Unsaturated: One or more double bonds
  - Monounsaturated: One double bond (oleic acid)
  - Polyunsaturated: Multiple double bonds (linoleic, linolenic)
- Essential fatty acids: Cannot be synthesized (omega-3, omega-6)

**Triglycerides**:
- Three fatty acids + glycerol
- Energy storage molecules
- Saturated fats: Solid at room temperature
- Unsaturated fats: Liquid at room temperature

**Phospholipids**:
- Amphipathic: Hydrophilic head + hydrophobic tails
- Major component of cell membranes
- Phosphatidylcholine, phosphatidylethanolamine

**Steroids**:
- Cholesterol: Membrane component, hormone precursor
- Steroid hormones: Testosterone, estrogen, cortisol

**Key Concepts**:
- Hydrophobic nature
- Energy density (9 kcal/g)
- Insulation and protection functions

**Exam Tips**: Compare saturated vs unsaturated fatty acids. Explain phospholipid bilayer structure.`,
    examType: "BSC_BIOTECH_PART1",
  },
  {
    topic: "Nucleic Acids",
    heading: "DNA and RNA Structure",
    content: `Nucleic acids store and transmit genetic information in cells.

**DNA (Deoxyribonucleic Acid)**:
- Double-stranded helix
- Sugar: Deoxyribose
- Bases: Adenine (A), Thymine (T), Cytosine (C), Guanine (G)
- Base pairing: A-T, C-G (complementary)
- Antiparallel strands: 5'→3' and 3'→5'

**RNA (Ribonucleic Acid)**:
- Usually single-stranded
- Sugar: Ribose
- Bases: Adenine (A), Uracil (U), Cytosine (C), Guanine (G)
- Types: mRNA, tRNA, rRNA

**Nucleotides**:
- Phosphate group + Sugar + Nitrogenous base
- Building blocks of nucleic acids
- Energy currency (ATP, GTP)

**Central Dogma**:
- DNA → RNA → Protein
- Replication: DNA → DNA
- Transcription: DNA → RNA
- Translation: RNA → Protein

**Key Concepts**:
- Watson-Crick model
- Chargaff's rules: A=T, C=G
- Semi-conservative replication

**Exam Tips**: Draw DNA double helix. Explain base pairing rules. Compare DNA vs RNA structure.`,
    examType: "BSC_BIOTECH_PART1",
  },
  // CELL BIOLOGY (Core Paper)
  {
    topic: "Cell Theory and Types",
    heading: "Fundamental Concepts",
    content: `Cell theory forms the foundation of modern biology.

**Cell Theory Principles**:
1. All living organisms are composed of cells
2. Cell is the basic unit of life
3. All cells arise from pre-existing cells

**Cell Types**:
- Prokaryotic cells: No nucleus, smaller, bacteria
  - Features: Cell wall, plasma membrane, cytoplasm, ribosomes
  - Genetic material: Single circular DNA chromosome
  - Examples: Bacteria, archaea

- Eukaryotic cells: True nucleus, larger, complex
  - Membrane-bound organelles
  - Linear chromosomes in nucleus
  - Examples: Plant, animal, fungal, protist cells

**Plant vs Animal Cells**:
- Plant cells: Cell wall, chloroplasts, large central vacuole
- Animal cells: No cell wall, centrioles, small vacuoles

**Key Concepts**:
- Unicellular vs multicellular organisms
- Cell size limitations (surface area/volume ratio)
- Exceptions to cell theory (viruses, RBCs)

**Exam Tips**: Compare prokaryotic vs eukaryotic cells in tabular form. Explain why cells are small.`,
    examType: "BSC_BIOTECH_PART1",
  },
  {
    topic: "Cell Organelles",
    heading: "Structure and Function",
    content: `Eukaryotic cells contain specialized organelles performing specific functions.

**Nucleus**:
- Control center of the cell
- Contains DNA (chromatin/chromosomes)
- Nuclear envelope: Double membrane with pores
- Nucleolus: Site of ribosome synthesis

**Mitochondria**:
- Powerhouse of the cell
- Site of cellular respiration (ATP production)
- Double membrane: Outer smooth, inner folded (cristae)
- Contain their own DNA (mtDNA)

**Endoplasmic Reticulum (ER)**:
- Rough ER: Studded with ribosomes, protein synthesis
- Smooth ER: Lipid synthesis, detoxification, calcium storage
- Network of membranes throughout cytoplasm

**Golgi Apparatus**:
- Modifies, sorts, packages proteins and lipids
- Cis face: Receives materials from ER
- Trans face: Exports modified materials
- Forms lysosomes, secretory vesicles

**Lysosomes**:
- Contain hydrolytic enzymes
- Digest macromolecules, recycle organelles
- Maintain cellular homeostasis
- Autophagy: Self-digestion process

**Peroxisomes**:
- Contain peroxidase enzymes
- Break down fatty acids, detoxify hydrogen peroxide
- Important in liver and kidney cells

**Vacuoles**:
- Storage organelles
- Plant cells: Large central vacuole (turgor pressure)
- Animal cells: Small vacuoles for storage

**Exam Tips**: Draw and label a typical animal cell. Explain functions of each organelle with examples.`,
    examType: "BSC_BIOTECH_PART1",
  },
  {
    topic: "Cell Membrane",
    heading: "Structure and Transport",
    content: `Cell membrane regulates movement of substances in and out of cells.

**Fluid Mosaic Model**:
- Proposed by Singer and Nicolson
- Phospholipid bilayer: Hydrophilic heads, hydrophobic tails
- Proteins embedded: Integral and peripheral
- Cholesterol: Maintains fluidity
- Carbohydrates: Cell recognition, glycoproteins

**Transport Mechanisms**:

**Passive Transport** (No energy required):
- Diffusion: Movement from high to low concentration
  - Simple diffusion: Small non-polar molecules
  - Facilitated diffusion: Through carrier proteins
- Osmosis: Water movement across semi-permeable membrane
  - Isotonic: Equal concentrations
  - Hypotonic: Lower solute concentration
  - Hypertonic: Higher solute concentration

**Active Transport** (Energy required - ATP):
- Against concentration gradient
- Carrier proteins: Sodium-potassium pump
- Endocytosis: Bulk uptake (phagocytosis, pinocytosis)
- Exocytosis: Bulk release of materials

**Key Concepts**:
- Selective permeability
- Concentration gradients
- Electrochemical gradients

**Exam Tips**: Explain osmosis with examples. Compare diffusion vs active transport. Draw fluid mosaic model.`,
    examType: "BSC_BIOTECH_PART1",
  },
  {
    topic: "Cell Division",
    heading: "Mitosis and Meiosis",
    content: `Cell division ensures growth, repair, and reproduction.

**Mitosis** (Cell division for growth and repair):
- Occurs in somatic cells
- Produces two identical daughter cells
- Stages: Prophase, Metaphase, Anaphase, Telophase
- Significance: Growth, tissue repair, asexual reproduction

**Meiosis** (Cell division for gamete formation):
- Occurs in germ cells
- Produces four haploid gametes
- Two divisions: Meiosis I and Meiosis II
- Crossing over: Exchange of genetic material
- Significance: Genetic variation, sexual reproduction

**Comparison**:
- Mitosis: Diploid → Diploid, identical cells
- Meiosis: Diploid → Haploid, genetically different cells

**Key Concepts**:
- Chromatin → Chromosomes → Chromatids
- Centromere, kinetochore
- Spindle fibers, centrioles
- Cytokinesis: Division of cytoplasm

**Exam Tips**: Draw and label stages of mitosis. Explain significance of meiosis. Compare mitosis vs meiosis in table.`,
    examType: "BSC_BIOTECH_PART1",
  },
  {
    topic: "Chromosomes",
    heading: "Structure and Abnormalities",
    content: `Chromosomes are thread-like structures carrying genetic information.

**Structure**:
- Made of DNA and proteins (histones)
- Chromatid: Single DNA molecule
- Sister chromatids: Two identical chromatids joined at centromere
- Centromere position: Metacentric, submetacentric, acrocentric, telocentric

**Karyotyping**:
- Photographic display of chromosomes
- Arranged by size and centromere position
- Normal human karyotype: 46 chromosomes (23 pairs)
- Autosomes: 22 pairs, Sex chromosomes: 1 pair (XX/XY)

**Chromosomal Aberrations**:

**Numerical Abnormalities**:
- Aneuploidy: Abnormal chromosome number
  - Trisomy: Extra chromosome (Down syndrome - Trisomy 21)
  - Monosomy: Missing chromosome (Turner syndrome - XO)
- Polyploidy: Multiple chromosome sets (3n, 4n)

**Structural Abnormalities**:
- Deletion: Loss of chromosome segment
- Duplication: Extra chromosome segment
- Inversion: Reversal of chromosome segment
- Translocation: Exchange between non-homologous chromosomes

**Key Concepts**:
- Homologous chromosomes: Similar but not identical
- Barr body: Inactive X chromosome in females
- Philadelphia chromosome: Translocation in CML

**Exam Tips**: Explain karyotyping procedure. Describe common chromosomal disorders with symptoms.`,
    examType: "BSC_BIOTECH_PART1",
  },
  // MICROBIOLOGY (Core Paper)
  {
    topic: "History and Scope",
    heading: "Foundations of Microbiology",
    content: `Microbiology studies microorganisms and their interactions with other living things.

**Historical Milestones**:
- 1665: Robert Hooke discovers cells
- 1676: Anton van Leeuwenhoek sees "animalcules"
- 1857: Louis Pasteur disproves spontaneous generation
- 1861: Louis Pasteur develops pasteurization
- 1876: Robert Koch identifies anthrax bacillus
- 1881: Robert Koch develops pure culture techniques

**Koch's Postulates** (Germ Theory of Disease):
1. Microorganism must be present in diseased animal
2. Must be isolated in pure culture
3. Inoculation of pure culture must cause disease
4. Same microorganism must be re-isolated

**Scope of Microbiology**:
- Medical microbiology: Pathogens and diseases
- Industrial microbiology: Fermentation, antibiotics
- Agricultural microbiology: Plant pathogens, biofertilizers
- Environmental microbiology: Bioremediation, water quality
- Food microbiology: Food spoilage, preservation

**Key Concepts**:
- Pure culture techniques: Streak plate, pour plate
- Enrichment culture: Selective media for specific microbes
- Winogradsky column: Environmental microbiology technique

**Exam Tips**: Memorize Koch's postulates. Explain historical experiments proving germ theory.`,
    examType: "BSC_BIOTECH_PART1",
  },
  {
    topic: "Microbial Diversity",
    heading: "Types of Microorganisms",
    content: `Microorganisms exhibit tremendous diversity in structure and function.

**Bacteria**:
- Prokaryotic, unicellular
- Shapes: Cocci (round), Bacilli (rod), Spirilla (spiral)
- Cell wall: Peptidoglycan
- Reproduction: Binary fission
- Examples: E. coli, Staphylococcus, Bacillus

**Viruses**:
- Acellular, obligate parasites
- Structure: Nucleic acid + protein coat ± envelope
- Reproduction: Only in host cells
- Classification: DNA/RNA, single/double stranded
- Examples: HIV, Influenza, Tobacco mosaic virus

**Fungi**:
- Eukaryotic, mostly multicellular
- Cell wall: Chitin
- Nutrition: Heterotrophic (saprophytic/parasitic)
- Reproduction: Sexual and asexual spores
- Examples: Yeast (unicellular), Mushrooms (multicellular)

**Algae**:
- Eukaryotic, photosynthetic
- Cell wall: Cellulose
- Classification: Green, Brown, Red algae
- Examples: Chlorella, Laminaria, Porphyra

**Key Concepts**:
- Prokaryotes vs Eukaryotes
- Autotrophs vs Heterotrophs
- Parasites vs Saprophytes
- Pathogens vs Non-pathogens

**Exam Tips**: Compare different microbial groups in tabular form. Give examples of each type.`,
    examType: "BSC_BIOTECH_PART1",
  },
  {
    topic: "Bacterial Structure",
    heading: "Morphology and Components",
    content: `Bacterial cells have complex structures adapted for survival and function.

**Cell Wall**:
- Rigid structure outside plasma membrane
- Peptidoglycan: Sugar chains cross-linked by peptides
- Gram-positive: Thick peptidoglycan layer, retain crystal violet
- Gram-negative: Thin peptidoglycan, outer membrane, don't retain stain

**Plasma Membrane**:
- Phospholipid bilayer with proteins
- Selective permeability
- Site of respiration and transport
- Mesosomes: Invaginations for increased surface area

**Flagella**:
- Locomotory organelles
- Filament, hook, basal body
- Arrangement: Monotrichous, lophotrichous, peritrichous
- Chemotaxis: Movement towards/away from chemicals

**Capsules and Slime Layers**:
- Gelatinous layer outside cell wall
- Protection from phagocytosis
- Adhesion to surfaces
- Examples: Streptococcus pneumoniae, Bacillus anthracis

**Endospores**:
- Dormant, resistant structures
- Formed under stress conditions
- Highly resistant to heat, chemicals, radiation
- Germination: Return to vegetative state
- Examples: Clostridium, Bacillus

**Pili and Fimbriae**:
- Hair-like appendages
- Adhesion and conjugation
- Sex pili: DNA transfer during conjugation

**Exam Tips**: Draw and label bacterial cell structure. Explain Gram staining procedure and differences.`,
    examType: "BSC_BIOTECH_PART1",
  },
  {
    topic: "Growth and Nutrition",
    heading: "Bacterial Physiology",
    content: `Bacterial growth involves multiplication and metabolic activities.

**Nutritional Types**:
- Autotrophs: Synthesize own food
  - Photoautotrophs: Use light (cyanobacteria)
  - Chemoautotrophs: Use inorganic chemicals
- Heterotrophs: Require organic compounds
  - Saprophytes: Decompose dead matter
  - Parasites: Live on/in living hosts
  - Symbionts: Mutualistic relationships

**Growth Requirements**:
- Carbon source: Organic/inorganic
- Nitrogen source: Ammonia, nitrates, amino acids
- Energy source: Light, chemical reactions
- Vitamins and minerals: Trace elements

**Growth Curve** (Batch Culture):
- Lag phase: Adaptation, no division
- Log phase: Exponential growth
- Stationary phase: Growth = Death
- Death phase: Population decline

**Factors Affecting Growth**:
- Temperature: Psychrophiles (cold), Mesophiles (moderate), Thermophiles (hot)
- pH: Most bacteria grow at pH 6.5-7.5
- Osmotic pressure: Halophiles tolerate high salt
- Oxygen: Aerobes, anaerobes, facultative anaerobes
- Moisture: Essential for metabolic activities

**Key Concepts**:
- Generation time: Time for population to double
- Colony forming units (CFU)
- Turbidimetric measurements

**Exam Tips**: Draw bacterial growth curve and label phases. Explain nutritional classification with examples.`,
    examType: "BSC_BIOTECH_PART1",
  },
  {
    topic: "Sterilization and Disinfection",
    heading: "Control Methods",
    content: `Control of microbial growth is essential for medicine, food, and research.

**Sterilization**: Complete removal/destruction of all microorganisms
- Heat methods:
  - Dry heat: 160°C for 2 hours (hot air oven)
  - Moist heat: Autoclave (121°C, 15 psi, 15 min)
  - Boiling: 100°C for 10-30 minutes
  - Pasteurization: 63°C for 30 min or 72°C for 15 sec

**Disinfection**: Reduction of pathogenic microorganisms (not necessarily sterile)
- Chemical disinfectants:
  - Phenol and derivatives
  - Alcohols (70% ethanol, isopropyl alcohol)
  - Halogens (chlorine, iodine)
  - Heavy metals (mercury, silver)
  - Quaternary ammonium compounds

**Filtration**: Physical removal of microorganisms
- Membrane filters: Pore sizes 0.2-0.45 μm
- HEPA filters: Remove airborne microbes
- Used for heat-sensitive materials

**Radiation**:
- UV light: Damages DNA (254 nm wavelength)
- Ionizing radiation: Gamma rays, X-rays
- Used for sterilization of medical equipment

**Key Concepts**:
- Bactericidal vs bacteriostatic
- Spore resistance to sterilization
- Validation of sterilization methods

**Exam Tips**: Compare different sterilization methods. Explain autoclave principle and operation.`,
    examType: "BSC_BIOTECH_PART1",
  },
  // GENETICS (Core Paper)
  {
    topic: "Mendelian Genetics",
    heading: "Laws of Inheritance",
    content: `Mendel's principles form the foundation of genetics.

**Law of Segregation**:
- Each trait is controlled by two alleles
- Alleles separate during gamete formation
- Each gamete carries only one allele for each trait

**Law of Independent Assortment**:
- Genes for different traits assort independently
- Only applies to genes on different chromosomes
- Linked genes violate this law

**Monohybrid Cross**:
- Cross between individuals differing in one trait
- Genotypic ratio: 1:2:1 (AA:Aa:aa)
- Phenotypic ratio: 3:1 (Dominant:Recessive)

**Dihybrid Cross**:
- Cross between individuals differing in two traits
- Genotypic ratio: 1:2:1:2:4:2:1:2:1
- Phenotypic ratio: 9:3:3:1

**Key Concepts**:
- Homozygous vs Heterozygous
- Dominant vs Recessive alleles
- Genotype vs Phenotype
- Test cross: Determine unknown genotype

**Exam Tips**: Solve monohybrid and dihybrid cross problems. Explain Mendel's laws with examples.`,
    examType: "BSC_BIOTECH_PART1",
  },
  {
    topic: "Extensions of Mendel",
    heading: "Complex Inheritance Patterns",
    content: `Many traits don't follow simple Mendelian ratios due to various factors.

**Incomplete Dominance**:
- Heterozygote shows intermediate phenotype
- No dominant/recessive relationship
- Example: Snapdragon flower color (red × white = pink)

**Codominance**:
- Both alleles expressed equally in heterozygote
- Example: ABO blood groups (IA, IB, i)
- Type AB shows both A and B antigens

**Multiple Alleles**:
- More than two alleles for a gene
- Example: ABO blood system (IA, IB, i)
- Human eye color, coat color in animals

**Pleiotropy**:
- Single gene affects multiple traits
- Example: Sickle cell anemia (anemia + resistance to malaria)

**Epistasis**:
- One gene masks expression of another gene
- Example: Coat color in mice (agouti gene masks black/brown)

**Polygenic Inheritance**:
- Multiple genes control a single trait
- Continuous variation (height, skin color)
- Quantitative traits

**Key Concepts**:
- Phenotypic ratios differ from 3:1
- Environmental influence on gene expression
- Gene interactions

**Exam Tips**: Give examples of each extension. Calculate phenotypic ratios for incomplete dominance.`,
    examType: "BSC_BIOTECH_PART1",
  },
  {
    topic: "Linkage and Crossing Over",
    heading: "Gene Linkage",
    content: `Genes on the same chromosome tend to be inherited together.

**Linkage**:
- Genes on same chromosome stay together
- Violates law of independent assortment
- Discovered by Thomas Hunt Morgan (1910)

**Crossing Over**:
- Exchange of genetic material between homologous chromosomes
- Occurs during prophase I of meiosis
- Chiasmata: Points of crossing over
- Increases genetic variation

**Recombination Frequency**:
- Percentage of offspring showing recombination
- Directly proportional to distance between genes
- Used to construct genetic maps
- 1% recombination = 1 map unit (centiMorgan)

**Sex Linkage**:
- Genes on X or Y chromosomes
- X-linked recessive: Color blindness, hemophilia
- Y-linked: Holandric inheritance (male-limited)

**Key Concepts**:
- Coupling vs repulsion phase
- Linkage groups: One per chromosome
- Tetrad: Four chromatids in meiosis

**Exam Tips**: Explain Morgan's experiments. Calculate recombination frequency from cross data.`,
    examType: "BSC_BIOTECH_PART1",
  },
  {
    topic: "Population Genetics",
    heading: "Genetic Variation in Populations",
    content: `Population genetics studies how genetic variation is maintained and changed.

**Gene Pool**:
- Total alleles in a population
- Determines genetic diversity
- Affected by mutations, selection, migration, genetic drift

**Hardy-Weinberg Equilibrium**:
- Theoretical model for non-evolving populations
- Assumptions: No mutations, random mating, no selection, large population, no migration
- Equations:
  - p + q = 1 (allele frequencies)
  - p² + 2pq + q² = 1 (genotype frequencies)
- p = frequency of dominant allele
- q = frequency of recessive allele

**Factors Affecting Gene Frequencies**:

**Mutations**: Source of new genetic variation
- Point mutations, chromosomal aberrations
- Usually harmful, but can be beneficial

**Natural Selection**: Differential survival/reproduction
- Directional, stabilizing, disruptive selection
- Adaptations to environment

**Genetic Drift**: Random changes in small populations
- Founder effect: Small group establishes new population
- Bottleneck effect: Population size drastically reduced

**Gene Flow**: Movement of alleles between populations
- Immigration/emigration
- Prevents divergence between populations

**Key Concepts**:
- Polymorphism: Multiple alleles in population
- Heterozygote advantage: Sickle cell in malaria areas
- Speciation: Formation of new species

**Exam Tips**: Apply Hardy-Weinberg equations to solve problems. Explain how each factor affects gene frequencies.`,
    examType: "BSC_BIOTECH_PART1",
  },
  {
    topic: "Human Genetics",
    heading: "Inheritance in Humans",
    content: `Human genetics involves pedigree analysis and chromosomal disorders.

**Pedigree Analysis**:
- Family tree showing inheritance patterns
- Symbols: Squares (males), circles (females), filled (affected)
- Used to determine inheritance patterns
- Autosomal dominant, autosomal recessive, X-linked

**Sex-Linked Inheritance**:
- Genes on X chromosome
- Males: XY, express recessive X-linked traits
- Females: XX, heterozygous carriers
- Examples: Color blindness, Duchenne muscular dystrophy

**Chromosomal Disorders**:
- Numerical abnormalities:
  - Down syndrome (Trisomy 21): Mental retardation, characteristic features
  - Klinefelter syndrome (XXY): Male with extra X
  - Turner syndrome (XO): Female with missing X
- Structural abnormalities:
  - Cri-du-chat syndrome: Deletion of chromosome 5
  - Philadelphia chromosome: Translocation in CML

**Genetic Counseling**:
- Risk assessment for genetic disorders
- Prenatal diagnosis: Amniocentesis, chorionic villus sampling
- Carrier detection and screening

**Key Concepts**:
- Consanguineous marriages increase recessive disorders
- Multifactorial traits: Genetic + environmental factors
- Genetic heterogeneity: Same phenotype, different genes

**Exam Tips**: Analyze pedigree charts. Explain common chromosomal disorders with karyotypes.`,
    examType: "BSC_BIOTECH_PART1",
  },
  // BOTANY I (Subsidiary Paper)
  {
    topic: "Plant Kingdom",
    heading: "Classification and Diversity",
    content: `Plants exhibit tremendous diversity from algae to flowering plants.

**Algae**:
- Aquatic, photosynthetic organisms
- Thalloid body, no true roots/stems/leaves
- Classification: Green, Brown, Red algae
- Reproduction: Vegetative, asexual, sexual
- Economic importance: Food, agar, algin

**Bryophytes** (Mosses, Liverworts)**:
- Amphibians of plant kingdom
- Dominant gametophyte generation
- No vascular tissues
- Examples: Funaria (moss), Marchantia (liverwort)

**Pteridophytes** (Ferns)**:
- First vascular plants
- Dominant sporophyte generation
- True roots, stems, leaves
- Reproduction: Spores in sporangia
- Examples: Pteris, Dryopteris

**Gymnosperms**:
- Naked seeded plants
- Conifers, cycads, ginkgo
- Male/female cones
- Seeds not enclosed in fruit
- Examples: Pinus, Cycas

**Angiosperms** (Flowering Plants)**:
- Most advanced plants
- Seeds enclosed in fruits
- Flowers for reproduction
- Divided into monocots and dicots

**Key Concepts**:
- Alternation of generations
- Evolutionary trends: Water to land, simple to complex
- Economic importance of each group

**Exam Tips**: Compare different plant groups in evolutionary sequence. Give examples of each division.`,
    examType: "BSC_BIOTECH_PART1",
  },
  {
    topic: "Plant Morphology",
    heading: "External Structure",
    content: `Plant morphology studies external form and structure of plants.

**Root System**:
- Tap root: Primary root dominant (dicots)
- Fibrous root: Adventitious roots (monocots)
- Functions: Anchorage, absorption, storage, reproduction
- Modifications:
  - Storage: Carrot, radish
  - Respiratory: Mangrove roots
  - Parasitic: Cuscuta

**Stem**:
- Aerial part between root and leaves
- Functions: Support, conduction, storage
- Modifications:
  - Underground: Rhizome (ginger), tuber (potato), bulb (onion)
  - Aerial: Tendril (grape), thorn (bougainvillea), phylloclade (cactus)

**Leaf**:
- Lateral appendages of stem
- Functions: Photosynthesis, transpiration, storage
- Parts: Blade (lamina), petiole, stipules
- Venation: Reticulate (dicots), parallel (monocots)
- Modifications:
  - Tendril (peas), spine (cactus), phyllode (Acacia)

**Key Concepts**:
- Homologous vs analogous organs
- Adaptive significance of modifications
- Monocot vs dicot differences

**Exam Tips**: Draw and label plant parts. Explain modifications with examples and functions.`,
    examType: "BSC_BIOTECH_PART1",
  },
  {
    topic: "Plant Anatomy",
    heading: "Internal Structure",
    content: `Plant anatomy studies internal organization of plant tissues.

**Tissue Types**:

**Meristematic Tissues** (Dividing):
- Apical: Tip growth
- Lateral: Cambium (secondary growth)
- Intercalary: Grass leaf growth

**Permanent Tissues**:
- Simple: Parenchyma, collenchyma, sclerenchyma
- Complex: Xylem, phloem

**Xylem** (Water conducting):
- Tracheids and vessels
- Fibers and parenchyma
- Functions: Water transport, mechanical support

**Phloem** (Food conducting):
- Sieve tubes and companion cells
- Functions: Translocation of sugars

**Secondary Growth**:
- Vascular cambium: Produces secondary xylem/phloem
- Cork cambium: Produces protective cork
- Annual rings: Indicate age and growth conditions

**Wood Anatomy**:
- Heartwood: Dead, durable
- Sapwood: Living, conducting
- Pith: Central region
- Bark: Protective outer layer

**Key Concepts**:
- Open vs closed vascular bundles
- Endarch vs exarch xylem
- Spring wood vs summer wood

**Exam Tips**: Draw transverse section of dicot stem/root. Explain secondary growth process.`,
    examType: "BSC_BIOTECH_PART1",
  },
  {
    topic: "Plant Physiology",
    heading: "Metabolic Processes",
    content: `Plant physiology studies how plants function and respond to environment.

**Photosynthesis**:
- Light reactions: Photolysis of water, ATP/NADPH production
- Dark reactions (Calvin cycle): CO2 fixation, carbohydrate synthesis
- C3, C4, CAM pathways
- Factors: Light, CO2, temperature, water

**Respiration**:
- Glycolysis: Cytoplasm, glucose → pyruvate
- Krebs cycle: Mitochondrial matrix, pyruvate → CO2
- Electron transport chain: Inner mitochondrial membrane
- ATP production: Substrate level + oxidative phosphorylation

**Transpiration**:
- Loss of water vapor from plants
- Types: Stomatal, cuticular, lenticular
- Factors: Humidity, temperature, wind
- Significance: Cooling, mineral transport

**Key Concepts**:
- Photorespiration in C3 plants
- Crassulacean acid metabolism (CAM)
- Compensation point
- Respiratory quotient

**Exam Tips**: Draw photosynthesis equation. Explain C3 vs C4 pathway differences. Describe Krebs cycle steps.`,
    examType: "BSC_BIOTECH_PART1",
  },
  {
    topic: "Angiosperm Reproduction",
    heading: "Flower and Seed Formation",
    content: `Angiosperms reproduce sexually through flowers and form seeds.

**Flower Structure**:
- Calyx: Sepals (protection)
- Corolla: Petals (attraction)
- Androecium: Stamens (male)
  - Anther: Pollen production
  - Filament: Stalk
- Gynoecium: Carpels (female)
  - Stigma: Pollen reception
  - Style: Pollen tube growth
  - Ovary: Ovule development

**Pollination**:
- Transfer of pollen to stigma
- Self-pollination: Same flower/plant
- Cross-pollination: Different plant
- Agents: Wind, water, insects, animals

**Fertilization**:
- Double fertilization in angiosperms
- One sperm + egg = zygote
- One sperm + polar nuclei = endosperm
- Significance: Unique to angiosperms

**Seed Formation**:
- Ovule → seed
- Embryo development
- Endosperm: Food storage
- Seed coat: Protection
- Dormancy and germination

**Key Concepts**:
- Perfect vs imperfect flowers
- Monoecious vs dioecious plants
- Parthenocarpy: Seedless fruits
- Apomixis: Asexual seed formation

**Exam Tips**: Draw longitudinal section of flower. Explain double fertilization process. Compare pollination types.`,
    examType: "BSC_BIOTECH_PART1",
  },
  // CHEMISTRY I (Subsidiary Paper)
  {
    topic: "Atomic Structure",
    heading: "Modern Atomic Theory",
    content: `Atomic structure explains the composition and behavior of atoms.

**Bohr Model**:
- Electrons orbit nucleus in fixed energy levels
- Energy levels: K, L, M, N, O, P, Q
- Quantum jumps: Absorption/emission of energy
- Limitations: Doesn't explain multi-electron atoms

**Quantum Mechanical Model**:
- Electrons as wave-particle duality
- Heisenberg uncertainty principle
- Schrödinger equation describes electron probability
- Quantum numbers:
  - n (principal): Energy level (1,2,3...)
  - l (azimuthal): Subshell (s,p,d,f)
  - m (magnetic): Orbital orientation
  - s (spin): Electron spin (+1/2, -1/2)

**Orbital Shapes**:
- s orbitals: Spherical
- p orbitals: Dumbbell (px, py, pz)
- d orbitals: Complex shapes
- f orbitals: More complex

**Electronic Configuration**:
- Aufbau principle: Fill lowest energy orbitals first
- Pauli exclusion principle: Max 2 electrons per orbital
- Hund's rule: One electron per orbital before pairing

**Key Concepts**:
- Isotopes: Same atomic number, different mass
- Isobars: Same mass number, different atomic number
- Isoelectronic: Same number of electrons

**Exam Tips**: Write electronic configurations. Explain quantum numbers with examples.`,
    examType: "BSC_BIOTECH_PART1",
  },
  {
    topic: "Chemical Bonding",
    heading: "Types of Chemical Bonds",
    content: `Chemical bonds hold atoms together in compounds.

**Ionic Bonding**:
- Transfer of electrons
- Electropositive + electronegative elements
- Coulombic attraction between ions
- Properties: High melting point, soluble in water, conduct electricity in solution

**Covalent Bonding** (Valence Bond Theory):
- Sharing of electrons
- Non-metals + non-metals
- Single, double, triple bonds
- Hybridization: sp, sp2, sp3
- Properties: Low melting point, insoluble in water, poor conductors

**Metallic Bonding**:
- Sea of electrons model
- Positive ions in electron cloud
- Properties: Malleable, ductile, good conductors

**Hydrogen Bonding**:
- Special dipole-dipole attraction
- H bonded to N, O, F
- Important in water, DNA, proteins

**van der Waals Forces**:
- Weak intermolecular forces
- London dispersion, dipole-dipole, hydrogen bonding
- Important in non-polar molecules

**Key Concepts**:
- Electronegativity difference determines bond type
- Resonance: Delocalization of electrons
- Coordinate bonding: Both electrons from one atom

**Exam Tips**: Compare ionic vs covalent bonds. Explain hybridization in CH4, C2H4, C2H2.`,
    examType: "BSC_BIOTECH_PART1",
  },
  {
    topic: "Thermodynamics",
    heading: "Energy Changes in Reactions",
    content: `Thermodynamics studies energy relationships in chemical systems.

**First Law of Thermodynamics**:
- Energy conservation: ΔU = q + w
- Internal energy (U): Total energy of system
- Heat (q): Energy transfer due to temperature difference
- Work (w): Energy transfer due to volume change

**Enthalpy (H)**:
- Heat content of system: H = U + PV
- Enthalpy change: ΔH = ΔU + Δ(PV)
- Exothermic: ΔH negative (heat released)
- Endothermic: ΔH positive (heat absorbed)

**Hess's Law**:
- Total enthalpy change independent of path
- Can calculate ΔH for indirect reactions
- Used in bond energy calculations

**Second Law of Thermodynamics**:
- Entropy (S): Measure of disorder
- ΔS = q_rev/T (reversible process)
- Spontaneous processes: ΔG < 0
- Gibbs free energy: G = H - TS

**Third Law of Thermodynamics**:
- Entropy of perfect crystal at 0K is zero
- Absolute entropy values possible

**Key Concepts**:
- State functions: U, H, S, G
- Path functions: q, w
- Standard states: 25°C, 1 atm

**Exam Tips**: Calculate ΔH using Hess's law. Explain spontaneity using ΔG.`,
    examType: "BSC_BIOTECH_PART1",
  },
  {
    topic: "Chemical Equilibrium",
    heading: "Dynamic Equilibrium",
    content: `Chemical equilibrium occurs when forward and reverse reactions balance.

**Law of Mass Action**:
- For aA + bB ⇌ cC + dD
- Kc = [C]^c [D]^d / [A]^a [B]^b
- Kp = Kc(RT)^Δn (gases)

**Equilibrium Constants**:
- Kc: Concentration-based
- Kp: Pressure-based
- Kx: Mole fraction-based
- Large K: Products favored
- Small K: Reactants favored

**Le Chatelier's Principle**:
- System shifts to counteract stress
- Concentration: Add reactant → shift right
- Temperature: Exothermic reaction, heat → shift left
- Pressure: Increase P → shift to fewer moles
- Catalyst: No effect on equilibrium, speeds both reactions

**Key Concepts**:
- Homogeneous vs heterogeneous equilibrium
- Degree of dissociation
- Ionic product of water (Kw)

**Exam Tips**: Calculate Kc from equilibrium concentrations. Apply Le Chatelier's principle to predict shifts.`,
    examType: "BSC_BIOTECH_PART1",
  },
  {
    topic: "Electrochemistry",
    heading: "Redox Reactions and Cells",
    content: `Electrochemistry studies electron transfer in chemical reactions.

**Redox Reactions**:
- Oxidation: Loss of electrons
- Reduction: Gain of electrons
- Oxidizing agent: Accepts electrons
- Reducing agent: Donates electrons

**Electrochemical Cells**:
- Galvanic cell: Spontaneous reaction produces electricity
- Electrolytic cell: Electricity drives non-spontaneous reaction
- Anode: Oxidation occurs
- Cathode: Reduction occurs

**Nernst Equation**:
- E = E° - (RT/nF) ln Q
- E°: Standard electrode potential
- Q: Reaction quotient
- Predicts cell potential under non-standard conditions

**Key Concepts**:
- Standard hydrogen electrode (SHE)
- Electrochemical series
- Corrosion: Unwanted redox reaction
- Electroplating: Metal deposition

**Exam Tips**: Balance redox reactions. Calculate cell potential using Nernst equation.`,
    examType: "BSC_BIOTECH_PART1",
  },
];

export async function seedBiotechSyllabus() {
  console.log("🌱 Starting B.Sc. Biotechnology syllabus seeding...");

  try {
    // Clear existing data
    await db.delete(syllabusChunksTable);

    // Insert new data
    for (const chunk of biotechSyllabusData) {
      await db.insert(syllabusChunksTable).values({
        ...chunk,
        createdAt: new Date(),
      });
    }

    console.log(`✅ Seeded ${biotechSyllabusData.length} syllabus chunks for B.Sc. Biotechnology Part I`);
  } catch (error) {
    console.error("❌ Error seeding syllabus:", error);
    throw error;
  }
}