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
    </Box>
  );
}
