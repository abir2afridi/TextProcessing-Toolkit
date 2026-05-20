import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface Item {
  cmd: string;
  desc: string;
  example: string;
}
interface Section {
  title: string;
  items: Item[];
}

const sections: Section[] = [
  {
    title: "Init / Clone",
    items: [
      { cmd: "git init", desc: "Initialize a new repository", example: "git init my-project" },
      { cmd: "git clone", desc: "Clone a remote repository", example: "git clone https://github.com/user/repo.git" },
      { cmd: "git remote add", desc: "Add a remote", example: "git remote add origin https://github.com/user/repo.git" },
      { cmd: "git remote -v", desc: "List remotes", example: "git remote -v" },
    ],
  },
  {
    title: "Branch",
    items: [
      { cmd: "git branch", desc: "List branches", example: "git branch" },
      { cmd: "git branch <name>", desc: "Create a branch", example: "git branch feature-x" },
      { cmd: "git checkout <name>", desc: "Switch to branch", example: "git checkout main" },
      { cmd: "git checkout -b <name>", desc: "Create and switch", example: "git checkout -b feature-x" },
      { cmd: "git switch <name>", desc: "Switch branch (new)", example: "git switch main" },
      { cmd: "git switch -c <name>", desc: "Create and switch", example: "git switch -c feature-x" },
      { cmd: "git branch -d <name>", desc: "Delete branch", example: "git branch -d old-branch" },
      { cmd: "git branch -D <name>", desc: "Force delete branch", example: "git branch -D unwanted" },
      { cmd: "git merge <name>", desc: "Merge branch into current", example: "git merge feature-x" },
    ],
  },
  {
    title: "Commit",
    items: [
      { cmd: "git add <file>", desc: "Stage a file", example: "git add src/index.ts" },
      { cmd: "git add .", desc: "Stage all changes", example: "git add ." },
      { cmd: "git commit -m", desc: "Commit with message", example: "git commit -m 'fix: typo'" },
      { cmd: "git commit -am", desc: "Add+commit tracked files", example: "git commit -am 'update'" },
      { cmd: "git commit --amend", desc: "Amend last commit", example: "git commit --amend -m 'new msg'" },
      { cmd: "git status", desc: "Show working tree status", example: "git status" },
    ],
  },
  {
    title: "Push / Pull",
    items: [
      { cmd: "git push", desc: "Push to remote", example: "git push origin main" },
      { cmd: "git push -u <remote> <branch>", desc: "Set upstream and push", example: "git push -u origin main" },
      { cmd: "git push --force", desc: "Force push (careful!)", example: "git push --force" },
      { cmd: "git pull", desc: "Pull from remote", example: "git pull origin main" },
      { cmd: "git fetch", desc: "Fetch without merging", example: "git fetch origin" },
    ],
  },
  {
    title: "Merge / Rebase",
    items: [
      { cmd: "git merge <branch>", desc: "Merge branch", example: "git merge feature-x" },
      { cmd: "git merge --abort", desc: "Abort a merge", example: "git merge --abort" },
      { cmd: "git rebase <branch>", desc: "Rebase onto branch", example: "git rebase main" },
      { cmd: "git rebase -i HEAD~n", desc: "Interactive rebase", example: "git rebase -i HEAD~3" },
      { cmd: "git rebase --abort", desc: "Abort a rebase", example: "git rebase --abort" },
      { cmd: "git rebase --continue", desc: "Continue after resolving", example: "git rebase --continue" },
    ],
  },
  {
    title: "Stash",
    items: [
      { cmd: "git stash", desc: "Stash working changes", example: "git stash" },
      { cmd: "git stash pop", desc: "Apply and drop stash", example: "git stash pop" },
      { cmd: "git stash list", desc: "List stashes", example: "git stash list" },
      { cmd: "git stash apply", desc: "Apply without dropping", example: "git stash apply stash@{0}" },
      { cmd: "git stash drop", desc: "Drop a stash", example: "git stash drop stash@{0}" },
      { cmd: "git stash clear", desc: "Clear all stashes", example: "git stash clear" },
    ],
  },
  {
    title: "Reset",
    items: [
      { cmd: "git reset <file>", desc: "Unstage a file", example: "git reset src/index.ts" },
      { cmd: "git reset --soft HEAD~1", desc: "Undo commit, keep changes", example: "git reset --soft HEAD~1" },
      { cmd: "git reset --mixed HEAD~1", desc: "Undo commit, unstage", example: "git reset --mixed HEAD~1" },
      { cmd: "git reset --hard HEAD~1", desc: "Undo commit, discard changes", example: "git reset --hard HEAD~1" },
      { cmd: "git revert <commit>", desc: "Revert a commit (safe)", example: "git revert abc123" },
    ],
  },
  {
    title: "Diff",
    items: [
      { cmd: "git diff", desc: "Show unstaged changes", example: "git diff" },
      { cmd: "git diff --staged", desc: "Show staged changes", example: "git diff --staged" },
      { cmd: "git diff <branch>", desc: "Compare with branch", example: "git diff main" },
      { cmd: "git diff <commit> <commit>", desc: "Compare commits", example: "git diff abc123 def456" },
    ],
  },
  {
    title: "Log",
    items: [
      { cmd: "git log", desc: "Show commit history", example: "git log" },
      { cmd: "git log --oneline", desc: "Compact log", example: "git log --oneline -10" },
      { cmd: "git log --graph", desc: "Show branch graph", example: "git log --oneline --graph --all" },
      { cmd: "git log -p", desc: "Show patches", example: "git log -p file.ts" },
      { cmd: "git blame <file>", desc: "Show who changed each line", example: "git blame src/index.ts" },
    ],
  },
  {
    title: "Config",
    items: [
      { cmd: "git config --global user.name", desc: "Set user name", example: "git config --global user.name 'Alice'" },
      { cmd: "git config --global user.email", desc: "Set user email", example: "git config --global user.email 'alice@example.com'" },
      { cmd: "git config --list", desc: "List all config", example: "git config --list" },
      { cmd: "git config --global alias.<name>", desc: "Create alias", example: "git config --global alias.co checkout" },
      { cmd: ".gitignore", desc: "Ignore files", example: "node_modules/\\n.env" },
    ],
  },
];

export default function GitCheatsheet() {
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => {
    if (!search) return sections;
    const q = search.toLowerCase();
    return sections
      .map((s) => ({
        ...s,
        items: s.items.filter((i) =>
          i.cmd.toLowerCase().includes(q) || i.desc.toLowerCase().includes(q) || i.example.toLowerCase().includes(q)
        ),
      }))
      .filter((s) => s.items.length > 0);
  }, [search]);

  const copy = (v: string) => { navigator.clipboard.writeText(v); toast.success("Copied " + v); };

  return (
    <div className="space-y-4">
      <div className="rounded-sm border border-border bg-surface px-3 py-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search git cheatsheet…"
          className="h-8 rounded-sm font-mono text-xs"
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((section) => (
          <div key={section.title} className="rounded-sm border border-border bg-surface">
            <div className="border-b border-border px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {section.title}
            </div>
            <div className="divide-y divide-border/50">
              {section.items.map((item) => (
                <div key={item.cmd} className="px-3 py-2">
                  <code
                    className="cursor-pointer rounded bg-background/60 px-1.5 py-0.5 font-mono text-xs text-primary hover:bg-background"
                    onClick={() => copy(item.cmd)}
                    title="Click to copy"
                  >
                    {item.cmd}
                  </code>
                  <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">{item.desc}</p>
                  <p className="font-mono text-[10px] text-muted-foreground/60">{item.example}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
