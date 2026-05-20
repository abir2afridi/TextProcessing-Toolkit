import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { OptionRow } from "@/components/ToolShell";

const statusCodes: { code: number; name: string; description: string; category: string }[] = [
  { code: 100, name: "Continue", description: "Server has received the request headers and the client should proceed.", category: "1xx" },
  { code: 101, name: "Switching Protocols", description: "Server is switching protocols as requested.", category: "1xx" },
  { code: 102, name: "Processing", description: "Server has received and is processing the request.", category: "1xx" },
  { code: 103, name: "Early Hints", description: "Used to return some response headers before final HTTP message.", category: "1xx" },
  { code: 200, name: "OK", description: "Standard successful HTTP response.", category: "2xx" },
  { code: 201, name: "Created", description: "Request has been fulfilled and a new resource has been created.", category: "2xx" },
  { code: 202, name: "Accepted", description: "Request has been accepted for processing but not yet completed.", category: "2xx" },
  { code: 203, name: "Non-Authoritative Information", description: "Returned meta-information is from a cached copy.", category: "2xx" },
  { code: 204, name: "No Content", description: "Server successfully processed the request but returns no content.", category: "2xx" },
  { code: 205, name: "Reset Content", description: "Tells the user agent to reset the document which sent this request.", category: "2xx" },
  { code: 206, name: "Partial Content", description: "Server is delivering only part of the resource.", category: "2xx" },
  { code: 207, name: "Multi-Status", description: "Provides status for multiple independent operations.", category: "2xx" },
  { code: 208, name: "Already Reported", description: "Results of a previous enumeration were already reported.", category: "2xx" },
  { code: 226, name: "IM Used", description: "Server has fulfilled a GET request for the resource.", category: "2xx" },
  { code: 300, name: "Multiple Choices", description: "Multiple options for the resource that the client may follow.", category: "3xx" },
  { code: 301, name: "Moved Permanently", description: "Resource has been permanently moved to a new URL.", category: "3xx" },
  { code: 302, name: "Found", description: "Resource has been temporarily moved.", category: "3xx" },
  { code: 303, name: "See Other", description: "Response can be found at another URI using GET.", category: "3xx" },
  { code: 304, name: "Not Modified", description: "Resource has not been modified since the last request.", category: "3xx" },
  { code: 305, name: "Use Proxy", description: "Requested resource must be accessed through a proxy.", category: "3xx" },
  { code: 307, name: "Temporary Redirect", description: "Resource is temporarily available at a different URI.", category: "3xx" },
  { code: 308, name: "Permanent Redirect", description: "Resource has been permanently moved to a new URI.", category: "3xx" },
  { code: 400, name: "Bad Request", description: "Server cannot process the request due to a client error.", category: "4xx" },
  { code: 401, name: "Unauthorized", description: "Authentication is required and has failed or not been provided.", category: "4xx" },
  { code: 402, name: "Payment Required", description: "Reserved for future use.", category: "4xx" },
  { code: 403, name: "Forbidden", description: "Server understood the request but refuses to authorize it.", category: "4xx" },
  { code: 404, name: "Not Found", description: "Requested resource could not be found.", category: "4xx" },
  { code: 405, name: "Method Not Allowed", description: "Request method is not supported for the resource.", category: "4xx" },
  { code: 406, name: "Not Acceptable", description: "Server cannot produce a response matching the accept headers.", category: "4xx" },
  { code: 407, name: "Proxy Authentication Required", description: "Client must authenticate with a proxy first.", category: "4xx" },
  { code: 408, name: "Request Timeout", description: "Server timed out waiting for the request.", category: "4xx" },
  { code: 409, name: "Conflict", description: "Request conflicts with the current state of the resource.", category: "4xx" },
  { code: 410, name: "Gone", description: "Resource is no longer available and no forwarding address is known.", category: "4xx" },
  { code: 411, name: "Length Required", description: "Content-Length header is required.", category: "4xx" },
  { code: 412, name: "Precondition Failed", description: "Server does not meet preconditions in the request headers.", category: "4xx" },
  { code: 413, name: "Payload Too Large", description: "Request entity is larger than the server is willing to process.", category: "4xx" },
  { code: 414, name: "URI Too Long", description: "URI is longer than the server is willing to interpret.", category: "4xx" },
  { code: 415, name: "Unsupported Media Type", description: "Media format is not supported by the server.", category: "4xx" },
  { code: 416, name: "Range Not Satisfiable", description: "Range specified in the Range header cannot be fulfilled.", category: "4xx" },
  { code: 417, name: "Expectation Failed", description: "Expectation given in the Expect header cannot be met.", category: "4xx" },
  { code: 418, name: "I'm a Teapot", description: "HTCPCP server is a teapot (RFC 2324).", category: "4xx" },
  { code: 421, name: "Misdirected Request", description: "Request was directed at a server that cannot produce a response.", category: "4xx" },
  { code: 422, name: "Unprocessable Content", description: "Request was well-formed but unable to be followed.", category: "4xx" },
  { code: 423, name: "Locked", description: "Resource being accessed is locked.", category: "4xx" },
  { code: 424, name: "Failed Dependency", description: "Request failed because it depended on another failed request.", category: "4xx" },
  { code: 425, name: "Too Early", description: "Server is unwilling to risk processing a replay attack.", category: "4xx" },
  { code: 426, name: "Upgrade Required", description: "Client should switch to a different protocol.", category: "4xx" },
  { code: 428, name: "Precondition Required", description: "Origin server requires the request to be conditional.", category: "4xx" },
  { code: 429, name: "Too Many Requests", description: "User has sent too many requests in a given amount of time.", category: "4xx" },
  { code: 431, name: "Request Header Fields Too Large", description: "Server is unwilling to process the request headers are too large.", category: "4xx" },
  { code: 451, name: "Unavailable For Legal Reasons", description: "Resource is unavailable due to legal demands.", category: "4xx" },
  { code: 500, name: "Internal Server Error", description: "Generic server error.", category: "5xx" },
  { code: 501, name: "Not Implemented", description: "Server does not support the functionality required.", category: "5xx" },
  { code: 502, name: "Bad Gateway", description: "Server received an invalid response from an upstream server.", category: "5xx" },
  { code: 503, name: "Service Unavailable", description: "Server is temporarily unavailable.", category: "5xx" },
  { code: 504, name: "Gateway Timeout", description: "Server did not receive a timely response from an upstream server.", category: "5xx" },
  { code: 505, name: "HTTP Version Not Supported", description: "HTTP protocol version used is not supported.", category: "5xx" },
  { code: 506, name: "Variant Also Negotiates", description: "Server has an internal configuration error.", category: "5xx" },
  { code: 507, name: "Insufficient Storage", description: "Server is unable to store the representation.", category: "5xx" },
  { code: 508, name: "Loop Detected", description: "Server detected an infinite loop while processing the request.", category: "5xx" },
  { code: 510, name: "Not Extended", description: "Further extensions to the request are required.", category: "5xx" },
  { code: 511, name: "Network Authentication Required", description: "Client needs to authenticate to gain network access.", category: "5xx" },
];

const categories = ["1xx", "2xx", "3xx", "4xx", "5xx"];

const catColors: Record<string, string> = {
  "1xx": "border-l-info",
  "2xx": "border-l-primary",
  "3xx": "border-l-warning",
  "4xx": "border-l-destructive/60",
  "5xx": "border-l-destructive",
};

export default function HttpStatusCodes() {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search) return statusCodes;
    const q = search.toLowerCase();
    return statusCodes.filter(
      (s) => s.code.toString().includes(q) || s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q),
    );
  }, [search]);

  return (
    <div className="space-y-4">
      <OptionRow>
        <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          search
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Code, name, or description..."
            className="h-7 w-full max-w-xs rounded-sm border border-border bg-background px-2 font-mono text-xs text-foreground outline-none placeholder:text-muted-foreground/40 sm:w-72"
          />
        </div>
        <span className="font-mono text-[11px] text-muted-foreground">{filtered.length} codes</span>
      </OptionRow>
      {categories.map((cat) => {
        const items = filtered.filter((s) => s.category === cat);
        if (!items.length) return null;
        return (
          <div key={cat} className="rounded-sm border border-border bg-surface">
            <div className="border-b border-border px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {cat} – {cat === "1xx" ? "Informational" : cat === "2xx" ? "Successful" : cat === "3xx" ? "Redirection" : cat === "4xx" ? "Client Errors" : "Server Errors"}
            </div>
            <div className="divide-y divide-border">
              {items.map((s) => (
                <div key={s.code} className={`grid grid-cols-[3rem_1fr] gap-x-3 gap-y-0.5 border-l-2 px-3 py-2 sm:grid-cols-[3rem_12rem_1fr] ${catColors[cat] || "border-l-border"}`}>
                  <span className="font-mono text-xs font-bold text-foreground">{s.code}</span>
                  <span className="font-mono text-xs text-foreground sm:col-span-1">{s.name}</span>
                  <span className="col-span-2 font-mono text-xs text-muted-foreground sm:col-span-1">{s.description}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
