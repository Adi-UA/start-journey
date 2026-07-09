import { Center, Image, SkeletonCircle } from "@chakra-ui/react";
import defaultImg from "./assets/start_journey.png";

export type ImageSectionProps = {
  isFetching: boolean;
  base64Img?: string;
};

export default function ImageSection({
  isFetching,
  base64Img,
}: ImageSectionProps) {
  if (isFetching) {
    return (
      <Center>
        <SkeletonCircle m={20} size="100" />
      </Center>
    );
  }

  const src = base64Img ? `data:image/png;base64,${base64Img}` : defaultImg;
  const alt = base64Img ? "Generated image" : "Start Journey default image";

  return (
    <Center>
      <Image boxShadow="dark-lg" m={5} src={src} alt={alt} />
    </Center>
  );
}
