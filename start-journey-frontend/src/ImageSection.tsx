import defaultImg from "./start_journey.png";
import { Image, SkeletonCircle, Center } from "@chakra-ui/react";

export type ImageSectionProps = {
  isFetching: boolean;
  base64Img: string;
};

export default function ImageSection(props: ImageSectionProps) {
  const { isFetching, base64Img } = props;

  return (
    <Center>
      {isFetching && <SkeletonCircle m={20} size="100"></SkeletonCircle>}

      {base64Img === undefined && !isFetching && (
        <Image boxShadow="dark-lg" m={5} src={defaultImg} />
      )}
      {base64Img && !isFetching && (
        <Image
          boxShadow="dark-lg"
          pt={5}
          src={`data:image/png;base64, ${base64Img}`}
        ></Image>
      )}
    </Center>
  );
}
