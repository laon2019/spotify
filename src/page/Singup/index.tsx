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

interface SignupFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const Signup = () => {
  const bgColor = '#121212';
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<SignupFormData>();
  const toast = useToast();
  const buttonSize = useBreakpointValue({ base: 'md', md: 'lg' });
  const navigate = useNavigate();

  const onSubmit = (data: SignupFormData) => {
    // Mock submission (replace with actual API call)
    console.log('Form submitted:', data);
    toast({
      title: '회원가입 성공',
      description: '멜로팝!',
      status: 'success',
      duration: 5000,
      isClosable: true,
      position: 'top',
    });
    navigate("/login")
  };

  // Watch password for confirmPassword validation
  const password = watch('password');

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
          Sign Up
        </Heading>
        <Text color="gray.400">Create your account to get started!</Text>

        <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
          <VStack spacing={4}>
            {/* Username */}
            <FormControl isInvalid={!!errors.username}>
              <FormLabel htmlFor="username">아이디</FormLabel>
              <Input
                id="username"
                placeholder="Enter your username"
                bg="gray.700"
                borderColor="gray.600"
                _hover={{ borderColor: '#38b2ac' }}
                _focus={{ borderColor: '#38b2ac', boxShadow: '0 0 0 1px #38b2ac' }}
                color="white"
                {...register('username', {
                  required: 'Username is required',
                  minLength: {
                    value: 3,
                    message: 'Username must be at least 3 characters',
                  },
                  maxLength: {
                    value: 20,
                    message: 'Username cannot exceed 20 characters',
                  },
                })}
              />
              <FormErrorMessage>{errors.username?.message}</FormErrorMessage>
            </FormControl>

            {/* Email */}
            <FormControl isInvalid={!!errors.email}>
              <FormLabel htmlFor="email">이메일</FormLabel>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                bg="gray.700"
                borderColor="gray.600"
                _hover={{ borderColor: '#38b2ac' }}
                _focus={{ borderColor: '#38b2ac', boxShadow: '0 0 0 1px #38b2ac' }}
                color="white"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                    message: 'Invalid email address',
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
                placeholder="Enter your password"
                bg="gray.700"
                borderColor="gray.600"
                _hover={{ borderColor: '#38b2ac' }}
                _focus={{ borderColor: '#38b2ac', boxShadow: '0 0 0 1px #38b2ac' }}
                color="white"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters',
                  },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                    message:
                      'Password must include uppercase, lowercase, number, and special character',
                  },
                })}
              />
              <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
            </FormControl>

            {/* Confirm Password */}
            <FormControl isInvalid={!!errors.confirmPassword}>
              <FormLabel htmlFor="confirmPassword">비밀번호 확인</FormLabel>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                bg="gray.700"
                borderColor="gray.600"
                _hover={{ borderColor: '#38b2ac' }}
                _focus={{ borderColor: '#38b2ac', boxShadow: '0 0 0 1px #38b2ac' }}
                color="white"
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (value) =>
                    value === password || 'Passwords do not match',
                })}
              />
              <FormErrorMessage>{errors.confirmPassword?.message}</FormErrorMessage>
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
              회원가입
            </Button>
          </VStack>
        </form>
      </VStack>
    </Box>
  );
};

export default Signup;