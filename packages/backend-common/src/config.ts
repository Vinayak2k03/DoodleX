// Check if JWT_SECRET is set in environment variables
if (!process.env.JWT_SECRET) {
  console.warn('WARNING: JWT_SECRET environment variable is not set, using fallback value.');
  console.warn('This is a security risk in production environments.');
}

// Export the JWT_SECRET
export const JWT_SECRET = process.env.JWT_SECRET || "OEMjrCoLQ6PaQfqS7VlM+exyhh4dCdsS9F9PiDz6MEI=";
