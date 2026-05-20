import { type ComponentType, lazy } from "react";
import {
  Eraser, Replace, BarChart3, ListOrdered, Diff, CaseSensitive,
  FileJson, FileCode2, Regex, Hash, Sparkles, Link2, Copy,
  Search, AtSign, Phone, Hash as HashIcon, ShieldAlert, Languages,
  Smile, Filter, Bold, Asterisk, Trash2, Trash, Type,
  Palette, Table as TableIcon, Key, Fingerprint, Indent as IndentIcon,
  Shield, List, FileText, Radio, Ear, Sigma, Lock, WrapText,
  Shuffle, Repeat, ArrowUpDown, Database, Quote, Clock, Eye,
  Globe, Binary, Option as OptionIcon,
  Activity, QrCode, Wifi, Image, Code, Cpu, GitBranch,
  Timer, Thermometer, CreditCard, Smartphone, Router, Unlock,
  Trophy, Ruler, BookOpen, Contact, ScanLine,
} from "lucide-react";

export type ToolCategory =
  | "Core Tools"
  | "Text Utilities"
  | "Extractors"
  | "Crypto & Security"
  | "Converters"
  | "Web"
  | "Images & Videos"
  | "Development"
  | "Network"
  | "Math"
  | "Measurement"
  | "Data"
  | "Dev Tools"
  | "Advanced";

export interface ToolMeta {
  slug: string;
  name: string;
  tagline: string;
  category: ToolCategory;
  icon: ComponentType<{ className?: string }>;
  keywords: string[];
}

const lazyTool = (loader: () => Promise<{ default: ComponentType }>) => lazy(loader);

export const toolComponents: Record<string, ComponentType> = {
  // Core Tools
  "text-tracker-remover": lazyTool(() => import("@/components/tools/TextTrackerRemover")),
  "text-repeater": lazyTool(() => import("@/components/tools/TextRepeater")),
  "symbol-tracker-multiplier": lazyTool(() => import("@/components/tools/SymbolTrackerMultiplier")),
  "symbol-filter-remove": lazyTool(() => import("@/components/tools/SymbolFilterRemove")),
  "global-text-formatter": lazyTool(() => import("@/components/tools/GlobalTextFormatter")),

  // Text Utilities
  "case-converter": lazyTool(() => import("@/components/tools/CaseConverter")),
  "smart-replace": lazyTool(() => import("@/components/tools/SmartReplace")),
  "whitespace-cleaner": lazyTool(() => import("@/components/tools/WhitespaceCleaner")),
  "duplicate-remover": lazyTool(() => import("@/components/tools/DuplicateRemover")),
  "line-tools": lazyTool(() => import("@/components/tools/LineTools")),
  "text-compare": lazyTool(() => import("@/components/tools/DiffChecker")),
  "find-replace": lazyTool(() => import("@/components/tools/FindReplace")),
  "remove-duplicate-lines": lazyTool(() => import("@/components/tools/RemoveDuplicates")),
  "reverse-text": lazyTool(() => import("@/components/tools/ReverseText")),
  "sort-lines": lazyTool(() => import("@/components/tools/SortLines")),
  "text-statistics": lazyTool(() => import("@/components/tools/TextStatistics")),
  "word-frequency": lazyTool(() => import("@/components/tools/WordFrequency")),
  "word-wrap": lazyTool(() => import("@/components/tools/WordWrap")),
  "line-numbering": lazyTool(() => import("@/components/tools/LineNumbering")),
  "indent-tool": lazyTool(() => import("@/components/tools/IndentTool")),
  "prefix-suffix": lazyTool(() => import("@/components/tools/PrefixSuffix")),
  "string-obfuscator": lazyTool(() => import("@/components/tools/StringObfuscator")),
  "numeronym-generator": lazyTool(() => import("@/components/tools/NumeronymGen")),
  "regex-cheatsheet": lazyTool(() => import("@/components/tools/RegexCheatsheet")),

  // Extractors
  "url-extractor": lazyTool(() => import("@/components/tools/UrlExtractor")),
  "email-extractor": lazyTool(() => import("@/components/tools/EmailExtractor")),
  "phone-extractor": lazyTool(() => import("@/components/tools/PhoneExtractor")),
  "hashtag-extractor": lazyTool(() => import("@/components/tools/HashtagExtractor")),
  "pattern-extractor": lazyTool(() => import("@/components/tools/Extractor")),

  // Crypto & Security
  "bcrypt": lazyTool(() => import("@/components/tools/BcryptTool")),
  "encrypt-decrypt": lazyTool(() => import("@/components/tools/EncryptDecrypt")),
  "password-strength": lazyTool(() => import("@/components/tools/PasswordStrength")),
  "hmac-generator": lazyTool(() => import("@/components/tools/HMACTool")),
  "rsa-generator": lazyTool(() => import("@/components/tools/RSATool")),
  "token-generator": lazyTool(() => import("@/components/tools/TokenGenerator")),
  "ulid-generator": lazyTool(() => import("@/components/tools/ULIDGenerator")),
  "bip39-generator": lazyTool(() => import("@/components/tools/BIP39Generator")),
  "otp-generator": lazyTool(() => import("@/components/tools/OTPGenerator")),
  "basic-auth": lazyTool(() => import("@/components/tools/BasicAuthGen")),

  // Converters
  "roman-numeral": lazyTool(() => import("@/components/tools/RomanNumeral")),
  "base64-file": lazyTool(() => import("@/components/tools/Base64File")),
  "json-to-xml": lazyTool(() => import("@/components/tools/JsonToXml")),
  "xml-to-json": lazyTool(() => import("@/components/tools/XmlToJson")),
  "json-to-csv": lazyTool(() => import("@/components/tools/JsonToCsv")),
  "toml-converter": lazyTool(() => import("@/components/tools/TomlConverter")),

  // Web
  "device-info": lazyTool(() => import("@/components/tools/DeviceInfo")),
  "open-graph-gen": lazyTool(() => import("@/components/tools/OpenGraphGen")),
  "keycode-info": lazyTool(() => import("@/components/tools/KeycodeInfo")),
  "user-agent-parser": lazyTool(() => import("@/components/tools/UserAgentParser")),
  "http-status-codes": lazyTool(() => import("@/components/tools/HttpStatusCodes")),
  "json-diff-viewer": lazyTool(() => import("@/components/tools/JsonDiffViewer")),

  // Images & Videos
  "qr-code-gen": lazyTool(() => import("@/components/tools/QRCodeGen")),
  "wifi-qr-gen": lazyTool(() => import("@/components/tools/WiFiQRGen")),
  "svg-placeholder": lazyTool(() => import("@/components/tools/SVGPlaceholder")),

  // Development
  "git-cheatsheet": lazyTool(() => import("@/components/tools/GitCheatsheet")),
  "port-generator": lazyTool(() => import("@/components/tools/PortGenerator")),
  "crontab-gen": lazyTool(() => import("@/components/tools/CrontabGen")),
  "chmod-calc": lazyTool(() => import("@/components/tools/ChmodCalc")),
  "email-normalizer": lazyTool(() => import("@/components/tools/EmailNormalizer")),

  // Network
  "ipv4-subnet-calc": lazyTool(() => import("@/components/tools/IPv4SubnetCalc")),
  "ipv4-converter": lazyTool(() => import("@/components/tools/IPv4Converter")),
  "ipv6-generator": lazyTool(() => import("@/components/tools/IPv6Generator")),
  "mac-generator": lazyTool(() => import("@/components/tools/MACGenerator")),

  // Math
  "math-evaluator": lazyTool(() => import("@/components/tools/MathEvaluator")),
  "percentage-calc": lazyTool(() => import("@/components/tools/PercentageCalc")),
  "eta-calculator": lazyTool(() => import("@/components/tools/ETACalculator")),

  // Measurement
  "chronometer": lazyTool(() => import("@/components/tools/Chronometer")),
  "temp-converter": lazyTool(() => import("@/components/tools/TempConverter")),

  // Data
  "iban-validator": lazyTool(() => import("@/components/tools/IBANValidator")),
  "phone-formatter": lazyTool(() => import("@/components/tools/PhoneFormatter")),

  // Dev Tools (existing)
  "regex-playground": lazyTool(() => import("@/components/tools/RegexTester")),
  "json-formatter": lazyTool(() => import("@/components/tools/JsonFormatter")),
  "html-cleaner": lazyTool(() => import("@/components/tools/StripHtml")),
  "markdown-formatter": lazyTool(() => import("@/components/tools/MarkdownHtml")),
  "slug-generator": lazyTool(() => import("@/components/tools/Slugify")),
  "keyword-density": lazyTool(() => import("@/components/tools/KeywordDensity")),
  "base64-encode": lazyTool(() => import("@/components/tools/Base64Tool")),
  "hash-generator": lazyTool(() => import("@/components/tools/HashGenerator")),
  "hex-binary": lazyTool(() => import("@/components/tools/HexBinary")),
  "html-entities": lazyTool(() => import("@/components/tools/HtmlEntities")),
  "jwt-decoder": lazyTool(() => import("@/components/tools/JwtDecoder")),
  "morse-code": lazyTool(() => import("@/components/tools/MorseCode")),
  "nato-phonetic": lazyTool(() => import("@/components/tools/NatoPhonetic")),
  "number-base": lazyTool(() => import("@/components/tools/NumberBase")),
  "password-generator": lazyTool(() => import("@/components/tools/PasswordGenerator")),
  "sql-formatter": lazyTool(() => import("@/components/tools/SqlFormatter")),
  "string-escape": lazyTool(() => import("@/components/tools/StringEscape")),
  "timestamp-converter": lazyTool(() => import("@/components/tools/TimestampConverter")),
  "url-encoder": lazyTool(() => import("@/components/tools/UrlEncoder")),
  "url-parser": lazyTool(() => import("@/components/tools/UrlParser")),
  "uuid-generator": lazyTool(() => import("@/components/tools/UuidGenerator")),
  "color-converter": lazyTool(() => import("@/components/tools/ColorConverter")),
  "csv-json": lazyTool(() => import("@/components/tools/CsvJson")),
  "xml-formatter": lazyTool(() => import("@/components/tools/XmlFormatter")),
  "yaml-json": lazyTool(() => import("@/components/tools/YamlJson")),

  // Advanced
  "invisible-char-detector": lazyTool(() => import("@/components/tools/InvisibleCharDetector")),
  "unicode-cleaner": lazyTool(() => import("@/components/tools/UnicodeCleaner")),
  "emoji-manager": lazyTool(() => import("@/components/tools/EmojiManager")),
  "ascii-banner": lazyTool(() => import("@/components/tools/AsciiBanner")),
  "char-frequency": lazyTool(() => import("@/components/tools/CharFrequency")),
  "cipher": lazyTool(() => import("@/components/tools/Cipher")),
  "lorem-ipsum": lazyTool(() => import("@/components/tools/LoremIpsum")),
  "random-picker": lazyTool(() => import("@/components/tools/RandomPicker")),
  "unicode-inspector": lazyTool(() => import("@/components/tools/UnicodeInspector")),
};

export const tools: ToolMeta[] = [
  // ===================== Core Tools =====================
  { slug: "text-tracker-remover", name: "Text Tracker & Remover", tagline: "Search and remove specific words, sentences, or patterns", category: "Core Tools", icon: Search, keywords: ["search","remove","find","track","delete","pattern"] },
  { slug: "text-repeater", name: "Text Repeater", tagline: "Repeat any text with custom separators and output modes", category: "Core Tools", icon: Copy, keywords: ["repeat","duplicate","multiply"] },
  { slug: "symbol-tracker-multiplier", name: "Symbol Tracker & Multiplier", tagline: "Analyze symbol frequency and multiply occurrences", category: "Core Tools", icon: Asterisk, keywords: ["symbol","punctuation","multiply","frequency"] },
  { slug: "symbol-filter-remove", name: "Symbol Filter & Bulk Remove", tagline: "Filter lines by symbol and remove them selectively", category: "Core Tools", icon: Filter, keywords: ["filter","lines","remove","symbol","bulk"] },
  { slug: "global-text-formatter", name: "Global Text Formatter", tagline: "Apply bold, italic, case and other formatting globally", category: "Core Tools", icon: Bold, keywords: ["bold","italic","format","style","unicode"] },

  // ===================== Text Utilities =====================
  { slug: "case-converter", name: "Case Converter", tagline: "Convert between 13 case styles including camel, snake, kebab", category: "Text Utilities", icon: CaseSensitive, keywords: ["case","upper","lower","camel","snake","kebab","title"] },
  { slug: "smart-replace", name: "Smart Replace", tagline: "Advanced multi-pair find and replace with regex support", category: "Text Utilities", icon: Replace, keywords: ["replace","find","substitute","regex","multi"] },
  { slug: "whitespace-cleaner", name: "Whitespace Cleaner", tagline: "Trim, collapse, and normalize whitespace and line endings", category: "Text Utilities", icon: Eraser, keywords: ["trim","whitespace","spaces","tabs"] },
  { slug: "duplicate-remover", name: "Duplicate Remover", tagline: "Remove duplicate lines or duplicate words from text", category: "Text Utilities", icon: Trash2, keywords: ["dedupe","unique","duplicate","words","lines"] },
  { slug: "line-tools", name: "Line Tools", tagline: "Sort, merge, and split lines with multiple strategies", category: "Text Utilities", icon: ListOrdered, keywords: ["sort","merge","split","lines","join"] },
  { slug: "text-compare", name: "Text Compare", tagline: "Diff two texts side-by-side at line or word level", category: "Text Utilities", icon: Diff, keywords: ["diff","compare","text"] },
  { slug: "find-replace", name: "Find & Replace", tagline: "Quick single-pair find and replace with regex support", category: "Text Utilities", icon: Search, keywords: ["find","replace","regex","search"] },
  { slug: "remove-duplicate-lines", name: "Remove Duplicate Lines", tagline: "Remove duplicate lines with case and trim options", category: "Text Utilities", icon: Trash, keywords: ["dedupe","lines","duplicate","remove"] },
  { slug: "reverse-text", name: "Reverse Text", tagline: "Reverse text by characters, words, or entire lines", category: "Text Utilities", icon: Repeat, keywords: ["reverse","mirror","flip","text"] },
  { slug: "sort-lines", name: "Sort Lines", tagline: "Sort lines alphabetically, numerically, by length, or shuffle", category: "Text Utilities", icon: ArrowUpDown, keywords: ["sort","lines","alphabetical","shuffle"] },
  { slug: "text-statistics", name: "Text Statistics", tagline: "Comprehensive stats: chars, words, sentences, reading time", category: "Text Utilities", icon: BarChart3, keywords: ["stats","count","words","characters","reading time"] },
  { slug: "word-frequency", name: "Word Frequency", tagline: "Count word occurrences with frequency distribution", category: "Text Utilities", icon: Hash, keywords: ["word","frequency","count","distribution"] },
  { slug: "word-wrap", name: "Word Wrap", tagline: "Wrap text to a specified line width", category: "Text Utilities", icon: WrapText, keywords: ["wrap","width","line","break"] },
  { slug: "line-numbering", name: "Line Numbering", tagline: "Add line numbers with padding and custom separators", category: "Text Utilities", icon: List, keywords: ["number","lines","padding","line numbers"] },
  { slug: "indent-tool", name: "Indent Tool", tagline: "Add or remove indentation from lines", category: "Text Utilities", icon: IndentIcon, keywords: ["indent","dedent","prefix","whitespace"] },
  { slug: "prefix-suffix", name: "Prefix / Suffix", tagline: "Add or remove prefix and suffix from every line", category: "Text Utilities", icon: OptionIcon, keywords: ["prefix","suffix","add","lines"] },
  { slug: "string-obfuscator", name: "String Obfuscator", tagline: "Obfuscate/deobfuscate text with Base64, ROT13, XOR, and hex", category: "Text Utilities", icon: Unlock, keywords: ["obfuscate","encode","rot13","xor","base64"] },
  { slug: "numeronym-generator", name: "Numeronym Generator", tagline: "Generate numeronyms like i18n from long words", category: "Text Utilities", icon: Hash, keywords: ["numeronym","abbreviation","shorten","i18n"] },
  { slug: "regex-cheatsheet", name: "Regex Cheatsheet", tagline: "Quick reference for regular expression syntax and patterns", category: "Text Utilities", icon: BookOpen, keywords: ["regex","cheatsheet","reference","patterns"] },

  // ===================== Extractors =====================
  { slug: "url-extractor", name: "URL Extractor", tagline: "Extract all URLs from a block of text", category: "Extractors", icon: Link2, keywords: ["url","link","extract"] },
  { slug: "email-extractor", name: "Email Extractor", tagline: "Extract all email addresses from text", category: "Extractors", icon: AtSign, keywords: ["email","extract","address"] },
  { slug: "phone-extractor", name: "Phone Extractor", tagline: "Extract phone numbers in common formats", category: "Extractors", icon: Phone, keywords: ["phone","number","extract"] },
  { slug: "hashtag-extractor", name: "Hashtag Extractor", tagline: "Extract all hashtags from social media text", category: "Extractors", icon: HashIcon, keywords: ["hashtag","social","extract","tag"] },
  { slug: "pattern-extractor", name: "Pattern Extractor", tagline: "Extract emails, URLs, IPs, numbers, dates, and more", category: "Extractors", icon: Search, keywords: ["extract","email","url","ip","pattern"] },

  // ===================== Crypto & Security =====================
  { slug: "bcrypt", name: "Bcrypt Hash", tagline: "Generate and verify bcrypt password hashes", category: "Crypto & Security", icon: Lock, keywords: ["bcrypt","hash","password","salt","verify"] },
  { slug: "encrypt-decrypt", name: "Encrypt/Decrypt", tagline: "AES encrypt and decrypt text with a password", category: "Crypto & Security", icon: Shield, keywords: ["aes","encrypt","decrypt","cipher","password"] },
  { slug: "password-strength", name: "Password Strength", tagline: "Analyze password strength with entropy and feedback", category: "Crypto & Security", icon: ShieldAlert, keywords: ["password","strength","entropy","security","analyze"] },
  { slug: "hmac-generator", name: "HMAC Generator", tagline: "Generate HMAC signatures with SHA algorithms", category: "Crypto & Security", icon: Key, keywords: ["hmac","sha","signature","hash","auth"] },
  { slug: "rsa-generator", name: "RSA Key Generator", tagline: "Generate RSA public/private key pairs", category: "Crypto & Security", icon: Fingerprint, keywords: ["rsa","key","public","private","encryption"] },
  { slug: "token-generator", name: "Token Generator", tagline: "Generate secure random API tokens and keys", category: "Crypto & Security", icon: Key, keywords: ["token","api","key","generate","random"] },
  { slug: "ulid-generator", name: "ULID Generator", tagline: "Generate universally unique lexicographically sortable IDs", category: "Crypto & Security", icon: Fingerprint, keywords: ["ulid","unique","id","generate","sortable"] },
  { slug: "bip39-generator", name: "BIP39 Passphrase", tagline: "Generate BIP39 mnemonic passphrases", category: "Crypto & Security", icon: Lock, keywords: ["bip39","mnemonic","passphrase","wallet","crypto"] },
  { slug: "otp-generator", name: "OTP Generator", tagline: "Generate one-time password codes", category: "Crypto & Security", icon: Shield, keywords: ["otp","one-time","password","code","2fa"] },
  { slug: "basic-auth", name: "Basic Auth Generator", tagline: "Generate Basic Authentication header strings", category: "Crypto & Security", icon: Lock, keywords: ["basic","auth","authorization","header","base64"] },

  // ===================== Converters =====================
  { slug: "roman-numeral", name: "Roman Numeral", tagline: "Convert between numbers and Roman numerals", category: "Converters", icon: Sigma, keywords: ["roman","numeral","convert","number"] },
  { slug: "base64-file", name: "Base64 File", tagline: "Encode files to Base64 or decode Base64 to files", category: "Converters", icon: FileCode2, keywords: ["base64","file","encode","decode","binary"] },
  { slug: "json-to-xml", name: "JSON ↔ XML", tagline: "Convert between JSON and XML formats", category: "Converters", icon: FileJson, keywords: ["json","xml","convert","transform"] },
  { slug: "xml-to-json", name: "XML ↔ JSON", tagline: "Convert XML documents to JSON", category: "Converters", icon: FileCode2, keywords: ["xml","json","parse","convert"] },
  { slug: "json-to-csv", name: "JSON ↔ CSV", tagline: "Convert between JSON arrays and CSV spreadsheets", category: "Converters", icon: TableIcon, keywords: ["json","csv","convert","spreadsheet"] },
  { slug: "toml-converter", name: "TOML Converter", tagline: "Convert between TOML and JSON formats", category: "Converters", icon: FileCode2, keywords: ["toml","json","convert","config"] },

  // ===================== Web =====================
  { slug: "device-info", name: "Device Info", tagline: "Display browser and device information", category: "Web", icon: Smartphone, keywords: ["device","browser","user-agent","screen","platform"] },
  { slug: "open-graph-gen", name: "OG Meta Generator", tagline: "Generate Open Graph meta tags for social sharing", category: "Web", icon: Link2, keywords: ["og","meta","open graph","social","share"] },
  { slug: "keycode-info", name: "Keycode Info", tagline: "Detect and display keyboard keycode information", category: "Web", icon: Code, keywords: ["keycode","keyboard","key","event","detect"] },
  { slug: "user-agent-parser", name: "User-Agent Parser", tagline: "Parse and identify browser/OS from user-agent strings", category: "Web", icon: Globe, keywords: ["user-agent","browser","os","parse","detect"] },
  { slug: "http-status-codes", name: "HTTP Status Codes", tagline: "Reference for all HTTP status codes with descriptions", category: "Web", icon: Activity, keywords: ["http","status","code","response","api"] },
  { slug: "json-diff-viewer", name: "JSON Diff Viewer", tagline: "Compare two JSON objects and highlight differences", category: "Web", icon: Diff, keywords: ["json","diff","compare","difference","object"] },

  // ===================== Images & Videos =====================
  { slug: "qr-code-gen", name: "QR Code Generator", tagline: "Generate QR codes from text or URLs", category: "Images & Videos", icon: QrCode, keywords: ["qr","code","generate","scan","barcode"] },
  { slug: "wifi-qr-gen", name: "WiFi QR Code", tagline: "Generate QR codes for WiFi network access", category: "Images & Videos", icon: Wifi, keywords: ["wifi","qr","network","password","connect"] },
  { slug: "svg-placeholder", name: "SVG Placeholder", tagline: "Generate customizable SVG placeholder images", category: "Images & Videos", icon: Image, keywords: ["svg","placeholder","image","generate","placeholder"] },

  // ===================== Development =====================
  { slug: "git-cheatsheet", name: "Git Cheatsheet", tagline: "Quick reference for common Git commands", category: "Development", icon: GitBranch, keywords: ["git","cheatsheet","reference","commands","version control"] },
  { slug: "port-generator", name: "Port Generator", tagline: "Generate random port numbers with common ports reference", category: "Development", icon: Router, keywords: ["port","network","generate","random","tcp"] },
  { slug: "crontab-gen", name: "Crontab Generator", tagline: "Generate and parse cron schedule expressions", category: "Development", icon: Clock, keywords: ["cron","crontab","schedule","timer","automation"] },
  { slug: "chmod-calc", name: "Chmod Calculator", tagline: "Calculate Unix file permission numeric and symbolic values", category: "Development", icon: Lock, keywords: ["chmod","permissions","unix","linux","file"] },
  { slug: "email-normalizer", name: "Email Normalizer", tagline: "Normalize and validate email addresses", category: "Development", icon: AtSign, keywords: ["email","normalize","validate","gmail","clean"] },

  // ===================== Network =====================
  { slug: "ipv4-subnet-calc", name: "IPv4 Subnet Calculator", tagline: "Calculate subnet masks, network/broadcast addresses, and hosts", category: "Network", icon: Router, keywords: ["ipv4","subnet","cidr","network","calculator"] },
  { slug: "ipv4-converter", name: "IPv4 Converter", tagline: "Convert IPv4 addresses between decimal, hex, binary, and integer", category: "Network", icon: Globe, keywords: ["ipv4","convert","decimal","hex","binary"] },
  { slug: "ipv6-generator", name: "IPv6 ULA Generator", tagline: "Generate random IPv6 Unique Local Addresses", category: "Network", icon: Globe, keywords: ["ipv6","ula","address","generate","local"] },
  { slug: "mac-generator", name: "MAC Generator", tagline: "Generate random MAC addresses in multiple formats", category: "Network", icon: Router, keywords: ["mac","address","generate","random","network"] },

  // ===================== Math =====================
  { slug: "math-evaluator", name: "Math Evaluator", tagline: "Evaluate mathematical expressions with advanced functions", category: "Math", icon: Sigma, keywords: ["math","evaluate","expression","calculator","functions"] },
  { slug: "percentage-calc", name: "Percentage Calculator", tagline: "Calculate percentages, increases, and decreases", category: "Math", icon: BarChart3, keywords: ["percentage","percent","calculate","increase","decrease"] },
  { slug: "eta-calculator", name: "ETA Calculator", tagline: "Calculate estimated time of arrival from distance and speed", category: "Math", icon: Clock, keywords: ["eta","time","distance","speed","arrival"] },

  // ===================== Measurement =====================
  { slug: "chronometer", name: "Chronometer", tagline: "Precision stopwatch with lap timing", category: "Measurement", icon: Timer, keywords: ["chronometer","stopwatch","timer","lap","precision"] },
  { slug: "temp-converter", name: "Temperature Converter", tagline: "Convert between Celsius, Fahrenheit, and Kelvin", category: "Measurement", icon: Thermometer, keywords: ["temperature","celsius","fahrenheit","kelvin","convert"] },

  // ===================== Data =====================
  { slug: "iban-validator", name: "IBAN Validator", tagline: "Validate and parse International Bank Account Numbers", category: "Data", icon: CreditCard, keywords: ["iban","bank","account","validate","parse"] },
  { slug: "phone-formatter", name: "Phone Formatter", tagline: "Parse and format phone numbers in multiple styles", category: "Data", icon: Phone, keywords: ["phone","format","parse","country","number"] },

  // ===================== Dev Tools =====================
  { slug: "regex-playground", name: "Regex Playground", tagline: "Build, test, and debug regular expressions live", category: "Dev Tools", icon: Regex, keywords: ["regex","pattern","match","test"] },
  { slug: "json-formatter", name: "JSON Formatter", tagline: "Prettify, minify, and validate JSON with error location", category: "Dev Tools", icon: FileJson, keywords: ["json","format","pretty","minify"] },
  { slug: "html-cleaner", name: "HTML Cleaner", tagline: "Strip tags, decode entities, and sanitize HTML", category: "Dev Tools", icon: FileCode2, keywords: ["html","strip","tags","sanitize"] },
  { slug: "markdown-formatter", name: "Markdown Formatter", tagline: "Format markdown and preview the rendered output", category: "Dev Tools", icon: Hash, keywords: ["markdown","md","format","preview"] },
  { slug: "slug-generator", name: "Slug Generator", tagline: "Generate clean URL slugs from titles and phrases", category: "Dev Tools", icon: Link2, keywords: ["slug","url","seo"] },
  { slug: "keyword-density", name: "Keyword Density", tagline: "Analyze keyword frequency and density percentages", category: "Dev Tools", icon: BarChart3, keywords: ["keyword","density","seo","frequency"] },
  { slug: "base64-encode", name: "Base64 Encode/Decode", tagline: "Encode and decode Base64 text", category: "Dev Tools", icon: Shield, keywords: ["base64","encode","decode","binary"] },
  { slug: "hash-generator", name: "Hash Generator", tagline: "Generate SHA-1, SHA-256, SHA-384, SHA-512 hashes", category: "Dev Tools", icon: Fingerprint, keywords: ["hash","sha","sha256","sha512","digest"] },
  { slug: "hex-binary", name: "Hex / Binary", tagline: "Convert between text, hex, and binary representations", category: "Dev Tools", icon: Binary, keywords: ["hex","binary","convert","base"] },
  { slug: "html-entities", name: "HTML Entities", tagline: "Encode and decode HTML entities", category: "Dev Tools", icon: FileCode2, keywords: ["html","entities","encode","decode"] },
  { slug: "jwt-decoder", name: "JWT Decoder", tagline: "Decode JWT tokens and inspect header/payload/signature", category: "Dev Tools", icon: Shield, keywords: ["jwt","token","decode","header","payload"] },
  { slug: "morse-code", name: "Morse Code", tagline: "Convert text to and from Morse code", category: "Dev Tools", icon: Radio, keywords: ["morse","code","encode","decode"] },
  { slug: "nato-phonetic", name: "NATO Phonetic", tagline: "Convert text to NATO phonetic alphabet", category: "Dev Tools", icon: Ear, keywords: ["nato","phonetic","military","spell"] },
  { slug: "number-base", name: "Number Base", tagline: "Convert numbers between binary, octal, decimal, hex", category: "Dev Tools", icon: Sigma, keywords: ["base","binary","octal","decimal","hexadecimal"] },
  { slug: "password-generator", name: "Password Generator", tagline: "Generate secure random passwords", category: "Dev Tools", icon: Lock, keywords: ["password","generate","secure","random"] },
  { slug: "sql-formatter", name: "SQL Formatter", tagline: "Format SQL queries for readability", category: "Dev Tools", icon: Database, keywords: ["sql","format","query","pretty"] },
  { slug: "string-escape", name: "String Escape", tagline: "Escape and unescape JSON, JS, SQL, and Unicode strings", category: "Dev Tools", icon: Quote, keywords: ["escape","unescape","json","unicode"] },
  { slug: "timestamp-converter", name: "Timestamp Converter", tagline: "Convert between Unix timestamps and human-readable dates", category: "Dev Tools", icon: Clock, keywords: ["timestamp","unix","epoch","date","convert"] },
  { slug: "url-encoder", name: "URL Encoder/Decoder", tagline: "Encode and decode URL components", category: "Dev Tools", icon: Globe, keywords: ["url","encode","decode","percent"] },
  { slug: "url-parser", name: "URL Parser", tagline: "Parse URLs into protocol, host, path, query parameters", category: "Dev Tools", icon: Search, keywords: ["url","parse","query","params"] },
  { slug: "uuid-generator", name: "UUID Generator", tagline: "Generate UUID v4 identifiers", category: "Dev Tools", icon: Fingerprint, keywords: ["uuid","guid","generate","unique"] },
  { slug: "color-converter", name: "Color Converter", tagline: "Convert between hex, RGB, RGBA, HSL, HSLA color formats", category: "Dev Tools", icon: Palette, keywords: ["color","hex","rgb","hsl","convert"] },
  { slug: "csv-json", name: "CSV ↔ JSON", tagline: "Convert between CSV and JSON formats", category: "Dev Tools", icon: TableIcon, keywords: ["csv","json","convert","spreadsheet"] },
  { slug: "xml-formatter", name: "XML Formatter", tagline: "Pretty-print and format XML documents", category: "Dev Tools", icon: FileCode2, keywords: ["xml","format","pretty","indent"] },
  { slug: "yaml-json", name: "YAML ↔ JSON", tagline: "Convert between YAML and JSON formats", category: "Dev Tools", icon: FileJson, keywords: ["yaml","json","convert","config"] },

  // ===================== Advanced =====================
  { slug: "invisible-char-detector", name: "Invisible Character Detector", tagline: "Detect and remove zero-width and hidden characters", category: "Advanced", icon: ShieldAlert, keywords: ["invisible","zero-width","hidden","zwsp","bom"] },
  { slug: "unicode-cleaner", name: "Unicode Cleaner", tagline: "Normalize, transliterate, and clean Unicode text", category: "Advanced", icon: Languages, keywords: ["unicode","normalize","nfc","nfkc","transliterate"] },
  { slug: "emoji-manager", name: "Emoji Manager", tagline: "Detect, remove, replace, and extract emojis from text", category: "Advanced", icon: Smile, keywords: ["emoji","detect","remove","extract"] },
  { slug: "ascii-banner", name: "ASCII Banner", tagline: "Generate ASCII art banners from text", category: "Advanced", icon: Type, keywords: ["ascii","banner","art","text"] },
  { slug: "char-frequency", name: "Character Frequency", tagline: "Analyze character frequency distribution with bar chart", category: "Advanced", icon: BarChart3, keywords: ["character","frequency","distribution","chart"] },
  { slug: "cipher", name: "Cipher", tagline: "Encode and decode Caesar, ROT13, and Atbash ciphers", category: "Advanced", icon: Key, keywords: ["cipher","caesar","rot13","atbash","encode"] },
  { slug: "lorem-ipsum", name: "Lorem Ipsum Generator", tagline: "Generate Lorem Ipsum placeholder text", category: "Advanced", icon: FileText, keywords: ["lorem","ipsum","placeholder","generate"] },
  { slug: "random-picker", name: "Random Picker", tagline: "Pick random items from a list", category: "Advanced", icon: Shuffle, keywords: ["random","pick","choose","select"] },
  { slug: "unicode-inspector", name: "Unicode Inspector", tagline: "Inspect Unicode codepoints, graphemes, and properties", category: "Advanced", icon: Eye, keywords: ["unicode","codepoint","grapheme","inspect"] },
];

export const categories: ToolCategory[] = [
  "Core Tools",
  "Text Utilities",
  "Extractors",
  "Crypto & Security",
  "Converters",
  "Web",
  "Images & Videos",
  "Development",
  "Network",
  "Math",
  "Measurement",
  "Data",
  "Dev Tools",
  "Advanced",
];

export function getTool(slug: string): ToolMeta | undefined {
  return tools.find((t) => t.slug === slug);
}
