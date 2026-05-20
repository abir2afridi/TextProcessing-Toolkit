import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OptionRow } from "@/components/ToolShell";

const COUNTRY_CODES: Record<string, string> = {
  "1": "US/CA", "7": "RU", "20": "EG", "27": "ZA", "30": "GR", "31": "NL", "32": "BE",
  "33": "FR", "34": "ES", "36": "HU", "39": "IT", "40": "RO", "41": "CH", "43": "AT",
  "44": "GB", "45": "DK", "46": "SE", "47": "NO", "48": "PL", "49": "DE", "51": "PE",
  "52": "MX", "53": "CU", "54": "AR", "55": "BR", "56": "CL", "57": "CO", "58": "VE",
  "60": "MY", "61": "AU", "62": "ID", "63": "PH", "64": "NZ", "65": "SG", "66": "TH",
  "81": "JP", "82": "KR", "84": "VN", "86": "CN", "90": "TR", "91": "IN", "92": "PK",
  "93": "AF", "94": "LK", "95": "MM", "98": "IR", "211": "SS", "212": "MA", "213": "DZ",
  "216": "TN", "217": "LY", "218": "LY", "220": "GM", "221": "SN", "222": "MR", "223": "ML",
  "224": "GN", "225": "CI", "226": "BF", "227": "NE", "228": "TG", "229": "BJ", "230": "MU",
  "231": "LR", "232": "SL", "233": "GH", "234": "NG", "235": "TD", "236": "CF", "237": "CM",
  "238": "CV", "239": "ST", "240": "GQ", "241": "GA", "242": "CG", "243": "CD", "244": "AO",
  "245": "GW", "246": "IO", "247": "AC", "248": "SC", "249": "SD", "250": "RW", "251": "ET",
  "252": "SO", "253": "DJ", "254": "KE", "255": "TZ", "256": "UG", "257": "BI", "258": "MZ",
  "260": "ZM", "261": "MG", "262": "RE", "263": "ZW", "264": "NA", "265": "MW", "266": "LS",
  "267": "BW", "268": "SZ", "269": "KM", "290": "SH", "291": "ER", "297": "AW", "298": "FO",
  "299": "GL", "350": "GI", "351": "PT", "352": "LU", "353": "IE", "354": "IS", "355": "AL",
  "356": "MT", "357": "CY", "358": "FI", "359": "BG", "370": "LT", "371": "LV", "372": "EE",
  "373": "MD", "374": "AM", "375": "BY", "376": "AD", "377": "MC", "378": "SM", "379": "VA",
  "380": "UA", "381": "RS", "382": "ME", "385": "HR", "386": "SI", "387": "BA", "389": "MK",
  "420": "CZ", "421": "SK", "423": "LI", "500": "FK", "501": "BZ", "502": "GT", "503": "SV",
  "504": "HN", "505": "NI", "506": "CR", "507": "PA", "508": "PM", "509": "HT", "590": "GP",
  "591": "BO", "592": "GY", "593": "EC", "594": "GF", "595": "PY", "596": "MQ", "597": "SR",
  "598": "UY", "599": "CW", "670": "TL", "672": "NF", "673": "BN", "674": "NR", "675": "PG",
  "676": "TO", "677": "SB", "678": "VU", "679": "FJ", "680": "PW", "681": "WF", "682": "CK",
  "683": "NU", "685": "WS", "686": "KI", "687": "NC", "688": "TV", "689": "PF", "690": "TK",
  "691": "FM", "692": "MH", "800": "XG", "808": "XS", "850": "KP", "852": "HK", "853": "MO",
  "855": "KH", "856": "LA", "870": "XN", "880": "BD", "881": "XG", "882": "XN", "883": "XN",
  "886": "TW", "960": "MV", "961": "LB", "962": "JO", "963": "SY", "964": "IQ", "965": "KW",
  "966": "SA", "967": "YE", "968": "OM", "970": "PS", "971": "AE", "972": "IL", "973": "BH",
  "974": "QA", "975": "BT", "976": "MN", "977": "NP", "979": "XR", "991": "XJ", "992": "TJ",
  "993": "TM", "994": "AZ", "995": "GE", "996": "KG", "997": "KZ", "998": "UZ",
};

function parsePhone(s: string) {
  const digits = s.replace(/[^0-9]/g, "");
  if (!digits) return { error: "No digits found" };
  let cc = "";
  let countryName = "";
  for (const [code, name] of Object.entries(COUNTRY_CODES).sort((a, b) => b[0].length - a[0].length)) {
    if (digits.startsWith(code)) {
      cc = code;
      countryName = name;
      break;
    }
  }
  if (!cc) {
    if (digits.length <= 15) return { e164: "+" + digits, international: "+" + digits, national: digits, cc: "", countryName: "Unknown" };
    return { error: "Could not parse phone number" };
  }
  const national = digits.slice(cc.length);
  const e164 = "+" + cc + national;
  const international = "+" + cc + " " + national.replace(/.{3,4}/g, "$& ").trim();
  const nationalFormatted = national.replace(/.{3,4}/g, "$& ").trim();
  return {
    cc: "+" + cc,
    countryName,
    national,
    e164,
    international,
    nationalFormatted,
  };
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm border border-border bg-surface p-3">
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 break-all font-mono text-sm text-primary">{value}</div>
    </div>
  );
}

export default function PhoneFormatter() {
  const [input, setInput] = useState("+14155552671");
  const result = useMemo(() => {
    try { return parsePhone(input); }
    catch (e) { return { error: (e as Error).message }; }
  }, [input]);

  return (
    <div className="space-y-4">
      <OptionRow>
        <div className="flex flex-1 items-center gap-2">
          <Label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Phone</Label>
          <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="+14155552671" className="h-8 flex-1 rounded-sm font-mono text-xs" />
        </div>
      </OptionRow>
      {"error" in result ? (
        <div className="rounded-sm border border-destructive/40 bg-destructive/10 px-3 py-2 font-mono text-xs text-destructive">{result.error}</div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Card label="Country Code" value={result.cc || "—"} />
          <Card label="Country" value={result.countryName || "—"} />
          <Card label="National Number" value={result.national || "—"} />
          <Card label="E.164" value={result.e164 || "—"} />
          <Card label="International" value={result.international || "—"} />
          <Card label="National Format" value={result.nationalFormatted || "—"} />
        </div>
      )}
    </div>
  );
}
