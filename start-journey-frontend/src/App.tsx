import {
  ChakraProvider,
  Heading,
  Container,
  Input,
  Button,
  Wrap,
  Spinner,
  Center,
} from "@chakra-ui/react";

import { useQuery } from "@tanstack/react-query";
import { ChangeEvent, useEffect, useState } from "react";
import axios from "axios";
import ImageSection from "./ImageSection";
import UserInput from "./UserInput";

export default function App() {
  const [prompt, setPrompt] = useState("");
  const { isFetching, refetch, data } = useQuery({
    queryKey: ["imggen", prompt],
    queryFn: async () => {
      const response = await axios.get(
        `http://localhost:8000?prompt=${prompt}`
      );
      return response.data;
    },
    enabled: false,
    refetchOnWindowFocus: false,
  });

  const refetchHandler = (input: string) => {
    setPrompt(input);
    refetch();
  };

  return (
    <ChakraProvider>
      <Container>
        <Center>
          <Heading>Start Journey 🚢</Heading>
        </Center>
        <ImageSection isFetching={isFetching} base64Img={data}></ImageSection>
        <UserInput isFetching={isFetching} refetch={refetchHandler}></UserInput>
      </Container>
    </ChakraProvider>
  );
}
