import {
  Badge,
  Box,
  Button,
  Center,
  Collapse,
  Container,
  Flex,
  Heading,
  HStack,
  Link,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { generateImageStream, ProgressEvent, ResultEvent } from "./api";
import AdvancedControls from "./AdvancedControls";
import { REPO_URL } from "./constants";
import { downloadImage, promptToFilename } from "./download";
import ImageSection from "./ImageSection";
import ProgressView from "./ProgressView";
import UserInput from "./UserInput";

export default function App() {
  const toast = useToast();
  const advanced = useDisclosure();
  const [steps, setSteps] = useState(25);
  const [guidance, setGuidance] = useState(8.5);
  const [progress, setProgress] = useState<ProgressEvent | null>(null);
  const [lastPrompt, setLastPrompt] = useState("");

  const { mutate, data, isPending } = useMutation<ResultEvent, Error, string>({
    mutationFn: (prompt) =>
      generateImageStream({ prompt, steps, guidanceScale: guidance }, (p) =>
        setProgress(p),
      ),
    onError: () =>
      toast({
        title: "Generation failed",
        description: "The server could not generate an image. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      }),
  });

  const handleGenerate = (prompt: string) => {
    setLastPrompt(prompt);
    setProgress(null);
    mutate(prompt);
  };

  return (
    <Container maxW="container.sm" py={{ base: 8, md: 16 }}>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg" letterSpacing="tight">
          Start Journey 🚢
        </Heading>
        <Link
          href={REPO_URL}
          isExternal
          fontSize="sm"
          color="whiteAlpha.800"
          _hover={{ color: "white" }}
        >
          GitHub ↗
        </Link>
      </Flex>

      <Box
        bg="rgba(10, 10, 20, 0.55)"
        backdropFilter="blur(14px)"
        border="1px solid"
        borderColor="whiteAlpha.200"
        borderRadius="2xl"
        p={{ base: 4, md: 6 }}
        boxShadow="2xl"
      >
        <ImageSection isFetching={isPending} base64Img={data?.image} />

        {isPending && <ProgressView progress={progress} />}

        {!isPending && data && (
          <Flex justify="space-between" align="center" mt={4} wrap="wrap" gap={2}>
            <HStack spacing={2}>
              <Badge colorScheme="pink" variant="subtle">
                {data.device}
              </Badge>
              <Badge colorScheme="purple" variant="subtle">
                {data.steps} steps
              </Badge>
              <Badge variant="subtle">{data.elapsed_seconds}s</Badge>
            </HStack>
            <Button
              size="sm"
              variant="outline"
              colorScheme="pink"
              onClick={() =>
                downloadImage(data.image, promptToFilename(lastPrompt))
              }
            >
              Download
            </Button>
          </Flex>
        )}

        {!isPending && data && lastPrompt && (
          <Text
            mt={2}
            fontSize="sm"
            color="whiteAlpha.700"
            fontStyle="italic"
            noOfLines={2}
          >
            “{lastPrompt}”
          </Text>
        )}

        <UserInput isFetching={isPending} onGenerate={handleGenerate} />

        <Button
          variant="link"
          size="sm"
          color="whiteAlpha.700"
          mt={4}
          onClick={advanced.onToggle}
        >
          {advanced.isOpen ? "Hide advanced" : "Advanced"}
        </Button>
        <Collapse in={advanced.isOpen} animateOpacity>
          <AdvancedControls
            steps={steps}
            guidance={guidance}
            onSteps={setSteps}
            onGuidance={setGuidance}
            disabled={isPending}
          />
        </Collapse>
      </Box>

      <Center mt={6}>
        <Text fontSize="xs" color="whiteAlpha.600">
          Built with FastAPI, Diffusers & React ·{" "}
          <Link href={REPO_URL} isExternal textDecoration="underline">
            source
          </Link>
        </Text>
      </Center>
    </Container>
  );
}
