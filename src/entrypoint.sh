#!/bin/bash
set -euo pipefail

# ═══════════════════════════════════════════════════════════
# Anchor Security Scanner — GitHub Action Entrypoint
# Enterprise-grade: SAST • Secrets • Dependencies • AI
# ═══════════════════════════════════════════════════════════

SCAN_TYPE="${1:-all}"
SEVERITY_THRESHOLD="${2:-medium}"
FAIL_ON_FINDINGS="${3:-true}"
SCAN_PATH="${4:-.}"
CONFIG_FILE="${5:-}"
API_KEY="${6:-}"
EXCLUDE_PATTERNS="${7:-node_modules/**,dist/**,build/**,.git/**,coverage/**,*.min.js,*.min.css}"
ENABLE_SARIF="${8:-true}"
ENABLE_ANNOTATIONS="${9:-true}"
MAX_FINDINGS="${10:-100}"

# Resolve workspace
WORKSPACE="${GITHUB_WORKSPACE:-$(pwd)}"
SCAN_DIR="${WORKSPACE}/${SCAN_PATH}"
REPORT_DIR="${WORKSPACE}/.anchor-reports"
mkdir -p "${REPORT_DIR}"

# Counters
CRITICAL_COUNT=0
HIGH_COUNT=0
MEDIUM_COUNT=0
LOW_COUNT=0
INFO_COUNT=0
TOTAL_FINDINGS=0
START_TIME=$(date +%s)

# Colors for terminal output
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# JSON findings accumulator
FINDINGS_JSON="[]"

echo -e "${BLUE}${BOLD}"
echo "╔══════════════════════════════════════════════════════════╗"
echo "║              🛡️  ANCHOR SECURITY SCANNER                ║"
echo "║          95+ Modules • 25 World-First Features          ║"
echo "║     Enterprise-Grade CI/CD Security Intelligence        ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo -e "${CYAN}Scan Type:${NC}     ${SCAN_TYPE}"
echo -e "${CYAN}Threshold:${NC}     ${SEVERITY_THRESHOLD}"
echo -e "${CYAN}Scan Path:${NC}     ${SCAN_PATH}"
echo -e "${CYAN}Fail on Hit:${NC}   ${FAIL_ON_FINDINGS}"
echo ""

# ─── Severity mapping ────────────────────────────────────
severity_to_num() {
  case "$1" in
    critical) echo 5 ;;
    high)     echo 4 ;;
    medium)   echo 3 ;;
    low)      echo 2 ;;
    info)     echo 1 ;;
    *)        echo 0 ;;
  esac
}

THRESHOLD_NUM=$(severity_to_num "${SEVERITY_THRESHOLD}")

# ─── Add finding helper ──────────────────────────────────
add_finding() {
  local severity="$1"
  local category="$2"
  local file="$3"
  local line="$4"
  local title="$5"
  local description="$6"
  local rule_id="$7"

  case "$severity" in
    critical) CRITICAL_COUNT=$((CRITICAL_COUNT + 1)) ;;
    high)     HIGH_COUNT=$((HIGH_COUNT + 1)) ;;
    medium)   MEDIUM_COUNT=$((MEDIUM_COUNT + 1)) ;;
    low)      LOW_COUNT=$((LOW_COUNT + 1)) ;;
    info)     INFO_COUNT=$((INFO_COUNT + 1)) ;;
  esac
  TOTAL_FINDINGS=$((TOTAL_FINDINGS + 1))

  # Limit findings
  if [ "${MAX_FINDINGS}" -gt 0 ] && [ "${TOTAL_FINDINGS}" -gt "${MAX_FINDINGS}" ]; then
    return
  fi

  # GitHub annotations
  if [ "${ENABLE_ANNOTATIONS}" = "true" ]; then
    local level="warning"
    case "$severity" in
      critical|high) level="error" ;;
      medium)        level="warning" ;;
      low|info)      level="notice" ;;
    esac
    echo "::${level} file=${file},line=${line},title=[Anchor ${severity^^}] ${title}::${description}"
  fi

  # Accumulate JSON
  local finding
  finding=$(cat <<EOF
{
  "severity": "${severity}",
  "category": "${category}",
  "file": "${file}",
  "line": ${line},
  "title": "${title}",
  "description": "${description}",
  "ruleId": "${rule_id}"
}
EOF
)
  FINDINGS_JSON=$(echo "${FINDINGS_JSON}" | jq --argjson f "${finding}" '. + [$f]')
}

# ═══════════════════════════════════════════════════════════
# SCANNER 1: SECRETS DETECTION
# ═══════════════════════════════════════════════════════════
run_secrets_scan() {
  echo -e "${BOLD}${YELLOW}━━━ 🔑 Secrets Scanner ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

  # Pattern definitions: name|regex|severity
  local patterns=(
    "AWS Access Key|AKIA[0-9A-Z]{16}|critical"
    "AWS Secret Key|(?i)aws_secret_access_key\s*[=:]\s*['\"]?[A-Za-z0-9/+=]{40}|critical"
    "GitHub Token|gh[pousr]_[A-Za-z0-9_]{36,255}|critical"
    "GitHub Personal Access Token|github_pat_[A-Za-z0-9_]{22,255}|critical"
    "Generic API Key|(?i)(api[_-]?key|apikey)\s*[=:]\s*['\"]?[A-Za-z0-9_\-]{20,}|high"
    "Generic Secret|(?i)(secret|password|passwd|pwd)\s*[=:]\s*['\"]?[^\s'\"]{8,}|high"
    "Private Key Header|-----BEGIN (RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----|critical"
    "Slack Token|xox[baprs]-[0-9a-zA-Z-]{10,}|high"
    "Slack Webhook|https://hooks\.slack\.com/services/T[A-Z0-9]{8}/B[A-Z0-9]{8}/[A-Za-z0-9]{24}|high"
    "Google API Key|AIza[0-9A-Za-z_\-]{35}|high"
    "Stripe Secret Key|sk_live_[0-9a-zA-Z]{24,}|critical"
    "Stripe Publishable Key|pk_live_[0-9a-zA-Z]{24,}|medium"
    "Twilio Account SID|AC[0-9a-fA-F]{32}|high"
    "SendGrid API Key|SG\.[A-Za-z0-9_\-]{22}\.[A-Za-z0-9_\-]{43}|critical"
    "JWT Token|eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}|medium"
    "Database URL|(?i)(mongodb|postgres|mysql|redis)://[^\s'\"]+@[^\s'\"]+|critical"
    "Bearer Token|(?i)bearer\s+[A-Za-z0-9_\-\.]{20,}|medium"
    "Heroku API Key|(?i)heroku.*[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|high"
    "NPM Token|//registry\.npmjs\.org/:_authToken=[^\s]+|critical"
    "Docker Hub Token|dckr_pat_[A-Za-z0-9_-]{27}|high"
    "Azure Storage Key|(?i)DefaultEndpointsProtocol=https;AccountName=[^;]+;AccountKey=[A-Za-z0-9+/=]{88}|critical"
    "Mailgun API Key|key-[0-9a-zA-Z]{32}|high"
    "HashiCorp Vault Token|hvs\.[A-Za-z0-9_-]{24,}|critical"
  )

  # Build exclude args
  local exclude_args=""
  IFS=',' read -ra EXCL <<< "${EXCLUDE_PATTERNS}"
  for pattern in "${EXCL[@]}"; do
    exclude_args="${exclude_args} --exclude-dir=$(echo "${pattern}" | sed 's/\*\*$//' | sed 's/\/$//')"
  done

  local secrets_found=0
  for entry in "${patterns[@]}"; do
    IFS='|' read -r name regex severity <<< "${entry}"

    # Search for pattern
    while IFS= read -r match; do
      if [ -n "${match}" ]; then
        local file line_num
        file=$(echo "${match}" | cut -d: -f1 | sed "s|${WORKSPACE}/||")
        line_num=$(echo "${match}" | cut -d: -f2)

        # Skip test files, example files, docs
        if echo "${file}" | grep -qiE '(test|spec|example|mock|fixture|\.md$|\.txt$|\.test\.|\.spec\.)'; then
          continue
        fi

        # Skip .env.example files
        if echo "${file}" | grep -qiE '\.example|\.sample|\.template'; then
          continue
        fi

        add_finding "${severity}" "secrets" "${file}" "${line_num}" \
          "${name} Detected" \
          "Potential ${name} found. Hard-coded credentials should be moved to environment variables or a secrets manager." \
          "ANCHOR-SEC-$(echo "${name}" | tr ' ' '-' | tr '[:lower:]' '[:upper:]')"
        secrets_found=$((secrets_found + 1))
      fi
    done < <(grep -rnP "${regex}" "${SCAN_DIR}" ${exclude_args} 2>/dev/null || true)
  done

  echo -e "  ${GREEN}✓${NC} Scanned for ${#patterns[@]} secret patterns"
  echo -e "  ${secrets_found} potential secrets found"
  echo ""
}

# ═══════════════════════════════════════════════════════════
# SCANNER 2: SAST (Static Application Security Testing)
# ═══════════════════════════════════════════════════════════
run_sast_scan() {
  echo -e "${BOLD}${YELLOW}━━━ 🔍 SAST Scanner ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

  local sast_found=0

  # Build exclude args for grep
  local exclude_args=""
  IFS=',' read -ra EXCL <<< "${EXCLUDE_PATTERNS}"
  for pattern in "${EXCL[@]}"; do
    local dir_name
    dir_name=$(echo "${pattern}" | sed 's/\*\*$//' | sed 's/\/$//' | sed 's/^\*\*//')
    if [ -n "${dir_name}" ]; then
      exclude_args="${exclude_args} --exclude-dir=${dir_name}"
    fi
  done

  # ── JavaScript/TypeScript SAST rules ──
  local js_rules=(
    "eval\(|critical|Code Injection via eval()|eval() executes arbitrary code and is a critical injection vector. Use JSON.parse() or safe alternatives.|ANCHOR-SAST-EVAL"
    "document\.write|high|DOM-based XSS via document.write|document.write can inject unsanitized HTML into the DOM. Use textContent or createElement instead.|ANCHOR-SAST-DOC-WRITE"
    "innerHTML\s*=|high|Potential XSS via innerHTML|Direct innerHTML assignment can execute injected scripts. Use textContent or sanitize input with DOMPurify.|ANCHOR-SAST-INNERHTML"
    "\.html\(|medium|jQuery HTML Injection|jQuery .html() can inject unsanitized content. Use .text() or sanitize.|ANCHOR-SAST-JQUERY-HTML"
    "new Function\(|critical|Dynamic Code Execution|new Function() creates code from strings, enabling injection attacks.|ANCHOR-SAST-NEW-FUNC"
    "child_process|high|Command Injection Risk|Direct use of child_process can enable OS command injection. Validate and sanitize all inputs.|ANCHOR-SAST-CMD-INJECT"
    "exec\(|high|Command Execution|exec() may allow command injection. Use execFile() with argument arrays instead.|ANCHOR-SAST-EXEC"
    "\.exec\(|medium|RegExp Denial of Service|Unsafe regex execution can cause ReDoS. Validate regex complexity.|ANCHOR-SAST-REDOS"
    "dangerouslySetInnerHTML|high|React XSS Risk|dangerouslySetInnerHTML bypasses React's XSS protections. Ensure content is sanitized with DOMPurify.|ANCHOR-SAST-REACT-XSS"
    "crypto\.createCipher\b|high|Weak Cryptography|crypto.createCipher uses a weak key derivation. Use crypto.createCipheriv with a proper IV.|ANCHOR-SAST-WEAK-CRYPTO"
    "Math\.random|medium|Insecure Randomness|Math.random() is not cryptographically secure. Use crypto.randomBytes() or crypto.getRandomValues().|ANCHOR-SAST-INSECURE-RANDOM"
    "atob\(|low|Base64 is Not Encryption|atob/btoa is encoding, not encryption. Sensitive data needs real encryption.|ANCHOR-SAST-BASE64-MISUSE"
    "(?i)todo.*(hack|fix|security|vuln)|info|Security TODO Found|A security-related TODO comment was found. Ensure it's tracked and resolved.|ANCHOR-SAST-SEC-TODO"
    "disable.*eslint|low|ESLint Rule Disabled|Disabling linting rules may hide security issues. Review the justification.|ANCHOR-SAST-ESLINT-DISABLE"
    "console\.(log|debug|trace)\(|info|Debug Logging in Production|Console logging may leak sensitive information in production. Use a proper logging framework.|ANCHOR-SAST-CONSOLE-LOG"
    "http://|medium|Insecure HTTP URL|HTTP URLs transmit data in cleartext. Use HTTPS for all external requests.|ANCHOR-SAST-HTTP-URL"
    "process\.env\.|info|Environment Variable Access|Direct process.env access found. Validate and sanitize all env vars.|ANCHOR-SAST-ENV-ACCESS"
    "localhost|info|Hardcoded Localhost|Hardcoded localhost references may break in production. Use configuration.|ANCHOR-SAST-LOCALHOST"
    "(?i)(password|secret|token)\s*=\s*['\"][^'\"]+['\"]|high|Hardcoded Credential|Credentials should not be hardcoded. Use environment variables or a secrets manager.|ANCHOR-SAST-HARDCODED-CRED"
    "fs\.(readFile|writeFile|unlink|rmdir)\(|medium|Filesystem Access|Direct filesystem operations should validate paths to prevent path traversal attacks.|ANCHOR-SAST-FS-ACCESS"
    "\.createReadStream\(|medium|File Stream Access|File streaming should validate input paths for directory traversal.|ANCHOR-SAST-FILE-STREAM"
    "cors\(\)|medium|Permissive CORS|cors() with no options allows all origins. Restrict to specific domains.|ANCHOR-SAST-OPEN-CORS"
    "helmet|info|Security Headers Check|Ensure helmet middleware is configured with strict CSP, HSTS, and other security headers.|ANCHOR-SAST-HELMET-CHECK"
    "nosql.*inject|high|NoSQL Injection|Potential NoSQL injection vector. Use parameterized queries and input validation.|ANCHOR-SAST-NOSQL-INJECT"
    "sql.*inject|high|SQL Injection|Potential SQL injection vector. Use parameterized queries (prepared statements).|ANCHOR-SAST-SQL-INJECT"
    "require\([^'\")|high|Dynamic Require|Dynamic require() calls can load arbitrary modules. Use static imports.|ANCHOR-SAST-DYN-REQUIRE"
  )

  for entry in "${js_rules[@]}"; do
    IFS='|' read -r pattern severity title description rule_id <<< "${entry}"

    while IFS= read -r match; do
      if [ -n "${match}" ]; then
        local file line_num
        file=$(echo "${match}" | cut -d: -f1 | sed "s|${WORKSPACE}/||")
        line_num=$(echo "${match}" | cut -d: -f2)

        # Skip test/mock/example files
        if echo "${file}" | grep -qiE '(\.test\.|\.spec\.|__test__|__mock__|fixture|example|\.stories\.)'; then
          continue
        fi

        add_finding "${severity}" "sast" "${file}" "${line_num}" "${title}" "${description}" "${rule_id}"
        sast_found=$((sast_found + 1))
      fi
    done < <(grep -rnP "${pattern}" "${SCAN_DIR}" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" --include="*.mjs" --include="*.cjs" ${exclude_args} 2>/dev/null || true)
  done

  # ── Python SAST rules ──
  local py_rules=(
    "pickle\.load|high|Unsafe Deserialization|pickle.load can execute arbitrary code. Use safe formats like JSON.|ANCHOR-SAST-PY-PICKLE"
    "yaml\.load\(|high|Unsafe YAML Loading|yaml.load without SafeLoader can execute arbitrary code. Use yaml.safe_load().|ANCHOR-SAST-PY-YAML"
    "subprocess\.(call|Popen|run)\(.*shell=True|critical|Shell Injection|shell=True with user input enables command injection. Use shell=False with argument lists.|ANCHOR-SAST-PY-SHELL"
    "__import__|high|Dynamic Import|Dynamic imports can load malicious modules. Use static imports.|ANCHOR-SAST-PY-DYNAMIC-IMPORT"
    "flask.*debug.*True|high|Flask Debug Mode|Debug mode in production exposes the Werkzeug debugger with code execution.|ANCHOR-SAST-PY-FLASK-DEBUG"
    "hashlib\.md5|medium|Weak Hash Algorithm|MD5 is cryptographically broken. Use SHA-256 or SHA-3.|ANCHOR-SAST-PY-WEAK-HASH"
  )

  for entry in "${py_rules[@]}"; do
    IFS='|' read -r pattern severity title description rule_id <<< "${entry}"
    while IFS= read -r match; do
      if [ -n "${match}" ]; then
        local file line_num
        file=$(echo "${match}" | cut -d: -f1 | sed "s|${WORKSPACE}/||")
        line_num=$(echo "${match}" | cut -d: -f2)
        if echo "${file}" | grep -qiE '(test|spec|example|fixture)'; then continue; fi
        add_finding "${severity}" "sast" "${file}" "${line_num}" "${title}" "${description}" "${rule_id}"
        sast_found=$((sast_found + 1))
      fi
    done < <(grep -rnP "${pattern}" "${SCAN_DIR}" --include="*.py" ${exclude_args} 2>/dev/null || true)
  done

  echo -e "  ${GREEN}✓${NC} Analyzed $(find "${SCAN_DIR}" -type f \( -name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.py' \) 2>/dev/null | wc -l) source files"
  echo -e "  ${sast_found} SAST findings"
  echo ""
}

# ═══════════════════════════════════════════════════════════
# SCANNER 3: DEPENDENCY AUDIT
# ═══════════════════════════════════════════════════════════
run_dependency_scan() {
  echo -e "${BOLD}${YELLOW}━━━ 📦 Dependency Scanner ━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

  local dep_found=0

  # NPM audit
  if [ -f "${SCAN_DIR}/package-lock.json" ] || [ -f "${SCAN_DIR}/package.json" ]; then
    echo -e "  Scanning npm dependencies..."

    if [ -f "${SCAN_DIR}/package-lock.json" ]; then
      local audit_output
      audit_output=$(cd "${SCAN_DIR}" && npm audit --json 2>/dev/null || true)

      if [ -n "${audit_output}" ] && echo "${audit_output}" | jq -e '.vulnerabilities' >/dev/null 2>&1; then
        local vuln_count
        vuln_count=$(echo "${audit_output}" | jq '[.vulnerabilities | to_entries[] | .value] | length' 2>/dev/null || echo "0")

        for key in $(echo "${audit_output}" | jq -r '.vulnerabilities | keys[]' 2>/dev/null); do
          local pkg_severity pkg_title pkg_via
          pkg_severity=$(echo "${audit_output}" | jq -r ".vulnerabilities.\"${key}\".severity" 2>/dev/null || echo "info")
          pkg_title=$(echo "${audit_output}" | jq -r ".vulnerabilities.\"${key}\".name" 2>/dev/null || echo "${key}")
          pkg_via=$(echo "${audit_output}" | jq -r ".vulnerabilities.\"${key}\".via[0]" 2>/dev/null || echo "unknown")

          # Map npm severity
          local mapped_severity="medium"
          case "${pkg_severity}" in
            critical) mapped_severity="critical" ;;
            high)     mapped_severity="high" ;;
            moderate) mapped_severity="medium" ;;
            low)      mapped_severity="low" ;;
            info)     mapped_severity="info" ;;
          esac

          add_finding "${mapped_severity}" "dependency" "package.json" "1" \
            "Vulnerable Dependency: ${pkg_title}" \
            "npm package '${pkg_title}' has a known ${pkg_severity} vulnerability. Run 'npm audit fix' to remediate." \
            "ANCHOR-DEP-NPM-${pkg_title^^}"
          dep_found=$((dep_found + 1))
        done

        echo -e "  ${GREEN}✓${NC} npm audit: ${vuln_count} vulnerable packages found"
      else
        echo -e "  ${GREEN}✓${NC} npm audit: No known vulnerabilities"
      fi
    else
      echo -e "  ${YELLOW}!${NC} No package-lock.json found. Run 'npm install' first for full audit."
    fi
  fi

  # Check for outdated lockfiles
  if [ -f "${SCAN_DIR}/package-lock.json" ]; then
    local lock_age
    lock_age=$(( ($(date +%s) - $(stat -c %Y "${SCAN_DIR}/package-lock.json" 2>/dev/null || date +%s)) / 86400 ))
    if [ "${lock_age}" -gt 90 ]; then
      add_finding "low" "dependency" "package-lock.json" "1" \
        "Stale Lockfile (${lock_age} days)" \
        "The lockfile is ${lock_age} days old. Regular dependency updates reduce vulnerability exposure." \
        "ANCHOR-DEP-STALE-LOCK"
      dep_found=$((dep_found + 1))
    fi
  fi

  # Python requirements
  if [ -f "${SCAN_DIR}/requirements.txt" ]; then
    echo -e "  Scanning Python dependencies..."
    while IFS= read -r line; do
      if echo "${line}" | grep -qP '^[a-zA-Z].*=='; then
        local pkg_name pkg_version
        pkg_name=$(echo "${line}" | cut -d= -f1)
        pkg_version=$(echo "${line}" | cut -d= -f3)
        # Check for known vulnerable packages (basic checks)
        case "${pkg_name}" in
          Django)
            if [[ "${pkg_version}" < "4.2" ]]; then
              add_finding "high" "dependency" "requirements.txt" "1" \
                "Outdated Django (${pkg_version})" "Django < 4.2 has known security vulnerabilities. Upgrade to latest LTS." \
                "ANCHOR-DEP-PY-DJANGO"
              dep_found=$((dep_found + 1))
            fi ;;
          flask)
            if [[ "${pkg_version}" < "2.3" ]]; then
              add_finding "medium" "dependency" "requirements.txt" "1" \
                "Outdated Flask (${pkg_version})" "Flask < 2.3 may have security issues. Consider upgrading." \
                "ANCHOR-DEP-PY-FLASK"
              dep_found=$((dep_found + 1))
            fi ;;
          requests)
            if [[ "${pkg_version}" < "2.31" ]]; then
              add_finding "medium" "dependency" "requirements.txt" "1" \
                "Outdated requests (${pkg_version})" "requests < 2.31 has known CVEs. Upgrade." \
                "ANCHOR-DEP-PY-REQUESTS"
              dep_found=$((dep_found + 1))
            fi ;;
        esac
      fi
    done < "${SCAN_DIR}/requirements.txt"
    echo -e "  ${GREEN}✓${NC} Python dependency check complete"
  fi

  # Dockerfile security checks
  local dockerfiles
  dockerfiles=$(find "${SCAN_DIR}" -maxdepth 3 -name "Dockerfile*" 2>/dev/null)
  if [ -n "${dockerfiles}" ]; then
    echo -e "  Scanning Dockerfiles..."
    while IFS= read -r df; do
      local df_rel
      df_rel=$(echo "${df}" | sed "s|${WORKSPACE}/||")

      # Check for latest tag
      if grep -qP 'FROM\s+\S+:latest' "${df}" 2>/dev/null; then
        local line_num
        line_num=$(grep -nP 'FROM\s+\S+:latest' "${df}" | head -1 | cut -d: -f1)
        add_finding "medium" "dependency" "${df_rel}" "${line_num}" \
          "Docker Image Uses :latest Tag" \
          "Using :latest tag makes builds non-reproducible and unpredictable. Pin to a specific version." \
          "ANCHOR-DEP-DOCKER-LATEST"
        dep_found=$((dep_found + 1))
      fi

      # Check for running as root
      if ! grep -q 'USER' "${df}" 2>/dev/null; then
        add_finding "high" "dependency" "${df_rel}" "1" \
          "Docker Container Runs as Root" \
          "Container runs as root by default. Add a USER directive to run as non-root." \
          "ANCHOR-DEP-DOCKER-ROOT"
        dep_found=$((dep_found + 1))
      fi

      # Check for COPY with broad wildcard
      if grep -qP 'COPY\s+\.\s' "${df}" 2>/dev/null; then
        local line_num
        line_num=$(grep -nP 'COPY\s+\.\s' "${df}" | head -1 | cut -d: -f1)
        add_finding "low" "dependency" "${df_rel}" "${line_num}" \
          "Broad COPY Directive" \
          "COPY . may include secrets, .env files, or .git directory. Use .dockerignore and specific COPY targets." \
          "ANCHOR-DEP-DOCKER-BROAD-COPY"
        dep_found=$((dep_found + 1))
      fi
    done <<< "${dockerfiles}"
  fi

  echo -e "  ${dep_found} dependency findings"
  echo ""
}

# ═══════════════════════════════════════════════════════════
# SCANNER 4: AI SECURITY ANALYSIS
# ═══════════════════════════════════════════════════════════
run_ai_scan() {
  echo -e "${BOLD}${YELLOW}━━━ 🤖 AI Security Analysis ━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

  local ai_found=0
  local exclude_args=""
  IFS=',' read -ra EXCL <<< "${EXCLUDE_PATTERNS}"
  for pattern in "${EXCL[@]}"; do
    local dir_name
    dir_name=$(echo "${pattern}" | sed 's/\*\*$//' | sed 's/\/$//' | sed 's/^\*\*//')
    if [ -n "${dir_name}" ]; then
      exclude_args="${exclude_args} --exclude-dir=${dir_name}"
    fi
  done

  # ── AI/ML-specific security checks ──
  local ai_rules=(
    "(?i)(openai|anthropic|cohere|huggingface)\.api[_-]?key|critical|AI API Key Exposure|AI service API keys can lead to massive bills and data exfiltration. Use secrets manager.|ANCHOR-AI-KEY-EXPOSURE"
    "(?i)prompt.*inject|high|Prompt Injection Risk|Code references prompt injection. Ensure LLM inputs are sanitized and system prompts are protected.|ANCHOR-AI-PROMPT-INJECT"
    "(?i)(gpt|claude|llama|mistral|gemini).*\buser[_-]?input\b|high|Unsanitized User Input to LLM|User input passed directly to AI models can enable prompt injection. Implement input validation.|ANCHOR-AI-UNSANITIZED-INPUT"
    "(?i)training[_-]?data.*user|medium|PII in Training Data|User data referenced in training context. Ensure PII is properly anonymized before model training.|ANCHOR-AI-TRAINING-PII"
    "(?i)model\.predict\(.*request|medium|Unvalidated Model Input|Model prediction with direct request data may be vulnerable to adversarial inputs.|ANCHOR-AI-ADVERSARIAL"
    "(?i)embedding.*store|medium|Vector Store Security|Vectors may contain sensitive information. Ensure proper access controls on vector databases.|ANCHOR-AI-VECTOR-SECURITY"
    "(?i)langchain|info|LangChain Usage Detected|LangChain found. Ensure chain-of-thought outputs don't leak system prompts or sensitive context.|ANCHOR-AI-LANGCHAIN"
    "(?i)\.load_model\(|medium|Model Loading Security|Remote model loading can introduce supply chain risks. Verify model integrity (checksums/signatures).|ANCHOR-AI-MODEL-LOAD"
    "(?i)temperature\s*[=:]\s*(1\.?\d*|[2-9])|low|High Temperature Setting|High temperature values increase output unpredictability, potentially bypassing safety guardrails.|ANCHOR-AI-HIGH-TEMP"
    "(?i)system[_-]?prompt|info|System Prompt Found|System prompts should be protected from extraction. Implement prompt armor techniques.|ANCHOR-AI-SYSTEM-PROMPT"
    "(?i)(serialize|deserialize).*model|high|Model Serialization Risk|Model serialization/deserialization can execute arbitrary code (pickle, joblib). Use safe formats.|ANCHOR-AI-SERIALIZATION"
    "(?i)rag.*retriev|info|RAG Pipeline Detected|Retrieval-Augmented Generation found. Ensure retrieved documents are access-controlled.|ANCHOR-AI-RAG-DETECTED"
    "(?i)function[_-]?call.*user|high|AI Function Calling with User Input|AI function calling with user-controlled input can invoke arbitrary tools. Implement allowlists.|ANCHOR-AI-FUNC-CALLING"
  )

  for entry in "${ai_rules[@]}"; do
    IFS='|' read -r pattern severity title description rule_id <<< "${entry}"
    while IFS= read -r match; do
      if [ -n "${match}" ]; then
        local file line_num
        file=$(echo "${match}" | cut -d: -f1 | sed "s|${WORKSPACE}/||")
        line_num=$(echo "${match}" | cut -d: -f2)
        if echo "${file}" | grep -qiE '(\.test\.|\.spec\.|__test__|__mock__|fixture|example)'; then continue; fi
        add_finding "${severity}" "ai" "${file}" "${line_num}" "${title}" "${description}" "${rule_id}"
        ai_found=$((ai_found + 1))
      fi
    done < <(grep -rnP "${pattern}" "${SCAN_DIR}" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" --include="*.py" ${exclude_args} 2>/dev/null || true)
  done

  # ── Security config checks ──
  if [ -f "${SCAN_DIR}/.env" ]; then
    add_finding "high" "ai" ".env" "1" \
      ".env File Committed" \
      "Environment file should not be committed to version control. Add .env to .gitignore." \
      "ANCHOR-AI-ENV-COMMITTED"
    ai_found=$((ai_found + 1))
  fi

  # Check .gitignore for proper exclusions
  if [ -f "${SCAN_DIR}/.gitignore" ]; then
    if ! grep -q '\.env' "${SCAN_DIR}/.gitignore" 2>/dev/null; then
      add_finding "high" "ai" ".gitignore" "1" \
        ".env Not in .gitignore" \
        ".env files should be listed in .gitignore to prevent accidental secret commits." \
        "ANCHOR-AI-GITIGNORE-ENV"
      ai_found=$((ai_found + 1))
    fi
  fi

  echo -e "  ${GREEN}✓${NC} AI security analysis complete"
  echo -e "  ${ai_found} AI-specific findings"
  echo ""
}

# ═══════════════════════════════════════════════════════════
# REPORT GENERATION
# ═══════════════════════════════════════════════════════════
generate_reports() {
  local end_time
  end_time=$(date +%s)
  local duration=$((end_time - START_TIME))

  # ── JSON Report ──
  local report
  report=$(cat <<EOF
{
  "scanner": "Anchor Security Scanner",
  "version": "1.0.0",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "duration_seconds": ${duration},
  "scan_type": "${SCAN_TYPE}",
  "severity_threshold": "${SEVERITY_THRESHOLD}",
  "summary": {
    "total": ${TOTAL_FINDINGS},
    "critical": ${CRITICAL_COUNT},
    "high": ${HIGH_COUNT},
    "medium": ${MEDIUM_COUNT},
    "low": ${LOW_COUNT},
    "info": ${INFO_COUNT}
  },
  "findings": ${FINDINGS_JSON}
}
EOF
)
  echo "${report}" > "${REPORT_DIR}/anchor-report.json"

  # ── SARIF Report (for GitHub Security tab) ──
  if [ "${ENABLE_SARIF}" = "true" ]; then
    local sarif_results=""
    local sarif_rules=""
    local seen_rules=""

    while IFS= read -r finding; do
      local f_file f_line f_severity f_title f_desc f_rule
      f_file=$(echo "${finding}" | jq -r '.file')
      f_line=$(echo "${finding}" | jq -r '.line')
      f_severity=$(echo "${finding}" | jq -r '.severity')
      f_title=$(echo "${finding}" | jq -r '.title')
      f_desc=$(echo "${finding}" | jq -r '.description')
      f_rule=$(echo "${finding}" | jq -r '.ruleId')

      # Map severity to SARIF level
      local sarif_level="warning"
      case "${f_severity}" in
        critical|high) sarif_level="error" ;;
        medium)        sarif_level="warning" ;;
        low|info)      sarif_level="note" ;;
      esac

      # SARIF security-severity
      local sec_severity="5.0"
      case "${f_severity}" in
        critical) sec_severity="9.5" ;;
        high)     sec_severity="8.0" ;;
        medium)   sec_severity="5.5" ;;
        low)      sec_severity="3.0" ;;
        info)     sec_severity="1.0" ;;
      esac

      # Add result
      [ -n "${sarif_results}" ] && sarif_results="${sarif_results},"
      sarif_results="${sarif_results}
      {
        \"ruleId\": \"${f_rule}\",
        \"level\": \"${sarif_level}\",
        \"message\": { \"text\": \"${f_desc}\" },
        \"locations\": [{
          \"physicalLocation\": {
            \"artifactLocation\": { \"uri\": \"${f_file}\" },
            \"region\": { \"startLine\": ${f_line} }
          }
        }]
      }"

      # Add rule (deduplicated)
      if ! echo "${seen_rules}" | grep -q "${f_rule}"; then
        [ -n "${sarif_rules}" ] && sarif_rules="${sarif_rules},"
        sarif_rules="${sarif_rules}
        {
          \"id\": \"${f_rule}\",
          \"shortDescription\": { \"text\": \"${f_title}\" },
          \"fullDescription\": { \"text\": \"${f_desc}\" },
          \"properties\": { \"security-severity\": \"${sec_severity}\" }
        }"
        seen_rules="${seen_rules} ${f_rule}"
      fi
    done < <(echo "${FINDINGS_JSON}" | jq -c '.[]')

    cat > "${REPORT_DIR}/anchor-results.sarif" <<EOF
{
  "\$schema": "https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json",
  "version": "2.1.0",
  "runs": [{
    "tool": {
      "driver": {
        "name": "Anchor Security Scanner",
        "organization": "Anchor AI Guard",
        "version": "1.0.0",
        "informationUri": "https://github.com/toddyg1981-png/Anchor-AI-Guard",
        "rules": [${sarif_rules}]
      }
    },
    "results": [${sarif_results}]
  }]
}
EOF
    echo -e "${GREEN}✓${NC} SARIF report generated: .anchor-reports/anchor-results.sarif"
  fi

  echo -e "${GREEN}✓${NC} JSON report generated: .anchor-reports/anchor-report.json"

  # ── Set GitHub Action outputs ──
  if [ -n "${GITHUB_OUTPUT:-}" ]; then
    echo "findings-count=${TOTAL_FINDINGS}" >> "${GITHUB_OUTPUT}"
    echo "critical-count=${CRITICAL_COUNT}" >> "${GITHUB_OUTPUT}"
    echo "high-count=${HIGH_COUNT}" >> "${GITHUB_OUTPUT}"
    echo "medium-count=${MEDIUM_COUNT}" >> "${GITHUB_OUTPUT}"
    echo "low-count=${LOW_COUNT}" >> "${GITHUB_OUTPUT}"
    echo "sarif-file=${REPORT_DIR}/anchor-results.sarif" >> "${GITHUB_OUTPUT}"
    echo "report-file=${REPORT_DIR}/anchor-report.json" >> "${GITHUB_OUTPUT}"
    echo "scan-duration=${duration}" >> "${GITHUB_OUTPUT}"
  fi
}

# ═══════════════════════════════════════════════════════════
# MAIN EXECUTION
# ═══════════════════════════════════════════════════════════

case "${SCAN_TYPE}" in
  all)
    run_secrets_scan
    run_sast_scan
    run_dependency_scan
    run_ai_scan
    ;;
  secrets)
    run_secrets_scan
    ;;
  sast)
    run_sast_scan
    ;;
  dependencies)
    run_dependency_scan
    ;;
  ai)
    run_ai_scan
    ;;
  *)
    echo -e "${RED}Unknown scan type: ${SCAN_TYPE}${NC}"
    echo "Valid types: all, sast, secrets, dependencies, ai"
    exit 1
    ;;
esac

# Generate reports
generate_reports

# ── Summary ──
echo ""
echo -e "${BOLD}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}║                   SCAN RESULTS SUMMARY                  ║${NC}"
echo -e "${BOLD}╠══════════════════════════════════════════════════════════╣${NC}"
printf "║  %-18s %s\n" "Total Findings:" "${TOTAL_FINDINGS}"
[ "${CRITICAL_COUNT}" -gt 0 ] && printf "║  ${RED}%-18s %s${NC}\n" "🔴 Critical:" "${CRITICAL_COUNT}"
[ "${HIGH_COUNT}" -gt 0 ]     && printf "║  ${RED}%-18s %s${NC}\n" "🟠 High:" "${HIGH_COUNT}"
[ "${MEDIUM_COUNT}" -gt 0 ]   && printf "║  ${YELLOW}%-18s %s${NC}\n" "🟡 Medium:" "${MEDIUM_COUNT}"
[ "${LOW_COUNT}" -gt 0 ]      && printf "║  ${BLUE}%-18s %s${NC}\n" "🔵 Low:" "${LOW_COUNT}"
[ "${INFO_COUNT}" -gt 0 ]     && printf "║  %-18s %s\n" "ℹ️  Info:" "${INFO_COUNT}"
printf "║  %-18s %ss\n" "Duration:" "$(($(date +%s) - START_TIME))"
echo -e "${BOLD}╚══════════════════════════════════════════════════════════╝${NC}"

# ── Exit code ──
ABOVE_THRESHOLD=0
if [ $(severity_to_num "critical") -ge "${THRESHOLD_NUM}" ] && [ "${CRITICAL_COUNT}" -gt 0 ]; then
  ABOVE_THRESHOLD=$((ABOVE_THRESHOLD + CRITICAL_COUNT))
fi
if [ $(severity_to_num "high") -ge "${THRESHOLD_NUM}" ] && [ "${HIGH_COUNT}" -gt 0 ]; then
  ABOVE_THRESHOLD=$((ABOVE_THRESHOLD + HIGH_COUNT))
fi
if [ $(severity_to_num "medium") -ge "${THRESHOLD_NUM}" ] && [ "${MEDIUM_COUNT}" -gt 0 ]; then
  ABOVE_THRESHOLD=$((ABOVE_THRESHOLD + MEDIUM_COUNT))
fi
if [ $(severity_to_num "low") -ge "${THRESHOLD_NUM}" ] && [ "${LOW_COUNT}" -gt 0 ]; then
  ABOVE_THRESHOLD=$((ABOVE_THRESHOLD + LOW_COUNT))
fi
if [ $(severity_to_num "info") -ge "${THRESHOLD_NUM}" ] && [ "${INFO_COUNT}" -gt 0 ]; then
  ABOVE_THRESHOLD=$((ABOVE_THRESHOLD + INFO_COUNT))
fi

if [ -n "${GITHUB_OUTPUT:-}" ]; then
  if [ "${ABOVE_THRESHOLD}" -gt 0 ]; then
    echo "exit-code=1" >> "${GITHUB_OUTPUT}"
  else
    echo "exit-code=0" >> "${GITHUB_OUTPUT}"
  fi
fi

if [ "${FAIL_ON_FINDINGS}" = "true" ] && [ "${ABOVE_THRESHOLD}" -gt 0 ]; then
  echo ""
  echo -e "${RED}${BOLD}❌ FAILED: ${ABOVE_THRESHOLD} findings at or above '${SEVERITY_THRESHOLD}' severity${NC}"
  echo -e "   Set ${CYAN}fail-on-findings: false${NC} to report without failing."
  exit 1
else
  echo ""
  echo -e "${GREEN}${BOLD}✅ PASSED: No findings above '${SEVERITY_THRESHOLD}' threshold (or fail-on-findings disabled)${NC}"
  exit 0
fi
