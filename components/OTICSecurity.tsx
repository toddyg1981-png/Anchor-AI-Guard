import React, { useState } from 'react';

// ============================================================================
// IoT/OT/ICS SECURITY
// ============================================================================
// Industrial Control Systems, Operational Technology, Internet of Things
// Critical infrastructure protection for government and enterprise
// SCADA, PLCs, Building Management, Manufacturing, Utilities
// ============================================================================

interface OTDevice {
  id: string;
  name: string;
  type: 'plc' | 'scada' | 'hmi' | 'rtu' | 'sensor' | 'actuator' | 'gateway' | 'bms' | 'iot';
  manufacturer: string;
  model: string;
  firmware: string;
  ipAddress: string;
  protocol: string;
  zone: string;
  criticality: 'critical' | 'high' | 'medium' | 'low';
  status: 'online' | 'offline' | 'degraded' | 'unknown';
  lastSeen: string;
  vulnerabilities: number;
  compliance: number;
}

interface NetworkZone {
  id: string;
  name: string;
  level: number; // Purdue Model level
  description: string;
  devices: number;
  firewallRules: number;
  status: 'secured' | 'at_risk' | 'breach';
}

interface OTAlert {
  id: string;
  timestamp: string;
  device: string;
  zone: string;
  alertType: 'unauthorized_access' | 'protocol_anomaly' | 'firmware_change' | 'config_change' | 'network_scan' | 'malware_detected' | 'physical_tampering';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  status: 'open' | 'investigating' | 'resolved';
}

interface Protocol {
  name: string;
  secure: boolean;
  encrypted: boolean;
  usage: number;
}

export const OTICSecurity: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'devices' | 'network' | 'alerts' | 'protocols'>('dashboard');

  const otDevices: OTDevice[] = [
    { id: 'd-1', name: 'Main PLC Controller', type: 'plc', manufacturer: 'Siemens', model: 'S7-1500', firmware: 'V2.9.4', ipAddress: '10.100.1.10', protocol: 'Profinet', zone: 'Control Zone', criticality: 'critical', status: 'online', lastSeen: '2026-02-04T11:55:00Z', vulnerabilities: 2, compliance: 85 },
    { id: 'd-2', name: 'SCADA Server', type: 'scada', manufacturer: 'Schneider', model: 'ClearSCADA', firmware: 'V2021.1', ipAddress: '10.100.2.5', protocol: 'OPC-UA', zone: 'Supervisory Zone', criticality: 'critical', status: 'online', lastSeen: '2026-02-04T11:55:00Z', vulnerabilities: 1, compliance: 92 },
    { id: 'd-3', name: 'HMI Panel #1', type: 'hmi', manufacturer: 'Allen-Bradley', model: 'PanelView', firmware: 'V12.0', ipAddress: '10.100.1.20', protocol: 'EtherNet/IP', zone: 'Control Zone', criticality: 'high', status: 'online', lastSeen: '2026-02-04T11:50:00Z', vulnerabilities: 0, compliance: 95 },
    { id: 'd-4', name: 'Remote Terminal Unit', type: 'rtu', manufacturer: 'ABB', model: 'RTU560', firmware: 'V3.2.1', ipAddress: '10.100.3.15', protocol: 'DNP3', zone: 'Remote Access', criticality: 'high', status: 'degraded', lastSeen: '2026-02-04T11:30:00Z', vulnerabilities: 3, compliance: 72 },
    { id: 'd-5', name: 'Temperature Sensor Array', type: 'sensor', manufacturer: 'Honeywell', model: 'T7350', firmware: 'V1.4', ipAddress: '10.100.4.100', protocol: 'BACnet', zone: 'Field Zone', criticality: 'medium', status: 'online', lastSeen: '2026-02-04T11:55:00Z', vulnerabilities: 0, compliance: 88 },
    { id: 'd-6', name: 'Building Management System', type: 'bms', manufacturer: 'Johnson Controls', model: 'Metasys', firmware: 'V11.0', ipAddress: '10.100.5.1', protocol: 'BACnet', zone: 'BMS Zone', criticality: 'medium', status: 'online', lastSeen: '2026-02-04T11:55:00Z', vulnerabilities: 1, compliance: 90 },
    { id: 'd-7', name: 'IoT Gateway', type: 'gateway', manufacturer: 'Cisco', model: 'IR1101', firmware: 'V17.6.1', ipAddress: '10.100.0.1', protocol: 'MQTT', zone: 'DMZ', criticality: 'high', status: 'online', lastSeen: '2026-02-04T11:55:00Z', vulnerabilities: 0, compliance: 98 },
    { id: 'd-8', name: 'Smart Meter', type: 'iot', manufacturer: 'Itron', model: 'OpenWay', firmware: 'V8.2', ipAddress: '10.100.6.50', protocol: 'DLMS/COSEM', zone: 'Field Zone', criticality: 'low', status: 'online', lastSeen: '2026-02-04T11:45:00Z', vulnerabilities: 1, compliance: 82 },
  ];

  const networkZones: NetworkZone[] = [
    { id: 'z-1', name: 'Enterprise Zone (Level 4-5)', level: 5, description: 'Corporate IT Network, Business Systems', devices: 45, firewallRules: 150, status: 'secured' },
    { id: 'z-2', name: 'DMZ (Level 3.5)', level: 4, description: 'Data Diode, Historian, Patch Server', devices: 8, firewallRules: 85, status: 'secured' },
    { id: 'z-3', name: 'Supervisory Zone (Level 3)', level: 3, description: 'SCADA, HMI Servers, Engineering Workstations', devices: 12, firewallRules: 60, status: 'secured' },
    { id: 'z-4', name: 'Control Zone (Level 2)', level: 2, description: 'PLCs, DCS, RTUs', devices: 25, firewallRules: 45, status: 'at_risk' },
    { id: 'z-5', name: 'Field Zone (Level 0-1)', level: 1, description: 'Sensors, Actuators, Physical Equipment', devices: 150, firewallRules: 20, status: 'secured' },
  ];

  const alerts: OTAlert[] = [
    { id: 'a-1', timestamp: '2026-02-04T11:45:00Z', device: 'Main PLC Controller', zone: 'Control Zone', alertType: 'unauthorized_access', severity: 'critical', description: 'Unauthorized engineering workstation attempted to connect', status: 'investigating' },
    { id: 'a-2', timestamp: '2026-02-04T11:30:00Z', device: 'Remote Terminal Unit', zone: 'Remote Access', alertType: 'protocol_anomaly', severity: 'high', description: 'Abnormal DNP3 command sequence detected', status: 'investigating' },
    { id: 'a-3', timestamp: '2026-02-04T10:15:00Z', device: 'SCADA Server', zone: 'Supervisory Zone', alertType: 'network_scan', severity: 'medium', description: 'Port scan detected from internal network', status: 'resolved' },
    { id: 'a-4', timestamp: '2026-02-04T09:00:00Z', device: 'HMI Panel #1', zone: 'Control Zone', alertType: 'config_change', severity: 'medium', description: 'Configuration change outside maintenance window', status: 'open' },
    { id: 'a-5', timestamp: '2026-02-03T22:30:00Z', device: 'IoT Gateway', zone: 'DMZ', alertType: 'firmware_change', severity: 'low', description: 'Scheduled firmware update completed', status: 'resolved' },
  ];

  const protocols: Protocol[] = [
    { name: 'OPC-UA', secure: true, encrypted: true, usage: 35 },
    { name: 'Modbus TCP', secure: false, encrypted: false, usage: 25 },
    { name: 'EtherNet/IP', secure: true, encrypted: false, usage: 15 },
    { name: 'DNP3', secure: true, encrypted: true, usage: 10 },
    { name: 'BACnet', secure: false, encrypted: false, usage: 8 },
    { name: 'Profinet', secure: true, encrypted: false, usage: 5 },
    { name: 'MQTT', secure: true, encrypted: true, usage: 2 },
  ];

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'plc': return '🎛️';
      case 'scada': return '🖥️';
      case 'hmi': return '📟';
      case 'rtu': return '📡';
      case 'sensor': return '🌡️';
      case 'actuator': return '⚙️';
      case 'gateway': return '🌐';
      case 'bms': return '🏢';
      case 'iot': return '📱';
      default: return '❓';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': case 'secured': return 'bg-green-500/20 text-green-400';
      case 'offline': case 'breach': return 'bg-red-500/20 text-red-400';
      case 'degraded': case 'at_risk': return 'bg-yellow-500/20 text-yellow-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const criticalAlerts = alerts.filter(a => a.severity === 'critical' && a.status !== 'resolved').length;
  const totalVulns = otDevices.reduce((sum, d) => sum + d.vulnerabilities, 0);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">🏭 OT/ICS Security</h1>
          <p className="text-gray-400">Operational Technology & Industrial Control Systems Protection</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => alert('Asset discovery scan initiated.\n\nScanning network for:\n• PLCs, SCADA systems, HMIs\n• RTUs, sensors, actuators\n• IoT gateways and devices\n• Building management systems\n\nUsing passive network discovery to avoid disrupting operations.')} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg">
            🔍 Asset Discovery
          </button>
          <button onClick={() => { alert('Generating OT/ICS Security Report...'); window.print(); }} className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 rounded-lg font-bold">
            📊 Generate Report
          </button>
        </div>
      </div>

      {/* Alert Banner */}
      {criticalAlerts > 0 && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-xl animate-pulse">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🚨</span>
            <div>
              <div className="font-bold text-red-400">{criticalAlerts} Critical OT Alerts</div>
              <div className="text-sm text-gray-400">Unauthorized access and protocol anomalies detected</div>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-cyan-400">{otDevices.length}</div>
          <div className="text-sm text-gray-400">OT Devices</div>
        </div>
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-green-400">{otDevices.filter(d => d.status === 'online').length}</div>
          <div className="text-sm text-gray-400">Online</div>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-red-400">{totalVulns}</div>
          <div className="text-sm text-gray-400">Vulnerabilities</div>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-purple-400">{networkZones.length}</div>
          <div className="text-sm text-gray-400">Network Zones</div>
        </div>
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-orange-400">{alerts.filter(a => a.status !== 'resolved').length}</div>
          <div className="text-sm text-gray-400">Open Alerts</div>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-yellow-400">{protocols.filter(p => !p.secure).length}</div>
          <div className="text-sm text-gray-400">Insecure Protocols</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-800 pb-2">
        {[
          { id: 'dashboard', label: '📊 Dashboard' },
          { id: 'devices', label: '🎛️ Devices' },
          { id: 'network', label: '🌐 Network Zones' },
          { id: 'alerts', label: '⚠️ Alerts' },
          { id: 'protocols', label: '📡 Protocols' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h3 className="font-semibold mb-4">🏗️ Purdue Model Network Architecture</h3>
            <div className="space-y-2">
              {networkZones.map((zone, _idx) => (
                <div 
                  key={zone.id} 
                  className={`p-4 rounded-lg border ${
                    zone.status === 'secured' ? 'border-green-500/30 bg-green-500/5' :
                    zone.status === 'at_risk' ? 'border-yellow-500/30 bg-yellow-500/5' :
                    'border-red-500/30 bg-red-500/5'
                  }`}
                  style={{ marginLeft: `${(5 - zone.level) * 12}px` }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{zone.name}</div>
                      <div className="text-xs text-gray-500">{zone.description}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">{zone.devices} devices</div>
                      <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(zone.status)}`}>
                        {zone.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h3 className="font-semibold mb-4">🔥 Recent OT Alerts</h3>
            <div className="space-y-3">
              {alerts.slice(0, 5).map(alert => (
                <div key={alert.id} className={`p-3 rounded-lg border ${
                  alert.severity === 'critical' ? 'border-red-500/30 bg-red-500/10' :
                  alert.severity === 'high' ? 'border-orange-500/30 bg-orange-500/10' :
                  'border-yellow-500/30 bg-yellow-500/10'
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{alert.alertType.replace(/_/g, ' ')}</span>
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      alert.status === 'resolved' ? 'bg-green-500/20 text-green-400' :
                      alert.status === 'investigating' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {alert.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400">{alert.device} • {alert.zone}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Devices Tab */}
      {activeTab === 'devices' && (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-400 border-b border-gray-800">
                <th className="p-4">Device</th>
                <th className="p-4">Type</th>
                <th className="p-4">Manufacturer</th>
                <th className="p-4">Protocol</th>
                <th className="p-4">Zone</th>
                <th className="p-4">Status</th>
                <th className="p-4">Vulns</th>
                <th className="p-4">Compliance</th>
              </tr>
            </thead>
            <tbody>
              {otDevices.map(device => (
                <tr key={device.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span>{getDeviceIcon(device.type)}</span>
                      <div>
                        <div className="font-medium">{device.name}</div>
                        <div className="text-xs text-gray-500">{device.ipAddress}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">{device.type.toUpperCase()}</td>
                  <td className="p-4">
                    <div>{device.manufacturer}</div>
                    <div className="text-xs text-gray-500">{device.model}</div>
                  </td>
                  <td className="p-4 font-mono text-sm">{device.protocol}</td>
                  <td className="p-4">{device.zone}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(device.status)}`}>
                      {device.status}
                    </span>
                  </td>
                  <td className="p-4">
                    {device.vulnerabilities > 0 ? (
                      <span className="text-red-400 font-bold">{device.vulnerabilities}</span>
                    ) : (
                      <span className="text-green-400">0</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className={`font-bold ${
                      device.compliance >= 90 ? 'text-green-400' :
                      device.compliance >= 70 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {device.compliance}%
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Network Tab */}
      {activeTab === 'network' && (
        <div className="space-y-4">
          {networkZones.map(zone => (
            <div key={zone.id} className={`p-6 rounded-xl border ${
              zone.status === 'secured' ? 'border-green-500/30 bg-green-500/5' :
              zone.status === 'at_risk' ? 'border-yellow-500/30 bg-yellow-500/5' :
              'border-red-500/30 bg-red-500/5'
            }`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-cyan-400">Level {zone.level}</span>
                    <h3 className="font-semibold text-lg">{zone.name}</h3>
                  </div>
                  <p className="text-sm text-gray-400">{zone.description}</p>
                </div>
                <span className={`px-3 py-1 rounded ${getStatusColor(zone.status)}`}>
                  {zone.status}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 bg-gray-800/50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-cyan-400">{zone.devices}</div>
                  <div className="text-sm text-gray-500">Devices</div>
                </div>
                <div className="p-3 bg-gray-800/50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-400">{zone.firewallRules}</div>
                  <div className="text-sm text-gray-500">Firewall Rules</div>
                </div>
                <div className="p-3 bg-gray-800/50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-400">✓</div>
                  <div className="text-sm text-gray-500">IDS Active</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Alerts Tab */}
      {activeTab === 'alerts' && (
        <div className="space-y-4">
          {alerts.map(alert => (
            <div key={alert.id} className={`p-6 rounded-xl border ${
              alert.severity === 'critical' ? 'border-red-500/30 bg-red-500/5' :
              alert.severity === 'high' ? 'border-orange-500/30 bg-orange-500/5' :
              alert.severity === 'medium' ? 'border-yellow-500/30 bg-yellow-500/5' :
              'border-blue-500/30 bg-blue-500/5'
            }`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                      alert.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                      alert.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {alert.severity}
                    </span>
                    <span className="font-semibold">{alert.alertType.replace(/_/g, ' ')}</span>
                  </div>
                  <div className="text-sm text-gray-500">{alert.device} • {alert.zone}</div>
                </div>
                <span className={`px-3 py-1 rounded ${
                  alert.status === 'resolved' ? 'bg-green-500/20 text-green-400' :
                  alert.status === 'investigating' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {alert.status}
                </span>
              </div>
              <p className="text-sm text-gray-400">{alert.description}</p>
              <div className="mt-3 text-xs text-gray-500">
                {new Date(alert.timestamp).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Protocols Tab */}
      {activeTab === 'protocols' && (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <h3 className="font-semibold mb-4">📡 Industrial Protocol Usage</h3>
          <div className="space-y-4">
            {protocols.sort((a, b) => b.usage - a.usage).map(protocol => (
              <div key={protocol.name} className="p-4 bg-gray-800/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{protocol.name}</span>
                    {protocol.secure ? (
                      <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs">Secure</span>
                    ) : (
                      <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-xs">Insecure</span>
                    )}
                    {protocol.encrypted ? (
                      <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 rounded text-xs">Encrypted</span>
                    ) : (
                      <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs">Unencrypted</span>
                    )}
                  </div>
                  <span className="text-gray-400">{protocol.usage}% of traffic</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${protocol.secure ? 'bg-green-500' : 'bg-red-500'}`}
                    style={{ width: `${protocol.usage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500 rounded-lg">
            <div className="font-bold text-yellow-400">⚠️ Security Recommendations</div>
            <ul className="text-sm text-gray-400 mt-2 space-y-1">
              <li>• Migrate Modbus TCP to Modbus/TCP Secure or OPC-UA</li>
              <li>• Enable encryption for BACnet using BACnet/SC</li>
              <li>• Implement network segmentation between OT zones</li>
              <li>• Deploy industrial-grade firewalls with DPI for OT protocols</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default OTICSecurity;
