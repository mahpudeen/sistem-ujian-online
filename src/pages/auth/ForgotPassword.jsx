import { useState } from "react";
import {
  Box, Input, Button, Heading, VStack, useToast, useBreakpointValue, Flex, Text
} from "@chakra-ui/react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebase";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const toast = useToast();
  const navigate = useNavigate();

  const handleReset = async () => {
    try {
      if (!email) throw new Error("Email tidak boleh kosong");
      await sendPasswordResetEmail(auth, email);
      toast({
        title: "Email dikirim",
        description: "Silakan cek email untuk mengganti password.",
        status: "success",
      });
      navigate("/");
    } catch (err) {
      toast({
        title: "Gagal kirim reset password",
        description: err.message,
        status: "error",
      });
    }
  };
  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      minH="100vh"
      bg="gray.50"
      p={6}
    >
      <Box p={6} w="md" mx="auto" bg="white" boxShadow="lg" borderRadius="md">
        <Heading mb={6} fontSize={isMobile ? "2xl" : "3xl"} textAlign="center" color="teal.500">
          Lupa Password
        </Heading>
        <VStack spacing={4}>
          <Input
            placeholder="Masukkan email terdaftar"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            size="lg"
            focusBorderColor="teal.500"
            _hover={{ borderColor: 'teal.300' }}
          />
          <Button
            colorScheme="teal"
            size="md"
            width="100%"
            onClick={handleReset}
            _hover={{ bg: 'teal.600' }}
            _active={{ bg: 'teal.700' }}
          >
            Kirim Email Reset
          </Button>
          <Text>
            <a href="/" style={{ color: '#3182ce' }}>Kembali ke login</a>
          </Text>
        </VStack>
      </Box>
    </Flex>
  );
}
