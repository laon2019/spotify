import { Box, Flex, Input, InputGroup, InputLeftElement, IconButton, Avatar, useColorModeValue } from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import React from 'react';

const Header = () => {
  // 테마에 따른 배경색 및 텍스트 색상
  const bgColor = useColorModeValue('gray.100', 'gray.900');
  const textColor = useColorModeValue('gray.800', 'white');

  return (
    <Box bg={bgColor} px={4} py={3} boxShadow="sm" position="sticky" top={0} zIndex={10}>
      <Flex alignItems="center" justifyContent="space-between" maxW="1200px" mx="auto">
        {/* 로고 */}
        <Box fontSize={{ base: 'lg', md: '2xl' }} fontWeight="bold" color={textColor}>
          MusicApp
        </Box>

        {/* 검색창 */}
        <InputGroup
          w={{ base: '50%', md: '40%' }} // 화면 크기에 따라 너비 조정
          maxW="600px"
          display={{ base: 'none', sm: 'block' }} // 모바일에서는 숨김
        >
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.500" />
          </InputLeftElement>
          <Input
            placeholder="노래, 아티스트, 앨범 검색"
            bg={useColorModeValue('white', 'gray.700')}
            border="none"
            borderRadius="full"
            _focus={{ boxShadow: 'outline' }}
          />
        </InputGroup>

        {/* 프로필 아이콘 */}
        <IconButton
          aria-label="사용자 프로필"
          icon={<Avatar size="sm" />}
          variant="ghost"
          _hover={{ bg: 'gray.700' }}
        />
      </Flex>

      {/* 모바일용 검색창 */}
      <InputGroup
        mt={2}
        display={{ base: 'block', sm: 'none' }} // 모바일에서만 보임
      >
        <InputLeftElement pointerEvents="none">
          <SearchIcon color="gray.500" />
        </InputLeftElement>
        <Input
          placeholder="노래, 아티스트, 앨범 검색"
          bg={useColorModeValue('white', 'gray.700')}
          border="none"
          borderRadius="full"
          _focus={{ boxShadow: 'outline' }}
        />
      </InputGroup>
    </Box>
  );
};

export default Header;