# Vault Input Shape

This skill is designed around the public `shipshitshow/vault` layout.

## Primary folders

- `shipshitshow/Videos/<date>/`
- `shipshitshow/Livestreams/<date>/`
- `shipshitshowclips/Shorts/<date>/<variant>/`

## Files to read

Per episode, prefer this order:

1. `overview.md`
2. `description.md`
3. `transcript.md`
4. `thumbnail.md` only when topic framing benefits from thumbnail context

## `overview.md` frontmatter fields used by this skill

- `title`
- `date`
- `type`
- `youtube_id`
- `youtube_url`
- `channel`
- `duration`
- `view_count`
- `status`
- `source`
- `youtube_tags`
- `aliases`

## Summary section

Most `overview.md` files also contain:

- `## Summary`
- `## Links`
- `## Related`
- `## Notes`

Use `## Summary` as the best short-form intent signal after the title.

## Vault rule that matters here

The vault explicitly uses `youtube_tags`, not `tags`, because Obsidian treats `tags` as a special field and breaks phrase tags.

## Remote fallback

If no local vault path exists:

- accept `https://github.com/shipshitshow/vault`
- accept `shipshitshow/vault`
- accept another GitHub repo with the same file layout

## Format separation

Do not mix these pools during ranking:

- Long-form: `shipshitshow/Videos`
- Shorts: `shipshitshowclips/Shorts`

