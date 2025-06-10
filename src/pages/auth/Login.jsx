import { useState } from "react";
import {
  Box, Input, Button, Heading, Text, VStack, useToast, useBreakpointValue, Flex, IconButton, FormControl, InputGroup, InputRightElement
} from "@chakra-ui/react";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";
import { useNavigate } from "react-router-dom";
import { FaGoogle, FaEye, FaEyeSlash } from 'react-icons/fa';
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const toast = useToast();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const handleLogin = async () => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const userRef = doc(db, "users", result.user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) throw new Error("Data user tidak ditemukan.");

      const role = userSnap.data().role;
      if (role === "admin") navigate("/admin");
      else if (role === "guru") navigate("/guru");
      else if (role === "siswa") navigate("/siswa");
    } catch (err) {
      toast({ title: "Login gagal", description: err.message, status: "error" });
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      // Cek apakah user sudah punya dokumen Firestore
      const userRef = doc(db, "users", result.user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        toast({ title: "Akun belum terdaftar", description: "Silakan daftar terlebih dahulu.", status: "warning" });
        return;
      }

      const role = userSnap.data().role;
      if (role === "admin") navigate("/admin");
      else if (role === "guru") navigate("/guru");
      else if (role === "siswa") navigate("/siswa");
    } catch (err) {
      toast({ title: "Login gagal", description: err.message, status: "error" });
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
          Login
        </Heading>
        <VStack spacing={4}>
          <Input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            size="lg"
            focusBorderColor="teal.500"
            _hover={{ borderColor: 'teal.300' }}
          />
          <FormControl>
            <InputGroup>
              <InputRightElement>
                <IconButton
                  mt={2}
                  variant="text"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  icon={showPassword ? <FaEyeSlash /> : <FaEye />}
                  onClick={togglePasswordVisibility}
                />
              </InputRightElement>

              <Input
                placeholder="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                size="lg"
                focusBorderColor="teal.500"
                _hover={{ borderColor: 'teal.300' }}
              />
            </InputGroup>
          </FormControl>
          <Button
            colorScheme="teal"
            size="lg"
            width="100%"
            onClick={handleLogin}
            _hover={{ bg: 'teal.600' }}
            _active={{ bg: 'teal.700' }}
          >
            Login
          </Button>
          <Button
            variant="outline"
            colorScheme="teal"
            size="lg"
            leftIcon={<FaGoogle />}
            width="100%"
            onClick={handleGoogleLogin}
            _hover={{ bg: 'teal.100' }}
          >
            Login with Google
          </Button>
        </VStack>
        <Text mt={4} fontSize="sm" textAlign="center">
          Belum punya akun?{' '}
          <a href="/register/siswa" style={{ color: '#3182ce' }}>Daftar Siswa</a> |{' '}
          <a href="/register/guru" style={{ color: '#3182ce' }}>Daftar Guru</a> 
        </Text>
        <Text mt={2} fontSize="sm" textAlign="center">
          <a href="/forgot-password" style={{ color: '#3182ce' }}>Lupa Password?</a>
        </Text>
      </Box>
    </Flex>
  );
}