import { AspectRatio, Box, Image, Skeleton } from "@chakra-ui/react";
import defaultImg from "./assets/start_journey.png";

type Props = {
  isFetching: boolean;
  base64Img?: string;
};

export default function ImageSection({ isFetching, base64Img }: Props) {
  const src = base64Img ? `data:image/png;base64,${base64Img}` : defaultImg;
  const alt = base64Img ? "Generated image" : "Start Journey default image";

  return (
    <Box w="100%" borderRadius="xl" overflow="hidden" boxShadow="2xl">
      <AspectRatio ratio={1}>
        {isFetching ? (
          <Skeleton />
        ) : (
          <Image src={src} alt={alt} objectFit="cover" />
        )}
      </AspectRatio>
    </Box>
  );
}
