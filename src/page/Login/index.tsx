import {
  Box,
  VStack,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  Button,
  Heading,
  Text,
  useToast,
  useBreakpointValue,
  Flex,
  Image,
  Link as ChakraLink,
} from '@chakra-ui/react';
import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';

interface LoginFormData {
  email: string;
  password: string;
}

const Login = () => {
  const bgColor = '#121212';
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>();
  const toast = useToast();
  const navigate = useNavigate();
  const buttonSize = useBreakpointValue({ base: 'md', md: 'lg' });

  const onSubmit = (data: LoginFormData) => {
    // Mock submission (replace with actual API call)
    console.log('로그인 시도:', data);
    toast({
      title: '로그인 성공!',
      description: '플랫폼에 오신 것을 환영합니다!',
      status: 'success',
      duration: 5000,
      isClosable: true,
      position: 'top',
    });
    navigate('/');
  };

  return (
    <Box bg={bgColor} minHeight="100vh" p={4} pb={40} position="relative" overflow="hidden">
      <Flex
        position="sticky"
        top={0}
        zIndex={3}
        bg={bgColor}
        p={2}
        mb={10}
        alignItems="center"
        justifyContent="space-between"
        boxShadow="sm"
      >
        <ChakraLink as={Link} to="/" onClick={() => navigate('/')}>
          <Image src="/logo.png" w="100px" />
        </ChakraLink>
        <Flex gap={4}>
          <ChakraLink
            as={Link}
            to="/login"
            color="#38b2ac"
            fontWeight="medium"
            _hover={{ textDecoration: 'underline', color: '#2c928d' }}
          >
            로그인
          </ChakraLink>
          <ChakraLink
            as={Link}
            to="/signup"
            color="#38b2ac"
            fontWeight="medium"
            _hover={{ textDecoration: 'underline', color: '#2c928d' }}
          >
            회원가입
          </ChakraLink>
        </Flex>
      </Flex>

      <VStack
        spacing={6}
        bg="gray.800"
        p={{ base: 6, md: 8 }}
        borderRadius="lg"
        boxShadow="lg"
        w={{ base: '100%', sm: '400px', md: '500px' }}
        color="white"
        mx="auto"
      >
        <Heading size="lg" color="#38b2ac">
          로그인
        </Heading>
        <Text color="gray.400">계정에 로그인하여 시작하세요!</Text>

        <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
          <VStack spacing={4}>
            {/* Email */}
            <FormControl isInvalid={!!errors.email}>
              <FormLabel htmlFor="email">이메일</FormLabel>
              <Input
                id="email"
                type="email"
                placeholder="이메일을 입력하세요"
                bg="gray.700"
                borderColor="gray.600"
                _hover={{ borderColor: '#38b2ac' }}
                _focus={{ borderColor: '#38b2ac', boxShadow: '0 0 0 1px #38b2ac' }}
                color="white"
                {...register('email', {
                  required: '이메일은 필수입니다',
                  pattern: {
                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                    message: '유효한 이메일 주소를 입력하세요',
                  },
                })}
              />
              <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
            </FormControl>

            {/* Password */}
            <FormControl isInvalid={!!errors.password}>
              <FormLabel htmlFor="password">비밀번호</FormLabel>
              <Input
                id="password"
                type="password"
                placeholder="비밀번호를 입력하세요"
                bg="gray.700"
                borderColor="gray.600"
                _hover={{ borderColor: '#38b2ac' }}
                _focus={{ borderColor: '#38b2ac', boxShadow: '0 0 0 1px #38b2ac' }}
                color="white"
                {...register('password', {
                  required: '비밀번호는 필수입니다',
                  minLength: {
                    value: 8,
                    message: '비밀번호는 최소 8자 이상이어야 합니다',
                  },
                })}
              />
              <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
            </FormControl>

            {/* Submit Button */}
            <Button
              type="submit"
              colorScheme="teal"
              bg="#38b2ac"
              size={buttonSize}
              w="100%"
              isLoading={isSubmitting}
              _hover={{ bg: '#2c928d' }}
            >
              로그인
            </Button>
          </VStack>
        </form>
      </VStack>
    </Box>
  );
};

export default Login;