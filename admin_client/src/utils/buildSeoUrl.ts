import { slugify } from "@utils/slugify";

type BuildSeoParams = {
  keyword?: string;
  jobTitles?: string[];
  provinceName?: string;
};

export function buildSeoUrlMulti({
  keyword,
  jobTitles,
  provinceName,
}: BuildSeoParams) {
  const parts: string[] = ["/viec-lam"];

  const jobSlugs = (jobTitles ?? [])
    .map((t) => slugify(t))
    .filter((s) => s && s.length > 0);

  if (jobSlugs.length) {
    parts.push("nganh", ...jobSlugs);
  }

  if (provinceName && provinceName.trim()) {
    parts.push(slugify(provinceName));
  }

  const path = parts.join("/").replace(/\/+/g, "/");

  const qs = new URLSearchParams();
  const kw = keyword?.trim();
  if (kw) qs.set("kw", kw);

  const qsStr = qs.toString();
  return qsStr ? `${path}?${qsStr}` : path;
}

export const buildSeoUrl = (
  keyword?: string,
  jobTitle?: string,
  provinceName?: string
) =>
  buildSeoUrlMulti({
    keyword,
    jobTitles: jobTitle ? [jobTitle] : [],
    provinceName,
  });
