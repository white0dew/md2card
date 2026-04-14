export function splitSocialNoteTitle(page: string, pageIndex: number) {
  if (pageIndex !== 0) {
    return { body: page, title: null };
  }

  const match = page.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (!match) {
    return { body: page, title: null };
  }

  return {
    body: page.replace(match[0], "").replace(/^<br\s*\/?>/i, ""),
    title: match[1],
  };
}
