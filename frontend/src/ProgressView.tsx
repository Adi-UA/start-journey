import { Box, Progress, Text } from "@chakra-ui/react";
import type { ProgressEvent } from "./api";

export default function ProgressView({
  progress,
}: {
  progress: ProgressEvent | null;
}) {
  const value = progress ? (progress.step / progress.total) * 100 : 0;
  const eta = progress?.eta_seconds;
  const label = progress
    ? `Step ${progress.step}/${progress.total}` +
      (eta != null ? ` · ~${Math.ceil(eta)}s remaining` : "")
    : "Starting…";

  return (
    <Box w="100%" mt={4}>
      <Progress
        value={value}
        size="sm"
        borderRadius="full"
        colorScheme="pink"
        bg="whiteAlpha.300"
        hasStripe
        isAnimated
      />
      <Text mt={2} fontSize="sm" color="whiteAlpha.800" textAlign="center">
        {label}
      </Text>
    </Box>
  );
}
