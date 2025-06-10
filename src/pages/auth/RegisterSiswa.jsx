import { useState } from "react";
import {
  Box, Input, Button, Heading, VStack, useToast, Select, useBreakpointValue, Flex, IconButton, FormControl, InputGroup, InputRightElement
} from "@chakra-ui/react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function RegisterSiswa() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nama, setNama] = useState("");
  const [kelas, setKelas] = useState("7A");
  const toast = useToast();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const handleRegister = async () => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);

      await setDoc(doc(db, "users", result.user.uid), {
        email,
        nama,
        kelas,
        role: "siswa",
        status: "pending"
      });

      toast({ title: "Registrasi berhasil", description: "Silakan login.", status: "success" });
      navigate("/");
    } catch (err) {
      toast({ title: "Registrasi gagal", description: err.message, status: "error" });
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
          Register Siswa
        </Heading>
        <VStack spacing={4}>
          <Input
            placeholder="Nama Lengkap"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            size="lg"
            focusBorderColor="teal.500"
            _hover={{ borderColor: 'teal.300' }}
          />
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
          <Select
            placeholder="Pilih Kelas"
            value={kelas}
            onChange={(e) => setKelas(e.target.value)}
            size="lg"
            focusBorderColor="teal.500"
            _hover={{ borderColor: 'teal.300' }}
          >
            <option value="7A">7A</option>
            <option value="7B">7B</option>
            <option value="8A">8A</option>
            <option value="9A">9A</option>
          </Select>
          <Button
            colorScheme="teal"
            size="md"
            width="100%"
            onClick={handleRegister}
            _hover={{ bg: 'teal.600' }}
            _active={{ bg: 'teal.700' }}
          >
            Daftar
          </Button>
          <Button
            colorScheme="gray"
            size="md"
            width="100%"
            onClick={() => { navigate("/") }}
            _hover={{ bg: 'gray.400' }}
            _active={{ bg: 'gray.700' }}
          >
            Kembali
          </Button>
        </VStack>
      </Box>
    </Flex>
  );
}
