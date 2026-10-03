// A plain object so tests can spyOn it without mocking Clerk.
export const producerSession = {
  async getUserId(): Promise<string | null> {
    const { auth } = await import('@clerk/nextjs/server');
    return (await auth()).userId ?? null;
  },
};
