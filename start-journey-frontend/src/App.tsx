import { ChakraProvider, Heading, Container, Center } from "@chakra-ui/react";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import axios from "axios";
import ImageSection from "./ImageSection";
import UserInput from "./UserInput";
import theme from "./theme";

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
    <ChakraProvider theme={theme}>
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
