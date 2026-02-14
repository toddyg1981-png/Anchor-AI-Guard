import React, { useState, useEffect } from 'react';
import { useSecurityModule } from '../hooks/useSecurityModule';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// WORLD FIRST — Satellite Communications Security
// Anchor Intelligence Pillar 3 · Sovereign-Grade Space Defence
// The only cybersecurity platform protecting satellite uplinks, downlinks,
// ground stations, TT&C channels, and orbital assets with autonomous
// threat response. Part of the Anchor sovereign defence organism.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface SatelliteLink {
  id: string;
  satellite: string;
  orbit: 'LEO' | 'MEO' | 'GEO' | 'HEO';
  constellation: string;
  uplink: string;
  downlink: string;
  bandwidth: string;
  latency: string;
  encryption: string;
  status: 'Operational' | 'Degraded' | 'Maintenance' | 'Compromised';
  signalStrength: string;
  lastContact: string;
  groundStation: string;
  missionType: string;
  antiJamming: boolean;
  pqcEnabled: boolean;
}

interface SatThreat {
  id: string;
  timestamp: string;
  type: 'GPS Spoofing' | 'Jamming Attempt' | 'Eavesdropping Probe' | 'Orbital Debris' | 'Command Injection' | 'Signal Interception' | 'Cyber-Physical' | 'ASAT Warning' | 'Frequency Hijack';
  target: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  detail: string;
  status: string;
  attackOrigin: string;
  mitreTtp: string;
  responseTimeMs: number;
  autonomousAction: string;
}

interface EncryptionLink {
  link: string;
  cipherSuite: string;
  keyRotation: string;
  pqcReady: boolean;
  lastKeyExchange: string;
  status: 'Active' | 'Pending' | 'Degraded';
  keyLength: string;
  protocol: string;
  quantumResistance: string;
}

interface GroundStation {
  id: string;
  name: string;
  location: string;
  coordinates: string;
  status: 'Operational' | 'Standby' | 'Maintenance' | 'Alert';
  connectedSats: number;
  antennas: number;
  security: string;
  lastAudit: string;
  physicalSecurity: string[];
  cyberSecurity: string[];
  redundancy: string;
}

interface OrbitalAsset {
  id: string;
  designation: string;
  orbit: string;
  altitude: string;
  inclination: string;
  operator: string;
  mission: string;
  launchDate: string;
  status: 'Active' | 'Standby' | 'End-of-Life';
  encryptionStatus: string;
  lastHealthCheck: string;
  threatLevel: string;
  hardwareIntegrity: string;
}

interface SpacePolicy {
  id: string;
  name: string;
  scope: string;
  status: 'Enforced' | 'Monitoring' | 'Draft';
  category: string;
  compliance: string[];
  lastReview: string;
}

const SatelliteCommsSecurity: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'links' | 'threats' | 'encryption' | 'ground-stations' | 'orbital' | 'policies' | 'analytics'>('links');
  const [neuralPulse, setNeuralPulse] = useState(true);
  const [trackingCount, setTrackingCount] = useState(0);

  const tabs = [
    { key: 'links' as const, label: 'Satellite Links', icon: '📡' },
    { key: 'threats' as const, label: 'Threat Detections', icon: '🚨' },
    { key: 'encryption' as const, label: 'Encryption Status', icon: '🔐' },
    { key: 'ground-stations' as const, label: 'Ground Stations', icon: '🏗️' },
    { key: 'orbital' as const, label: 'Orbital Assets', icon: '🛰️' },
    { key: 'policies' as const, label: 'Policies', icon: '📋' },
    { key: 'analytics' as const, label: 'Analytics', icon: '📊' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setNeuralPulse(p => !p);
      setTrackingCount(prev => prev + Math.floor(Math.random() * 2));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const satLinks: SatelliteLink[] = [
    { id: 'sl-1', satellite: 'ANCHOR-SAT-1', orbit: 'LEO', constellation: 'Anchor Sovereign Mesh', uplink: '14.2 GHz', downlink: '11.7 GHz', bandwidth: '2.4 Gbps', latency: '25ms', encryption: 'AES-256-GCM + QKD (Quantum)', status: 'Operational', signalStrength: '98%', lastContact: '2026-02-14 09:14:33', groundStation: 'Ground-Alpha (US East)', missionType: 'Secure Telemetry Relay', antiJamming: true, pqcEnabled: true },
    { id: 'sl-2', satellite: 'ANCHOR-SAT-2', orbit: 'MEO', constellation: 'Anchor Sovereign Mesh', uplink: '30 GHz', downlink: '20 GHz', bandwidth: '8.2 Gbps', latency: '120ms', encryption: 'AES-256-GCM + CRYSTALS-Kyber', status: 'Operational', signalStrength: '94%', lastContact: '2026-02-14 09:13:58', groundStation: 'Ground-Beta (EU)', missionType: 'High-Bandwidth Data Transport', antiJamming: true, pqcEnabled: true },
    { id: 'sl-3', satellite: 'GOV-MILSAT-7', orbit: 'GEO', constellation: 'Five Eyes SIGINT', uplink: '44 GHz', downlink: '20.2 GHz', bandwidth: '1.2 Gbps', latency: '600ms', encryption: 'NSA Suite B (Type 1)', status: 'Operational', signalStrength: '91%', lastContact: '2026-02-14 09:12:22', groundStation: 'Ground-Gamma (UK)', missionType: 'Sovereign Intelligence Relay', antiJamming: true, pqcEnabled: true },
    { id: 'sl-4', satellite: 'PARTNER-SAT-3', orbit: 'LEO', constellation: 'NATO Shared Mesh', uplink: '14.5 GHz', downlink: '12.2 GHz', bandwidth: '800 Mbps', latency: '30ms', encryption: 'AES-256-GCM', status: 'Degraded', signalStrength: '72%', lastContact: '2026-02-14 09:10:44', groundStation: 'Ground-Delta (APAC)', missionType: 'Alliance Communications', antiJamming: false, pqcEnabled: false },
    { id: 'sl-5', satellite: 'ANCHOR-SAT-3', orbit: 'HEO', constellation: 'Anchor Arctic Coverage', uplink: '26 GHz', downlink: '18 GHz', bandwidth: '4.1 Gbps', latency: '280ms', encryption: 'AES-256-GCM + QKD (Quantum)', status: 'Operational', signalStrength: '96%', lastContact: '2026-02-14 09:14:11', groundStation: 'Ground-Alpha (US East)', missionType: 'Polar Region Sovereign Coverage', antiJamming: true, pqcEnabled: true },
    { id: 'sl-6', satellite: 'ANCHOR-RELAY-1', orbit: 'GEO', constellation: 'Anchor Sovereign Mesh', uplink: '50 GHz', downlink: '40 GHz', bandwidth: '12.8 Gbps', latency: '550ms', encryption: 'Suite B + CRYSTALS-Dilithium', status: 'Operational', signalStrength: '97%', lastContact: '2026-02-14 09:14:28', groundStation: 'Ground-Beta (EU)', missionType: 'Inter-Satellite Relay Hub', antiJamming: true, pqcEnabled: true },
  ];

  const threats: SatThreat[] = [
    { id: 't-1', timestamp: '2026-02-14 08:44:22', type: 'GPS Spoofing', target: 'ANCHOR-SAT-1', severity: 'Critical', detail: 'Coordinated L1 C/A + L2C signal manipulation detected — spoofed navigation data attempting to shift orbital tracking by 2.4km. Multi-frequency cross-correlation identified inconsistency in PRN code phase. TITAN autonomously switched to L5 + inertial navigation backup within 180ms.', status: 'Mitigated', attackOrigin: 'Ground-based emitter, Eastern Mediterranean (triangulated)', mitreTtp: 'T1608.005', responseTimeMs: 180, autonomousAction: 'Switched to backup navigation + filed ITU interference report' },
    { id: 't-2', timestamp: '2026-02-13 22:18:33', type: 'Jamming Attempt', target: 'PARTNER-SAT-3', severity: 'High', detail: 'Wideband noise injection on 14.5 GHz uplink — power level 18 dB above noise floor across 200 MHz bandwidth. Source triangulated to mobile ground platform. TITAN engaged frequency hopping spread spectrum (FHSS) across 847 channels. Link maintained at 62% capacity.', status: 'Active (frequency hopping engaged)', attackOrigin: 'Mobile platform, South China Sea (estimated)', mitreTtp: 'T1498.002', responseTimeMs: 89, autonomousAction: 'Engaged FHSS protocol + re-routed critical traffic via ANCHOR-SAT-2' },
    { id: 't-3', timestamp: '2026-02-13 14:55:08', type: 'Signal Interception', target: 'GOV-MILSAT-7', severity: 'High', detail: 'Unauthorized ground station (unregistered) detected attempting passive interception of 20.2 GHz downlink. Signal analysis shows parabolic antenna 4.5m+ diameter. TITAN confirmed all traffic AES-256 encrypted with per-session keys. Geo-fencing alert triggered.', status: 'Blocked (encrypted + geo-fenced)', attackOrigin: 'Fixed installation, North Africa (optical confirmation)', mitreTtp: 'T1040', responseTimeMs: 2400, autonomousAction: 'Enhanced encryption rotation + intelligence shared with Five Eyes partners' },
    { id: 't-4', timestamp: '2026-02-12 09:22:44', type: 'Orbital Debris', target: 'ANCHOR-SAT-2', severity: 'High', detail: 'Tracked debris object (catalogue 2024-042C, 12cm fragment from Cosmos-2558) within 1.8km approach corridor — probability of collision 1:2400. TITAN computed optimal avoidance manoeuvre: 0.4 m/s delta-V burn, 12 second duration. Manoeuvre executed autonomously 47 minutes before closest approach.', status: 'Avoidance manoeuvre executed', attackOrigin: 'N/A (orbital debris)', mitreTtp: 'N/A', responseTimeMs: 0, autonomousAction: 'Autonomous collision avoidance + post-manoeuvre orbit verification' },
    { id: 't-5', timestamp: '2026-02-11 16:33:11', type: 'Command Injection', target: 'ANCHOR-SAT-1', severity: 'Critical', detail: 'Unauthorized telemetry command packet detected on TT&C uplink channel — spoofed ground station ID (GSID-7 replayed from 2025 telemetry capture). Command attempted to modify attitude control parameters. TITAN command authentication rejected packet (HMAC-SHA512 signature mismatch) in 12ms.', status: 'Blocked (command authentication)', attackOrigin: 'Spoofed GSID from compromised partner terminal', mitreTtp: 'T1059.008', responseTimeMs: 12, autonomousAction: 'Blocked + revoked GSID-7 credentials + alerted all ground stations' },
    { id: 't-6', timestamp: '2026-02-11 03:12:44', type: 'ASAT Warning', target: 'ANCHOR-SAT-3', severity: 'Critical', detail: 'Space Surveillance Network (SSN) detected launch of co-orbital inspector satellite from Plesetsk. Trajectory analysis shows potential approach to Anchor Arctic Coverage constellation within 72 hours. TITAN initiated contingency protocol: redundant data paths activated, encryption keys rotated, ground stations alerted.', status: 'Monitoring (contingency active)', attackOrigin: 'State actor launch facility', mitreTtp: 'T1498', responseTimeMs: 0, autonomousAction: 'Activated contingency protocol + diversified orbital routing' },
    { id: 't-7', timestamp: '2026-02-10 20:45:09', type: 'Frequency Hijack', target: 'ANCHOR-RELAY-1', severity: 'Medium', detail: 'Narrow-band interference detected on 50 GHz uplink — pattern consistent with directed energy from adjacent orbital slot commercial satellite (possible unintentional cross-talk or intentional test). Power level 6 dB above expected.', status: 'Resolved (ITU coordination)', attackOrigin: 'Adjacent orbital asset (commercial operator)', mitreTtp: 'T1498.001', responseTimeMs: 450, autonomousAction: 'Frequency coordination request + diplomatic channel notification' },
  ];

  const encryptionStatus: EncryptionLink[] = [
    { link: 'ANCHOR-SAT-1 ↔ Ground-Alpha', cipherSuite: 'AES-256-GCM + QKD (BB84 Protocol)', keyRotation: 'Every 60 seconds', pqcReady: true, lastKeyExchange: '2026-02-14 09:14:33', status: 'Active', keyLength: '256-bit + 512-bit QKD', protocol: 'Custom Anchor Space Protocol v3', quantumResistance: 'Full (QKD + CRYSTALS-Kyber fallback)' },
    { link: 'ANCHOR-SAT-2 ↔ Ground-Beta', cipherSuite: 'AES-256-GCM + CRYSTALS-Kyber-1024', keyRotation: 'Every 90 seconds', pqcReady: true, lastKeyExchange: '2026-02-14 09:13:58', status: 'Active', keyLength: '256-bit + 1024-bit PQC', protocol: 'Anchor Space Protocol v3', quantumResistance: 'Full (PQC lattice-based)' },
    { link: 'GOV-MILSAT-7 ↔ Ground-Gamma', cipherSuite: 'NSA Suite B (Type 1) + CNSA 2.0', keyRotation: 'Per session (4-hour max)', pqcReady: true, lastKeyExchange: '2026-02-14 08:00:00', status: 'Active', keyLength: 'Classified (Type 1)', protocol: 'HAIPE IS + Anchor Bridge', quantumResistance: 'Full (CNSA 2.0 compliant)' },
    { link: 'PARTNER-SAT-3 ↔ Ground-Delta', cipherSuite: 'AES-256-GCM', keyRotation: 'Every 5 minutes', pqcReady: false, lastKeyExchange: '2026-02-14 09:10:44', status: 'Active', keyLength: '256-bit', protocol: 'Standard CCSDS', quantumResistance: 'None (upgrade scheduled Q2 2026)' },
    { link: 'ANCHOR-SAT-3 ↔ Ground-Alpha', cipherSuite: 'AES-256-GCM + QKD (BB84)', keyRotation: 'Every 60 seconds', pqcReady: true, lastKeyExchange: '2026-02-14 09:14:11', status: 'Active', keyLength: '256-bit + 512-bit QKD', protocol: 'Anchor Space Protocol v3', quantumResistance: 'Full (QKD + lattice fallback)' },
    { link: 'TT&C Command Channels (all)', cipherSuite: 'HMAC-SHA512 + RSA-4096 + CRYSTALS-Dilithium', keyRotation: 'Every 24 hours + per-command HMAC', pqcReady: true, lastKeyExchange: '2026-02-14 00:00:00', status: 'Active', keyLength: '4096-bit RSA + 2592-bit Dilithium', protocol: 'Anchor TT&C Auth v2', quantumResistance: 'Full (post-quantum signatures)' },
    { link: 'Inter-Satellite Links (ISL)', cipherSuite: 'AES-256-GCM + QKD (optical)', keyRotation: 'Continuous (per-photon)', pqcReady: true, lastKeyExchange: '2026-02-14 09:14:28', status: 'Active', keyLength: 'QKD optical (unlimited entropy)', protocol: 'Anchor Optical ISL v1', quantumResistance: 'Unconditional (information-theoretic)' },
  ];

  const groundStations: GroundStation[] = [
    { id: 'gs-1', name: 'Ground-Alpha (US East)', location: 'Northern Virginia, USA', coordinates: '38.9°N 77.4°W', status: 'Operational', connectedSats: 3, antennas: 6, security: 'SCIF Level III', lastAudit: '2026-02-10', physicalSecurity: ['Armed guards 24/7', 'Biometric + retinal access', 'TEMPEST shielding', 'Anti-drone perimeter', 'Faraday cage operations room'], cyberSecurity: ['Air-gapped C2 network', 'Hardware security modules', 'Continuous monitoring', 'Zero-trust architecture'], redundancy: 'Full hot-standby with Ground-Echo (US West)' },
    { id: 'gs-2', name: 'Ground-Beta (EU)', location: 'Darmstadt, Germany', coordinates: '49.8°N 8.6°E', status: 'Operational', connectedSats: 2, antennas: 4, security: 'NATO COSMIC TOP SECRET', lastAudit: '2026-02-05', physicalSecurity: ['Military perimeter', 'Multi-factor access', 'TEMPEST certified', 'Underground operations bunker'], cyberSecurity: ['Sovereign EU data processing', 'HSM key management', 'GDPR-compliant telemetry'], redundancy: 'Warm standby with Ground-Foxtrot (Nordic)' },
    { id: 'gs-3', name: 'Ground-Gamma (UK)', location: 'Bude, Cornwall, UK', coordinates: '50.8°N 4.5°W', status: 'Operational', connectedSats: 1, antennas: 3, security: 'UK TOP SECRET STRAP', lastAudit: '2026-02-08', physicalSecurity: ['MOD security perimeter', 'Vetted personnel (DV cleared)', 'CCTV + thermal imaging', 'Dog patrols'], cyberSecurity: ['GCHQ-approved systems', 'UK sovereign cloud', 'NCSC standards'], redundancy: 'Cross-link to Ground-Beta (EU)' },
    { id: 'gs-4', name: 'Ground-Delta (APAC)', location: 'Pine Gap, NT, Australia', coordinates: '23.8°S 133.7°E', status: 'Operational', connectedSats: 1, antennas: 4, security: 'AU TOP SECRET // AUSTEO', lastAudit: '2026-01-28', physicalSecurity: ['RAAF security perimeter', 'Multi-level clearance', 'Remote location (200km from nearest city)', 'Anti-surveillance measures'], cyberSecurity: ['ASD-certified systems', 'Sovereign AU processing', 'Five Eyes integration'], redundancy: 'Cross-link to Ground-Alpha (US East)' },
    { id: 'gs-5', name: 'Ground-Echo (US West)', location: 'Buckley SFB, Colorado, USA', coordinates: '39.7°N 104.7°W', status: 'Standby', connectedSats: 0, antennas: 4, security: 'SCIF Level III', lastAudit: '2026-02-01', physicalSecurity: ['Space Force security', 'Biometric access', 'TEMPEST shielded', 'Hardened facility'], cyberSecurity: ['DISA-certified network', 'Air-gapped operations', 'Automated failover from Alpha'], redundancy: 'Hot standby for Ground-Alpha' },
  ];

  const orbitalAssets: OrbitalAsset[] = [
    { id: 'oa-1', designation: 'ANCHOR-SAT-1 (NORAD 58421)', orbit: 'LEO Sun-Synchronous', altitude: '550 km', inclination: '97.6°', operator: 'Anchor Sovereign Space', mission: 'Secure Telemetry + QKD Relay', launchDate: '2025-09-14', status: 'Active', encryptionStatus: 'QKD + AES-256 (Full PQC)', lastHealthCheck: '2026-02-14 09:00', threatLevel: 'Elevated (GPS spoofing attempts)', hardwareIntegrity: '100% — all subsystems nominal' },
    { id: 'oa-2', designation: 'ANCHOR-SAT-2 (NORAD 58422)', orbit: 'MEO Circular', altitude: '8,200 km', inclination: '55°', operator: 'Anchor Sovereign Space', mission: 'High-Bandwidth Sovereign Data Transport', launchDate: '2025-11-02', status: 'Active', encryptionStatus: 'CRYSTALS-Kyber + AES-256 (Full PQC)', lastHealthCheck: '2026-02-14 08:00', threatLevel: 'Moderate (debris avoidance required)', hardwareIntegrity: '100% — post-manoeuvre verification passed' },
    { id: 'oa-3', designation: 'ANCHOR-SAT-3 (NORAD 59103)', orbit: 'Molniya (HEO)', altitude: '500–39,000 km', inclination: '63.4°', operator: 'Anchor Sovereign Space', mission: 'Arctic + Polar Region Coverage', launchDate: '2026-01-15', status: 'Active', encryptionStatus: 'QKD + AES-256 (Full PQC)', lastHealthCheck: '2026-02-14 06:00', threatLevel: 'High (co-orbital inspector approach)', hardwareIntegrity: '100% — all subsystems nominal' },
    { id: 'oa-4', designation: 'ANCHOR-RELAY-1 (NORAD 59104)', orbit: 'GEO', altitude: '35,786 km', inclination: '0°', operator: 'Anchor Sovereign Space', mission: 'Inter-Satellite Relay + Optical ISL Hub', launchDate: '2026-01-15', status: 'Active', encryptionStatus: 'QKD Optical + Suite B (Full PQC)', lastHealthCheck: '2026-02-14 09:00', threatLevel: 'Low', hardwareIntegrity: '100%' },
    { id: 'oa-5', designation: 'GOV-MILSAT-7 (NORAD 54891)', orbit: 'GEO', altitude: '35,786 km', inclination: '0°', operator: 'Five Eyes SIGINT Command', mission: 'Sovereign Intelligence Relay', launchDate: '2023-06-22', status: 'Active', encryptionStatus: 'NSA Type 1 + CNSA 2.0', lastHealthCheck: '2026-02-14 08:00', threatLevel: 'Moderate (signal interception attempts)', hardwareIntegrity: '98% — solar panel degradation 2% (nominal for age)' },
  ];

  const spacePolicies: SpacePolicy[] = [
    { id: 'sp-1', name: 'All satellite links encrypted with PQC-ready algorithms', scope: 'All Anchor satellites', status: 'Enforced', category: 'Encryption', compliance: ['NIST PQC Standards', 'NSA CNSA 2.0', 'CCSDS 352.0'], lastReview: '2026-02-14' },
    { id: 'sp-2', name: 'Autonomous collision avoidance for all LEO/MEO assets', scope: 'All orbital assets', status: 'Enforced', category: 'Orbital Safety', compliance: ['IADC Guidelines', 'UN COPUOS', 'FCC debris mitigation'], lastReview: '2026-02-12' },
    { id: 'sp-3', name: 'Command authentication via HMAC-SHA512 + PQC signatures', scope: 'All TT&C channels', status: 'Enforced', category: 'Command Security', compliance: ['CCSDS 355.0', 'Anchor TT&C Auth v2'], lastReview: '2026-02-14' },
    { id: 'sp-4', name: 'Anti-jamming FHSS on all operational uplinks', scope: 'All Anchor satellites', status: 'Enforced', category: 'RF Defence', compliance: ['MIL-STD-188-141C', 'Anchor RF Protocol'], lastReview: '2026-02-10' },
    { id: 'sp-5', name: 'Ground station physical security audit every 30 days', scope: 'All ground stations', status: 'Enforced', category: 'Physical Security', compliance: ['NIST 800-53', 'NATO COSMIC', 'Five Eyes SIGINT standards'], lastReview: '2026-02-10' },
    { id: 'sp-6', name: 'Sovereign data jurisdiction — no cross-border routing without approval', scope: 'Data transport', status: 'Enforced', category: 'Data Sovereignty', compliance: ['GDPR', 'CLOUD Act exceptions', 'AU Privacy Act'], lastReview: '2026-02-08' },
    { id: 'sp-7', name: 'ASAT threat response protocol with automated constellation rerouting', scope: 'All orbital assets', status: 'Enforced', category: 'Space Defence', compliance: ['UN Outer Space Treaty', 'Anchor Contingency Protocol'], lastReview: '2026-02-11' },
    { id: 'sp-8', name: 'QKD key distribution for all sovereign-grade links', scope: 'Anchor + Gov satellites', status: 'Enforced', category: 'Quantum Security', compliance: ['ETSI QKD 014', 'NIST PQC', 'BB84 Protocol Standards'], lastReview: '2026-02-14' },
  ];

  const analyticsData = {
    totalLinks: satLinks.length,
    operationalLinks: satLinks.filter(l => l.status === 'Operational').length,
    pqcEnabledLinks: satLinks.filter(l => l.pqcEnabled).length,
    totalBandwidth: '29.5 Gbps',
    threats30d: 34,
    threatsBlocked30d: 29,
    avgResponseMs: 523,
    groundStationsActive: groundStations.filter(g => g.status === 'Operational').length,
    orbitalAssetsActive: orbitalAssets.filter(o => o.status === 'Active').length,
    uptimePercent: '99.97%',
    dataTransferred30d: '2.4 PB',
    keyRotations30d: '1.2M',
  };

  const stats = [
    { label: 'Active Links', value: analyticsData.operationalLinks, sub: `${analyticsData.totalLinks} total`, color: 'text-amber-400' },
    { label: 'Total Bandwidth', value: analyticsData.totalBandwidth, sub: `${analyticsData.dataTransferred30d} transferred (30d)`, color: 'text-cyan-400' },
    { label: 'Threats (30d)', value: analyticsData.threats30d, sub: `${analyticsData.threatsBlocked30d} autonomously blocked`, color: 'text-red-400' },
    { label: 'PQC Links', value: analyticsData.pqcEnabledLinks, sub: 'quantum-resistant', color: 'text-purple-400' },
    { label: 'Ground Stations', value: analyticsData.groundStationsActive, sub: `${groundStations.length} total worldwide`, color: 'text-emerald-400' },
    { label: 'Uptime', value: analyticsData.uptimePercent, sub: `${analyticsData.keyRotations30d} key rotations`, color: 'text-blue-400' },
  ];

  const { loading, analyzing, analysisResult, runAnalysis, clearAnalysis } = useSecurityModule('satellite-comms', {
    satLinks, threats, encryptionStatus, groundStations, orbitalAssets, spacePolicies, analyticsData, stats,
  });

  const severityColor = (s: string) => { switch (s) { case 'Critical': return 'text-red-400'; case 'High': return 'text-orange-400'; case 'Medium': return 'text-yellow-400'; default: return 'text-green-400'; } };
  const severityBg = (s: string) => { switch (s) { case 'Critical': return 'bg-red-900/20 border-red-800/50'; case 'High': return 'bg-orange-900/20 border-orange-800/50'; default: return 'bg-slate-800/80 border-slate-700/50'; } };
  const statusColor = (s: string) => s === 'Operational' ? 'text-green-400' : s === 'Degraded' ? 'text-yellow-400' : s === 'Alert' ? 'text-red-400' : 'text-blue-400';

  if (loading) return (<div className="min-h-screen bg-slate-900 flex items-center justify-center"><div className="text-center"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-amber-400 mx-auto" /><p className="text-amber-400 mt-4 text-sm font-medium">Establishing Sovereign Satellite Network Connection...</p></div></div>);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 space-y-6">
      {/* ── Sovereign Header ─────────────────────────────────────────── */}
      <header className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-900/20 via-orange-900/10 to-amber-900/20 rounded-2xl" />
        <div className="relative bg-slate-800/80 border border-amber-700/50 rounded-2xl p-6 backdrop-blur">
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-amber-900/50">🛰️</div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-amber-300">Satellite Communications Security</h1>
                    <span className="bg-gradient-to-r from-amber-600 to-orange-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">WORLD FIRST</span>
                    <span className={`w-2 h-2 rounded-full ${neuralPulse ? 'bg-amber-400' : 'bg-amber-600'} transition-colors duration-1000`} />
                  </div>
                  <p className="text-slate-400 text-sm">TITAN Cortex space defence layer — sovereign-grade satellite encryption, anti-jamming, orbital threat response, and ground station security</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs flex-wrap">
                <span className="text-amber-400 bg-amber-900/40 px-3 py-1 rounded-full">Sovereign Space Defence</span>
                <span className="text-purple-400 bg-purple-900/40 px-3 py-1 rounded-full">Quantum Key Distribution</span>
                <span className="text-cyan-400 bg-cyan-900/40 px-3 py-1 rounded-full">{orbitalAssets.length} Orbital Assets</span>
                <span className="text-emerald-400 bg-emerald-900/40 px-3 py-1 rounded-full animate-pulse">● TRACKING {4218 + trackingCount} objects</span>
              </div>
            </div>
            <button onClick={() => runAnalysis()} disabled={analyzing} className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-lg shadow-amber-900/30">{analyzing ? '⏳ Scanning…' : '🧠 TITAN Space Analysis'}</button>
          </div>
        </div>
      </header>

      {/* ── Stats ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {stats.map(s => (
          <div key={s.label} className="bg-slate-800/80 border border-slate-700/50 rounded-xl p-4 hover:border-amber-700/50 transition-colors">
            <div className="text-slate-400 text-xs">{s.label}</div>
            <div className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</div>
            <div className="text-slate-500 text-xs mt-1">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────────── */}
      <div className="flex gap-1 border-b border-slate-700 pb-1 overflow-x-auto">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === t.key ? 'bg-slate-800 text-amber-400 border border-b-0 border-amber-700/50' : 'text-slate-400 hover:text-white'}`}>
            <span className="mr-1">{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      {/* ── Satellite Links Tab ──────────────────────────────────────── */}
      {activeTab === 'links' && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Sovereign Satellite Link Status</h2>
          {satLinks.map(l => (
            <div key={l.id} className="bg-slate-800/80 border border-slate-700/50 rounded-xl p-5 space-y-3 hover:border-amber-700/30 transition-colors">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{l.satellite}</span>
                    <span className="text-xs text-slate-500 bg-slate-700/50 px-2 py-0.5 rounded">{l.orbit}</span>
                    <span className={`text-xs font-medium ${statusColor(l.status)}`}>{l.status}</span>
                    {l.pqcEnabled && <span className="text-xs text-purple-400 bg-purple-900/40 px-2 py-0.5 rounded">PQC</span>}
                    {l.antiJamming && <span className="text-xs text-cyan-400 bg-cyan-900/40 px-2 py-0.5 rounded">Anti-Jam</span>}
                  </div>
                  <div className="text-xs text-slate-400">{l.constellation} · {l.missionType}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-amber-400">{l.signalStrength}</div>
                  <div className="text-xs text-slate-500">signal</div>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                <div className="bg-slate-900/50 rounded-lg p-2"><span className="text-slate-500 block">Uplink</span><span className="text-white">{l.uplink}</span></div>
                <div className="bg-slate-900/50 rounded-lg p-2"><span className="text-slate-500 block">Downlink</span><span className="text-white">{l.downlink}</span></div>
                <div className="bg-slate-900/50 rounded-lg p-2"><span className="text-slate-500 block">Bandwidth</span><span className="text-emerald-400">{l.bandwidth}</span></div>
                <div className="bg-slate-900/50 rounded-lg p-2"><span className="text-slate-500 block">Latency</span><span className="text-blue-400">{l.latency}</span></div>
                <div className="bg-slate-900/50 rounded-lg p-2"><span className="text-slate-500 block">Ground Stn</span><span className="text-slate-300">{l.groundStation}</span></div>
              </div>
              <div className="text-xs text-slate-500">Encryption: <span className="text-cyan-400">{l.encryption}</span> · Last contact: {l.lastContact}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Threats Tab ──────────────────────────────────────────────── */}
      {activeTab === 'threats' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Space Threat Intelligence</h2>
            <span className="text-xs text-red-400 animate-pulse">● {threats.filter(t => t.status.includes('Active') || t.status.includes('Monitoring')).length} active threats</span>
          </div>
          {threats.map(t => (
            <div key={t.id} className={`border rounded-xl p-5 space-y-3 ${severityBg(t.severity)}`}>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{t.type}</span>
                    <span className={`text-xs font-medium ${severityColor(t.severity)}`}>{t.severity}</span>
                    <span className="text-xs text-slate-500">→ {t.target}</span>
                  </div>
                  {t.mitreTtp !== 'N/A' && <span className="text-xs text-cyan-400 font-mono">{t.mitreTtp}</span>}
                </div>
                <div className="text-right space-y-1">
                  <span className={`text-xs px-2 py-1 rounded ${t.status.includes('Blocked') || t.status.includes('Mitigated') ? 'text-green-400 bg-green-900/40' : t.status.includes('Active') || t.status.includes('Monitoring') ? 'text-red-400 bg-red-900/40' : 'text-blue-400 bg-blue-900/40'}`}>{t.status}</span>
                  {t.responseTimeMs > 0 && <div className="text-xs text-slate-500">{t.responseTimeMs}ms response</div>}
                </div>
              </div>
              <div className="text-sm text-slate-400 leading-relaxed">{t.detail}</div>
              <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-700/50">
                <span>{t.timestamp}</span>
                <span>Origin: <span className="text-orange-400">{t.attackOrigin}</span></span>
              </div>
              <div className="text-xs text-emerald-400">TITAN Autonomous Action: {t.autonomousAction}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Encryption Tab ───────────────────────────────────────────── */}
      {activeTab === 'encryption' && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Link Encryption & Quantum Key Distribution</h2>
          {encryptionStatus.map(e => (
            <div key={e.link} className="bg-slate-800/80 border border-slate-700/50 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="font-semibold text-white">{e.link}</div>
                  <div className="text-xs text-slate-400">{e.cipherSuite}</div>
                </div>
                <div className="flex items-center gap-2">
                  {e.pqcReady && <span className="text-xs text-purple-400 bg-purple-900/40 px-2 py-0.5 rounded font-medium">Quantum-Resistant</span>}
                  <span className="text-xs text-green-400">{e.status}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <div className="bg-slate-900/50 rounded-lg p-2"><span className="text-slate-500 block">Key Length</span><span className="text-white">{e.keyLength}</span></div>
                <div className="bg-slate-900/50 rounded-lg p-2"><span className="text-slate-500 block">Rotation</span><span className="text-emerald-400">{e.keyRotation}</span></div>
                <div className="bg-slate-900/50 rounded-lg p-2"><span className="text-slate-500 block">Protocol</span><span className="text-cyan-400">{e.protocol}</span></div>
                <div className="bg-slate-900/50 rounded-lg p-2"><span className="text-slate-500 block">Quantum Resistance</span><span className={e.quantumResistance.includes('Full') || e.quantumResistance.includes('Unconditional') ? 'text-purple-400' : 'text-yellow-400'}>{e.quantumResistance}</span></div>
              </div>
              <div className="text-xs text-slate-500">Last key exchange: {e.lastKeyExchange}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Ground Stations Tab ──────────────────────────────────────── */}
      {activeTab === 'ground-stations' && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Sovereign Ground Station Network</h2>
          {groundStations.map(g => (
            <div key={g.id} className="bg-slate-800/80 border border-slate-700/50 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{g.name}</span>
                    <span className={`text-xs font-medium ${statusColor(g.status)}`}>{g.status}</span>
                  </div>
                  <div className="text-xs text-slate-400">{g.location} · {g.coordinates} · {g.antennas} antennas · {g.connectedSats} satellites</div>
                </div>
                <span className="text-xs text-amber-400 bg-amber-900/40 px-3 py-1 rounded font-medium">{g.security}</span>
              </div>
              <div className="grid md:grid-cols-3 gap-3 text-xs">
                <div className="bg-slate-900/50 rounded-lg p-3"><div className="text-slate-500 font-medium mb-1">Physical Security</div>{g.physicalSecurity.map(p => <div key={p} className="text-amber-300">• {p}</div>)}</div>
                <div className="bg-slate-900/50 rounded-lg p-3"><div className="text-slate-500 font-medium mb-1">Cyber Security</div>{g.cyberSecurity.map(c => <div key={c} className="text-cyan-300">• {c}</div>)}</div>
                <div className="bg-slate-900/50 rounded-lg p-3"><div className="text-slate-500 font-medium mb-1">Redundancy</div><div className="text-emerald-300">{g.redundancy}</div><div className="text-slate-500 mt-2">Last audit: {g.lastAudit}</div></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Orbital Assets Tab ───────────────────────────────────────── */}
      {activeTab === 'orbital' && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Orbital Asset Inventory</h2>
          {orbitalAssets.map(oa => (
            <div key={oa.id} className="bg-slate-800/80 border border-slate-700/50 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{oa.designation}</span>
                    <span className={`text-xs ${oa.status === 'Active' ? 'text-green-400' : 'text-yellow-400'}`}>{oa.status}</span>
                  </div>
                  <div className="text-xs text-slate-400">{oa.operator} · {oa.mission}</div>
                </div>
                <span className={`text-xs font-medium ${oa.threatLevel.includes('High') || oa.threatLevel.includes('Elevated') ? 'text-orange-400' : oa.threatLevel.includes('Moderate') ? 'text-yellow-400' : 'text-green-400'}`}>{oa.threatLevel}</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                <div className="bg-slate-900/50 rounded-lg p-2"><span className="text-slate-500 block">Orbit</span><span className="text-white">{oa.orbit}</span></div>
                <div className="bg-slate-900/50 rounded-lg p-2"><span className="text-slate-500 block">Altitude</span><span className="text-white">{oa.altitude}</span></div>
                <div className="bg-slate-900/50 rounded-lg p-2"><span className="text-slate-500 block">Inclination</span><span className="text-white">{oa.inclination}</span></div>
                <div className="bg-slate-900/50 rounded-lg p-2"><span className="text-slate-500 block">Encryption</span><span className="text-purple-400">{oa.encryptionStatus}</span></div>
                <div className="bg-slate-900/50 rounded-lg p-2"><span className="text-slate-500 block">Hardware</span><span className="text-emerald-400">{oa.hardwareIntegrity}</span></div>
              </div>
              <div className="text-xs text-slate-500">Launched: {oa.launchDate} · Last health check: {oa.lastHealthCheck}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Policies Tab ─────────────────────────────────────────────── */}
      {activeTab === 'policies' && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Space Security Policies</h2>
          {spacePolicies.map(p => (
            <div key={p.id} className="bg-slate-800/80 border border-slate-700/50 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <span className="font-semibold text-white text-sm">{p.name}</span>
                  <div className="text-xs text-slate-400">Scope: {p.scope} · Category: {p.category}</div>
                </div>
                <span className="text-xs text-green-400 bg-green-900/40 px-2 py-1 rounded">{p.status}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {p.compliance.map(c => <span key={c} className="text-xs text-cyan-300 bg-cyan-900/30 px-2 py-0.5 rounded">{c}</span>)}
              </div>
              <div className="text-xs text-slate-500">Last review: {p.lastReview}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Analytics Tab ────────────────────────────────────────────── */}
      {activeTab === 'analytics' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Space Domain Awareness Analytics</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-slate-800/80 border border-slate-700/50 rounded-xl p-5 space-y-3">
              <h3 className="font-semibold text-sm">Threat Distribution (30 days)</h3>
              {[{ type: 'Jamming', count: 12, pct: 35 }, { type: 'GPS Spoofing', count: 8, pct: 24 }, { type: 'Signal Interception', count: 5, pct: 15 }, { type: 'Command Injection', count: 4, pct: 12 }, { type: 'Orbital Threats', count: 3, pct: 9 }, { type: 'ASAT Warnings', count: 2, pct: 5 }].map(t => (
                <div key={t.type} className="space-y-1">
                  <div className="flex justify-between text-xs"><span className="text-slate-300">{t.type}</span><span className="text-slate-400">{t.count} ({t.pct}%)</span></div>
                  <div className="w-full bg-slate-700/50 rounded-full h-2"><div className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full" style={{ width: `${t.pct}%` }} /></div>
                </div>
              ))}
            </div>
            <div className="bg-slate-800/80 border border-amber-700/30 rounded-xl p-5 space-y-3">
              <h3 className="font-semibold text-sm text-amber-400">TITAN Cortex — Space Defence Status</h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-900/50 rounded-lg p-3"><span className="text-slate-500 block">Orbital Objects Tracked</span><span className="text-amber-400 text-lg font-bold">{(4218 + trackingCount).toLocaleString()}</span></div>
                <div className="bg-slate-900/50 rounded-lg p-3"><span className="text-slate-500 block">Network Uptime</span><span className="text-green-400 text-lg font-bold">{analyticsData.uptimePercent}</span></div>
                <div className="bg-slate-900/50 rounded-lg p-3"><span className="text-slate-500 block">Key Rotations (30d)</span><span className="text-purple-400 text-lg font-bold">{analyticsData.keyRotations30d}</span></div>
                <div className="bg-slate-900/50 rounded-lg p-3"><span className="text-slate-500 block">Data Transported</span><span className="text-cyan-400 text-lg font-bold">{analyticsData.dataTransferred30d}</span></div>
              </div>
              <div className="text-xs text-slate-500 italic">The only cybersecurity platform providing sovereign-grade satellite communications security. TITAN autonomously defends orbital and ground assets against state-sponsored threats, maintaining data sovereignty across jurisdictions.</div>
            </div>
          </div>
        </div>
      )}

      {/* ── AI Analysis ──────────────────────────────────────────────── */}
      {analysisResult && (
        <div className="bg-slate-800/80 border border-amber-700/50 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2"><span className="text-xl">🧠</span><h2 className="text-lg font-semibold text-amber-400">TITAN Cortex — Space Defence Analysis</h2></div>
            <button onClick={() => clearAnalysis()} className="text-slate-400 hover:text-white text-sm">✕</button>
          </div>
          <pre className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{analysisResult}</pre>
        </div>
      )}
    </div>
  );
};

export default SatelliteCommsSecurity;
