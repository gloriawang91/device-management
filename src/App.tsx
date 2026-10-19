import { useState } from "react";

type Meter = {
  id: number; name: string; edgeId: string; type: string; source: string;
  status: string; online: string; critical: string; excluded: string; notifications: string;
  lastData: string; dataFormat: string; comAddress: string;
  contactName: string; contactEmail: string; contactPhone: string;
  criticalReason?: string; excludedFrom?: string; excludedTo?: string;
  excludedNoEndDate?: boolean; excludedReason?: string; notificationComment?: string;
  ctRatio?: string; pulseRatio?: string;
  nmiNo: string; serialNo: string; serialValidFrom?: string;
  serialHistory?: { serialNo: string; validFrom: string; validTo: string }[];
  captisNumber: string;
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
};

const INITIAL_METERS: Meter[] = [
  { id: 1, name: "Main Electricity", edgeId: "EDGE-5231", type: "Electricity", source: "CAPTIS", status: "Inactive", online: "Offline", critical: "No", excluded: "No", notifications: "Disabled", lastData: "2 min ago", dataFormat: "Captis API", comAddress: "192.168.1.48:502", contactName: "James Rourke", contactEmail: "j.rourke@ausgrid.com.au", contactPhone: "+61 2 9000 1234", ctRatio: "400:5", nmiNo: "NMI6301847200", serialNo: "883104220481", captisNumber: "CAP-00241" },
  { id: 2, name: "Chiller Plant", edgeId: "EDGE-3112", type: "Water", source: "SmartCom", status: "Active", online: "Offline", critical: "No", excluded: "No", notifications: "Enabled", lastData: "4 h ago", dataFormat: "CSV", comAddress: "10.0.0.22:4001", contactName: "Sandra Lim", contactEmail: "s.lim@jci.com", contactPhone: "+61 2 8801 5500", nmiNo: "NMI6303112048", serialNo: "311204781550", captisNumber: "CAP-00105" },
  { id: 3, name: "Water Device 01", edgeId: "EDGE-7301", type: "Water", source: "SmartCom II", status: "Active", online: "Online", critical: "No", excluded: "No", notifications: "Enabled", lastData: "3 min ago", dataFormat: "CSV", comAddress: "10.0.1.12:8080", contactName: "—", contactEmail: "—", contactPhone: "—", pulseRatio: "1 pulse / 10 L", nmiNo: "NMI6304120389", serialNo: "204918770326", captisNumber: "CAP-00389" },
  { id: 4, name: "Water Device 02", edgeId: "EDGE-4120", type: "Thermal", source: "Starcom", status: "Inactive", online: "Offline", critical: "No", excluded: "Yes", notifications: "Enabled", lastData: "8 h ago", dataFormat: "CSV", comAddress: "192.168.2.11:502", contactName: "Troy Hallis", contactEmail: "t.hallis@agl.com.au", contactPhone: "+61 3 8622 4100", pulseRatio: "1 pulse / 1 m³", nmiNo: "NMI6309012847", serialNo: "770240523104", captisNumber: "—" },
  { id: 5, name: "Solar Inverter A", edgeId: "EDGE-7410", type: "Gas", source: "CAPTIS", status: "Active", online: "Online", critical: "No", excluded: "No", notifications: "Disabled", lastData: "1 min ago", dataFormat: "Captis API", comAddress: "192.168.1.72:1502", contactName: "Priya Desai", contactEmail: "p.desai@fronius.com", contactPhone: "+61 7 3001 8842", ctRatio: "200:5", nmiNo: "NMI6300281947", serialNo: "600188427219", captisNumber: "CAP-00601" },
  { id: 6, name: "BMS Air Handler", edgeId: "EDGE-6204", type: "Electricity", source: "Edge G6", status: "Active", online: "Online", critical: "Yes", excluded: "No", notifications: "Enabled", lastData: "1 min ago", dataFormat: "BACnet/IP", comAddress: "10.0.0.88:47808", contactName: "Mark Stenhouse", contactEmail: "m.stenhouse@siemens.com", contactPhone: "+61 2 9394 5000", nmiNo: "NMI6306204178", serialNo: "620418939450", captisNumber: "CAP-00178" },
  { id: 7, name: "Cold Water Riser", edgeId: "EDGE-7044", type: "Gas", source: "BACNET_1", status: "Inactive", online: "Offline", critical: "Yes", excluded: "No", notifications: "Enabled", lastData: "8 days ago", dataFormat: "BACnet/IP", comAddress: "10.0.1.31:8080", contactName: "—", contactEmail: "—", contactPhone: "—", pulseRatio: "1 pulse / 50 L", nmiNo: "NMI6307044412", serialNo: "704412508031", captisNumber: "CAP-00412" },
  { id: 8, name: "Emergency Generator", edgeId: "EDGE-7188", type: "Digital", source: "NEM12", status: "Active", online: "Online", critical: "No", excluded: "No", notifications: "Enabled", lastData: "5 min ago", dataFormat: "NEM12", comAddress: "192.168.1.91:502", contactName: "Alex Nguyen", contactEmail: "a.nguyen@health.nsw.gov.au", contactPhone: "+61 2 9382 7111", ctRatio: "600:5", nmiNo: "NMI6307188042", serialNo: "718804291602", captisNumber: "—" },
  { id: 9, name: "Domestic Hot Water", edgeId: "EDGE-7236", type: "Analog", source: "Planter", status: "Active", online: "Online", critical: "Yes", excluded: "No", notifications: "Enabled", lastData: "12 min ago", dataFormat: "CSV", comAddress: "10.0.1.45:8080", contactName: "Olivia Chen", contactEmail: "o.chen@health.nsw.gov.au", contactPhone: "+61 2 9382 7004", pulseRatio: "1 pulse / 10 L", nmiNo: "NMI6307236198", serialNo: "723619834201", captisNumber: "CAP-00518" },
  { id: 10, name: "Theatre AHU 03", edgeId: "EDGE-6001", type: "Digital", source: "BACNET_1", status: "Active", online: "Offline", critical: "Yes", excluded: "Yes", notifications: "Enabled", lastData: "1 h ago", dataFormat: "BACnet/IP", comAddress: "10.0.0.103:47808", contactName: "Mark Stenhouse", contactEmail: "m.stenhouse@siemens.com", contactPhone: "+61 2 9394 5000", nmiNo: "NMI6307301554", serialNo: "730155409887", captisNumber: "—" },
  { id: 11, name: "Medical Gas Plant", edgeId: "EDGE-2048", type: "Electricity", source: "MODBUS", status: "Active", online: "Offline", critical: "No", excluded: "No", notifications: "Enabled", lastData: "2 days ago", dataFormat: "Modbus TCP", comAddress: "192.168.2.24:502", contactName: "Troy Hallis", contactEmail: "t.hallis@agl.com.au", contactPhone: "+61 3 8622 4100", pulseRatio: "1 pulse / 1 m³", nmiNo: "NMI6307410273", serialNo: "741027354118", captisNumber: "—" },
  { id: 12, name: "Car Park Lighting", edgeId: "EDGE-7522", type: "Thermal", source: "SmartCom II", status: "Active", online: "Online", critical: "No", excluded: "No", notifications: "Enabled", lastData: "7 min ago", dataFormat: "JSON", comAddress: "192.168.3.16:443", contactName: "Priya Desai", contactEmail: "p.desai@fronius.com", contactPhone: "+61 7 3001 8842", ctRatio: "100:5", nmiNo: "NMI6307522914", serialNo: "752291441056", captisNumber: "—" },
];

type SortKey = keyof Meter;
type View = "all" | "online" | "offline" | "critical" | "excluded";
type Page = "devices" | "data-management" | "reupload" | "nem12-log" | "incident-log";

const STATS = [
  { label: "Online", value: 213, filter: "online" as View },
  { label: "Offline", value: 16, filter: "offline" as View },
  { label: "Critical", value: 23, filter: "critical" as View },
  { label: "Excluded", value: 7, filter: "excluded" as View },
];

const ALL_COLUMN_KEYS: SortKey[] = [
  "name",
  "edgeId",
  "type",
  "source",
  "online",
  "status",
  "critical",
  "excluded",
  "notifications",
];

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
  const [search, setSearch] = useState("");
  const [view, setView] = useState<View>("all");
  const [selected, setSelected] = useState<number[]>([]);
  const [drawerMeterId, setDrawerMeterId] = useState<number | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [activeTab, setActiveTab] = useState<Page>("devices");
  const [reuploadView, setReuploadView] = useState<"new" | "history">("new");
  const [addDeviceOpen, setAddDeviceOpen] = useState(false);
  const [bulkModal, setBulkModal] = useState<{
    label: string;
    field: "excluded" | "notifications";
    value: string;
  } | null>(null);
  const [bulkFromDate, setBulkFromDate] = useState("");
  const [bulkToDate, setBulkToDate] = useState("");
  const [bulkReason, setBulkReason] = useState("");
  const [bulkComment, setBulkComment] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [columnPanelOpen, setColumnPanelOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<SortKey[]>(ALL_COLUMN_KEYS);
  const [columnOrder, setColumnOrder] = useState<SortKey[]>(ALL_COLUMN_KEYS);

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
      (view === "online" && m.online === "Online") ||
      (view === "offline" && m.online === "Offline") ||
      (view === "critical" && m.critical === "Yes") ||
      (view === "excluded" && m.excluded === "Yes");
    return matchSearch && matchView;
  }).sort((a, b) => {
    const av = a[sortKey] as string ?? "";
    const bv = b[sortKey] as string ?? "";
    return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
  });

  const drawerMeter = drawerMeterId !== null ? meters.find(m => m.id === drawerMeterId) ?? null : null;

  function patchMeter(id: number, patch: Partial<Meter>) {
    setMeters(ms => ms.map(m => m.id === id ? { ...m, ...patch } : m));
  }

  function addMeter(input: NewMeterInput) {
    setMeters(current => {
      const id = Math.max(...current.map(meter => meter.id), 0) + 1;
      return [...current, {
        id,
        name: input.name,
        edgeId: input.meterId,
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
        contactName: "—",
        contactEmail: "—",
        contactPhone: "—",
        nmiNo: input.nmiNo || "—",
        serialNo: input.serialNo || "000000000000",
        captisNumber: input.captisNumber || "—",
      }];
    });
    setAddDeviceOpen(false);
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

  function openBulkModal(label: string, field: "excluded" | "notifications", value: string) {
    setBulkModal({ label, field, value });
    setBulkFromDate("");
    setBulkToDate("");
    setBulkReason("");
    setBulkComment("");
  }

  function applyBulk() {
    if (!bulkModal) return;
    const patch: Partial<Meter> = bulkModal.field === "excluded"
      ? {
          excluded: bulkModal.value,
          excludedFrom: bulkFromDate,
          excludedTo: bulkToDate,
          excludedReason: bulkReason,
        }
      : {
          notifications: bulkModal.value,
          notificationComment: bulkComment,
        };
    setMeters(ms => ms.map(m => selected.includes(m.id) ? { ...m, ...patch } : m));
    setBulkModal(null);
  }

  const selectedMeters = meters.filter(m => selected.includes(m.id));
  const anyExcluded = selectedMeters.some(m => m.excluded === "Yes");
  const allExcluded = selectedMeters.length > 0 && selectedMeters.every(m => m.excluded === "Yes");
  const allNotifEnabled = selectedMeters.length > 0 && selectedMeters.every(m => m.notifications === "Enabled");
  const allNotifDisabled = selectedMeters.length > 0 && selectedMeters.every(m => m.notifications === "Disabled");

  const bulkActions: { label: string; action: () => void }[] = [];
  if (!allExcluded) bulkActions.push({ label: "Mark as excluded", action: () => openBulkModal("Mark as excluded", "excluded", "Yes") });
  if (anyExcluded) bulkActions.push({ label: "Remove from excluded", action: () => openBulkModal("Remove from excluded", "excluded", "No") });
  if (!allNotifEnabled) bulkActions.push({ label: "Enable notifications", action: () => openBulkModal("Enable notifications", "notifications", "Enabled") });
  if (!allNotifDisabled) bulkActions.push({ label: "Disable notifications", action: () => openBulkModal("Disable notifications", "notifications", "Disabled") });

  const bulkModalValid = bulkModal?.field === "excluded"
    ? Boolean(bulkFromDate && bulkToDate && bulkReason)
    : Boolean(bulkComment);

  const COLS: { key: SortKey; label: string }[] = [
    { key: "name", label: "Device Name" },
    { key: "edgeId", label: "EDGE Device ID" },
    { key: "type", label: "Device Type" },
    { key: "source", label: "Data Source" },
    { key: "online", label: "Online" },
    { key: "status", label: "Commissioning status" },
    { key: "critical", label: "Critical" },
    { key: "excluded", label: "Excluded" },
    { key: "notifications", label: "Notif." },
  ];
  const visibleCols = columnOrder
    .map(key => COLS.find(column => column.key === key))
    .filter((column): column is { key: SortKey; label: string } => Boolean(column) && visibleColumns.includes(column!.key));

  function toggleColumn(key: SortKey) {
    if (key === "name") return;
    setVisibleColumns(current => current.includes(key)
      ? current.filter(columnKey => columnKey !== key)
      : [...current, key]);
  }

  function reorderColumn(dragged: SortKey, target: SortKey) {
    if (dragged === target || dragged === "name") return;
    setColumnOrder(current => {
      const next = current.filter(key => key !== dragged);
      const targetIndex = next.indexOf(target);
      next.splice(Math.max(targetIndex, 1), 0, dragged);
      return next;
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
      case "online":
        return (
          <span className={`epx-online-status ${meter.online === "Online" ? "is-online" : "is-offline"}`}>
            <img
              src={meter.online === "Online"
                ? "/assets/device-management/2699a.svg"
                : "/assets/device-management/ba735.svg"}
              alt=""
            />
            {meter.online}
          </span>
        );
      case "status":
        return meter.status === "Inactive" ? (
          <span className="epx-inline-state is-inactive">
            <img src="/assets/device-management/d1332.svg" alt="" />
            Inactive
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
            <img src="/assets/device-management/ae471.svg" alt="" />
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
        return String(meter[key] ?? "–");
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
      title: "NEM12 data re-upload",
      description: "Reprocess historical NEM12 data for selected devices.",
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

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="epx-page-header flex items-center justify-between gap-6 border-b border-black px-6 pb-4 pt-5">
          <div>
            <div className="page-heading-title">
              {activePageDetails.title}
            </div>
            <div className="page-heading-description mt-1 text-gray-600">
              {activePageDetails.description}
            </div>
          </div>
          {activeTab === "devices" && (
            <button
              type="button"
              onClick={() => setAddDeviceOpen(true)}
              className="epx-primary-button"
            >
              Add device
            </button>
          )}
        </header>

        {activeTab === "devices" ? (
          <div className="flex flex-1 overflow-hidden">

        {/* Main content */}
          <div className="flex-1 flex flex-col overflow-hidden min-w-0">

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
          <div className="epx-toolbar border-b border-black px-4 py-3">
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

          {/* Bulk actions */}
          {selected.length > 0 && (
            <div className="border-b border-black bg-gray-50 px-4 py-2 flex items-center gap-3 flex-wrap">
              <span className="text-xs font-bold tabular-nums">{selected.length} selected</span>
              <div className="w-px h-4 bg-gray-400 flex-shrink-0" />
              {bulkActions.map(({ label, action }) => (
                <button
                  key={label}
                  onClick={action}
                  className="text-xs border border-black px-3 py-1 hover:bg-black hover:text-white transition-colors whitespace-nowrap"
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* Table */}
          <div className="epx-table-wrap flex min-h-0 flex-1 flex-col">
            <div className="epx-table-header">
              <span>229 Devices</span>
              <div className="epx-table-actions">
                <button
                  type="button"
                  aria-label="Choose visible columns"
                  aria-expanded={columnPanelOpen}
                  onClick={() => setColumnPanelOpen(true)}
                >
                  <img src="/assets/device-management/ae388.svg" alt="" />
                  Column Views
                </button>
              </div>
            </div>
            <div className="epx-table-scroll-shell">
              <div className="epx-table-scroll">
              <table className="epx-device-table w-full border-collapse">
              <thead>
                <tr>
                  {visibleCols.map(col => (
                    <th
                      key={col.key}
                      data-column={col.key}
                      className="cursor-pointer select-none whitespace-nowrap"
                      onClick={() => toggleSort(col.key)}
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
                        {["online", "status", "excluded"].includes(col.key) && (
                          <img src="/assets/device-management/c18e2.svg" alt="" />
                        )}
                        <img
                          src={col.key === "online"
                            ? "/assets/device-management/dc60a.svg"
                            : "/assets/device-management/64bff.svg"}
                          alt={sortKey === col.key ? `Sorted ${sortDir}ending` : ""}
                          className={sortKey === col.key && sortDir === "desc" ? "is-descending" : ""}
                        />
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => {
                  const isSelected = selected.includes(m.id);
                  const isActive = drawerMeterId === m.id;
                  return (
                    <tr
                      key={m.id}
                      className={`cursor-pointer ${isActive ? "is-active" : ""} ${isSelected ? "is-selected" : ""}`}
                      onClick={() => setDrawerMeterId(isActive ? null : m.id)}
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
              <button
                type="button"
                className="epx-table-scroll-button"
                aria-label="Scroll table right"
                onClick={event => (event.currentTarget.previousElementSibling as HTMLElement | null)?.scrollBy({ left: 400, behavior: "smooth" })}
              >
                <img src="/assets/device-management/a23c4.svg" alt="" />
              </button>
            </div>
            <div className="epx-table-footer">
              <div className="epx-results-per-page">
                <button type="button">
                  12
                  <img src="/assets/device-management/3c143.svg" alt="" />
                </button>
                <span>Results per page</span>
              </div>
              <nav className="epx-pagination" aria-label="Device table pagination">
                <button
                  type="button"
                  aria-label="Previous page"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                >
                  <img src="/assets/device-management/a90a9.svg" alt="" />
                </button>
                {[1, 2, 3].map(page => (
                  <button
                    type="button"
                    key={page}
                    aria-current={currentPage === page ? "page" : undefined}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}
                <span>…</span>
                {[8, 9, 10].map(page => (
                  <button
                    type="button"
                    key={page}
                    aria-current={currentPage === page ? "page" : undefined}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}
                <button
                  type="button"
                  aria-label="Next page"
                  disabled={currentPage === 10}
                  onClick={() => setCurrentPage(page => Math.min(10, page + 1))}
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="bulk-action-title"
        >
          <div className="w-full max-w-md border-2 border-black bg-white">
            <div className="border-b border-black px-5 py-4">
              <div id="bulk-action-title" className="text-sm font-bold uppercase tracking-wide">
                {bulkModal.label}
              </div>
              <div className="mt-1 text-xs text-gray-500">{selected.length} devices selected</div>
            </div>
            <div className="flex flex-col gap-3 px-5 py-4">
              {bulkModal.field === "excluded" ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <FieldLabel text="From date">
                      <input
                        type="date"
                        value={bulkFromDate}
                        onChange={event => setBulkFromDate(event.target.value)}
                        className="w-full border border-gray-400 bg-white px-2 py-1.5 text-xs normal-case tracking-normal outline-none focus:border-black"
                      />
                    </FieldLabel>
                    <FieldLabel text="To date">
                      <input
                        type="date"
                        value={bulkToDate}
                        onChange={event => setBulkToDate(event.target.value)}
                        className="w-full border border-gray-400 bg-white px-2 py-1.5 text-xs normal-case tracking-normal outline-none focus:border-black"
                      />
                    </FieldLabel>
                  </div>
                  <FieldLabel text="Reason">
                    <select
                      value={bulkReason}
                      onChange={event => setBulkReason(event.target.value)}
                      className="w-full border border-gray-400 bg-white px-2 py-1.5 text-xs normal-case tracking-normal outline-none focus:border-black"
                    >
                      <option value="">Select reason</option>
                      <option>Planned maintenance</option>
                      <option>Fault investigation</option>
                      <option>Decommissioned</option>
                      <option>Other</option>
                    </select>
                  </FieldLabel>
                </>
              ) : (
                <FieldLabel text="Comment">
                  <textarea
                    value={bulkComment}
                    onChange={event => setBulkComment(event.target.value)}
                    rows={4}
                    placeholder="Add a comment for this notification change"
                    className="w-full resize-none border border-gray-400 bg-white px-2 py-1.5 text-xs normal-case tracking-normal outline-none placeholder:text-gray-400 focus:border-black"
                  />
                </FieldLabel>
              )}
            </div>
            <div className="flex justify-end gap-2 border-t border-black px-5 py-3">
              <button
                type="button"
                onClick={() => setBulkModal(null)}
                className="border border-gray-400 px-3 py-1.5 text-xs hover:border-black"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={applyBulk}
                disabled={!bulkModalValid}
                className="border border-black bg-black px-3 py-1.5 text-xs text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-gray-200 disabled:text-gray-400"
              >
                Apply to {selected.length} devices
              </button>
            </div>
          </div>
        </div>
      )}

      {columnPanelOpen && (
        <ColumnViewPanel
          columns={COLS}
          visibleColumns={visibleColumns}
          columnOrder={columnOrder}
          onClose={() => setColumnPanelOpen(false)}
          onToggleColumn={toggleColumn}
          onReorderColumn={reorderColumn}
        />
      )}

      {addDeviceOpen && (
        <AddDeviceModal
          onClose={() => setAddDeviceOpen(false)}
          onAdd={addMeter}
        />
      )}
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
}: {
  columns: { key: SortKey; label: string }[];
  visibleColumns: SortKey[];
  columnOrder: SortKey[];
  onClose: () => void;
  onToggleColumn: (key: SortKey) => void;
  onReorderColumn: (dragged: SortKey, target: SortKey) => void;
}) {
  const [collapsedGroups, setCollapsedGroups] = useState<string[]>([]);
  const [draggedColumn, setDraggedColumn] = useState<SortKey | null>(null);
  const groups = [
    {
      id: "device-information",
      label: "Device information",
      columns: ["name", "edgeId", "type", "source"] as SortKey[],
    },
    {
      id: "device-status",
      label: "Device status",
      columns: ["online", "status", "critical", "excluded", "notifications"] as SortKey[],
    },
  ];
  const labelFor = (key: SortKey) => columns.find(column => column.key === key)?.label ?? key;
  const visibleOrderedColumns = columnOrder.filter(key => visibleColumns.includes(key));

  function toggleGroup(groupId: string) {
    setCollapsedGroups(current => current.includes(groupId)
      ? current.filter(id => id !== groupId)
      : [...current, groupId]);
  }

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
            <span className="epx-column-count">{visibleOrderedColumns.length}</span>
          </div>
          <div className="epx-column-divider" />
          <div className="epx-current-columns">
            {visibleOrderedColumns.map((key, index) => (
              <div
                key={key}
                className={`epx-column-item ${index === 0 ? "is-highlighted" : ""}`}
                draggable={key !== "name"}
                onDragStart={() => {
                  setDraggedColumn(key);
                }}
                onDragEnd={() => setDraggedColumn(null)}
                onDragOver={event => event.preventDefault()}
                onDrop={() => {
                  if (draggedColumn) onReorderColumn(draggedColumn, key);
                  setDraggedColumn(null);
                }}
              >
                <img src="/assets/column-view/c1a46.svg" alt="" />
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
        </section>

        {groups.map(group => {
          const isCollapsed = collapsedGroups.includes(group.id);
          const visibleCount = group.columns.filter(key => visibleColumns.includes(key)).length;
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
                    const isVisible = visibleColumns.includes(key);
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
  onAdd: (input: NewMeterInput) => void;
}) {
  const [utility, setUtility] = useState("");
  const [meterName, setMeterName] = useState("");
  const [meterId, setMeterId] = useState("");
  const [source, setSource] = useState<"" | "NEM12" | "Captis">("NEM12");
  const [dataFormat, setDataFormat] = useState("");
  const [nmiNo, setNmiNo] = useState("");
  const [serialNo, setSerialNo] = useState("");
  const [validFrom, setValidFrom] = useState("");
  const [captisId, setCaptisId] = useState("");
  const [apiIdentifier, setApiIdentifier] = useState("");

  const sourceValid = source === "NEM12"
    ? Boolean(nmiNo.length === 11 && serialNo.length === 12 && validFrom)
    : source === "Captis"
      ? Boolean(captisId && apiIdentifier && dataFormat)
      : false;
  const saveValid = Boolean(utility && meterName && meterId && sourceValid);

  function handleSourceChange(next: "NEM12" | "Captis") {
    setSource(next);
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
    >
      <div className="epx-add-device-dialog">
        <div className="epx-add-device-header">
          <div id="add-device-title">Add device</div>
          <button type="button" onClick={onClose} aria-label="Close">
            <img src="/assets/add-device/7bf08.svg" alt="" />
          </button>
        </div>

        <div className="epx-add-device-content">
          <div className="epx-add-device-grid">
            <label className="epx-add-device-field">
              <span>Utility</span>
              <span className="epx-add-device-select">
                <select
                  value={utility}
                  onChange={e => setUtility(e.target.value)}
                >
                  <option value="">Select utility</option>
                  <option>Electricity</option>
                  <option>Water</option>
                  <option>Gas</option>
                  <option>Thermal</option>
                  <option>Digital</option>
                  <option>Analog</option>
                </select>
                <img src="/assets/add-device/988a8.svg" alt="" />
              </span>
            </label>
            <label className="epx-add-device-field">
              <span>Device Name</span>
                <input
                  value={meterName}
                  onChange={e => setMeterName(e.target.value)}
                  placeholder="Input name"
                />
            </label>
            <label className="epx-add-device-field">
              <span>Edge Device ID</span>
                <input
                  value={meterId}
                  onChange={e => setMeterId(e.target.value)}
                  placeholder="PM0001"
                />
            </label>
          </div>

          <div className="epx-add-device-source">
            <span>Data source</span>
            <div>
              {(["NEM12", "Captis"] as const).map(opt => (
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

          {source === "NEM12" && (
            <div className="epx-add-device-grid">
              <label className="epx-add-device-field">
                <span>NMI number</span>
                <input
                  value={nmiNo}
                  onChange={e => setNmiNo(e.target.value.replace(/\D/g, "").slice(0, 11))}
                  inputMode="numeric"
                  placeholder="11 digits"
                />
              </label>
              <label className="epx-add-device-field">
                <span>Serial number</span>
                <input
                  value={serialNo}
                  onChange={e => setSerialNo(e.target.value.replace(/\D/g, "").slice(0, 12))}
                  inputMode="numeric"
                  placeholder="12 digits"
                />
              </label>
              <label className="epx-add-device-field">
                <span>Valid from</span>
                <span className="epx-add-device-date">
                  <input type="date" value={validFrom} onChange={e => setValidFrom(e.target.value)} />
                  <img src="/assets/add-device/6396d.svg" alt="" />
                </span>
              </label>
            </div>
          )}

          {source === "Captis" && (
            <div className="epx-add-device-grid">
              <label className="epx-add-device-field">
                <span>Captis device ID</span>
                <input value={captisId} onChange={e => setCaptisId(e.target.value)} placeholder="CAP-XXXXX" />
              </label>
              <label className="epx-add-device-field">
                <span>API identifier</span>
                <input value={apiIdentifier} onChange={e => setApiIdentifier(e.target.value)} placeholder="Endpoint or key" />
              </label>
              <label className="epx-add-device-field">
                <span>Data format</span>
                <span className="epx-add-device-select">
                  <select value={dataFormat} onChange={e => setDataFormat(e.target.value)}>
                    <option value="">Select format</option>
                    <option>Captis API</option>
                    <option>CSV</option>
                    <option>JSON</option>
                    <option>XML</option>
                  </select>
                  <img src="/assets/add-device/988a8.svg" alt="" />
                </span>
              </label>
            </div>
          )}
        </div>

        <div className="epx-add-device-footer">
          <button type="button" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            disabled={!saveValid}
            onClick={() => onAdd({
              utility,
              name: meterName,
              meterId,
              source,
              dataFormat: source === "NEM12" ? "NEM12" : dataFormat,
              nmiNo: source === "NEM12" ? nmiNo : "—",
              serialNo: source === "NEM12" ? serialNo : "—",
              captisNumber: source === "Captis" ? captisId : "—",
            })}
            className="is-primary"
          >
            Save
          </button>
        </div>
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
        {["NEM12", "Captis"].map(option => (
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
          <ModalField label="Valid From">
            <input type="date" value={validFrom} onChange={event => onValidFromChange(event.target.value)} className="w-full border border-black bg-white px-3 py-2 text-sm outline-none" />
          </ModalField>
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
  const [siteDropdownOpen, setSiteDropdownOpen] = useState(false);
  const [siteSearch, setSiteSearch] = useState("");
  const [selectedMeters, setSelectedMeters] = useState<number[]>([]);
  const [fromDate, setFromDate] = useState("2026-09-01");
  const [toDate, setToDate] = useState("2026-09-30");
  const [method, setMethod] = useState<"automatic" | "manual">("automatic");
  const [fileName, setFileName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showCompletionAlert, setShowCompletionAlert] = useState(true);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

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
      siteCount: 3,
      devices: makeRequestDevices(1, 4),
      dateRange: "Sep 2026",
      status: "Processing",
      progress: "45%",
      fileName: "",
    },
    {
      id: "DR-2030",
      submitted: "30 Sep 2026",
      provider: "Intellihub",
      siteCount: 5,
      devices: makeRequestDevices(5, 12),
      dateRange: "Aug 2026",
      status: "Complete",
      progress: "100%",
      fileName: "NEM12_August_2026.csv",
    },
    {
      id: "DR-2029",
      submitted: "29 Sep 2026",
      provider: "Energy Australia",
      siteCount: 2,
      devices: makeRequestDevices(17, 6),
      dateRange: "Jul 2026",
      status: "Failed",
      progress: "Error",
      fileName: "NEM12_July_2026.csv",
    },
  ];
  const selectedRequest = requestHistory.find(request => request.id === selectedRequestId) ?? null;
  const selectionReady = entryMode === "mdp" ? Boolean(provider) : entryMode === "site" && selectedSites.length > 0;
  const visibleSites = SITES.filter(site => site.toLowerCase().includes(siteSearch.toLowerCase()));
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
    setSiteDropdownOpen(false);
    setSiteSearch("");
    setSelectedMeters([]);
    setFromDate("2026-09-01");
    setToDate("2026-09-30");
    setMethod("automatic");
    setFileName("");
    setSubmitted(false);
  }

  return (
    <div className="epx-page flex-1 overflow-y-auto bg-gray-50">
      <div className="px-6 py-6">
        <div className="mb-6 flex border-b border-black">
          <button
            type="button"
            onClick={() => {
              cancelRequest();
              onRequestViewChange("new");
            }}
            className={`-mb-px border border-b-0 border-black px-4 py-2.5 text-sm ${requestView === "new" ? "bg-black text-white" : "bg-white text-black hover:bg-gray-100"}`}
            aria-current={requestView === "new" ? "page" : undefined}
          >
            New request
          </button>
          <button
            type="button"
            onClick={() => onRequestViewChange("history")}
            className={`-mb-px flex items-center gap-2 border-y border-r border-black px-4 py-2.5 text-sm ${requestView === "history" ? "bg-black text-white" : "bg-white text-black hover:bg-gray-100"}`}
            aria-current={requestView === "history" ? "page" : undefined}
          >
            Request history
            <span className={`flex h-5 min-w-5 items-center justify-center rounded-full border px-1 text-xs ${requestView === "history" ? "border-white bg-white text-black" : "border-black bg-black text-white"}`}>
              1
            </span>
          </button>
        </div>

        {requestView === "new" ? (
          <div className="max-w-6xl space-y-5">
            {!submitted ? (
              <div className="space-y-4">

                {/* Step 1: Entry point */}
                <section className="border border-black bg-white">
                  <div className="border-b border-black px-4 py-3">
                    <div className="text-sm font-bold">Step 1 — How would you like to start?</div>
                    <div className="mt-1 text-xs text-gray-500">Choose whether to select devices via a Meter Data Provider or directly by site.</div>
                  </div>
                  <div className="flex flex-col gap-4 p-4">
                    <div className="grid grid-cols-2 border border-black">
                      <label className={`flex cursor-pointer items-center gap-2 border-r border-black px-3 py-2.5 text-sm ${entryMode === "site" ? "bg-black text-white" : "hover:bg-gray-100"}`}>
                        <input
                          type="radio"
                          name="reupload-entry-mode"
                          value="site"
                          checked={entryMode === "site"}
                          onChange={() => {
                            setEntryMode("site");
                            setProvider("");
                            setSelectedSites([]);
                            setSiteDropdownOpen(false);
                            setSiteSearch("");
                            setSelectedMeters([]);
                          }}
                          className="accent-black"
                        />
                        Site
                      </label>
                      <label className={`flex cursor-pointer items-center gap-2 px-3 py-2.5 text-sm ${entryMode === "mdp" ? "bg-black text-white" : "hover:bg-gray-100"}`}>
                        <input
                          type="radio"
                          name="reupload-entry-mode"
                          value="mdp"
                          checked={entryMode === "mdp"}
                          onChange={() => {
                            setEntryMode("mdp");
                            setProvider("Intellihub");
                            setSelectedSites(SITES.slice(0, Math.min(3, meters.length)));
                            setSiteDropdownOpen(false);
                            setSiteSearch("");
                            setSelectedMeters(meters.map(meter => meter.id));
                          }}
                          className="accent-black"
                        />
                        Meter Data Provider (MDP)
                      </label>
                    </div>

                    {entryMode === "mdp" && (
                      <ReuploadField label="Meter Data Provider (MDP)">
                        <select
                          value={provider}
                          onChange={event => {
                            const nextProvider = event.target.value;
                            setProvider(nextProvider);
                            setSelectedSites(nextProvider ? SITES.slice(0, Math.min(3, meters.length)) : []);
                            setSelectedMeters(nextProvider ? meters.map(meter => meter.id) : []);
                          }}
                          className="w-full border border-black bg-white px-3 py-2 text-sm outline-none"
                        >
                          <option value="">Select provider</option>
                          <option>Intellihub</option>
                          <option>Energy Australia</option>
                          <option>Essential Energy</option>
                        </select>
                      </ReuploadField>
                    )}

                    {entryMode === "site" && (
                      <div className="relative flex flex-col gap-1.5">
                        <div className="text-xs font-bold">Site</div>
                      <button
                        type="button"
                        onClick={() => setSiteDropdownOpen(open => !open)}
                        className="flex w-full items-center justify-between border border-black bg-white px-3 py-2 text-left text-sm"
                        aria-haspopup="listbox"
                        aria-expanded={siteDropdownOpen}
                      >
                        <span className={selectedSites[0] ? "text-black" : "text-gray-500"}>
                          {selectedSites[0] || "Select site"}
                        </span>
                        <span aria-hidden="true">⌄</span>
                      </button>
                      {siteDropdownOpen && (
                        <div className="absolute left-0 right-0 top-full z-20 mt-1 border-2 border-black bg-white">
                          <div className="border-b border-black p-2">
                            <input
                              type="search"
                              value={siteSearch}
                              onChange={event => setSiteSearch(event.target.value)}
                              placeholder="Search sites..."
                              autoFocus
                              className="w-full border border-black bg-white px-3 py-2 text-sm outline-none placeholder:text-gray-400"
                            />
                          </div>
                          <div className="max-h-48 overflow-y-auto" role="listbox" aria-label="Sites">
                            {visibleSites.map(site => (
                              <button
                                key={site}
                                type="button"
                                role="option"
                                aria-selected={selectedSites[0] === site}
                                onClick={() => {
                                  setSelectedSites([site]);
                                  setSelectedMeters(meters.map(meter => meter.id));
                                  setSiteDropdownOpen(false);
                                  setSiteSearch("");
                                }}
                                className={`w-full border-b border-gray-200 px-3 py-2 text-left text-sm last:border-b-0 ${selectedSites[0] === site ? "bg-black text-white" : "hover:bg-gray-100"}`}
                              >
                                {site}
                              </button>
                            ))}
                            {visibleSites.length === 0 && (
                              <div className="px-3 py-4 text-center text-xs text-gray-500">No sites found.</div>
                            )}
                          </div>
                        </div>
                      )}
                      </div>
                    )}
                  </div>
                </section>

                {/* Step 2: Included sites and devices */}
                <section className="border border-black bg-white">
                    <div className="border-b border-black px-4 py-3">
                      <div className="text-sm font-bold">
                        Step 2 — {entryMode === "mdp" ? "Confirm included sites" : "Select devices"}
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        {entryMode === "mdp"
                          ? "All devices within each included site will be re-uploaded."
                          : selectedSites[0]
                            ? `Choose the devices to re-upload at ${selectedSites[0]}.`
                            : "Select a site in Step 1 to view its devices."}
                      </div>
                    </div>
                    {selectionReady ? (
                      <div className="flex flex-col gap-4 p-4">
                      <div className="border border-black">
                        <div id="device-selection-list">
                            {entryMode === "mdp" && (
                              <label className="flex cursor-pointer items-center justify-between gap-4 border-b border-black bg-gray-100 px-3 py-2.5">
                                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                                  <input
                                    type="checkbox"
                                    checked={allMdpSitesSelected}
                                    onChange={toggleAllMdpSites}
                                    className="accent-black"
                                  />
                                  All sites
                                </span>
                                <span className="text-xs">{meters.length} devices total</span>
                              </label>
                            )}
                            {entryMode === "mdp" ? (
                              <div className="divide-y divide-gray-300">
                                {meterGroups.map(group => {
                                  const included = selectedSites.includes(group.site);
                                  return (
                                    <label key={group.site} className="flex cursor-pointer items-center justify-between gap-4 px-3 py-2.5 hover:bg-gray-50">
                                      <span className="flex items-center gap-2 text-sm">
                                        <input
                                          type="checkbox"
                                          checked={included}
                                          onChange={() => toggleSiteGroup(group)}
                                          className="accent-black"
                                        />
                                        {group.site}
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        {group.meters.length} {group.meters.length === 1 ? "device" : "devices"} included
                                      </span>
                                    </label>
                                  );
                                })}
                              </div>
                            ) : (
                              <>
                                <div className="flex items-center justify-between gap-4 border-b border-black bg-black px-3 py-2 text-white">
                                  <span className="text-xs font-bold uppercase tracking-wider">Intellihub</span>
                                  <label className="flex cursor-pointer items-center gap-2 text-xs font-bold uppercase tracking-wider">
                                    <input
                                      type="checkbox"
                                      checked={allSiteDevicesSelected}
                                      onChange={() => setSelectedMeters(allSiteDevicesSelected ? [] : meters.map(meter => meter.id))}
                                      className="accent-black"
                                    />
                                    All devices
                                  </label>
                                </div>
                                <div className="divide-y divide-gray-300">
                                  {meters.map(meter => (
                                    <label key={meter.id} className="flex cursor-pointer items-center justify-between gap-4 px-3 py-2.5 hover:bg-gray-50">
                                      <span className="flex items-center gap-2 text-sm">
                                        <input
                                          type="checkbox"
                                          checked={selectedMeters.includes(meter.id)}
                                          onChange={() => toggleMeter(meter.id)}
                                          className="accent-black"
                                        />
                                        {meter.name}
                                      </span>
                                      <span className="text-xs text-gray-500">{meter.edgeId}</span>
                                    </label>
                                  ))}
                                </div>
                              </>
                            )}
                        </div>
                      </div>
                      <div className="text-xs font-bold">
                        {entryMode === "mdp"
                          ? `Included: ${selectedSites.length} ${selectedSites.length === 1 ? "site" : "sites"} · ${selectedMeters.length} devices`
                          : `Included: ${selectedMeters.length} devices`}
                      </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 px-4 py-6 text-center text-xs text-gray-500">
                        Complete Step 1 to configure included sites and devices.
                      </div>
                    )}
                </section>

                {/* Date range + method */}
                <section className="border border-black bg-white">
                    <div className="border-b border-black px-4 py-3">
                      <div className="text-sm font-bold">Step 3 — Date range &amp; method</div>
                    </div>
                    <div className="flex flex-col gap-5 p-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <ReuploadField label="From date">
                          <input type="date" value={fromDate} onChange={event => setFromDate(event.target.value)} disabled={!step1Complete} className="w-full border border-black bg-white px-3 py-2 text-sm outline-none disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400" />
                        </ReuploadField>
                        <ReuploadField label="To date">
                          <input type="date" value={toDate} onChange={event => setToDate(event.target.value)} disabled={!step1Complete} className="w-full border border-black bg-white px-3 py-2 text-sm outline-none disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400" />
                        </ReuploadField>
                      </div>
                      <div className="text-xs text-gray-500">Only data within this period will be reprocessed.</div>
                      <label className={`flex items-start gap-3 border-t border-gray-200 pt-4 ${step1Complete ? "cursor-pointer" : "cursor-not-allowed text-gray-400"}`}>
                        <input type="checkbox" checked={method === "manual"} onChange={event => setMethod(event.target.checked ? "manual" : "automatic")} disabled={!step1Complete} className="mt-0.5 accent-black" />
                        <span>
                          <span className="block text-xs font-bold">Upload a NEM12 file manually</span>
                          <span className="mt-1 block text-xs text-gray-500">Use this fallback when automatic historical retrieval is unavailable.</span>
                        </span>
                      </label>
                      {method === "manual" && (
                        <label className="flex cursor-pointer items-center justify-between border border-dashed border-black bg-white px-3 py-3 hover:bg-gray-50">
                          <span className="text-sm">Choose file</span>
                          <span className="text-xs text-gray-500">{fileName || "No file selected"}</span>
                          <input type="file" accept=".csv,.nem12,.txt" className="sr-only" onChange={event => setFileName(event.target.files?.[0]?.name ?? "")} />
                        </label>
                      )}
                      <div className="flex justify-end gap-2 border-t border-gray-200 pt-4">
                        <button type="button" onClick={cancelRequest} className="border border-black px-4 py-2 text-sm hover:bg-gray-100">Cancel</button>
                        <button
                          type="button"
                          onClick={() => setSubmitted(true)}
                          disabled={!step1Complete || !step2Valid || (method === "manual" && !fileName)}
                          className="border border-black bg-black px-4 py-2 text-sm text-white hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-gray-300"
                        >
                          Start re-upload
                        </button>
                      </div>
                    </div>
                  </section>
              </div>
            ) : (
              <section className="border border-black bg-white p-6">
                <div className="text-lg font-bold">✓ Re-upload request submitted</div>
                <div className="mt-5 text-sm">
                  Request ID: <span className="font-bold">DR-2031</span>
                </div>
                <div className="mt-4 text-sm leading-6 text-gray-600">
                  <div>Data will be processed in the background.</div>
                  <div>You can monitor its progress from Request History.</div>
                  <div>We will email you when processing is complete.</div>
                </div>
                <button
                  type="button"
                  onClick={cancelRequest}
                  className="mt-6 border border-black bg-black px-4 py-2 text-sm text-white hover:bg-white hover:text-black"
                >
                  New request
                </button>
              </section>
            )}
          </div>
        ) : (
          <>
          {showCompletionAlert && (
            <div className="mb-4 border-2 border-black bg-white">
              <div className="flex items-center justify-between gap-4 border-b border-black px-4 py-3">
                <div className="text-sm font-bold">✅ Completed Since Last Visit (1)</div>
                <button
                  type="button"
                  onClick={() => setShowCompletionAlert(false)}
                  className="text-lg leading-none text-gray-500 hover:text-black"
                  aria-label="Dismiss completed request alert"
                >
                  ×
                </button>
              </div>
              <div className="grid gap-1 px-4 py-3 text-xs sm:grid-cols-3 sm:gap-4">
                <div className="font-bold">DR-2031</div>
                <div>Completed yesterday</div>
                <div>12 devices processed</div>
              </div>
            </div>
          )}
          <div className="border border-black bg-white">
            <div className="border-b border-black px-4 py-4">
              <div className="text-sm font-bold uppercase tracking-wider">Re-upload Request History</div>
              <div className="mt-1 text-xs text-gray-500">Monitor previous requests and processing outcomes.</div>
            </div>
            <div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-max border-collapse text-xs">
                  <thead className="bg-gray-100">
                    <tr className="border-b border-black">
                      {["Request ID", "Submitted", "Provider", "Site count", "Devices", "Date Range", "Status", "Progress", "File"].map(column => (
                        <th key={column} className="px-4 py-3 text-left uppercase tracking-wider">{column}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {requestHistory.map(request => {
                      const remainingDevices = request.devices.length - 2;
                      const isSelected = selectedRequestId === request.id;
                      return (
                        <tr
                          key={request.id}
                          tabIndex={0}
                          onClick={() => setSelectedRequestId(isSelected ? null : request.id)}
                          onKeyDown={event => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              setSelectedRequestId(isSelected ? null : request.id);
                            }
                          }}
                          className={`cursor-pointer border-b border-gray-300 last:border-b-0 ${isSelected ? "bg-black text-white" : "hover:bg-gray-100"}`}
                          aria-selected={isSelected}
                        >
                          <td className="px-4 py-3 font-bold">{request.id}</td>
                          <td className="px-4 py-3">{request.submitted}</td>
                          <td className="px-4 py-3">{request.provider}</td>
                          <td className="px-4 py-3">{request.siteCount}</td>
                          <td className="whitespace-nowrap px-4 py-3">
                            {request.devices.slice(0, 2).map(device => device.edgeId).join(", ")}
                            {remainingDevices > 0 ? ` +${remainingDevices}` : ""}
                          </td>
                          <td className="px-4 py-3">{request.dateRange}</td>
                          <td className="px-4 py-3">{request.status}</td>
                          <td className="px-4 py-3">{request.progress}</td>
                          <td className="px-4 py-3">
                            {request.fileName ? (
                              <a
                                href={`data:text/plain;charset=utf-8,${encodeURIComponent(`NEM12 export for ${request.id}`)}`}
                                download={request.fileName}
                                onClick={event => event.stopPropagation()}
                                className={`inline-flex border p-1.5 ${isSelected ? "border-white hover:bg-white hover:text-black" : "border-black hover:bg-black hover:text-white"}`}
                                aria-label={`Download ${request.fileName}`}
                                title={`Download ${request.fileName}`}
                              >
                                <NavIcon type="file" />
                              </a>
                            ) : (
                              <span className={isSelected ? "text-gray-300" : "text-gray-400"}>—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          {selectedRequest && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
              role="dialog"
              aria-modal="true"
              aria-labelledby="request-devices-title"
              onClick={() => setSelectedRequestId(null)}
            >
              <div
                className="flex max-h-[80vh] w-full max-w-5xl flex-col border-2 border-black bg-white"
                onClick={event => event.stopPropagation()}
              >
                <div className="flex items-center justify-between gap-4 border-b border-black px-4 py-3">
                  <div>
                    <div id="request-devices-title" className="text-sm font-bold uppercase tracking-wider">
                      Devices in {selectedRequest.id}
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      {selectedRequest.devices.length} devices across {selectedRequest.siteCount} sites
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedRequestId(null)}
                    className="px-1 text-xl leading-none text-gray-500 hover:text-black"
                    aria-label="Close device details"
                  >
                    ×
                  </button>
                </div>
                <div className="overflow-auto">
                  <table className="w-full min-w-max border-collapse text-xs">
                    <thead className="sticky top-0 bg-gray-100">
                      <tr className="border-b border-black">
                        {["Portfolio", "Site", "EDGE ID no.", "NMI #", "Serial #"].map(column => (
                          <th key={column} className="px-4 py-3 text-left uppercase tracking-wider">{column}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {selectedRequest.devices.map(device => (
                        <tr key={device.edgeId} className="border-b border-gray-300 last:border-b-0">
                          <td className="px-4 py-3">{device.portfolio}</td>
                          <td className="px-4 py-3">{device.site}</td>
                          <td className="px-4 py-3 font-bold">{device.edgeId}</td>
                          <td className="px-4 py-3">{device.nmi}</td>
                          <td className="px-4 py-3">{device.serial}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          </>
        )}
      </div>
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
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  return (
    <aside className="epx-sidebar flex flex-shrink-0 flex-col">
      <div className="epx-brand">
        <img src="/assets/9d714.png" alt="epx" className="epx-logo" />
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
        <div>Portfolio</div>
        <button type="button">
          <img src="/assets/device-management/e89d0.svg" alt="" />
          Portfolio view
        </button>
        <button type="button">
          <img src="/assets/device-management/3f3e0.svg" alt="" />
          <span>Portfolio management</span>
          <span className="epx-nav-badge">12</span>
        </button>

        <div>Site</div>
        <button type="button">
          <img src="/assets/device-management/a4560.svg" alt="" />
          Monthly records
        </button>
        <button
          type="button"
          onClick={() => onNavigate("devices")}
          className={activePage === "devices" ? "is-active" : ""}
          aria-current={activePage === "devices" ? "page" : undefined}
        >
          <img src="/assets/device-management/eb1ac.svg" alt="" />
          Device management
        </button>

        <div>Operations</div>
        <button
          type="button"
          onClick={() => onNavigate("data-management")}
          className={activePage !== "devices" ? "is-active" : ""}
          aria-current={activePage === "data-management" ? "page" : undefined}
        >
          <img src="/assets/device-management/e28cc.svg" alt="" />
          Data management
        </button>
        {activePage !== "devices" && (
          <div className="epx-subnav">
            <button type="button" onClick={() => onNavigate("reupload")} aria-current={activePage === "reupload" ? "page" : undefined}>NEM12 data reupload</button>
            <button type="button" onClick={() => onNavigate("nem12-log")} aria-current={activePage === "nem12-log" ? "page" : undefined}>NEM12 data log</button>
            <button type="button" onClick={() => onNavigate("incident-log")} aria-current={activePage === "incident-log" ? "page" : undefined}>Incident issue log</button>
          </div>
        )}
      </nav>

      <div className="epx-sidebar-footer">
        <div className="epx-edge-link">
          <button type="button">
            <img src="/assets/device-management/9824b.svg" alt="" />
            Edge Classic
          </button>
          <img src="/assets/device-management/6c665.svg" alt="" />
        </div>
        <div className="epx-user-row">
          {notificationsOpen && (
            <div className="epx-notifications-popover">
              <div className="flex items-center justify-between border-b border-black px-3 py-2">
                <div className="text-xs font-bold uppercase tracking-wider">Notifications</div>
                <button
                  type="button"
                  onClick={() => setNotificationsOpen(false)}
                  className="text-base leading-none text-gray-500 hover:text-black"
                  aria-label="Close notifications"
                >
                  ×
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  onOpenRequestHistory();
                  setNotificationsOpen(false);
                }}
                className="flex w-full items-start gap-3 px-3 py-3 text-left hover:bg-gray-100"
              >
                <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-black" />
                <span>
                  <span className="block text-xs font-bold">Re-upload DR-2031 completed</span>
                  <span className="mt-1 block text-xs text-gray-500">Yesterday</span>
                </span>
              </button>
            </div>
          )}
          <img src="/assets/device-management/c6f2f.svg" alt="" />
          <span>John Doe</span>
          <button
            type="button"
            onClick={() => setNotificationsOpen(open => !open)}
            aria-label="Open notifications"
          >
            <img src="/assets/device-management/01b43.svg" alt="" />
          </button>
        </div>
      </div>
      <button className="epx-sidebar-toggle" type="button" aria-label="Collapse navigation">
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
  const [editingSerial, setEditingSerial] = useState(false);
  const [serialTab, setSerialTab] = useState<"update" | "history">("update");
  const [newSerial, setNewSerial] = useState("");
  const [serialValidFrom, setSerialValidFrom] = useState("");
  const [pendingSerialUpdate, setPendingSerialUpdate] = useState<{
    serialNo: string;
    validFrom: string;
  } | null>(null);
  const [configuringSource, setConfiguringSource] = useState(false);
  const [configSource, setConfigSource] = useState<"NEM12" | "Captis" | "">("");
  const [configNmi, setConfigNmi] = useState("");
  const [configSerial, setConfigSerial] = useState("");
  const [configValidFrom, setConfigValidFrom] = useState("");
  const [configCaptisId, setConfigCaptisId] = useState("");
  const [configApiId, setConfigApiId] = useState("");
  const [configDataFormat, setConfigDataFormat] = useState("");

  const configValid = configSource === "NEM12"
    ? Boolean(configNmi && configSerial && configValidFrom)
    : configSource === "Captis"
      ? Boolean(configCaptisId && configApiId && configDataFormat)
      : false;

  function openConfigureSource() {
    setConfigSource("");
    setConfigNmi("");
    setConfigSerial("");
    setConfigValidFrom("");
    setConfigCaptisId("");
    setConfigApiId("");
    setConfigDataFormat("");
    setConfiguringSource(true);
  }

  function saveConfigureSource() {
    if (!configValid) return;
    onPatch({
      source: configSource,
      dataFormat: configSource === "NEM12" ? "NEM12" : configDataFormat,
      nmiNo: configSource === "NEM12" ? configNmi : "—",
      serialNo: configSource === "NEM12" ? configSerial : "—",
    });
    setConfiguringSource(false);
  }
  const operationalDirty = JSON.stringify(draft) !== JSON.stringify(saved);
  const supplierDirty = JSON.stringify(supplier) !== JSON.stringify(savedSupplier);
  const dirty = operationalDirty;
  const serialIsValid = /^\d{12}$/.test(newSerial) && newSerial !== meter.serialNo && Boolean(serialValidFrom);

  function updateOperational(patch: Partial<OperationalDraft>) {
    setDraft(current => ({ ...current, ...patch }));
  }

  function saveChanges() {
    if (!dirty) return;
    onPatch({
      critical: draft.critical ? "Yes" : "No",
      criticalReason: draft.criticalReason,
      excluded: draft.excluded ? "Yes" : "No",
      excludedFrom: draft.excludedFrom,
      excludedTo: draft.excludedNoEndDate ? "" : draft.excludedTo,
      excludedNoEndDate: draft.excludedNoEndDate,
      excludedReason: draft.excludedReason,
      notifications: draft.notifications ? "Enabled" : "Disabled",
      notificationComment: draft.notificationComment,
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
    });
    setEditingSupplier(false);
  }

  function openSerialEditor(tab: "update" | "history") {
    setSerialTab(tab);
    setNewSerial("");
    setSerialValidFrom("");
    setEditingSerial(true);
  }

  function closeSerialEditor() {
    setEditingSerial(false);
    setNewSerial("");
    setSerialValidFrom("");
  }

  function saveSerial() {
    if (!serialIsValid) return;
    setPendingSerialUpdate({
      serialNo: newSerial,
      validFrom: serialValidFrom,
    });
    setEditingSerial(false);
  }

  function confirmSerialUpdate() {
    if (!pendingSerialUpdate) return;
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
    setPendingSerialUpdate(null);
    setNewSerial("");
    setSerialValidFrom("");
  }

  return (
    <div className="epx-drawer">

      {/* Header */}
      <div className="epx-drawer-header">
        <div className="epx-drawer-title-row">
          <div>
            <div className="epx-drawer-title">{meter.name}</div>
            <div className="epx-drawer-id">{meter.edgeId}</div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close device details">
            <img src="/assets/device-panel/a89cc.svg" alt="" />
          </button>
        </div>
        <div className="epx-drawer-status">
          <span className={meter.online === "Online" ? "is-online" : "is-offline"}>
            <span />
            {meter.online}
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
            <DeviceInfoTile icon="/assets/device-panel/f2c12.svg" label="Comm. status" value={meter.status} />
          </div>
        </DrawerSection>

        <DrawerSection
          title="Technical details"
          action={
            <button
              type="button"
              onClick={meter.source === "NEM12"
                ? () => openSerialEditor("update")
                : openConfigureSource}
            >
              Edit
            </button>
          }
        >
          <div className="epx-detail-card">
            <MetaRow label="NMI no." value={meter.nmiNo} mono />
            <MetaRow label="Serial no." value={meter.serialNo} mono />
            <MetaRow label="CT ratio" value={meter.ctRatio?.replace(":", " / ") ?? "—"} />
            <MetaRow label="Pulse rate" value={meter.pulseRatio ?? "1000 imp/kWh"} />
            <MetaRow label="Data format" value={meter.dataFormat} />
            <MetaRow label="COM address" value={meter.comAddress} mono />
          </div>
        </DrawerSection>

        <DrawerSection
          title="Supplier contact"
          action={<button type="button" onClick={openSupplierEditor}>Edit</button>}
        >
          <div className="epx-contact-card">
            <div className="epx-contact-person">
              <span>{meter.contactName === "—" ? "—" : meter.contactName.split(/\s+/).map(part => part[0]).join("").slice(0, 2)}</span>
              <div>
                <strong>{meter.contactName}</strong>
                <small>{meter.source}</small>
              </div>
            </div>
            <ContactRow label="Email" value={meter.contactEmail} />
            <ContactRow label="Phone" value={meter.contactPhone} />
          </div>
        </DrawerSection>

        <DrawerSection title="Settings">
          <OperationalForm draft={draft} onChange={updateOperational} />
        </DrawerSection>
      </div>

      <div className="epx-drawer-footer">
        <button
          type="button"
          onClick={cancelChanges}
          className="epx-drawer-cancel"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={saveChanges}
          disabled={!dirty}
          className="epx-drawer-save"
        >
          Save
        </button>
      </div>

      {editingSupplier && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="supplier-modal-title"
        >
          <div className="w-full max-w-sm border-2 border-black bg-white">
            <div className="border-b border-black px-5 py-4">
              <div id="supplier-modal-title" className="text-sm font-bold uppercase tracking-wide">
                Edit supplier contact
              </div>
            </div>
            <div className="flex flex-col gap-3 px-5 py-4">
              <FieldLabel text="Contact">
                <input
                  type="text"
                  value={supplier.contactName}
                  onChange={event => setSupplier(current => ({ ...current, contactName: event.target.value }))}
                  className="w-full border border-gray-400 bg-white px-2 py-1.5 text-xs normal-case tracking-normal outline-none focus:border-black"
                />
              </FieldLabel>
              <FieldLabel text="Email">
                <input
                  type="email"
                  value={supplier.contactEmail}
                  onChange={event => setSupplier(current => ({ ...current, contactEmail: event.target.value }))}
                  className="w-full border border-gray-400 bg-white px-2 py-1.5 text-xs normal-case tracking-normal outline-none focus:border-black"
                />
              </FieldLabel>
              <FieldLabel text="Phone">
                <input
                  type="tel"
                  value={supplier.contactPhone}
                  onChange={event => setSupplier(current => ({ ...current, contactPhone: event.target.value }))}
                  className="w-full border border-gray-400 bg-white px-2 py-1.5 text-xs normal-case tracking-normal outline-none focus:border-black"
                />
              </FieldLabel>
            </div>
            <div className="flex justify-end gap-2 border-t border-black px-5 py-3">
              <button
                type="button"
                onClick={closeSupplierEditor}
                className="border border-gray-400 px-3 py-1.5 text-xs hover:border-black"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveSupplier}
                disabled={!supplierDirty}
                className="border border-black bg-black px-3 py-1.5 text-xs text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-gray-200 disabled:text-gray-400"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {editingSerial && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="serial-modal-title"
        >
          <div className="w-full max-w-sm border-2 border-black bg-white">
            <div className="border-b border-black px-5 py-4">
              <div id="serial-modal-title" className="text-sm font-bold uppercase tracking-wide">
                Serial number
              </div>
            </div>
            <div className="grid grid-cols-2 border-b border-black">
              <button
                type="button"
                onClick={() => setSerialTab("update")}
                className={`border-r border-black px-4 py-2 text-left text-xs ${serialTab === "update" ? "bg-black text-white" : "hover:bg-gray-100"}`}
              >
                Update
              </button>
              <button
                type="button"
                onClick={() => setSerialTab("history")}
                className={`px-4 py-2 text-left text-xs ${serialTab === "history" ? "bg-black text-white" : "hover:bg-gray-100"}`}
              >
                History
              </button>
            </div>
            {serialTab === "update" ? (
              <>
                <div className="flex flex-col gap-3 px-5 py-4">
                  <FieldLabel text="Current serial number">
                    <div className="border border-gray-300 bg-gray-100 px-2 py-1.5 text-xs font-mono normal-case tracking-normal text-gray-600">
                      {meter.serialNo}
                    </div>
                  </FieldLabel>
                  <FieldLabel text="New serial number">
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={12}
                      value={newSerial}
                      onChange={event => setNewSerial(event.target.value.replace(/\D/g, ""))}
                      placeholder="Enter 12 digits"
                      className="w-full border border-gray-400 bg-white px-2 py-1.5 text-xs normal-case tracking-normal outline-none placeholder:text-gray-400 focus:border-black"
                    />
                  </FieldLabel>
                  <FieldLabel text="Valid from">
                    <input
                      type="date"
                      value={serialValidFrom}
                      onChange={event => setSerialValidFrom(event.target.value)}
                      className="w-full border border-gray-400 bg-white px-2 py-1.5 text-xs normal-case tracking-normal outline-none focus:border-black"
                    />
                  </FieldLabel>
                </div>
                <div className="flex justify-end gap-2 border-t border-black px-5 py-3">
                  <button
                    type="button"
                    onClick={closeSerialEditor}
                    className="border border-gray-400 px-3 py-1.5 text-xs hover:border-black"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={saveSerial}
                    disabled={!serialIsValid}
                    className="border border-black bg-black px-3 py-1.5 text-xs text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-gray-200 disabled:text-gray-400"
                  >
                    Save
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="px-5 py-4">
                  <div className="border border-black">
                    <SerialHistoryRow
                      serialNo={meter.serialNo}
                      validFrom={meter.serialValidFrom ?? "2024-01-15"}
                      status="Current"
                    />
                    {(meter.serialHistory ?? [{
                      serialNo: String(700000000000 + meter.id * 1000 + 17),
                      validFrom: "2022-04-01",
                      validTo: meter.serialValidFrom ?? "2024-01-15",
                    }]).map(entry => (
                      <SerialHistoryRow
                        key={`${entry.serialNo}-${entry.validFrom}`}
                        serialNo={entry.serialNo}
                        validFrom={entry.validFrom}
                        validTo={entry.validTo}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex justify-end border-t border-black px-5 py-3">
                  <button
                    type="button"
                    onClick={closeSerialEditor}
                    className="border border-black px-3 py-1.5 text-xs hover:bg-black hover:text-white"
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {pendingSerialUpdate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reprocess-modal-title"
          aria-describedby="reprocess-modal-description"
        >
          <div className="w-full max-w-sm border-2 border-black bg-white">
            <div className="border-b border-black px-5 py-4">
              <div id="reprocess-modal-title" className="text-sm font-bold uppercase tracking-wide">
                Reprocess NEM12 data?
              </div>
            </div>
            <div className="px-5 py-5">
              <p id="reprocess-modal-description" className="text-xs leading-relaxed">
                The serial number will be updated to{" "}
                <span className="font-bold">{pendingSerialUpdate.serialNo}</span>. Would you like to
                reprocess NEM12 data from{" "}
                <span className="font-bold">{pendingSerialUpdate.validFrom}</span>?
              </p>
            </div>
            <div className="flex flex-col-reverse gap-2 border-t border-black px-5 py-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={confirmSerialUpdate}
                className="border border-black px-3 py-1.5 text-xs hover:bg-gray-100"
              >
                Save without reprocess
              </button>
              <button
                type="button"
                onClick={confirmSerialUpdate}
                className="border border-black bg-black px-3 py-1.5 text-xs text-white hover:bg-gray-800"
              >
                Save &amp; reprocess
              </button>
            </div>
          </div>
        </div>
      )}

      {configuringSource && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="configure-source-title"
        >
          <div className="w-full max-w-sm border-2 border-black bg-white">
            <div className="border-b border-black px-5 py-4">
              <div id="configure-source-title" className="text-sm font-bold uppercase tracking-wide">
                Configure data source
              </div>
              <div className="mt-1 text-xs text-gray-500">
                Select a data source for {meter.name}. This will replace the current connection.
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <div className="mb-2 text-xs font-bold uppercase tracking-wider">Data source</div>
                <div className="grid grid-cols-2 gap-2">
                  {(["NEM12", "Captis"] as const).map(opt => (
                    <label
                      key={opt}
                      className={`flex cursor-pointer items-center gap-2 border px-3 py-2.5 text-xs ${configSource === opt ? "border-black bg-black text-white" : "border-gray-400 hover:border-black"}`}
                    >
                      <input
                        type="radio"
                        name="configure-source"
                        checked={configSource === opt}
                        onChange={() => {
                          setConfigSource(opt);
                          setConfigNmi("");
                          setConfigSerial("");
                          setConfigValidFrom("");
                          setConfigCaptisId("");
                          setConfigApiId("");
                          setConfigDataFormat("");
                        }}
                        className="accent-black"
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>

              {configSource === "NEM12" && (
                <div className="space-y-3 border-t border-gray-300 pt-4">
                  <FieldLabel text="NMI Number">
                    <input
                      type="text"
                      value={configNmi}
                      onChange={e => setConfigNmi(e.target.value)}
                      placeholder="e.g. NMI6301847200"
                      className="w-full border border-gray-400 bg-white px-2 py-1.5 text-xs normal-case tracking-normal outline-none focus:border-black"
                    />
                  </FieldLabel>
                  <FieldLabel text="Serial Number">
                    <input
                      type="text"
                      value={configSerial}
                      onChange={e => setConfigSerial(e.target.value)}
                      placeholder="12-digit serial"
                      className="w-full border border-gray-400 bg-white px-2 py-1.5 text-xs normal-case tracking-normal outline-none focus:border-black"
                    />
                  </FieldLabel>
                  <FieldLabel text="Valid From">
                    <input
                      type="date"
                      value={configValidFrom}
                      onChange={e => setConfigValidFrom(e.target.value)}
                      className="w-full border border-gray-400 bg-white px-2 py-1.5 text-xs normal-case tracking-normal outline-none focus:border-black"
                    />
                  </FieldLabel>
                </div>
              )}

              {configSource === "Captis" && (
                <div className="space-y-3 border-t border-gray-300 pt-4">
                  <FieldLabel text="Captis Device ID">
                    <input
                      type="text"
                      value={configCaptisId}
                      onChange={e => setConfigCaptisId(e.target.value)}
                      placeholder="CAP-XXXXX"
                      className="w-full border border-gray-400 bg-white px-2 py-1.5 text-xs normal-case tracking-normal outline-none focus:border-black"
                    />
                  </FieldLabel>
                  <FieldLabel text="API Identifier">
                    <input
                      type="text"
                      value={configApiId}
                      onChange={e => setConfigApiId(e.target.value)}
                      placeholder="API endpoint or key"
                      className="w-full border border-gray-400 bg-white px-2 py-1.5 text-xs normal-case tracking-normal outline-none focus:border-black"
                    />
                  </FieldLabel>
                  <FieldLabel text="Data Format">
                    <select
                      value={configDataFormat}
                      onChange={e => setConfigDataFormat(e.target.value)}
                      className="w-full border border-gray-400 bg-white px-2 py-1.5 text-xs normal-case tracking-normal outline-none focus:border-black"
                    >
                      <option value="">Select</option>
                      <option>Captis API</option>
                      <option>CSV</option>
                      <option>JSON</option>
                      <option>XML</option>
                    </select>
                  </FieldLabel>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 border-t border-black px-5 py-3">
              <button
                type="button"
                onClick={() => setConfiguringSource(false)}
                className="border border-gray-400 px-3 py-1.5 text-xs hover:border-black"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveConfigureSource}
                disabled={!configValid}
                className="border border-black bg-black px-3 py-1.5 text-xs text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-gray-200 disabled:text-gray-400"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SerialHistoryRow({ serialNo, validFrom, validTo, status }: {
  serialNo: string;
  validFrom: string;
  validTo?: string;
  status?: string;
}) {
  return (
    <div className="border-b border-gray-300 p-3 last:border-b-0">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-bold">{serialNo}</span>
        {status && <span className="border border-black px-1.5 py-0.5 text-xs">{status}</span>}
      </div>
      <div className="mt-1 text-xs text-gray-500">
        {validFrom} {validTo ? `— ${validTo}` : "— Present"}
      </div>
    </div>
  );
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

function ContactRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="epx-contact-row">
      <span>{label}</span>
      <span>{value}</span>
      {value !== "—" && (
        <button
          type="button"
          aria-label={`Copy ${label.toLowerCase()}`}
          onClick={() => navigator.clipboard?.writeText(value)}
        >
          <img src="/assets/device-panel/d7702.svg" alt="" />
        </button>
      )}
    </div>
  );
}

type SupplierDraft = {
  contactName: string;
  contactEmail: string;
  contactPhone: string;
};

function supplierDraft(meter: Meter): SupplierDraft {
  return {
    contactName: meter.contactName,
    contactEmail: meter.contactEmail,
    contactPhone: meter.contactPhone,
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
};

function operationalDraft(meter: Meter): OperationalDraft {
  return {
    critical: meter.critical === "Yes",
    criticalReason: meter.criticalReason ?? "",
    excluded: meter.excluded === "Yes",
    excludedFrom: meter.excludedFrom ?? "",
    excludedTo: meter.excludedTo ?? "",
    excludedNoEndDate: meter.excludedNoEndDate ?? false,
    excludedReason: meter.excludedReason ?? "",
    notifications: meter.notifications !== "Disabled",
    notificationComment: meter.notificationComment ?? "",
  };
}

function OperationalForm({ draft, onChange }: {
  draft: OperationalDraft;
  onChange: (patch: Partial<OperationalDraft>) => void;
}) {
  return (
    <div className="epx-settings-list">
      <div className="epx-setting">
        <div className="epx-setting-row">
          <div className="epx-setting-copy">
            <div>
              <img src="/assets/device-panel/6c992.svg" alt="" />
              <span>Critical device</span>
            </div>
            <p>Alerts for this device requires priority monitoring, set by Customer Delivery team</p>
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
          <div className="epx-setting-detail">
            <FieldLabel text="Reason">
              <select
                value={draft.criticalReason}
                onChange={event => onChange({ criticalReason: event.target.value })}
                className="w-full border border-gray-400 bg-white px-2 py-1.5 text-xs outline-none focus:border-black"
              >
                <option value="">Select reason</option>
                <option>Patient safety</option>
                <option>Billing critical</option>
                <option>Operational dependency</option>
                <option>Other</option>
              </select>
            </FieldLabel>
          </div>
        )}
      </div>

      <div className="epx-setting">
        <div className="epx-setting-row">
          <div className="epx-setting-copy">
            <div>
              <img src="/assets/device-panel/82b00.svg" alt="" />
              <span>Exclude</span>
            </div>
            <p>Device is excluded from automated monitoring and missing data checks</p>
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
            <FieldLabel text="From date">
              <input
                type="date"
                value={draft.excludedFrom}
                onChange={event => onChange({ excludedFrom: event.target.value })}
                className="w-full border border-gray-400 bg-white px-2 py-1.5 text-xs outline-none focus:border-black"
              />
            </FieldLabel>
            <FieldLabel text="To date">
              <input
                type="date"
                value={draft.excludedTo}
                disabled={draft.excludedNoEndDate}
                onChange={event => onChange({ excludedTo: event.target.value })}
                className="w-full border border-gray-400 bg-white px-2 py-1.5 text-xs outline-none focus:border-black disabled:bg-gray-100 disabled:text-gray-400"
              />
            </FieldLabel>
            <label className="flex items-center gap-2 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={draft.excludedNoEndDate}
                onChange={event => onChange({ excludedNoEndDate: event.target.checked })}
                className="size-3.5 accent-black"
              />
              No end date
            </label>
            <FieldLabel text="Reason">
              <select
                value={draft.excludedReason}
                onChange={event => onChange({ excludedReason: event.target.value })}
                className="w-full border border-gray-400 bg-white px-2 py-1.5 text-xs outline-none focus:border-black"
              >
                <option value="">Select reason</option>
                <option>Planned maintenance</option>
                <option>Fault investigation</option>
                <option>Decommissioned</option>
                <option>Other</option>
              </select>
            </FieldLabel>
          </div>
        )}
      </div>

      <div className="epx-setting">
        <div className="epx-setting-row">
          <div className="epx-setting-copy">
            <div>
              <img src="/assets/device-panel/88fc5.svg" alt="" />
              <span>Supplier notifications</span>
            </div>
            <p>Send fault alerts to supplier</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={draft.notifications}
            onClick={() => onChange({ notifications: !draft.notifications })}
          >
            <img src={draft.notifications ? "/assets/device-panel/4513b.svg" : "/assets/device-panel/2b372.svg"} alt="" />
          </button>
        </div>
        {!draft.notifications && (
          <div className="epx-setting-detail">
            <FieldLabel text="Comment">
              <textarea
                value={draft.notificationComment}
                onChange={event => onChange({ notificationComment: event.target.value })}
                rows={3}
                placeholder="Why are notifications being disabled?"
                className="w-full resize-none border border-gray-400 bg-white px-2 py-1.5 text-xs normal-case tracking-normal outline-none placeholder:text-gray-400 focus:border-black"
              />
            </FieldLabel>
          </div>
        )}
      </div>
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
