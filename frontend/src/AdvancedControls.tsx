import {
  Box,
  Flex,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Text,
} from "@chakra-ui/react";

type Props = {
  steps: number;
  guidance: number;
  onSteps: (value: number) => void;
  onGuidance: (value: number) => void;
  disabled?: boolean;
};

export default function AdvancedControls({
  steps,
  guidance,
  onSteps,
  onGuidance,
  disabled,
}: Props) {
  return (
    <Box w="100%" mt={4}>
      <Flex justify="space-between" mb={1}>
        <Text fontSize="sm" color="whiteAlpha.800">
          Steps
        </Text>
        <Text fontSize="sm" fontWeight="semibold">
          {steps}
        </Text>
      </Flex>
      <Slider
        aria-label="steps"
        min={5}
        max={50}
        step={1}
        value={steps}
        onChange={onSteps}
        isDisabled={disabled}
        colorScheme="pink"
      >
        <SliderTrack bg="whiteAlpha.300">
          <SliderFilledTrack />
        </SliderTrack>
        <SliderThumb />
      </Slider>
      <Text fontSize="xs" color="whiteAlpha.600" mt={1}>
        Denoising passes. More steps add detail but take longer; 20-30 is a
        good range.
      </Text>

      <Flex justify="space-between" mb={1} mt={3}>
        <Text fontSize="sm" color="whiteAlpha.800">
          Guidance
        </Text>
        <Text fontSize="sm" fontWeight="semibold">
          {guidance.toFixed(1)}
        </Text>
      </Flex>
      <Slider
        aria-label="guidance"
        min={1}
        max={20}
        step={0.5}
        value={guidance}
        onChange={onGuidance}
        isDisabled={disabled}
        colorScheme="pink"
      >
        <SliderTrack bg="whiteAlpha.300">
          <SliderFilledTrack />
        </SliderTrack>
        <SliderThumb />
      </Slider>
      <Text fontSize="xs" color="whiteAlpha.600" mt={1}>
        How closely the image follows your prompt. Higher is more literal;
        too high looks over-saturated. ~7-9 is balanced (Turbo models use 1).
      </Text>
    </Box>
  );
}
