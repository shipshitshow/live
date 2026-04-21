export async function parseJsonResponse<T>(res: Response): Promise<T> {
  const text = await res.text();

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(
      `Unexpected ${res.status} response from ${new URL(res.url).pathname}`,
    );
  }
}
