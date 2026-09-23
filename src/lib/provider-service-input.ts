export function providerServiceInput(body: Record<string, unknown>) {
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const description = typeof body.description === "string" ? body.description.trim() : "";
  const priceFrom = Number(body.priceFrom);
  return title.length >= 2 && title.length <= 100 && description.length <= 1000 && Number.isFinite(priceFrom) && priceFrom >= 0 && priceFrom <= 1_000_000_000
    ? { title, description, price_from: priceFrom } : null;
}
