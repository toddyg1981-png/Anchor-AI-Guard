
import { Project, ActiveScan, Finding, Severity } from './types';

export const mockProjects: Project[] = [
  {
    id: 'p1',
    name: 'QuantumLeap API',
    owner: 'Alice Johnson',
    totalScans: 25,
    activeScans: 2,
    findingsCount: 12,
    scope: {
      domains: ['api.quantumleap.com'],
      apis: ['GraphQL v2.1'],
      mobileBuilds: [],
    },
    runHistory: [
        { id: 'r1', date: '2023-10-26 14:30', result: '12 Findings', findings: 12, status: 'Completed' },
        { id: 'r2', date: '2023-10-25 10:00', result: '15 Findings', findings: 15, status: 'Completed' },
    ]
  },
  {
    id: 'p2',
    name: 'Project Nebula',
    owner: 'Bob Williams',
    totalScans: 18,
    activeScans: 1,
    findingsCount: 5,
    scope: {
        domains: ['app.nebula.io', 'staging.nebula.io'],
        apis: [],
        mobileBuilds: ['Android v1.2', 'iOS v1.3'],
    },
    runHistory: [
        { id: 'r3', date: '2023-10-27 09:00', result: 'In Progress...', findings: 0, status: 'In Progress' },
        { id: 'r4', date: '2023-10-24 16:45', result: '5 Findings', findings: 5, status: 'Completed' },
    ]
  },
  {
    id: 'p3',
    name: 'Helios Web App',
    owner: 'Charlie Brown',
    totalScans: 42,
    activeScans: 0,
    findingsCount: 3,
    scope: {
        domains: ['helios.dev'],
        apis: ['REST v1'],
        mobileBuilds: [],
    },
    runHistory: [
         { id: 'r5', date: '2023-10-20 11:00', result: '3 Findings', findings: 3, status: 'Completed' },
    ]
  },
];

export const mockActiveScans: ActiveScan[] = [
  { id: 's1', projectName: 'QuantumLeap API', progress: 75 },
  { id: 's2', projectName: 'Project Nebula', progress: 40 },
  { id: 's3', projectName: 'QuantumLeap API', progress: 20 },
];

export const mockFindings: Finding[] = [
  {
    id: 'f1',
    severity: Severity.Critical,
    type: 'SQL Injection',
    description: 'User input in login form is not properly sanitized, allowing for potential SQL injection attacks.',
    guidance: 'Implement parameterized queries or prepared statements to prevent malicious SQL from being executed.',
    reproduction: '1. Navigate to login page. 2. Enter `\' OR 1=1 --` in username field. 3. Observe successful login without password.',
    project: 'QuantumLeap API'
  },
  {
    id: 'f2',
    severity: Severity.High,
    type: 'Cross-Site Scripting (XSS)',
    description: 'Search functionality reflects user input without encoding, leading to stored XSS vulnerabilities.',
    guidance: 'Ensure all user-supplied input is properly encoded before being rendered in the browser.',
    reproduction: '1. Use search bar. 2. Enter `<script>alert(\"XSS\")</script>`. 3. See alert pop up on search results page.',
    project: 'Helios Web App'
  },
  {
    id: 'f3',
    severity: Severity.Medium,
    type: 'Insecure Direct Object Reference',
    description: 'User ID in URL can be manipulated to access other users\' profiles without authorization.',
    guidance: 'Implement access control checks to verify that the logged-in user is authorized to view the requested resource.',
    reproduction: '1. Log in as user A. 2. Navigate to profile page (e.g., /profile/123). 3. Change URL to /profile/124. 4. Observe user B\'s profile data.',
    project: 'Project Nebula'
  },
  {
    id: 'f4',
    severity: Severity.Low,
    type: 'Missing Security Headers',
    description: 'The application is missing key security headers like Content-Security-Policy.',
    guidance: 'Configure the web server to include appropriate security headers in all responses.',
    reproduction: '1. Inspect network responses from the server. 2. Note the absence of `Content-Security-Policy` header.',
    project: 'Helios Web App'
  },
  {
    id: 'f5',
    severity: Severity.Informational,
    type: 'Software Version Disclosure',
    description: 'Server response headers reveal the specific version of the web server software being used.',
    guidance: 'Configure the server to suppress version information in response headers to reduce the information available to attackers.',
    reproduction: '1. Check the `Server` header in any HTTP response. 2. Note the version number is visible.',
    project: 'QuantumLeap API'
  },
];
