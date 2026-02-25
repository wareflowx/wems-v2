import { ORPCError, onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/message-port";
import { router } from "./router";

// Best Practice: Add error interceptors for logging and error handling
export const rpcHandler = new RPCHandler(router, {
  interceptors: [
    // Global error handler - logs all errors and formats them for client
    onError((error, { path, input }) => {
      // Log full error for debugging
      console.error(`[ORPC Error] ${path}:`, {
        message: error.message,
        stack: error.stack,
        code: error.code,
      });

      // Don't expose internal errors to client
      if (error instanceof ORPCError) {
        return error; // Already formatted
      }

      // Return a generic error for unknown errors
      return new ORPCError("INTERNAL_ERROR", {
        message: "An unexpected error occurred",
      });
    }),
  ],
});
