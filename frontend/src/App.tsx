import { Center, Container, Heading, useToast } from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { generateImage } from "./api";
import ImageSection from "./ImageSection";
import UserInput from "./UserInput";

export default function App() {
  const toast = useToast();
  const { mutate, data, isPending, isError } = useMutation({
    mutationFn: generateImage,
  });

  useEffect(() => {
    if (isError) {
      toast({
        title: "Generation failed",
        description: "The server could not generate an image. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  }, [isError, toast]);

  return (
    <Container>
      <Center>
        <Heading py={6}>Start Journey 🚢</Heading>
      </Center>
      <ImageSection isFetching={isPending} base64Img={data?.image} />
      <UserInput isFetching={isPending} onGenerate={(prompt) => mutate(prompt)} />
    </Container>
  );
}
