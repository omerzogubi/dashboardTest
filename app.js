"use strict";

const baseDevices = [
  {
    id: "MC-A1",
    name: "Motor Controller A1",
    type: "Motor Controller",
    group: "Line 1",
    location: "Assembly Hall · Line 1",
    status: "Online",
    connectionQuality: "Excellent",
    firmware: "1.4.2",
    targetFirmware: "1.4.2",
    updateStatus: "Up to date",
    updateProgress: 100,
    alertLevel: "None",
    alertMessage: "No active alert",
    maintenanceState: "Normal",
    lastSeen: "Just now",
    ipAddress: "10.24.1.18",
    certificate: "Valid · 184 days",
    uptime: "18 days, 7 hours",
    watchlisted: false,
    acknowledged: false,
    escalated: false
  },
  {
    id: "GW-B2",
    name: "Gateway B2",
    type: "Industrial Gateway",
    group: "Line 1",
    location: "Assembly Hall · Line 1",
    status: "Disconnected",
    connectionQuality: "Unavailable",
    firmware: "2.0.1",
    targetFirmware: "2.0.1",
    updateStatus: "Not running",
    updateProgress: 0,
    alertLevel: "Critical",
    alertMessage: "Device communication lost",
    maintenanceState: "Investigation required",
    lastSeen: "12 minutes ago",
    ipAddress: "10.24.1.5",
    certificate: "Valid · 91 days",
    uptime: "Unknown",
    watchlisted: false,
    acknowledged: false,
    escalated: false
  },
  {
    id: "SH-C3",
    name: "Sensor Hub C3",
    type: "Sensor Hub",
    group: "Line 2",
    location: "Packaging Hall · Line 2",
    status: "Online",
    connectionQuality: "Good",
    firmware: "1.8.0",
    targetFirmware: "2.1.0",
    updateStatus: "Update available",
    updateProgress: 0,
    alertLevel: "Warning",
    alertMessage: "Firmware update recommended",
    maintenanceState: "Normal",
    lastSeen: "1 minute ago",
    ipAddress: "10.24.2.33",
    certificate: "Valid · 123 days",
    uptime: "11 days, 2 hours",
    watchlisted: false,
    acknowledged: false,
    escalated: false
  },
  {
    id: "SR-D4",
    name: "Safety Relay D4",
    type: "Safety Relay",
    group: "Line 2",
    location: "Packaging Hall · Line 2",
    status: "Online",
    connectionQuality: "Good",
    firmware: "3.2.5",
    targetFirmware: "3.2.5",
    updateStatus: "Previous update failed",
    updateProgress: 0,
    alertLevel: "Warning",
    alertMessage: "Previous firmware validation failed",
    maintenanceState: "Inspection recommended",
    lastSeen: "3 minutes ago",
    ipAddress: "10.24.2.41",
    certificate: "Valid · 62 days",
    uptime: "6 days, 19 hours",
    watchlisted: false,
    acknowledged: false,
    escalated: false
  },
  {
    id: "EM-E5",
    name: "Energy Meter E5",
    type: "Energy Meter",
    group: "Utility Area",
    location: "Utility Area · Cabinet 4",
    status: "Online",
    connectionQuality: "Good",
    firmware: "1.2.9",
    targetFirmware: "1.2.9",
    updateStatus: "Up to date",
    updateProgress: 100,
    alertLevel: "None",
    alertMessage: "No active alert",
    maintenanceState: "Maintenance due",
    lastSeen: "2 minutes ago",
    ipAddress: "10.24.4.12",
    certificate: "Valid · 210 days",
    uptime: "42 days, 5 hours",
    watchlisted: false,
    acknowledged: false,
    escalated: false
  },
  {
    id: "CU-F6",
    name: "Control Unit F6",
    type: "Control Unit",
    group: "Line 3",
    location: "Finishing Hall · Line 3",
    status: "Online",
    connectionQuality: "Excellent",
    firmware: "2.0.0",
    targetFirmware: "2.1.0",
    updateStatus: "Installing",
    updateProgress: 64,
    alertLevel: "None",
    alertMessage: "No active alert",
    maintenanceState: "Normal",
    lastSeen: "Just now",
    ipAddress: "10.24.3.27",
    certificate: "Valid · 146 days",
    uptime: "4 days, 8 hours",
    watchlisted: false,
    acknowledged: false,
    escalated: false
  }
];

const scenarioConfig = {
  normal: {
    label: "Normal Monitoring",
    headline: "Balanced operational overview",
    description: "All information remains available with balanced visual priority.",
    icon: "●"
  },
  critical: {
    label: "Critical Incident",
    headline: "Incident response information prioritized",
    description: "Alerts and affected devices receive stronger emphasis while the full fleet remains accessible.",
    icon: "!"
  },
  firmware: {
    label: "Firmware Supervision",
    headline: "Update progress and verification prioritized",
    description: "The active update receives focus while critical operational information remains available.",
    icon: "↻"
  },
  multi: {
    label: "Multi-Device Monitoring",
    headline: "Fleet prioritization and filtering enabled",
    description: "Devices are grouped by urgency to reduce scanning effort without hiding the complete overview.",
    icon: "▦"
  },
  maintenance: {
    label: "Maintenance Planning",
    headline: "Maintenance requirements and planning prioritized",
    description: "Device-specific maintenance information receives focus while broader monitoring remains accessible.",
    icon: "◇"
  }
};

const state = {
  devices: cloneDevices(),
  activeScenario: "normal",
  selectedDeviceId: null,
  search: "",
  filter: "all",
  sort: "priority",
  criticalStep: "idle",
  firmwareStep: "idle",
  maintenanceStep: "idle",
  maintenanceChecks: {
    isolation: false,
    calibration: false,
    window: false
  },
  workflowView: "default",
  secondaryVisible: false,
  participantMode: false,
  activity: [],
  reconnectTimer: null,
  firmwareTimer: null
};

const elements = {
  activeContextLabel: document.getElementById("activeContextLabel"),
  contextStrip: document.getElementById("contextStrip"),
  contextIcon: document.getElementById("contextIcon"),
  contextHeadline: document.getElementById("contextHeadline"),
  contextDescription: document.getElementById("contextDescription"),
  metricsGrid: document.getElementById("metricsGrid"),
  deviceCount: document.getElementById("deviceCount"),
  deviceSearch: document.getElementById("deviceSearch"),
  deviceFilter: document.getElementById("deviceFilter"),
  deviceSort: document.getElementById("deviceSort"),
  deviceList: document.getElementById("deviceList"),
  selectedDeviceBadge: document.getElementById("selectedDeviceBadge"),
  deviceDetails: document.getElementById("deviceDetails"),
  workflowState: document.getElementById("workflowState"),
  workflowContent: document.getElementById("workflowContent"),
  actionControls: document.getElementById("actionControls"),
  alertCount: document.getElementById("alertCount"),
  alertList: document.getElementById("alertList"),
  activityList: document.getElementById("activityList"),
  toggleSecondary: document.getElementById("toggleSecondary"),
  secondaryContent: document.getElementById("secondaryContent"),
  openScenarioPanel: document.getElementById("openScenarioPanel"),
  closeScenarioPanel: document.getElementById("closeScenarioPanel"),
  scenarioDrawer: document.getElementById("scenarioDrawer"),
  drawerBackdrop: document.getElementById("drawerBackdrop"),
  resetScenario: document.getElementById("resetScenario"),
  enterParticipantMode: document.getElementById("enterParticipantMode"),
  scenarioCards: Array.from(document.querySelectorAll(".scenario-card")),
  toastRegion: document.getElementById("toastRegion")
};

function cloneDevices() {
  return JSON.parse(JSON.stringify(baseDevices));
}

function clearSimulationTimers() {
  if (state.reconnectTimer) {
    window.clearTimeout(state.reconnectTimer);
    state.reconnectTimer = null;
  }
  if (state.firmwareTimer) {
    window.clearInterval(state.firmwareTimer);
    state.firmwareTimer = null;
  }
}

function loadScenario(scenario, announce = true) {
  clearSimulationTimers();
  state.devices = cloneDevices();
  state.activeScenario = scenario;
  state.selectedDeviceId = null;
  state.search = "";
  state.filter = "all";
  state.sort = "priority";
  state.criticalStep = "idle";
  state.firmwareStep = "idle";
  state.maintenanceStep = "idle";
  state.maintenanceChecks = { isolation: false, calibration: false, window: false };
  state.workflowView = "default";
  state.secondaryVisible = false;
  state.activity = initialActivityForScenario(scenario);

  elements.deviceSearch.value = "";
  elements.deviceFilter.value = "all";
  elements.deviceSort.value = "priority";
  elements.secondaryContent.classList.add("hidden");
  elements.toggleSecondary.textContent = "Show";

  closeScenarioDrawer();
  renderAll();

  if (announce) {
    showToast(`${scenarioConfig[scenario].label} loaded.`, "info");
  }
}

function initialActivityForScenario(scenario) {
  const entries = {
    normal: [
      activity("Dashboard ready", "Six devices synchronized", "success")
    ],
    critical: [
      activity("Communication loss detected", "Gateway B2 stopped responding 12 minutes ago", "critical"),
      activity("Fleet monitoring continues", "Other devices remain available for inspection", "info")
    ],
    firmware: [
      activity("Firmware deployment active", "Control Unit F6 is installing package 2.1.0", "info"),
      activity("Operational incident remains active", "A communication issue is still present elsewhere in the fleet", "critical")
    ],
    multi: [
      activity("Fleet overview generated", "Devices grouped by operational urgency", "info")
    ],
    maintenance: [
      activity("Maintenance requirement detected", "A device requires planning before the next service window", "warning")
    ]
  };
  return entries[scenario];
}

function activity(title, detail, level = "info") {
  return {
    title,
    detail,
    level,
    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  };
}

function addActivity(title, detail, level = "info") {
  state.activity.unshift(activity(title, detail, level));
  state.activity = state.activity.slice(0, 7);
}

function getSelectedDevice() {
  return state.devices.find((device) => device.id === state.selectedDeviceId) || null;
}

function getDeviceById(id) {
  return state.devices.find((device) => device.id === id) || null;
}

function renderAll() {
  renderContext();
  renderMetrics();
  renderDevices();
  renderDetails();
  renderWorkflow();
  renderActions();
  renderAlerts();
  renderActivity();
  renderSecondary();
  renderResearcherState();
}

function renderContext() {
  const config = scenarioConfig[state.activeScenario];
  document.body.className = `context-${state.activeScenario}${state.participantMode ? " participant-mode" : ""}`;
  elements.activeContextLabel.textContent = config.label;
  elements.contextIcon.textContent = config.icon;
  elements.contextHeadline.textContent = config.headline;
  elements.contextDescription.textContent = config.description;
}

function renderMetrics() {
  const connected = state.devices.filter((device) => device.status === "Online").length;
  const notOnline = state.devices.length - connected;
  const alerts = state.devices.filter((device) => device.alertLevel !== "None").length;
  const maintenance = state.devices.filter((device) => device.maintenanceState === "Maintenance due").length;
  const updates = state.devices.filter((device) => ["Installing", "Paused", "Completed — verification required"].includes(device.updateStatus)).length;

  const metrics = [
    { label: "Connected", value: connected, style: connected === state.devices.length ? "emphasis" : "" },
    { label: "Not online", value: notOnline, style: notOnline > 0 ? "danger" : "" },
    { label: "Active alerts", value: alerts, style: alerts > 0 ? "danger" : "" },
    { label: "Updates in progress", value: updates, style: updates > 0 ? "emphasis" : "" },
    { label: "Maintenance due", value: maintenance, style: maintenance > 0 ? "emphasis" : "" }
  ];

  elements.metricsGrid.innerHTML = metrics.map((metric) => `
    <div class="metric-card ${metric.style}">
      <strong>${metric.value}</strong>
      <span>${metric.label}</span>
    </div>
  `).join("");
}

function filteredAndSortedDevices() {
  const search = state.search.trim().toLowerCase();
  let devices = state.devices.filter((device) => {
    const matchesSearch = !search || [device.name, device.type, device.group, device.location, device.id]
      .some((value) => value.toLowerCase().includes(search));
    const matchesFilter = deviceMatchesFilter(device, state.filter);
    return matchesSearch && matchesFilter;
  });

  devices.sort((a, b) => {
    if (state.sort === "name") return a.name.localeCompare(b.name);
    if (state.sort === "group") return a.group.localeCompare(b.group) || a.name.localeCompare(b.name);
    return priorityScore(b) - priorityScore(a) || a.name.localeCompare(b.name);
  });
  return devices;
}

function deviceMatchesFilter(device, filter) {
  if (filter === "all") return true;
  if (filter === "critical") return device.alertLevel === "Critical";
  if (filter === "warning") return device.alertLevel === "Warning";
  if (filter === "maintenance") return device.maintenanceState !== "Normal" && device.maintenanceState !== "Investigation required";
  if (filter === "updating") return ["Installing", "Paused", "Completed — verification required"].includes(device.updateStatus);
  if (filter === "normal") {
    return device.alertLevel === "None" && device.maintenanceState === "Normal" && device.updateStatus !== "Installing";
  }
  return true;
}

function priorityScore(device) {
  let score = 0;
  if (device.alertLevel === "Critical") score += 100;
  if (device.alertLevel === "Warning") score += 60;
  if (device.status === "Disconnected" || device.status === "Reconnecting") score += 45;
  if (device.maintenanceState === "Maintenance due") score += 35;
  if (device.maintenanceState === "Inspection recommended") score += 25;
  if (["Installing", "Paused", "Completed — verification required"].includes(device.updateStatus)) score += 30;
  if (state.activeScenario === "critical" && device.id === "GW-B2") score += 30;
  if (state.activeScenario === "firmware" && device.id === "CU-F6") score += 70;
  if (state.activeScenario === "maintenance" && device.id === "EM-E5") score += 70;
  if (device.watchlisted) score += 8;
  return score;
}

function renderDevices() {
  const devices = filteredAndSortedDevices();
  elements.deviceCount.textContent = `${devices.length} of ${state.devices.length}`;

  if (devices.length === 0) {
    elements.deviceList.innerHTML = `<div class="empty-state compact"><h3>No matching devices</h3><p>Change the search or filter to restore the fleet view.</p></div>`;
    return;
  }

  if (state.activeScenario === "multi" && state.filter === "all" && !state.search) {
    const groups = [
      ["Critical", devices.filter((device) => device.alertLevel === "Critical")],
      ["Attention needed", devices.filter((device) => device.alertLevel !== "Critical" && (device.alertLevel === "Warning" || device.maintenanceState !== "Normal" || device.updateStatus === "Installing"))],
      ["Normal operation", devices.filter((device) => device.alertLevel === "None" && device.maintenanceState === "Normal" && device.updateStatus !== "Installing")]
    ];
    elements.deviceList.innerHTML = groups.map(([label, groupDevices]) => {
      if (!groupDevices.length) return "";
      return `<p class="device-group-title">${label}</p>${groupDevices.map(renderDeviceItem).join("")}`;
    }).join("");
  } else {
    elements.deviceList.innerHTML = devices.map(renderDeviceItem).join("");
  }

  elements.deviceList.querySelectorAll(".device-item").forEach((item) => {
    item.addEventListener("click", () => selectDevice(item.dataset.deviceId));
  });
}

function renderDeviceItem(device) {
  return `
    <button class="device-item ${device.id === state.selectedDeviceId ? "selected" : ""}" data-device-id="${device.id}" type="button">
      <div class="device-topline">
        <span class="device-name">${device.name}</span>
        ${primaryBadge(device)}
      </div>
      <div class="device-meta">${device.type} · ${device.location}<br>Last communication: ${device.lastSeen}</div>
      <div class="device-signals">
        ${device.watchlisted ? `<span class="badge info">Watchlist</span>` : ""}
        ${device.updateStatus === "Installing" ? `<span class="badge info">Update ${device.updateProgress}%</span>` : ""}
        ${device.maintenanceState === "Maintenance due" ? `<span class="badge warning">Maintenance due</span>` : ""}
      </div>
    </button>
  `;
}

function primaryBadge(device) {
  if (device.status === "Reconnecting") return `<span class="badge info">Reconnecting</span>`;
  if (device.alertLevel === "Critical") return `<span class="badge critical">Critical</span>`;
  if (device.alertLevel === "Warning") return `<span class="badge warning">Warning</span>`;
  if (device.updateStatus === "Installing") return `<span class="badge info">Updating</span>`;
  if (device.updateStatus === "Paused") return `<span class="badge warning">Paused</span>`;
  if (device.updateStatus === "Completed — verification required") return `<span class="badge warning">Verify</span>`;
  if (device.updateStatus === "Verified") return `<span class="badge success">Verified</span>`;
  if (device.maintenanceState === "Maintenance due") return `<span class="badge warning">Maintenance</span>`;
  if (device.maintenanceState === "Inspection planned") return `<span class="badge success">Planned</span>`;
  return `<span class="badge success">Online</span>`;
}

function selectDevice(deviceId) {
  state.selectedDeviceId = deviceId;
  state.workflowView = "default";
  const device = getSelectedDevice();
  addActivity("Device inspected", `${device.name} selected`, "info");
  renderAll();
}

function renderDetails() {
  const device = getSelectedDevice();
  if (!device) {
    elements.selectedDeviceBadge.innerHTML = "";
    elements.deviceDetails.className = "empty-state";
    elements.deviceDetails.innerHTML = `
      <div class="empty-icon" aria-hidden="true">↖</div>
      <h3>Select a device to investigate</h3>
      <p>Review any device in the fleet. The dashboard will adapt the available details and actions to your selection.</p>
    `;
    return;
  }

  elements.selectedDeviceBadge.innerHTML = primaryBadge(device);
  elements.deviceDetails.className = "detail-grid";
  const details = [
    ["Device", `${device.name} (${device.id})`],
    ["Type", device.type],
    ["Location", device.location],
    ["Connection", device.status],
    ["Last communication", device.lastSeen],
    ["Connection quality", device.connectionQuality],
    ["IP address", device.ipAddress],
    ["Firmware", device.firmware],
    ["Update state", device.updateStatus],
    ["Certificate", device.certificate],
    ["Maintenance", device.maintenanceState],
    ["Uptime", device.uptime]
  ];
  elements.deviceDetails.innerHTML = details.map(([label, value]) => `
    <div class="detail-row"><span>${label}</span><span>${value}</span></div>
  `).join("");
}

function renderWorkflow() {
  const device = getSelectedDevice();
  if (!device) {
    elements.workflowState.textContent = "Waiting for selection";
    elements.workflowContent.className = "empty-state compact";
    elements.workflowContent.innerHTML = `<h3>No active operation</h3><p>Select a device and inspect the available actions.</p>`;
    return;
  }

  elements.workflowContent.className = "workflow-content";

  if (state.workflowView !== "default") {
    renderAlternateWorkflowView(device);
    return;
  }

  if (state.activeScenario === "critical" && device.id === "GW-B2") {
    renderCriticalWorkflow(device);
    return;
  }

  if (state.activeScenario === "firmware" && device.id === "CU-F6") {
    renderFirmwareWorkflow(device);
    return;
  }

  if (state.activeScenario === "maintenance" && device.id === "EM-E5") {
    renderMaintenanceWorkflow(device);
    return;
  }

  if (state.activeScenario === "multi") {
    elements.workflowState.textContent = "Fleet inspection";
    elements.workflowContent.innerHTML = `
      <div class="workflow-banner">
        <h3>${device.name}</h3>
        <p>This device is classified as <strong>${operationalCategory(device)}</strong>. Use the fleet filters to focus on urgent states or return to the complete overview.</p>
      </div>
      ${summarySignals(device)}
    `;
    return;
  }

  elements.workflowState.textContent = "Device overview";
  elements.workflowContent.innerHTML = `
    <div class="workflow-banner">
      <h3>${device.name}</h3>
      <p>Inspect current operational signals or open recent events from the action controls.</p>
    </div>
    ${summarySignals(device)}
  `;
}

function renderCriticalWorkflow(device) {
  if (state.criticalStep === "idle") {
    elements.workflowState.textContent = "Incident unresolved";
    elements.workflowContent.innerHTML = `
      <div class="workflow-banner critical">
        <h3>Communication incident</h3>
        <p>${device.name} has not reported for 12 minutes. The cause has not yet been diagnosed.</p>
      </div>
      ${summarySignals(device)}
    `;
  } else if (state.criticalStep === "diagnosed") {
    elements.workflowState.textContent = "Diagnosis complete";
    elements.workflowContent.innerHTML = `
      <div class="workflow-banner warning">
        <h3>Management session is unresponsive</h3>
        <p>The network path and gateway host are reachable, but the device-management session did not respond. A controlled reconnection can be attempted.</p>
      </div>
      <div class="log-list">
        <div class="log-row"><strong>Network route</strong>Reachable · 18 ms latency</div>
        <div class="log-row"><strong>Management session</strong>No response after three attempts</div>
        <div class="log-row"><strong>Certificate</strong>Valid · no authentication error</div>
      </div>
    `;
  } else if (state.criticalStep === "reconnecting") {
    elements.workflowState.textContent = "Recovery in progress";
    elements.workflowContent.innerHTML = `
      <div class="workflow-banner">
        <h3>Reconnection attempt running</h3>
        <p>The dashboard is re-establishing the device-management session. The incident remains visible until communication is confirmed.</p>
      </div>
      <div class="progress-track"><div class="progress-fill" style="width: 72%"></div></div>
      <div class="progress-labels"><span>Restarting session</span><span>Please wait</span></div>
    `;
  } else {
    elements.workflowState.textContent = "Incident resolved";
    elements.workflowContent.innerHTML = `
      <div class="workflow-banner success">
        <h3>Communication restored</h3>
        <p>${device.name} is online and reporting normally. The critical alert has been cleared.</p>
      </div>
      <div class="verification-grid">
        <div class="verification-item">✓ Session established</div>
        <div class="verification-item">✓ Device heartbeat received</div>
        <div class="verification-item">✓ Certificate validated</div>
      </div>
    `;
  }
}

function renderFirmwareWorkflow(device) {
  const step = state.firmwareStep;
  if (step === "idle" || step === "monitoring" || step === "paused") {
    const headline = step === "paused" ? "Firmware update paused" : "Firmware package 2.1.0 installation";
    const style = step === "paused" ? "warning" : "";
    elements.workflowState.textContent = step === "paused" ? "Update paused" : step === "monitoring" ? "Live monitoring" : "Update in progress";
    elements.workflowContent.innerHTML = `
      <div class="workflow-banner ${style}">
        <h3>${headline}</h3>
        <p>Control Unit F6 is moving from firmware 2.0.0 to 2.1.0. Verification is required after installation completes.</p>
      </div>
      <div class="progress-track"><div class="progress-fill" style="width: ${device.updateProgress}%"></div></div>
      <div class="progress-labels"><span>${device.updateStatus}</span><strong>${device.updateProgress}%</strong></div>
      <div class="log-list">
        <div class="log-row"><strong>Current phase</strong>${firmwarePhase(device.updateProgress, step)}</div>
        <div class="log-row"><strong>Target version</strong>${device.targetFirmware}</div>
      </div>
    `;
  } else if (step === "complete") {
    elements.workflowState.textContent = "Verification required";
    elements.workflowContent.innerHTML = `
      <div class="workflow-banner warning">
        <h3>Installation completed</h3>
        <p>The package reached 100%, but the device result has not yet been verified.</p>
      </div>
      <div class="progress-track"><div class="progress-fill" style="width: 100%"></div></div>
      <div class="progress-labels"><span>Installation complete</span><strong>100%</strong></div>
    `;
  } else {
    elements.workflowState.textContent = "Update verified";
    elements.workflowContent.innerHTML = `
      <div class="workflow-banner success">
        <h3>Firmware 2.1.0 verified</h3>
        <p>The control unit restarted successfully and reported the expected firmware version.</p>
      </div>
      <div class="verification-grid">
        <div class="verification-item">✓ Firmware version 2.1.0</div>
        <div class="verification-item">✓ Device heartbeat normal</div>
        <div class="verification-item">✓ Configuration retained</div>
      </div>
    `;
  }
}

function firmwarePhase(progress, step) {
  if (step === "paused") return "Paused by operator";
  if (progress < 75) return "Transferring package";
  if (progress < 92) return "Installing components";
  return "Finalizing and rebooting";
}

function renderMaintenanceWorkflow(device) {
  if (state.maintenanceStep === "idle") {
    elements.workflowState.textContent = "Review required";
    elements.workflowContent.innerHTML = `
      <div class="workflow-banner warning">
        <h3>Preventive maintenance is due</h3>
        <p>${device.name} has reached the configured service interval. Review the maintenance plan before scheduling work.</p>
      </div>
      <div class="log-list">
        <div class="log-row"><strong>Service interval</strong>Reached after 4,000 operating hours</div>
        <div class="log-row"><strong>Last inspection</strong>182 days ago</div>
        <div class="log-row"><strong>Operational state</strong>Online · no active fault</div>
      </div>
    `;
  } else if (state.maintenanceStep === "checklist") {
    elements.workflowState.textContent = allMaintenanceChecksComplete() ? "Ready to plan" : "Checklist in progress";
    elements.workflowContent.innerHTML = `
      <div class="workflow-banner">
        <h3>Maintenance planning checklist</h3>
        <p>Confirm the prerequisites before planning an inspection window.</p>
      </div>
      <div class="checklist">
        ${maintenanceCheckRow("isolation", "Isolation procedure available", "Required before physical inspection")}
        ${maintenanceCheckRow("calibration", "Calibration history reviewed", "Last calibration record is accessible")}
        ${maintenanceCheckRow("window", "Service window confirmed", "Production impact has been considered")}
      </div>
    `;
    attachMaintenanceCheckListeners();
  } else {
    elements.workflowState.textContent = "Inspection planned";
    elements.workflowContent.innerHTML = `
      <div class="workflow-banner success">
        <h3>Inspection planned</h3>
        <p>The maintenance state has been updated and the planning record is available for review.</p>
      </div>
      <div class="verification-grid">
        <div class="verification-item">✓ Prerequisites confirmed</div>
        <div class="verification-item">✓ Inspection owner assigned</div>
        <div class="verification-item">✓ Device remains monitored</div>
      </div>
    `;
  }
}

function maintenanceCheckRow(key, title, detail) {
  return `
    <label class="checklist-row">
      <input type="checkbox" data-maintenance-check="${key}" ${state.maintenanceChecks[key] ? "checked" : ""} />
      <span><strong>${title}</strong><small>${detail}</small></span>
    </label>
  `;
}

function attachMaintenanceCheckListeners() {
  elements.workflowContent.querySelectorAll("[data-maintenance-check]").forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      state.maintenanceChecks[checkbox.dataset.maintenanceCheck] = checkbox.checked;
      renderWorkflow();
      renderActions();
    });
  });
}

function allMaintenanceChecksComplete() {
  return Object.values(state.maintenanceChecks).every(Boolean);
}

function renderAlternateWorkflowView(device) {
  const views = {
    eventLog: {
      state: "Recent events",
      html: `
        <div class="workflow-banner"><h3>${device.name} event history</h3><p>Recent operational events are shown without changing the device state.</p></div>
        <div class="log-list">
          <div class="log-row"><strong>12 minutes ago</strong>Communication heartbeat missed</div>
          <div class="log-row"><strong>13 minutes ago</strong>Connection quality degraded</div>
          <div class="log-row"><strong>2 hours ago</strong>Routine status synchronization completed</div>
        </div>`
    },
    diagnostic: {
      state: "Diagnostic report",
      html: `
        <div class="workflow-banner warning"><h3>Connection diagnostic report</h3><p>Network connectivity is available, but the management session failed to respond.</p></div>
        <div class="log-list">
          <div class="log-row"><strong>Route test</strong>Passed</div>
          <div class="log-row"><strong>Session test</strong>Failed</div>
          <div class="log-row"><strong>Authentication</strong>Passed</div>
        </div>`
    },
    updateLog: {
      state: "Update log",
      html: `
        <div class="workflow-banner"><h3>Firmware update log</h3><p>Detailed package events remain available during supervision.</p></div>
        <div class="log-list">
          <div class="log-row"><strong>14:03</strong>Package 2.1.0 validated</div>
          <div class="log-row"><strong>14:04</strong>Transfer completed</div>
          <div class="log-row"><strong>14:05</strong>Installation phase started</div>
        </div>`
    },
    configuration: {
      state: "Configuration",
      html: `
        <div class="workflow-banner"><h3>${device.name} configuration</h3><p>Configuration information is available for review. No parameter is changed in this prototype.</p></div>
        <div class="log-list">
          <div class="log-row"><strong>Measurement interval</strong>5 seconds</div>
          <div class="log-row"><strong>Reporting mode</strong>Operational profile</div>
          <div class="log-row"><strong>Configuration status</strong>Synchronized</div>
        </div>`
    },
    history: {
      state: "Maintenance history",
      html: `
        <div class="workflow-banner"><h3>${device.name} maintenance history</h3><p>Previous service records are available for planning.</p></div>
        <div class="log-list">
          <div class="log-row"><strong>182 days ago</strong>Visual inspection completed</div>
          <div class="log-row"><strong>365 days ago</strong>Calibration verified</div>
          <div class="log-row"><strong>548 days ago</strong>Meter communication module replaced</div>
        </div>`
    },
    verification: {
      state: "Verification report",
      html: `
        <div class="workflow-banner success"><h3>Firmware verification report</h3><p>The installed version, device heartbeat, and retained configuration were verified successfully.</p></div>
        <div class="verification-grid">
          <div class="verification-item">✓ Version: 2.1.0</div>
          <div class="verification-item">✓ Reboot: Successful</div>
          <div class="verification-item">✓ Configuration: Retained</div>
        </div>`
    },
    maintenancePlan: {
      state: "Maintenance plan",
      html: `
        <div class="workflow-banner success"><h3>Planned inspection</h3><p>The inspection is assigned to the next approved maintenance window.</p></div>
        <div class="log-list">
          <div class="log-row"><strong>Status</strong>Inspection planned</div>
          <div class="log-row"><strong>Scope</strong>Visual inspection and calibration review</div>
          <div class="log-row"><strong>Device operation</strong>Monitoring continues until the service window</div>
        </div>`
    },
    incidentSummary: {
      state: "Incident summary",
      html: `
        <div class="workflow-banner success"><h3>Incident resolved</h3><p>A failed management session was diagnosed and restored through a controlled reconnection.</p></div>
        <div class="log-list">
          <div class="log-row"><strong>Initial state</strong>Disconnected · critical alert</div>
          <div class="log-row"><strong>Diagnosis</strong>Network reachable, session unresponsive</div>
          <div class="log-row"><strong>Outcome</strong>Online · alert cleared</div>
        </div>`
    }
  };

  const view = views[state.workflowView] || views.eventLog;
  elements.workflowState.textContent = view.state;
  elements.workflowContent.innerHTML = view.html;
}

function summarySignals(device) {
  return `
    <div class="status-summary">
      <div><strong>Operational category</strong><p>${operationalCategory(device)}</p></div>
      ${primaryBadge(device)}
    </div>
  `;
}

function operationalCategory(device) {
  if (device.alertLevel === "Critical") return "Critical — immediate attention";
  if (device.alertLevel === "Warning") return "Warning — review required";
  if (device.maintenanceState === "Maintenance due") return "Maintenance — planning required";
  if (device.updateStatus === "Installing") return "Active update";
  return "Normal operation";
}

function renderActions() {
  const device = getSelectedDevice();
  if (!device) {
    elements.actionControls.innerHTML = `<p class="muted-message">Actions appear after you select a device.</p>`;
    return;
  }

  let actions = [];

  if (state.workflowView !== "default") {
    actions.push(actionButton("returnToOperation", "Return to current operation", "primary"));
  }

  if (state.activeScenario === "critical" && device.id === "GW-B2") {
    if (state.criticalStep === "idle") {
      actions.push(actionButton("runDiagnostics", "Run connection diagnostics", "danger"));
      actions.push(actionButton("openEventLog", "Open event log", "secondary"));
      actions.push(actionButton("acknowledgeAlert", device.acknowledged ? "Alert acknowledged" : "Acknowledge alert", "secondary", device.acknowledged));
    } else if (state.criticalStep === "diagnosed") {
      actions.push(actionButton("attemptReconnect", "Attempt reconnection", "danger"));
      actions.push(actionButton("openDiagnostic", "Open diagnostic report", "secondary"));
      actions.push(actionButton("escalateIncident", device.escalated ? "Incident escalated" : "Escalate incident", "secondary", device.escalated));
    } else if (state.criticalStep === "reconnecting") {
      actions.push(actionButton("waiting", "Reconnection in progress…", "primary", true));
      actions.push(actionButton("openDiagnostic", "Open diagnostic report", "secondary"));
    } else {
      actions.push(actionButton("viewIncidentSummary", "View incident summary", "primary"));
    }
  } else if (state.activeScenario === "firmware" && device.id === "CU-F6") {
    if (state.firmwareStep === "idle") {
      actions.push(actionButton("followUpdate", "Follow live progress", "primary"));
      actions.push(actionButton("openUpdateLog", "Open update log", "secondary"));
      actions.push(actionButton("pauseUpdate", "Pause update", "secondary"));
    } else if (state.firmwareStep === "monitoring") {
      actions.push(actionButton("waiting", "Monitoring update…", "primary", true));
      actions.push(actionButton("openUpdateLog", "Open update log", "secondary"));
    } else if (state.firmwareStep === "paused") {
      actions.push(actionButton("resumeUpdate", "Resume update", "primary"));
      actions.push(actionButton("openUpdateLog", "Open update log", "secondary"));
    } else if (state.firmwareStep === "complete") {
      actions.push(actionButton("verifyUpdate", "Verify installation", "primary"));
      actions.push(actionButton("openUpdateLog", "Open update log", "secondary"));
    } else {
      actions.push(actionButton("viewVerification", "View verification report", "primary"));
    }
  } else if (state.activeScenario === "maintenance" && device.id === "EM-E5") {
    if (state.maintenanceStep === "idle") {
      actions.push(actionButton("reviewMaintenance", "Review maintenance plan", "primary"));
      actions.push(actionButton("openConfiguration", "Open configuration", "secondary"));
      actions.push(actionButton("openHistory", "View maintenance history", "secondary"));
    } else if (state.maintenanceStep === "checklist") {
      actions.push(actionButton("planInspection", "Plan inspection", "primary", !allMaintenanceChecksComplete()));
      actions.push(actionButton("openConfiguration", "Open configuration", "secondary"));
      actions.push(actionButton("openHistory", "View maintenance history", "secondary"));
    } else {
      actions.push(actionButton("viewMaintenancePlan", "View maintenance plan", "primary"));
    }
  } else {
    if (device.id === "GW-B2" && device.alertLevel === "Critical") {
      actions.push(actionButton("openIncidentDetails", "Open incident details", "primary"));
    } else if (device.id === "CU-F6" && device.updateStatus === "Installing") {
      actions.push(actionButton("openUpdateLog", "Open update details", "primary"));
    } else {
      actions.push(actionButton("inspectEvents", "Inspect recent events", "primary"));
    }
    actions.push(actionButton("toggleWatchlist", device.watchlisted ? "Remove from watchlist" : "Add to watchlist", "secondary"));
  }

  elements.actionControls.innerHTML = actions.join("");
  elements.actionControls.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => handleAction(button.dataset.action));
  });
}

function actionButton(action, label, style = "secondary", disabled = false) {
  return `<button class="action-button ${style}" data-action="${action}" type="button" ${disabled ? "disabled" : ""}>${label}</button>`;
}

function handleAction(action) {
  const device = getSelectedDevice();
  if (!device) return;

  const handlers = {
    returnToOperation: () => { state.workflowView = "default"; },
    runDiagnostics: runDiagnostics,
    attemptReconnect: attemptReconnect,
    openEventLog: () => { state.workflowView = "eventLog"; },
    openDiagnostic: () => { state.workflowView = "diagnostic"; },
    acknowledgeAlert: acknowledgeAlert,
    escalateIncident: escalateIncident,
    viewIncidentSummary: () => { state.workflowView = "incidentSummary"; },
    followUpdate: followUpdate,
    pauseUpdate: pauseUpdate,
    resumeUpdate: resumeUpdate,
    verifyUpdate: verifyUpdate,
    openUpdateLog: () => { state.workflowView = "updateLog"; },
    viewVerification: () => { state.workflowView = "verification"; },
    reviewMaintenance: reviewMaintenance,
    planInspection: planInspection,
    openConfiguration: () => { state.workflowView = "configuration"; },
    openHistory: () => { state.workflowView = "history"; },
    viewMaintenancePlan: () => { state.workflowView = "maintenancePlan"; },
    inspectEvents: () => { state.workflowView = "eventLog"; },
    openIncidentDetails: () => { state.workflowView = "eventLog"; },
    toggleWatchlist: toggleWatchlist
  };

  if (handlers[action]) {
    handlers[action]();
    renderAll();
  }
}

function runDiagnostics() {
  state.criticalStep = "diagnosed";
  state.workflowView = "default";
  addActivity("Connection diagnostics completed", "Network reachable; management session unresponsive", "warning");
  showToast("Diagnostics completed. Review the result before choosing the next action.", "warning");
}

function attemptReconnect() {
  const gateway = getDeviceById("GW-B2");
  state.criticalStep = "reconnecting";
  state.workflowView = "default";
  gateway.status = "Reconnecting";
  gateway.connectionQuality = "Recovering";
  gateway.alertMessage = "Recovery in progress after communication loss";
  addActivity("Controlled reconnection started", "Gateway B2 management session is restarting", "info");
  showToast("Reconnection started. The alert remains active until communication is confirmed.", "info");
  renderAll();

  state.reconnectTimer = window.setTimeout(() => {
    gateway.status = "Online";
    gateway.connectionQuality = "Good";
    gateway.alertLevel = "None";
    gateway.alertMessage = "No active alert";
    gateway.maintenanceState = "Normal";
    gateway.lastSeen = "Just now";
    gateway.uptime = "Session restored";
    state.criticalStep = "resolved";
    state.reconnectTimer = null;
    addActivity("Communication restored", "Gateway B2 is online and the critical alert was cleared", "success");
    showToast("Gateway B2 reconnected successfully.", "success");
    renderAll();
  }, 2200);
}

function acknowledgeAlert() {
  const gateway = getDeviceById("GW-B2");
  gateway.acknowledged = true;
  addActivity("Alert acknowledged", "The incident remains unresolved", "info");
  showToast("Alert acknowledged. Diagnosis is still required.", "info");
}

function escalateIncident() {
  const gateway = getDeviceById("GW-B2");
  gateway.escalated = true;
  addActivity("Incident escalated", "A specialist review was requested", "warning");
  showToast("Incident escalated. Recovery can still be attempted.", "warning");
}

function followUpdate() {
  const device = getDeviceById("CU-F6");
  state.firmwareStep = "monitoring";
  state.workflowView = "default";
  device.updateStatus = "Installing";
  addActivity("Live update monitoring started", "Control Unit F6 progress is being followed", "info");
  showToast("Live progress started. No repeated action is required.", "info");

  state.firmwareTimer = window.setInterval(() => {
    device.updateProgress = Math.min(100, device.updateProgress + 4);
    if (device.updateProgress >= 100) {
      window.clearInterval(state.firmwareTimer);
      state.firmwareTimer = null;
      state.firmwareStep = "complete";
      device.updateStatus = "Completed — verification required";
      addActivity("Firmware installation completed", "Control Unit F6 requires result verification", "warning");
      showToast("Installation completed. Verification is required.", "warning");
    }
    renderAll();
  }, 280);
}

function pauseUpdate() {
  const device = getDeviceById("CU-F6");
  state.firmwareStep = "paused";
  device.updateStatus = "Paused";
  addActivity("Firmware update paused", "Control Unit F6 remains online", "warning");
  showToast("Update paused. It can be resumed without restarting the scenario.", "warning");
}

function resumeUpdate() {
  const device = getDeviceById("CU-F6");
  device.updateStatus = "Installing";
  state.firmwareStep = "idle";
  addActivity("Firmware update resumed", "Control Unit F6 returned to installation", "info");
  showToast("Update resumed. Follow live progress when ready.", "info");
}

function verifyUpdate() {
  const device = getDeviceById("CU-F6");
  state.firmwareStep = "verified";
  state.workflowView = "default";
  device.updateStatus = "Verified";
  device.firmware = device.targetFirmware;
  device.updateProgress = 100;
  device.lastSeen = "Just now";
  addActivity("Firmware result verified", "Control Unit F6 reports version 2.1.0", "success");
  showToast("Firmware 2.1.0 verified successfully.", "success");
}

function reviewMaintenance() {
  state.maintenanceStep = "checklist";
  state.workflowView = "default";
  addActivity("Maintenance plan opened", "Planning prerequisites are ready for review", "info");
  showToast("Review all prerequisites before planning the inspection.", "info");
}

function planInspection() {
  if (!allMaintenanceChecksComplete()) {
    showToast("Complete the maintenance prerequisites first.", "warning");
    return;
  }
  const device = getDeviceById("EM-E5");
  state.maintenanceStep = "planned";
  state.workflowView = "default";
  device.maintenanceState = "Inspection planned";
  addActivity("Inspection planned", "Energy Meter E5 added to the next maintenance window", "success");
  showToast("Inspection planned successfully.", "success");
}

function toggleWatchlist() {
  const device = getSelectedDevice();
  device.watchlisted = !device.watchlisted;
  addActivity(device.watchlisted ? "Device added to watchlist" : "Device removed from watchlist", device.name, "info");
  showToast(`${device.name} ${device.watchlisted ? "added to" : "removed from"} the watchlist.`, "info");
}

function renderAlerts() {
  const devicesWithAlerts = state.devices
    .filter((device) => device.alertLevel !== "None")
    .sort((a, b) => priorityScore(b) - priorityScore(a));

  elements.alertCount.textContent = `${devicesWithAlerts.length} active`;
  if (!devicesWithAlerts.length) {
    elements.alertList.innerHTML = `<div class="empty-state compact"><h3>No active alerts</h3><p>All devices are currently reporting without alert conditions.</p></div>`;
    return;
  }

  elements.alertList.innerHTML = devicesWithAlerts.map((device) => `
    <button class="alert-item ${device.alertLevel.toLowerCase()}" data-alert-device="${device.id}" type="button">
      <div class="alert-topline">
        <h3>${device.alertLevel}: ${device.name}</h3>
        <span class="alert-time">${device.lastSeen}</span>
      </div>
      <p>${device.alertMessage}. Select to inspect the device.</p>
    </button>
  `).join("");

  elements.alertList.querySelectorAll("[data-alert-device]").forEach((alert) => {
    alert.addEventListener("click", () => selectDevice(alert.dataset.alertDevice));
  });
}

function renderActivity() {
  elements.activityList.innerHTML = state.activity.map((entry) => `
    <div class="activity-item">
      <span class="activity-marker ${entry.level}"></span>
      <div class="activity-copy"><strong>${entry.title}</strong><span>${entry.detail} · ${entry.time}</span></div>
    </div>
  `).join("");
}

function renderSecondary() {
  const content = {
    normal: [
      ["Certificate overview", "All six device certificates are currently valid."],
      ["Available package", "Firmware package 2.1.0 is approved for compatible devices."],
      ["Maintenance note", "Energy Meter E5 is approaching its service window."]
    ],
    critical: [
      ["Other warning", "Sensor Hub C3 has a recommended firmware update."],
      ["Update history", "Safety Relay D4 had a previous validation failure."],
      ["Fleet status", "The remaining online devices continue to report normally."]
    ],
    firmware: [
      ["Critical operational issue", "Gateway B2 has an active communication failure."],
      ["Related update history", "Safety Relay D4 had a previous validation failure."],
      ["Package information", "Firmware 2.1.0 passed package validation before deployment."]
    ],
    multi: [
      ["Fleet distribution", "One critical device, three attention states, and two normal devices."],
      ["Filter behavior", "Filters reduce the visible list but do not change device data."],
      ["Overview recovery", "Choose All states to restore the complete device overview."]
    ],
    maintenance: [
      ["Operational alerts", "Communication and firmware warnings remain accessible during planning."],
      ["Service records", "Previous inspection and calibration records are available."],
      ["Monitoring continuity", "Energy Meter E5 remains online until the service window."]
    ]
  };

  elements.secondaryContent.innerHTML = `<div class="secondary-list">${content[state.activeScenario].map(([title, text]) => `
    <div class="secondary-row"><strong>${title}</strong>${text}</div>
  `).join("")}</div>`;
  elements.secondaryContent.classList.toggle("hidden", !state.secondaryVisible);
  elements.toggleSecondary.textContent = state.secondaryVisible ? "Hide" : "Show";
}

function renderResearcherState() {
  elements.scenarioCards.forEach((card) => {
    card.classList.toggle("active", card.dataset.scenario === state.activeScenario);
  });
}

function openScenarioDrawer() {
  elements.scenarioDrawer.classList.remove("hidden");
  elements.drawerBackdrop.classList.remove("hidden");
}

function closeScenarioDrawer() {
  elements.scenarioDrawer.classList.add("hidden");
  elements.drawerBackdrop.classList.add("hidden");
}

function setParticipantMode(enabled) {
  state.participantMode = enabled;
  closeScenarioDrawer();
  renderContext();
  if (enabled) {
    showToast("Participant view enabled. Press Ctrl + Shift + M to restore researcher controls.", "info");
  } else {
    showToast("Researcher controls restored.", "info");
  }
}

function showToast(message, level = "info") {
  const toast = document.createElement("div");
  toast.className = `toast ${level}`;
  toast.textContent = message;
  elements.toastRegion.appendChild(toast);
  window.setTimeout(() => toast.remove(), 3400);
}

elements.deviceSearch.addEventListener("input", (event) => {
  state.search = event.target.value;
  renderDevices();
});

elements.deviceFilter.addEventListener("change", (event) => {
  state.filter = event.target.value;
  renderDevices();
  if (state.activeScenario === "multi") {
    addActivity("Fleet filter changed", event.target.options[event.target.selectedIndex].text, "info");
    renderActivity();
  }
});

elements.deviceSort.addEventListener("change", (event) => {
  state.sort = event.target.value;
  renderDevices();
});

elements.toggleSecondary.addEventListener("click", () => {
  state.secondaryVisible = !state.secondaryVisible;
  renderSecondary();
});

elements.openScenarioPanel.addEventListener("click", openScenarioDrawer);
elements.closeScenarioPanel.addEventListener("click", closeScenarioDrawer);
elements.drawerBackdrop.addEventListener("click", closeScenarioDrawer);
elements.resetScenario.addEventListener("click", () => loadScenario(state.activeScenario));
elements.enterParticipantMode.addEventListener("click", () => setParticipantMode(true));

elements.scenarioCards.forEach((card) => {
  card.addEventListener("click", () => loadScenario(card.dataset.scenario));
});

document.addEventListener("keydown", (event) => {
  if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "m") {
    event.preventDefault();
    setParticipantMode(!state.participantMode);
  }
});

loadScenario("normal", false);
