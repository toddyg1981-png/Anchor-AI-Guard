import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { authMiddleware } from '../lib/auth';
import { env } from '../config/env';
import crypto from 'crypto';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

async function callClaude(prompt: string, maxTokens = 2048): Promise<string | null> {
  if (!env.anthropicApiKey) return null;
  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': env.anthropicApiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-3-haiku-20240307', max_tokens: maxTokens, messages: [{ role: 'user', content: prompt }] }),
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.content?.[0]?.text || null;
  } catch { return null; }
}

// PQC Algorithm implementations (lattice-based key encapsulation simulation)
const PQC_ALGORITHMS = {
  'ml-kem-768': { name: 'ML-KEM-768 (Kyber)', type: 'kem', nistLevel: 3, keySize: 1184, cipherSize: 1088, status: 'standardized' },
  'ml-kem-1024': { name: 'ML-KEM-1024 (Kyber)', type: 'kem', nistLevel: 5, keySize: 1568, cipherSize: 1568, status: 'standardized' },
  'ml-dsa-65': { name: 'ML-DSA-65 (Dilithium)', type: 'signature', nistLevel: 3, keySize: 1952, sigSize: 3293, status: 'standardized' },
  'ml-dsa-87': { name: 'ML-DSA-87 (Dilithium)', type: 'signature', nistLevel: 5, keySize: 2592, sigSize: 4595, status: 'standardized' },
  'slh-dsa-128': { name: 'SLH-DSA-128 (SPHINCS+)', type: 'signature', nistLevel: 1, keySize: 32, sigSize: 7856, status: 'standardized' },
  'falcon-512': { name: 'Falcon-512', type: 'signature', nistLevel: 1, keySize: 897, sigSize: 666, status: 'round4' },
  'bike-l3': { name: 'BIKE Level 3', type: 'kem', nistLevel: 3, keySize: 3110, cipherSize: 3110, status: 'round4' },
  'hqc-256': { name: 'HQC-256', type: 'kem', nistLevel: 5, keySize: 7245, cipherSize: 14469, status: 'round4' },
};

interface CryptoAsset {
  id: string;
  name: string;
  type: 'certificate' | 'key' | 'protocol' | 'library';
  algorithm: string;
  keyLength: number;
  quantumSafe: boolean;
  expiresAt?: string;
  location: string;
  riskLevel: 'safe' | 'migrate' | 'urgent';
  orgId: string;
}

const cryptoAssetStore: Map<string, CryptoAsset> = new Map();
const migrationPlans: Map<string, unknown> = new Map();

export async function quantumCryptoRoutes(app: FastifyInstance): Promise<void> {

  // Dashboard
  app.get('/quantum-crypto/dashboard', { preHandler: [authMiddleware()] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { orgId: string };
    const assets = Array.from(cryptoAssetStore.values()).filter(a => a.orgId === user.orgId);

    const quantumSafe = assets.filter(a => a.quantumSafe).length;
    const vulnerable = assets.filter(a => !a.quantumSafe).length;
    const urgent = assets.filter(a => a.riskLevel === 'urgent').length;

    // Check system TLS/crypto capabilities
    const systemCiphers = crypto.getCiphers().slice(0, 20);
    const systemHashes = crypto.getHashes().slice(0, 15);

    return reply.send({
      stats: { totalAssets: assets.length, quantumSafe, vulnerable, urgentMigrations: urgent,
        pqcAlgorithmsAvailable: Object.keys(PQC_ALGORITHMS).length,
        nistStandardized: Object.values(PQC_ALGORITHMS).filter(a => a.status === 'standardized').length },
      algorithms: PQC_ALGORITHMS,
      systemCapabilities: { ciphers: systemCiphers, hashes: systemHashes,
        supportsTLS13: systemCiphers.includes('aes-256-gcm'),
        supportsChaCha: systemCiphers.includes('chacha20-poly1305') },
      assets: assets.map(a => ({ id: a.id, name: a.name, type: a.type, algorithm: a.algorithm,
        keyLength: a.keyLength, quantumSafe: a.quantumSafe, riskLevel: a.riskLevel })),
      migrationProgress: { total: assets.length, migrated: quantumSafe,
        percentage: assets.length > 0 ? Math.round((quantumSafe / assets.length) * 100) : 0 },
    });
  });

  // Inventory crypto assets
  app.post('/quantum-crypto/scan', { preHandler: [authMiddleware()] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { orgId: string };
    const body = request.body as { targets?: string[] };

    // Simulate scanning for crypto usage - in production this would scan actual infrastructure
    const discovered: CryptoAsset[] = [
      { id: `ca-${Date.now()}-1`, name: 'Web Server TLS', type: 'certificate', algorithm: 'RSA-2048',
        keyLength: 2048, quantumSafe: false, expiresAt: '2027-03-15', location: 'nginx/production',
        riskLevel: 'migrate', orgId: user.orgId },
      { id: `ca-${Date.now()}-2`, name: 'API Gateway mTLS', type: 'certificate', algorithm: 'ECDSA-P256',
        keyLength: 256, quantumSafe: false, location: 'api-gateway/certs', riskLevel: 'migrate', orgId: user.orgId },
      { id: `ca-${Date.now()}-3`, name: 'Database Encryption', type: 'key', algorithm: 'AES-256-GCM',
        keyLength: 256, quantumSafe: true, location: 'kms/database', riskLevel: 'safe', orgId: user.orgId },
      { id: `ca-${Date.now()}-4`, name: 'JWT Signing Key', type: 'key', algorithm: 'RS256',
        keyLength: 2048, quantumSafe: false, location: 'vault/jwt', riskLevel: 'urgent', orgId: user.orgId },
      { id: `ca-${Date.now()}-5`, name: 'Code Signing', type: 'key', algorithm: 'RSA-4096',
        keyLength: 4096, quantumSafe: false, location: 'ci-cd/signing', riskLevel: 'migrate', orgId: user.orgId },
    ];

    if (body.targets) {
      discovered.forEach(d => { d.location = body.targets![0] + '/' + d.location; });
    }

    for (const asset of discovered) {
      cryptoAssetStore.set(asset.id, asset);
    }

    return reply.send({ discovered: discovered.length, assets: discovered });
  });

  // Generate PQC key pair (simulated - demonstrates algorithm properties)
  app.post('/quantum-crypto/generate-keypair', { preHandler: [authMiddleware()] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as { algorithm: string };
    const algo = PQC_ALGORITHMS[body.algorithm as keyof typeof PQC_ALGORITHMS];
    if (!algo) return reply.status(400).send({ error: 'Unknown algorithm', available: Object.keys(PQC_ALGORITHMS) });

    // Generate real random bytes to simulate PQC key material
    const publicKey = crypto.randomBytes(algo.keySize).toString('base64');
    const privateKeyHash = crypto.createHash('sha256').update(crypto.randomBytes(64)).digest('hex');

    return reply.send({
      algorithm: algo.name, nistLevel: algo.nistLevel, type: algo.type, status: algo.status,
      publicKey: publicKey.substring(0, 64) + '...[' + algo.keySize + ' bytes]',
      privateKeyFingerprint: privateKeyHash,
      keySize: algo.keySize,
      ...(algo.type === 'kem' ? { ciphertextSize: (algo as any).cipherSize } : { signatureSize: (algo as any).sigSize }),
      generatedAt: new Date().toISOString(),
      warning: 'This is a demonstration. Production PQC implementations require validated cryptographic libraries (e.g., liboqs, PQClean).',
    });
  });

  // AI-powered migration plan
  app.post('/quantum-crypto/migration-plan', { preHandler: [authMiddleware()] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { orgId: string };
    const assets = Array.from(cryptoAssetStore.values()).filter(a => a.orgId === user.orgId);
    const vulnerable = assets.filter(a => !a.quantumSafe);

    const assetList = vulnerable.map(a => `${a.name}: ${a.algorithm} (${a.keyLength}-bit) at ${a.location} [${a.riskLevel}]`).join('\n');

    const result = await callClaude(`You are a post-quantum cryptography migration expert. Create a migration plan for these vulnerable crypto assets:

${assetList || 'No assets scanned yet - provide a general PQC migration plan.'}

Available PQC algorithms: ML-KEM-768/1024, ML-DSA-65/87, SLH-DSA-128, Falcon-512

Return JSON:
{
  "phases": [{"name":"string","duration":"string","tasks":["string"],"priority":"critical|high|medium"}],
  "recommendations": [{"asset":"string","currentAlgo":"string","targetAlgo":"string","effort":"string","risk":"string"}],
  "timeline": "string",
  "estimatedCost": "string",
  "harvestNowDecryptLaterRisk": "string"
}

Only return valid JSON.`, 3000);

    if (result) {
      try {
        const plan = JSON.parse(result);
        migrationPlans.set(user.orgId, plan);
        return reply.send({ source: 'ai-analysis', ...plan, model: 'claude-3-haiku' });
      } catch { /* fall through */ }
    }

    const fallbackPlan = {
      source: 'heuristic',
      phases: [
        { name: 'Inventory & Assessment', duration: '2-4 weeks', tasks: ['Catalog all crypto assets', 'Identify quantum-vulnerable algorithms', 'Prioritize by risk'], priority: 'critical' },
        { name: 'Hybrid Deployment', duration: '2-3 months', tasks: ['Deploy hybrid TLS (classical + PQC)', 'Update key management systems', 'Test ML-KEM-768 integration'], priority: 'high' },
        { name: 'Full Migration', duration: '6-12 months', tasks: ['Replace RSA/ECDSA signing with ML-DSA', 'Migrate VPN to PQC', 'Update all certificates'], priority: 'medium' },
      ],
      recommendations: vulnerable.map(a => ({
        asset: a.name, currentAlgo: a.algorithm,
        targetAlgo: a.algorithm.startsWith('RSA') || a.algorithm.startsWith('ECDSA') ? 'ML-KEM-768 + ML-DSA-65' : 'Already quantum-safe',
        effort: a.riskLevel === 'urgent' ? '1-2 weeks' : '1-2 months', risk: a.riskLevel,
      })),
      timeline: '6-12 months for full migration',
      harvestNowDecryptLaterRisk: 'HIGH - Nation-state actors are storing encrypted traffic now for future quantum decryption',
    };
    migrationPlans.set(user.orgId, fallbackPlan);
    return reply.send(fallbackPlan);
  });

  // Test quantum resistance of a specific algorithm
  app.post('/quantum-crypto/test-resistance', { preHandler: [authMiddleware()] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as { algorithm: string; keyLength?: number };

    const classicalAlgos: Record<string, { quantumBits: number; groundTruth: string }> = {
      'RSA-2048': { quantumBits: 4098, groundTruth: 'BROKEN by Shor\'s algorithm with ~4098 logical qubits' },
      'RSA-4096': { quantumBits: 8194, groundTruth: 'BROKEN by Shor\'s algorithm with ~8194 logical qubits' },
      'ECDSA-P256': { quantumBits: 2330, groundTruth: 'BROKEN by Shor\'s algorithm with ~2330 logical qubits' },
      'ECDSA-P384': { quantumBits: 3484, groundTruth: 'BROKEN by Shor\'s algorithm with ~3484 logical qubits' },
      'AES-128': { quantumBits: 2953, groundTruth: 'WEAKENED by Grover\'s - effective 64-bit security' },
      'AES-256': { quantumBits: 6681, groundTruth: 'RESISTANT - Grover\'s reduces to 128-bit, still secure' },
      'SHA-256': { quantumBits: 0, groundTruth: 'RESISTANT - Grover\'s reduces preimage to 128-bit' },
    };

    const known = classicalAlgos[body.algorithm];
    const pqcAlgo = PQC_ALGORITHMS[body.algorithm as keyof typeof PQC_ALGORITHMS];

    if (pqcAlgo) {
      return reply.send({
        algorithm: pqcAlgo.name, quantumResistant: true, nistLevel: pqcAlgo.nistLevel,
        assessment: `QUANTUM-SAFE: NIST Level ${pqcAlgo.nistLevel} post-quantum security`,
        status: pqcAlgo.status, recommendation: 'Safe for long-term use',
      });
    }

    if (known) {
      return reply.send({
        algorithm: body.algorithm, quantumResistant: false,
        qubitsRequired: known.quantumBits, assessment: known.groundTruth,
        recommendation: 'Migrate to PQC algorithm (ML-KEM/ML-DSA)',
        timeframe: 'Cryptographically relevant quantum computers estimated by 2030-2035',
      });
    }

    return reply.send({ algorithm: body.algorithm, assessment: 'Unknown algorithm', recommendation: 'Contact support for assessment' });
  });

  // Crypto agility assessment
  app.get('/quantum-crypto/agility-score', { preHandler: [authMiddleware()] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { orgId: string };
    const assets = Array.from(cryptoAssetStore.values()).filter(a => a.orgId === user.orgId);
    
    let score = 50; // Base score
    const factors: Array<{ factor: string; impact: number; detail: string }> = [];

    if (assets.length === 0) {
      factors.push({ factor: 'No inventory', impact: -20, detail: 'Run a crypto scan first' });
      score -= 20;
    } else {
      const pqcRatio = assets.filter(a => a.quantumSafe).length / assets.length;
      const pqcImpact = Math.round(pqcRatio * 30);
      factors.push({ factor: 'PQC adoption', impact: pqcImpact, detail: `${Math.round(pqcRatio * 100)}% of assets are quantum-safe` });
      score += pqcImpact;

      const urgentCount = assets.filter(a => a.riskLevel === 'urgent').length;
      if (urgentCount > 0) {
        factors.push({ factor: 'Urgent migrations', impact: -15, detail: `${urgentCount} assets need immediate attention` });
        score -= 15;
      }

      if (migrationPlans.has(user.orgId)) {
        factors.push({ factor: 'Migration plan', impact: 10, detail: 'Active migration plan exists' });
        score += 10;
      }
    }

    return reply.send({
      score: Math.max(0, Math.min(100, score)),
      grade: score >= 80 ? 'A' : score >= 60 ? 'B' : score >= 40 ? 'C' : score >= 20 ? 'D' : 'F',
      factors,
      benchmarks: { industry: 35, government: 45, finance: 42 },
    });
  });
}
