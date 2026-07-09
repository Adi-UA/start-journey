import { Button, Center, Input, Spinner, Wrap } from "@chakra-ui/react";
import { ChangeEvent, KeyboardEvent, useState } from "react";

export type UserInputProps = {
  isFetching: boolean;
  onGenerate: (prompt: string) => void;
};

export default function UserInput({ isFetching, onGenerate }: UserInputProps) {
  const [inputText, setInputText] = useState("");

  const submit = () => {
    const prompt = inputText.trim();
    if (prompt) {
      onGenerate(prompt);
    }
  };

  return (
    <Center>
      <Wrap pt={50}>
        <Input
          placeholder="A high definition cyberpunk dragon"
          value={inputText}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setInputText(e.target.value)
          }
          onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") {
              submit();
            }
          }}
          isDisabled={isFetching}
          w={350}
        />
        <Button onClick={submit} colorScheme="yellow" isDisabled={isFetching}>
          {isFetching ? <Spinner /> : "Generate"}
        </Button>
      </Wrap>
    </Center>
  );
}
