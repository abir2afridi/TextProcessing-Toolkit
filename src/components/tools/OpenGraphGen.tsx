import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const typeOptions: { value: string; label: string }[] = [
  { value: "website", label: "Website" },
  { value: "article", label: "Article" },
  { value: "book", label: "Book" },
  { value: "profile", label: "Profile" },
  { value: "music.song", label: "Music: Song" },
  { value: "video.movie", label: "Video: Movie" },
];

const twitterCardOptions = [
  { value: "summary_large_image", label: "Summary with large image" },
  { value: "summary", label: "Summary" },
  { value: "app", label: "Application" },
  { value: "player", label: "Player" },
];

function escAttr(s: string) {
  return s.replace(/"/g, "&quot;");
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Label className="w-[110px] flex-shrink-0 font-mono text-[11px] text-muted-foreground">{label}</Label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-7 flex-1 rounded-sm font-mono text-xs"
      />
    </div>
  );
}

function Section({ name, children }: { name: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <div className="mb-1.5 font-mono text-[11px] font-semibold text-foreground">{name}</div>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

export default function OpenGraphGen() {
  const [title, setTitle] = useState("My Page Title");
  const [desc, setDesc] = useState("A brief description of the page");
  const [url, setUrl] = useState("https://example.com");
  const [siteName, setSiteName] = useState("Example Site");
  const [locale, setLocale] = useState("en_US");

  const [image, setImage] = useState("https://example.com/image.png");
  const [imageAlt, setImageAlt] = useState("");
  const [imageWidth, setImageWidth] = useState("");
  const [imageHeight, setImageHeight] = useState("");

  const [type, setType] = useState("website");

  const [twitterCard, setTwitterCard] = useState("summary_large_image");
  const [twitterSite, setTwitterSite] = useState("");
  const [twitterCreator, setTwitterCreator] = useState("");

  const [articleAuthor, setArticleAuthor] = useState("");
  const [articleSection, setArticleSection] = useState("");
  const [articlePublished, setArticlePublished] = useState("");

  const [bookAuthor, setBookAuthor] = useState("");
  const [bookIsbn, setIsbn] = useState("");

  const [profileFirstName, setProfileFirstName] = useState("");
  const [profileLastName, setProfileLastName] = useState("");
  const [profileUsername, setProfileUsername] = useState("");

  const output = useMemo(() => {
    const tags: string[] = [];
    const add = (p: string, c: string) => tags.push(`<meta property="${p}" content="${escAttr(c)}" />`);

    if (title) add("og:title", title);
    if (desc) add("og:description", desc);
    if (url) add("og:url", url);
    if (image) add("og:image", image);
    if (imageAlt) add("og:image:alt", imageAlt);
    if (imageWidth) add("og:image:width", imageWidth);
    if (imageHeight) add("og:image:height", imageHeight);
    if (type) add("og:type", type);
    if (siteName) add("og:site_name", siteName);
    if (locale) add("og:locale", locale);

    if (type === "article") {
      if (articleAuthor) add("article:author", articleAuthor);
      if (articleSection) add("article:section", articleSection);
      if (articlePublished) add("article:published_time", articlePublished);
    }
    if (type === "book") {
      if (bookAuthor) add("book:author", bookAuthor);
      if (bookIsbn) add("book:isbn", bookIsbn);
    }
    if (type === "profile") {
      if (profileFirstName) add("profile:first_name", profileFirstName);
      if (profileLastName) add("profile:last_name", profileLastName);
      if (profileUsername) add("profile:username", profileUsername);
    }

    if (twitterSite) add("twitter:site", twitterSite);
    if (twitterCreator) add("twitter:creator", twitterCreator);
    if (twitterCard) add("twitter:card", twitterCard);
    if (title) add("twitter:title", title);
    if (desc) add("twitter:description", desc);
    if (image) add("twitter:image", image);

    return tags.join("\n");
  }, [
    title, desc, url, image, imageAlt, imageWidth, imageHeight, type, siteName, locale,
    twitterCard, twitterSite, twitterCreator,
    articleAuthor, articleSection, articlePublished,
    bookAuthor, bookIsbn,
    profileFirstName, profileLastName, profileUsername,
  ]);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-4 rounded-sm border border-border bg-surface p-4">
        <Section name="Website">
          <Field label="Title" value={title} onChange={setTitle} placeholder="My Page Title" />
          <Field label="Description" value={desc} onChange={setDesc} placeholder="A brief description" />
          <Field label="Page URL" value={url} onChange={setUrl} placeholder="https://example.com" />
          <Field label="Site name" value={siteName} onChange={setSiteName} placeholder="Example Site" />
          <Field label="Locale" value={locale} onChange={setLocale} placeholder="en_US" />
        </Section>

        <Section name="Image">
          <Field label="Image URL" value={image} onChange={setImage} placeholder="https://example.com/image.png" />
          <Field label="Image alt" value={imageAlt} onChange={setImageAlt} placeholder="Alt text" />
          <Field label="Width" value={imageWidth} onChange={setImageWidth} placeholder="1200" />
          <Field label="Height" value={imageHeight} onChange={setImageHeight} placeholder="630" />
        </Section>

        <Section name="Twitter">
          <div className="flex items-center gap-2">
            <Label className="w-[110px] flex-shrink-0 font-mono text-[11px] text-muted-foreground">Card type</Label>
            <select
              value={twitterCard}
              onChange={(e) => setTwitterCard(e.target.value)}
              className="h-7 flex-1 rounded-sm border border-border bg-background px-2 font-mono text-xs text-foreground outline-none"
            >
              {twitterCardOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <Field label="Site account" value={twitterSite} onChange={setTwitterSite} placeholder="@username" />
          <Field label="Creator account" value={twitterCreator} onChange={setTwitterCreator} placeholder="@creator" />
        </Section>

        <Section name="Type">
          <div className="flex items-center gap-2">
            <Label className="w-[110px] flex-shrink-0 font-mono text-[11px] text-muted-foreground">Content type</Label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="h-7 flex-1 rounded-sm border border-border bg-background px-2 font-mono text-xs text-foreground outline-none"
            >
              {typeOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {type === "article" && (
            <div className="mt-3 space-y-1.5 border-t border-border pt-3">
              <Field label="Author" value={articleAuthor} onChange={setArticleAuthor} placeholder="Author URL" />
              <Field label="Section" value={articleSection} onChange={setArticleSection} placeholder="Technology" />
              <Field label="Published" value={articlePublished} onChange={setArticlePublished} placeholder="2024-01-01T00:00:00Z" />
            </div>
          )}
          {type === "book" && (
            <div className="mt-3 space-y-1.5 border-t border-border pt-3">
              <Field label="Author" value={bookAuthor} onChange={setBookAuthor} placeholder="Author URL" />
              <Field label="ISBN" value={bookIsbn} onChange={setIsbn} placeholder="978-3-16-148410-0" />
            </div>
          )}
          {type === "profile" && (
            <div className="mt-3 space-y-1.5 border-t border-border pt-3">
              <Field label="First name" value={profileFirstName} onChange={setProfileFirstName} />
              <Field label="Last name" value={profileLastName} onChange={setProfileLastName} />
              <Field label="Username" value={profileUsername} onChange={setProfileUsername} />
            </div>
          )}
        </Section>
      </div>

      <div className="rounded-sm border border-border bg-surface p-4">
        <div className="mb-2 font-mono text-[11px] font-semibold text-muted-foreground">Your meta tags</div>
        <pre className="mb-3 max-h-[500px] overflow-auto rounded-sm border border-border bg-background p-3 font-mono text-[11px] text-foreground">
          <code>{output}</code>
        </pre>
        <div className="flex justify-center">
          <Button
            size="sm"
            disabled={!output}
            onClick={() => {
              navigator.clipboard.writeText(output);
              toast.success("Meta tags copied to the clipboard");
            }}
            className="h-8 rounded-sm font-mono text-xs"
          >
            Copy meta tags
          </Button>
        </div>
      </div>
    </div>
  );
}
