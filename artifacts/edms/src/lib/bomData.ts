export type NodeType = 'assembly' | 'sub-assembly' | 'part';
export type LifecycleState = 'Production' | 'Prototyping' | 'In Development' | 'End of Life' | 'Active' | 'Obsolete';
export type DocType = 'Drawing' | 'Specification' | 'Test Report' | 'Procedure' | 'CAD Model' | 'Datasheet' | 'Certificate';

export interface LinkedDocument {
  docId: string; title: string; type: DocType; revision: string;
  status: 'Approved' | 'In Review' | 'Draft' | 'Obsolete'; fileType: string; size: string; date: string;
}
export interface LinkedDrawing {
  drawingId: string; title: string; sheetNo: string; revision: string;
  status: 'Released' | 'Preliminary' | 'Superseded'; format: string;
}
export interface WhereUsedEntry { parentPL: string; parentName: string; quantity: number; findNumber: string; }
export interface ChangeHistoryEntry {
  changeId: string; type: 'ECO' | 'ECN' | 'DCR'; title: string; date: string;
  status: 'Implemented' | 'Pending' | 'Cancelled'; author: string;
}
export interface PLRecord {
  plNumber: string; name: string; description: string; type: NodeType; revision: string;
  lifecycleState: LifecycleState; owner: string; department: string; material?: string; weight?: string;
  unitOfMeasure: string; classification: string; safetyVital: boolean;
  source: 'Make' | 'Buy' | 'Make/Buy'; supplier?: string; supplierPartNo?: string;
  alternates: string[]; substitutes: string[];
  effectivity: { serialFrom?: string; serialTo?: string; dateFrom: string; dateTo?: string; lotNumbers?: string[]; };
  linkedDocuments: LinkedDocument[]; linkedDrawings: LinkedDrawing[];
  whereUsed: WhereUsedEntry[]; changeHistory: ChangeHistoryEntry[];
  tags: string[]; lastModified: string; createdDate: string;
}
export interface BOMNode {
  id: string; name: string; type: NodeType; revision: string; tags: string[];
  quantity: number; findNumber: string; unitOfMeasure: string; referenceDesignator?: string; children: BOMNode[];
}
export interface BOMVersion { version: number; label: string; timestamp: string; tree: BOMNode[]; }

export function cloneTree(nodes: BOMNode[]): BOMNode[] { return JSON.parse(JSON.stringify(nodes)); }

export function findNode(nodes: BOMNode[], id: string): BOMNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children.length > 0) { const found = findNode(node.children, id); if (found) return found; }
  }
  return null;
}

export function removeNode(nodes: BOMNode[], id: string): { tree: BOMNode[], removed: BOMNode | null } {
  const tree = cloneTree(nodes); let removed: BOMNode | null = null;
  function remove(arr: BOMNode[]): boolean {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].id === id) { removed = arr.splice(i, 1)[0]; return true; }
      if (remove(arr[i].children)) return true;
    }
    return false;
  }
  remove(tree); return { tree, removed };
}

export function searchTree(nodes: BOMNode[], query: string): Set<string> {
  const matches = new Set<string>();
  if (!query.trim()) return matches;
  const q = query.toLowerCase();
  function search(arr: BOMNode[], ancestors: string[]): boolean {
    let found = false;
    for (const node of arr) {
      const match = node.name.toLowerCase().includes(q) || node.id.toLowerCase().includes(q) || node.tags.some(t => t.toLowerCase().includes(q));
      let childFound = node.children.length > 0 ? search(node.children, [...ancestors, node.id]) : false;
      if (match || childFound) { matches.add(node.id); ancestors.forEach(a => matches.add(a)); found = true; }
    }
    return found;
  }
  search(nodes, []); return matches;
}

export function countNodes(nodes: BOMNode[]): { assemblies: number; parts: number; total: number } {
  let assemblies = 0, parts = 0;
  function count(arr: BOMNode[]) { for (const n of arr) { if (n.type === 'part') parts++; else assemblies++; count(n.children); } }
  count(nodes); return { assemblies, parts, total: assemblies + parts };
}

export const PL_DATABASE: Record<string, PLRecord> = {
  "38100000": {
    plNumber: "38100000", name: "WAP7 Locomotive", description: "Complete WAP7 class 25kV AC electric locomotive assembly for Indian Railways mainline passenger service. 6120 HP traction power with regenerative braking capability.",
    type: "assembly", revision: "D", lifecycleState: "Production", owner: "R. Krishnamurthy", department: "Locomotive Design Bureau",
    weight: "123,000 kg", unitOfMeasure: "EA", classification: "Rolling Stock — Electric Locomotive", safetyVital: true, source: "Make",
    alternates: [], substitutes: [], effectivity: { dateFrom: "2024-01-01", serialFrom: "WAP7-30601", serialTo: "WAP7-30650" },
    linkedDocuments: [
      { docId: "DOC-2026-0001", title: "WAP7 General Arrangement Drawing", type: "Drawing", revision: "D.2", status: "Approved", fileType: "PDF", size: "24.5 MB", date: "2025-11-15" },
      { docId: "DOC-2026-0002", title: "Type Test Certificate — WAP7 Locomotive", type: "Certificate", revision: "C.1", status: "Approved", fileType: "PDF", size: "8.2 MB", date: "2025-08-20" },
      { docId: "DOC-2026-0003", title: "WAP7 Maintenance Manual Volume I", type: "Procedure", revision: "D.0", status: "Approved", fileType: "PDF", size: "156 MB", date: "2026-01-10" },
    ],
    linkedDrawings: [
      { drawingId: "DWG-WAP7-GA-001", title: "General Arrangement — Side Elevation", sheetNo: "1/4", revision: "D.2", status: "Released", format: "A0" },
      { drawingId: "DWG-WAP7-GA-002", title: "General Arrangement — Plan View", sheetNo: "2/4", revision: "D.2", status: "Released", format: "A0" },
      { drawingId: "DWG-WAP7-WD-001", title: "Main Wiring Diagram", sheetNo: "1/12", revision: "C.4", status: "Released", format: "A1" },
    ],
    whereUsed: [],
    changeHistory: [
      { changeId: "ECO-2025-1102", type: "ECO", title: "Upgrade traction motor insulation class to H", date: "2025-09-15", status: "Implemented", author: "A. Sharma" },
      { changeId: "ECN-2026-0034", type: "ECN", title: "Rev D release for serial 30601+ batch", date: "2026-01-10", status: "Implemented", author: "R. Krishnamurthy" },
    ],
    tags: ["Railway", "Production", "Electric", "25kV AC"], lastModified: "2026-03-20", createdDate: "2022-04-01",
  },
  "38110000": {
    plNumber: "38110000", name: "Bogie Assembly", description: "Complete bogie frame assembly with primary/secondary suspension, wheelsets, brake rigging, and traction motor mounting.",
    type: "sub-assembly", revision: "C", lifecycleState: "Production", owner: "D. Mukherjee", department: "Bogie Design Division",
    material: "IS 2062 Grade E350 Steel", weight: "12,800 kg", unitOfMeasure: "EA", classification: "Underframe — Bogie",
    safetyVital: true, source: "Make", alternates: ["38110500"], substitutes: [],
    effectivity: { dateFrom: "2024-01-01", serialFrom: "WAP7-30601" },
    linkedDocuments: [
      { docId: "DOC-2026-1101", title: "Bogie Frame Stress Analysis Report", type: "Test Report", revision: "C.0", status: "Approved", fileType: "PDF", size: "34.2 MB", date: "2025-06-10" },
      { docId: "DOC-2026-1102", title: "Bogie Assembly Procedure", type: "Procedure", revision: "B.3", status: "Approved", fileType: "PDF", size: "18.5 MB", date: "2025-09-22" },
    ],
    linkedDrawings: [
      { drawingId: "DWG-BOG-ASM-001", title: "Bogie Assembly — General Arrangement", sheetNo: "1/6", revision: "C.0", status: "Released", format: "A0" },
    ],
    whereUsed: [{ parentPL: "38100000", parentName: "WAP7 Locomotive", quantity: 2, findNumber: "10" }],
    changeHistory: [{ changeId: "ECO-2025-0887", type: "ECO", title: "Modify bogie frame gusset plate thickness", date: "2025-03-20", status: "Implemented", author: "D. Mukherjee" }],
    tags: ["Structural", "Safety Vital", "Fabricated"], lastModified: "2026-02-15", createdDate: "2022-06-15",
  },
  "38111000": {
    plNumber: "38111000", name: "Brake System", description: "Complete pneumatic-hydraulic braking assembly including brake cylinders, brake rigging, slack adjuster, and brake blocks.",
    type: "sub-assembly", revision: "B.2", lifecycleState: "Production", owner: "S. Patel", department: "Brake Systems Division",
    weight: "1,450 kg", unitOfMeasure: "EA", classification: "Safety System — Braking", safetyVital: true, source: "Make",
    alternates: [], substitutes: [], effectivity: { dateFrom: "2024-01-01" },
    linkedDocuments: [
      { docId: "DOC-2026-1201", title: "Brake System Type Test Report", type: "Test Report", revision: "B.2", status: "Approved", fileType: "PDF", size: "42.1 MB", date: "2025-04-18" },
    ],
    linkedDrawings: [
      { drawingId: "DWG-BRK-ASM-001", title: "Brake Rigging Assembly", sheetNo: "1/3", revision: "B.2", status: "Released", format: "A1" },
    ],
    whereUsed: [{ parentPL: "38110000", parentName: "Bogie Assembly", quantity: 1, findNumber: "10" }],
    changeHistory: [{ changeId: "ECO-2025-0912", type: "ECO", title: "Change brake block composite material", date: "2025-06-22", status: "Implemented", author: "S. Patel" }],
    tags: ["Safety Vital", "Hydraulic", "Pneumatic"], lastModified: "2026-01-10", createdDate: "2022-08-01",
  },
  "38120000": {
    plNumber: "38120000", name: "Traction System", description: "Complete traction system including traction motor, gearbox, and motor suspension arrangement. 6120 HP total output.",
    type: "sub-assembly", revision: "B", lifecycleState: "Production", owner: "A. Sharma", department: "Electrical Design Division",
    weight: "4,200 kg", unitOfMeasure: "EA", classification: "Electrical — Traction", safetyVital: true, source: "Make",
    alternates: [], substitutes: [], effectivity: { dateFrom: "2024-01-01" },
    linkedDocuments: [
      { docId: "DOC-2026-2001", title: "Traction Motor Type Test Report", type: "Test Report", revision: "B.0", status: "Approved", fileType: "PDF", size: "28.4 MB", date: "2025-04-10" },
    ],
    linkedDrawings: [
      { drawingId: "DWG-TRC-MTR-001", title: "Traction Motor Assembly", sheetNo: "1/5", revision: "B.0", status: "Released", format: "A1" },
    ],
    whereUsed: [{ parentPL: "38110000", parentName: "Bogie Assembly", quantity: 3, findNumber: "20" }],
    changeHistory: [{ changeId: "ECO-2025-1102", type: "ECO", title: "Upgrade insulation class to H", date: "2025-09-15", status: "Implemented", author: "A. Sharma" }],
    tags: ["Electrical", "Traction Motor", "Safety Vital"], lastModified: "2026-02-01", createdDate: "2022-07-10",
  },
  "38130000": {
    plNumber: "38130000", name: "Main Transformer", description: "25kV single-phase to multi-winding transformer for traction and auxiliary power supply. ODAF cooling.",
    type: "sub-assembly", revision: "C", lifecycleState: "Production", owner: "P. Gupta", department: "Transformer Division",
    weight: "14,800 kg", unitOfMeasure: "EA", classification: "Electrical — Transformer", safetyVital: true, source: "Buy",
    supplier: "ABB Ltd.", supplierPartNo: "TRAX-TM-WAP7-C", alternates: [], substitutes: [],
    effectivity: { dateFrom: "2024-01-01" },
    linkedDocuments: [
      { docId: "DOC-2026-3001", title: "Transformer Routine Test Certificate", type: "Certificate", revision: "C.0", status: "Approved", fileType: "PDF", size: "15.6 MB", date: "2025-10-28" },
    ],
    linkedDrawings: [
      { drawingId: "DWG-TFR-ASM-001", title: "Transformer Outline Drawing", sheetNo: "1/2", revision: "C.0", status: "Released", format: "A1" },
    ],
    whereUsed: [{ parentPL: "38100000", parentName: "WAP7 Locomotive", quantity: 1, findNumber: "30" }],
    changeHistory: [], tags: ["Electrical", "Transformer", "High Voltage"], lastModified: "2026-01-20", createdDate: "2022-09-01",
  },
  "38140000": {
    plNumber: "38140000", name: "Control Electronics Cabinet", description: "Integrated power electronics and control system cabinet. Houses TCMS, converters, and protection relays.",
    type: "sub-assembly", revision: "B.3", lifecycleState: "Production", owner: "K. Joshi", department: "Electronics Division",
    weight: "850 kg", unitOfMeasure: "EA", classification: "Electronics — Control", safetyVital: true, source: "Make",
    alternates: [], substitutes: [], effectivity: { dateFrom: "2024-01-01" },
    linkedDocuments: [
      { docId: "DOC-2026-4001", title: "Control System Architecture Specification", type: "Specification", revision: "B.3", status: "Approved", fileType: "PDF", size: "22.1 MB", date: "2025-12-05" },
    ],
    linkedDrawings: [
      { drawingId: "DWG-ELC-CAB-001", title: "Control Cabinet Internal Layout", sheetNo: "1/4", revision: "B.3", status: "Released", format: "A1" },
    ],
    whereUsed: [{ parentPL: "38100000", parentName: "WAP7 Locomotive", quantity: 1, findNumber: "40" }],
    changeHistory: [{ changeId: "ECN-2025-0445", type: "ECN", title: "Add TCMS redundancy module", date: "2025-07-15", status: "Implemented", author: "K. Joshi" }],
    tags: ["Electronics", "TCMS", "Safety Vital", "High Voltage"], lastModified: "2026-02-28", createdDate: "2022-10-01",
  },
  "38150000": {
    plNumber: "38150000", name: "Pantograph & Current Collection", description: "Roof-mounted pantograph assembly for 25kV OHE current collection. Pneumatically raised/lowered.",
    type: "sub-assembly", revision: "A.5", lifecycleState: "Production", owner: "M. Reddy", department: "Current Collection Division",
    weight: "320 kg", unitOfMeasure: "EA", classification: "Electrical — Current Collection", safetyVital: true, source: "Buy",
    supplier: "Stemmann-Technik GmbH", supplierPartNo: "SBD-25-WAP7", alternates: [], substitutes: [],
    effectivity: { dateFrom: "2024-01-01" },
    linkedDocuments: [
      { docId: "DOC-2026-5001", title: "Pantograph Type Test Report", type: "Test Report", revision: "A.5", status: "Approved", fileType: "PDF", size: "18.2 MB", date: "2025-05-20" },
    ],
    linkedDrawings: [
      { drawingId: "DWG-PAN-ASM-001", title: "Pantograph Installation Drawing", sheetNo: "1/2", revision: "A.5", status: "Released", format: "A1" },
    ],
    whereUsed: [{ parentPL: "38100000", parentName: "WAP7 Locomotive", quantity: 2, findNumber: "50" }],
    changeHistory: [], tags: ["High Voltage", "Pantograph", "Safety Vital", "Wear Item"], lastModified: "2025-12-15", createdDate: "2022-11-01",
  },
};

export function getPLRecord(plNumber: string): PLRecord | undefined {
  return PL_DATABASE[plNumber];
}

export const INITIAL_BOM_TREE: BOMNode[] = [
  {
    id: "38100000", name: "WAP7 Locomotive", type: "assembly", revision: "D", quantity: 1, findNumber: "1",
    unitOfMeasure: "EA", tags: ["Railway", "Production", "25kV AC"],
    children: [
      {
        id: "38110000", name: "Bogie Assembly", type: "sub-assembly", revision: "C", quantity: 2, findNumber: "10",
        unitOfMeasure: "EA", tags: ["Structural", "Safety Vital"],
        children: [
          { id: "38111000", name: "Brake System", type: "sub-assembly", revision: "B.2", quantity: 1, findNumber: "10", unitOfMeasure: "EA", tags: ["Safety Vital"], children: [] },
          { id: "38120000", name: "Traction System", type: "sub-assembly", revision: "B", quantity: 3, findNumber: "20", unitOfMeasure: "EA", tags: ["Electrical", "Traction Motor"], children: [] },
        ]
      },
      { id: "38130000", name: "Main Transformer", type: "sub-assembly", revision: "C", quantity: 1, findNumber: "30", unitOfMeasure: "EA", tags: ["Electrical", "High Voltage"], children: [] },
      { id: "38140000", name: "Control Electronics Cabinet", type: "sub-assembly", revision: "B.3", quantity: 1, findNumber: "40", unitOfMeasure: "EA", tags: ["Electronics", "TCMS"], children: [] },
      { id: "38150000", name: "Pantograph & Current Collection", type: "sub-assembly", revision: "A.5", quantity: 2, findNumber: "50", unitOfMeasure: "EA", tags: ["High Voltage", "Wear Item"], children: [] },
    ]
  }
];
