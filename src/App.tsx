import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Meter = {
  id: number; name: string; edgeId: string; type: string; source: string;
  status: string; online: string; critical: string; excluded: string; notifications: string;
  lastData: string; dataFormat: string; comAddress: string;
  contactName: string; contactEmail: string; contactPhone: string; supplierName?: string;
  criticalReason?: string; excludedFrom?: string; excludedTo?: string;
  excludedNoEndDate?: boolean; excludedReason?: string; notificationComment?: string; notificationScope?: string;
  ctRatio?: string; pulseRatio?: string; channels?: string; apiDeviceId?: string;
  smartcomId?: string; stringNumber?: string; inputNumber?: string; baudRate?: string;
  cumulocityId?: string; apiParameter?: string; nmiSuffix?: string; bmsConnectionPoint?: string;
  internalOnly?: boolean;
  nmiNo: string; serialNo: string; serialValidFrom?: string;
  serialHistory?: { serialNo: string; validFrom: string; validTo: string }[];
  captisNumber: string;
  captisValidFrom?: string;
  captisHistory?: { captisNumber: string; validFrom: string; validTo: string }[];
};

type NewMeterInput = {
  utility: string;
  name: string;
  meterId: string;
  source: string;
  dataFormat: string;
  nmiNo: string;
  serialNo: string;
  captisNumber: string;
  apiParameter: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  supplierName: string;
  internalOnly: boolean;
};

const INITIAL_METERS: Meter[] = [
  { id: 1, name: "Main Electricity", edgeId: "EDGE-5231", type: "Electricity", source: "CAPTIS", status: "In progress", online: "Online", critical: "No", excluded: "No", notifications: "Disabled", lastData: "2 min ago", dataFormat: "Captis API", comAddress: "192.168.1.48:502", contactName: "James Rourke", contactEmail: "j.rourke@ausgrid.com.au", contactPhone: "+61 2 9000 1234", supplierName: "Ausgrid", ctRatio: "400:5", nmiNo: "NMI6301847200", serialNo: "883104220481", captisNumber: "CAP-00241" },
  { id: 2, name: "Chiller Plant", edgeId: "EDGE-3112", type: "Water", source: "CAPTIS", status: "Active", online: "Offline", critical: "No", excluded: "No", notifications: "Enabled", lastData: "4 h ago", dataFormat: "Captis API", comAddress: "10.0.0.22:4001", contactName: "Sandra Lim", contactEmail: "s.lim@jci.com", contactPhone: "+61 2 8801 5500", supplierName: "JCI", nmiNo: "NMI6303112048", serialNo: "311204781550", captisNumber: "CAP-00105", cumulocityId: "12345678910", apiParameter: "Pulse1_Total" },
  { id: 3, name: "Water Device 01", edgeId: "EDGE-7301", type: "Water", source: "SmartCom II", status: "Active", online: "Online", critical: "No", excluded: "No", notifications: "Enabled", lastData: "3 min ago", dataFormat: "CSV", comAddress: "10.0.1.12:8080", contactName: "—", contactEmail: "—", contactPhone: "—", supplierName: "Sydney Water", pulseRatio: "1 pulse / 10 L", nmiNo: "NMI6304120389", serialNo: "204918770326", captisNumber: "CAP-00389" },
  { id: 4, name: "Water Device 02", edgeId: "EDGE-4120", type: "Thermal", source: "NEM12", status: "In progress", online: "Online", critical: "No", excluded: "Yes", notifications: "Enabled", lastData: "8 h ago", dataFormat: "NEM12", comAddress: "192.168.2.11:502", contactName: "Troy Hallis", contactEmail: "t.hallis@agl.com.au", contactPhone: "+61 3 8622 4100", supplierName: "AGL", pulseRatio: "1 pulse / 1 m³", nmiNo: "NMI6309012847", serialNo: "770240523104", captisNumber: "—", nmiSuffix: "E1" },
  { id: 5, name: "Solar Inverter A", edgeId: "EDGE-7410", type: "Gas", source: "CAPTIS", status: "Active", online: "Online", critical: "No", excluded: "No", notifications: "Disabled", lastData: "1 min ago", dataFormat: "Captis API", comAddress: "192.168.1.72:1502", contactName: "Priya Desai", contactEmail: "p.desai@fronius.com", contactPhone: "+61 7 3001 8842", supplierName: "Fronius", ctRatio: "200:5", nmiNo: "NMI6300281947", serialNo: "600188427219", captisNumber: "CAP-00601", internalOnly: true },
  { id: 6, name: "BMS Air Handler", edgeId: "EDGE-6204", type: "Electricity", source: "Edge G6", status: "Active", online: "Online", critical: "Yes", excluded: "No", notifications: "Enabled", lastData: "1 min ago", dataFormat: "BACnet/IP", comAddress: "10.0.0.88:47808", contactName: "Mark Stenhouse", contactEmail: "m.stenhouse@siemens.com", contactPhone: "+61 2 9394 5000", supplierName: "Siemens", nmiNo: "NMI6306204178", serialNo: "620418939450", captisNumber: "CAP-00178", channels: "CT1, CT2" },
  { id: 7, name: "Cold Water Riser", edgeId: "EDGE-7044", type: "Gas", source: "BACNET_1", status: "In progress", online: "Online", critical: "Yes", excluded: "No", notifications: "Enabled", lastData: "8 days ago", dataFormat: "BACnet/IP", comAddress: "10.0.1.31:8080", contactName: "—", contactEmail: "—", contactPhone: "—", supplierName: "Veolia", pulseRatio: "1 pulse / 50 L", nmiNo: "NMI6307044412", serialNo: "704412508031", captisNumber: "CAP-00412" },
  { id: 8, name: "Emergency Generator", edgeId: "EDGE-7188", type: "Electricity", source: "NEM12", status: "Active", online: "Online", critical: "No", excluded: "No", notifications: "Enabled", lastData: "5 min ago", dataFormat: "NEM12", comAddress: "192.168.1.91:502", contactName: "Alex Nguyen", contactEmail: "a.nguyen@health.nsw.gov.au", contactPhone: "+61 2 9382 7111", supplierName: "NSW Health", ctRatio: "600:5", nmiNo: "NMI6307188042", serialNo: "718804291602", captisNumber: "—", nmiSuffix: "E1" },
  { id: 9, name: "Domestic Hot Water", edgeId: "EDGE-7236", type: "Analog", source: "SmartCom II", status: "Active", online: "Online", critical: "Yes", excluded: "No", notifications: "Enabled", lastData: "12 min ago", dataFormat: "CSV", comAddress: "10.0.1.45:8080", contactName: "Olivia Chen", contactEmail: "o.chen@health.nsw.gov.au", contactPhone: "+61 2 9382 7004", supplierName: "NSW Health", pulseRatio: "1 pulse / 10 L", nmiNo: "NMI6307236198", serialNo: "723619834201", captisNumber: "CAP-00518" },
  { id: 10, name: "Theatre AHU 03", edgeId: "EDGE-6001", type: "Digital", source: "BACNET_1", status: "Active", online: "Offline", critical: "Yes", excluded: "Yes", notifications: "Enabled", lastData: "1 h ago", dataFormat: "BACnet/IP", comAddress: "10.0.0.103:47808", contactName: "Mark Stenhouse", contactEmail: "m.stenhouse@siemens.com", contactPhone: "+61 2 9394 5000", supplierName: "Siemens", nmiNo: "NMI6307301554", serialNo: "730155409887", captisNumber: "—" },
  { id: 11, name: "Medical Gas Plant", edgeId: "EDGE-2048", type: "Electricity", source: "BACNET_1", status: "Active", online: "Offline", critical: "No", excluded: "No", notifications: "Enabled", lastData: "2 days ago", dataFormat: "BACnet/IP", comAddress: "192.168.2.24:502", contactName: "Troy Hallis", contactEmail: "t.hallis@agl.com.au", contactPhone: "+61 3 8622 4100", supplierName: "AGL", pulseRatio: "1 pulse / 1 m³", nmiNo: "NMI6307410273", serialNo: "741027354118", captisNumber: "—" },
  { id: 12, name: "Car park lighting", edgeId: "EDGE-7522", type: "Electricity", source: "Watt Watchers", status: "Active", online: "Online", critical: "No", excluded: "No", notifications: "Enabled", lastData: "7 min ago", dataFormat: "JSON", comAddress: "192.168.3.16:443", contactName: "Priya Desai", contactEmail: "p.desai@fronius.com", contactPhone: "+61 7 3001 8842", supplierName: "Fronius", ctRatio: "100:5", pulseRatio: "1000 imp/kWh", channels: "C1, C2, C3", apiDeviceId: "DDA4108895928", nmiNo: "NMI6307522914", serialNo: "752291441056", captisNumber: "—", internalOnly: true },
];

const DUMMY_SUPPLIER_CONTACT = {
  name: "Taylor Morgan",
  email: "taylor.morgan@example.com",
  phone: "+61 2 9000 0000",
};

type SortKey = keyof Meter;
type View = "all" | "online" | "offline" | "critical" | "excluded";
type Page = "devices" | "data-management" | "reupload" | "nem12-log" | "incident-log";

const STATS = [
  { label: "Online", value: 213, filter: "online" as View },
  { label: "Offline", value: 16, filter: "offline" as View },
  { label: "Critical", value: 23, filter: "critical" as View },
  { label: "Excluded", value: 7, filter: "excluded" as View },
];

const HEADER_TOOLTIPS: Partial<Record<SortKey, { title: string; body: string }>> = {
  online: {
    title: "Online",
    body: "Device is currently connected",
  },
  status: {
    title: "Under commissioning",
    body: "Visible to internal users only while commissioning is in progress, the device is expected to be online for testing. Once complete, the device becomes visible to all users and its status may be online or offline.",
  },
  excluded: {
    title: "Excluded",
    body: "This device is excluded from automated monitoring and missing data checks",
  },
};

const COLUMN_FILTERS: Partial<Record<SortKey, { label: string; value: string }[]>> = {
  type: ["Electricity", "Gas", "Water", "Thermal", "Analog", "Digital"].map(value => ({ label: value, value })),
  source: ["Edge G6", "SmartCom II", "SmartCom", "BACNET_1", "CAPTIS", "NEM12", "Watt Watchers"].map(value => ({ label: value, value })),
  supplierName: ["AGL", "Ausgrid", "Fronius", "JCI", "NSW Health", "Siemens", "Sydney Water", "Veolia", "Unassigned"].map(value => ({ label: value, value })),
  online: [{ label: "Online", value: "Online" }, { label: "Offline", value: "Offline" }],
  internalOnly: [{ label: "Yes", value: "Yes" }, { label: "No", value: "No" }],
  status: [{ label: "Active", value: "Active" }, { label: "In progress", value: "In progress" }],
  critical: [{ label: "Critical", value: "Yes" }, { label: "Non-critical", value: "No" }],
  excluded: [{ label: "Excluded", value: "Yes" }, { label: "Included", value: "No" }],
  notifications: [{ label: "On", value: "Enabled" }, { label: "Off", value: "Disabled" }],
};

function onlineValue(meter: Meter) {
  return meter.status === "In progress" || meter.status === "Inactive" ? "Online" : meter.online;
}

function internalOnlyValue(meter: Meter) {
  return meter.internalOnly ? "Yes" : "No";
}

function formatEdgeId(id: string) {
  return /^\d+$/.test(id) ? `PM-${id}` : id;
}

function formatUploadSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function downloadUpload(file: File) {
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = file.name;
  link.click();
  URL.revokeObjectURL(url);
}

const ALL_COLUMN_KEYS: SortKey[] = [
  "name",
  "edgeId",
  "type",
  "source",
  "supplierName",
  "online",
  "internalOnly",
  "status",
  "critical",
  "excluded",
  "notifications",
];

type ExportFieldKey =
  | "name" | "edgeId" | "type" | "source" | "online" | "status" | "critical" | "excluded"
  | "serialNo" | "channels" | "comAddress" | "baudRate" | "ctRatio" | "inputNumber" | "pulseRatio";

const DEFAULT_EXPORT_FIELDS: { key: ExportFieldKey; label: string; locked?: boolean }[] = [
  { key: "name", label: "Device name", locked: true },
  { key: "edgeId", label: "Edge device ID", locked: true },
  { key: "type", label: "Device type" },
  { key: "source", label: "Data source" },
  { key: "online", label: "Online status" },
  { key: "status", label: "Under commissioning" },
  { key: "critical", label: "Critical status" },
  { key: "excluded", label: "Excluded status" },
];

const OPTIONAL_EXPORT_FIELDS: {
  key: ExportFieldKey;
  label: string;
  compatibility: [boolean, boolean, boolean];
}[] = [
  { key: "serialNo", label: "Serial number", compatibility: [true, false, false] },
  { key: "channels", label: "String number", compatibility: [true, true, false] },
  { key: "comAddress", label: "Meter address", compatibility: [true, true, false] },
  { key: "baudRate", label: "Baud rate", compatibility: [true, true, false] },
  { key: "ctRatio", label: "CT ratio", compatibility: [true, true, false] },
  { key: "inputNumber", label: "Input number", compatibility: [false, false, true] },
  { key: "pulseRatio", label: "Pulse ratio", compatibility: [false, false, true] },
];

function withMissingColumns(order: SortKey[], visible: SortKey[]) {
  const nextOrder = [...order];
  const inserted: SortKey[] = [];
  ALL_COLUMN_KEYS.forEach(key => {
    if (nextOrder.includes(key)) return;
    inserted.push(key);
    const earlier = ALL_COLUMN_KEYS.slice(0, ALL_COLUMN_KEYS.indexOf(key)).reverse().find(item => nextOrder.includes(item));
    nextOrder.splice(earlier ? nextOrder.indexOf(earlier) + 1 : nextOrder.length, 0, key);
  });
  const nextVisible = [...visible];
  inserted.forEach(key => {
    if (key === "supplierName" || nextVisible.includes(key)) return;
    nextVisible.push(key);
  });
  return { order: nextOrder, visible: nextVisible };
}

const DEVICE_TYPE_ICONS: Record<string, string> = {
  Electricity: "/assets/device-types/271c6.svg",
  Gas: "/assets/device-types/67b24.svg",
  Thermal: "/assets/device-types/b3d29.svg",
  Analog: "/assets/device-types/d8c34.svg",
  Digital: "/assets/device-types/2307e.svg",
  Water: "/assets/device-types/3d9b4.svg",
};

export default function App() {
  const [meters, setMeters] = useState<Meter[]>(INITIAL_METERS);
  useEffect(() => {
    setMeters(current => {
      let changed = false;
      const next = current.map(meter => {
        const sourceReplacements: Record<string, string> = {
          Starcom: "SmartCom",
          Planter: "SmartCom II",
          MODBUS: "BACNET_1",
        };
        let updated = sourceReplacements[meter.source]
          ? { ...meter, source: sourceReplacements[meter.source], dataFormat: meter.source === "MODBUS" ? "BACnet/IP" : meter.dataFormat }
          : meter;
        if (meter.status === "Inactive") {
          updated = { ...updated, status: "In progress", online: "Online" };
        }
        if (meter.edgeId === "EDGE-7410") {
          updated = { ...updated, internalOnly: true };
        }
        if (meter.edgeId === "EDGE-3112") {
          updated = {
            ...updated,
            source: "CAPTIS",
            dataFormat: "Captis API",
            cumulocityId: "12345678910",
            apiParameter: "Pulse1_Total",
          };
        }
        if (meter.edgeId === "EDGE-4120") {
          updated = { ...updated, source: "NEM12", type: "Thermal", dataFormat: "NEM12", nmiSuffix: "E1" };
        }
        if (meter.source.toUpperCase() === "NEM12" && !["Electricity", "Thermal"].includes(meter.type)) {
          updated = { ...updated, type: "Electricity" };
        }
        if (meter.edgeId === "EDGE-7522") {
          updated = {
            ...updated,
            name: "Car park lighting",
            type: "Electricity",
            source: "Watt Watchers",
            status: "Active",
            dataFormat: "JSON",
            ctRatio: "100:5",
            pulseRatio: "1000 imp/kWh",
            channels: "C1, C2, C3",
            apiDeviceId: "DDA4108895928",
            internalOnly: true,
          };
        }
        const supplierName = supplierLabel(updated);
        const hasBlankContact = updated.contactName === "—" || updated.contactEmail === "—" || updated.contactPhone === "—";
        if (updated !== meter || updated.supplierName !== supplierName || hasBlankContact) {
          changed = true;
          return {
            ...updated,
            supplierName,
            contactName: updated.contactName === "—" ? DUMMY_SUPPLIER_CONTACT.name : updated.contactName,
            contactEmail: updated.contactEmail === "—" ? DUMMY_SUPPLIER_CONTACT.email : updated.contactEmail,
            contactPhone: updated.contactPhone === "—" ? DUMMY_SUPPLIER_CONTACT.phone : updated.contactPhone,
          };
        }
        return meter;
      });
      return changed ? next : current;
    });
  }, []);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<View>("all");
  const [selected, setSelected] = useState<number[]>([]);
  const [drawerMeterId, setDrawerMeterId] = useState<number | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [activeTab, setActiveTab] = useState<Page>("devices");
  const [reuploadView, setReuploadView] = useState<"new" | "history">("history");
  const [addDeviceOpen, setAddDeviceOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [savedNoticeId, setSavedNoticeId] = useState<number | null>(null);
  const [bulkModal, setBulkModal] = useState<"critical" | "excluded" | "notifications" | null>(null);
  const [bulkMenu, setBulkMenu] = useState<"critical" | "excluded" | "notifications" | null>(null);
  const [bulkFromDate, setBulkFromDate] = useState("");
  const [bulkToDate, setBulkToDate] = useState("");
  const [bulkNoEnd, setBulkNoEnd] = useState(false);
  const [bulkReason, setBulkReason] = useState("");
  const [bulkComment, setBulkComment] = useState("");
  const [bulkToast, setBulkToast] = useState<{ message: string; previous: Meter[] } | null>(null);
  const bulkMenuRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [pageSizeOpen, setPageSizeOpen] = useState(false);
  const [columnPanelOpen, setColumnPanelOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<SortKey[]>(
    ALL_COLUMN_KEYS.filter(key => key !== "supplierName" && key !== "internalOnly")
  );
  const [columnOrder, setColumnOrder] = useState<SortKey[]>(ALL_COLUMN_KEYS);
  const [openColumnFilter, setOpenColumnFilter] = useState<SortKey | null>(null);
  const [columnFilters, setColumnFilters] = useState<Partial<Record<SortKey, string[]>>>(() =>
    Object.fromEntries(Object.entries(COLUMN_FILTERS).map(([key, options]) => [key, options!.map(option => option.value)]))
  );
  useEffect(() => {
    setColumnFilters(current => ({
      ...current,
      source: COLUMN_FILTERS.source!.map(option => option.value),
      status: (current.status ?? COLUMN_FILTERS.status!.map(option => option.value)).map(value => value === "Inactive" ? "In progress" : value),
    }));
  }, []);
  const columnFilterRef = useRef<HTMLTableCellElement>(null);

  useEffect(() => {
    if (!bulkMenu) return;
    function handle(event: PointerEvent) {
      if (!bulkMenuRef.current?.contains(event.target as Node)) setBulkMenu(null);
    }
    document.addEventListener("pointerdown", handle);
    return () => document.removeEventListener("pointerdown", handle);
  }, [bulkMenu]);

  useEffect(() => {
    if (!openColumnFilter) return;
    function handle(event: PointerEvent) {
      if (!columnFilterRef.current?.contains(event.target as Node)) setOpenColumnFilter(null);
    }
    document.addEventListener("pointerdown", handle);
    return () => document.removeEventListener("pointerdown", handle);
  }, [openColumnFilter]);

  const filtered = meters.filter((m) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      m.name.toLowerCase().includes(q) ||
      m.edgeId.toLowerCase().includes(q) ||
      m.type.toLowerCase().includes(q) ||
      m.source.toLowerCase().includes(q);
    const matchView =
      view === "all" ||
      (view === "online" && onlineValue(m) === "Online") ||
      (view === "offline" && onlineValue(m) === "Offline") ||
      (view === "critical" && m.critical === "Yes") ||
      (view === "excluded" && m.excluded === "Yes");
    const matchColumns = (Object.entries(COLUMN_FILTERS) as [SortKey, { label: string; value: string }[]][]).every(([key, options]) => {
      const selected = columnFilters[key] ?? options.map(option => option.value);
      if (selected.length === options.length) return true;
      const value = key === "online" ? onlineValue(m) : key === "internalOnly" ? internalOnlyValue(m) : String(m[key]);
      return selected.includes(value);
    });
    return matchSearch && matchView && matchColumns;
  }).sort((a, b) => {
    const av = a[sortKey] as string ?? "";
    const bv = b[sortKey] as string ?? "";
    return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
  });

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(currentPage, pageCount);
  const pageRows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  const drawerMeter = drawerMeterId !== null ? meters.find(m => m.id === drawerMeterId) ?? null : null;
  const filtersNarrowed = view !== "all" || (Object.entries(COLUMN_FILTERS) as [SortKey, { label: string; value: string }[]][]).some(([key, options]) => {
    const selected = columnFilters[key] ?? options.map(option => option.value);
    return selected.length !== options.length;
  });

  function clearFilters() {
    setView("all");
    setColumnFilters(Object.fromEntries(Object.entries(COLUMN_FILTERS).map(([key, options]) => [key, options!.map(option => option.value)])));
    setOpenColumnFilter(null);
  }

  function patchMeter(id: number, patch: Partial<Meter>) {
    setMeters(ms => ms.map(m => m.id === id ? { ...m, ...patch } : m));
  }

  function addMeter(input: NewMeterInput, notify = false) {
    const id = Math.max(...meters.map(meter => meter.id), 0) + 1;
    setMeters(current => [...current, {
        id,
        name: input.name,
        edgeId: formatEdgeId(input.meterId),
        type: input.utility,
        source: input.source,
        status: "Active",
        online: "Offline",
        critical: "No",
        excluded: "No",
        notifications: "Enabled",
        lastData: "No data",
        dataFormat: input.dataFormat,
        comAddress: "—",
        contactName: input.contactName.trim() || DUMMY_SUPPLIER_CONTACT.name,
        contactEmail: input.contactEmail.trim() || DUMMY_SUPPLIER_CONTACT.email,
        contactPhone: input.contactPhone.trim() || DUMMY_SUPPLIER_CONTACT.phone,
        supplierName: input.supplierName.trim() || "Unassigned",
        internalOnly: input.internalOnly,
        nmiNo: input.nmiNo || "—",
        serialNo: input.serialNo || "000000000000",
        captisNumber: input.captisNumber || "—",
        cumulocityId: input.captisNumber || "—",
        apiParameter: input.apiParameter || undefined,
      }]);
    setAddDeviceOpen(false);
    if (notify) setSavedNoticeId(id);
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  }

  function toggleAll() {
    setSelected(selected.length === filtered.length ? [] : filtered.map(m => m.id));
  }

  function toggleRow(id: number) {
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  }

  function openBulkModal(kind: "critical" | "excluded" | "notifications") {
    setBulkMenu(null);
    setBulkModal(kind);
    setBulkFromDate("");
    setBulkToDate("");
    setBulkNoEnd(false);
    setBulkReason("");
    setBulkComment("");
  }

  function applyBulkChange(patch: Partial<Meter>, message: string) {
    const previous = meters.filter(meter => selected.includes(meter.id)).map(meter => ({ ...meter }));
    setMeters(current => current.map(meter => selected.includes(meter.id) ? { ...meter, ...patch } : meter));
    setBulkToast({ message, previous });
    setBulkModal(null);
    setBulkMenu(null);
  }

  function applyBulk() {
    if (!bulkModal || !bulkModalValid) return;
    if (bulkModal === "critical") {
      applyBulkChange({ critical: "Yes", criticalReason: bulkReason }, "Critical status saved");
    } else if (bulkModal === "excluded") {
      applyBulkChange({
        excluded: "Yes",
        excludedFrom: bulkFromDate,
        excludedTo: bulkNoEnd ? "" : bulkToDate,
        excludedNoEndDate: bulkNoEnd,
        excludedReason: bulkReason,
      }, "Exclusions saved");
    } else {
      applyBulkChange({ notifications: "Disabled", notificationComment: bulkComment }, "Notifications disabled");
    }
  }

  const selectedMeters = meters.filter(m => selected.includes(m.id));
  const criticalCount = selectedMeters.filter(meter => meter.critical === "Yes").length;
  const excludedCount = selectedMeters.filter(meter => meter.excluded === "Yes").length;
  const notificationsOn = selectedMeters.filter(meter => meter.notifications === "Enabled").length;
  const oneDevice = selected.length === 1;
  const deviceWord = oneDevice ? "device" : "devices";
  const bulkControls: Array<
    | { type: "button"; key: string; label: string; onClick: () => void }
    | { type: "menu"; key: "critical" | "excluded" | "notifications"; label: string; items: { label: string; onClick: () => void }[] }
  > = [
    criticalCount > 0 && criticalCount < selected.length
      ? {
          type: "menu",
          key: "critical",
          label: "Critical",
          items: [
            { label: `Mark critical (${selected.length - criticalCount})`, onClick: () => openBulkModal("critical") },
            { label: `Remove critical (${criticalCount})`, onClick: () => applyBulkChange({ critical: "No", criticalReason: "" }, "Critical status removed") },
          ],
        }
      : criticalCount < selected.length
        ? { type: "button", key: "critical", label: "Mark as critical", onClick: () => openBulkModal("critical") }
        : { type: "button", key: "critical", label: "Remove critical", onClick: () => applyBulkChange({ critical: "No", criticalReason: "" }, "Critical status removed") },
    excludedCount > 0 && excludedCount < selected.length
      ? {
          type: "menu",
          key: "excluded",
          label: "Exclude",
          items: [
            { label: `Exclude devices (${selected.length - excludedCount})`, onClick: () => openBulkModal("excluded") },
            { label: `Include devices (${excludedCount})`, onClick: () => applyBulkChange({ excluded: "No", excludedFrom: "", excludedTo: "", excludedReason: "" }, "Exclusion removed") },
          ],
        }
      : excludedCount < selected.length
        ? { type: "button", key: "excluded", label: oneDevice ? "Exclude device" : "Exclude devices", onClick: () => openBulkModal("excluded") }
        : { type: "button", key: "excluded", label: oneDevice ? "Include device" : "Include devices", onClick: () => applyBulkChange({ excluded: "No", excludedFrom: "", excludedTo: "", excludedReason: "" }, "Exclusion removed") },
    notificationsOn > 0 && notificationsOn < selected.length
      ? {
          type: "menu",
          key: "notifications",
          label: "Notifications",
          items: [
            { label: `Disable notifications (${notificationsOn})`, onClick: () => openBulkModal("notifications") },
            { label: `Enable notifications (${selected.length - notificationsOn})`, onClick: () => applyBulkChange({ notifications: "Enabled", notificationComment: "" }, "Notifications enabled") },
          ],
        }
      : notificationsOn === selected.length
        ? { type: "button", key: "notifications", label: oneDevice ? "Disable notification" : "Disable notifications", onClick: () => openBulkModal("notifications") }
        : { type: "button", key: "notifications", label: oneDevice ? "Enable notification" : "Enable notifications", onClick: () => applyBulkChange({ notifications: "Enabled", notificationComment: "" }, "Notifications enabled") },
  ];

  const bulkModalValid = bulkModal === "critical"
    ? Boolean(bulkReason)
    : bulkModal === "excluded"
      ? Boolean(bulkFromDate && bulkReason && (bulkNoEnd || bulkToDate))
      : Boolean(bulkComment);
  const bulkModalDirty = Boolean(bulkFromDate || bulkToDate || bulkNoEnd || bulkReason || bulkComment);

  const COLS: { key: SortKey; label: string }[] = [
    { key: "name", label: "Device name" },
    { key: "edgeId", label: "Edge Device ID" },
    { key: "type", label: "Device Type" },
    { key: "source", label: "Data Source" },
    { key: "supplierName", label: "Supplier" },
    { key: "online", label: "Online" },
    { key: "internalOnly", label: "Internal only" },
    { key: "status", label: "Under comm." },
    { key: "critical", label: "Critical" },
    { key: "excluded", label: "Excluded" },
    { key: "notifications", label: "Notification" },
  ];
  const shownColumns = withMissingColumns(columnOrder, visibleColumns);
  useEffect(() => {
    if (shownColumns.order.length !== columnOrder.length) setColumnOrder(shownColumns.order);
    if (shownColumns.visible.length !== visibleColumns.length) setVisibleColumns(shownColumns.visible);
  }, [shownColumns, columnOrder, visibleColumns]);
  const visibleCols = shownColumns.order
    .map(key => COLS.find(column => column.key === key))
    .filter((column): column is { key: SortKey; label: string } => Boolean(column) && shownColumns.visible.includes(column!.key));

  function toggleColumn(key: SortKey) {
    if (key === "name") return;
    setVisibleColumns(current => current.includes(key)
      ? current.filter(columnKey => columnKey !== key)
      : [...current, key]);
  }

  function reorderColumn(dragged: SortKey, target: SortKey, place: "before" | "after" = "before") {
    if (dragged === target || dragged === "name" || target === "name") return;
    setColumnOrder(current => {
      const next = current.filter(key => key !== dragged);
      let index = next.indexOf(target);
      if (index < 0) return current;
      if (place === "after") index += 1;
      index = Math.max(index, 1);
      next.splice(index, 0, dragged);
      return next.every((key, itemIndex) => key === current[itemIndex]) ? current : next;
    });
  }

  function renderMeterCell(meter: Meter, key: SortKey, isSelected: boolean) {
    switch (key) {
      case "name":
        return (
          <div className="epx-device-name">
            <input
              type="checkbox"
              aria-label={`Select ${meter.name}`}
              checked={isSelected}
              onChange={() => toggleRow(meter.id)}
              onClick={event => event.stopPropagation()}
            />
            <span>{meter.name}</span>
          </div>
        );
      case "online": {
        const online = onlineValue(meter);
        return (
          <span className={`epx-online-status ${online === "Online" ? "is-online" : "is-offline"}`}>
            <img
              src={online === "Online"
                ? "/assets/device-management/2699a.svg"
                : "/assets/device-management/ba735.svg"}
              alt=""
            />
            {online}
          </span>
        );
      }
      case "internalOnly":
        return internalOnlyValue(meter) === "Yes" ? "Yes" : <span className="epx-empty-value">–</span>;
      case "supplierName":
        return meter.supplierName || "—";
      case "status":
        return meter.status === "In progress" || meter.status === "Inactive" ? (
          <span className="epx-inline-state is-inactive">
            <img src="/assets/device-management/hourglass.svg" alt="" />
            In progress
          </span>
        ) : <span className="epx-empty-value">–</span>;
      case "critical":
        return meter.critical === "Yes" ? (
          <span className="epx-inline-state is-critical">
            <img src="/assets/device-management/a44da.svg" alt="" />
            Critical
          </span>
        ) : <span className="epx-empty-value">–</span>;
      case "excluded":
        return meter.excluded === "Yes" ? (
          <span className="epx-inline-state is-excluded">
            <img src="/assets/device-management/remove-circle.svg" alt="" />
            Excluded
          </span>
        ) : <span className="epx-empty-value">–</span>;
      case "notifications":
        return meter.notifications === "Disabled" ? (
          <span className="epx-inline-state is-disabled">
            <img src="/assets/device-management/4bfa1.svg" alt="" />
            Disabled
          </span>
        ) : <span className="epx-empty-value">–</span>;
      default:
        return key === "edgeId" ? formatEdgeId(String(meter.edgeId ?? "–")) : String(meter[key] ?? "–");
    }
  }
  const pageDetails: Record<Page, { title: string; description: string }> = {
    devices: {
      title: "Device management",
      description: "Manage and monitor all devices for 100 Crescent Tower",
    },
    "data-management": {
      title: "Data management",
      description: "Manage operational data workflows across the portfolio.",
    },
    reupload: {
      title: "NEM12 Data reupload",
      description: "Reprocess historical NEM12 data for selected devices",
    },
    "nem12-log": {
      title: "NEM12 data log",
      description: "Review NEM12 data processing activity.",
    },
    "incident-log": {
      title: "Incident issue log",
      description: "Review operational data incidents and issues.",
    },
  };
  const activePageDetails = pageDetails[activeTab];

  function exportDevices(fields: ExportFieldKey[]) {
    const labels = Object.fromEntries([...DEFAULT_EXPORT_FIELDS, ...OPTIONAL_EXPORT_FIELDS].map(field => [field.key, field.label]));
    const valueFor = (meter: Meter, field: ExportFieldKey) => {
      if (field === "online") return onlineValue(meter);
      if (field === "status") return meter.status === "Inactive" ? "In progress" : meter.status;
      if (field === "baudRate") return meter.baudRate ?? "—";
      if (field === "inputNumber") return meter.inputNumber ?? "—";
      return String(meter[field as keyof Meter] ?? "—");
    };
    const headers = fields.map(field => labels[field]);
    const rows = filtered.map(meter => fields.map(field => valueFor(meter, field)));
    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "devices.csv";
    link.click();
    URL.revokeObjectURL(url);
    setExportDialogOpen(false);
  }

  return (
    <div className="epx-app min-h-screen bg-white text-black flex">
      <Sidebar
        activePage={activeTab}
        onNavigate={setActiveTab}
        onOpenRequestHistory={() => {
          setActiveTab("reupload");
          setReuploadView("history");
        }}
      />

      <div className="epx-main flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className={`epx-page-header flex items-center justify-between gap-6 border-b border-black px-6 pb-4 pt-5${activeTab === "reupload" ? " is-reupload" : ""}`}>
          <div>
            <div className="page-heading-title">
              {activePageDetails.title}
            </div>
            <div className="page-heading-description mt-1 text-gray-600">
              {activePageDetails.description}
            </div>
          </div>
          {activeTab === "devices" && (
            <div className="epx-header-actions">
              <button type="button" className="epx-export-button" aria-label="Export devices" onClick={() => setExportDialogOpen(true)}>
                <img src="/assets/device-management/export.svg" alt="" />
              </button>
              <button
                type="button"
                onClick={() => setAddDeviceOpen(true)}
                className="epx-primary-button"
              >
                Add device
              </button>
            </div>
          )}
          {activeTab === "reupload" && reuploadView === "history" && (
            <button
              type="button"
              onClick={() => setReuploadView("new")}
              className="epx-primary-button"
            >
              New request
            </button>
          )}
        </header>

        {activeTab === "devices" ? (
          <div className="flex min-h-0 flex-1 overflow-hidden">

        {/* Main content */}
          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">

          {/* Stat cards */}
          <div className="epx-stat-grid flex gap-0 border-b border-black">
            {STATS.map((s) => (
              <button
                key={s.label}
                onClick={() => setView(current => current === s.filter ? "all" : s.filter)}
                className={`epx-stat-card flex-1 text-left ${view === s.filter ? "is-selected" : ""}`}
              >
                <div className="epx-stat-value">{s.value}</div>
                <div className={`epx-stat-label is-${s.label.toLowerCase()}`}>
                  {s.label === "Online" && <img src="/assets/device-management/2699a.svg" alt="" />}
                  {s.label === "Offline" && <img src="/assets/device-management/4ecff.svg" alt="" />}
                  {s.label === "Critical" && <img src="/assets/device-management/6c992.svg" alt="" />}
                  {s.label === "Excluded" && <img src="/assets/device-management/82b00.svg" alt="" />}
                  {s.label}
                </div>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="epx-toolbar border-b border-black">
            <div className="flex items-center border border-black">
              <span className="epx-search-icon" aria-hidden="true">
                <img src="/assets/device-management/bf431.svg" alt="" />
              </span>
              <input
                className="flex-1 bg-white outline-none placeholder-gray-400"
                placeholder="Search devices, device IDs, device types, data sources..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button onClick={() => setSearch("")} aria-label="Clear search">×</button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="epx-table-wrap flex min-h-0 flex-1 flex-col">
            <div className={`epx-table-header${selected.length > 0 ? " is-bulk-editing" : ""}`}>
              <div className="epx-table-summary">
                <span>
                  {filtersNarrowed || search ? filtered.length : 229} {(filtersNarrowed || search) && filtered.length === 1 ? "Device" : "Devices"}
                </span>
                {selected.length > 0 && (
                  <div className="epx-bulk-bar" ref={bulkMenuRef}>
                    <span className="epx-bulk-divider" />
                    <button type="button" className="epx-bulk-clear" onClick={() => setSelected([])}>
                      {selected.length} selected
                      <img src="/assets/bulk-edit/close.svg" alt="" />
                    </button>
                    {bulkControls.map(control => control.type === "button" ? (
                      <button type="button" key={control.key} onClick={control.onClick}>{control.label}</button>
                    ) : (
                      <div className="epx-bulk-menu" key={control.key}>
                        <button
                          type="button"
                          aria-expanded={bulkMenu === control.key}
                          aria-haspopup="menu"
                          onClick={() => setBulkMenu(current => current === control.key ? null : control.key)}
                        >
                          {control.label}
                          <img src="/assets/bulk/expand.svg" alt="" className={bulkMenu === control.key ? "is-open" : ""} />
                        </button>
                        {bulkMenu === control.key && (
                          <div role="menu">
                            {control.items.map(item => (
                              <button type="button" key={item.label} role="menuitem" onClick={item.onClick}>
                                {item.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {filtersNarrowed && selected.length === 0 && (
                  <button type="button" className="epx-clear-filters" onClick={clearFilters}>
                    Clear filters
                  </button>
                )}
              </div>
              <div className="epx-table-actions">
                <button
                  type="button"
                  aria-label="Choose visible columns"
                  aria-expanded={columnPanelOpen}
                  onClick={() => {
                    setDrawerMeterId(null);
                    setColumnPanelOpen(true);
                  }}
                >
                  <img src="/assets/bulk-edit/view-column.svg" alt="" />
                  Column Views
                </button>
              </div>
            </div>
            <div className="epx-table-scroll-shell">
              <div className="epx-table-scroll">
              <table className="epx-device-table w-full">
              <thead>
                <tr>
                  {visibleCols.map(col => {
                    const filterOptions = COLUMN_FILTERS[col.key];
                    const selectedValues = columnFilters[col.key] ?? filterOptions?.map(option => option.value) ?? [];
                    const allSelected = Boolean(filterOptions && selectedValues.length === filterOptions.length);
                    return (
                    <th
                      key={col.key}
                      ref={openColumnFilter === col.key ? columnFilterRef : undefined}
                      data-column={col.key}
                      className={`cursor-pointer select-none whitespace-nowrap${filterOptions && !allSelected ? " is-filtered" : ""}`}
                      onClick={() => {
                        if (!filterOptions) toggleSort(col.key);
                        else setOpenColumnFilter(current => current === col.key ? null : col.key);
                      }}
                    >
                      <span className="epx-column-heading">
                        {col.key === "name" && (
                          <input
                            type="checkbox"
                            aria-label="Select all visible devices"
                            checked={selected.length === filtered.length && filtered.length > 0}
                            onChange={event => {
                              event.stopPropagation();
                              toggleAll();
                            }}
                            onClick={event => event.stopPropagation()}
                          />
                        )}
                        {col.label}
                        {HEADER_TOOLTIPS[col.key] && (
                          <HeaderTooltip title={HEADER_TOOLTIPS[col.key]!.title} body={HEADER_TOOLTIPS[col.key]!.body}>
                            <img src="/assets/device-management/c18e2.svg" alt="" />
                          </HeaderTooltip>
                        )}
                        {col.key !== "name" && col.key !== "edgeId" && (
                          <img
                            src={col.key === "online"
                              ? "/assets/device-management/dc60a.svg"
                              : "/assets/device-management/64bff.svg"}
                            alt={sortKey === col.key ? `Sorted ${sortDir}ending` : ""}
                            className={sortKey === col.key && sortDir === "desc" ? "is-descending" : ""}
                          />
                        )}
                      </span>
                      {filterOptions && openColumnFilter === col.key && (
                        <div
                          className="epx-column-filter"
                          ref={columnFilterRef}
                          onClick={event => event.stopPropagation()}
                          onPointerDown={event => event.stopPropagation()}
                        >
                          <div className="epx-column-filter-title">Filter</div>
                          <label>
                            <input
                              type="checkbox"
                              checked={allSelected}
                              ref={input => {
                                if (input) input.indeterminate = !allSelected && selectedValues.length > 0;
                              }}
                              onChange={() => setColumnFilters(current => ({
                                ...current,
                                [col.key]: allSelected ? [] : filterOptions.map(option => option.value),
                              }))}
                            />
                            Select all
                          </label>
                          {filterOptions.map(option => (
                            <label key={option.value}>
                              <input
                                type="checkbox"
                                checked={selectedValues.includes(option.value)}
                                onChange={() => setColumnFilters(current => {
                                  const currentValues = current[col.key] ?? filterOptions.map(item => item.value);
                                  const next = currentValues.includes(option.value)
                                    ? currentValues.filter(item => item !== option.value)
                                    : [...currentValues, option.value];
                                  return { ...current, [col.key]: next };
                                })}
                              />
                              {option.label}
                            </label>
                          ))}
                        </div>
                      )}
                    </th>
                  );
                  })}
                </tr>
              </thead>
              <tbody>
                {pageRows.map((m) => {
                  const isSelected = selected.includes(m.id);
                  const isActive = drawerMeterId === m.id;
                  return (
                    <tr
                      key={m.id}
                      className={`cursor-pointer ${isActive ? "is-active" : ""} ${isSelected ? "is-selected" : ""}`}
                      onClick={() => {
                        setColumnPanelOpen(false);
                        setDrawerMeterId(isActive ? null : m.id);
                      }}
                    >
                      {visibleCols.map(column => (
                        <td key={column.key} data-column={column.key}>
                          {renderMeterCell(m, column.key, isSelected)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={visibleCols.length} className="epx-empty-table">
                      No devices match current filters
                    </td>
                  </tr>
                )}
              </tbody>
              </table>
              </div>
            </div>
            <div className="epx-table-footer">
              <div className="epx-results-per-page epx-page-size">
                <button
                  type="button"
                  aria-expanded={pageSizeOpen}
                  onClick={() => setPageSizeOpen(open => !open)}
                >
                  {pageSize}
                  <img src="/assets/device-management/3c143.svg" alt="" />
                </button>
                {pageSizeOpen && (
                  <div className="epx-filter-menu is-compact">
                    {[12, 24, 48].map(size => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => {
                          setPageSize(size);
                          setCurrentPage(1);
                          setPageSizeOpen(false);
                        }}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                )}
                <span>Results per page</span>
              </div>
              <nav className="epx-pagination" aria-label="Device table pagination">
                <button
                  type="button"
                  aria-label="Previous page"
                  disabled={safePage === 1}
                  onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                >
                  <img src="/assets/device-management/a90a9.svg" alt="" />
                </button>
                {Array.from({ length: pageCount }, (_, index) => index + 1).map(page => (
                  <button
                    type="button"
                    key={page}
                    aria-current={safePage === page ? "page" : undefined}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}
                <button
                  type="button"
                  aria-label="Next page"
                  disabled={safePage === pageCount}
                  onClick={() => setCurrentPage(page => Math.min(pageCount, page + 1))}
                >
                  <img src="/assets/device-management/58a6c.svg" alt="" />
                </button>
              </nav>
            </div>
          </div>
        </div>

        {/* Detail Drawer */}
        {drawerMeter && (
          <MeterDrawer
            key={drawerMeter.id}
            meter={drawerMeter}
            onClose={() => setDrawerMeterId(null)}
            onPatch={(patch) => patchMeter(drawerMeter.id, patch)}
          />
        )}
          </div>
        ) : activeTab === "reupload" ? (
          <DataReupload
            meters={meters.slice(0, 4)}
            requestView={reuploadView}
            onRequestViewChange={setReuploadView}
          />
        ) : (
          <div className="flex flex-1 items-start p-6">
            <div className="text-lg font-bold uppercase tracking-wide">{activePageDetails.title}</div>
          </div>
        )}
      </div>

      {bulkModal && (
        <div
          className="epx-add-device-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="bulk-action-title"
          onPointerDown={event => {
            if (event.target === event.currentTarget && !bulkModalDirty) setBulkModal(null);
          }}
        >
          <div className="epx-reconfig-dialog epx-bulk-dialog">
            <div className="epx-add-device-header">
              <div>
                <div id="bulk-action-title">
                  {bulkModal === "critical" ? "Mark critical" : bulkModal === "excluded" ? "Exclude devices" : "Disable notifications"}
                </div>
              </div>
              <button type="button" onClick={() => setBulkModal(null)} aria-label="Close">
                <img src="/assets/add-device/7bf08.svg" alt="" />
              </button>
            </div>
            <div className="epx-reconfig-body">
              <p className="epx-bulk-copy">
                {bulkModal === "critical" && `Mark ${selected.length} selected ${deviceWord} as critical for priority monitoring`}
                {bulkModal === "excluded" && `Exclude ${selected.length} selected ${deviceWord} from automated monitoring, missing data checks and SLA reporting`}
                {bulkModal === "notifications" && `Disable notification${selected.length === 1 ? "" : "s"} for ${selected.length} selected ${deviceWord}. Suppliers will no longer receive automated notifications for missing data affecting these devices.`}
              </p>
              {bulkModal === "critical" && (
                <SettingSelect
                  label="Reason"
                  value={bulkReason}
                  placeholder="Select reason"
                  options={CRITICAL_REASONS}
                  onChange={setBulkReason}
                />
              )}
              {bulkModal === "excluded" && (
                <div className="epx-bulk-exclude">
                  <DateRangeField from={bulkFromDate} to={bulkToDate} toDisabled={bulkNoEnd} onFromChange={setBulkFromDate} onToChange={setBulkToDate} />
                  <label className="epx-add-device-check">
                    <input type="checkbox" checked={bulkNoEnd} onChange={event => setBulkNoEnd(event.target.checked)} />
                    No end date
                  </label>
                  <SettingSelect
                    label="Reason"
                    value={bulkReason}
                    placeholder="Select reason"
                    options={EXCLUDE_REASONS}
                    onChange={setBulkReason}
                  />
                </div>
              )}
              {bulkModal === "notifications" && (
                <label className="epx-add-device-field">
                  <span>Comment</span>
                  <textarea
                    value={bulkComment}
                    onChange={event => setBulkComment(event.target.value)}
                    rows={4}
                    placeholder="Why are notifications being disabled?"
                  />
                </label>
              )}
            </div>
            <div className="epx-add-device-footer">
              <button type="button" onClick={() => setBulkModal(null)}>Cancel</button>
              <button type="button" className="is-primary" disabled={!bulkModalValid} onClick={applyBulk}>Save</button>
            </div>
          </div>
        </div>
      )}

      {bulkToast && (
        <SavedToast
          message={bulkToast.message}
          onUndo={() => {
            const previous = bulkToast.previous;
            setMeters(current => current.map(meter => previous.find(item => item.id === meter.id) ?? meter));
            setBulkToast(null);
          }}
          onClose={() => setBulkToast(null)}
        />
      )}

      {columnPanelOpen && (
        <ColumnViewPanel
          columns={COLS}
          visibleColumns={shownColumns.visible}
          columnOrder={shownColumns.order}
          onClose={() => setColumnPanelOpen(false)}
          onToggleColumn={toggleColumn}
          onReorderColumn={reorderColumn}
          onResetOrder={() => setColumnOrder(ALL_COLUMN_KEYS)}
        />
      )}

      {addDeviceOpen && (
        <AddDeviceModal
          onClose={() => setAddDeviceOpen(false)}
          onAdd={addMeter}
        />
      )}

      {exportDialogOpen && (
        <ExportDevicesDialog
          onClose={() => setExportDialogOpen(false)}
          onExport={exportDevices}
        />
      )}

      {savedNoticeId !== null && (
        <SavedToast
          onUndo={() => {
            setMeters(current => current.filter(meter => meter.id !== savedNoticeId));
            setSavedNoticeId(null);
          }}
          onClose={() => setSavedNoticeId(null)}
        />
      )}
    </div>
  );
}

function ExportDevicesDialog({
  onClose,
  onExport,
}: {
  onClose: () => void;
  onExport: (fields: ExportFieldKey[]) => void;
}) {
  const [optionalOpen, setOptionalOpen] = useState(false);
  const [selected, setSelected] = useState<ExportFieldKey[]>(DEFAULT_EXPORT_FIELDS.map(field => field.key));

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  function toggleField(key: ExportFieldKey) {
    setSelected(current => current.includes(key) ? current.filter(field => field !== key) : [...current, key]);
  }

  const optionalSelected = OPTIONAL_EXPORT_FIELDS.filter(field => selected.includes(field.key));
  const allOptionalSelected = optionalSelected.length === OPTIONAL_EXPORT_FIELDS.length;
  const selectionChanged = selected.length !== DEFAULT_EXPORT_FIELDS.length
    || DEFAULT_EXPORT_FIELDS.some(field => !selected.includes(field.key));
  const orderedSelection = [...DEFAULT_EXPORT_FIELDS, ...OPTIONAL_EXPORT_FIELDS]
    .filter(field => selected.includes(field.key))
    .map(field => field.key);

  return (
    <div
      className="epx-add-device-backdrop epx-export-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-dialog-title"
      onPointerDown={event => {
        if (event.target === event.currentTarget && !selectionChanged) onClose();
      }}
    >
      <div className="epx-export-dialog">
        <header className="epx-export-dialog-header">
          <div>
            <h2 id="export-dialog-title">Export devices</h2>
            <p>Choose which fields to include in your CSV export</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close export dialog">
            <img src="/assets/export-dialog/close.svg" alt="" />
          </button>
        </header>

        <div className="epx-export-dialog-body">
          <section className="epx-export-section">
            <h3>Default fields</h3>
            <div className="epx-export-default-grid">
              {DEFAULT_EXPORT_FIELDS.map(field => (
                <label key={field.key} className={field.locked ? "is-locked" : ""}>
                  <input
                    type="checkbox"
                    checked={selected.includes(field.key)}
                    disabled={field.locked}
                    onChange={() => toggleField(field.key)}
                  />
                  <span>{field.label}</span>
                </label>
              ))}
            </div>
          </section>

          <section className="epx-export-section epx-export-optional">
            <button
              type="button"
              className="epx-export-section-toggle"
              aria-expanded={optionalOpen}
              onClick={() => setOptionalOpen(open => !open)}
            >
              <span>Optional fields</span>
              <img src="/assets/export-dialog/expand-less.svg" alt="" className={optionalOpen ? "" : "is-collapsed"} />
            </button>
            {optionalOpen && (
              <div className="epx-export-optional-content">
                <table>
                  <thead>
                    <tr>
                      <th>
                        <label>
                          <input
                            type="checkbox"
                            checked={allOptionalSelected}
                            ref={input => {
                              if (input) input.indeterminate = optionalSelected.length > 0 && !allOptionalSelected;
                            }}
                            onChange={() => {
                              const keys = OPTIONAL_EXPORT_FIELDS.map(field => field.key);
                              setSelected(current => allOptionalSelected
                                ? current.filter(field => !keys.includes(field))
                                : [...current.filter(field => !keys.includes(field)), ...keys]);
                            }}
                          />
                          <span>Field</span>
                        </label>
                      </th>
                      <th>
                        <div className="epx-export-table-heading">
                          <span>Edge meter</span>
                          <img src="/assets/export-dialog/info.svg" alt="" title="Fields available for edge meters" />
                        </div>
                      </th>
                      <th>
                        <div className="epx-export-table-heading">
                          <span>Third party<br />elect. meter</span>
                          <img src="/assets/export-dialog/info-alt.svg" alt="" title="Fields available for third party electricity meters" />
                        </div>
                      </th>
                      <th>
                        <div className="epx-export-table-heading">
                          <span>Meter<br />(pulse input)</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {OPTIONAL_EXPORT_FIELDS.map(field => (
                      <tr key={field.key}>
                        <td>
                          <label>
                            <input
                              type="checkbox"
                              checked={selected.includes(field.key)}
                              onChange={() => toggleField(field.key)}
                            />
                            <span>{field.label}</span>
                          </label>
                        </td>
                        {field.compatibility.map((available, index) => (
                          <td key={index}>
                            {available
                              ? <img src="/assets/export-dialog/check.svg" alt="Available" />
                              : <span className="epx-export-unavailable">–</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

        <footer className="epx-export-dialog-footer">
          <span>{selected.length} fields selected</span>
          <div>
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="button" className="is-primary" onClick={() => onExport(orderedSelection)}>Export CSV</button>
          </div>
        </footer>
      </div>
    </div>
  );
}

function ColumnViewPanel({
  columns,
  visibleColumns,
  columnOrder,
  onClose,
  onToggleColumn,
  onReorderColumn,
  onResetOrder,
}: {
  columns: { key: SortKey; label: string }[];
  visibleColumns: SortKey[];
  columnOrder: SortKey[];
  onClose: () => void;
  onToggleColumn: (key: SortKey) => void;
  onReorderColumn: (dragged: SortKey, target: SortKey, place: "before" | "after") => void;
  onResetOrder: () => void;
}) {
  const [collapsedGroups, setCollapsedGroups] = useState<string[]>([]);
  const [draggedColumn, setDraggedColumn] = useState<SortKey | null>(null);
  const [dragGhost, setDragGhost] = useState<{ top: number; left: number; width: number } | null>(null);
  const reorderRef = useRef(onReorderColumn);
  reorderRef.current = onReorderColumn;
  const groups = [
    {
      id: "site-information",
      label: "Site information",
      columns: ["name", "edgeId", "type", "source", "supplierName"] as const,
    },
    {
      id: "device-status",
      label: "Device status",
      columns: ["online", "internalOnly", "status", "critical", "excluded", "notifications"] as const,
    },
  ];
  const panelLabels: Record<string, string> = {
    name: "Device name",
    edgeId: "Edge device ID",
    type: "Device type",
    source: "Data source",
    supplierName: "Supplier",
    online: "Online",
    internalOnly: "Internal only",
    status: "Under comm.",
    critical: "Critical",
    excluded: "Excluded",
    notifications: "Notification",
  };
  const labelFor = (key: string) => panelLabels[key] ?? columns.find(column => column.key === key)?.label ?? key;
  const isShown = (key: string) => visibleColumns.includes(key as SortKey);
  const visibleOrderedColumns = columnOrder.filter(key => visibleColumns.includes(key));
  const orderChanged = columnOrder.length !== ALL_COLUMN_KEYS.length
    || columnOrder.some((key, index) => key !== ALL_COLUMN_KEYS[index]);

  function toggleGroup(groupId: string) {
    setCollapsedGroups(current => current.includes(groupId)
      ? current.filter(id => id !== groupId)
      : [...current, groupId]);
  }

  function startColumnDrag(event: React.PointerEvent<HTMLDivElement>, key: SortKey) {
    if (key === "name" || event.button !== 0) return;
    const row = event.currentTarget;
    const rect = row.getBoundingClientRect();
    const session = {
      key,
      startY: event.clientY,
      offsetY: event.clientY - rect.top,
      left: rect.left,
      width: rect.width,
      active: false,
    };

    function move(pointerEvent: PointerEvent) {
      if (!session.active && Math.abs(pointerEvent.clientY - session.startY) < 4) return;
      session.active = true;
      setDraggedColumn(session.key);
      setDragGhost({
        top: pointerEvent.clientY - session.offsetY,
        left: session.left,
        width: session.width,
      });
      const targetRow = document.elementsFromPoint(pointerEvent.clientX, pointerEvent.clientY)
        .filter(element => !element.closest(".epx-column-drag-ghost"))
        .map(element => element.closest("[data-column-key]"))
        .find((element): element is HTMLElement => Boolean(element));
      const target = targetRow?.dataset.columnKey as SortKey | undefined;
      if (!targetRow || !target || target === session.key || target === "name") return;
      const targetRect = targetRow.getBoundingClientRect();
      const place = pointerEvent.clientY < targetRect.top + targetRect.height / 2 ? "before" : "after";
      reorderRef.current(session.key, target, place);
    }

    function end() {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
      if (session.active) {
        const swallow = (clickEvent: MouseEvent) => {
          clickEvent.stopPropagation();
          clickEvent.preventDefault();
          window.removeEventListener("click", swallow, true);
        };
        window.addEventListener("click", swallow, true);
      }
      setDraggedColumn(null);
      setDragGhost(null);
    }

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end);
  }

  useEffect(() => {
    if (!draggedColumn) return;
    const previous = document.body.style.cursor;
    document.body.style.cursor = "grabbing";
    return () => {
      document.body.style.cursor = previous;
    };
  }, [draggedColumn]);

  return (
    <aside
      className="epx-column-panel"
      role="dialog"
      aria-modal="false"
      aria-labelledby="column-panel-title"
    >
      <div className="epx-column-panel-header">
        <div>
          <div id="column-panel-title">Edit column view</div>
          <p>Manage and organize table views</p>
        </div>
        <button type="button" onClick={onClose} aria-label="Close column view">
          <img src="/assets/column-view/966b1.svg" alt="" />
        </button>
      </div>

      <div className="epx-column-panel-content">
        <section className="epx-column-section">
          <div className="epx-column-section-heading">
            <span>Current view</span>
            {orderChanged && (
              <button type="button" className="epx-column-reset" onClick={onResetOrder}>
                Reset
              </button>
            )}
            <span className="epx-column-count">{visibleOrderedColumns.length}</span>
          </div>
          <div className="epx-column-divider" />
          <div className="epx-current-columns">
            {visibleOrderedColumns.map(key => (
              <div
                key={key}
                data-column-key={key}
                className={`epx-column-item ${key === "name" ? "is-highlighted" : ""} ${draggedColumn === key ? "is-dragging" : ""}`}
                onPointerDown={event => startColumnDrag(event, key)}
                onDragStart={event => event.preventDefault()}
              >
                <img src="/assets/column-view/c1a46.svg" alt="" draggable={false} />
                <span>{labelFor(key)}</span>
                {key === "name" ? (
                  <img src="/assets/column-view/afd0e.svg" alt="Pinned" />
                ) : (
                  <button type="button" onClick={() => onToggleColumn(key)} aria-label={`Hide ${labelFor(key)}`}>
                    <img src="/assets/column-view/4332c.svg" alt="" />
                  </button>
                )}
              </div>
            ))}
          </div>
          {draggedColumn && dragGhost && createPortal(
            <div
              className="epx-column-drag-ghost"
              style={{ top: dragGhost.top, left: dragGhost.left, width: dragGhost.width }}
            >
              <img src="/assets/column-view/c1a46.svg" alt="" />
              <span>{labelFor(draggedColumn)}</span>
              <img src="/assets/column-view/4332c.svg" alt="" />
            </div>,
            document.body,
          )}
        </section>

        {groups.map(group => {
          const isCollapsed = collapsedGroups.includes(group.id);
          const visibleCount = group.columns.filter(key => isShown(key)).length;
          return (
            <section className="epx-column-section" key={group.id}>
              <button
                type="button"
                className="epx-column-group-heading"
                onClick={() => toggleGroup(group.id)}
                aria-expanded={!isCollapsed}
              >
                <span>{group.label}</span>
                <span className="epx-column-count">{visibleCount}</span>
                <img className={isCollapsed ? "is-collapsed" : ""} src="/assets/column-view/14681.svg" alt="" />
              </button>
              <div className="epx-column-divider" />
              {!isCollapsed && (
                <div className="epx-column-options">
                  {group.columns.map(key => {
                    const isVisible = isShown(key);
                    return (
                      <div className="epx-column-option" key={key}>
                        <span>{labelFor(key)}</span>
                        {key === "name" ? (
                          <img src="/assets/column-view/afd0e.svg" alt="Pinned" />
                        ) : (
                          <button
                            type="button"
                            onClick={() => onToggleColumn(key)}
                            aria-label={`${isVisible ? "Hide" : "Show"} ${labelFor(key)}`}
                          >
                            <img
                              src={isVisible
                                ? "/assets/column-view/4332c.svg"
                                : "/assets/column-view/4cc0d.svg"}
                              alt=""
                            />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </aside>
  );
}

function AddDeviceModal({ onClose, onAdd }: {
  onClose: () => void;
  onAdd: (input: NewMeterInput, notify?: boolean) => void;
}) {
  const [utility, setUtility] = useState("");
  const [meterName, setMeterName] = useState("");
  const [meterId, setMeterId] = useState("");
  const [source, setSource] = useState<"" | "NEM12" | "Captis" | "Watt Watchers">("NEM12");
  const [dataFormat, setDataFormat] = useState("");
  const [nmiNo, setNmiNo] = useState("");
  const [serialNo, setSerialNo] = useState("");
  const [validFrom, setValidFrom] = useState("");
  const [captisId, setCaptisId] = useState("");
  const [apiIdentifier, setApiIdentifier] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [multipleMeters, setMultipleMeters] = useState(false);
  const [internalOnly, setInternalOnly] = useState(false);
  const [utilityOpen, setUtilityOpen] = useState(false);
  const [apiParameterOpen, setApiParameterOpen] = useState(false);
  const [deviceIdOpen, setDeviceIdOpen] = useState(false);
  const [deviceIdQuery, setDeviceIdQuery] = useState("");
  const [confirmSave, setConfirmSave] = useState(false);
  const utilityRef = useRef<HTMLLabelElement>(null);
  const apiParameterRef = useRef<HTMLLabelElement>(null);
  const deviceIdRef = useRef<HTMLLabelElement>(null);
  const apiParameterOptions = ["Pulse1_Total", "Pulse2_Total"];
  const utilityOptions = source === "NEM12"
    ? ["Electricity", "Thermal"]
    : ["Electricity", "Gas", "Water", "Thermal", "Analog", "Digital"];
  const deviceIdOptions = Array.from({ length: 20 }, (_, index) => `PM-${String(index + 1).padStart(3, "0")}`);
  const visibleDeviceIds = deviceIdOptions.filter(id => id.includes(deviceIdQuery.trim()));

  useEffect(() => {
    if (!utilityOpen && !deviceIdOpen && !apiParameterOpen) return;
    function handle(event: PointerEvent) {
      const target = event.target as Node;
      if (utilityOpen && !utilityRef.current?.contains(target)) setUtilityOpen(false);
      if (apiParameterOpen && !apiParameterRef.current?.contains(target)) setApiParameterOpen(false);
      if (deviceIdOpen && !deviceIdRef.current?.contains(target)) {
        setDeviceIdOpen(false);
        setDeviceIdQuery("");
      }
    }
    document.addEventListener("pointerdown", handle);
    return () => document.removeEventListener("pointerdown", handle);
  }, [utilityOpen, deviceIdOpen, apiParameterOpen]);

  const detailsValid = Boolean(utility && meterName.trim() && meterId && validFrom);
  const sourceValid = source === "NEM12"
    ? Boolean(nmiNo.trim() && serialNo.trim())
    : source === "Captis"
      ? Boolean(captisId.trim() && apiIdentifier.trim())
      : false;
  const saveValid = detailsValid && sourceValid;
  const hasChanges = Boolean(
    utility || meterName || meterId || source !== "NEM12" || dataFormat || nmiNo || serialNo ||
    validFrom || captisId || apiIdentifier || contactName || contactEmail || supplierName ||
    contactPhone || multipleMeters || internalOnly || confirmSave
  );

  function processDateLabel() {
    if (!validFrom) return "DD-MM-YYYY";
    const [year, month, day] = validFrom.split("-");
    return `${day}-${month}-${year}`;
  }

  function submitDevice(notify = false) {
    onAdd({
      utility,
      name: meterName,
      meterId,
      source,
      dataFormat: source === "NEM12" ? "NEM12" : source === "Captis" ? "Captis API" : dataFormat,
      nmiNo: source === "NEM12" ? nmiNo : "—",
      serialNo: source === "NEM12" ? serialNo : "—",
      captisNumber: source === "Captis" ? captisId : "—",
      apiParameter: source === "Captis" ? apiIdentifier : "",
      contactName,
      contactEmail,
      contactPhone,
      supplierName,
      internalOnly,
    }, notify);
  }

  function handleSourceChange(next: "NEM12" | "Captis" | "Watt Watchers") {
    setSource(next);
    if (next === "NEM12" && !["Electricity", "Thermal"].includes(utility)) setUtility("");
    setDataFormat("");
    setNmiNo(""); setSerialNo(""); setValidFrom("");
    setCaptisId(""); setApiIdentifier("");
  }

  return (
    <div
      className="epx-add-device-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-device-title"
      onPointerDown={event => {
        if (event.target === event.currentTarget && !hasChanges) onClose();
      }}
    >
      <div className={`epx-add-device-dialog${confirmSave ? " is-confirm" : ""}`}>
        <div className="epx-add-device-header">
          <div>
            <div id="add-device-title">Add device</div>
            <p>Register a new device for this site</p>
          </div>
          <button type="button" onClick={confirmSave ? () => setConfirmSave(false) : onClose} aria-label="Close">
            <img src="/assets/add-device/7bf08.svg" alt="" />
          </button>
        </div>

        {confirmSave ? (
          <p className="epx-add-device-confirm">
            The device will be added to this site. Would you like to fetch and process data from <strong>{processDateLabel()}</strong>?
          </p>
        ) : (
        <div className="epx-add-device-content">
          <div className="epx-add-device-source">
            <span>Data source</span>
            <div>
              {(["NEM12", "Captis", "Watt Watchers"] as const).map(opt => (
                <button
                  type="button"
                  key={opt}
                  className={source === opt ? "is-active" : ""}
                  onClick={() => handleSourceChange(opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {source === "Watt Watchers" ? (
            <div className="epx-add-device-ww">
              <p>WW devices are managed in a separate system. To continue, you'll need to create the WW device there first</p>
              <button type="button">Go to WW Setup</button>
            </div>
          ) : (
            <>
              <section className="epx-add-device-step">
                <h3>Step 1 — Device info</h3>
                <div className="epx-add-device-step-body">
              <div className="epx-add-device-grid">
                <label className="epx-add-device-field" ref={utilityRef}>
                  <span>Utility</span>
                  <span className="epx-add-device-select">
                    <button
                      type="button"
                      className={utility ? "" : "is-placeholder"}
                      aria-expanded={utilityOpen}
                      aria-haspopup="listbox"
                      onClick={() => {
                        setDeviceIdOpen(false);
                        setApiParameterOpen(false);
                        setUtilityOpen(current => !current);
                      }}
                    >
                      {utility || "Select utility"}
                    </button>
                    <img src="/assets/add-device/988a8.svg" alt="" />
                  </span>
                  {utilityOpen && (
                    <div className="epx-add-device-menu" role="listbox">
                      {utilityOptions.map(option => (
                        <button
                          type="button"
                          key={option}
                          role="option"
                          aria-selected={utility === option}
                          onClick={() => {
                            setUtility(option);
                            setUtilityOpen(false);
                          }}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </label>
                <DateField label="Valid from" value={validFrom} onChange={setValidFrom} />
              </div>
              <div className="epx-add-device-grid">
                <label className="epx-add-device-field">
                  <span>Device Name</span>
                  <input
                    value={meterName}
                    onChange={e => setMeterName(e.target.value)}
                    placeholder="Input name"
                  />
                </label>
                <label className="epx-add-device-field" ref={deviceIdRef}>
                  <span>Edge Device ID</span>
                  <span className="epx-add-device-select">
                    <button
                      type="button"
                      className={meterId ? "" : "is-placeholder"}
                      aria-expanded={deviceIdOpen}
                      aria-haspopup="listbox"
                      onClick={() => {
                        setUtilityOpen(false);
                        setApiParameterOpen(false);
                        setDeviceIdOpen(current => !current);
                      }}
                    >
                      {meterId || "Select Device ID"}
                    </button>
                    <img src="/assets/add-device/988a8.svg" alt="" />
                  </span>
                  {deviceIdOpen && (
                    <div className="epx-device-id-menu" role="listbox">
                      <label className="epx-device-id-search">
                        <img src="/assets/device-management/bf431.svg" alt="" />
                        <input
                          value={deviceIdQuery}
                          onChange={event => setDeviceIdQuery(event.target.value)}
                          placeholder="Search number"
                          aria-label="Search number"
                        />
                      </label>
                      <div className="epx-device-id-options">
                        {visibleDeviceIds.map(id => (
                          <button
                            type="button"
                            key={id}
                            role="option"
                            aria-selected={meterId === id}
                            onClick={() => {
                              setMeterId(id);
                              setDeviceIdOpen(false);
                              setDeviceIdQuery("");
                            }}
                          >
                            {id}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </label>
              </div>
              {source === "NEM12" ? (
                <div className="epx-add-device-grid">
                  <label className="epx-add-device-field">
                    <span>NMI number</span>
                    <input
                      value={nmiNo}
                      onChange={e => setNmiNo(e.target.value.replace(/\D/g, "").slice(0, 11))}
                      inputMode="numeric"
                      placeholder="Enter no."
                    />
                  </label>
                  <label className="epx-add-device-field">
                    <span>Serial number</span>
                    <input
                      value={serialNo}
                      onChange={e => setSerialNo(e.target.value.replace(/\D/g, "").slice(0, 12))}
                      inputMode="numeric"
                      placeholder="Enter no."
                    />
                  </label>
                </div>
              ) : (
                <div className="epx-add-device-grid">
                  <label className="epx-add-device-field">
                    <span>Captis device ID</span>
                    <input value={captisId} onChange={e => setCaptisId(e.target.value)} placeholder="Enter no." />
                  </label>
                  <label className="epx-add-device-field" ref={apiParameterRef}>
                    <span>API parameter</span>
                    <span className="epx-add-device-select">
                      <button
                        type="button"
                        className={apiIdentifier ? "" : "is-placeholder"}
                        aria-expanded={apiParameterOpen}
                        aria-haspopup="listbox"
                        onClick={() => {
                          setUtilityOpen(false);
                          setDeviceIdOpen(false);
                          setApiParameterOpen(current => !current);
                        }}
                      >
                        {apiIdentifier || "Select parameter"}
                      </button>
                      <img src="/assets/add-device/988a8.svg" alt="" />
                    </span>
                    {apiParameterOpen && (
                      <div className="epx-add-device-menu" role="listbox">
                        {apiParameterOptions.map(option => (
                          <button
                            type="button"
                            key={option}
                            role="option"
                            aria-selected={apiIdentifier === option}
                            onClick={() => {
                              setApiIdentifier(option);
                              setApiParameterOpen(false);
                            }}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    )}
                  </label>
                </div>
              )}
              <label className="epx-add-device-check">
                <input
                  type="checkbox"
                  checked={multipleMeters}
                  onChange={event => setMultipleMeters(event.target.checked)}
                />
                Multiple meters with same NMI and same serial number
              </label>
              <label className="epx-add-device-check">
                <input
                  type="checkbox"
                  checked={internalOnly}
                  onChange={event => setInternalOnly(event.target.checked)}
                />
                Visible to internal users only
              </label>
                </div>
              </section>
              <section className="epx-add-device-step">
                <h3>Step 2 — Supplier contact</h3>
                <div className="epx-add-device-step-body">
                <div className="epx-add-device-grid">
                  <label className="epx-add-device-field">
                    <span>Contact name</span>
                    <input
                      value={contactName}
                      onChange={event => setContactName(event.target.value)}
                      placeholder="Enter name"
                    />
                  </label>
                  <label className="epx-add-device-field">
                    <span>Email</span>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={event => setContactEmail(event.target.value)}
                      placeholder="Enter email"
                    />
                  </label>
                </div>
                <div className="epx-add-device-grid">
                  <label className="epx-add-device-field">
                    <span>Supplier</span>
                    <input
                      value={supplierName}
                      onChange={event => setSupplierName(event.target.value)}
                      placeholder="Enter supplier"
                    />
                  </label>
                  <label className="epx-add-device-field">
                    <span>Phone</span>
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={event => setContactPhone(event.target.value)}
                      placeholder="Enter phone"
                    />
                  </label>
                </div>
                </div>
              </section>
            </>
          )}
        </div>
        )}

        {confirmSave ? (
          <div className="epx-add-device-footer">
            <button type="button" onClick={() => submitDevice(true)}>
              Save without process
            </button>
            <button type="button" className="is-primary" onClick={() => submitDevice(false)}>
              Save & process
            </button>
          </div>
        ) : source !== "Watt Watchers" && (
          <div className="epx-add-device-footer">
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              disabled={!saveValid}
              onClick={() => setConfirmSave(true)}
              className="is-primary"
            >
              Save
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function SourceConfiguration({
  source,
  onSourceChange,
  dataFormat,
  onDataFormatChange,
  nmiNo,
  onNmiChange,
  serialNo,
  onSerialChange,
  validFrom,
  onValidFromChange,
  captisId,
  onCaptisChange,
  apiIdentifier,
  onApiChange,
}: {
  source: string;
  onSourceChange: (value: string) => void;
  dataFormat: string;
  onDataFormatChange: (value: string) => void;
  nmiNo: string;
  onNmiChange: (value: string) => void;
  serialNo: string;
  onSerialChange: (value: string) => void;
  validFrom: string;
  onValidFromChange: (value: string) => void;
  captisId: string;
  onCaptisChange: (value: string) => void;
  apiIdentifier: string;
  onApiChange: (value: string) => void;
}) {
  return (
    <section className="border border-black bg-white">
      <div className="border-b border-black px-4 py-3 text-sm font-bold">Select Data Source</div>
      <div className="grid grid-cols-2 gap-2 p-4">
        {["NEM12", "Captis", "Watt Watchers"].map(option => (
          <label
            key={option}
            className={`flex cursor-pointer items-center gap-2 border px-3 py-2.5 text-xs ${source === option ? "border-black bg-black text-white" : "border-gray-400 hover:border-black"}`}
          >
            <input
              type="radio"
              name="data-source"
              checked={source === option}
              onChange={() => {
                onSourceChange(option);
                onDataFormatChange("");
              }}
              className="accent-black"
            />
            {option}
          </label>
        ))}
      </div>

      {source && (
        <div className="border-t border-black p-4">
          <ModalField label="Data Format">
            <select
              value={dataFormat}
              onChange={event => onDataFormatChange(event.target.value)}
              className="w-full border border-black bg-white px-3 py-2 text-sm outline-none"
            >
              <option value="">Select data format</option>
              <option>NEM12</option>
              <option>CSV</option>
              <option>JSON</option>
              <option>XML</option>
            </select>
          </ModalField>
        </div>
      )}

      {source === "NEM12" && (
        <div className="grid gap-4 border-t border-black bg-gray-50 p-4 md:grid-cols-3">
          <ModalField label="NMI Number">
            <input value={nmiNo} onChange={event => onNmiChange(event.target.value)} className="w-full border border-black bg-white px-3 py-2 text-sm outline-none" />
          </ModalField>
          <ModalField label="Serial Number">
            <input value={serialNo} onChange={event => onSerialChange(event.target.value)} className="w-full border border-black bg-white px-3 py-2 text-sm outline-none" />
          </ModalField>
          <DateField label="Valid From" value={validFrom} onChange={onValidFromChange} />
        </div>
      )}

      {source === "Captis" && (
        <div className="grid gap-4 border-t border-black bg-gray-50 p-4 md:grid-cols-2">
          <ModalField label="Captis Device ID">
            <input value={captisId} onChange={event => onCaptisChange(event.target.value)} className="w-full border border-black bg-white px-3 py-2 text-sm outline-none" />
          </ModalField>
          <ModalField label="API Identifier">
            <input value={apiIdentifier} onChange={event => onApiChange(event.target.value)} className="w-full border border-black bg-white px-3 py-2 text-sm outline-none" />
          </ModalField>
        </div>
      )}
    </section>
  );
}

function ModalField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-bold">{label}</span>
      {children}
    </label>
  );
}

function DataReupload({ meters, requestView, onRequestViewChange }: {
  meters: Meter[];
  requestView: "new" | "history";
  onRequestViewChange: (view: "new" | "history") => void;
}) {
  const [entryMode, setEntryMode] = useState<"" | "mdp" | "site">("site");
  const [provider, setProvider] = useState("");
  const [selectedSites, setSelectedSites] = useState<string[]>([]);
  const [selectedMeters, setSelectedMeters] = useState<number[]>([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [method, setMethod] = useState<"automatic" | "manual">("automatic");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [openMenu, setOpenMenu] = useState<null | "mdp" | "status" | "file" | "pageSize">(null);
  const [mdpFilter, setMdpFilter] = useState<string[]>(["Intellihub", "Energy Australia"]);
  const [statusFilter, setStatusFilter] = useState<string[]>(["File uploaded", "Connecting data", "Processing data", "Available in Edge", "Error"]);
  const [fileFilter, setFileFilter] = useState<string[]>(["Has attachment", "No attachment"]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(13);
  const [deviceSort, setDeviceSort] = useState<{ key: "site" | "edgeId" | "nmi" | "serial"; direction: 1 | -1 } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!openMenu) return;
    function handle(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setOpenMenu(null);
    }
    document.addEventListener("pointerdown", handle);
    return () => document.removeEventListener("pointerdown", handle);
  }, [openMenu]);

  const SITES = ["Sydney Hospital", "Royal Prince Alfred Hospital", "Westmead Hospital", "Liverpool Hospital", "Blacktown Hospital"];
  const makeRequestDevices = (start: number, count: number) => Array.from({ length: count }, (_, index) => {
    const sequence = start + index;
    return {
      portfolio: "NSW Health",
      site: SITES[index % SITES.length],
      edgeId: `EDGE-${String(2047 + sequence).padStart(4, "0")}`,
      nmi: `NMI630${String(100000 + sequence).padStart(6, "0")}`,
      serial: String(770240520000 + sequence),
    };
  });
  const requestHistory = [
    {
      id: "DR-2031",
      submitted: "1 Oct 2026",
      provider: "Intellihub",
      sites: ["Sydney Hospital"],
      devices: [
        ["EDGE-2048", "NMI630100001", "770240520001"],
        ["EDGE-2049", "NMI630100002", "770240520002"],
        ["EDGE-2064", "NMI630100003", "770240520003"],
        ["EDGE-2065", "NMI630100004", "770240520004"],
      ].map(([edgeId, nmi, serial]) => ({ portfolio: "NSW Health", site: "Sydney Hospital", edgeId, nmi, serial })),
      deviceText: "EDGE-2048, EDGE-2049",
      deviceExtra: 2,
      dateRange: "15 Sep 2026 - 31 Sep 2026",
      status: "File uploaded",
      statusLabel: "File uploaded (Step 1 of 3)",
      hasFile: false,
    },
    {
      id: "DR-2030",
      submitted: "30 Sep 2026",
      provider: "Intellihub",
      sites: ["Westmead Hospital"],
      devices: makeRequestDevices(5, 1).map(device => ({ ...device, site: "Westmead Hospital", edgeId: "EDGE-2052" })),
      deviceText: "EDGE-2052",
      deviceExtra: 0,
      dateRange: "07 Sep 2026 - 18 Sep 2026",
      status: "Connecting data",
      statusLabel: "Connecting data (Step 2 of 3)",
      hasFile: false,
    },
    {
      id: "DR-2029",
      submitted: "29 Sep 2026",
      provider: "Energy Australia",
      sites: ["Sydney Hospital", "Westmead Hospital", "Liverpool Hospital", "Blacktown Hospital", "Royal Prince Alfred Hospital", "North Shore Hospital"],
      devices: makeRequestDevices(17, 24),
      deviceText: "24 devices across 6 sites",
      deviceExtra: 0,
      dateRange: "18 Sep 2026 - 27 Sep 2026",
      status: "Processing data",
      statusLabel: "Processing data (Step 3 of 3)",
      hasFile: true,
    },
    {
      id: "DR-2028",
      submitted: "27 Sep 2026",
      provider: "Intellihub",
      sites: ["Sydney Hospital"],
      devices: makeRequestDevices(41, 1).map(device => ({ ...device, edgeId: "EDGE-2048" })),
      deviceText: "EDGE-2048",
      deviceExtra: 0,
      dateRange: "07 Sep 2026 - 08 Sep 2026",
      status: "Failed",
      statusLabel: "Failed",
      hasFile: false,
    },
    {
      id: "DR-2027",
      submitted: "25 Sep 2026",
      provider: "Intellihub",
      sites: ["North Shore Hospital", "Sydney Hospital", "Westmead Hospital", "Liverpool Hospital"],
      devices: makeRequestDevices(42, 14),
      deviceText: "14 devices across 6 sites",
      deviceExtra: 0,
      dateRange: "03 Sep 2026 - 08 Sep 2026",
      status: "Available in Edge",
      statusLabel: "Available in Edge",
      hasFile: true,
    },
    {
      id: "DR-2026",
      submitted: "16 Aug 2026",
      provider: "Intellihub",
      sites: ["Westmead Hospital"],
      devices: makeRequestDevices(56, 3).map((device, index) => ({ ...device, site: "Westmead Hospital", edgeId: `EDGE-${2048 + index}` })),
      deviceText: "EDGE-2048",
      deviceExtra: 2,
      dateRange: "14 Aug 2026 - 16 Aug 2026",
      status: "Available in Edge",
      statusLabel: "Available in Edge",
      hasFile: true,
    },
    {
      id: "DR-2025",
      submitted: "12 Aug 2026",
      provider: "Energy Australia",
      sites: ["Royal Prince Alfred Hospital"],
      devices: makeRequestDevices(59, 2).map(device => ({ ...device, site: "Royal Prince Alfred Hospital" })),
      deviceText: "EDGE-2106",
      deviceExtra: 1,
      dateRange: "01 Aug 2026 - 10 Aug 2026",
      status: "Available in Edge",
      statusLabel: "Available in Edge",
      hasFile: true,
    },
    {
      id: "DR-2024",
      submitted: "8 Aug 2026",
      provider: "Intellihub",
      sites: ["Liverpool Hospital", "Blacktown Hospital"],
      devices: makeRequestDevices(61, 7),
      deviceText: "7 devices across 2 sites",
      deviceExtra: 0,
      dateRange: "20 Jul 2026 - 31 Jul 2026",
      status: "Processing data",
      statusLabel: "Processing data (Step 3 of 3)",
      hasFile: true,
    },
    {
      id: "DR-2023",
      submitted: "3 Aug 2026",
      provider: "Energy Australia",
      sites: ["Sydney Hospital"],
      devices: makeRequestDevices(68, 1).map(device => ({ ...device, site: "Sydney Hospital" })),
      deviceText: "EDGE-2115",
      deviceExtra: 0,
      dateRange: "14 Jul 2026 - 28 Jul 2026",
      status: "Failed",
      statusLabel: "Failed",
      hasFile: false,
    },
    {
      id: "DR-2022",
      submitted: "28 Jul 2026",
      provider: "Intellihub",
      sites: ["Westmead Hospital"],
      devices: makeRequestDevices(69, 3).map(device => ({ ...device, site: "Westmead Hospital" })),
      deviceText: "EDGE-2116",
      deviceExtra: 2,
      dateRange: "01 Jul 2026 - 14 Jul 2026",
      status: "Connecting data",
      statusLabel: "Connecting data (Step 2 of 3)",
      hasFile: false,
    },
    {
      id: "DR-2021",
      submitted: "21 Jul 2026",
      provider: "Energy Australia",
      sites: ["Sydney Hospital", "Royal Prince Alfred Hospital", "Westmead Hospital"],
      devices: makeRequestDevices(72, 11),
      deviceText: "11 devices across 3 sites",
      deviceExtra: 0,
      dateRange: "15 Jun 2026 - 30 Jun 2026",
      status: "File uploaded",
      statusLabel: "File uploaded (Step 1 of 3)",
      hasFile: true,
    },
    {
      id: "DR-2020",
      submitted: "14 Jul 2026",
      provider: "Intellihub",
      sites: ["Blacktown Hospital"],
      devices: makeRequestDevices(83, 4).map(device => ({ ...device, site: "Blacktown Hospital" })),
      deviceText: "EDGE-2130",
      deviceExtra: 3,
      dateRange: "01 Jun 2026 - 15 Jun 2026",
      status: "Available in Edge",
      statusLabel: "Available in Edge",
      hasFile: true,
    },
    {
      id: "DR-2019",
      submitted: "7 Jul 2026",
      provider: "Energy Australia",
      sites: ["Liverpool Hospital"],
      devices: makeRequestDevices(87, 2).map(device => ({ ...device, site: "Liverpool Hospital" })),
      deviceText: "EDGE-2134",
      deviceExtra: 1,
      dateRange: "16 May 2026 - 31 May 2026",
      status: "Available in Edge",
      statusLabel: "Available in Edge",
      hasFile: true,
    },
  ];
  const statusKey = (status: string) => status === "Failed" ? "Error" : status;
  const filteredRequests = requestHistory.filter(request => {
    const haystack = [request.id, request.provider, request.deviceText, ...request.sites, ...request.devices.flatMap(device => Object.values(device))].join(" ").toLowerCase();
    const fileKey = request.hasFile ? "Has attachment" : "No attachment";
    return haystack.includes(query.trim().toLowerCase())
      && mdpFilter.includes(request.provider)
      && statusFilter.includes(statusKey(request.status))
      && fileFilter.includes(fileKey);
  });
  const pageCount = Math.max(1, Math.ceil(filteredRequests.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visibleRequests = filteredRequests.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  function toggleFilter(current: string[], option: string, all: string[], update: (next: string[]) => void) {
    if (option === "all") {
      update(current.length === all.length ? [] : all);
      return;
    }
    update(current.includes(option) ? current.filter(item => item !== option) : [...current, option]);
    setPage(1);
  }
  const selectedRequest = requestHistory.find(request => request.id === selectedRequestId) ?? null;
  const selectionReady = entryMode === "mdp" ? Boolean(provider) : entryMode === "site" && selectedSites.length > 0;
  const meterGroups = entryMode === "mdp"
    ? SITES.slice(0, Math.min(3, meters.length)).map((site, siteIndex) => ({
        site,
        meters: meters.filter((_, meterIndex) => meterIndex % 3 === siteIndex),
      }))
    : [{
        site: selectedSites[0] ?? "",
        meters,
      }];
  const allMdpSitesSelected = entryMode === "mdp" && meterGroups.every(group => selectedSites.includes(group.site));
  const allSiteDevicesSelected = entryMode === "site" && meters.every(meter => selectedMeters.includes(meter.id));
  const step1Complete = selectionReady && selectedMeters.length > 0;
  const step2Valid = Boolean(fromDate) && Boolean(toDate);
  const requestDirty = Boolean(
    provider || selectedSites.length || selectedMeters.length || fromDate || toDate ||
    method !== "automatic" || uploadFile
  );

  function toggleMeter(id: number) {
    setSelectedMeters(current => current.includes(id) ? current.filter(meterId => meterId !== id) : [...current, id]);
  }

  function toggleSiteGroup(group: { site: string; meters: Meter[] }) {
    const siteMeterIds = group.meters.map(meter => meter.id);
    if (selectedSites.includes(group.site)) {
      setSelectedSites(current => current.filter(site => site !== group.site));
      setSelectedMeters(current => current.filter(id => !siteMeterIds.includes(id)));
    } else {
      setSelectedSites(current => [...current, group.site]);
      setSelectedMeters(current => Array.from(new Set([...current, ...siteMeterIds])));
    }
  }

  function toggleAllMdpSites() {
    if (allMdpSitesSelected) {
      setSelectedSites([]);
      setSelectedMeters([]);
    } else {
      setSelectedSites(meterGroups.map(group => group.site));
      setSelectedMeters(meters.map(meter => meter.id));
    }
  }

  function cancelRequest() {
    setEntryMode("site");
    setProvider("");
    setSelectedSites([]);
    setSelectedMeters([]);
    setFromDate("");
    setToDate("");
    setMethod("automatic");
    setUploadFile(null);
    setSubmitted(false);
  }

  return (
    <div className="epx-reupload">
          <div className="epx-reupload-body" ref={menuRef}>
            <label className="epx-reupload-search">
              <img src="/assets/device-management/bf431.svg" alt="" />
              <input
                type="search"
                value={query}
                onChange={event => { setQuery(event.target.value); setPage(1); }}
                placeholder="Search request ID, device IDs, site..."
              />
            </label>
            <section className="epx-request-card">
              <div className="epx-request-caption">Request history</div>
              <div className="epx-request-scroll">
                <table className="epx-request-table">
                  <thead>
                    <tr>
                      <th>Request ID</th>
                      <th>Submitted</th>
                      <th className="is-menu">
                        <button type="button" onClick={() => setOpenMenu(open => open === "mdp" ? null : "mdp")}>MDP <img src="/assets/reupload/chevron.svg" alt="" /></button>
                        {openMenu === "mdp" && <FilterChoices label="MDP" options={["Intellihub", "Energy Australia"]} selected={mdpFilter} onToggle={option => toggleFilter(mdpFilter, option, ["Intellihub", "Energy Australia"], setMdpFilter)} />}
                      </th>
                      <th>Site count</th>
                      <th>Devices</th>
                      <th>Date range</th>
                      <th className="is-menu">
                        <button type="button" onClick={() => setOpenMenu(open => open === "status" ? null : "status")}>Status <img src="/assets/reupload/chevron.svg" alt="" /></button>
                        {openMenu === "status" && <FilterChoices label="Status" options={["File uploaded", "Connecting data", "Processing data", "Available in Edge", "Error"]} selected={statusFilter} onToggle={option => toggleFilter(statusFilter, option, ["File uploaded", "Connecting data", "Processing data", "Available in Edge", "Error"], setStatusFilter)} />}
                      </th>
                      <th className="is-menu">
                        <button type="button" onClick={() => setOpenMenu(open => open === "file" ? null : "file")}>File <img src="/assets/reupload/chevron.svg" alt="" /></button>
                        {openMenu === "file" && <FilterChoices label="File" options={["Has attachment", "No attachment"]} selected={fileFilter} onToggle={option => toggleFilter(fileFilter, option, ["Has attachment", "No attachment"], setFileFilter)} />}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleRequests.map(request => (
                      <tr key={request.id}>
                        <td>{request.id}</td>
                        <td>{request.submitted}</td>
                        <td>{request.provider}</td>
                        <td>
                          <span>{request.sites[0]}</span>
                          {request.sites.length > 1 && (
                            <button type="button" className="epx-count-link" onClick={() => setSelectedRequestId(request.id)}>+{request.sites.length - 1} more</button>
                          )}
                        </td>
                        <td>
                          {request.deviceText.includes("across") ? (
                            <button type="button" className="epx-device-summary" onClick={() => setSelectedRequestId(request.id)}>{request.deviceText}</button>
                          ) : (
                            <span>{request.deviceText}</span>
                          )}
                          {request.deviceExtra > 0 && (
                            <button type="button" className="epx-count-link" onClick={() => setSelectedRequestId(request.id)}>+{request.deviceExtra} more</button>
                          )}
                        </td>
                        <td>{request.dateRange}</td>
                        <td>
                          <span className={`epx-request-status${request.status === "Failed" ? " is-failed" : request.status === "Available in Edge" ? " is-ready" : ""}`}>
                            {request.status === "Failed" && <img src="/assets/reupload/error.svg" alt="" />}
                            {request.status === "Available in Edge" && <img src="/assets/reupload/check.svg" alt="" />}
                            {request.statusLabel}
                          </span>
                        </td>
                        <td>{request.hasFile && <img src="/assets/reupload/attach.svg" alt="Attachment" />}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="epx-request-footer">
                <div className="epx-results-per-page epx-page-size">
                  <button type="button" onClick={() => setOpenMenu(open => open === "pageSize" ? null : "pageSize")}>
                    {pageSize}
                    <img src="/assets/device-management/3c143.svg" alt="" />
                  </button>
                  {openMenu === "pageSize" && (
                    <div className="epx-filter-menu is-compact">
                      {[13, 26, 52].map(size => (
                        <button key={size} type="button" onClick={() => { setPageSize(size); setPage(1); setOpenMenu(null); }}>{size}</button>
                      ))}
                    </div>
                  )}
                  <span>Results per page</span>
                </div>
                <div className="epx-pager">
                  <button type="button" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)} aria-label="Previous page">
                    <img src="/assets/reupload/prev.svg" alt="" />
                  </button>
                  {Array.from({ length: pageCount }, (_, index) => index + 1).map(number => (
                    <button key={number} type="button" className={number === currentPage ? "is-current" : ""} onClick={() => setPage(number)}>{number}</button>
                  ))}
                  <button type="button" className="is-next" disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)} aria-label="Next page">
                    <img src="/assets/reupload/next.svg" alt="" />
                  </button>
                </div>
              </div>
            </section>
          </div>
        {requestView === "new" && (
          <div
            className="epx-new-request-backdrop"
            role="presentation"
            onClick={event => {
              if (event.target === event.currentTarget && (!requestDirty || submitted)) {
                cancelRequest();
                onRequestViewChange("history");
              }
            }}
          >
            <div className="epx-new-request" role="dialog" aria-modal="true" aria-labelledby="new-request-title" onClick={event => event.stopPropagation()}>
              <div className="epx-new-request-header">
                <div>
                  <div id="new-request-title">New request</div>
                  <p>Reprocess NEM12 data for selected device</p>
                </div>
                <button type="button" onClick={() => { cancelRequest(); onRequestViewChange("history"); }} aria-label="Close">
                  <img src="/assets/reupload/close.svg" alt="" />
                </button>
              </div>
              {submitted ? (
                <div className="epx-new-request-feedback">
                  <div>
                    <img src="/assets/reupload/check-circle.svg" alt="" />
                    <strong>Re-upload request submitted</strong>
                  </div>
                  <p>Request ID: <b>DR-2031</b></p>
                  <p>Data will be processed in the background, you can monitor its progress on the main page. We will email you when processing is complete.</p>
                </div>
              ) : (
                <>
                  <div className="epx-new-request-body">
                    <section>
                      <h3>Step 1 — How would you like to start?</h3>
                      <div className="epx-new-request-row">
                        <label>
                          <span>Find by</span>
                          <div className="epx-mode-toggle">
                            <button type="button" className={entryMode === "site" ? "is-on" : ""} onClick={() => { setEntryMode("site"); setProvider(""); setSelectedSites([]); setSelectedMeters([]); }}>Site</button>
                            <button type="button" className={entryMode === "mdp" ? "is-on" : ""} onClick={() => { setEntryMode("mdp"); setProvider(""); setSelectedSites([]); setSelectedMeters([]); }}>MDP</button>
                          </div>
                        </label>
                        {entryMode === "mdp" ? (
                          <SettingSelect
                            label="MDP"
                            value={provider}
                            placeholder="Select provider"
                            options={["Intellihub", "Energy Australia", "Essential Energy"]}
                            onChange={next => {
                              setProvider(next);
                              setSelectedSites(SITES.slice(0, Math.min(3, meters.length)));
                              setSelectedMeters(meters.map(meter => meter.id));
                            }}
                          />
                        ) : (
                          <SettingSelect
                            label="Site"
                            value={selectedSites[0] ?? ""}
                            placeholder="Select site"
                            options={SITES}
                            onChange={site => {
                              setSelectedSites([site]);
                              setSelectedMeters(meters.map(meter => meter.id));
                            }}
                          />
                        )}
                      </div>
                    </section>
                    <section>
                      <h3>Step 2 — {entryMode === "mdp" ? "Confirm included sites" : "Select devices"}</h3>
                      {selectionReady ? (
                        <div className="epx-new-request-step">
                          <div className="epx-new-request-device-card">
                            <div className="epx-new-request-device-head">
                              <label>
                                <input type="checkbox" checked={entryMode === "mdp" ? allMdpSitesSelected : allSiteDevicesSelected} onChange={() => entryMode === "mdp" ? toggleAllMdpSites() : setSelectedMeters(allSiteDevicesSelected ? [] : meters.map(meter => meter.id))} />
                                {entryMode === "mdp" ? "All sites" : "All devices"}
                              </label>
                              <span>{entryMode === "mdp" ? "Sites" : (provider || "Intellihub")}</span>
                            </div>
                            {entryMode === "mdp" ? meterGroups.map(group => (
                              <label key={group.site} className="epx-new-request-device">
                                <span><input type="checkbox" checked={selectedSites.includes(group.site)} onChange={() => toggleSiteGroup(group)} />{group.site}</span>
                                <small>{group.meters.length} devices</small>
                              </label>
                            )) : meters.map(meter => (
                              <label key={meter.id} className="epx-new-request-device">
                                <span><input type="checkbox" checked={selectedMeters.includes(meter.id)} onChange={() => toggleMeter(meter.id)} />{meter.name}</span>
                                <small>{formatEdgeId(meter.edgeId)}</small>
                              </label>
                            ))}
                          </div>
                          <p>Included: {entryMode === "mdp" ? `${selectedSites.length} sites · ` : ""}{selectedMeters.length} devices</p>
                        </div>
                      ) : (
                        <div className="epx-new-request-empty">Complete Step 1 to configure included sites and devices.</div>
                      )}
                    </section>
                    <section>
                      <h3>Step 3 — Date range</h3>
                      <DateRangeField className="epx-new-request-dates" from={fromDate} to={toDate} disabled={!step1Complete} onFromChange={setFromDate} onToChange={setToDate} />
                    </section>
                    <div className="epx-new-request-manual">
                      <label>
                        <input type="checkbox" checked={method === "manual"} disabled={!step1Complete} onChange={event => { setMethod(event.target.checked ? "manual" : "automatic"); if (!event.target.checked) setUploadFile(null); }} />
                        <span>
                          <strong>Upload a NEM12 file manually</strong>
                          <small>Use this fallback when automatic historical retrieval is unavailable.</small>
                        </span>
                      </label>
                      {method === "manual" && !uploadFile && (
                        <label
                          className="epx-upload-drop"
                          onDragOver={event => event.preventDefault()}
                          onDrop={event => {
                            event.preventDefault();
                            setUploadFile(event.dataTransfer.files?.[0] ?? null);
                          }}
                        >
                          <input type="file" accept=".csv,.nem12,.txt,.pdf,.svg,.png,.jpg,.jpeg,.gif" onChange={event => setUploadFile(event.target.files?.[0] ?? null)} />
                          <span className="epx-upload-mark" aria-hidden="true" />
                          <span><strong>Click to upload</strong> or drag and drop files here.</span>
                          <small>SVG, PNG, JPG or GIF (max. 800x400px)</small>
                        </label>
                      )}
                      {method === "manual" && uploadFile && (
                        <div className="epx-upload-file">
                          <img src="/assets/reupload/pdf.svg" alt="" />
                          <span>
                            <strong>{uploadFile.name.replace(/\.[^.]+$/, "")}</strong>
                            <small>{formatUploadSize(uploadFile.size)}</small>
                          </span>
                          <button type="button" aria-label="Download file" onClick={() => downloadUpload(uploadFile)}>
                            <img src="/assets/reupload/download.svg" alt="" />
                          </button>
                          <button type="button" aria-label="Remove file" onClick={() => setUploadFile(null)}>
                            <img src="/assets/reupload/trash.svg" alt="" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="epx-new-request-footer">
                    <button type="button" onClick={() => { cancelRequest(); onRequestViewChange("history"); }}>Cancel</button>
                    <button type="button" className="is-start" disabled={!step1Complete || !step2Valid || (method === "manual" && !uploadFile)} onClick={() => setSubmitted(true)}>Start re-upload</button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
        {selectedRequest && (
          <div className="epx-devices-overlay" role="presentation" onClick={() => setSelectedRequestId(null)}>
            <div className="epx-devices-dialog" role="dialog" aria-modal="true" aria-labelledby="request-devices-title" onClick={event => event.stopPropagation()}>
              <div className="epx-devices-header">
                <div>
                  <div id="request-devices-title">Devices in {selectedRequest.id}</div>
                  <p>{selectedRequest.devices.length} devices across {new Set(selectedRequest.devices.map(device => device.site)).size} site(s)</p>
                </div>
                <button type="button" onClick={() => setSelectedRequestId(null)} aria-label="Close">
                  <img src="/assets/reupload/close.svg" alt="" />
                </button>
              </div>
              <div className="epx-devices-table">
                <table>
                  <thead>
                    <tr>
                      <th>Portfolio</th>
                      {(["site", "edgeId", "nmi", "serial"] as const).map(key => (
                        <th key={key}>
                          <button type="button" onClick={() => setDeviceSort(current => current?.key === key ? { key, direction: current.direction === 1 ? -1 : 1 } : { key, direction: 1 })}>
                            {key === "site" ? "Site" : key === "edgeId" ? "Devices" : key === "nmi" ? "NMI #" : "Serial #"}
                            <img src="/assets/reupload/chevron.svg" alt="" />
                          </button>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...selectedRequest.devices].sort((a, b) => deviceSort ? a[deviceSort.key].localeCompare(b[deviceSort.key]) * deviceSort.direction : 0).map(device => (
                      <tr key={`${device.edgeId}-${device.serial}`}>
                        <td>{device.portfolio}</td>
                        <td>{device.site}</td>
                        <td>{device.edgeId}</td>
                        <td>{device.nmi}</td>
                        <td>{device.serial}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}

function FilterChoices({ label, options, selected, onToggle }: {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (option: string) => void;
}) {
  const allOn = selected.length === options.length;
  return (
    <div className="epx-filter-menu" role="menu" aria-label={label}>
      <div>Filter</div>
      <button type="button" onClick={() => onToggle("all")}>
        <span className={allOn ? "epx-filter-box is-on" : "epx-filter-box"}>{allOn && <img src="/assets/reupload/tick.svg" alt="" />}</span>
        Select all
      </button>
      {options.map(option => {
        const on = selected.includes(option);
        return (
          <button key={option} type="button" onClick={() => onToggle(option)}>
            <span className={on ? "epx-filter-box is-on" : "epx-filter-box"}>{on && <img src="/assets/reupload/tick.svg" alt="" />}</span>
            {option}
          </button>
        );
      })}
    </div>
  );
}


function ReuploadField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-bold">{label}</span>
      {children}
    </label>
  );
}

function Sidebar({ activePage, onNavigate, onOpenRequestHistory }: {
  activePage: Page;
  onNavigate: (page: Page) => void;
  onOpenRequestHistory: () => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [dataMenuOpen, setDataMenuOpen] = useState(false);
  const dataMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!dataMenuOpen) return;
    function handle(event: PointerEvent) {
      if (!dataMenuRef.current?.contains(event.target as Node)) setDataMenuOpen(false);
    }
    document.addEventListener("pointerdown", handle);
    return () => document.removeEventListener("pointerdown", handle);
  }, [dataMenuOpen]);
  useEffect(() => {
    if (!notificationsOpen) return;
    function handle(event: PointerEvent) {
      if (!notificationsRef.current?.contains(event.target as Node)) setNotificationsOpen(false);
    }
    document.addEventListener("pointerdown", handle);
    return () => document.removeEventListener("pointerdown", handle);
  }, [notificationsOpen]);
  return (
    <aside className={`epx-sidebar flex flex-shrink-0 flex-col${collapsed ? " is-collapsed" : ""}`}>
      <div className="epx-brand">
        <img src={collapsed ? "/assets/epx-mark.png" : "/assets/9d714.png"} alt="epx" className="epx-logo" />
      </div>

      <div className="epx-site-switcher">
        <div className="epx-site-card">
          <div className="flex items-center gap-3">
            <img src="/assets/device-management/504fb.svg" alt="" />
            <div className="min-w-0">
              <div className="epx-site-name">DWS</div>
              <div className="epx-site-location">100 Crescent Tower</div>
            </div>
          </div>
        </div>
      </div>

      <nav className="epx-nav flex flex-col" aria-label="Primary navigation">
        <div className="epx-nav-label">Portfolio</div>
        <button type="button" aria-label="Portfolio view">
          <img src="/assets/device-management/e89d0.svg" alt="" />
          <span className="epx-nav-text">Portfolio view</span>
        </button>
        <button type="button" aria-label="Portfolio management">
          <img src="/assets/device-management/3f3e0.svg" alt="" />
          <span className="epx-nav-text">Portfolio management</span>
          <span className="epx-nav-badge">12</span>
        </button>

        <div className="epx-nav-label">Site</div>
        <button type="button" aria-label="Monthly records">
          <img src="/assets/device-management/a4560.svg" alt="" />
          <span className="epx-nav-text">Monthly records</span>
        </button>
        <button
          type="button"
          aria-label="Device management"
          onClick={() => onNavigate("devices")}
          className={activePage === "devices" ? "is-active" : ""}
          aria-current={activePage === "devices" ? "page" : undefined}
        >
          <img src="/assets/device-management/eb1ac.svg" alt="" />
          <span className="epx-nav-text">Device management</span>
        </button>

        <div className="epx-nav-label">Operations</div>
        <div className="epx-data-menu" ref={dataMenuRef}>
          <button
            type="button"
            aria-label="Data management"
            aria-expanded={dataMenuOpen}
            className={dataMenuOpen || activePage === "reupload" ? "is-active" : ""}
            onClick={() => setDataMenuOpen(open => !open)}
          >
            <img src="/assets/device-management/e28cc.svg" alt="" />
            <span className="epx-nav-text">Data management</span>
            <img className="epx-nav-chevron" src="/assets/device-management/a23c4.svg" alt="" />
          </button>
          {dataMenuOpen && (
            <div className="epx-data-submenu" role="menu">
              <span>Incident issue log (Out of scope)</span>
              <button
                type="button"
                role="menuitem"
                aria-current={activePage === "reupload" ? "page" : undefined}
                onClick={() => {
                  onNavigate("reupload");
                  setDataMenuOpen(false);
                }}
              >
                NEM12 Data reupload
              </button>
              <span>Data ingestion log (Out of scope)</span>
            </div>
          )}
        </div>
      </nav>

      <div className="epx-sidebar-footer">
        <div className="epx-edge-link">
          <button type="button" aria-label="Edge Classic">
            <img src="/assets/device-management/9824b.svg" alt="" />
            <span className="epx-nav-text">Edge Classic</span>
          </button>
          <img src="/assets/device-management/6c665.svg" alt="" />
        </div>
        <div className="epx-user-row" ref={notificationsRef}>
          {notificationsOpen && (
            <div className="epx-notifications-popover" role="dialog" aria-label="Notifications">
              <div className="epx-notifications-header">
                <span>Notifications</span>
                <button type="button" onClick={() => setNotificationsOpen(false)} aria-label="Close notifications">
                  <img src="/assets/reupload/notify-close.svg" alt="" />
                </button>
              </div>
              {[
                ["Re-upload DR-2031 completed", "Yesterday"],
                ["Re-upload DR-2030 completed", "Yesterday"],
                ["Re-upload DR-2027 failed", "5 days ago"],
              ].map(([title, when]) => (
                <button
                  key={title}
                  type="button"
                  className="epx-notification"
                  onClick={() => {
                    onOpenRequestHistory();
                    setNotificationsOpen(false);
                  }}
                >
                  <span className="epx-notification-dot" />
                  <span>
                    <strong>{title}</strong>
                    <small>{when}</small>
                  </span>
                </button>
              ))}
            </div>
          )}
          <span className="epx-user-avatar" aria-hidden="true"><span>JD</span></span>
          <span className="epx-nav-text">John Doe</span>
          <div className="epx-sidebar-divider" aria-hidden="true" />
          <div className="epx-notifications">
            <button
              type="button"
              onClick={() => setNotificationsOpen(open => !open)}
              aria-label="Open notifications"
              aria-expanded={notificationsOpen}
            >
              <img src="/assets/device-management/01b43.svg" alt="" />
            </button>
          </div>
        </div>
      </div>
      <button
        className="epx-sidebar-toggle"
        type="button"
        aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
        aria-expanded={!collapsed}
        onClick={() => {
          setCollapsed(open => !open);
          setDataMenuOpen(false);
          setNotificationsOpen(false);
        }}
      >
        <img src="/assets/device-management/5a8fa.svg" alt="" />
      </button>
    </aside>
  );
}

function NavIcon({ type }: {
  type: "site" | "grid" | "settings" | "calendar" | "device" | "monitor" | "user" | "bell" | "file";
}) {
  const paths: Record<typeof type, React.ReactNode> = {
    site: <><path d="M5 20V8l7-4 7 4v12" /><path d="M9 20v-4h6v4M9 9h.01M15 9h.01M9 12h.01M15 12h.01" /></>,
    grid: <><rect x="4" y="4" width="6" height="6" /><rect x="14" y="4" width="6" height="6" /><rect x="4" y="14" width="6" height="6" /><rect x="14" y="14" width="6" height="6" /></>,
    settings: <><path d="M4 7h10M18 7h2M4 17h2M10 17h10M14 4v6M6 14v6" /></>,
    calendar: <><rect x="4" y="5" width="16" height="15" /><path d="M8 3v4M16 3v4M4 10h16" /></>,
    device: <><rect x="5" y="3" width="14" height="18" /><path d="M9 7h6M9 11h6M9 15h3" /></>,
    monitor: <><rect x="3" y="5" width="18" height="12" /><path d="M8 21h8M12 17v4" /></>,
    user: <><circle cx="12" cy="8" r="3" /><path d="M6 20c0-4 2-6 6-6s6 2 6 6" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
    file: <><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v5h5M9 13h6M9 17h6" /></>,
  };

  return (
    <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      {paths[type]}
    </svg>
  );
}

// ─── Meter Detail Drawer ────────────────────────────────────────────────────

function hasSupplierContact(source: string) {
  return !["smartcom", "smartcom ii", "edge g6"].includes(source.toLowerCase());
}

function technicalDetailRows(meter: Meter) {
  const source = meter.source.toLowerCase().replace(/\s+/g, "");
  const row = (label: string, value: string, mono = false) => ({ label, value, mono });

  if (source === "smartcom" || source === "smartcomii") {
    return [
      row("API Device ID", meter.apiDeviceId || "N/A", true),
      row("Smartcom/IO Logik ID", meter.smartcomId || "xxx", true),
      row("String number", meter.stringNumber || "xxx"),
      row("Input number", meter.inputNumber || "xxx"),
      row("Pulse ratio", meter.pulseRatio || "xxx"),
    ];
  }

  if (source === "captis") {
    return [
      row("Cumulocity ID", meter.cumulocityId || (meter.captisNumber !== "—" ? meter.captisNumber : "—"), true),
      row("API Parameter", meter.apiParameter || "Pulse1_Total"),
    ];
  }

  if (source === "nem12") {
    return [
      row("NMI no.", meter.nmiNo || "—", true),
      row("Serial no.", meter.serialNo || "—", true),
      row("Suffix", meter.nmiSuffix || "xx"),
    ];
  }

  if (source === "edgeg6") {
    return [
      row("API Device ID", meter.apiDeviceId || "N/A", true),
      row("Serial number", meter.serialNo || "xxx", true),
      row("String number", meter.stringNumber || meter.dataFormat || "xxx"),
      row("Meter address", meter.comAddress || "—", true),
      row("Baud rate", meter.baudRate || "xxx"),
      row("CT ratio", meter.ctRatio?.replace(":", " / ") || "—"),
    ];
  }

  if (source === "wattwatchers") {
    return [
      row("API Device ID", meter.apiDeviceId || "—", true),
      row("Channels", meter.channels || "—"),
    ];
  }

  if (source === "bacnet_1" || source === "bacnet1") {
    return [
      row("API Device ID", meter.apiDeviceId || "N/A", true),
      row("BMS Module IP Address", meter.comAddress || "—", true),
      row("BMS Connection Point Details", meter.bmsConnectionPoint || "xxx"),
    ];
  }

  return [
    row("Data format", meter.dataFormat || "—"),
    row("COM address", meter.comAddress || "—", true),
  ];
}

function MeterDrawer({ meter, onClose, onPatch }: {
  meter: Meter;
  onClose: () => void;
  onPatch: (patch: Partial<Meter>) => void;
}) {
  const saved = operationalDraft(meter);
  const savedSupplier = supplierDraft(meter);
  const [draft, setDraft] = useState<OperationalDraft>(saved);
  const [supplier, setSupplier] = useState<SupplierDraft>(savedSupplier);
  const [editingSupplier, setEditingSupplier] = useState(false);
  const [copyToast, setCopyToast] = useState(false);
  const [savedUndo, setSavedUndo] = useState<Partial<Meter> | null>(null);
  const [editingSerial, setEditingSerial] = useState(false);
  const [identityKind, setIdentityKind] = useState<"serial" | "captis">("serial");
  const [serialTab, setSerialTab] = useState<"update" | "history">("update");
  const [newSerial, setNewSerial] = useState("");
  const [serialValidFrom, setSerialValidFrom] = useState("");
  const [pendingSerialUpdate, setPendingSerialUpdate] = useState<{
    serialNo: string;
    validFrom: string;
  } | null>(null);
  const [serialStep, setSerialStep] = useState<"form" | "reprocess" | "submitted">("form");
  const [serialTouched, setSerialTouched] = useState(false);
  const [serialRequestId, setSerialRequestId] = useState("");
  const [configuringSource, setConfiguringSource] = useState(false);
  const [configSource, setConfigSource] = useState<"NEM12" | "Captis">("NEM12");
  const [configNmi, setConfigNmi] = useState("");
  const [configSerial, setConfigSerial] = useState("");
  const [configValidFrom, setConfigValidFrom] = useState("");
  const [configCaptisId, setConfigCaptisId] = useState("");
  const [configApiId, setConfigApiId] = useState("");
  const [configApiOpen, setConfigApiOpen] = useState(false);
  const [confirmReconfig, setConfirmReconfig] = useState(false);
  const configApiRef = useRef<HTMLLabelElement>(null);
  const edgeReconfig = meter.source === "Edge G6";

  useEffect(() => {
    if (!configApiOpen) return;
    function handlePointerDown(event: PointerEvent) {
      if (!configApiRef.current?.contains(event.target as Node)) setConfigApiOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [configApiOpen]);

  const configValid = configSource === "NEM12"
    ? Boolean(configNmi.trim() && configSerial.trim() && configValidFrom)
    : Boolean(configCaptisId.trim() && configApiId.trim() && configValidFrom);

  function openConfigureSource() {
    setConfigSource("NEM12");
    setConfigNmi("");
    setConfigSerial("");
    setConfigValidFrom("");
    setConfigCaptisId("");
    setConfigApiId("");
    setConfigApiOpen(false);
    setConfirmReconfig(false);
    setConfiguringSource(true);
  }

  function closeConfigureSource() {
    setConfiguringSource(false);
    setConfirmReconfig(false);
    setConfigApiOpen(false);
  }

  function reconfigDateLabel() {
    if (!configValidFrom) return "DD-MM-YYYY";
    const [year, month, day] = configValidFrom.split("-");
    return `${day}-${month}-${year}`;
  }

  function saveConfigureSource(notify = false) {
    if (!configValid || !configSource) return;
    if (notify) {
      setSavedUndo({
        source: meter.source,
        dataFormat: meter.dataFormat,
        nmiNo: meter.nmiNo,
        serialNo: meter.serialNo,
        captisNumber: meter.captisNumber,
        cumulocityId: meter.cumulocityId,
        apiParameter: meter.apiParameter,
      });
    }
    onPatch({
      source: configSource === "Captis" ? "CAPTIS" : "NEM12",
      dataFormat: configSource === "NEM12" ? "NEM12" : "Captis API",
      nmiNo: configSource === "NEM12" ? configNmi : meter.nmiNo,
      serialNo: configSource === "NEM12" ? configSerial : meter.serialNo,
      captisNumber: configSource === "Captis" ? configCaptisId : meter.captisNumber,
      cumulocityId: configSource === "Captis" ? configCaptisId : meter.cumulocityId,
      apiParameter: configSource === "Captis" ? configApiId : meter.apiParameter,
    });
    closeConfigureSource();
  }
  const operationalDirty = JSON.stringify(draft) !== JSON.stringify(saved);
  const supplierDirty = JSON.stringify(supplier) !== JSON.stringify(savedSupplier);
  const dirty = operationalDirty;
  const serialModalDirty = serialStep !== "submitted" && Boolean(newSerial || serialValidFrom || pendingSerialUpdate);
  const configModalDirty = Boolean(
    configSource !== "NEM12" ||
    configNmi || configSerial || configValidFrom || configCaptisId || configApiId ||
    confirmReconfig
  );
  const settingsComplete =
    (!draft.critical || Boolean(draft.criticalReason)) &&
    (!draft.excluded || Boolean(
      draft.excludedFrom &&
      (draft.excludedNoEndDate || draft.excludedTo) &&
      draft.excludedReason
    )) &&
    (!hasSupplierContact(meter.source) || !draft.notifications || Boolean(
      (draft.notificationScope || "This device only") &&
      draft.notificationComment.trim()
    ));
  function updateOperational(patch: Partial<OperationalDraft>) {
    setDraft(current => ({ ...current, ...patch }));
  }

  function saveChanges() {
    if (!dirty || !settingsComplete) return;
    onPatch({
      critical: draft.critical ? "Yes" : "No",
      criticalReason: draft.criticalReason,
      excluded: draft.excluded ? "Yes" : "No",
      excludedFrom: draft.excludedFrom,
      excludedTo: draft.excludedNoEndDate ? "" : draft.excludedTo,
      excludedNoEndDate: draft.excludedNoEndDate,
      excludedReason: draft.excludedReason,
      notifications: draft.notifications ? "Disabled" : "Enabled",
      notificationComment: draft.notificationComment,
      notificationScope: draft.notificationScope || "This device only",
      internalOnly: draft.internalOnly,
    });
  }

  function cancelChanges() {
    setDraft(saved);
  }

  function openSupplierEditor() {
    setSupplier(savedSupplier);
    setEditingSupplier(true);
  }

  function closeSupplierEditor() {
    setSupplier(savedSupplier);
    setEditingSupplier(false);
  }

  function saveSupplier() {
    if (!supplierDirty) return;
    onPatch({
      contactName: supplier.contactName,
      contactEmail: supplier.contactEmail,
      contactPhone: supplier.contactPhone,
      supplierName: supplier.supplierName,
    });
    setEditingSupplier(false);
  }

  function openSerialEditor(kind: "serial" | "captis", tab: "update" | "history") {
    setIdentityKind(kind);
    setSerialTab(tab);
    setNewSerial("");
    setSerialValidFrom("");
    setSerialTouched(false);
    setSerialStep("form");
    setPendingSerialUpdate(null);
    setEditingSerial(true);
  }

  function closeSerialEditor() {
    setEditingSerial(false);
    setNewSerial("");
    setSerialValidFrom("");
    setSerialTouched(false);
    setSerialStep("form");
    setPendingSerialUpdate(null);
  }

  function saveSerial() {
    if (!serialIsValid) return;
    setPendingSerialUpdate({
      serialNo: newSerial,
      validFrom: serialValidFrom,
    });
    setSerialStep("reprocess");
  }

  function applySerialUpdate() {
    if (!pendingSerialUpdate) return;
    if (isCaptisIdentity) {
      onPatch({
        captisNumber: pendingSerialUpdate.serialNo,
        captisValidFrom: pendingSerialUpdate.validFrom,
        captisHistory: [
          {
            captisNumber: meter.captisNumber,
            validFrom: meter.captisValidFrom ?? "2026-05-01",
            validTo: pendingSerialUpdate.validFrom,
          },
          ...(meter.captisHistory ?? []),
        ],
      });
      return;
    }
    onPatch({
      serialNo: pendingSerialUpdate.serialNo,
      serialValidFrom: pendingSerialUpdate.validFrom,
      serialHistory: [
        {
          serialNo: meter.serialNo,
          validFrom: meter.serialValidFrom ?? "2024-01-15",
          validTo: pendingSerialUpdate.validFrom,
        },
        ...(meter.serialHistory ?? []),
      ],
    });
  }

  function saveSerialWithoutReprocess() {
    setSavedUndo(isCaptisIdentity
      ? {
          captisNumber: meter.captisNumber,
          captisValidFrom: meter.captisValidFrom,
          captisHistory: meter.captisHistory,
        }
      : {
          serialNo: meter.serialNo,
          serialValidFrom: meter.serialValidFrom,
          serialHistory: meter.serialHistory,
        });
    applySerialUpdate();
    closeSerialEditor();
  }

  function saveSerialAndReprocess() {
    applySerialUpdate();
    setSerialRequestId(`DR-${2000 + meter.id}`);
    setSerialStep("submitted");
  }

  function serialDateLabel() {
    const value = pendingSerialUpdate?.validFrom ?? serialValidFrom;
    if (!value) return "DD-MM-YYYY";
    const [year, month, day] = value.split("-");
    return `${day}-${month}-${year}`;
  }

  const isCaptisIdentity = identityKind === "captis";
  const currentIdentity = isCaptisIdentity ? meter.captisNumber : meter.serialNo;
  const serialIsValid = /^\d{12}$/.test(newSerial) && newSerial !== currentIdentity && Boolean(serialValidFrom);
  const serialInvalid = newSerial.length > 0
    && (newSerial === currentIdentity || !/^\d{12}$/.test(newSerial))
    && (serialTouched || newSerial.length >= 12);

  return (
    <div className="epx-drawer">

      {/* Header */}
      <div className="epx-drawer-header">
        <div className="epx-drawer-title-row">
          <div>
            <div className="epx-drawer-title">{meter.name}</div>
            <div className="epx-drawer-id">{formatEdgeId(meter.edgeId)}</div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close device details">
            <img src="/assets/device-panel/a89cc.svg" alt="" />
          </button>
        </div>
        <div className="epx-drawer-status">
          <span className={onlineValue(meter) === "Online" ? "is-online" : "is-offline"}>
            <span />
            {onlineValue(meter)}
          </span>
          <span>Last data {meter.lastData}</span>
        </div>
      </div>

      <div className="epx-drawer-content">
        <DrawerSection title="Device info">
          <div className="epx-device-info-grid">
            <DeviceInfoTile
              icon={DEVICE_TYPE_ICONS[meter.type] ?? DEVICE_TYPE_ICONS.Electricity}
              label="Type"
              value={meter.type}
            />
            <DeviceInfoTile icon="/assets/device-panel/f00de.svg" label="Data source" value={meter.source} />
            <DeviceInfoTile
              icon={meter.status === "In progress" || meter.status === "Inactive" ? "/assets/device-panel/hourglass-half.svg" : "/assets/device-panel/hourglass-full.svg"}
              label="Under comm."
              value={meter.status === "In progress" || meter.status === "Inactive" ? "In progress" : "Done"}
            />
          </div>
        </DrawerSection>

        <DrawerSection
          title="Technical details"
          action={
            meter.source.toLowerCase().replace(/\s+/g, "") === "wattwatchers" ? undefined : (
              <button
                type="button"
                onClick={meter.source.toLowerCase() === "nem12"
                  ? () => openSerialEditor("serial", "update")
                  : meter.source.toLowerCase() === "captis"
                    ? () => openSerialEditor("captis", "update")
                    : openConfigureSource}
              >
                Edit
              </button>
            )
          }
        >
          <div className="epx-detail-card">
            {technicalDetailRows(meter).map(row => (
              <MetaRow key={row.label} label={row.label} value={row.value} mono={row.mono} />
            ))}
          </div>
        </DrawerSection>

        {hasSupplierContact(meter.source) && (
          <DrawerSection
            title="Supplier contact"
            action={<button type="button" onClick={openSupplierEditor}>Edit</button>}
          >
            <div className="epx-contact-card">
              <div className="epx-contact-person">
                <span>{meter.contactName === "—" ? "—" : meter.contactName.split(/\s+/).map(part => part[0]).join("").slice(0, 2)}</span>
                <div>
                  <strong>{meter.contactName}</strong>
                  <small>{supplierLabel(meter)}</small>
                </div>
              </div>
              <ContactRow label="Email" value={meter.contactEmail} onCopied={() => setCopyToast(true)} />
              <ContactRow label="Phone" value={meter.contactPhone} onCopied={() => setCopyToast(true)} />
            </div>
          </DrawerSection>
        )}

        <DrawerSection title="Settings">
          <OperationalForm draft={draft} source={meter.source} onChange={updateOperational} />
        </DrawerSection>
      </div>

      {copyToast && <CopyToast onClose={() => setCopyToast(false)} />}
      {savedUndo && (
        <SavedToast
          onUndo={() => {
            onPatch(savedUndo);
            setSavedUndo(null);
          }}
          onClose={() => setSavedUndo(null)}
        />
      )}

      <div className="epx-drawer-footer">
        <button
          type="button"
          onClick={cancelChanges}
          className="epx-drawer-cancel"
        >
          Cancel
        </button>
        <span
          className={`epx-drawer-save-wrap${dirty && !settingsComplete ? " has-tooltip" : ""}`}
          data-tooltip="Not all fields in the settings you actioned have been completed"
        >
          <button
            type="button"
            onClick={saveChanges}
            disabled={!dirty || !settingsComplete}
            className="epx-drawer-save"
          >
            Save
          </button>
        </span>
      </div>

      {editingSupplier && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="supplier-modal-title"
          onPointerDown={event => {
            if (event.target === event.currentTarget && !supplierDirty) closeSupplierEditor();
          }}
        >
          <div className="epx-supplier-modal">
            <div className="epx-supplier-modal-header">
              <div>
                <div id="supplier-modal-title">Edit Supplier Contact</div>
                <p>Update supplier contact details used for notifications and communications</p>
              </div>
              <button type="button" onClick={closeSupplierEditor} aria-label="Close">
                <img src="/assets/device-panel/a89cc.svg" alt="" />
              </button>
            </div>
            <div className="epx-supplier-modal-body">
              <label>
                <span>Contact name</span>
                <input
                  type="text"
                  value={supplier.contactName}
                  onChange={event => setSupplier(current => ({ ...current, contactName: event.target.value }))}
                />
              </label>
              <label>
                <span>Email</span>
                <input
                  type="email"
                  value={supplier.contactEmail}
                  onChange={event => setSupplier(current => ({ ...current, contactEmail: event.target.value }))}
                />
              </label>
              <label>
                <span>Supplier</span>
                <input
                  type="text"
                  value={supplier.supplierName}
                  onChange={event => setSupplier(current => ({ ...current, supplierName: event.target.value }))}
                />
              </label>
              <label>
                <span>Phone</span>
                <input
                  type="tel"
                  value={supplier.contactPhone}
                  onChange={event => setSupplier(current => ({ ...current, contactPhone: event.target.value }))}
                />
              </label>
            </div>
            <div className="epx-supplier-modal-footer">
              <button type="button" onClick={closeSupplierEditor} className="epx-drawer-cancel">
                Cancel
              </button>
              <button
                type="button"
                onClick={saveSupplier}
                disabled={!supplierDirty}
                className="epx-drawer-save"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {editingSerial && (
        <div
          className="epx-add-device-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="serial-modal-title"
          onPointerDown={event => {
            if (event.target === event.currentTarget && !serialModalDirty) closeSerialEditor();
          }}
        >
          <div className={`epx-reconfig-dialog${serialStep === "form" ? "" : " is-confirm"}`}>
            <div className="epx-add-device-header">
              <div>
                <div id="serial-modal-title">{isCaptisIdentity ? "Captis Cumulocity ID" : "NEM12 Serial number"}</div>
                <p>{isCaptisIdentity ? "Update the ID or view its change history" : "Update the serial number or view its change history"}</p>
              </div>
              <button
                type="button"
                onClick={serialStep === "reprocess" ? () => setSerialStep("form") : closeSerialEditor}
                aria-label="Close"
              >
                <img src="/assets/add-device/7bf08.svg" alt="" />
              </button>
            </div>
            {serialStep === "submitted" ? (
              <div className="epx-serial-success">
                <h3>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle cx="12" cy="12" r="9" stroke="#12B76A" strokeWidth="1.5" />
                    <path d="M8 12.2 10.8 15 16 9.5" stroke="#12B76A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Re-upload request submitted
                </h3>
                <p>Request ID: <strong>{serialRequestId}</strong></p>
                <p>Data will be processed in the background, you can monitor its progress on the main page. We will email you when processing is complete.</p>
              </div>
            ) : serialStep === "reprocess" && pendingSerialUpdate ? (
              <p className="epx-add-device-confirm">
                {isCaptisIdentity
                  ? <>The cumulocity ID will be updated to <strong>{pendingSerialUpdate.serialNo}</strong>. Would you like to reprocess Captis data from <strong>{serialDateLabel()}</strong>?</>
                  : <>The serial number will be updated to <strong>{pendingSerialUpdate.serialNo}</strong>. Would you like to reprocess NEM12 data from <strong>{serialDateLabel()}</strong>?</>}
              </p>
            ) : (
              <div className="epx-reconfig-body">
                <div className="epx-serial-tabs">
                  <button type="button" className={serialTab === "update" ? "is-active" : ""} onClick={() => setSerialTab("update")}>Update</button>
                  <button type="button" className={serialTab === "history" ? "is-active" : ""} onClick={() => setSerialTab("history")}>History</button>
                </div>
                {serialTab === "update" ? (
                  <>
                    <div className="epx-reconfig-row">
                      <label className="epx-add-device-field">
                        <span>{isCaptisIdentity ? "Current cumulocity ID" : "Current serial number"}</span>
                        <input value={currentIdentity} disabled />
                      </label>
                      <label className={`epx-add-device-field${serialInvalid ? " is-invalid" : ""}`}>
                        <span>{isCaptisIdentity ? "New cumulocity ID" : "New serial number"}</span>
                        <span className={`epx-add-device-select${serialInvalid ? " is-invalid" : ""}`}>
                          <input
                            value={newSerial}
                            inputMode="numeric"
                            placeholder={isCaptisIdentity ? "Enter no." : "Enter 12 digits"}
                            aria-invalid={serialInvalid}
                            onBlur={() => setSerialTouched(true)}
                            onChange={event => setNewSerial(event.target.value.replace(/\D/g, "").slice(0, 12))}
                          />
                          {serialInvalid && <img className="epx-field-error-icon" src="/assets/add-device/error.svg" alt="" />}
                        </span>
                        {serialInvalid && <p className="epx-field-error">{isCaptisIdentity ? "Invalid cumulocity ID" : "Invalid serial number"}</p>}
                      </label>
                    </div>
                    <DateField label="Valid from" value={serialValidFrom} onChange={setSerialValidFrom} />
                  </>
                ) : (
                  <div className="epx-serial-history">
                    {(isCaptisIdentity
                      ? [{
                          id: meter.captisNumber,
                          validFrom: meter.captisValidFrom ?? "2026-05-01",
                          validTo: "",
                          current: true,
                        }, ...(meter.captisHistory ?? [{
                          captisNumber: "700000001285",
                          validFrom: "2025-01-15",
                          validTo: meter.captisValidFrom ?? "2026-05-01",
                        }, {
                          captisNumber: "700000004017",
                          validFrom: "2024-01-01",
                          validTo: "2025-01-15",
                        }]).map(entry => ({ id: entry.captisNumber, validFrom: entry.validFrom, validTo: entry.validTo, current: false }))]
                      : [{
                          id: meter.serialNo,
                          validFrom: meter.serialValidFrom ?? "2024-01-15",
                          validTo: "",
                          current: true,
                        }, ...(meter.serialHistory ?? [{
                          serialNo: String(700000000000 + meter.id * 1000 + 17),
                          validFrom: "2022-04-01",
                          validTo: meter.serialValidFrom ?? "2024-01-15",
                        }]).map(entry => ({ id: entry.serialNo, validFrom: entry.validFrom, validTo: entry.validTo, current: false }))]).map(entry => (
                      <div className={`epx-serial-step${entry.current ? " is-current" : ""}`} key={`${entry.id}-${entry.validFrom}`}>
                        <span className="epx-serial-step-rail" aria-hidden="true" />
                        <div>
                          <strong>{entry.id}</strong>
                          <span>
                            {formatHistoryDate(entry.validFrom)} — {entry.current ? "Present" : formatHistoryDate(entry.validTo)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {serialStep === "submitted" ? null : serialStep === "reprocess" ? (
              <div className="epx-add-device-footer">
                <button type="button" onClick={saveSerialWithoutReprocess}>Save without reprocess</button>
                <button type="button" className="is-primary" onClick={saveSerialAndReprocess}>Save & reprocess</button>
              </div>
            ) : (
              <div className="epx-add-device-footer">
                <button type="button" onClick={closeSerialEditor}>Cancel</button>
                <button type="button" className="is-primary" disabled={!serialIsValid || serialTab !== "update"} onClick={saveSerial}>Save</button>
              </div>
            )}
          </div>
        </div>
      )}

      {configuringSource && (
        <div
          className="epx-add-device-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="configure-source-title"
          onPointerDown={event => {
            if (event.target === event.currentTarget && !configModalDirty) closeConfigureSource();
          }}
        >
          <div className={`epx-reconfig-dialog${confirmReconfig ? " is-confirm" : ""}`}>
            <div className="epx-add-device-header">
              <div>
                <div id="configure-source-title">
                  {edgeReconfig ? "Reconfigure Edge device" : "Configure data source"}
                </div>
                <p>
                  {edgeReconfig
                    ? "Replace memory module connection with NEM12 or Captis device"
                    : `Select a data source for ${meter.name}. This will replace the current connection.`}
                </p>
              </div>
              <button type="button" onClick={confirmReconfig ? () => setConfirmReconfig(false) : closeConfigureSource} aria-label="Close">
                <img src="/assets/add-device/7bf08.svg" alt="" />
              </button>
            </div>
            {confirmReconfig ? (
              <p className="epx-add-device-confirm">
                The device data source will be changed from EDGE Memory Module to NEM12/Captis. Would you like to fetch and process data from <strong>{reconfigDateLabel()}?</strong>
              </p>
            ) : (
              <div className="epx-reconfig-body">
                <div className="epx-reconfig-row">
                  <div className="epx-add-device-source">
                    <span>Data source</span>
                    <div>
                      {(["NEM12", "Captis"] as const).map(opt => (
                        <button
                          type="button"
                          key={opt}
                          className={configSource === opt ? "is-active" : ""}
                          onClick={() => {
                            setConfigSource(opt);
                            setConfigNmi("");
                            setConfigSerial("");
                            setConfigCaptisId("");
                            setConfigApiId("");
                            setConfigApiOpen(false);
                            setConfigValidFrom("");
                          }}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                  {configSource === "Captis" ? (
                    <label className="epx-add-device-field">
                      <span>Cumulocity ID</span>
                      <input
                        value={configCaptisId}
                        onChange={event => setConfigCaptisId(event.target.value.replace(/\D/g, "").slice(0, 11))}
                        inputMode="numeric"
                        placeholder="11 digits"
                      />
                    </label>
                  ) : (
                    <label className="epx-add-device-field">
                      <span>NMI number</span>
                      <input
                        value={configNmi}
                        onChange={event => setConfigNmi(event.target.value.replace(/\D/g, "").slice(0, 11))}
                        inputMode="numeric"
                        placeholder="11 digits"
                      />
                    </label>
                  )}
                </div>
                <div className="epx-reconfig-row">
                  {configSource === "Captis" ? (
                    <label className="epx-add-device-field" ref={configApiRef}>
                      <span>API parameter</span>
                      <span className="epx-add-device-select">
                        <button
                          type="button"
                          className={configApiId ? "" : "is-placeholder"}
                          aria-expanded={configApiOpen}
                          aria-haspopup="listbox"
                          onClick={() => setConfigApiOpen(open => !open)}
                        >
                          {configApiId || "Select parameter"}
                        </button>
                        <img src="/assets/add-device/988a8.svg" alt="" />
                      </span>
                      {configApiOpen && (
                        <div className="epx-add-device-menu" role="listbox">
                          {["Pulse1_Total", "Pulse2_Total"].map(option => (
                            <button
                              type="button"
                              key={option}
                              role="option"
                              aria-selected={configApiId === option}
                              onClick={() => {
                                setConfigApiId(option);
                                setConfigApiOpen(false);
                              }}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      )}
                    </label>
                  ) : (
                    <label className="epx-add-device-field">
                      <span>New serial number</span>
                      <input
                        value={configSerial}
                        onChange={event => setConfigSerial(event.target.value.replace(/\D/g, "").slice(0, 12))}
                        inputMode="numeric"
                        placeholder="Enter 12 digits"
                      />
                    </label>
                  )}
                  <DateField label="Valid from" value={configValidFrom} onChange={setConfigValidFrom} />
                </div>
              </div>
            )}
            {confirmReconfig ? (
              <div className="epx-add-device-footer">
                <button type="button" onClick={() => saveConfigureSource(true)}>Save without process</button>
                <button type="button" className="is-primary" onClick={() => saveConfigureSource(false)}>Save & process</button>
              </div>
            ) : (
              <div className="epx-add-device-footer">
                <button type="button" onClick={closeConfigureSource}>Cancel</button>
                <button
                  type="button"
                  className="is-primary"
                  disabled={!configValid}
                  onClick={() => edgeReconfig ? setConfirmReconfig(true) : saveConfigureSource()}
                >
                  Save
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function formatHistoryDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function DrawerSection({ title, action, children }: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="epx-drawer-section">
      <div className="epx-drawer-section-heading">
        <span>{title}</span>
        {action}
      </div>
      {children}
    </section>
  );
}

function DeviceInfoTile({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="epx-device-info-tile">
      <img src={icon} alt="" />
      <div>
        <small>{label}</small>
        <span>{value}</span>
      </div>
    </div>
  );
}

function ContactRow({ label, value, onCopied }: { label: string; value: string; onCopied: () => void }) {
  return (
    <div className="epx-contact-row">
      <span>{label}</span>
      <span>{value}</span>
      {value !== "—" && (
        <button
          type="button"
          aria-label={`Copy ${label.toLowerCase()}`}
          onClick={() => {
            navigator.clipboard?.writeText(value).then(onCopied).catch(() => {});
          }}
        >
          <img src="/assets/device-panel/d7702.svg" alt="" />
        </button>
      )}
    </div>
  );
}

function SavedToast({ message = "Saved successfully", onUndo, onClose }: { message?: string; onUndo: () => void; onClose: () => void }) {
  useEffect(() => {
    const timer = window.setTimeout(onClose, 5000);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="epx-toast" role="status">
      <span className="epx-toast-icon" aria-hidden="true">
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <circle cx="11" cy="11" r="10" stroke="#12B76A" strokeWidth="1.5" />
          <path d="M6.5 11.2 9.4 14.1 15.5 8" stroke="#12B76A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="epx-toast-message">{message}</span>
      <button type="button" className="epx-toast-undo" onClick={onUndo}>Undo</button>
      <button type="button" className="epx-toast-close" aria-label="Dismiss" onClick={onClose}>×</button>
    </div>
  );
}

function CopyToast({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const timer = window.setTimeout(onClose, 4000);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="epx-toast" role="status">
      <span className="epx-toast-icon" aria-hidden="true">
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <circle cx="11" cy="11" r="10" stroke="#12B76A" strokeWidth="1.5" />
          <path d="M6.5 11.2 9.4 14.1 15.5 8" stroke="#12B76A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="epx-toast-message">Contact details copied</span>
      <button type="button" className="epx-toast-undo" onClick={onClose}>Undo</button>
      <button type="button" className="epx-toast-close" aria-label="Dismiss" onClick={onClose}>×</button>
    </div>
  );
}

type SupplierDraft = {
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  supplierName: string;
};

function supplierFromEmail(email: string): string {
  const domain = email.split("@")[1]?.split(".")[0]?.toLowerCase() ?? "";
  if (!domain || email === "—") return "";
  const known: Record<string, string> = {
    fronius: "Fronius",
    siemens: "Siemens",
    ausgrid: "Ausgrid",
    jci: "JCI",
    agl: "AGL",
    health: "NSW Health",
  };
  return known[domain] ?? domain.charAt(0).toUpperCase() + domain.slice(1);
}

const DEFAULT_SUPPLIERS: Record<number, string> = {
  1: "Ausgrid",
  2: "JCI",
  3: "Sydney Water",
  4: "AGL",
  5: "Fronius",
  6: "Siemens",
  7: "Veolia",
  8: "NSW Health",
  9: "NSW Health",
  10: "Siemens",
  11: "AGL",
  12: "Fronius",
};

function supplierLabel(meter: Meter): string {
  const named = meter.supplierName?.trim();
  if (named && named !== "—" && named !== meter.source) return named;
  return supplierFromEmail(meter.contactEmail) || DEFAULT_SUPPLIERS[meter.id] || "Unassigned";
}

function supplierDraft(meter: Meter): SupplierDraft {
  return {
    contactName: meter.contactName,
    contactEmail: meter.contactEmail,
    contactPhone: meter.contactPhone,
    supplierName: supplierLabel(meter),
  };
}

type OperationalDraft = {
  critical: boolean;
  criticalReason: string;
  excluded: boolean;
  excludedFrom: string;
  excludedTo: string;
  excludedNoEndDate: boolean;
  excludedReason: string;
  notifications: boolean;
  notificationComment: string;
  notificationScope: string;
  internalOnly: boolean;
};

function operationalDraft(meter: Meter): OperationalDraft {
  const isCritical = meter.critical === "Yes";
  const isExcluded = meter.excluded === "Yes";
  const disableNotifications = meter.notifications === "Disabled";
  return {
    critical: isCritical,
    criticalReason: meter.criticalReason ?? (isCritical ? "Monitoring for Insight" : ""),
    excluded: isExcluded,
    excludedFrom: meter.excludedFrom ?? (isExcluded ? "2026-01-01" : ""),
    excludedTo: meter.excludedTo ?? (isExcluded ? "2026-12-31" : ""),
    excludedNoEndDate: meter.excludedNoEndDate ?? false,
    excludedReason: meter.excludedReason ?? (isExcluded ? "Historical data only" : ""),
    notifications: disableNotifications,
    notificationComment: meter.notificationComment ?? (disableNotifications ? "Temporarily disabled for review" : ""),
    notificationScope: meter.notificationScope ?? (disableNotifications ? "This device only" : ""),
    internalOnly: meter.internalOnly ?? false,
  };
}

const CRITICAL_REASONS = ["Tenant billing", "Monitoring for Insight", "NABERS", "Other"];
const EXCLUDE_REASONS = ["Historical data only", "Handover issues outside project control", "Dummy meter", "Temporarily isolated (e.g. maintenance or renovations)"];
const DISABLE_FOR = ["This device only", "All devices at this site", "All devices at all sites"];
const DISABLE_FOR_DETAILS: Record<string, string> = {
  "All devices at this site": "2 devices for 100 Crescent Tower",
  "All devices at all sites": "23 devices across 14 sites",
};

function OperationalForm({ draft, source, onChange }: {
  draft: OperationalDraft;
  source: string;
  onChange: (patch: Partial<OperationalDraft>) => void;
}) {
  const showInternalOnly = /nem12|captis/i.test(source);
  const showSupplierNotifications = hasSupplierContact(source);
  return (
    <div className="epx-settings-list">
      <div className="epx-setting epx-setting-critical">
        <div className="epx-setting-row">
          <div className="epx-setting-copy">
            <div>
              <img src="/assets/device-panel/6c992.svg" alt="" />
              <span>Critical device</span>
            </div>
            <p>Alerts for this device require priority monitoring, set by Customer Delivery team</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={draft.critical}
            onClick={() => onChange({ critical: !draft.critical })}
          >
            <img src={draft.critical ? "/assets/device-panel/4513b.svg" : "/assets/device-panel/2b372.svg"} alt="" />
          </button>
        </div>
        {draft.critical && (
          <SettingSelect
            label="Reason"
            value={draft.criticalReason}
            placeholder="Select reason"
            options={CRITICAL_REASONS}
            onChange={criticalReason => onChange({ criticalReason })}
          />
        )}
      </div>

      <div className="epx-setting">
        <div className="epx-setting-row">
          <div className="epx-setting-copy">
            <div>
              <img src="/assets/device-panel/82b00.svg" alt="" />
              <span>Exclude</span>
            </div>
            <p>Device is excluded from automated monitoring, missing data checks and SLA reporting</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={draft.excluded}
            onClick={() => onChange({ excluded: !draft.excluded })}
          >
            <img src={draft.excluded ? "/assets/device-panel/4513b.svg" : "/assets/device-panel/2b372.svg"} alt="" />
          </button>
        </div>
        {draft.excluded && (
          <div className="epx-setting-detail">
            <DateRangeField from={draft.excludedFrom} to={draft.excludedTo} toDisabled={draft.excludedNoEndDate} onFromChange={excludedFrom => onChange({ excludedFrom })} onToChange={excludedTo => onChange({ excludedTo })} />
            <label className="epx-check-line">
              <input
                type="checkbox"
                checked={draft.excludedNoEndDate}
                onChange={event => onChange({ excludedNoEndDate: event.target.checked, excludedTo: event.target.checked ? "" : draft.excludedTo })}
              />
              No end date
            </label>
            <SettingSelect
              label="Reason"
              value={draft.excludedReason}
              placeholder="Select reason"
              options={EXCLUDE_REASONS}
              onChange={excludedReason => onChange({ excludedReason })}
            />
          </div>
        )}
      </div>

      {showSupplierNotifications && (
      <div className="epx-setting">
        <div className="epx-setting-row">
          <div className="epx-setting-copy">
            <div>
              <img src="/assets/device-panel/88fc5.svg" alt="" />
              <span>Disable supplier notifications</span>
            </div>
            <p>Suppliers will no longer receive automated notifications</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={draft.notifications}
            onClick={() => onChange({
              notifications: !draft.notifications,
              notificationScope: !draft.notifications
                ? (draft.notificationScope || "This device only")
                : draft.notificationScope,
            })}
          >
            <img src={draft.notifications ? "/assets/device-panel/4513b.svg" : "/assets/device-panel/2b372.svg"} alt="" />
          </button>
        </div>
        {draft.notifications && (
          <div className="epx-setting-detail">
            <SettingSelect
              label="Apply to"
              value={draft.notificationScope || "This device only"}
              placeholder="This device only"
              options={DISABLE_FOR}
              optionDetails={DISABLE_FOR_DETAILS}
              onChange={notificationScope => onChange({ notificationScope })}
            />
            <label className="epx-field">
              <span>Comment</span>
              <textarea
                value={draft.notificationComment}
                onChange={event => onChange({ notificationComment: event.target.value })}
                rows={3}
                placeholder="Why are notifications being disabled?"
              />
            </label>
          </div>
        )}
      </div>
      )}
      {showInternalOnly && (
        <div className="epx-setting">
          <div className="epx-setting-row">
            <div className="epx-setting-copy">
              <div>
                <img src="/assets/device-panel/visibility.svg" alt="" />
                <span>Visible to internal users only</span>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={draft.internalOnly}
              aria-label="Visible to internal users only"
              onClick={() => onChange({ internalOnly: !draft.internalOnly })}
            >
              <img src={draft.internalOnly ? "/assets/device-panel/4513b.svg" : "/assets/device-panel/2b372.svg"} alt="" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function HeaderTooltip({ title, body, children }: { title: string; body: string; children: React.ReactNode }) {
  const [anchor, setAnchor] = useState<{ x: number; y: number } | null>(null);
  return (
    <span
      className="epx-header-tip"
      onMouseEnter={event => {
        const rect = event.currentTarget.getBoundingClientRect();
        setAnchor({ x: rect.left + rect.width / 2, y: rect.top });
      }}
      onMouseLeave={() => setAnchor(null)}
      onClick={event => event.stopPropagation()}
    >
      {children}
      {anchor && (
        <span className="epx-tooltip" style={{ left: anchor.x, top: anchor.y }} role="tooltip">
          <strong>{title}</strong>
          <span>{body}</span>
        </span>
      )}
    </span>
  );
}

function SettingSelect({ label, value, placeholder, options, optionDetails, onChange }: {
  label: string;
  value: string;
  placeholder: string;
  options: string[];
  optionDetails?: Record<string, string>;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    function handle(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", handle);
    return () => document.removeEventListener("pointerdown", handle);
  }, [open]);
  const selectedDetail = optionDetails?.[value];
  return (
    <div className="epx-field" ref={rootRef}>
      <span>{label}</span>
      <button type="button" className={`epx-select-field${selectedDetail ? " has-supporting" : ""}`} aria-expanded={open} onClick={() => setOpen(current => !current)}>
        <span className={`epx-select-value${value ? "" : " is-placeholder"}`}>
          <span>{value || placeholder}</span>
          {selectedDetail && <small>{selectedDetail}</small>}
        </span>
        <img src="/assets/device-management/3c143.svg" alt="" />
      </button>
      {open && (
        <div className="epx-select-menu" role="listbox">
          {options.map(option => {
            const detail = optionDetails?.[option];
            const selected = value === option;
            return (
              <button
                type="button"
                key={option}
                role="option"
                aria-selected={selected}
                onClick={() => {
                  onChange(option);
                  setOpen(false);
                }}
              >
                <span className="epx-select-option-copy">
                  <span>{option}</span>
                  {detail && <small>{detail}</small>}
                </span>
                {selected && <img className="epx-select-option-check" src="/assets/select/check.svg" alt="" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function formatDateText(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? `${value.slice(8, 10)}/${value.slice(5, 7)}/${value.slice(0, 4)}`
    : "";
}

function maskDateText(raw: string) {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function dateFromText(text: string) {
  const match = text.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return date;
}

function DateField({ label, value, disabled, align = "start", onChange, onPick }: {
  label: string;
  value: string;
  disabled?: boolean;
  align?: "start" | "end";
  onChange: (value: string) => void;
  onPick?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [touched, setTouched] = useState(false);
  const [text, setText] = useState(() => formatDateText(value));
  const [anchor, setAnchor] = useState<{ top: number; left: number; width: number; openUp: boolean } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    setText(formatDateText(value));
  }, [value]);
  useEffect(() => {
    if (!open) return;
    function place() {
      const field = rootRef.current?.querySelector(".epx-select-field");
      if (!field) return;
      const rect = field.getBoundingClientRect();
      const calendarHeight = 340;
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUp = spaceBelow < calendarHeight + 12 && rect.top > calendarHeight;
      setAnchor({
        top: openUp ? rect.top - 8 : rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        openUp,
      });
    }
    place();
    function handle(event: PointerEvent) {
      const target = event.target as Node;
      if (!rootRef.current?.contains(target) && !calendarRef.current?.contains(target)) setOpen(false);
    }
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    document.addEventListener("pointerdown", handle);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
      document.removeEventListener("pointerdown", handle);
    };
  }, [open]);
  const parsed = value ? new Date(`${value}T00:00:00`) : new Date();
  const [cursor, setCursor] = useState(parsed);
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const startOffset = (new Date(year, month, 1).getDay() + 6) % 7;
  const gridStart = new Date(year, month, 1 - startOffset);
  const cells = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    return date;
  });
  const weeks = Array.from({ length: 6 }, (_, index) => cells.slice(index * 7, index * 7 + 7));
  const today = new Date();

  function iso(date: Date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }

  function handleTypedDate(raw: string) {
    const next = maskDateText(raw);
    setText(next);
    const date = dateFromText(next);
    if (date) {
      onChange(iso(date));
      setCursor(new Date(date.getFullYear(), date.getMonth(), 1));
    } else if (value) {
      onChange("");
    }
  }

  const dateInvalid = !disabled && text.length > 0 && !dateFromText(text) && (touched || text.length === 10);

  return (
    <div className="epx-field" ref={rootRef}>
      <span>{label}</span>
      <div className={`epx-select-field${disabled ? " is-disabled" : ""}${dateInvalid ? " is-invalid" : ""}`}>
        <input
          value={text}
          disabled={disabled}
          inputMode="numeric"
          placeholder="DD/MM/YYYY"
          aria-label={label}
          aria-invalid={dateInvalid}
          onChange={event => handleTypedDate(event.target.value)}
          onBlur={() => setTouched(true)}
        />
        {dateInvalid && <img className="epx-field-error-icon" src="/assets/add-device/error.svg" alt="" />}
        <button
          type="button"
          aria-label={`Choose ${label}`}
          disabled={disabled}
          onClick={() => onPick ? onPick() : setOpen(current => !current)}
        >
          <img src="/assets/add-device/6396d.svg" alt="" />
        </button>
      </div>
      {dateInvalid && <p className="epx-field-error">Invalid date</p>}
      {open && !disabled && !onPick && anchor && createPortal(
        <div
          ref={calendarRef}
          className={`epx-calendar is-floating${anchor.openUp ? " is-up" : ""}`}
          style={{ top: anchor.top, left: anchor.left, width: anchor.width }}
        >
          <div className="epx-calendar-title">
            <button type="button" aria-label="Previous month" onClick={() => setCursor(new Date(year, month - 1, 1))}>
              <img src="/assets/calendar/chevron-left.svg" alt="" />
            </button>
            <div>
              <strong>{cursor.toLocaleString("en-AU", { month: "long" })}</strong>
              <span>{year}</span>
            </div>
            <button type="button" aria-label="Next month" onClick={() => setCursor(new Date(year, month + 1, 1))}>
              <img src="/assets/calendar/chevron-right.svg" alt="" />
            </button>
          </div>
          <div className="epx-calendar-weekdays">
            {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}
          </div>
          <div className="epx-calendar-weeks">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex}>
                {week.map(date => {
                  const inMonth = date.getMonth() === month;
                  const selected = value === iso(date);
                  const isToday = date.getFullYear() === today.getFullYear()
                    && date.getMonth() === today.getMonth()
                    && date.getDate() === today.getDate();
                  return (
                    <button
                      type="button"
                      key={iso(date)}
                      className={`${inMonth ? "" : "is-outside"}${selected ? " is-selected" : ""}${isToday && !selected ? " is-today" : ""}`}
                      onClick={() => {
                        onChange(iso(date));
                        setOpen(false);
                      }}
                    >
                      <span>{date.getDate()}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}

function DateRangeField({ from, to, disabled, toDisabled, className = "", onFromChange, onToChange }: {
  from: string;
  to: string;
  disabled?: boolean;
  toDisabled?: boolean;
  className?: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [activeField, setActiveField] = useState<"from" | "to" | null>(null);
  const [anchor, setAnchor] = useState<{ top: number; left: number; width: number; openUp: boolean } | null>(null);
  const [cursor, setCursor] = useState(() => from ? new Date(`${from}T00:00:00`) : new Date());
  const [hoverKey, setHoverKey] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    function place() {
      const field = rootRef.current?.querySelector(".epx-select-field");
      if (!field) return;
      const rect = field.getBoundingClientRect();
      const openUp = window.innerHeight - rect.bottom < 360 && rect.top > 360;
      setAnchor({ top: openUp ? rect.top - 8 : rect.bottom + 4, left: rect.left, width: Math.max(rect.width, 320), openUp });
    }
    place();
    function handle(event: PointerEvent) {
      const target = event.target as Node;
      if (!rootRef.current?.contains(target) && !calendarRef.current?.contains(target)) setOpen(false);
    }
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    document.addEventListener("pointerdown", handle);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
      document.removeEventListener("pointerdown", handle);
    };
  }, [open]);
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const startOffset = (new Date(year, month, 1).getDay() + 6) % 7;
  const gridStart = new Date(year, month, 1 - startOffset);
  const weeks = Array.from({ length: 6 }, (_, week) => Array.from({ length: 7 }, (_, day) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + week * 7 + day);
    return date;
  }));
  function iso(date: Date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }
  function choose(date: Date) {
    const next = iso(date);
    if (toDisabled) {
      onFromChange(next);
      setOpen(false);
      return;
    }
    if (!from || (from && to)) {
      onFromChange(next);
      onToChange("");
      return;
    }
    if (next < from) {
      onToChange(from);
      onFromChange(next);
    } else {
      onToChange(next);
    }
    setOpen(false);
  }
  return (
    <div className={`epx-date-range ${className}${disabled ? " is-locked" : ""}${toDisabled ? " is-no-end" : ""}`} ref={rootRef}>
      <DateField label="From" value={from} disabled={disabled} onChange={onFromChange} onPick={() => {
        setActiveField("from");
        setOpen(true);
      }} />
      <DateField label="To" align="end" value={to} disabled={disabled || toDisabled} onChange={onToChange} onPick={() => {
        setActiveField("to");
        setOpen(true);
      }} />
      {open && activeField === "from" && !(from && (to || toDisabled)) && (
        <button type="button" className="epx-date-range-open" disabled={disabled || toDisabled} onClick={() => setOpen(current => !current)}>
          {from && !to ? "Now choose the end date" : "Choose a date range"}
        </button>
      )}
      {open && !disabled && anchor && createPortal(
        <div ref={calendarRef} className={`epx-calendar is-floating is-range${anchor.openUp ? " is-up" : ""}`} style={{ top: anchor.top, left: anchor.left, width: anchor.width }}>
          <div className="epx-calendar-title">
            <button type="button" aria-label="Previous month" onClick={() => setCursor(new Date(year, month - 1, 1))}><img src="/assets/calendar/chevron-left.svg" alt="" /></button>
            <div><strong>{cursor.toLocaleString("en-AU", { month: "long" })}</strong><span>{year}</span></div>
            <button type="button" aria-label="Next month" onClick={() => setCursor(new Date(year, month + 1, 1))}><img src="/assets/calendar/chevron-right.svg" alt="" /></button>
          </div>
          <div className="epx-calendar-weekdays">{["M", "T", "W", "T", "F", "S", "S"].map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}</div>
          <div className="epx-calendar-weeks">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex}>
                {week.map(date => {
                  const key = iso(date);
                  const inMonth = date.getMonth() === month;
                  const isToday = date.toDateString() === new Date().toDateString();
                  const preview = !toDisabled && !to && from && hoverKey ? hoverKey : to;
                  const start = from && preview ? (from < preview ? from : preview) : from;
                  const end = from && preview ? (from < preview ? preview : from) : "";
                  const ranged = Boolean(start && end && start !== end);
                  const isStart = ranged && key === start;
                  const isEnd = ranged && key === end;
                  const inRange = Boolean(ranged && key > start && key < end);
                  const selected = Boolean(from) && !ranged && key === from;
                  return (
                    <button
                      type="button"
                      key={key}
                      className={`${inMonth ? "" : "is-outside"}${isToday ? " is-today" : ""}${selected ? " is-selected" : ""}${isStart ? " is-range-start" : ""}${isEnd ? " is-range-end" : ""}${inRange ? " is-in-range" : ""}`}
                      onMouseEnter={() => setHoverKey(key)}
                      onMouseLeave={() => setHoverKey(null)}
                      onClick={() => choose(date)}
                    >
                      <span>{date.getDate()}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}

function FieldLabel({ text, children }: { text: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-xs uppercase tracking-wider text-gray-500">
      {text}
      {children}
    </label>
  );
}

function MetaRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-3 text-xs">
      <span className="text-gray-400 flex-shrink-0">{label}</span>
      <span className={`text-right ${mono ? "font-mono" : ""} ${value === "—" ? "text-gray-300" : "text-black"}`}>{value}</span>
    </div>
  );
}
