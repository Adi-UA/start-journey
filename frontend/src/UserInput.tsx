import {
  Button,
  Flex,
  Input,
  Spinner,
  Tag,
  TagLabel,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { ChangeEvent, KeyboardEvent, useState } from "react";
import { EXAMPLE_PROMPTS } from "./constants";

type Props = {
  isFetching: boolean;
  onGenerate: (prompt: string) => void;
};

export default function UserInput({ isFetching, onGenerate }: Props) {
  const [inputText, setInputText] = useState("");

  const submit = () => {
    const prompt = inputText.trim();
    if (prompt) {
      onGenerate(prompt);
    }
  };

  return (
    <>
      <Flex w="100%" gap={3} mt={2}>
        <Input
          placeholder="Describe an image…"
          value={inputText}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setInputText(e.target.value)
          }
          onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") submit();
          }}
          isDisabled={isFetching}
          bg="whiteAlpha.200"
          borderColor="whiteAlpha.300"
          _placeholder={{ color: "whiteAlpha.600" }}
          size="lg"
        />
        <Button
          onClick={submit}
          colorScheme="pink"
          size="lg"
          px={8}
          minW="140px"
          isDisabled={isFetching}
        >
          {isFetching ? <Spinner size="sm" /> : "Generate"}
        </Button>
      </Flex>

      <Wrap mt={3} spacing={2}>
        {EXAMPLE_PROMPTS.map((example) => (
          <WrapItem key={example}>
            <Tag
              size="md"
              variant="subtle"
              colorScheme="purple"
              borderRadius="full"
              cursor="pointer"
              _hover={{ bg: "whiteAlpha.300" }}
              onClick={() => {
                if (!isFetching) setInputText(example);
              }}
            >
              <TagLabel>{example}</TagLabel>
            </Tag>
          </WrapItem>
        ))}
      </Wrap>
    </>
  );
}
