import { Wrap, Input, Center, Button, Spinner } from "@chakra-ui/react";
import { ChangeEvent, useEffect, useState } from "react";

export type UserInputProps = {
  isFetching: boolean;
  refetch: (input: string) => void;
};

export default function UserInput(props: UserInputProps) {
  const { isFetching, refetch } = props;
  const [inputText, setInputText] = useState<string>("");

  useEffect(() => {
    setInputText("");
  }, [isFetching]);

  return (
    <Center>
      <Wrap pt={50}>
        <Input
          placeholder="A high definition cyberpunk dragon"
          value={inputText}
          onChange={(e: ChangeEvent) => {
            const target = e.target as HTMLTextAreaElement;
            setInputText(target.value);
          }}
          w={350}
        ></Input>
        <Button onClick={() => refetch(inputText)} colorScheme={"yellow"}>
          {isFetching ? <Spinner /> : "Generate"}
        </Button>
      </Wrap>
    </Center>
  );
}
