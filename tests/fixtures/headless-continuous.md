# Continuous rendering fixture

This fixture verifies that a long, continuous document is measured and split by the existing React DOM paginator.

Paragraph 01: the rendered output must retain this marker after pagination without inventing a text-only page.

Paragraph 02: each paragraph is intentionally short enough to flow continuously through the page measurement code.

Paragraph 03: browser layout, font metrics, card header height, and image export all participate in the final PNG result.

Paragraph 04: this line should remain readable in the second or later card when the fixture spans multiple pages.

Paragraph 05: page boundaries must be real DOM layout boundaries rather than newline counting or a string split heuristic.

Paragraph 06: the social card has a visible header on the first page, which is part of the measured layout.

Paragraph 07: the fixture repeats ordinary prose so the paginator has a stable continuous text block to split.

Paragraph 08: preserving this marker confirms that a later portion of the markdown reached an exported page.

Paragraph 09: high-quality raster output comes from the existing html-to-image DOM exporter.

Paragraph 10: a manifest records actual PNG dimensions and byte lengths after each image is written.

Paragraph 11: the headless renderer never uses the workbench editor, persisted stores, or local-image URLs.

Paragraph 12: the final paragraph keeps the source long enough to require more than one card at the default 3:4 canvas.
