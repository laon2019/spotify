import React from "react";
import {
  Box,
  Text,
  Center,
  useBreakpointValue,
  Image,
  Flex,
  keyframes,
} from "@chakra-ui/react";

interface NotFoundProps {
  content: string;
}

const NotFound = ({ content }: NotFoundProps) => {
  const isMobile = useBreakpointValue({ base: true, md: false });

  const rotateAnimation = keyframes`
    0% { transform: rotate(0deg); }
    33% { transform: rotate(360deg); }
    66% { transform: rotate(360deg); }
    100% { transform: rotate(0deg); }
  `;

  return (
    <Center h="calc(100vh - 120px)" bg="gray.50" p={4}>
      <Box
        textAlign="center"
        bg="white"
        borderRadius="lg"
        p={8}
        shadow="xl"
        maxW="lg"
        w="full"
      >
        <Flex justify="center" align="center" mb={6}>
          <Image
            src="/image/four.png"
            alt="404 Icon"
            boxSize={isMobile ? "100px" : "150px"}
            m={2}
          />
          <Image
            src="/image/logo/logo.svg"
            alt="NFI Map Logo"
            boxSize={isMobile ? "100px" : "150px"}
            m={2}
            animation={`${rotateAnimation} 3s ease-in-out infinite`}
          />
          <Image
            src="/image/four.png"
            alt="404 Icon"
            boxSize={isMobile ? "100px" : "150px"}
            m={2}
          />
        </Flex>

        <Text
          fontSize={isMobile ? "lg" : "2xl"}
          fontWeight="extrabold"
          mb={6}
          bgClip="text"
          color="black"
        >
          {content}
        </Text>
      </Box>
    </Center>
  );
};

export default NotFound;
